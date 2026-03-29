const API_URL = "https://web-production-d78058.up.railway.app";

// ================= COMMON FETCH HANDLER =================
const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) {
    throw { response: { status: res.status, data } };
  }
  return data;
};

// ================= ADMIN LOGIN =================
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
export const getRoomById = async (id) => {
  const res = await fetch(`${API_URL}/rooms/${id}`);
  return handleResponse(res);
};

// ADD ROOM
export const createRoom = async (roomData) => {
  const res = await fetch(`${API_URL}/rooms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(roomData),
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
  const res = await fetch(`${API_URL}/rooms/${roomId}`, {
    method: "DELETE",
  });

  return handleResponse(res);
};

// ================= CONTACTS =================

// GET CONTACTS
export const adminFetchContacts = async () => {
  const res = await fetch(`${API_URL}/contacts`);
  return handleResponse(res);
};

// DELETE CONTACT
export const adminDeleteContact = async (id) => {
  const res = await fetch(`${API_URL}/contacts/${id}`, {
    method: "DELETE",
  });

  return handleResponse(res);
};

// ================= USERS =================

// GET ALL USERS
export const fetchUsers = async () => {
  const res = await fetch(`${API_URL}/users`); // You need this endpoint on backend
  return handleResponse(res);
};

// GET USER BY EMAIL
export const fetchUserByEmail = async (email) => {
  const res = await fetch(`${API_URL}/profile/${email}`);
  return handleResponse(res);
};

// DELETE USER
export const deleteUserApi = async (email) => {
  const res = await fetch(`${API_URL}/users/${email}`, {
    method: "DELETE",
  });

  return handleResponse(res);
};

// ================= BOOKINGS =================

export const adminGetBookings = async (email) => {
  const res = await fetch(`${API_URL}/booking/${email}`);
  return handleResponse(res);
};

// ================= PAYMENTS =================

export const adminGetPayment = async (bookingId) => {
  const res = await fetch(`${API_URL}/payments/${bookingId}`);
  return handleResponse(res);
};