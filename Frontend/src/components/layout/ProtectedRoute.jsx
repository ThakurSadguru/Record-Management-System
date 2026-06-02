import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute() {
  const { user } = useAuth();

  console.log("ProtectedRoute user:", user); // ← add this temporarily

  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}
