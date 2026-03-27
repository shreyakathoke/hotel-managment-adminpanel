import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../../styles/rooms.css";

export default function Rooms() {
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyDeleteId, setBusyDeleteId] = useState(null);
  const [error, setError] = useState("");

  // ✅ normalize room id (backend may return roomId/_id/id)
  function getRoomKey(room) {
    return room?.roomId || room?._id || room?.id;
  }

  // ✅ normalize room fields
  function mapRoom(room) {
    return {
      key: getRoomKey(room),
      roomNumber: room?.roomNumber ?? room?.number ?? room?.roomNo ?? "",
      type: room?.type ?? room?.roomType ?? "",
      available:
        typeof room?.available === "boolean"
          ? room.available
          : room?.availability
          ? String(room.availability).toLowerCase() === "available"
          : true,
      raw: room,
    };
  }

  async function loadRooms({ silent = false } = {}) {
    if (!silent) setLoading(true);
    setError("");

    try {
      const data = await getAdminRooms();
      const list = Array.isArray(data) ? data : data?.rooms || [];
      setRooms(list.map(mapRoom));
    } catch (e) {
      console.error("GET ROOMS ERROR:", e);
      setError(
        e?.response?.data?.message ||
          e?.response?.data?.error ||
          "Failed to load rooms. Check API route /api/admin/rooms and token."
      );
      setRooms([]);
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    loadRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredRooms = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rooms;

    return rooms.filter((r) => {
      const rn = String(r.roomNumber).toLowerCase();
      const t = String(r.type).toLowerCase();
      return rn.includes(s) || t.includes(s);
    });
  }, [rooms, q]);

  async function onRefresh() {
    setRefreshing(true);
    await loadRooms({ silent: true });
    setRefreshing(false);
  }

  async function onDelete(roomKey) {
    const ok = window.confirm("Are you sure you want to delete this room?");
    if (!ok) return;

    setBusyDeleteId(roomKey);
    try {
      await deleteAdminRoom(roomKey); // ✅ FIXED
      setRooms((prev) => prev.filter((r) => r.key !== roomKey)); // ✅ instant UI update
    } catch (e) {
      console.error("DELETE ROOM ERROR:", e);
      alert(
        e?.response?.data?.message ||
          e?.response?.data?.error ||
          "Failed to delete room."
      );
    } finally {
      setBusyDeleteId(null);
    }
  }

  return (
    <div className="container-fluid px-3 px-lg-4 py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h3 className="fw-bold mb-1">Room Management</h3>
          <p className="text-muted mb-0">
            Manage all resort rooms and availability status.
          </p>
        </div>

        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary rounded-3"
            onClick={onRefresh}
            disabled={refreshing}
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>

          <button
            className="btn btn-primary rounded-3"
            onClick={() => navigate("/admin/rooms/add")}
          >
            Add Room
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-3 d-flex flex-wrap gap-2">
        <input
          className="form-control"
          style={{ maxWidth: 360 }}
          placeholder="Search by room number or type..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {q && (
          <button className="btn btn-outline-secondary" onClick={() => setQ("")}>
            Clear
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-danger">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Room No</th>
                <th>Room Type</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-5">
                    <div className="spinner-border" role="status" />
                    <div className="mt-2 text-muted">Loading rooms...</div>
                  </td>
                </tr>
              ) : filteredRooms.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-muted">
                    No rooms available.
                  </td>
                </tr>
              ) : (
                filteredRooms.map((room) => (
                  <tr key={room.key}>
                    <td className="fw-semibold">#{room.roomNumber || room.key}</td>
                    <td>{room.type || "—"}</td>

                    <td>
                      <span className={`badge ${room.available ? "bg-success" : "bg-danger"}`}>
                        {room.available ? "Available" : "Not Available"}
                      </span>
                    </td>

                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-2 flex-wrap">
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => navigate(`/admin/rooms/${room.key}`)}
                        >
                          View
                        </button>

                        <button
                          className="btn btn-outline-warning btn-sm"
                          onClick={() => navigate(`/admin/rooms/edit/${room.key}`)}
                        >
                          Edit
                        </button>

                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => onDelete(room.key)}
                          disabled={busyDeleteId === room.key}
                        >
                          {busyDeleteId === room.key ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}