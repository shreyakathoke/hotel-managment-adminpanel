const KEY = "elite_rooms_v1";

export function getRooms() {
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveRooms(rooms) {
  localStorage.setItem(KEY, JSON.stringify(rooms));
}

export function getRoomById(id) {
  return getRooms().find((r) => String(r.id) === String(id));
}

export function addRoom(room) {
  const rooms = getRooms();
  rooms.unshift(room);
  saveRooms(rooms);
}

export function updateRoom(id, patch) {
  const rooms = getRooms();
  const index = rooms.findIndex((r) => String(r.id) === String(id));
  if (index === -1) return;
  rooms[index] = { ...rooms[index], ...patch };
  saveRooms(rooms);
}

export function deleteRoom(id) {
  const rooms = getRooms().filter((r) => String(r.id) !== String(id));
  saveRooms(rooms);
}