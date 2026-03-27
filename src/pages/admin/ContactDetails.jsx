import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/contactDetails.css";

const mockContacts = [
  {
    id: "1",
    user: "John Doe",
    email: "john@example.com",
    phone: "9876543210",
    subject: "Booking",
    message: "I want to book a sea view room for 3 nights.",
    submittedAt: "Feb 16, 2026, 10:38 AM",
  },
  {
    id: "2",
    user: "Sneha Sharma",
    email: "sneha@gmail.com",
    phone: "9988776655",
    subject: "Event",
    message: "Looking to host a wedding event at your resort.",
    submittedAt: "Feb 18, 2026, 02:15 PM",
  },
];

function DetailItem({ icon, label, value }) {
  return (
    <div className="col-12 col-md-6">
      <div className="detail-item d-flex align-items-start gap-3">
        <div className="detail-icon">
          <i className={`bi ${icon}`} />
        </div>
        <div>
          <div className="detail-label">{label}</div>
          <div className="detail-value">{value || "-"}</div>
        </div>
      </div>
    </div>
  );
}

export default function ContactDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const contact = useMemo(
    () => mockContacts.find((c) => c.id === id),
    [id]
  );

  if (!contact) {
    return (
      <div className="container-fluid px-3 px-lg-4 py-4">
        <button className="btn btn-light border" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left me-2" />
          Back
        </button>
        <div className="mt-4 card soft-card p-4">
          <h5 className="mb-1 fw-bold">Contact not found</h5>
          <div className="text-muted">No contact exists with id: {id}</div>
        </div>
      </div>
    );
  }

  const onDelete = () => {
    navigate("/admin/contacts");
  };

  return (
    <div className="container-fluid px-3 px-lg-4 py-4 contact-details-wrap">
      {/* Top Buttons */}
      <div className="d-flex align-items-start justify-content-between gap-3 mb-4">
        <button className="btn btn-light border" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left me-2" />
          Back
        </button>

        <button className="btn btn-danger btn-delete" onClick={onDelete}>
          <i className="bi bi-trash me-2" />
          Delete Contact
        </button>
      </div>

      {/* Page Title */}
      <div className="mb-4">
        <h3 className="fw-bold d-flex align-items-center gap-2 mb-1">
          <span className="title-icon">
            <i className="bi bi-chat-dots" />
          </span>
          Contact Details
        </h3>
        <div className="text-muted">
          View detailed information about this contact inquiry.
        </div>
      </div>

      {/* Contact Info Card */}
      <div className="card soft-card mb-4">
        <div className="card-header soft-card-header">
          <h5 className="mb-0 fw-bold">
            <i className="bi bi-person me-2 text-primary" />
            Contact Information
          </h5>
        </div>

        <div className="card-body row g-4">
          <DetailItem icon="bi-person" label="Full Name" value={contact.user} />
          <DetailItem icon="bi-envelope" label="Email" value={contact.email} />
          <DetailItem icon="bi-telephone" label="Phone Number" value={contact.phone} />
          <DetailItem icon="bi-tag" label="Subject" value={contact.subject} />
          <DetailItem icon="bi-calendar-event" label="Submitted At" value={contact.submittedAt} />
        </div>
      </div>

      {/* Message Card */}
      <div className="card soft-card">
        <div className="card-header soft-card-header">
          <h5 className="mb-0 fw-bold">
            <i className="bi bi-chat-left-text me-2 text-primary" />
            Message
          </h5>
        </div>

        <div className="card-body">
          <div className="message-box">
            {contact.message}
          </div>
        </div>
      </div>
    </div>
  );
}