import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/adminLogin.css";
import { adminLogin } from "../../api/adminApi"; // ✅ IMPORT

export default function AdminLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await adminLogin(form);

      // ✅ Your backend returns: { token, admin }
      if (!data?.token) {
        throw new Error("Token not received from server.");
      }

      // ✅ STORE LOGIN DATA
      localStorage.setItem("admin_token", data.token);
      localStorage.setItem("admin_auth", "true");
      localStorage.setItem("admin_email", data?.admin?.email || form.email);

      // ✅ REDIRECT TO DASHBOARD
      navigate("/admin/dashboard", { replace: true });

    } catch (err) {
      console.log("ADMIN LOGIN ERROR:", err);

      const msg =
        err?.response?.data?.error ||
        err?.message ||
        "Invalid email or password";

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        <h2 className="login-title">Elite Resort Admin</h2>
        <p className="login-subtitle">Sign in to access the admin dashboard</p>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="admin@eliteresort.com"
              value={form.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="mb-4">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="Enter password"
              value={form.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}