import { ArrowLeft, ArrowRight, BrainCircuit, CheckCircle2, KeyRound, Mail, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isFirebaseConfigured } from "../lib/firebase";
import ThemeToggle from "../components/ThemeToggle";
import { apiRequest } from "../services/apiClient";

function GoogleLogo() {
  return (
    <svg className="google-logo" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.41Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.98-.9 6.63-2.36l-3.24-2.54c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.39 13.93A6.02 6.02 0 0 1 6.07 12c0-.67.12-1.32.32-1.93V7.45H3.04A10 10 0 0 0 2 12c0 1.61.38 3.14 1.04 4.55l3.35-2.62Z" />
      <path fill="#EA4335" d="M12 5.94c1.47 0 2.79.51 3.83 1.5l2.87-2.88A9.65 9.65 0 0 0 12 2a10 10 0 0 0-8.96 5.45l3.35 2.62C7.18 7.7 9.39 5.94 12 5.94Z" />
    </svg>
  );
}

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [publicSettings, setPublicSettings] = useState({ registrationsEnabled: true, maintenanceMessage: "" });
  const { user, authenticating, login, register, loginWithGoogle, resetPassword } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Sign in | PrepTrack AI";
    const query = new URLSearchParams(location.search);
    if (query.get("mode") === "resetPassword" && query.get("oobCode")) {
      navigate(`/auth/action?${query.toString()}`, { replace: true });
      return;
    }
    if (query.get("forgot") === "true") setMode("reset");
    apiRequest("getPublicPlatformSettings", {}, { authenticated: false, timeout: 10_000 })
      .then((settings) => {
        const message = String(settings?.maintenanceMessage || "").trim();
        setPublicSettings((current) => ({
          ...current,
          ...settings,
          maintenanceMessage: message.toLowerCase() === "preptrack ai platform is operating normally." ? "" : message,
        }));
      })
      .catch(() => {});
  }, [location.search, navigate]);

  if (user && !authenticating) return <Navigate to={location.state?.from || "/dashboard"} replace />;

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  async function submit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    try {
      if (mode === "register") {
        if (!publicSettings.registrationsEnabled) throw new Error("New student registrations are temporarily closed.");
        await register(form);
        setMessage("Account created. Check your inbox and verify your email before signing in.");
        setMode("login");
      } else if (mode === "reset") {
        await resetPassword(form.email);
        setMessage("Password reset instructions were sent. Check Primary, Promotions, and Spam if they do not appear within a minute.");
      } else {
        await login(form);
        navigate(location.state?.from || "/dashboard", { replace: true });
      }
    } catch (caught) {
      setError(caught.message?.replace(/^Firebase: /, "") || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function googleSignIn() {
    setError("");
    setBusy(true);
    try {
      await loginWithGoogle();
      navigate("/dashboard", { replace: true });
    } catch (caught) {
      setError(caught.message?.replace(/^Firebase: /, "") || "Google sign-in failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <ThemeToggle className="auth-theme-toggle" />
      <section className="auth-intro">
        <div className="auth-brand"><span>PT</span><strong>PrepTrack AI</strong></div>
        <div>
          <span className="eyebrow light">Your AI career lab</span>
          <h1>Prepare for the interview that changes everything.</h1>
          <p>One secure workspace for adaptive interviews, company simulations, readiness insights, and competitive challenges.</p>
          <ul>
            <li><BrainCircuit /> Adaptive interview coaching</li>
            <li><CheckCircle2 /> Evidence-based readiness reports</li>
            <li><ShieldCheck /> Verified and protected accounts</li>
          </ul>
        </div>
      </section>

      <section className="auth-panel">
        <form className="auth-card" onSubmit={submit}>
          {mode === "reset" ? <div className="recovery-heading"><span className="reset-heading-icon"><KeyRound /></span><div><span className="eyebrow">Secure account recovery</span><h2>Forgot your password?</h2><p>Enter your registered email and we’ll send a protected, single-use recovery link.</p></div></div> : <div><span className="eyebrow">Welcome to PrepTrack</span><h2>{mode === "register" ? "Create your account" : "Sign in to continue"}</h2></div>}
          {!isFirebaseConfigured && <div className="auth-alert error">Firebase is not configured. Create a <code>.env</code> file using <code>.env.example</code>.</div>}
          {publicSettings.maintenanceMessage && <div className="auth-alert notice">{publicSettings.maintenanceMessage}</div>}
          {message && <div className="auth-alert success">{message}</div>}
          {error && <div className="auth-alert error">{error}</div>}

          {mode === "register" && <label>Full name<input name="name" value={form.name} onChange={update} required autoComplete="name" placeholder="Trisha Ingle" /></label>}
          <label>Email address<div className="input-with-icon"><Mail size={18} /><input name="email" type="email" value={form.email} onChange={update} required autoComplete="email" placeholder="you@example.com" /></div></label>
          {mode === "reset" && <div className="recovery-assurance"><span><ShieldCheck />Secure Firebase verification</span><span><CheckCircle2 />Single-use link</span><span><KeyRound />Strong password protection</span></div>}
          {mode !== "reset" && <label>Password<input name="password" type="password" value={form.password} onChange={update} required autoComplete={mode === "register" ? "new-password" : "current-password"} placeholder={mode === "register" ? "8+ characters, upper/lower, number, symbol" : "Enter your password"} /></label>}

          <button className="auth-submit" disabled={busy || !isFirebaseConfigured}>{busy ? "Please wait…" : mode === "register" ? "Create verified account" : mode === "reset" ? "Send reset link" : "Sign in"}<ArrowRight size={18} /></button>

          {mode !== "reset" && <><div className="auth-divider"><span>or continue with</span></div><button className="google-signin" type="button" onClick={googleSignIn} disabled={busy || !isFirebaseConfigured}><GoogleLogo /><span>Continue with Google</span></button></>}

          <div className="auth-links">
            {mode === "login" && <><button type="button" onClick={() => setMode("reset")}>Forgot password?</button>{publicSettings.registrationsEnabled ? <span>New here? <button type="button" onClick={() => setMode("register")}>Create account</button></span> : <span>Registrations closed</span>}</>}
            {mode !== "login" && <button className="back-to-signin" type="button" onClick={() => setMode("login")}><ArrowLeft />Back to sign in</button>}
          </div>
        </form>
      </section>
    </main>
  );
}
