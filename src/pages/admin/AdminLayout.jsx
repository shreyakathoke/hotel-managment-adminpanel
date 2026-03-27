import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "../../styles/admin.css";

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: "bi-grid" },
  { to: "/admin/users", label: "Users", icon: "bi-people" },
  { to: "/admin/contacts", label: "Contacts", icon: "bi-chat-dots" },
  { to: "/admin/rooms", label: "Rooms", icon: "bi-door-open" },

  // ✅ NEW: Bookings
  { to: "/admin/bookings", label: "Bookings", icon: "bi-journal-check" },
];

function SidebarContent({ onNavigate }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("admin_auth");
    localStorage.removeItem("admin_token"); // ✅ recommended
    navigate("/admin/login");
  };

  return (
    <div className="admin-sidebar-inner">
      {/* Brand */}
      <div className="admin-brand">
        <div className="brand-dot">
          <i className="bi bi-gem" />
        </div>
        <div className="brand-text">
          <div className="brand-title">Elite Resort</div>
          <div className="brand-subtitle">Admin Panel</div>
        </div>
      </div>

      {/* Nav */}
      <div className="admin-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => "admin-link " + (isActive ? "active" : "")}
            onClick={onNavigate}
          >
            <span className="admin-link-icon">
              <i className={`bi ${item.icon}`} />
            </span>
            <span className="admin-link-text">{item.label}</span>
          </NavLink>
        ))}
      </div>

      {/* Bottom */}
      <div className="admin-sidebar-bottom">
        <button className="btn btn-light border w-100 admin-signout" onClick={logout}>
          <i className="bi bi-box-arrow-right me-2" />
          Logout
        </button>
        <div className="admin-mini-note">
          <span className="dot" />
          System healthy
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  return (
    <div className="admin-shell">
      {/* Desktop sidebar */}
      <aside className="admin-sidebar d-none d-lg-flex">
        <SidebarContent />
      </aside>

      {/* Mobile topbar */}
      <header className="admin-topbar d-lg-none">
        <button
          className="btn btn-light border admin-menu-btn"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#adminOffcanvas"
          aria-controls="adminOffcanvas"
        >
          <i className="bi bi-list" />
        </button>

        <div className="admin-topbar-title">
          <div className="topbar-title">Elite Resort</div>
          <div className="topbar-subtitle">Admin Panel</div>
        </div>
      </header>

      {/* Mobile offcanvas sidebar */}
      <div className="offcanvas offcanvas-start admin-offcanvas" tabIndex="-1" id="adminOffcanvas">
        <div className="offcanvas-header">
          <div className="d-flex align-items-center gap-2">
            <div className="brand-dot">
              <i className="bi bi-gem" />
            </div>
            <div>
              <div className="brand-title">Elite Resort</div>
              <div className="brand-subtitle">Admin Panel</div>
            </div>
          </div>

          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close" />
        </div>

        <div className="offcanvas-body p-0">
          <SidebarContent
            onNavigate={() => {
              const el = document.getElementById("adminOffcanvas");
              if (el) {
                // eslint-disable-next-line no-undef
                const instance = bootstrap.Offcanvas.getInstance(el);
                instance?.hide();
              }
            }}
          />
        </div>
      </div>

      {/* Main content */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}