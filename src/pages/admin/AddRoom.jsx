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
  });

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [loadingRoom, setLoadingRoom] = useState(false);
  const [error, setError] = useState("");

  // ================= LOAD ROOM =================
  useEffect(() => {
    if (!isEdit) return;

    (async () => {
      setLoadingRoom(true);
      try {
        const data = await getRoomById(id);
        const room = data?.room ?? data;

        setForm({
          roomNo: room?.roomNumber || "",
          roomType: room?.type || "",
          price: room?.pricePerNight || "",
          capacity: room?.capacity || "",
          availability: room?.available ? "available" : "unavailable",
          description: room?.description || "",
        });

        if (room?.imageUrl) {
          setPreviewUrl(room.imageUrl);
        }
      } catch (err) {
        alert("Failed to load room");
        navigate("/admin/rooms");
      } finally {
        setLoadingRoom(false);
      }
    })();
  }, [id, isEdit, navigate]);

  // ================= VALIDATION =================
  const errors = useMemo(() => {
    const e = {};
    if (!form.roomNo) e.roomNo = "Required";
    if (!form.roomType) e.roomType = "Required";
    if (!form.price || form.price <= 0) e.price = "Invalid price";
    if (!form.capacity || form.capacity <= 0) e.capacity = "Invalid capacity";
    if (!form.description) e.description = "Required";
    return e;
  }, [form]);

  const isValid = Object.keys(errors).length === 0;

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // ================= SUBMIT =================
  const onSubmit = async (e) => {
    e.preventDefault();

    setTouched({
      roomNo: true,
      roomType: true,
      price: true,
      capacity: true,
      description: true,
    });

    if (!isValid) return;

    setSubmitting(true);
    setError("");

    try {
      const formData = new FormData();

      formData.append("roomNumber", form.roomNo);
      formData.append("type", form.roomType);
      formData.append("pricePerNight", form.price);
      formData.append("capacity", form.capacity);
      formData.append("description", form.description);

      // ✅ IMAGE
      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (isEdit) {
        await updateRoom(id, formData);
        alert("Room updated");
      } else {
        await createRoom(formData);
        alert("Room added");
      }

      navigate("/admin/rooms");
    } catch (err) {
      console.error(err);
      setError("Failed to save room");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingRoom) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="container py-5">
      <h3>{isEdit ? "Edit Room" : "Add Room"}</h3>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={onSubmit} className="row g-3">
        <input
          className="form-control"
          name="roomNo"
          placeholder="Room No"
          value={form.roomNo}
          onChange={onChange}
        />

        <select
          className="form-select"
          name="roomType"
          value={form.roomType}
          onChange={onChange}
        >
          <option value="">Select Type</option>
          {ROOM_TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>

        <input
          type="number"
          className="form-control"
          name="price"
          placeholder="Price"
          value={form.price}
          onChange={onChange}
        />

        <input
          type="number"
          className="form-control"
          name="capacity"
          placeholder="Capacity"
          value={form.capacity}
          onChange={onChange}
        />

        <textarea
          className="form-control"
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={onChange}
        />

        <input type="file" className="form-control" onChange={onImageChange} />

        {previewUrl && (
          <img
            src={previewUrl}
            alt="preview"
            style={{ width: "200px", marginTop: "10px" }}
          />
        )}

        <button className="btn btn-primary" disabled={submitting}>
          {submitting ? "Saving..." : "Submit"}
        </button>
      </form>
    </div>
  );
}