import { NavLink, useNavigate } from "react-router-dom";
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

  function handleLogout() {
    logoutUser();
    navigate("/login");
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-icon">🅿</span>
        <span className="brand-name">ParkManager</span>
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
  );
}
