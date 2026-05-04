import { useEffect, useState } from "react";
import { getAllParking, createParking } from "../services/parking.service";
import { useAuth } from "../context/AuthContext";
import "./ParkingList.css";

const EMPTY_FORM = { code: "", name: "", location: "", totalSpaces: "", feePerHour: "" };

export default function ParkingList() {
  const { user } = useAuth();
  const [parkings, setParkings]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState("");
  const [submitting, setSubmitting] = useState(false);

  function load() {
    setLoading(true);
    getAllParking()
      .then((res) => setParkings(res.data))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setSuccess("");
    setSubmitting(true);
    try {
      await createParking(form);
      setSuccess("Parking created successfully!");
      setForm(EMPTY_FORM);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || "Failed to create parking");
    } finally {
      setSubmitting(false);
    }
  }

  const occupancyPct = (p) =>
    Math.round(((p.totalSpaces - p.availableSpaces) / p.totalSpaces) * 100);

  return (
    <div className="page">
      <div className="page-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1>Parking Locations</h1>
          <p className="page-subtitle">{parkings.length} location{parkings.length !== 1 ? "s" : ""} registered</p>
        </div>
        {user?.role === "ADMIN" && (
          <button className="btn-add" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "+ Add Parking"}
          </button>
        )}
      </div>

      {error   && <div className="alert alert-error"   style={{ marginBottom: 16 }}>{error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom: 16 }}>{success}</div>}

      {showForm && (
        <form className="parking-form" onSubmit={handleSubmit}>
          <h2>New Parking Location</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Code</label>
              <input name="code" placeholder="e.g. PKA1" value={form.code} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Name</label>
              <input name="name" placeholder="Parking name" value={form.name} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-group">
            <label>Location</label>
            <input name="location" placeholder="Address or area" value={form.location} onChange={handleChange} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Total Spaces</label>
              <input name="totalSpaces" type="number" min="1" placeholder="100" value={form.totalSpaces} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Fee Per Hour ($)</label>
              <input name="feePerHour" type="number" min="0" step="0.01" placeholder="2.50" value={form.feePerHour} onChange={handleChange} required />
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Creating…" : "Create Parking"}
          </button>
        </form>
      )}

      {loading ? (
        <p className="loading-text">Loading…</p>
      ) : parkings.length === 0 ? (
        <div className="empty-state">No parking locations yet.</div>
      ) : (
        <div className="parking-grid">
          {parkings.map((p) => (
            <div key={p.id} className="parking-card">
              <div className="parking-card-header">
                <span className="parking-code">{p.code}</span>
                <span className={`badge ${p.availableSpaces === 0 ? "badge-full" : "badge-ok"}`}>
                  {p.availableSpaces === 0 ? "FULL" : "OPEN"}
                </span>
              </div>
              <h3 className="parking-name">{p.name}</h3>
              <p className="parking-location">📍 {p.location}</p>
              <div className="parking-spaces">
                <span className="spaces-available">{p.availableSpaces}</span>
                <span className="spaces-sep"> / </span>
                <span className="spaces-total">{p.totalSpaces} spaces</span>
              </div>
              <div className="occupancy-bar-bg">
                <div
                  className="occupancy-bar-fill"
                  style={{ width: `${occupancyPct(p)}%`, background: p.availableSpaces === 0 ? "#ef4444" : "#3b82f6" }}
                />
              </div>
              <div className="parking-fee">${p.feePerHour}/hr</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
