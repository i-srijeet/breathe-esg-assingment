import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";
import "./App.css";

function HomePage() {
  const [batches, setBatches] = useState([]);
  const [normalized, setNormalized] = useState([]);

  useEffect(() => {
    fetchBatches();
    fetchNormalized();
  }, []);

  const fetchBatches = async () => {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/batches/`);
    const data = await response.json();
    setBatches(data);
  };

  const fetchNormalized = async () => {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/normalized/`);
    const data = await response.json();
    setNormalized(data);
  };

  return (
    <div className="App">
      <div className="home-container">
        <div className="dashboard-title">
          <div className="title-main">Breathe ESG</div>
          <div className="title-sub">Dashboard</div>
        </div>

        <div className="kpi-row">
          <div className="kpi-card">
            <h3>Total Batches</h3>
            <div className="value">{batches.length}</div>
          </div>

          <div className="kpi-card">
            <h3>Activities</h3>
            <div className="value">{normalized.length}</div>
          </div>

          <div className="kpi-card">
            <h3>Suspicious</h3>
            <div className="value">
              {normalized.filter((r) => r.is_suspicious).length}
            </div>
          </div>
        </div>

        <div className="nav-buttons">
          <Link className="nav-btn" to="/batches">
            Import Batches
          </Link>

          <Link className="nav-btn" to="/activities">
            Normalized Activities
          </Link>
        </div>
      </div>
    </div>
  );
}

