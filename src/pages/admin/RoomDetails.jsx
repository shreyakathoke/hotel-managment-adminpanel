// src/pages/admin/RoomDetails.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/roomDetails.css";
import { getRoomById } from "../../api/adminApi"; 

// ✅ Your backend URL
const BACKEND_URL = "https://hotel-managment-backend-production.up.railway.app";

// Fallback image in case room has no image
const FALLBACK_IMAGE = "/default-room.png"; // put a default image in /public folder

function Item({ label, value }) {
  return (
    <div className="col-12 col-md-6">
      <div className="rd-item">
        <div className="rd-label">{label}</div>
        <div className="rd-value">{value || "-"}</div>
      </div>
    </div>
  );
}

export default function RoomDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ================= LOAD ROOM =================
  useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getRoomById(id);
        const r = data?.room ?? data;

        if (!active) return;

        // Normalize room data
        const normalized = {
          id: r?.roomId || r?._id || r?.id || id,
          roomNo: r?.roomNumber ?? r?.roomNo ?? r?.number ?? "",
          roomType: r?.type ?? r?.roomType ?? "",
          price: r?.pricePerNight ?? r?.price ?? "",
          capacity: r?.capacity ?? "",
          availability:
            typeof r?.available === "boolean"
              ? r.available
                ? "available"
                : "unavailable"
              : r?.availability
              ? String(r.availability).toLowerCase()
              : "available",
          description: r?.description ?? "",
          // Handle single image or array of images
          imageUrl:
            r?.imageUrl ??
            r?.image ??
            (Array.isArray(r?.images) && r?.images[0]) ??
            "",
        };

        setRoom(normalized);
      } catch (err) {
        console.error("GET ROOM DETAILS ERROR:", err);
        if (!active) return;
        setRoom(null);
        setError("Failed to load room details.");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [id]);

  // ================= STATUS BADGE =================
  const statusBadgeClass = useMemo(() => {
    if (!room) return "";
    return room.availability === "available"
      ? "bg-success-subtle text-success"
      : "bg-danger-subtle text-danger";
  }, [room]);

  // ================= IMAGE URL HELPER =================
  const getImageUrl = (url) => {
    if (!url) return FALLBACK_IMAGE; // fallback
    if (url.startsWith("http") || url.startsWith("https")) return url;
    return `${BACKEND_URL}/uploads/${url}`;
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="container-fluid px-3 px-lg-4 py-4">
        <button className="btn btn-light border" onClick={() => navigate(-1)}>Back</button>
        <div className="card soft-card p-4 mt-3 text-center">
          <div className="spinner-border" role="status" />
          <div className="mt-3">Loading room details...</div>
        </div>
      </div>
    );
  }

  // ================= ROOM NOT FOUND =================
  if (!room) {
    return (
      <div className="container-fluid px-3 px-lg-4 py-4">
        <button className="btn btn-light border" onClick={() => navigate(-1)}>Back</button>
        <div className="card soft-card p-4 mt-3">
          <h5 className="fw-bold mb-1">Room not found</h5>
          <div className="text-muted mb-2">No room exists with id: {id}</div>
          {error && <div className="alert alert-danger mb-0">{error}</div>}
        </div>
      </div>
    );
  }

  // ================= ROOM DETAILS =================
  return (
    <div className="container-fluid px-3 px-lg-4 py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-start gap-2 flex-wrap mb-4">
        <button className="btn btn-light border" onClick={() => navigate(-1)}>Back</button>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-warning" onClick={() => navigate(`/admin/rooms/edit/${room.id}`)}>Edit</button>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
        <div>
          <h3 className="fw-bold mb-1">Room Details</h3>
          <div className="text-muted">All room information & preview.</div>
        </div>
        <span className={`badge rounded-pill px-3 py-2 ${statusBadgeClass}`}>
          {room.availability === "available" ? "Available" : "Unavailable"}
        </span>
      </div>

      <div className="row g-4">
        {/* Image */}
        <div className="col-12 col-lg-5">
          <div className="card soft-card">
            <div className="card-header soft-card-header fw-bold">Room Image</div>
            <div className="card-body">
              <div className="rd-imgWrap">
                <img
                  src={getImageUrl(room.imageUrl)}
                  alt="Room"
                  className="rd-img"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="col-12 col-lg-7">
          <div className="card soft-card mb-4">
            <div className="card-header soft-card-header fw-bold">Room Information</div>
            <div className="card-body">
              <div className="row g-3">
                <Item label="Room No" value={room.roomNo ? `#${room.roomNo}` : "-"} />
                <Item label="Room Type" value={room.roomType} />
                <Item label="Price / Night" value={room.price ? `₹${room.price}` : "-"} />
                <Item label="Capacity" value={room.capacity ? `${room.capacity} guests` : "-"} />
              </div>
            </div>
          </div>

          <div className="card soft-card">
            <div className="card-header soft-card-header fw-bold">Description</div>
            <div className="card-body">
              <div className="rd-desc">{room.description || "-"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}