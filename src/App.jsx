import {
  BarChart3,
  BookOpenCheck,
  Bot,
  BriefcaseBusiness,
  Building2,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Menu,
  NotebookPen,
  ShieldCheck,
  Swords,
  UserRound,
  X,
} from "lucide-react";
import { collection, doc, getDoc, getDocs, limit, orderBy, query } from "firebase/firestore";
import { createElement, useEffect, useState } from "react";
import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import { db, isFirebaseConfigured } from "./lib/firebase";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthorizedRoute from "./components/AuthorizedRoute";
import { useAuth } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";
import AdaptiveInterviewPage from "./pages/AdaptiveInterviewPage";
import AccountSecurityPage from "./pages/AccountSecurityPage";
import ChallengeArenaPage from "./pages/ChallengeArenaPage";
import NotesPage from "./pages/NotesPage";
import PracticePage from "./pages/PracticePage";
import PlacementReadinessPage from "./pages/PlacementReadinessPage";
import RoleWorkspacePage from "./pages/RoleWorkspacePage";
import RecruiterSimulatorPage from "./pages/RecruiterSimulatorPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import { hasPermission, PERMISSIONS } from "./security/permissions";

const navigation = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, permission: PERMISSIONS.VIEW_DASHBOARD },
  { to: "/practice", label: "Practice Library", icon: BookOpenCheck, permission: PERMISSIONS.USE_PRACTICE },
  { to: "/notes", label: "Study Notes", icon: NotebookPen, permission: PERMISSIONS.MANAGE_OWN_NOTES },
  { to: "/adaptive-interview", label: "Adaptive Interview", icon: Bot, permission: PERMISSIONS.USE_INTERVIEWS },
  { to: "/recruiter-simulator", label: "Recruiter Simulator", icon: Building2, permission: PERMISSIONS.USE_INTERVIEWS },
  { to: "/readiness", label: "Placement Readiness", icon: BarChart3, permission: PERMISSIONS.VIEW_OWN_READINESS },
  { to: "/challenge-arena", label: "Challenge Arena", icon: Swords, permission: PERMISSIONS.USE_CHALLENGES },
  { to: "/mentor", label: "Mentor Centre", icon: UserRound, permission: PERMISSIONS.REVIEW_STUDENTS },
  { to: "/admin", label: "Admin Console", icon: ShieldCheck, permission: PERMISSIONS.MANAGE_PLATFORM },
  { to: "/security", label: "Account Security", icon: LockKeyhole, permission: PERMISSIONS.MANAGE_OWN_SECURITY },
];

const modules = [
  ["Adaptive Interview", "Dynamic questions, answer evaluation, difficulty tracking, and final reports.", "Available", "/adaptive-interview"],
  ["Recruiter Simulator", "Company-specific interview styles, standards, and feedback.", "Available", "/recruiter-simulator"],
  ["Placement Readiness", "Resume, assessment, and interview insights combined into one roadmap.", "Available", "/readiness"],
  ["Challenge Arena", "Daily challenges, leaderboards, badges, ranks, and streaks.", "Available", "/challenge-arena"],
];

function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState({ readiness: null, interviews: 0, practice: 0, rank: null, streak: 0 });
  const [summaryLoading, setSummaryLoading] = useState(Boolean(db));

  useEffect(() => {
    if (!db || !user) {
      setSummaryLoading(false);
      return;
    }
    let active = true;
    Promise.all([
      getDocs(query(collection(db, "users", user.uid, "readinessReports"), orderBy("createdAt", "desc"), limit(1))),
      getDocs(collection(db, "users", user.uid, "interviewSessions")),
      getDoc(doc(db, "users", user.uid, "progress", "practice")),
      getDoc(doc(db, "leaderboard", user.uid)),
    ]).then(([readinessSnapshot, interviewSnapshot, practiceSnapshot, leaderboardSnapshot]) => {
      if (!active) return;
      const readiness = readinessSnapshot.docs[0]?.data();
      const leaderboard = leaderboardSnapshot.data() ?? {};
      setSummary({
        readiness: readiness?.scores?.overall ?? null,
        interviews: interviewSnapshot.docs.filter((item) => item.data().status === "completed").length,
        practice: practiceSnapshot.data()?.completedQuestionIds?.length ?? 0,
        rank: leaderboard.rank ?? null,
        streak: leaderboard.streak ?? 0,
      });
    }).catch((error) => console.error("Unable to load dashboard summary", error))
      .finally(() => { if (active) setSummaryLoading(false); });
    return () => { active = false; };
  }, [user]);

  return (
    <>
      <section className="hero">
        <div>
          <span className="eyebrow light">AI-powered placement preparation</span>
          <h1>Build confidence. Prove readiness. Get hired.</h1>
          <p>PrepTrack AI brings interview practice, company simulation, readiness intelligence, and peer challenges into one secure platform.</p>
          <NavLink className="primary-action" to="/adaptive-interview">Start an interview</NavLink>
        </div>
        <BriefcaseBusiness aria-hidden="true" size={120} strokeWidth={1.25} />
      </section>

      {!isFirebaseConfigured && (
        <div className="config-warning">Firebase environment variables are not configured yet. Copy <code>.env.example</code> to <code>.env</code> before testing authentication.</div>
      )}

      <section className="metrics" aria-label="Progress summary">
        <article><span>Readiness score</span><strong>{summaryLoading ? "…" : summary.readiness == null ? "—" : `${summary.readiness}/100`}</strong><small>{summary.readiness == null ? "Complete your first assessment" : "Latest readiness assessment"}</small></article>
        <article><span>Interviews</span><strong>{summaryLoading ? "…" : summary.interviews}</strong><small>{summary.interviews ? `${summary.practice} practice questions completed` : "No completed sessions yet"}</small></article>
        <article><span>Challenge rank</span><strong>{summaryLoading ? "…" : summary.rank ? `#${summary.rank}` : "—"}</strong><small>{summary.rank ? "Current peer standing" : "Join the challenge arena"}</small></article>
        <article><span>Current streak</span><strong>{summaryLoading ? "…" : `${summary.streak} ${summary.streak === 1 ? "day" : "days"}`}</strong><small>{summary.streak ? "Keep your momentum going" : "Start practising today"}</small></article>
      </section>

      <section className="module-section">
        <div className="section-heading"><div><span className="eyebrow">Integrated platform</span><h2>Your preparation workspace</h2></div><span className="phase-chip">Core modules ready</span></div>
        <div className="module-grid">
          {modules.map(([title, text, status, to]) => (
            <NavLink className="module-card" key={title} to={to}><div className="module-icon"><Bot size={22} /></div><h3>{title}</h3><p>{text}</p><span>{status}</span></NavLink>
          ))}
        </div>
      </section>
    </>
  );
}

function ApplicationShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, role, logout } = useAuth();
  const normalizedRole = String(role || "student").trim().toLowerCase();
  const visibleNavigation = normalizedRole === "admin"
    ? navigation
    : navigation.filter((item) => hasPermission(normalizedRole, item.permission));

  return (
    <div className="app-shell">
      <aside className={menuOpen ? "sidebar open" : "sidebar"}>
        <div className="brand"><span>PT</span><div><strong>PrepTrack</strong><small>AI Career Lab</small></div></div>
        <button className="close-menu" onClick={() => setMenuOpen(false)} aria-label="Close navigation"><X /></button>
        <nav>
          {visibleNavigation.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} onClick={() => setMenuOpen(false)}>{createElement(icon, { size: 20 })}<span>{label}</span></NavLink>
          ))}
        </nav>
        <div className="sidebar-profile"><UserRound /><div><strong>{user?.displayName || "Student"}</strong><small>{normalizedRole} workspace</small></div><button className="logout-icon" onClick={logout} aria-label="Sign out"><LogOut size={16} /><span>Sign out</span></button></div>
      </aside>

      <main>
        <header className="topbar"><button className="menu-button" onClick={() => setMenuOpen(true)} aria-label="Open navigation"><Menu size={20} /><span>Menu</span></button><div><span>Internship build</span><strong>PrepTrack AI</strong></div><span className="role-badge">{normalizedRole}</span></header>
        <div className="content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/practice" element={<AuthorizedRoute permission={PERMISSIONS.USE_PRACTICE}><PracticePage /></AuthorizedRoute>} />
            <Route path="/notes" element={<AuthorizedRoute permission={PERMISSIONS.MANAGE_OWN_NOTES}><NotesPage /></AuthorizedRoute>} />
            <Route path="/adaptive-interview" element={<AuthorizedRoute permission={PERMISSIONS.USE_INTERVIEWS}><AdaptiveInterviewPage /></AuthorizedRoute>} />
            <Route path="/recruiter-simulator" element={<AuthorizedRoute permission={PERMISSIONS.USE_INTERVIEWS}><RecruiterSimulatorPage /></AuthorizedRoute>} />
            <Route path="/readiness" element={<AuthorizedRoute permission={PERMISSIONS.VIEW_OWN_READINESS}><PlacementReadinessPage /></AuthorizedRoute>} />
            <Route path="/challenge-arena" element={<AuthorizedRoute permission={PERMISSIONS.USE_CHALLENGES}><ChallengeArenaPage /></AuthorizedRoute>} />
            <Route path="/mentor" element={<AuthorizedRoute permission={PERMISSIONS.REVIEW_STUDENTS}><RoleWorkspacePage type="mentor" /></AuthorizedRoute>} />
            <Route path="/admin" element={<AuthorizedRoute permission={PERMISSIONS.MANAGE_PLATFORM}><RoleWorkspacePage type="admin" /></AuthorizedRoute>} />
            <Route path="/security" element={<AuthorizedRoute permission={PERMISSIONS.MANAGE_OWN_SECURITY}><AccountSecurityPage /></AuthorizedRoute>} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>
      {menuOpen && <button className="backdrop" onClick={() => setMenuOpen(false)} aria-label="Close navigation overlay" />}
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route path="/*" element={<ProtectedRoute><ApplicationShell /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;
