import { Navigate, useLocation } from "react-router-dom";

function decodeJwtPayload(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // base64url → base64
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(json);
  } catch {
    return null;
  }
}

export default function ProtectedRoute({ children }) {
  const location = useLocation();

  const token = localStorage.getItem("admin_token");

  // ✅ If no token, block
  if (!token) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  // ✅ If token is JWT, validate exp (optional)
  const payload = decodeJwtPayload(token);
  if (payload?.exp && payload.exp * 1000 < Date.now()) {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_auth");
    localStorage.removeItem("admin_email");
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  // ✅ If token is not JWT (or no exp), still allow (backend will enforce)
  return children;
}