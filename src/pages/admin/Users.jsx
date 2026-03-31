import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/users.css";
import { getAllUsers, deleteUser } from "../../api/adminApi";

// ================= HELPERS =================
function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString();
}

function getUserId(u) {
  return u?.email;
}

// ================= COMPONENT =================
export default function Users() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  // ================= LOAD USERS =================
  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const data = await getAllUsers();
        console.log("USERS API:", data);

        // ✅ SAFE handling of API response
        const usersArray =
          Array.isArray(data)
            ? data
            : Array.isArray(data?.users)
            ? data.users
            : [];

        if (!ignore) setUsers(usersArray);
      } catch (e) {
        console.log("LOAD USERS ERROR:", e);
        if (!ignore) setError(e?.message || "Failed to load users.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, []);

  // ================= FILTER USERS =================
  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;

    return users.filter((u) => {
      const name = String(u?.name || "").toLowerCase();
      const email = String(u?.email || "").toLowerCase();
      const phone = String(u?.phone || "").toLowerCase();
      const idProofType = String(
        u?.idProofType || u?.id_proof_type || ""
      ).toLowerCase();
      const idProofNumber = String(
        u?.idProofNumber || u?.id_proof_number || ""
      ).toLowerCase();

      return (
        name.includes(q) ||
        email.includes(q) ||
        phone.includes(q) ||
        idProofType.includes(q) ||
        idProofNumber.includes(q)
      );
    });
  }, [users, search]);

  // ================= DELETE USER =================
  const handleDelete = async (id) => {
    if (!id) return;

    const ok = window.confirm("Are you sure you want to delete this user?");
    if (!ok) return;

    try {
      setDeletingId(id);

      await deleteUser(id);

      // ✅ Remove from UI instantly
      setUsers((prev) => prev.filter((u) => getUserId(u) !== id));
    } catch (e) {
      console.log("DELETE USER ERROR:", e);
      alert(e?.message || "Failed to delete user.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="container-fluid px-3 px-lg-4 py-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1">Users</h3>
          <p className="text-muted mb-0">
            A list of all the users in your Elite Resort account.
          </p>
        </div>

        <input
          className="form-control users-search"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 300 }}
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="card soft-card p-4 text-muted">
          Loading users...
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="alert alert-danger">
          <b>Error:</b> {error}
        </div>
      )}

      {/* Users Table */}
      {!loading && !error && (
        <div className="card soft-card">
          <div className="table-responsive">
            <table className="table align-middle mb-0 users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>ID Proof</th>
                  <th>Created</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center text-muted py-4">
                      No users found.
                    </td>
                  </tr>
                )}

                {filteredUsers.map((user) => {
                  const id = getUserId(user);

                  const created =
                    user?.created ||
                    user?.createdAt ||
                    user?.created_at;

                  const idProofType =
                    user?.idProofType ||
                    user?.id_proof_type ||
                    "-";

                  const idProofNumber =
                    user?.idProofNumber ||
                    user?.id_proof_number ||
                    "-";

                  const status = String(
                    user?.status || "active"
                  ).toLowerCase();

                  return (
                    <tr key={id}>
                      <td>{user?.name || "-"}</td>
                      <td>{user?.email || "-"}</td>
                      <td>{user?.phone || "-"}</td>

                      <td>
                        {idProofType}
                        <br />
                        <small className="text-muted">
                          {idProofNumber}
                        </small>
                      </td>

                      <td>{formatDate(created)}</td>
                      <td>{status}</td>

                      <td className="text-end">
                        <button
                          className="btn btn-light btn-sm me-2"
                          onClick={() =>
                            navigate(`/admin/users/${id}`)
                          }
                        >
                          View
                        </button>

                        <button
                          className="btn btn-light btn-sm text-danger"
                          onClick={() => handleDelete(id)}
                          disabled={deletingId === id}
                        >
                          {deletingId === id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}