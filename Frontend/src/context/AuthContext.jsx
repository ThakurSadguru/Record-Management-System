import { createContext, useContext, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("rms_user");
      console.log("Stored user:", stored); // ← add this
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback(
    async (email, password) => {
      try {
        const { data } = await authApi.login(email, password);
        localStorage.setItem("jwt_token", data.token);
        const userObj = { name: data.name, role: data.role, email: data.email };
        localStorage.setItem("rms_user", JSON.stringify(userObj));
        setUser(userObj);
        navigate("/dashboard");
        toast.success(`Welcome, ${data.name}!`);
      } catch (err) {
        toast.error(err.response?.data?.message ?? "Invalid email or password");
      }
    },
    [navigate],
  );

  const logout = useCallback(() => {
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("rms_user");
    setUser(null);
    navigate("/login");
  }, [navigate]);

  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const isAdmin = user?.role === "ADMIN" || isSuperAdmin;
  const isStaff = user?.role === "STAFF" || isAdmin;
  const isViewer = !!user;

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isSuperAdmin, isAdmin, isStaff, isViewer }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
