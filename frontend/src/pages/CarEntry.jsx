import { useState, useEffect } from "react";
import { carEntry } from "../services/cars.service";
import { getAllParking } from "../services/parking.service";
import "./CarForm.css";

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
    setLoading(true);
    try {
      const res = await carEntry(form);
      setTicket(res.data.ticket);
      setForm({ plateNumber: "", parkingCode: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Entry failed");
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
            <div className="ticket-row"><span>Rate</span><strong>${ticket.feePerHour}/hr</strong></div>
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
          </div>
          <div className="form-group">
            <label>Parking Location</label>
            <select name="parkingCode" value={form.parkingCode} onChange={handleChange} required>
              <option value="">-- Select parking --</option>
              {parkings.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name} ({p.code}) — {p.availableSpaces} spaces free | ${p.feePerHour}/hr
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
