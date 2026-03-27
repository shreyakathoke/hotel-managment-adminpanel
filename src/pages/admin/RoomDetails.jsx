import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/roomDetails.css";


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

  // ✅ Load room from backend
  useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getRoomById(id);
        const r = data?.room ?? data;

        if (!active) return;

        // ✅ normalize different backend field names
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
          imageUrl: r?.imageUrl ?? r?.image ?? "",
        };

        setRoom(normalized);
      } catch (err) {
        console.error("GET ROOM DETAILS ERROR:", err?.response?.data || err);
        if (!active) return;

        setRoom(null);
        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            "Failed to load room details."
        );
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [id]);

  const statusBadgeClass = useMemo(() => {
    if (!room) return "";
    return room.availability === "available"
      ? "bg-success-subtle text-success"
      : "bg-danger-subtle text-danger";
  }, [room]);

  if (loading) {
    return (
      <div className="container-fluid px-3 px-lg-4 py-4">
        <button className="btn btn-light border" onClick={() => navigate(-1)}>
          Back
        </button>

        <div className="card soft-card p-4 mt-3 text-center">
          <div className="spinner-border" role="status" />
          <div className="mt-3">Loading room details...</div>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="container-fluid px-3 px-lg-4 py-4">
        <button className="btn btn-light border" onClick={() => navigate(-1)}>
          Back
        </button>

        <div className="card soft-card p-4 mt-3">
          <h5 className="fw-bold mb-1">Room not found</h5>
          <div className="text-muted mb-2">No room exists with id: {id}</div>

          {error && (
            <div className="alert alert-danger mb-0" role="alert">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-3 px-lg-4 py-4">
      <div className="d-flex justify-content-between align-items-start gap-2 flex-wrap mb-4">
        <button className="btn btn-light border" onClick={() => navigate(-1)}>
          Back
        </button>

        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-warning"
            onClick={() => navigate(`/admin/rooms/edit/${room.id}`)}
          >
            Edit
          </button>
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
                {room.imageUrl ? (
                  <img src={room.imageUrl} alt="Room" className="rd-img" />
                ) : (
                  <div className="rd-placeholder">No image uploaded</div>
                )}
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
                <Item
                  label="Price / Night"
                  value={room.price ? `₹${room.price}` : "-"}
                />
                <Item
                  label="Capacity"
                  value={room.capacity ? `${room.capacity} guests` : "-"}
                />
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