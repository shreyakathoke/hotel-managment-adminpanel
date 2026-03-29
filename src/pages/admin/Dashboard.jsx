import { useEffect, useMemo, useState } from "react";
import "../../styles/dashboard.css";

import { getRooms, adminFetchContacts } from "../../api/adminApi"; // correct imports

/** Helpers */
function normalizeText(s) {
  return (s || "").trim().replace(/\s+/g, " ").toLowerCase();
}

function groupCount(list, keyFn) {
  const map = new Map();
  for (const item of list) {
    const key = keyFn(item) || "unknown";
    map.set(key, (map.get(key) || 0) + 1);
  }
  return Array.from(map.entries()).map(([label, value]) => ({ label, value }));
}

/** UI Components */
function MetricCard({ title, value, icon, iconBg, iconColor }) {
  return (
    <div className="col-12 col-sm-6 col-xl-3">
      <div className="card metric-card h-100">
        <div className="card-body d-flex align-items-center gap-3">
          <div className={`metric-icon ${iconBg} ${iconColor}`}>
            <i className={`bi ${icon}`} />
          </div>
          <div className="flex-grow-1">
            <div className="metric-title">{title}</div>
            <div className="metric-value">{value}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BarList({ title, items }) {
  const max = useMemo(() => Math.max(1, ...items.map((i) => i.value)), [items]);

  return (
    <div className="card soft-card h-100">
      <div className="card-header soft-card-header d-flex align-items-center gap-2">
        <span className="soft-card-badge">
          <i className="bi bi-graph-up-arrow" />
        </span>
        <span className="soft-card-title">{title}</span>
      </div>

      <div className="card-body">
        <div className="barlist">
          {items.map((row) => {
            const pct = Math.round((row.value / max) * 100);
            return (
              <div className="barrow" key={row.label}>
                <div className="barrow-label">{row.label}</div>
                <div className="barrow-track">
                  <div className="barrow-fill bg-primary" style={{ width: `${pct}%` }} />
                </div>
                <div className="barrow-value">{row.value}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState([]);
  const [profiles, setProfiles] = useState([]); // using contacts as profiles
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError("");

        // fetch rooms and contacts in parallel
        const [roomsData, contactsData] = await Promise.all([
          getRooms(),
          adminFetchContacts(),
        ]);

        if (!mounted) return;

        setRooms(Array.isArray(roomsData) ? roomsData : []);
        setProfiles(Array.isArray(contactsData) ? contactsData : []);
      } catch (err) {
        console.log("DASHBOARD FETCH ERROR:", err?.response?.data || err);

        const msg =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to load dashboard data";

        if (mounted) setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  /** KPI Metrics */
  const metrics = useMemo(() => {
    const totalUsers = profiles.length;
    const totalRooms = rooms.length;
    const activeRooms = rooms.filter((r) => r?.available === true).length;
    const inactiveRooms = totalRooms - activeRooms;

    return { totalUsers, totalRooms, activeRooms, inactiveRooms };
  }, [profiles, rooms]);

  /** Rooms by Category */
  const roomsByCategory = useMemo(() => {
    return groupCount(rooms, (r) => normalizeText(r?.type));
  }, [rooms]);

  /** Users by City */
  const usersByCity = useMemo(() => {
    return groupCount(profiles, (p) => {
      if (p?.city) return normalizeText(p.city);
      const addr = (p?.address || "").trim();
      if (!addr) return "unknown";
      const guess = addr.split(",")[0];
      return normalizeText(guess);
    });
  }, [profiles]);

  /** Active Rooms Table */
  const activeRoomsList = useMemo(() => {
    return rooms
      .filter((r) => r?.available === true)
      .map((r) => ({
        name: `Room ${r?.roomNumber || "-"} • ${r?.type || "Unknown"}`,
        rooms: 1,
        price: Number(r?.pricePerNight || 0),
      }));
  }, [rooms]);

  if (loading) {
    return (
      <div className="container-fluid px-3 px-lg-4 py-4 dashboard-wrap">
        <h2 className="page-title mb-4">Dashboard</h2>
        <div className="card soft-card p-4">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-3 px-lg-4 py-4 dashboard-wrap">
      <h2 className="page-title mb-4">Dashboard</h2>

      {error && <div className="alert alert-danger mb-4">{error}</div>}

      {/* KPI */}
      <div className="row g-3 g-lg-4 mb-4">
        <MetricCard
          title="Total Users"
          value={metrics.totalUsers}
          icon="bi-people"
          iconBg="bg-primary-subtle"
          iconColor="text-primary"
        />
        <MetricCard
          title="Total Rooms"
          value={metrics.totalRooms}
          icon="bi-building"
          iconBg="bg-success-subtle"
          iconColor="text-success"
        />
        <MetricCard
          title="Active Rooms"
          value={metrics.activeRooms}
          icon="bi-check-circle"
          iconBg="bg-info-subtle"
          iconColor="text-info"
        />
        <MetricCard
          title="Inactive Rooms"
          value={metrics.inactiveRooms}
          icon="bi-x-circle"
          iconBg="bg-danger-subtle"
          iconColor="text-danger"
        />
      </div>

      {/* Charts */}
      <div className="row g-3 g-lg-4 mb-4">
        <div className="col-12 col-lg-6">
          <BarList title="Rooms by Category" items={roomsByCategory} />
        </div>
        <div className="col-12 col-lg-6">
          <BarList title="Users by City" items={usersByCity} />
        </div>
      </div>

      {/* Active Rooms Table */}
      <div className="card soft-card">
        <div className="card-header soft-card-header">
          <h5 className="fw-bold mb-0">Active Rooms</h5>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0 table-soft">
            <thead>
              <tr>
                <th>Resort</th>
                <th className="text-end">Rooms</th>
                <th className="text-end">Price From</th>
              </tr>
            </thead>

            <tbody>
              {activeRoomsList.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-4 text-muted">
                    No active rooms found
                  </td>
                </tr>
              ) : (
                activeRoomsList.map((r, index) => (
                  <tr key={index}>
                    <td>{r.name}</td>
                    <td className="text-end">{r.rooms}</td>
                    <td className="text-end fw-semibold">₹{r.price.toLocaleString("en-IN")}</td>
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