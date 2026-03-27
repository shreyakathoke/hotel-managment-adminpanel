import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/userDetails.css";

const mockUsers = [
  {
    id: "1",
    fullName: "Aryan Doe",
    email: "aryan123@gmail.com",
    phone: "7894563218",
    status: "active",
    createdAt: "Feb 9, 2026, 03:19 PM",
    updatedAt: "Feb 9, 2026, 03:19 PM",
    address: "Nagpur, Maharashtra",

    // ✅ ID Proof
    idProofType: "Aadhar",
    idProofNumber: "1234 5678 9012",
    idProofFront: "https://via.placeholder.com/800x500?text=Aadhar+Front",
    idProofBack: "https://via.placeholder.com/800x500?text=Aadhar+Back",
  },
  {
    id: "2",
    fullName: "hdt",
    email: "himanshuthakre7509@gmail.com",
    phone: "9876543210",
    status: "active",
    createdAt: "Feb 9, 2026, 03:19 PM",
    updatedAt: "Feb 9, 2026, 03:19 PM",
    address: "Mumbai, Maharashtra",

    idProofType: "PAN",
    idProofNumber: "ABCDE1234F",
    idProofFront: "https://via.placeholder.com/800x500?text=PAN+Card",
    idProofBack: "",
  },
  {
    id: "3",
    fullName: "Test User",
    email: "test@example.com",
    phone: "1234567890",
    status: "inactive",
    createdAt: "Feb 3, 2026, 11:10 AM",
    updatedAt: "Feb 3, 2026, 11:10 AM",
    address: "Pune, Maharashtra",

    idProofType: "Driving License",
    idProofNumber: "MH12-20234567",
    idProofFront: "https://via.placeholder.com/800x500?text=License+Front",
    idProofBack: "https://via.placeholder.com/800x500?text=License+Back",
  },
];

function InfoItem({ icon, label, value }) {
  return (
    <div className="col-12 col-md-6">
      <div className="info-item d-flex align-items-start gap-3">
        <div className="info-icon">
          <i className={`bi ${icon}`} />
        </div>
        <div>
          <div className="info-label">{label}</div>
          <div className="info-value">{value || "-"}</div>
        </div>
      </div>
    </div>
  );
}

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const user = useMemo(() => mockUsers.find((u) => u.id === String(id)), [id]);

  if (!user) {
    return (
      <div className="container-fluid px-3 px-lg-4 py-4">
        <button className="btn btn-light border" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left me-2" />
          Back
        </button>

        <div className="card soft-card p-4 mt-3">
          <h5 className="fw-bold mb-1">User not found</h5>
          <div className="text-muted">No user exists with id: {id}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-3 px-lg-4 py-4">
      {/* Back */}
      <button className="btn btn-light border mb-3" onClick={() => navigate(-1)}>
        <i className="bi bi-arrow-left me-2" />
        Back
      </button>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h3 className="fw-bold mb-1">
            <i className="bi bi-person me-2 text-primary" />
            User Details
          </h3>
          <p className="text-muted mb-0">
            View user information and ID proof documents.
          </p>
        </div>

        <span
          className={`badge rounded-pill px-3 py-2 ${
            user.status === "active"
              ? "bg-success-subtle text-success"
              : "bg-danger-subtle text-danger"
          }`}
        >
          <i className="bi bi-circle-fill me-2 small" />
          {user.status === "active" ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Personal Information */}
      <div className="card soft-card mb-4">
        <div className="card-header soft-card-header">
          <h5 className="mb-0 fw-bold">
            <i className="bi bi-person-badge me-2 text-primary" />
            Personal Information
          </h5>
        </div>

        <div className="card-body row g-4">
          <InfoItem icon="bi-person" label="Full Name" value={user.fullName} />
          <InfoItem icon="bi-envelope" label="Email" value={user.email} />
          <InfoItem icon="bi-telephone" label="Phone Number" value={user.phone} />
          <InfoItem icon="bi-calendar" label="Created At" value={user.createdAt} />
          <InfoItem icon="bi-clock" label="Updated At" value={user.updatedAt} />
        </div>
      </div>

      {/* Profile Information */}
      <div className="card soft-card mb-4">
        <div className="card-header soft-card-header">
          <h5 className="mb-0 fw-bold">
            <i className="bi bi-file-earmark-text me-2 text-primary" />
            Profile Information
          </h5>
          <small className="text-muted">Additional personal details.</small>
        </div>

        <div className="card-body row g-4">
          <InfoItem icon="bi-geo-alt" label="Address" value={user.address} />
          <InfoItem
            icon="bi-calendar-check"
            label="Profile Created At"
            value={user.createdAt}
          />
        </div>
      </div>

      {/* ✅ ID Proof */}
      <div className="card soft-card">
        <div className="card-header soft-card-header">
          <h5 className="mb-0 fw-bold">
            <i className="bi bi-card-text me-2 text-primary" />
            ID Proof
          </h5>
        </div>

        <div className="card-body">
          <div className="row g-4 mb-4">
            <InfoItem icon="bi-patch-check" label="Proof Type" value={user.idProofType} />
            <InfoItem icon="bi-hash" label="Proof Number" value={user.idProofNumber} />
          </div>

          <div className="row g-4">
            {user.idProofFront && (
              <div className="col-12 col-md-6 col-lg-4">
                <img
                  src={user.idProofFront}
                  alt="ID Proof"
                  className="id-proof-img"
                />
              </div>
            )}

            {user.idProofBack && (
              <div className="col-12 col-md-6 col-lg-4">
                <img
                  src={user.idProofBack}
                  alt="ID Proof"
                  className="id-proof-img"
                />
              </div>
            )}
          </div>

          {!user.idProofFront && !user.idProofBack && (
            <div className="text-muted small">No ID proof uploaded.</div>
          )}
        </div>
      </div>
    </div>
  );
}