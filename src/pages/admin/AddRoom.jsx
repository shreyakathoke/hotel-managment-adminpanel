import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/addRoom.css";
import { createRoom, updateRoom, getRoomById } from "../../api/adminApi";

const ROOM_TYPES = [
  "Deluxe Room",
  "Single Room",
  "Double Suite",
  "Family Room",
  "Executive Suite",
  "Presidential Suite",
];

export default function AddRoom() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    roomNo: "",
    roomType: "",
    price: "",
    capacity: "",
    availability: "available",
    description: "",
    imageUrl: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [loadingRoom, setLoadingRoom] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // Load room for edit mode
  useEffect(() => {
    if (!isEdit) return;

    (async () => {
      setLoadingRoom(true);
      setError("");
      try {
        const data = await getRoomById(id);
        const room = data?.room ?? data;
        const imageUrl = room?.imageUrl || room?.image || room?.photo || "";

        setForm({
          roomNo: room?.roomNumber ?? room?.roomNo ?? room?.number ?? "",
          roomType: room?.type ?? room?.roomType ?? "",
          price: room?.pricePerNight ?? room?.price ?? "",
          capacity: room?.capacity ?? "",
          availability:
            typeof room?.available === "boolean"
              ? room.available
                ? "available"
                : "unavailable"
              : room?.availability
              ? String(room.availability).toLowerCase()
              : "available",
          description: room?.description ?? "",
          imageUrl,
        });

        if (imageUrl) setPreviewUrl(imageUrl);
      } catch (err) {
        console.error("GET ROOM ERROR:", err?.response?.data || err);
        alert(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            "Failed to load room."
        );
        navigate("/admin/rooms");
      } finally {
        setLoadingRoom(false);
      }
    })();
  }, [isEdit, id, navigate]);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const errors = useMemo(() => {
    const e = {};
    if (!form.roomNo.trim()) e.roomNo = "Room number is required.";
    if (!form.roomType) e.roomType = "Room type is required.";
    if (form.price === "" || Number(form.price) <= 0) e.price = "Enter a valid price.";
    if (form.capacity === "" || Number(form.capacity) <= 0) e.capacity = "Enter a valid capacity.";
    if (!form.availability) e.availability = "Availability is required.";
    if (!form.description.trim()) e.description = "Description is required.";
    return e;
  }, [form]);

  const isValid = Object.keys(errors).length === 0;

  function onChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setError("");
  }

  function onBlur(e) {
    setTouched((p) => ({ ...p, [e.target.name]: true }));
  }

  function onImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);

    if (previewUrl && previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setError("");
  }

  // Placeholder for S3 upload function
  async function uploadImageToS3(file) {
    // Implement your actual S3 upload here
    // Return uploaded image URL as string
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(URL.createObjectURL(file)); // temporary mock URL
      }, 1000);
    });
  }

  async function handleUploadImage() {
    if (!imageFile) {
      setError("Please select an image first.");
      return;
    }

    setUploading(true);
    setError("");
    try {
      const url = await uploadImageToS3(imageFile);
      setForm((p) => ({ ...p, imageUrl: url }));
      setPreviewUrl(url);
      alert("Image uploaded successfully!");
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      setError(err?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e) {
    e.preventDefault();

    setTouched({
      roomNo: true,
      roomType: true,
      price: true,
      capacity: true,
      availability: true,
      description: true,
    });

    if (!isValid) return;

    setSubmitting(true);
    setError("");

    const payload = {
      roomNumber: form.roomNo.trim(),
      type: form.roomType,
      pricePerNight: Number(form.price),
      capacity: Number(form.capacity),
      available: form.availability === "available",
      description: form.description.trim(),
      imageUrl: form.imageUrl || "",
    };

    try {
      if (imageFile && !form.imageUrl) {
        const url = await uploadImageToS3(imageFile);
        payload.imageUrl = url;
      }

      if (isEdit) {
        await updateRoom(id, payload);
        alert("Room updated successfully");
      } else {
        await createRoom(payload);
        alert("Room added successfully");
      }

      navigate("/admin/rooms");
    } catch (err) {
      const status = err?.response?.status;
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          (status ? `Failed to save room (HTTP ${status}).` : "Failed to save room.")
      );
    } finally {
      setSubmitting(false);
    }
  }

  // Placeholder for deleteRoom
  async function deleteRoom(id) {
    // Implement actual delete logic
    return new Promise((resolve) => setTimeout(resolve, 500));
  }

  async function onDelete() {
    if (!isEdit) return;

    const ok = window.confirm("Are you sure you want to delete this room?");
    if (!ok) return;

    setSubmitting(true);
    setError("");
    try {
      await deleteRoom(id);
      alert("Room deleted successfully");
      navigate("/admin/rooms");
    } catch (err) {
      console.error("DELETE ROOM ERROR:", err);
      setError("Failed to delete room.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingRoom) {
    return (
      <section className="add-room-sec">
        <div className="container py-5">
          <div className="card add-room-card">
            <div className="card-body p-5 text-center">
              <div className="spinner-border" role="status" />
              <div className="mt-3">Loading room...</div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="add-room-sec">
      <div className="container py-5">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h3 className="mb-1">{isEdit ? "Edit Room" : "Add Room"}</h3>
            <div className="text-muted small">Fill the details below.</div>
          </div>

          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => navigate("/admin/rooms")}
              disabled={submitting || uploading}
            >
              Back
            </button>

            {isEdit && (
              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={onDelete}
                disabled={submitting || uploading}
              >
                {submitting ? "Please wait..." : "Delete"}
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="alert alert-danger py-2">
            <i className="bi bi-exclamation-triangle me-2" />
            {error}
          </div>
        )}

        <div className="card add-room-card">
          <div className="card-body p-4 p-md-5">
            <form onSubmit={onSubmit} className="row g-3">
              {/* Room No */}
              <div className="col-md-6">
                <label className="form-label">Room Number</label>
                <input
                  name="roomNo"
                  value={form.roomNo}
                  onChange={onChange}
                  onBlur={onBlur}
                  className={`form-control ${touched.roomNo && errors.roomNo ? "is-invalid" : ""}`}
                  placeholder="e.g. 101"
                />
                {touched.roomNo && errors.roomNo && (
                  <div className="invalid-feedback">{errors.roomNo}</div>
                )}
              </div>

              {/* Room Type */}
              <div className="col-md-6">
                <label className="form-label">Room Type</label>
                <select
                  name="roomType"
                  value={form.roomType}
                  onChange={onChange}
                  onBlur={onBlur}
                  className={`form-select ${touched.roomType && errors.roomType ? "is-invalid" : ""}`}
                >
                  <option value="">Select type</option>
                  {ROOM_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                {touched.roomType && errors.roomType && (
                  <div className="invalid-feedback">{errors.roomType}</div>
                )}
              </div>

              {/* Price */}
              <div className="col-md-6">
                <label className="form-label">Price / Night</label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={onChange}
                  onBlur={onBlur}
                  className={`form-control ${touched.price && errors.price ? "is-invalid" : ""}`}
                  placeholder="e.g. 2499"
                />
                {touched.price && errors.price && (
                  <div className="invalid-feedback">{errors.price}</div>
                )}
              </div>

              {/* Capacity */}
              <div className="col-md-6">
                <label className="form-label">Capacity</label>
                <input
                  type="number"
                  name="capacity"
                  value={form.capacity}
                  onChange={onChange}
                  onBlur={onBlur}
                  className={`form-control ${touched.capacity && errors.capacity ? "is-invalid" : ""}`}
                  placeholder="e.g. 2"
                />
                {touched.capacity && errors.capacity && (
                  <div className="invalid-feedback">{errors.capacity}</div>
                )}
              </div>

              {/* Availability */}
              <div className="col-md-6">
                <label className="form-label">Availability</label>
                <select
                  name="availability"
                  value={form.availability}
                  onChange={onChange}
                  onBlur={onBlur}
                  className={`form-select ${touched.availability && errors.availability ? "is-invalid" : ""}`}
                >
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>
                {touched.availability && errors.availability && (
                  <div className="invalid-feedback">{errors.availability}</div>
                )}
              </div>

              {/* Image */}
              <div className="col-md-6">
                <label className="form-label">Room Image</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={onImageChange}
                  disabled={uploading || submitting}
                />

                <div className="d-flex gap-2 mt-2">
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={handleUploadImage}
                    disabled={!imageFile || uploading || submitting}
                  >
                    {uploading ? "Uploading..." : "Upload Image"}
                  </button>

                  {form.imageUrl && (
                    <span className="badge text-bg-success align-self-center">Uploaded</span>
                  )}
                </div>

                {form.imageUrl && (
                  <div className="small text-muted mt-1">
                    Saved URL: <span style={{ wordBreak: "break-all" }}>{form.imageUrl}</span>
                  </div>
                )}
              </div>

              {/* Preview */}
              {previewUrl && (
                <div className="col-12">
                  <div className="border rounded p-3">
                    <div className="small text-muted mb-2">Preview</div>
                    <img
                      src={previewUrl}
                      alt="preview"
                      style={{ width: "100%", maxHeight: 320, objectFit: "cover", borderRadius: 8 }}
                    />
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="col-12">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={onChange}
                  onBlur={onBlur}
                  className={`form-control ${touched.description && errors.description ? "is-invalid" : ""}`}
                  rows={4}
                  placeholder="Write something about the room..."
                />
                {touched.description && errors.description && (
                  <div className="invalid-feedback">{errors.description}</div>
                )}
              </div>

              {/* Actions */}
              <div className="col-12 d-flex gap-2 justify-content-end mt-3">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => navigate("/admin/rooms")}
                  disabled={submitting || uploading}
                >
                  Cancel
                </button>

                <button type="submit" className="btn btn-primary" disabled={submitting || uploading}>
                  {submitting ? "Saving..." : isEdit ? "Update Room" : "Add Room"}
                </button>
              </div>
            </form>

            {imageFile && (
              <div className="text-muted small mt-3">
                Selected file: <b>{imageFile.name}</b>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}