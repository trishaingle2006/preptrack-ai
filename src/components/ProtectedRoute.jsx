import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageLoader from "./PageLoader";

export default function ProtectedRoute({ children }) {
  const { user, profile, loading, authenticating, logout, passwordUpdateRequired } = useAuth();
  const location = useLocation();

  if (loading || authenticating) return <PageLoader label="Preparing your secure workspace" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (profile?.status && profile.status !== "active") {
    return <main className="blocked-account"><h1>Account access restricted</h1><p>Your account is not currently active. Contact an administrator if you believe this is a mistake.</p><button onClick={logout}>Sign out</button></main>;
  }
  if (passwordUpdateRequired && location.pathname !== "/security") return <Navigate to="/security" replace />;
  return children;
}
