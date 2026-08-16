import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { hasPermission } from "../security/permissions";

export default function AuthorizedRoute({ permission, children }) {
  const { role } = useAuth();
  return hasPermission(role, permission) ? children : <Navigate to="/unauthorized" replace />;
}
