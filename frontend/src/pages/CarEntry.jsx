import { useState, useEffect } from "react";
import { carEntry } from "../services/cars.service";
import { getAllParking } from "../services/parking.service";
import "./CarForm.css";

const PLATE_REGEX = /^R[A-Z]{2}\s?\d{3}\s?[A-Z]$/i;

function formatRWF(amount) {
  return `${Math.round(amount).toLocaleString()} RWF`;
}

export default function CarEntry() {
  const [form, setForm]         = useState({ plateNumber: "", parkingCode: "" });
  const [parkings, setParkings] = useState([]);
  const [ticket, setTicket]     = useState(null);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    getAllParking().then((res) =>
      setParkings(res.data.filter((p) => p.availableSpaces > 0))
    );
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setTicket(null);

    const plate = form.plateNumber.trim().toUpperCase();
    if (!PLATE_REGEX.test(plate)) {
      setError("Invalid plate number format. Use Rwandan format: RAB 123 D");
      return;
    }

    setLoading(true);
    try {
      const res = await carEntry({ ...form, plateNumber: plate });
      setTicket(res.data.ticket);
      setForm({ plateNumber: "", parkingCode: "" });
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || "Entry failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Car Entry</h1>
        <p className="page-subtitle">Register a vehicle entering a parking location.</p>
      </div>

      <div className="form-card">
        {error && <div className="alert alert-error">{error}</div>}

        {ticket && (
          <div className="ticket">
            <div className="ticket-header">
              <span className="ticket-icon">🎫</span>
              <h3>Entry Ticket</h3>
            </div>
            <div className="ticket-row"><span>Plate Number</span><strong>{ticket.plateNumber}</strong></div>
            <div className="ticket-row"><span>Parking</span><strong>{ticket.parkingName} ({ticket.parkingCode})</strong></div>
            <div className="ticket-row"><span>Entry Time</span><strong>{new Date(ticket.entryDateTime).toLocaleString()}</strong></div>
            <div className="ticket-row"><span>Rate</span><strong>{formatRWF(ticket.feePerHour)}/hr</strong></div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="car-form">
          <div className="form-group">
            <label>Plate Number</label>
            <input
              name="plateNumber"
              placeholder="e.g. RAB 123 A"
              value={form.plateNumber}
              onChange={handleChange}
              required
            />
            <small style={{ color: "#94a3b8" }}>Rwandan format: RAB 123 A (R + 2 letters + 3 digits + 1 letter)</small>
          </div>
          <div className="form-group">
            <label>Parking Location</label>
            <select name="parkingCode" value={form.parkingCode} onChange={handleChange} required>
              <option value="">-- Select parking --</option>
              {parkings.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name} ({p.code}) — {p.availableSpaces} spaces free | {formatRWF(p.feePerHour)}/hr
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Processing…" : "Register Entry"}
          </button>
        </form>
      </div>
    </div>
  );
}
