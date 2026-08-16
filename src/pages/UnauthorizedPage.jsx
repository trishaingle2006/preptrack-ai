import { ArrowLeft, ShieldAlert } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function UnauthorizedPage() {
  return <section className="state-page"><ShieldAlert size={52} /><span className="eyebrow">Access restricted</span><h1>You don’t have permission to view this page.</h1><p>The attempted access has been safely blocked. If you believe your role is incorrect, contact a platform administrator.</p><NavLink to="/dashboard"><ArrowLeft size={18} />Return to dashboard</NavLink></section>;
}
