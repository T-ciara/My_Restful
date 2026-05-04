import { useState } from "react";
import { carExit } from "../services/cars.service";
import "./CarForm.css";

const PLATE_REGEX = /^R[A-Z]{2}\s?\d{3}\s?[A-Z]$/i;

function formatRWF(amount) {
  return `${Math.round(amount).toLocaleString()} RWF`;
}

export default function CarExit() {
  const [plateNumber, setPlateNumber] = useState("");
  const [bill, setBill]               = useState(null);
  const [error, setError]             = useState("");
  const [loading, setLoading]         = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setBill(null);

    const plate = plateNumber.trim().toUpperCase();
    if (!PLATE_REGEX.test(plate)) {
      setError("Invalid plate number format. Use Rwandan format: RAB 123 D");
      return;
    }

    setLoading(true);
    try {
      const res = await carExit(plate);
      setBill(res.data.bill);
      setPlateNumber("");
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || "Exit failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Car Exit</h1>
        <p className="page-subtitle">Process a vehicle exit and generate the bill.</p>
      </div>

      <div className="form-card">
        {error && <div className="alert alert-error">{error}</div>}

        {bill && (
          <div className="ticket bill">
            <div className="ticket-header">
              <span className="ticket-icon">🧾</span>
              <h3>Parking Bill</h3>
            </div>
            <div className="ticket-row"><span>Plate Number</span><strong>{bill.plateNumber}</strong></div>
            <div className="ticket-row"><span>Parking</span><strong>{bill.parkingName}</strong></div>
            <div className="ticket-row"><span>Entry</span><strong>{new Date(bill.entryDateTime).toLocaleString()}</strong></div>
            <div className="ticket-row"><span>Exit</span><strong>{new Date(bill.exitDateTime).toLocaleString()}</strong></div>
            <div className="ticket-row"><span>Duration</span><strong>{bill.durationFormatted}</strong></div>
            <div className="ticket-row"><span>Billed Hours</span><strong>{bill.durationHours} hour{bill.durationHours !== 1 ? "s" : ""}</strong></div>
            <div className="ticket-row"><span>Rate</span><strong>{formatRWF(bill.feePerHour)}/hr</strong></div>
            <div className="ticket-divider" />
            <div className="ticket-row total"><span>Total Charged</span><strong>{formatRWF(bill.chargedAmount)}</strong></div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="car-form">
          <div className="form-group">
            <label>Plate Number</label>
            <input
              placeholder="e.g. RAB 123 A"
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value)}
              required
            />
            <small style={{ color: "#94a3b8" }}>Rwandan format: RAB 123 A (R + 2 letters + 3 digits + 1 letter)</small>
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Processing…" : "Process Exit & Generate Bill"}
          </button>
        </form>
      </div>
    </div>
  );
}
