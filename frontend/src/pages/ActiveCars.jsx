import { useEffect, useState } from "react";
import { getActiveCars } from "../services/cars.service";
import "./ActiveCars.css";

export default function ActiveCars() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  function load() {
    setLoading(true);
    getActiveCars()
      .then((res) => setRecords(res.data.records))
      .catch(() => setError("Failed to load active cars"))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

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
                <th>Hours Parked</th>
                <th>Estimated Bill</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td><strong>{r.plateNumber}</strong></td>
                  <td>{r.parkingName} <span style={{ color: "#94a3b8", fontSize: 12 }}>({r.parkingCode})</span></td>
                  <td>{new Date(r.entryDateTime).toLocaleString()}</td>
                  <td>{r.hoursParked}h</td>
                  <td><strong style={{ color: "#2563eb" }}>${r.estimatedAmount.toFixed(2)}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
