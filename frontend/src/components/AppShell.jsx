import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../state/AuthContext.jsx";

export function AppShell() {
  const { session, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand">
          <span className="brand-mark">TF</span>
          <div>
            <strong>TaskFlow</strong>
            <p>{location.pathname === "/" ? "Projects overview" : "Project workspace"}</p>
          </div>
        </Link>

        <div className="topbar-actions">
          <div className="user-chip">
            <span>{session?.user?.name}</span>
            <small>{session?.user?.email}</small>
          </div>
          <button className="ghost-button" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <main className="page-shell">
        <Outlet />
      </main>
    </div>
  );
}