function BatchesPage() {
  const [batches, setBatches] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/batches/`);
    const data = await response.json();
    setBatches(data);
  };

  const formatDateTimeIST = (value) =>
    new Date(value).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  const prettyStatus = (value) =>
    value ? value.charAt(0).toUpperCase() + value.slice(1) : "";

  return (
    <div className="App">
      <div className="page-shell">
        <div className="dashboard-title">
          <div className="title-main">Breathe ESG</div>
          <div className="title-sub">Dashboard</div>
        </div>

        <div className="nav-buttons">
          <button onClick={() => navigate("/")}>Home</button>
          <button onClick={() => navigate("/activities")}>
            Normalized Activities
          </button>
        </div>

        <h2>Import Batches</h2>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th className="sl-column">Sl. No.</th>
                <th className="source-column">Source Type</th>
                <th className="file-column">File Name</th>
                <th className="status-column">Status</th>
                <th className="uploaded-at-column">Uploaded At</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((batch, index) => (
                <tr key={batch.id}>
                  <td className="sl-column">{index + 1}</td>
                  <td>{batch.source_type}</td>
                  <td>{batch.file_name}</td>
                  <td>{prettyStatus(batch.status)}</td>
                  <td className="uploaded-at-column">
                    {formatDateTimeIST(batch.uploaded_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ActivitiesPage() {
  const [normalized, setNormalized] = useState([]);
  const [sourceFilter, setSourceFilter] = useState("all");
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [selectedAction, setSelectedAction] = useState("");
  const [reason, setReason] = useState("");
  const [analystId, setAnalystId] = useState("");
  const [analystLocation, setAnalystLocation] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchNormalized();
  }, []);

  const fetchNormalized = async () => {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/normalized/`);
    const data = await response.json();
    setNormalized(data);
  };

  const approveRow = async (id) => {
    await fetch(`/api/approve/${id}/`, {
      method: "POST",
    });
    fetchNormalized();
  };

  const rejectRow = async (id) => {
    await fetch(`/api/reject/${id}/`, {
      method: "POST",
    });
    fetchNormalized();
  };

  const openReasonModal = (id, action) => {
    setSelectedRowId(id);
    setSelectedAction(action);
    setReason("");
    setShowReasonModal(true);
  };

  const submitReview = async () => {
    const endpoint =
      selectedAction === "approved"
        ? `/api/approve/${selectedRowId}/`
        : `/api/reject/${selectedRowId}/`;

    await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reason,
        analyst_id: analystId,
        analyst_location: analystLocation,
      }),
    });

    await fetchNormalized();
    setShowReasonModal(false);
  };

  const prettyStatus = (value) =>
    value ? value.charAt(0).toUpperCase() + value.slice(1) : "";

  const filteredData =
    sourceFilter === "all"
      ? normalized
      : normalized.filter(
          (row) => row.source_type?.toLowerCase() === sourceFilter.toLowerCase()
        );

  return (
    <div className="App">
      <div className="page-shell">
        <div className="dashboard-title">
          <div className="title-main">Breathe ESG</div>
          <div className="title-sub">Dashboard</div>
        </div>

        <div className="nav-buttons">
          <button onClick={() => navigate("/")}>Home</button>
          <button onClick={() => navigate("/batches")}>Import Batches</button>
          <button onClick={() => navigate("/audit-logs")}>Audit Logs</button>
        </div>

        <h2>Normalized Activities</h2>

        <div className="filter-container">
          <label>Filter by Source:</label>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
          >
            <option value="all">All Sources</option>
            <option value="sap">SAP</option>
            <option value="utility">Utility</option>
            <option value="travel">Travel</option>
          </select>
        </div>

        <div className="table-wrap">
          <table className="data-table activities-table">
            <thead>
              <tr>
                <th className="sl-column">Sl. No.</th>
                <th className="status-column">Status</th>
                <th className="source-column">Source</th>
                <th className="date-column">Date</th>
                <th className="category-column">Category</th>
                <th className="qty-column">Quantity</th>
                <th className="unit-column">Unit</th>
                <th className="qty-column">Normalized Qty</th>
                <th className="unit-column">Normalized Unit</th>
                <th className="emissions-column">Emissions</th>
                <th> Scope</th>
                <th className="review-column">Review Status</th>
                <th className="action-column">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.map((row, index) => (
                <tr key={row.id}>
                  <td className="sl-column">{index + 1}</td>

                  <td className="status-column">
                    <span
                      className={
                        row.is_suspicious
                          ? "status-pill suspicious"
                          : "status-pill normal"
                      }
                    >
                      <span className="status-dot"></span>
                      {row.is_suspicious ? "Suspicious" : "Normal"}
                    </span>
                  </td>

                  <td className="source-column">{row.source_type}</td>
                  <td className="date-column">{row.activity_date}</td>
                  <td className="category-column">{row.category}</td>
                  <td className="qty-column">{row.quantity}</td>
                  <td className="unit-column">{row.unit}</td>
                  <td className="qty-column">{row.normalized_quantity}</td>
                  <td className="unit-column">{row.normalized_unit}</td>
                  <td className="emissions-column">{row.emissions}</td>
                  <td>{row.scope}</td>

                  <td className="review-column">
                    <span
                      className={
                        row.review_status === "approved"
                          ? "review-approved"
                          : row.review_status === "rejected"
                          ? "review-rejected"
                          : "review-pending"
                      }
                    >
                      {prettyStatus(row.review_status)}
                    </span>
                  </td>

                  <td className="action-column">
  {row.review_status === "approved" || row.review_status === "rejected" ? (
    <span className="decision-locked">Finalized</span>
  ) : (
    <div className="action-buttons">
      <button
        className="approve-btn"
        onClick={() => openReasonModal(row.id, "approved")}
      >
        👍
      </button>

      <button
        className="reject-btn"
        onClick={() => openReasonModal(row.id, "rejected")}
      >
        👎
      </button>
    </div>
  )}
</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showReasonModal && (
          <div className="modal-overlay">
            <div className="modal-box">
  <h3>
    {selectedAction === "approved"
      ? "Approval Reason"
      : "Rejection Reason"}
  </h3>

  <div className="form-group">
    <label>Analyst Email</label>
    <input
      type="email"
      value={analystId}
      onChange={(e) => setAnalystId(e.target.value)}
      placeholder="Enter analyst email"
    />
  </div>

  <div className="form-group">
    <label>Location</label>
    <input
      type="text"
      value={analystLocation}
      onChange={(e) => setAnalystLocation(e.target.value)}
      placeholder="Enter location"
    />
  </div>

  <div className="form-group">
    <label>Reason</label>
    <textarea
      value={reason}
      onChange={(e) => setReason(e.target.value)}
      placeholder="Enter reason..."
    />
  </div>

  <div className="modal-buttons">
    <button onClick={submitReview}>Submit</button>

    <button onClick={() => setShowReasonModal(false)}>
      Cancel
    </button>
  </div>
</div>
          </div>
        )}
      </div>
    </div>
  );
}

function AuditLogsPage() {
  const [logs, setLogs] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/audit-logs/`)
    const data = await response.json();
    setLogs(data);
  };

  return (
    <div className="App">
      <div className="page-shell">

        <div className="dashboard-title">
          <div className="title-main">Breathe ESG</div>
          <div className="title-sub">Dashboard</div>
        </div>

        <div className="nav-buttons">
          <button onClick={() => navigate("/")}>
            Home
          </button>

          <button onClick={() => navigate("/activities")}>
            Activities
          </button>
        </div>

        <h2>Audit Logs</h2>

        <div className="table-wrap">
          <table className="data-table audit-table">
            <thead>
              <tr>
                <th>Activity ID</th>
                <th className="analyst-column">Analyst</th>
                <th>Location</th>
                <th>Action</th>
                <th className="reason-column">Reason</th>
                <th className="timestamp-column">Timestamp</th>
              </tr>
            </thead>

            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{log.activity}</td>
                  <td>{log.analyst_id}</td>
                  <td>{log.analyst_location}</td>
                  <td>{log.action.charAt(0).toUpperCase() + log.action.slice()}</td>
                  <td>{log.reason}</td>
   <td>
  {new Date(log.created_at).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })}
</td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>

      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/batches" element={<BatchesPage />} />
        <Route path="/activities" element={<ActivitiesPage />} />
        <Route path="/audit-logs" element={<AuditLogsPage />}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;