import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/users.css";

import { fetchUserByEmail, deleteUserApi } from "../../api/adminApi";

/** Helpers */
function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString();
}

// Robust ID getter
function getUserId(u) {
  return u?.email; // email is unique
}

// **Replace this with your actual list of users' emails**
const USER_EMAILS = [
  "user1@example.com",
  "user2@example.com",
  "user3@example.com",
];

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

        // fetch users one by one
        const promises = USER_EMAILS.map((email) =>
          fetchUserByEmail(email).catch((e) => null)
        );
        const results = await Promise.all(promises);

        const list = results.filter((u) => u !== null);

        if (!ignore) setUsers(list);
      } catch (e) {
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
      await deleteUserApi(id);
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
                {filteredUsers.map((user) => {
                  const id = getUserId(user);
                  const created = user?.created || user?.createdAt || user?.created_at;
                  const idProofType = user?.idProofType || user?.id_proof_type || "-";
                  const idProofNumber = user?.idProofNumber || user?.id_proof_number || "-";
                  const status = String(user?.status || "active").toLowerCase();

                  return (
                    <tr key={id}>
                      <td>{user?.name || "-"}</td>
                      <td>{user?.email || "-"}</td>
                      <td>{user?.phone || "-"}</td>
                      <td>
                        {idProofType}
                        <br />
                        <small className="text-muted">{idProofNumber}</small>
                      </td>
                      <td>{formatDate(created)}</td>
                      <td>{status}</td>
                      <td className="text-end">
                        <button
                          className="btn btn-light btn-sm me-2"
                          onClick={() => navigate(`/admin/users/${id}`)}
                        >
                          View
                        </button>
                        <button
                          className="btn btn-light btn-sm text-danger"
                          onClick={() => handleDelete(id)}
                          disabled={deletingId === id}
                        >
                          {deletingId === id ? "Deleting..." : "Delete"}
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center text-muted py-4">
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