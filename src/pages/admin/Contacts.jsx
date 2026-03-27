import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";


function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function mapContact(c) {
  return {
    id: c?._id || c?.id || c?.contactId,
    user: c?.user || c?.name || c?.fullName || "-",
    email: c?.email || "-",
    phone: c?.phone || c?.mobile || "-",
    subject: c?.subject || c?.queryType || c?.topic || "Other",
    message: c?.message || c?.query || c?.msg || "-",
    date: c?.date || c?.createdAt || c?.created_at || "",
  };
}

function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString();
}

export default function Contacts() {
  const navigate = useNavigate();

  // ✅ only from storage (no hardcode)
  const adminId = localStorage.getItem("admin_id") || localStorage.getItem("adminId");

  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  const pageSize = 5;

  // ✅ Load contacts
  useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        setLoading(true);
        setError("");

        // ✅ adminFetchContacts can be implemented as /admin/all OR /admin/:adminId
        // if your contactsApi.js expects adminId, pass it.
        const data = await adminFetchContacts(adminId);

        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.contacts)
          ? data.contacts
          : Array.isArray(data?.data)
          ? data.data
          : [];

        const mapped = list.map(mapContact);

        if (!ignore) setContacts(mapped);
      } catch (e) {
        if (!ignore) {
          console.log("CONTACTS API ERROR STATUS:", e?.response?.status);
          console.log("CONTACTS API ERROR BODY:", e?.response?.data);
          setError(
            e?.response?.data?.message ||
              e?.response?.data?.error ||
              `Failed to load contacts (HTTP ${e?.response?.status || "?"}).`
          );
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [adminId]);

  // ✅ Search filter
  const filteredContacts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return contacts;

    return contacts.filter((c) => {
      return (
        String(c.user).toLowerCase().includes(q) ||
        String(c.email).toLowerCase().includes(q) ||
        String(c.phone).toLowerCase().includes(q) ||
        String(c.subject).toLowerCase().includes(q) ||
        String(c.message).toLowerCase().includes(q)
      );
    });
  }, [contacts, search]);

  const total = filteredContacts.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = clamp(page, 1, totalPages);

  // ✅ Pagination
  const paginatedContacts = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredContacts.slice(start, start + pageSize);
  }, [filteredContacts, safePage]);

  const showingFrom = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const showingTo = Math.min(total, safePage * pageSize);

  const goToPage = (p) => setPage(clamp(p, 1, totalPages));

  const visiblePages = useMemo(() => {
    const maxButtons = 5;
    let start = Math.max(1, safePage - Math.floor(maxButtons / 2));
    let end = start + maxButtons - 1;
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxButtons + 1);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [safePage, totalPages]);

  // ✅ Delete
  const deleteContact = async (id) => {
    const ok = window.confirm("Delete this contact?");
    if (!ok) return;

    try {
      setDeletingId(id);
      await adminDeleteContact(id);
      setContacts((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      alert(
        e?.response?.data?.message ||
          e?.response?.data?.error ||
          e?.message ||
          "Failed to delete contact."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="container-fluid px-3 px-lg-4 py-4">
      {/* Header */}
      <div className="contacts-header mb-4">
        <div>
          <h3 className="fw-bold d-flex align-items-center gap-2 mb-1">
            <i className="bi bi-chat-dots text-primary" />
            Contact Inquiries
          </h3>
          <p className="text-muted mb-0">Manage all contact form submissions from users.</p>
        </div>

        <div className="contacts-meta">
          <span className="badge text-bg-light border">
            Total: <b>{total}</b>
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="card soft-card p-3 mb-4">
        <input
          type="text"
          className="form-control contact-search"
          placeholder="Search by name, email, phone, subject..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {/* States */}
      {loading && (
        <div className="card soft-card p-4">
          <div className="text-muted">Loading contacts...</div>
        </div>
      )}

      {!loading && error && (
        <div className="alert alert-danger">
          <b>Error:</b> {error}
        </div>
      )}

      {!loading && !error && (
        <div className="card soft-card">
          <div className="card-header soft-card-header d-flex flex-column flex-md-row justify-content-between gap-2">
            <h5 className="fw-bold mb-0">
              <i className="bi bi-chat-left-text me-2 text-primary" />
              Contact Submissions
            </h5>

            <div className="small text-muted">
              Showing <b>{showingFrom}</b>–<b>{showingTo}</b> of <b>{total}</b>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table align-middle mb-0 contact-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Subject</th>
                  <th>Message</th>
                  <th>Send Date</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>

              <tbody>
                {paginatedContacts.map((contact) => (
                  <tr key={contact.id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div className="user-avatar">
                          <i className="bi bi-person" />
                        </div>
                        <div className="fw-semibold">{contact.user}</div>
                      </div>
                    </td>

                    <td className="text-muted">{contact.email}</td>
                    <td className="text-muted">{contact.phone}</td>

                    <td>
                      <span className="badge bg-primary-subtle text-primary">
                        {contact.subject}
                      </span>
                    </td>

                    <td className="text-truncate" style={{ maxWidth: 260 }}>
                      {contact.message}
                    </td>

                    <td className="text-muted">{formatDate(contact.date)}</td>

                    <td className="text-end">
                      <button
                        className="btn btn-light btn-sm me-2 contact-action"
                        onClick={() => navigate(`/admin/contacts/${contact.id}`)}
                        title="View"
                      >
                        <i className="bi bi-eye text-primary" />
                      </button>

                      <button
                        className="btn btn-light btn-sm contact-action"
                        onClick={() => deleteContact(contact.id)}
                        title="Delete"
                        disabled={deletingId === contact.id}
                      >
                        <i className="bi bi-trash text-danger" />
                        {deletingId === contact.id ? " Deleting..." : ""}
                      </button>
                    </td>
                  </tr>
                ))}

                {total === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-muted">
                      No contact submissions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="card-footer bg-white border-0">
            <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-2">
              <div className="small text-muted">
                Page <b>{safePage}</b> of <b>{totalPages}</b>
              </div>

              <nav aria-label="Contacts pagination">
                <ul className="pagination pagination-sm mb-0 contacts-pagination">
                  <li className={`page-item ${safePage === 1 ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => goToPage(safePage - 1)}>
                      Prev
                    </button>
                  </li>

                  {visiblePages.map((p) => (
                    <li key={p} className={`page-item ${p === safePage ? "active" : ""}`}>
                      <button className="page-link" onClick={() => goToPage(p)}>
                        {p}
                      </button>
                    </li>
                  ))}

                  <li className={`page-item ${safePage === totalPages ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => goToPage(safePage + 1)}>
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}