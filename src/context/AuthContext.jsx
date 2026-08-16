import {
  GoogleAuthProvider,
  EmailAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  reauthenticateWithCredential,
  updatePassword,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db, isFirebaseConfigured } from "../lib/firebase";
import { checkLogin, recordFailedLogin, recordPasswordUpdate, registerSession, revokeSession } from "../services/securityService";

const AuthContext = createContext(null);
const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

async function ensureStudentProfile(user, displayName = "") {
  if (!db) return { role: "student", permissions: [] };
  const userRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    const profile = {
      displayName: displayName || user.displayName || "Student",
      email: user.email,
      role: "student",
      status: "active",
      passwordChangedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(userRef, profile);
    return profile;
  }

  return snapshot.data();
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [sessionId, setSessionId] = useState(() => localStorage.getItem("preptrackSessionId"));
  const [passwordUpdateRequired, setPasswordUpdateRequired] = useState(false);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return undefined;
    }

    return onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      try {
        setProfile(currentUser ? await ensureStudentProfile(currentUser) : null);
      } catch (error) {
        console.error("Unable to load user profile", error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  useEffect(() => {
    if (!db || !user || !sessionId) return undefined;
    return onSnapshot(doc(db, "users", user.uid, "activeSessions", sessionId), (snapshot) => {
      if (snapshot.exists() && snapshot.data().status !== "active") {
        localStorage.removeItem("preptrackSessionId");
        setSessionId(null);
        signOut(auth);
      }
    });
  }, [user, sessionId]);

  async function establishSession() {
    const security = await registerSession();
    localStorage.setItem("preptrackSessionId", security.sessionId);
    setSessionId(security.sessionId);
    setPasswordUpdateRequired(Boolean(security.passwordUpdateRequired));
  }

  async function register({ name, email, password }) {
    if (!auth) throw new Error("Firebase is not configured.");
    if (!strongPassword.test(password)) {
      throw new Error("Use 8+ characters with uppercase, lowercase, number, and special character.");
    }
    const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    await updateProfile(credential.user, { displayName: name.trim() });
    await ensureStudentProfile(credential.user, name.trim());
    await sendEmailVerification(credential.user);
    await signOut(auth);
  }

  async function login({ email, password }) {
    if (!auth) throw new Error("Firebase is not configured.");
    await checkLogin(email.trim());
    localStorage.removeItem("preptrackSessionId"); setSessionId(null);
    let credential;
    try { credential = await signInWithEmailAndPassword(auth, email.trim(), password); }
    catch (error) { if (["auth/invalid-credential", "auth/wrong-password", "auth/user-not-found"].includes(error.code)) await recordFailedLogin(email.trim()).catch(() => {}); throw error; }
    if (!credential.user.emailVerified) {
      await sendEmailVerification(credential.user);
      await signOut(auth);
      throw new Error("Verify your email before signing in. A new verification email was sent.");
    }
    try { await establishSession(); } catch (error) { await signOut(auth); throw error; }
  }

  async function loginWithGoogle() {
    if (!auth) throw new Error("Firebase is not configured.");
    localStorage.removeItem("preptrackSessionId"); setSessionId(null);
    const credential = await signInWithPopup(auth, new GoogleAuthProvider());
    await ensureStudentProfile(credential.user);
    try { await establishSession(); } catch (error) { await signOut(auth); throw error; }
  }

  async function resetPassword(email) {
    if (!auth) throw new Error("Firebase is not configured.");
    await sendPasswordResetEmail(auth, email.trim());
  }

  async function changePassword(currentPassword, nextPassword) {
    if (!user?.email || !strongPassword.test(nextPassword)) throw new Error("Use 8+ characters with uppercase, lowercase, number, and special character.");
    await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, currentPassword));
    await updatePassword(user, nextPassword);
    await recordPasswordUpdate();
    setPasswordUpdateRequired(false);
  }

  async function logout() {
    if (sessionId) await revokeSession(sessionId).catch(() => {});
    localStorage.removeItem("preptrackSessionId"); setSessionId(null);
    if (auth) await signOut(auth);
  }

  const value = {
    user,
    profile,
    role: profile?.role ?? "student",
    loading,
    register,
    login,
    loginWithGoogle,
    resetPassword,
    changePassword,
    passwordUpdateRequired,
    sessionId,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
