// src/pages/admin/Bookings.jsx
import { useEffect, useMemo, useState } from "react";
import "../../styles/bookings.css";
import { adminGetBookings, cancelPayment } from "../../api/adminApi";

// ================= HELPERS =================
function safe(v, fallback = "-") {
  return v === null || v === undefined || v === "" ? fallback : v;
}

function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString();
}

function formatMoney(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "-";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n);
}

function nightsBetween(checkIn, checkOut) {
  const a = new Date(checkIn);
  const b = new Date(checkOut);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return "-";
  const ms = b.getTime() - a.getTime();
  const nights = Math.ceil(ms / (1000 * 60 * 60 * 24));
  return nights > 0 ? nights : "-";
}

function Badge({ value, kind }) {
  const text = String(value || "").toUpperCase();

  const cls =
    kind === "payment"
      ? text === "SUCCESS"
        ? "bg-success-subtle text-success"
        : text === "PENDING"
        ? "bg-warning-subtle text-warning"
        : "bg-danger-subtle text-danger"
      : text === "CONFIRMED"
      ? "bg-success-subtle text-success"
      : text === "PENDING"
      ? "bg-warning-subtle text-warning"
      : text === "CANCELLED"
      ? "bg-danger-subtle text-danger"
      : "bg-secondary-subtle text-secondary";

  return (
    <span className={`badge rounded-pill px-3 py-2 ${cls}`}>
      <i className="bi bi-circle-fill me-2 small" />
      {text || "-"}
    </span>
  );
}

