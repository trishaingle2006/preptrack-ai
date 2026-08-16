import { LoaderCircle, Save, Settings, ShieldCheck, UserCog, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../services/apiClient";

const dateLabel = (value) => {
  const date = value?.toDate?.() ?? (value ? new Date(value) : null);
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString("en-IN", { dateStyle: "medium" }) : "Recent";
};

export default function RoleWorkspacePage({ type }) {
  const { user, role } = useAuth();
  const mentor = type === "mentor";
  const [users, setUsers] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [details, setDetails] = useState({ interviews: [], reports: [], feedback: [] });
  const [feedbackText, setFeedbackText] = useState("");
  const [settings, setSettings] = useState({ registrationsEnabled: true, maintenanceMessage: "" });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setLoading(true); setError("");
    if (!mentor) {
      apiRequest("getAdminWorkspace").then((data) => {
        setUsers(data.users ?? []);
        setSettings((current) => ({ ...current, ...(data.settings ?? {}) }));
      }).catch((caught) => setError(caught.message || "Unable to load the administration workspace."))
        .finally(() => setLoading(false));
      return;
    }
    apiRequest("getMentorWorkspace").then((data) => {
      const visible = data.students ?? [];
      setUsers(visible);
      setSelectedId((current) => current || visible[0]?.id || "");
    }).catch((caught) => setError(caught.message || "Unable to load the role workspace."))
      .finally(() => setLoading(false));
  }, [mentor]);

  useEffect(() => {
    if (!mentor || !selectedId) return;
    setBusy(true); setError("");
    apiRequest("getMentorWorkspace", { studentId: selectedId })
      .then((data) => setDetails(data.details ?? { interviews: [], reports: [], feedback: [] }))
      .catch((caught) => setError(caught.message || "Unable to load student performance."))
      .finally(() => setBusy(false));
  }, [mentor, selectedId]);

  async function submitFeedback(event) {
    event.preventDefault();
    if (!feedbackText.trim() || !selectedId) return;
    setBusy(true); setError(""); setMessage("");
    try {
      await apiRequest("submitMentorFeedback", { studentId: selectedId, feedback: feedbackText.trim() });
      setFeedbackText(""); setMessage("Mentor feedback saved successfully.");
      const refreshed = await apiRequest("getMentorWorkspace", { studentId: selectedId });
      setDetails(refreshed.details ?? { interviews: [], reports: [], feedback: [] });
    } catch (caught) { setError(caught.message || "Unable to save feedback."); }
    finally { setBusy(false); }
  }

  async function updateUser(account, changes) {
    setBusy(true); setError(""); setMessage("");
    try {
      await apiRequest("updatePlatformUser", { userId: account.id, ...changes });
      setUsers((current) => current.map((item) => item.id === account.id ? { ...item, ...changes } : item));
      setMessage(`${account.displayName || account.email} updated successfully.`);
    } catch (caught) { setError(caught.message || "Unable to update the user."); }
    finally { setBusy(false); }
  }

  async function saveSettings(event) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      await apiRequest("savePlatformSettings", settings);
      setMessage("Platform settings saved successfully.");
    } catch (caught) { setError(caught.message || "Unable to save platform settings."); }
    finally { setBusy(false); }
  }

  const selected = users.find((item) => item.id === selectedId);

  return <section className="workspace-page"><div className="workspace-heading"><div><span className="eyebrow">{role} workspace</span><h1>{mentor ? "Mentor Review Centre" : "Administration Console"}</h1><p>{mentor ? "Review student performance and provide structured feedback." : "Manage platform users, roles, account status, and configuration."}</p></div>{mentor ? <UsersRound size={70} /> : <UserCog size={70} />}</div>{error && <div className="auth-alert error">{error}</div>}{message && <div className="auth-alert success">{message}</div>}{loading ? <div className="arena-loading"><LoaderCircle className="spin" />Loading protected workspace…</div> : mentor ? <div className="role-workspace-layout"><aside className="role-list-card"><h2>Students</h2>{users.length ? users.map((item) => <button className={selectedId === item.id ? "active" : ""} key={item.id} onClick={() => setSelectedId(item.id)}><strong>{item.displayName || "Student"}</strong><span>{item.email}</span></button>) : <p>No student profiles are available.</p>}</aside><main className="mentor-review">{selected && <><div className="review-student-heading"><div><span className="eyebrow">Selected student</span><h2>{selected.displayName || selected.email}</h2><p>{selected.email} · {selected.status || "active"}</p></div><ShieldCheck size={42} /></div>{busy ? <div className="arena-loading"><LoaderCircle className="spin" />Loading performance…</div> : <><div className="review-metrics"><article><span>Completed interviews</span><strong>{details.interviews.length}</strong></article><article><span>Latest readiness</span><strong>{details.reports[0]?.scores?.overall ?? "—"}{details.reports[0] ? "/100" : ""}</strong></article><article><span>Feedback entries</span><strong>{details.feedback.length}</strong></article></div><div className="mentor-evidence"><article><h3>Recent interviews</h3>{details.interviews.length ? details.interviews.map((item) => <div key={item.id}><strong>{item.companyName || item.topic || item.type}</strong><span>{item.report?.averageScore ?? 0}/10 · {dateLabel(item.createdAt)}</span></div>) : <p>No completed interviews.</p>}</article><article><h3>Readiness history</h3>{details.reports.length ? details.reports.map((item) => <div key={item.id}><strong>{item.scores?.overall ?? 0}/100</strong><span>{item.classification} · {dateLabel(item.createdAt)}</span></div>) : <p>No readiness reports.</p>}</article></div><form className="mentor-feedback-form" onSubmit={submitFeedback}><h3>Provide feedback</h3><textarea value={feedbackText} onChange={(event) => setFeedbackText(event.target.value)} placeholder="Add specific, constructive feedback for this student…" minLength={20} maxLength={1500} required /><button disabled={busy}><Save size={17} />Save feedback</button></form><div className="saved-feedback"><h3>Feedback history</h3>{details.feedback.length ? details.feedback.map((item) => <article key={item.id}><strong>{item.mentorName}</strong><p>{item.feedback}</p><small>{dateLabel(item.createdAt)}</small></article>) : <p>No mentor feedback yet.</p>}</div></>}</>}</main></div> : <div className="admin-workspace"><section className="admin-user-card"><div><UsersRound /><h2>User and role management</h2></div><div className="admin-user-list">{users.map((account) => <article key={account.id}><div><strong>{account.displayName || "User"}</strong><span>{account.email}</span></div><label>Role<select value={account.role || "student"} disabled={busy || account.id === user.uid} onChange={(event) => updateUser(account, { role: event.target.value })}><option value="student">Student</option><option value="mentor">Mentor</option><option value="admin">Administrator</option></select></label><label>Status<select value={account.status || "active"} disabled={busy || account.id === user.uid} onChange={(event) => updateUser(account, { status: event.target.value })}><option value="active">Active</option><option value="suspended">Suspended</option></select></label></article>)}</div></section><form className="admin-settings-card" onSubmit={saveSettings}><div><Settings /><h2>Platform configuration</h2></div><label className="setting-toggle"><input type="checkbox" checked={settings.registrationsEnabled} onChange={(event) => setSettings({ ...settings, registrationsEnabled: event.target.checked })} />Allow new student registrations</label><label>Maintenance message<textarea value={settings.maintenanceMessage} onChange={(event) => setSettings({ ...settings, maintenanceMessage: event.target.value })} maxLength={500} placeholder="Optional announcement for all signed-in users" /></label><button disabled={busy}><Save size={17} />Save settings</button></form></div>}</section>;
}
