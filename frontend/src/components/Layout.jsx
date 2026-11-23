import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

// Layout = sidebar + top bar. Pages are rendered inside <Outlet />.
export default function Layout() {
  const { username, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  const handleLogout = () => {
    logout();
    toast.info("You have been logged out.");
    navigate("/login");
  };

  return (
    <>
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="brand">
          <i className="bi bi-mortarboard-fill me-2"></i>Student Manager
        </div>
        <nav className="nav flex-column mt-3">
          <NavLink to="/dashboard" className="nav-link" onClick={closeSidebar}>
            <i className="bi bi-speedometer2 me-2"></i>Dashboard
          </NavLink>
          <NavLink to="/students" end className="nav-link" onClick={closeSidebar}>
            <i className="bi bi-people me-2"></i>Students
          </NavLink>
          <NavLink to="/students/new" className="nav-link" onClick={closeSidebar}>
            <i className="bi bi-person-plus me-2"></i>Add Student
          </NavLink>
        </nav>
      </aside>
      <div
        className={`sidebar-backdrop ${sidebarOpen ? "open" : ""}`}
        onClick={closeSidebar}
      ></div>

      <div className="main-area">
        <header className="bg-white border-bottom px-3 px-md-4 py-2 d-flex align-items-center">
          <button
            className="btn btn-outline-secondary d-lg-none me-3"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <i className="bi bi-list"></i>
          </button>
          <span className="fw-semibold">Admin Panel</span>
          <div className="ms-auto d-flex align-items-center">
            <span className="text-muted me-3 d-none d-sm-inline">
              <i className="bi bi-person-circle me-1"></i>
              {username}
            </span>
            <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right me-1"></i>Logout
            </button>
          </div>
        </header>

        <main className="p-3 p-md-4">
          <Outlet />
        </main>
      </div>
    </>
  );
}
