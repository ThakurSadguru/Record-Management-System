// src/components/layout/SuperAdminRoute.jsx
import { useAuth } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function SuperAdminRoute({ children }) {
  const { isSuperAdmin } = useAuth();
  return isSuperAdmin ? children : <Navigate to="/dashboard" replace />;
}
