import { useEffect, useState } from "react";
import { getAllUsers, createUser, deleteUser } from "../services/users.service";
import { useAuth } from "../context/AuthContext";
import "./Users.css";

const EMPTY_FORM = { firstName: "", lastName: "", email: "", password: "", role: "ATTENDANT" };

export default function Users() {
  const { user: me }              = useAuth();
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState("");
  const [submitting, setSubmitting] = useState(false);

  function load() {
    setLoading(true);
    getAllUsers()
      .then((res) => setUsers(res.data))
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
      await createUser(form);
      setSuccess(`User ${form.email} created successfully`);
      setForm(EMPTY_FORM);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id, email) {
    if (!window.confirm(`Delete user ${email}?`)) return;
    try {
      await deleteUser(id);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user");
    }
  }

  return (
    <div className="page">
      <div className="page-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1>User Management</h1>
          <p className="page-subtitle">{users.length} user{users.length !== 1 ? "s" : ""} registered</p>
        </div>
        <button className="btn-add" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Add User"}
        </button>
      </div>

      {error   && <div className="alert alert-error"   style={{ marginBottom: 16 }}>{error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom: 16 }}>{success}</div>}

      {showForm && (
        <form className="user-form" onSubmit={handleSubmit}>
          <h2>New User</h2>
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input name="firstName" placeholder="John" value={form.firstName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input name="lastName" placeholder="Doe" value={form.lastName} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" placeholder="user@example.com" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Password</label>
              <input name="password" type="password" placeholder="Min 6 characters" value={form.password} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select name="role" value={form.role} onChange={handleChange}>
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
                <th>Action</th>
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
                  <td>
                    {u.id !== me.id && (
                      <button className="btn-delete" onClick={() => handleDelete(u.id, u.email)}>
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
