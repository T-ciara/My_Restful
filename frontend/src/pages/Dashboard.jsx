import { useEffect, useState } from "react";
import { getAllParking } from "../services/parking.service";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, available: 0, occupied: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllParking()
      .then((res) => {
        const parkings = res.data;
        const total     = parkings.reduce((s, p) => s + p.totalSpaces, 0);
        const available = parkings.reduce((s, p) => s + p.availableSpaces, 0);
        setStats({ total, available, occupied: total - available, lots: parkings.length });
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Welcome back, {user?.firstName}!</h1>
        <p className="page-subtitle">Here's a snapshot of the parking system.</p>
      </div>

      {loading ? (
        <p className="loading-text">Loading…</p>
      ) : (
        <div className="stats-grid">
          <div className="stat-card blue">
            <div className="stat-icon">🅿️</div>
            <div className="stat-value">{stats.lots}</div>
            <div className="stat-label">Parking Locations</div>
          </div>
          <div className="stat-card green">
            <div className="stat-icon">✅</div>
            <div className="stat-value">{stats.available}</div>
            <div className="stat-label">Available Spaces</div>
          </div>
          <div className="stat-card red">
            <div className="stat-icon">🚗</div>
            <div className="stat-value">{stats.occupied}</div>
            <div className="stat-label">Occupied Spaces</div>
          </div>
          <div className="stat-card gray">
            <div className="stat-icon">📦</div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Capacity</div>
          </div>
        </div>
      )}

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-grid">
          <a href="/car-entry" className="action-card">
            <span className="action-icon">🚗</span>
            <span>Register Car Entry</span>
          </a>
          <a href="/car-exit" className="action-card">
            <span className="action-icon">🚦</span>
            <span>Process Car Exit</span>
          </a>
          <a href="/parking" className="action-card">
            <span className="action-icon">🅿️</span>
            <span>View All Parking</span>
          </a>
          {user?.role === "ADMIN" && (
            <a href="/reports" className="action-card">
              <span className="action-icon">📊</span>
              <span>View Reports</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
