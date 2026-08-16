import { ArrowRight, BrainCircuit, CheckCircle2, Chrome, Mail, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isFirebaseConfigured } from "../lib/firebase";

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { user, login, register, loginWithGoogle, resetPassword } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (user) return <Navigate to={location.state?.from || "/dashboard"} replace />;

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  async function submit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    try {
      if (mode === "register") {
        await register(form);
        setMessage("Account created. Check your inbox and verify your email before signing in.");
        setMode("login");
      } else if (mode === "reset") {
        await resetPassword(form.email);
        setMessage("Password reset instructions were sent to your email.");
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
          <div><span className="eyebrow">Welcome to PrepTrack</span><h2>{mode === "register" ? "Create your account" : mode === "reset" ? "Reset your password" : "Sign in to continue"}</h2></div>
          {!isFirebaseConfigured && <div className="auth-alert error">Firebase is not configured. Create a <code>.env</code> file using <code>.env.example</code>.</div>}
          {message && <div className="auth-alert success">{message}</div>}
          {error && <div className="auth-alert error">{error}</div>}

          {mode === "register" && <label>Full name<input name="name" value={form.name} onChange={update} required autoComplete="name" placeholder="Trisha Ingle" /></label>}
          <label>Email address<div className="input-with-icon"><Mail size={18} /><input name="email" type="email" value={form.email} onChange={update} required autoComplete="email" placeholder="you@example.com" /></div></label>
          {mode !== "reset" && <label>Password<input name="password" type="password" value={form.password} onChange={update} required autoComplete={mode === "register" ? "new-password" : "current-password"} placeholder={mode === "register" ? "8+ characters, upper/lower, number, symbol" : "Enter your password"} /></label>}

          <button className="auth-submit" disabled={busy || !isFirebaseConfigured}>{busy ? "Please wait…" : mode === "register" ? "Create verified account" : mode === "reset" ? "Send reset link" : "Sign in"}<ArrowRight size={18} /></button>

          {mode !== "reset" && <><div className="auth-divider"><span>or</span></div><button className="google-signin" type="button" onClick={googleSignIn} disabled={busy || !isFirebaseConfigured}><Chrome size={18} />Continue with Google</button></>}

          <div className="auth-links">
            {mode === "login" && <><button type="button" onClick={() => setMode("reset")}>Forgot password?</button><span>New here? <button type="button" onClick={() => setMode("register")}>Create account</button></span></>}
            {mode !== "login" && <button type="button" onClick={() => setMode("login")}>Back to sign in</button>}
          </div>
        </form>
      </section>
    </main>
  );
}
