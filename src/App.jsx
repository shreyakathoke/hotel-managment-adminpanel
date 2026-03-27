import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Users from "./pages/admin/Users";
import UserDetails from "./pages/admin/UserDetails";
import Contacts from "./pages/admin/Contacts";
import ContactDetails from "./pages/admin/ContactDetails";
import Rooms from "./pages/admin/Rooms";
import AddRoom from "./pages/admin/AddRoom";
import RoomDetails from "./pages/admin/RoomDetails";
import AdminLogin from "./pages/admin/AdminLogin";
import ProtectedRoute from "./components/ProtectedRoute";
import Bookings from "./pages/admin/Bookings";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default route → Login */}
        <Route path="/" element={<Navigate to="/admin/login" replace />} />

        {/* Login Route */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />

          {/* Users */}
          <Route path="users" element={<Users />} />
          <Route path="users/:id" element={<UserDetails />} />

          {/* Contacts */}
          <Route path="contacts" element={<Contacts />} />
          <Route path="contacts/:id" element={<ContactDetails />} />

          {/* Rooms */}
          <Route path="rooms" element={<Rooms />} />
          <Route path="rooms/add" element={<AddRoom />} />
          <Route path="rooms/edit/:id" element={<AddRoom />} />
          <Route path="rooms/:id" element={<RoomDetails />} />

          {/* Booking */}
          <Route path="/admin/bookings" element={<Bookings />} />
        </Route>

        {/* Fallback */}
        <Route path="bookings" element={<Bookings />} />
      </Routes>
    </BrowserRouter>
  );
}