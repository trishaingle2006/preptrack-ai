import { AlertTriangle, CheckCircle2, History, KeyRound, Laptop, LoaderCircle, LogOut, RefreshCw, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { loadSecurityOverview, revokeSession } from "../services/securityService";

const formatDate = (value) => value ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "Pending";

export default function AccountSecurityPage() {
  const { user, changePassword, sessionId, logout } = useAuth();
  const [overview, setOverview] = useState({ sessions: [], activity: [], alerts: [] });
  const [passwords, setPasswords] = useState({ current: "", next: "" });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const passwordProvider = user?.providerData?.some((item) => item.providerId === "password");

  async function refresh() {
    setLoading(true); setError("");
    try { setOverview(await loadSecurityOverview()); }
    catch (caught) { setError(caught.message?.replace(/^Firebase: /, "") || "Unable to load security information."); }
    finally { setLoading(false); }
  }
  useEffect(() => { refresh(); }, []);

  async function removeSession(id) {
    await revokeSession(id); setMessage(id === sessionId ? "Current session revoked. Signing out…" : "Session revoked.");
    if (id === sessionId) { await logout(); return; }
    await refresh();
  }

  async function updatePassword(event) {
    event.preventDefault(); setError(""); setMessage("");
    try { await changePassword(passwords.current, passwords.next); setPasswords({ current: "", next: "" }); setMessage("Password updated successfully."); await refresh(); }
    catch (caught) { setError(caught.message?.replace(/^Firebase: /, "") || "Unable to update password."); }
  }

  return <section className="workspace-page"><div className="workspace-heading"><div><span className="eyebrow">Enterprise account protection</span><h1>Account Security</h1><p>Review sign-ins, manage active devices, respond to alerts, and maintain your password.</p></div><ShieldCheck size={76} /></div>{error && <div className="auth-alert error">{error}</div>}{message && <div className="auth-alert success">{message}</div>}<div className="security-summary"><article><CheckCircle2 /><span>Email verification</span><strong>{user?.emailVerified ? "Verified" : "Pending"}</strong></article><article><Laptop /><span>Active sessions</span><strong>{overview.sessions.filter((item) => item.status === "active").length}</strong></article><article><AlertTriangle /><span>Security alerts</span><strong>{overview.alerts.filter((item) => !item.acknowledged).length}</strong></article><article><KeyRound /><span>Password updated</span><strong>{overview.passwordChangedAt ? formatDate(overview.passwordChangedAt) : "Not recorded"}</strong></article></div>{loading ? <div className="arena-loading"><LoaderCircle className="spin" />Loading security history…</div> : <div className="security-layout"><div className="security-main"><article className="security-card"><div className="security-card-title"><Laptop /><div><h2>Active sessions</h2><p>Only one active device is permitted. A new sign-in replaces older sessions.</p></div><button onClick={refresh} aria-label="Refresh"><RefreshCw size={17} /></button></div><div className="session-list">{overview.sessions.map((item) => <div key={item.id}><div><strong>{item.deviceLabel}</strong><span>{item.platform} · {formatDate(item.createdAt)}</span><small className={`session-status ${item.status}`}>{item.id === sessionId ? "Current · " : ""}{item.status}</small></div>{item.status === "active" && <button onClick={() => removeSession(item.id)}><LogOut size={16} />Revoke</button>}</div>)}</div></article><article className="security-card"><div className="security-card-title"><History /><div><h2>Login activity</h2><p>Recent successful sign-ins and password changes.</p></div></div><div className="activity-list">{overview.activity.map((item) => <div key={item.id}><span className={`activity-dot ${item.type}`} /><div><strong>{item.type === "password_updated" ? "Password updated" : "Successful sign-in"}</strong><span>{item.deviceLabel} · {formatDate(item.occurredAt)}</span></div></div>)}</div></article></div><aside className="security-side"><article className="security-card"><h2>Security alerts</h2>{overview.alerts.length ? overview.alerts.map((item) => <div className="security-alert" key={item.id}><AlertTriangle /><div><strong>{item.title}</strong><p>{item.message}</p><small>{formatDate(item.createdAt)}</small></div></div>) : <p className="muted">No unusual activity detected.</p>}</article>{passwordProvider && <form className="security-card password-form" onSubmit={updatePassword}><h2>Update password</h2><p>Use 8+ characters with uppercase, lowercase, a number, and a symbol.</p><label>Current password<input type="password" value={passwords.current} onChange={(event) => setPasswords({ ...passwords, current: event.target.value })} required /></label><label>New password<input type="password" value={passwords.next} onChange={(event) => setPasswords({ ...passwords, next: event.target.value })} required /></label><button>Update securely</button></form>}</aside></div>}</section>;
}
