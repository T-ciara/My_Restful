import { useEffect, useState } from "react";
import { getAllUsers, createUser, updateUser, deleteUser } from "../services/users.service";
import { useAuth } from "../context/AuthContext";
import "./Users.css";

const EMPTY_CREATE = { firstName: "", lastName: "", email: "", password: "", role: "ATTENDANT" };
const EMPTY_EDIT   = { firstName: "", lastName: "", email: "", role: "ATTENDANT", password: "" };

const modalOverlay = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
  display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
};
const modalBox = {
  background: "#fff", borderRadius: 12, padding: 32, width: "min(100%, calc(100vw - 32px))", maxWidth: 480,
  boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
};

export default function Users() {
  const { user: me }                = useAuth();
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_CREATE);
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm]     = useState(EMPTY_EDIT);
  const [error, setError]           = useState("");
  const [success, setSuccess]       = useState("");
  const [submitting, setSubmitting] = useState(false);

  function load() {
    setLoading(true);
    getAllUsers()
      .then((res) => setUsers(res.data))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  function openEdit(u) {
    setEditTarget(u);
    setEditForm({ firstName: u.firstName, lastName: u.lastName, email: u.email, role: u.role, password: "" });
    setError(""); setSuccess("");
  }

  function closeEdit() { setEditTarget(null); }

  async function handleCreate(e) {
    e.preventDefault();
    setError(""); setSuccess("");
    setSubmitting(true);
    try {
      await createUser(createForm);
      setSuccess(`User ${createForm.email} created successfully`);
      setCreateForm(EMPTY_CREATE);
      setShowCreate(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    setError(""); setSuccess("");
    setSubmitting(true);
    const payload = { ...editForm };
    if (!payload.password) delete payload.password;
    try {
      await updateUser(editTarget.id, payload);
      setSuccess("User updated successfully");
      closeEdit();
      load();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || "Failed to update user");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id, email) {
    if (!window.confirm(`Delete user ${email}? This cannot be undone.`)) return;
    setError("");
    try {
      await deleteUser(id);
      setSuccess("User deleted");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user");
    }
  }

  return (
    <div className="page">
      <div className="page-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1>User Management</h1>
          <p className="page-subtitle">{users.length} user{users.length !== 1 ? "s" : ""} registered</p>
        </div>
        <button className="btn-add" onClick={() => { setShowCreate(!showCreate); setError(""); setSuccess(""); }}>
          {showCreate ? "Cancel" : "+ Add User"}
        </button>
      </div>

      {error   && <div className="alert alert-error"   style={{ marginBottom: 16 }}>{error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom: 16 }}>{success}</div>}

      {showCreate && (
        <form className="user-form" onSubmit={handleCreate}>
          <h2>New User</h2>
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input name="firstName" placeholder="John" value={createForm.firstName}
                onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input name="lastName" placeholder="Doe" value={createForm.lastName}
                onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })} required />
            </div>
          </div>
          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" placeholder="user@example.com" value={createForm.email}
              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Password</label>
              <input name="password" type="password" placeholder="Min 6 characters" value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select name="role" value={createForm.role}
                onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}>
                <option value="ATTENDANT">Attendant</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Creating…" : "Create User"}
          </button>
        </form>
      )}

      {loading ? (
        <p className="loading-text">Loading…</p>
      ) : (
        <div className="table-wrapper">
          <table className="report-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td><strong>{u.firstName} {u.lastName}</strong></td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`role-badge ${u.role === "ADMIN" ? "role-admin" : "role-attendant"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td style={{ display: "flex", gap: 8 }}>
                    <button className="btn-edit" onClick={() => openEdit(u)}>Edit</button>
                    {u.id !== me.id && (
                      <button className="btn-delete" onClick={() => handleDelete(u.id, u.email)}>Delete</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editTarget && (
        <div style={modalOverlay} onClick={closeEdit}>
          <div style={modalBox} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: 20 }}>Edit User</h2>
            <form onSubmit={handleUpdate}>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>New Password <span style={{ color: "#94a3b8", fontWeight: 400 }}>(leave blank to keep)</span></label>
                  <input type="password" placeholder="New password…" value={editForm.password}
                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}>
                    <option value="ATTENDANT">Attendant</option>
                    <option value="ADMIN">Admin</option>
                  </select>
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
