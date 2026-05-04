import { useEffect, useState } from "react";
import { getAllParking, createParking, updateParking, deleteParking } from "../services/parking.service";
import { useAuth } from "../context/AuthContext";
import "./ParkingList.css";

const EMPTY_FORM = { code: "", name: "", location: "", totalSpaces: "", feePerHour: "" };

const modalOverlay = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
  display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
};
const modalBox = {
  background: "#fff", borderRadius: 12, padding: 32, width: "min(100%, calc(100vw - 32px))", maxWidth: 500,
  boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
};

function formatRWF(amount) {
  return `${Math.round(amount).toLocaleString()} RWF`;
}

export default function ParkingList() {
  const { user } = useAuth();
  const [parkings, setParkings]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_FORM);
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm]     = useState({});
  const [error, setError]           = useState("");
  const [success, setSuccess]       = useState("");
  const [submitting, setSubmitting] = useState(false);

  function load() {
    setLoading(true);
    getAllParking()
      .then((res) => setParkings(res.data))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  function openEdit(p) {
    setEditTarget(p);
    setEditForm({ name: p.name, location: p.location, totalSpaces: p.totalSpaces, feePerHour: p.feePerHour });
    setError(""); setSuccess("");
  }

  function closeEdit() { setEditTarget(null); }

  async function handleCreate(e) {
    e.preventDefault();
    setError(""); setSuccess("");
    setSubmitting(true);
    try {
      await createParking(createForm);
      setSuccess("Parking created successfully!");
      setCreateForm(EMPTY_FORM);
      setShowCreate(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || "Failed to create parking");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    setError(""); setSuccess("");
    setSubmitting(true);
    try {
      await updateParking(editTarget.code, editForm);
      setSuccess(`Parking ${editTarget.code} updated`);
      closeEdit();
      load();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || "Failed to update parking");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(code, name) {
    if (!window.confirm(`Delete parking "${name}" (${code})? This cannot be undone.`)) return;
    setError("");
    try {
      await deleteParking(code);
      setSuccess(`Parking ${code} deleted`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete parking");
    }
  }

  const occupancyPct = (p) =>
    Math.round(((p.totalSpaces - p.availableSpaces) / p.totalSpaces) * 100);

  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="page">
      <div className="page-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1>Parking Locations</h1>
          <p className="page-subtitle">{parkings.length} location{parkings.length !== 1 ? "s" : ""} registered</p>
        </div>
        {isAdmin && (
          <button className="btn-add" onClick={() => { setShowCreate(!showCreate); setError(""); setSuccess(""); }}>
            {showCreate ? "Cancel" : "+ Add Parking"}
          </button>
        )}
      </div>

      {error   && <div className="alert alert-error"   style={{ marginBottom: 16 }}>{error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom: 16 }}>{success}</div>}

      {showCreate && (
        <form className="parking-form" onSubmit={handleCreate}>
          <h2>New Parking Location</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Code</label>
              <input name="code" placeholder="e.g. PKA1" value={createForm.code}
                onChange={(e) => setCreateForm({ ...createForm, code: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Name</label>
              <input name="name" placeholder="Parking name" value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} required />
            </div>
          </div>
          <div className="form-group">
            <label>Location</label>
            <input name="location" placeholder="Address or area" value={createForm.location}
              onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Total Spaces</label>
              <input name="totalSpaces" type="number" min="1" placeholder="100" value={createForm.totalSpaces}
                onChange={(e) => setCreateForm({ ...createForm, totalSpaces: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Fee Per Hour (RWF)</label>
              <input name="feePerHour" type="number" min="1" step="1" placeholder="2000" value={createForm.feePerHour}
                onChange={(e) => setCreateForm({ ...createForm, feePerHour: e.target.value })} required />
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
              <div className="parking-fee">{formatRWF(p.feePerHour)}/hr</div>
              {isAdmin && (
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button className="btn-edit" style={{ flex: 1 }} onClick={() => openEdit(p)}>Edit</button>
                  <button className="btn-delete" style={{ flex: 1 }} onClick={() => handleDelete(p.code, p.name)}>Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {editTarget && (
        <div style={modalOverlay} onClick={closeEdit}>
          <div style={modalBox} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: 4 }}>Edit Parking</h2>
            <p style={{ color: "#64748b", marginBottom: 20 }}>Code: <strong>{editTarget.code}</strong> (cannot be changed)</p>
            <form onSubmit={handleUpdate}>
              <div className="form-row">
                <div className="form-group">
                  <label>Name</label>
                  <input value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Total Spaces</label>
                  <input type="number" min="1" value={editForm.totalSpaces}
                    onChange={(e) => setEditForm({ ...editForm, totalSpaces: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Fee Per Hour (RWF)</label>
                  <input type="number" min="1" step="1" value={editForm.feePerHour}
                    onChange={(e) => setEditForm({ ...editForm, feePerHour: e.target.value })} required />
                </div>
              </div>
              {error && <div className="alert alert-error" style={{ marginBottom: 12 }}>{error}</div>}
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? "Saving…" : "Save Changes"}
                </button>
                <button type="button" className="btn-clear" onClick={closeEdit}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
