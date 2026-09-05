import { CheckCircle2, Eye, EyeOff, KeyRound, LoaderCircle, ShieldCheck } from "lucide-react";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import { auth, isFirebaseConfigured } from "../lib/firebase";

const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get("oobCode") || "";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("checking");
  const [error, setError] = useState("");

  const passwordChecks = useMemo(() => ({
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  }), [password]);
  const strength = Object.values(passwordChecks).filter(Boolean).length;

  useEffect(() => {
    document.title = "Create new password | PrepTrack AI";
    if (!auth || !isFirebaseConfigured || !code) {
      setStatus("invalid");
      return;
    }
    let active = true;
    verifyPasswordResetCode(auth, code)
      .then((address) => { if (active) { setEmail(address); setStatus("ready"); } })
      .catch(() => { if (active) setStatus("invalid"); });
    return () => { active = false; };
  }, [code]);

  async function submit(event) {
    event.preventDefault();
    setError("");
    if (!strongPassword.test(password)) {
      setError("Use at least 8 characters with uppercase, lowercase, a number, and a symbol.");
      return;
    }
    if (password !== confirmation) {
      setError("The passwords do not match.");
      return;
    }
    setStatus("saving");
    try {
      await confirmPasswordReset(auth, code, password);
      setStatus("success");
    } catch {
      setStatus("invalid");
    }
  }

  return (
    <main className="auth-page reset-password-page">
      <ThemeToggle className="auth-theme-toggle" />
      <section className="auth-intro">
        <div className="auth-brand"><span>PT</span><strong>PrepTrack AI</strong></div>
        <div>
          <span className="eyebrow light">Secure account recovery</span>
          <h1>Return to your preparation securely.</h1>
          <p>Create a strong new password through a protected, single-use Firebase recovery link.</p>
          <ul>
            <li><ShieldCheck /> Link validated before any password is accepted</li>
            <li><KeyRound /> Strong-password requirements enforced</li>
            <li><CheckCircle2 /> Clear confirmation before returning to sign in</li>
          </ul>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-card reset-password-card">
          {status === "checking" && <div className="reset-state"><LoaderCircle className="spin" /><h2>Checking your reset link</h2><p>Please wait while PrepTrack verifies that this link is valid.</p></div>}

          {status === "invalid" && <div className="reset-state"><div className="reset-state-icon error"><KeyRound /></div><span className="eyebrow">Link unavailable</span><h2>Request a new reset link</h2><p>This link is invalid, expired, or has already been used. Password-reset links are single-use for your protection.</p><Link className="auth-submit reset-link" to="/login?forgot=true">Return to password recovery</Link></div>}

          {status === "success" && <div className="reset-state"><div className="reset-state-icon success"><CheckCircle2 /></div><span className="eyebrow">Password updated</span><h2>Your new password is ready</h2><p>You can now sign in securely with your updated password.</p><Link className="auth-submit reset-link" to="/login">Continue to sign in</Link></div>}

          {(status === "ready" || status === "saving") && <form className="reset-form" onSubmit={submit}>
            <div className="reset-form-heading"><span className="reset-heading-icon"><ShieldCheck /></span><div><span className="eyebrow">Verified recovery link</span><h2>Create a new password</h2><p className="reset-account">Securing <strong>{email}</strong></p></div></div>
            <div className="reset-steps" aria-label="Password recovery progress"><span className="complete"><CheckCircle2 />Identity verified</span><i /><span className="current"><KeyRound />New password</span></div>
            {error && <div className="auth-alert error" role="alert">{error}</div>}
            <label>New password<div className="password-field"><input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" required autoFocus /><button type="button" onClick={() => setShowPassword((shown) => !shown)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff /> : <Eye />}</button></div></label>
            <div className="password-strength"><div><span>Password strength</span><strong>{strength < 2 ? "Weak" : strength < 4 ? "Good" : "Strong"}</strong></div><div aria-hidden="true">{[1, 2, 3, 4, 5].map((level) => <i className={strength >= level ? "active" : ""} key={level} />)}</div></div>
            <label>Confirm new password<input type={showPassword ? "text" : "password"} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="new-password" required /></label>
            <div className="password-requirements" aria-label="Password requirements">
              {Object.entries({ length: "8+ characters", upper: "Uppercase", lower: "Lowercase", number: "Number", symbol: "Symbol" }).map(([key, label]) => <span className={passwordChecks[key] ? "met" : ""} key={key}><CheckCircle2 />{label}</span>)}
            </div>
            <button className="auth-submit" disabled={status === "saving"}>{status === "saving" ? <><LoaderCircle className="spin" />Updating securely…</> : <><KeyRound />Update password</>}</button>
            <p className="reset-trust"><ShieldCheck />Encrypted account recovery powered by Firebase Authentication</p>
          </form>}
        </div>
      </section>
    </main>
  );
}
