import { applyActionCode, checkActionCode } from "firebase/auth";
import { CheckCircle2, LoaderCircle, MailCheck, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import { auth } from "../lib/firebase";
import ResetPasswordPage from "./ResetPasswordPage";

export default function EmailActionPage() {
  const [params] = useSearchParams();
  const mode = params.get("mode");
  const code = params.get("oobCode") || "";
  const [status, setStatus] = useState("checking");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (mode === "resetPassword") return undefined;
    document.title = "Secure account action | PrepTrack AI";
    if (!auth || !code || !["verifyEmail", "recoverEmail", "verifyAndChangeEmail"].includes(mode)) {
      setStatus("invalid");
      return undefined;
    }
    let active = true;
    checkActionCode(auth, code)
      .then(() => applyActionCode(auth, code))
      .then(() => {
        if (!active) return;
        setMessage(mode === "recoverEmail" ? "Your previous email address has been restored." : mode === "verifyAndChangeEmail" ? "Your new email address has been verified." : "Your email address has been verified.");
        setStatus("success");
      })
      .catch(() => { if (active) setStatus("invalid"); });
    return () => { active = false; };
  }, [code, mode]);

  if (mode === "resetPassword") return <ResetPasswordPage />;

  return <main className="auth-page reset-password-page"><ThemeToggle className="auth-theme-toggle" /><section className="auth-intro"><div className="auth-brand"><span>PT</span><strong>PrepTrack AI</strong></div><div><span className="eyebrow light">Protected account action</span><h1>Your account security comes first.</h1><p>PrepTrack validates every authentication link before applying changes to your account.</p><ul><li><MailCheck />Verified email ownership</li><li><CheckCircle2 />Single-use security code</li><li><ShieldAlert />Expired links are safely rejected</li></ul></div></section><section className="auth-panel"><div className="auth-card reset-password-card">{status === "checking" && <div className="reset-state"><LoaderCircle className="spin" /><h2>Verifying your secure link</h2><p>Please wait while PrepTrack validates this account action.</p></div>}{status === "success" && <div className="reset-state"><div className="reset-state-icon success"><CheckCircle2 /></div><span className="eyebrow">Action completed</span><h2>Everything is secure</h2><p>{message}</p><Link className="auth-submit reset-link" to="/login">Continue to sign in</Link></div>}{status === "invalid" && <div className="reset-state"><div className="reset-state-icon error"><ShieldAlert /></div><span className="eyebrow">Link unavailable</span><h2>This link cannot be used</h2><p>It may be invalid, expired, or already completed. Request a fresh email from the PrepTrack sign-in page.</p><Link className="auth-submit reset-link" to="/login">Return to sign in</Link></div>}</div></section></main>;
}
