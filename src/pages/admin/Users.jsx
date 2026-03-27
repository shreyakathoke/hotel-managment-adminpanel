import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/users.css";


function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString();
}

// ✅ robust id getter (works with id/_id/userId/user_id)
function getUserId(u) {
  return u?.id || u?._id || u?.userId || u?.user_id;
}

export default function Users() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const data = await fetchUsers({ search: "" });

        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.users)
          ? data.users
          : Array.isArray(data?.data)
          ? data.data
          : [];

        if (!ignore) setUsers(list);
      } catch (e) {
        if (!ignore) {
          setError(e?.response?.data?.message || e?.message || "Failed to load users.");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;

    return users.filter((u) => {
      const name = String(u?.name || "").toLowerCase();
      const email = String(u?.email || "").toLowerCase();
      const phone = String(u?.phone || "").toLowerCase();
      const idProofType = String(u?.idProofType || u?.id_proof_type || "").toLowerCase();
      const idProofNumber = String(u?.idProofNumber || u?.id_proof_number || "").toLowerCase();

      return (
        name.includes(q) ||
        email.includes(q) ||
        phone.includes(q) ||
        idProofType.includes(q) ||
        idProofNumber.includes(q)
      );
    });
  }, [users, search]);

  const handleDelete = async (id) => {
    if (!id) return;

    const ok = window.confirm("Are you sure you want to delete this user?");
    if (!ok) return;

    try {
      setDeletingId(id);

      // ✅ API call to backend
      await deleteUserApi(id);

      // ✅ UI remove (works for any id key)
      setUsers((prev) => prev.filter((u) => String(getUserId(u)) !== String(id)));
    } catch (e) {
      console.log("DELETE USER ERROR:", e?.response?.data || e);
      alert(e?.response?.data?.message || e?.message || "Failed to delete user.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="container-fluid px-3 px-lg-4 py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1">Users</h3>
          <p className="text-muted mb-0">A list of all the users in your Elite Resort account.</p>
        </div>

        <input
          className="form-control users-search"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 300 }}
        />
      </div>

      {loading && (
        <div className="card soft-card p-4">
          <div className="text-muted">Loading users...</div>
        </div>
      )}

      {!loading && error && (
        <div className="alert alert-danger">
          <b>Error:</b> {error}
        </div>
      )}

      {!loading && !error && (
        <div className="card soft-card">
          <div className="table-responsive">
            <table className="table align-middle mb-0 users-table">
              <thead>
                <tr>
                  <th>
                    <i className="bi bi-person me-2" />
                    Name
                  </th>
                  <th>
                    <i className="bi bi-envelope me-2" />
                    Email
                  </th>
                  <th>
                    <i className="bi bi-telephone me-2" />
                    Phone
                  </th>
                  <th>
                    <i className="bi bi-card-text me-2" />
                    ID Proof
                  </th>
                  <th>
                    <i className="bi bi-calendar me-2" />
                    Created
                  </th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => {
                  const id = getUserId(user);
                  const created = user?.created || user?.createdAt || user?.created_at;

                  const idProofType = user?.idProofType || user?.id_proof_type || "-";
                  const idProofNumber = user?.idProofNumber || user?.id_proof_number || "-";

                  const status = String(user?.status || "active").toLowerCase();

                  return (
                    <tr key={id || Math.random()}>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <div className="user-avatar">
                            <i className="bi bi-person" />
                          </div>
                          <div className="fw-semibold">{user?.name || "-"}</div>
                        </div>
                      </td>

                      <td className="text-muted">{user?.email || "-"}</td>
                      <td className="text-muted">{user?.phone || "-"}</td>

                      <td>
                        <div className="fw-semibold">{idProofType}</div>
                        <div className="text-muted small">{idProofNumber}</div>
                      </td>

                      <td className="text-muted">{formatDate(created)}</td>

                      <td>
                        <span
                          className={`badge rounded-pill px-3 py-2 ${
                            status === "active"
                              ? "bg-success-subtle text-success"
                              : "bg-danger-subtle text-danger"
                          }`}
                        >
                          <i className="bi bi-circle-fill me-2 small" />
                          {status === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="text-end">
                        <button
                          className="btn btn-light btn-sm me-2 btn-action-view"
                          onClick={() => navigate(`/admin/users/${id}`)}
                          disabled={!id}
                        >
                          <i className="bi bi-eye me-1" />
                          View
                        </button>

                        <button
                          className="btn btn-light btn-sm btn-action-delete"
                          onClick={() => handleDelete(id)}
                          disabled={!id || deletingId === id}
                        >
                          <i className="bi bi-trash me-1 text-danger" />
                          <span className="text-danger">
                            {deletingId === id ? "Deleting..." : "Delete"}
                          </span>
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-muted">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}