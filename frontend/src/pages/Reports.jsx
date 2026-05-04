import { useState, useEffect } from "react";
import { getOutgoingReport, getEntriesReport } from "../services/reports.service";
import "./Reports.css";

export default function Reports() {
  const [tab, setTab]             = useState("outgoing");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate]     = useState("");
  const [records, setRecords]     = useState([]);
  const [total, setTotal]         = useState(0);
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [fetched, setFetched]     = useState(false);
  const [filtered, setFiltered]   = useState(false);

  async function fetchReport(t, s, e) {
    setError(""); setLoading(true); setRecords([]); setFetched(false);
    try {
      const res = t === "outgoing"
        ? await getOutgoingReport(s, e)
        : await getEntriesReport(s, e);
      setRecords(res.data.records);
      setTotal(res.data.total);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load report");
    } finally {
      setLoading(false);
      setFetched(true);
    }
  }

  // Load all records on mount and on tab switch
  useEffect(() => {
    setStartDate("");
    setEndDate("");
    setFiltered(false);
    fetchReport(tab, "", "");
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleFilter(e) {
    e.preventDefault();
    setFiltered(true);
    fetchReport(tab, startDate, endDate);
  }

  function handleClear() {
    setStartDate("");
    setEndDate("");
    setFiltered(false);
    fetchReport(tab, "", "");
  }

  function switchTab(t) {
    if (t === tab) return;
    setTab(t);
    setRecords([]);
    setFetched(false);
  }

  const totalRevenue = records.reduce((s, r) => s + r.chargedAmount, 0);

  return (
    <div className="page">
      <div className="page-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1>Reports</h1>
          <p className="page-subtitle">
            {filtered
              ? `Showing results from ${startDate} to ${endDate}`
              : "Showing all records"}
          </p>
        </div>
        <button className="btn-refresh" onClick={() => fetchReport(tab, startDate, endDate)} disabled={loading}>
          ↻ Refresh
        </button>
      </div>

      <div className="tab-bar">
        <button className={tab === "outgoing" ? "tab active" : "tab"} onClick={() => switchTab("outgoing")}>
          Outgoing Cars
        </button>
        <button className={tab === "entries" ? "tab active" : "tab"} onClick={() => switchTab("entries")}>
          Entered Cars
        </button>
      </div>

      <div className="report-filter">
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleFilter} className="filter-form">
          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Loading…" : "Filter"}
          </button>
          {filtered && (
            <button type="button" className="btn-clear" onClick={handleClear} disabled={loading}>
              Clear Filter
            </button>
          )}
        </form>
      </div>

      {loading && <p className="loading-text">Loading records…</p>}

      {!loading && fetched && records.length === 0 && (
        <div className="empty-state">
          No {tab === "outgoing" ? "outgoing" : "entry"} records{filtered ? " for this period" : " yet"}.
        </div>
      )}

      {!loading && records.length > 0 && (
        <div className="report-results">
          <div className="report-summary">
            {total} record{total !== 1 ? "s" : ""}
            {tab === "outgoing" && (
              <span className="report-total">
                Total amount charged: ${totalRevenue.toFixed(2)}
              </span>
            )}
          </div>
          <div className="table-wrapper">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Plate</th>
                  <th>Parking</th>
                  <th>Entry Time</th>
                  {tab === "outgoing" && <><th>Exit Time</th><th>Hours</th><th>Amount Charged</th></>}
                  {tab === "entries"  && <><th>Exit Time</th><th>Status</th><th>Amount Charged</th></>}
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  <tr key={i}>
                    <td><strong>{r.plateNumber}</strong></td>
                    <td>{r.parkingName}</td>
                    <td>{new Date(r.entryDateTime).toLocaleString()}</td>
                    {tab === "outgoing" && (
                      <>
                        <td>{new Date(r.exitDateTime).toLocaleString()}</td>
                        <td>{r.durationHours}h</td>
                        <td><strong>${r.chargedAmount.toFixed(2)}</strong></td>
                      </>
                    )}
                    {tab === "entries" && (
                      <>
                        <td>{r.exitDateTime ? new Date(r.exitDateTime).toLocaleString() : "—"}</td>
                        <td>
                          <span className={`badge ${r.status === "exited" ? "badge-ok" : "badge-full"}`}>
                            {r.status}
                          </span>
                        </td>
                        <td><strong>${r.chargedAmount.toFixed(2)}</strong></td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
