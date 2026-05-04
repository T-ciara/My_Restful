import { useEffect, useState } from "react";
import { getActiveCars, deleteCarEntry } from "../services/cars.service";
import { useAuth } from "../context/AuthContext";
import "./ActiveCars.css";

export default function ActiveCars() {
  const { user }               = useAuth();
  const [records, setRecords]  = useState([]);
  const [loading, setLoading]  = useState(true);
  const [error, setError]      = useState("");

  const isAdmin = user?.role === "ADMIN";

  function load() {
    setLoading(true);
    getActiveCars()
      .then((res) => setRecords(res.data.records))
      .catch(() => setError("Failed to load active cars"))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleVoid(id, plateNumber) {
    if (!window.confirm(`Void entry for ${plateNumber}? This will free the parking space.`)) return;
    setError("");
    try {
      await deleteCarEntry(id);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to void entry");
    }
  }

  return (
    <div className="page">
      <div className="page-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1>Currently Parked Cars</h1>
          <p className="page-subtitle">
            {records.length} car{records.length !== 1 ? "s" : ""} currently in the parking
          </p>
        </div>
        <button className="btn-refresh" onClick={load}>↻ Refresh</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <p className="loading-text">Loading…</p>
      ) : records.length === 0 ? (
        <div className="empty-state">No cars currently parked.</div>
      ) : (
        <div className="table-wrapper">
          <table className="report-table">
            <thead>
              <tr>
                <th>Plate Number</th>
                <th>Parking</th>
                <th>Entry Time</th>
                <th>Duration</th>
                <th>Estimated Bill</th>
                {isAdmin && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td><strong>{r.plateNumber}</strong></td>
                  <td>{r.parkingName} <span style={{ color: "#94a3b8", fontSize: 12 }}>({r.parkingCode})</span></td>
                  <td>{new Date(r.entryDateTime).toLocaleString()}</td>
                  <td>{r.durationFormatted}</td>
                  <td><strong style={{ color: "#2563eb" }}>{Math.round(r.estimatedAmount).toLocaleString()} RWF</strong></td>
                  {isAdmin && (
                    <td>
                      <button className="btn-delete" onClick={() => handleVoid(r.id, r.plateNumber)}>
                        Void
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
