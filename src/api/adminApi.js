const API_URL = "https://hotel-managment-backend-production.up.railway.app";

// ================= COMMON FETCH HANDLER =================
const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) {
    throw { response: { status: res.status, data } };
  }
  return data;
};

// ================= ADMIN =================

// ADMIN LOGIN
export const adminLogin = async (data) => {
  const res = await fetch(`${API_URL}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

// ================= ROOMS =================

// GET ALL ROOMS
export const getRooms = async () => {
  const res = await fetch(`${API_URL}/rooms`);
  return handleResponse(res);
};

// GET SINGLE ROOM
export const getRoomById = async (roomId) => {
  const res = await fetch(`${API_URL}/rooms/${roomId}`);
  return handleResponse(res);
};

// ADD ROOM (JSON or FormData)
export const createRoom = async (roomData) => {
  const isFormData = roomData instanceof FormData;
  const res = await fetch(`${API_URL}/rooms`, {
    method: "POST",
    headers: isFormData ? {} : { "Content-Type": "application/json" },
    body: isFormData ? roomData : JSON.stringify(roomData),
  });
  return handleResponse(res);
};

// UPDATE ROOM
export const updateRoom = async (roomId, data) => {
  const res = await fetch(`${API_URL}/rooms/${roomId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

// DELETE ROOM
export const deleteRoom = async (roomId) => {
  const res = await fetch(`${API_URL}/rooms/${roomId}`, { method: "DELETE" });
  return handleResponse(res);
};

// ================= USERS =================



export const getAllUsers = async () => {
  const res = await fetch(`${API_URL}/profiles`); // ✅ NOT /profile/undefined

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || "Failed to fetch users");
  }

  return data;
};

// ✅ DELETE USER
export const deleteUser = async (email) => {
  const res = await fetch(`${API_URL}/profile/${email}`, {
    method: "DELETE",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || "Failed to delete user");
  }

  return data;
};



// ================= BOOKINGS =================

// CREATE BOOKING// GET BOOKINGS BY USER EMAIL

export const adminGetBookings = async (email) => {
  // If email is provided, call /booking/:email
  const endpoint = email ? `${API_URL}/booking/${email}` : `${API_URL}/booking`;
  const res = await fetch(endpoint);
  return handleResponse(res);
};

// CANCEL BOOKING
export const cancelBooking = async (bookingId) => {
  const res = await fetch(`${API_URL}/booking/cancel`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bookingId }),
  });
  return handleResponse(res);
};
export const createBooking = async (data) => {
  const res = await fetch(`${API_URL}/booking`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};



// ================= PAYMENTS =================

// CREATE PAYMENT
export const createPayment = async (data) => {
  const res = await fetch(`${API_URL}/payments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

// GET PAYMENT BY BOOKING ID
export const getPaymentByBookingId = async (bookingId) => {
  const res = await fetch(`${API_URL}/payments/${bookingId}`);
  return handleResponse(res);
};

// CANCEL PAYMENT
export const cancelPayment = async (paymentId) => {
  const res = await fetch(`${API_URL}/payments/${paymentId}`, {
    method: "PUT",
  });
  return handleResponse(res);
};

// ================= CONTACTS =================

// GET ALL CONTACTS
export const adminFetchContacts = async () => {
  const res = await fetch(`${API_URL}/contacts`);
  return handleResponse(res);
};

// CREATE CONTACT
export const createContact = async (data) => {
  const res = await fetch(`${API_URL}/contacts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

// GET CONTACT BY ID
export const getContactById = async (id) => {
  const res = await fetch(`${API_URL}/contacts/${id}`);
  return handleResponse(res);
};

// DELETE CONTACT
export const adminDeleteContact = async (id) => {
  const res = await fetch(`${API_URL}/contacts/${id}`, { method: "DELETE" });
  return handleResponse(res);
};