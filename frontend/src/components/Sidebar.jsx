import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Sidebar.css";

const NAV_ITEMS = [
  { to: "/dashboard",   label: "Dashboard",        icon: "🏠" },
  { to: "/parking",     label: "Parking",           icon: "🅿️" },
  { to: "/car-entry",   label: "Car Entry",         icon: "🚗" },
  { to: "/car-exit",    label: "Car Exit",           icon: "🚦" },
  { to: "/active-cars", label: "Currently Parked",  icon: "📍" },
];

const ADMIN_ITEMS = [
  { to: "/reports", label: "Reports",          icon: "📊" },
  { to: "/users",   label: "User Management",  icon: "👥" },
];

export default function Sidebar() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  function handleLogout() {
    logoutUser();
    navigate("/login");
  }

  return (
    <>
      <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)} aria-label="Open menu">
        ☰
      </button>

      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`sidebar${mobileOpen ? " sidebar-open" : ""}`}>
      <div className="sidebar-brand">
        <span className="brand-icon">🅿</span>
        <span className="brand-name">ParkManager</span>
        <button className="sidebar-close-btn" onClick={() => setMobileOpen(false)} aria-label="Close menu">✕</button>
      </div>

      <div className="sidebar-user">
        <div className="user-avatar">{user?.firstName?.[0]}{user?.lastName?.[0]}</div>
        <div className="user-info">
          <p className="user-name">{user?.firstName} {user?.lastName}</p>
          <p className="user-role">{user?.role}</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}

        {user?.role === "ADMIN" && (
          <>
            <div className="nav-divider" />
            {ADMIN_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </>
        )}
      </nav>

      <button className="logout-btn" onClick={handleLogout}>
        <span>🚪</span> Logout
      </button>
    </aside>
    </>
  );
}