// ================= MAIN COMPONENT =================
export default function Bookings({ email }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [payFilter, setPayFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  // Fetch bookings
  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await adminGetBookings(email || "");
        const list = Array.isArray(data) ? data : Array.isArray(data?.bookings) ? data.bookings : Array.isArray(data?.data) ? data.data : [];
        if (!ignore) setBookings(list);
      } catch (err) {
        if (!ignore) setError(err?.message || "Failed to load bookings.");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => (ignore = true);
  }, [email]);

  // Filter bookings
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return bookings.filter((b) => {
      const bookingStatus = String(b?.bookingStatus || "").toUpperCase();
      const paymentStatus = String(b?.paymentStatus || "").toUpperCase();
      if (statusFilter !== "all" && bookingStatus !== statusFilter) return false;
      if (payFilter !== "all" && paymentStatus !== payFilter) return false;

      if (!query) return true;

      const hay = [
        b?.bookingId,
        b?.userName,
        b?.userEmail,
        b?.phone,
        b?.roomNumber,
        b?.roomType,
        b?.paymentId,
        b?.paymentMethod,
        b?.idProof,
      ].map((x) => String(x || "").toLowerCase()).join(" ");

      return hay.includes(query);
    });
  }, [bookings, q, statusFilter, payFilter]);

  // KPIs
  const kpis = useMemo(() => {
    const total = bookings.length;
    const confirmed = bookings.filter((b) => String(b?.bookingStatus).toUpperCase() === "CONFIRMED").length;
    const pending = bookings.filter((b) => String(b?.bookingStatus).toUpperCase() === "PENDING").length;
    const successPay = bookings.filter((b) => String(b?.paymentStatus).toUpperCase() === "SUCCESS").length;
    return { total, confirmed, pending, successPay };
  }, [bookings]);

  // Cancel payment
  const handleCancelPayment = async (paymentId) => {
    if (!window.confirm("Are you sure you want to cancel this payment?")) return;
    try {
      await cancelPayment(paymentId);
      setBookings((prev) => prev.map((b) => (b.paymentId === paymentId ? { ...b, paymentStatus: "FAILED" } : b)));
      alert("Payment cancelled successfully.");
    } catch (err) {
      alert("Failed to cancel payment.");
    }
  };

  return (
    <div className="container-fluid px-3 px-lg-4 py-4 bookings-page">
      {/* Header & Filters */}
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1">Bookings</h3>
          <div className="text-muted mb-0">All bookings with guest and payment details.</div>
        </div>
        <div className="d-flex flex-column flex-sm-row gap-2">
          <input className="form-control bookings-search" placeholder="Search by name, email, room, payment id..." value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ minWidth: 180 }}>
            <option value="all">All Booking Status</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="PENDING">PENDING</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
          <select className="form-select" value={payFilter} onChange={(e) => setPayFilter(e.target.value)} style={{ minWidth: 170 }}>
            <option value="all">All Payment</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="PENDING">PENDING</option>
            <option value="FAILED">FAILED</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6 col-xl-3"><div className="card soft-card p-3"><div className="text-muted small">Total Bookings</div><div className="kpi-value">{kpis.total}</div></div></div>
        <div className="col-12 col-md-6 col-xl-3"><div className="card soft-card p-3"><div className="text-muted small">Confirmed</div><div className="kpi-value">{kpis.confirmed}</div></div></div>
        <div className="col-12 col-md-6 col-xl-3"><div className="card soft-card p-3"><div className="text-muted small">Pending</div><div className="kpi-value">{kpis.pending}</div></div></div>
        <div className="col-12 col-md-6 col-xl-3"><div className="card soft-card p-3"><div className="text-muted small">Payments Success</div><div className="kpi-value">{kpis.successPay}</div></div></div>
      </div>

      {/* Loading / Error / Table */}
      {loading && <div className="card soft-card p-4"><div className="text-muted">Loading bookings...</div></div>}
      {!loading && error && <div className="alert alert-danger"><b>Error:</b> {error}</div>}

      {!loading && !error && (
        <div className="card soft-card">
          <div className="table-responsive">
            <table className="table align-middle mb-0 bookings-table">
              <thead>
                <tr>
                  <th>Booking</th>
                  <th>Dates</th>
                  <th>Guest</th>
                  <th>Room</th>
                  <th>Total</th>
                  <th>Booking Status</th>
                  <th>Payment</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b?.bookingId || Math.random()}>
                    <td><div className="fw-semibold">{safe(b?.bookingId)}</div><div className="text-muted small">Payment ID: {safe(b?.paymentId)}</div></td>
                    <td><div className="fw-semibold">{safe(b?.checkIn)} → {safe(b?.checkOut)}</div><div className="text-muted small">Nights: {nightsBetween(b?.checkIn, b?.checkOut)}</div></td>
                    <td><div className="fw-semibold">{safe(b?.userName)}</div><div className="text-muted small">{safe(b?.userEmail)}</div><div className="text-muted small">{safe(b?.phone)}</div></td>
                    <td><div className="fw-semibold">Room {safe(b?.roomNumber)}</div><div className="text-muted small">{safe(b?.roomType)}</div></td>
                    <td className="fw-semibold">{formatMoney(b?.totalAmount)}</td>
                    <td><Badge value={b?.bookingStatus} kind="booking" /></td>
                    <td>
                      <div className="d-flex flex-column gap-1">
                        <Badge value={b?.paymentStatus} kind="payment" />
                        <div className="text-muted small">{safe(b?.paymentMethod)} • {formatDate(b?.paymentDate)}</div>
                      </div>
                    </td>
                    <td className="text-end">
                      <button className="btn btn-light btn-sm me-1" onClick={() => setSelected(b)}><i className="bi bi-eye me-1" />View</button>
                      {b?.paymentStatus === "PENDING" && (
                        <button className="btn btn-outline-danger btn-sm" onClick={() => handleCancelPayment(b.paymentId)}>Cancel Payment</button>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={8} className="text-center py-4 text-muted">No bookings found.</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="p-3 text-muted small">Showing <b>{filtered.length}</b> of <b>{bookings.length}</b> bookings</div>
        </div>
      )}

      {/* Modal */}
      {selected && (
        <div className="modal-backdrop-custom" onClick={() => setSelected(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-card-header d-flex justify-content-between align-items-center">
              <div><div className="fw-bold">Booking Details</div><div className="text-muted small">{safe(selected.bookingId)}</div></div>
              <button className="btn btn-light btn-sm" onClick={() => setSelected(null)}><i className="bi bi-x-lg" /></button>
            </div>
            <div className="modal-card-body">
              <div className="row g-3">
                <div className="col-12 col-md-6"><div className="detail-box"><div className="detail-label">Guest</div><div className="detail-value">{safe(selected.userName)}</div><div className="text-muted small">{safe(selected.userEmail)}</div><div className="text-muted small">{safe(selected.phone)}</div></div></div>
                <div className="col-12 col-md-6"><div className="detail-box"><div className="detail-label">Address / ID Proof</div><div className="detail-value">{safe(selected.address)}</div><div className="text-muted small">{safe(selected.idProof)}</div></div></div>
                <div className="col-12 col-md-6"><div className="detail-box"><div className="detail-label">Dates</div><div className="detail-value">{safe(selected.checkIn)} → {safe(selected.checkOut)}</div><div className="text-muted small">Nights: {nightsBetween(selected.checkIn, selected.checkOut)}</div></div></div>
                <div className="col-12 col-md-6"><div className="detail-box"><div className="detail-label">Room</div><div className="detail-value">Room {safe(selected.roomNumber)} • {safe(selected.roomType)}</div></div></div>
                <div className="col-12 col-md-6"><div className="detail-box"><div className="detail-label">Booking</div><div className="detail-value">{formatMoney(selected.totalAmount)}</div><div className="mt-2"><Badge value={selected.bookingStatus} kind="booking" /></div></div></div>
                <div className="col-12 col-md-6"><div className="detail-box"><div className="detail-label">Payment</div><div className="detail-value">{safe(selected.paymentMethod)}</div><div className="text-muted small">Payment ID: {safe(selected.paymentId)}</div><div className="text-muted small">Date: {formatDate(selected.paymentDate)}</div><div className="mt-2"><Badge value={selected.paymentStatus} kind="payment" /></div></div></div>
              </div>
            </div>
            <div className="modal-card-footer text-end"><button className="btn btn-outline-secondary" onClick={() => setSelected(null)}>Close</button></div>
          </div>
        </div>
      )}
    </div>
  );
}