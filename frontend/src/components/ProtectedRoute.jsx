import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// If the admin is not logged in, send them to the login page.
export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
