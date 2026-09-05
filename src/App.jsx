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
import { createElement, lazy, Suspense, useEffect, useState } from "react";
import { NavLink, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { db, isFirebaseConfigured } from "./lib/firebase";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthorizedRoute from "./components/AuthorizedRoute";
import AppErrorBoundary from "./components/AppErrorBoundary";
import PageLoader from "./components/PageLoader";
import ThemeToggle from "./components/ThemeToggle";
import { useAuth } from "./context/AuthContext";
import { hasPermission, PERMISSIONS } from "./security/permissions";

const pageImports = {
  auth: () => import("./pages/AuthPage"),
  emailAction: () => import("./pages/EmailActionPage"),
  interview: () => import("./pages/AdaptiveInterviewPage"),
  security: () => import("./pages/AccountSecurityPage"),
  challenge: () => import("./pages/ChallengeArenaPage"),
  notes: () => import("./pages/NotesPage"),
  practice: () => import("./pages/PracticePage"),
  readiness: () => import("./pages/PlacementReadinessPage"),
  resetPassword: () => import("./pages/ResetPasswordPage"),
  roles: () => import("./pages/RoleWorkspacePage"),
  recruiter: () => import("./pages/RecruiterSimulatorPage"),
  unauthorized: () => import("./pages/UnauthorizedPage"),
};
const routeImport = {
  "/practice": pageImports.practice,
  "/notes": pageImports.notes,
  "/adaptive-interview": pageImports.interview,
  "/recruiter-simulator": pageImports.recruiter,
  "/readiness": pageImports.readiness,
  "/challenge-arena": pageImports.challenge,
  "/mentor": pageImports.roles,
  "/admin": pageImports.roles,
  "/security": pageImports.security,
};
const preloadRoute = (path) => routeImport[path]?.();
const AuthPage = lazy(pageImports.auth);
const EmailActionPage = lazy(pageImports.emailAction);
const AdaptiveInterviewPage = lazy(pageImports.interview);
const AccountSecurityPage = lazy(pageImports.security);
const ChallengeArenaPage = lazy(pageImports.challenge);
const NotesPage = lazy(pageImports.notes);
const PracticePage = lazy(pageImports.practice);
const PlacementReadinessPage = lazy(pageImports.readiness);
const ResetPasswordPage = lazy(pageImports.resetPassword);
const RoleWorkspacePage = lazy(pageImports.roles);
const RecruiterSimulatorPage = lazy(pageImports.recruiter);
const UnauthorizedPage = lazy(pageImports.unauthorized);

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

const pageTitles = Object.fromEntries(navigation.map((item) => [item.to, `${item.label} | PrepTrack AI`]));

const modules = [
  { title: "Enterprise Authentication", text: "Verified accounts, protected sessions, login monitoring, and password security.", status: "Manage security", to: "/security", icon: LockKeyhole },
  { title: "Role-Based Access Control", text: "Permission-aware experiences for students, mentors, and administrators.", status: "Protected access", to: "role-workspace", icon: ShieldCheck },
  { title: "Adaptive Interview Engine", text: "Dynamic questions, AI evaluation, difficulty tracking, and final reports.", status: "Start practising", to: "/adaptive-interview", icon: Bot },
  { title: "AI Recruiter Simulator", text: "Company-specific interview styles, standards, and contextual feedback.", status: "Choose a company", to: "/recruiter-simulator", icon: Building2 },
  { title: "Placement Readiness Engine", text: "Resume, assessment, and interview evidence combined into one roadmap.", status: "View readiness", to: "/readiness", icon: BarChart3 },
  { title: "Peer Challenge Arena", text: "Daily challenges, leaderboards, badges, ranks, and preparation streaks.", status: "Enter the arena", to: "/challenge-arena", icon: Swords },
];

function Dashboard() {
  const { user, role } = useAuth();
  const roleWorkspacePath = role === "admin" ? "/admin" : role === "mentor" ? "/mentor" : "/security";
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
        <div className="section-heading"><div><span className="eyebrow">Six connected capabilities</span><h2>Your complete preparation workspace</h2></div><span className="phase-chip">Unified experience</span></div>
        <div className="module-grid">
          {modules.map(({ title, text, status, to, icon }) => (
            <NavLink className="module-card" key={title} to={to === "role-workspace" ? roleWorkspacePath : to}><div className="module-icon">{createElement(icon, { size: 22 })}</div><h3>{title}</h3><p>{text}</p><span>{status} →</span></NavLink>
          ))}
        </div>
      </section>
    </>
  );
}

function ApplicationShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [platformMessage, setPlatformMessage] = useState("");
  const location = useLocation();
  const { user, profile, role, logout } = useAuth();
  const normalizedRole = String(role || "student").trim().toLowerCase();
  const currentPageName = navigation.find((item) => item.to === location.pathname)?.label || "Workspace";
  const accountName = profile?.displayName || user?.displayName || "PrepTrack User";
  const accountEmail = profile?.email || user?.email || "Account profile";
  const accountInitials = accountName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "PT";
  const visibleNavigation = normalizedRole === "admin"
    ? navigation
    : navigation.filter((item) => hasPermission(normalizedRole, item.permission));

  useEffect(() => {
    // These page chunks are small. Fetch them immediately after the secure shell
    // appears so navigation never waits for a route download.
    Object.values(routeImport).forEach((load) => load());
  }, []);

  useEffect(() => {
    if (!db) return;
    getDoc(doc(db, "platformSettings", "general"))
      .then((snapshot) => {
        const message = String(snapshot.data()?.maintenanceMessage || "").trim();
        setPlatformMessage(message.toLowerCase() === "preptrack ai platform is operating normally." ? "" : message);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    document.title = pageTitles[location.pathname] || "PrepTrack AI";
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const closeOnEscape = (event) => { if (event.key === "Escape") setMenuOpen(false); };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <aside className={menuOpen ? "sidebar open" : "sidebar"}>
        <div className="brand"><span>PT</span><div><strong>PrepTrack</strong><small>AI Career Lab</small></div></div>
        <button className="close-menu" onClick={() => setMenuOpen(false)} aria-label="Close navigation"><X /></button>
        <nav aria-label="Primary navigation">
          {visibleNavigation.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} onPointerEnter={() => preloadRoute(to)} onFocus={() => preloadRoute(to)} onClick={() => setMenuOpen(false)}>{createElement(icon, { size: 20 })}<span>{label}</span></NavLink>
          ))}
        </nav>
        <div className="sidebar-profile">
          <NavLink className="profile-identity" to="/security" onClick={() => setMenuOpen(false)} aria-label={`Open account profile for ${accountName}`} title={accountEmail}>
            <span className="profile-avatar" aria-hidden="true">{user?.photoURL ? <img src={user.photoURL} alt="" referrerPolicy="no-referrer" /> : accountInitials}</span>
            <span className="profile-copy"><strong>{accountName}</strong><small>{normalizedRole} workspace</small></span>
          </NavLink>
          <button className="logout-icon" onClick={logout} aria-label="Sign out"><LogOut size={16} /><span>Sign out</span></button>
        </div>
      </aside>

      <main id="main-content" tabIndex="-1">
        <header className="topbar"><button className="menu-button" onClick={() => setMenuOpen(true)} aria-label="Open navigation"><Menu size={20} /><span>Menu</span></button><div><span>PrepTrack AI workspace</span><strong>{currentPageName}</strong></div><ThemeToggle /></header>
        <div className="content">
          {platformMessage && <div className="platform-notice" role="status">{platformMessage}</div>}
          <AppErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <div className="route-stage" key={location.pathname}>
                <Routes location={location}>
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
            </Suspense>
          </AppErrorBoundary>
        </div>
      </main>
      {menuOpen && <button className="backdrop" onClick={() => setMenuOpen(false)} aria-label="Close navigation overlay" />}
    </div>
  );
}

function App() {
  return (
    <AppErrorBoundary>
      <Suspense fallback={<PageLoader label="Preparing PrepTrack AI" />}>
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route path="/auth/action" element={<EmailActionPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/*" element={<ProtectedRoute><ApplicationShell /></ProtectedRoute>} />
        </Routes>
      </Suspense>
    </AppErrorBoundary>
  );
}

export default App;
