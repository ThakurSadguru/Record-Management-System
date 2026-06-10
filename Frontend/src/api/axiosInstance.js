import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

// Auto-attach JWT to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwt_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle responses globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // Plan limit hit
    if (status === 402) {
      toast.error(
        error.response?.data?.error ?? "Upgrade your plan to continue",
        {
          icon: "⭐",
          duration: 4000,
        }
      );

      // optional redirect
      // window.location.href = "/pricing";
    }

    // Unauthorized
    if (status === 401) {
      localStorage.removeItem("jwt_token");
      localStorage.removeItem("rms_user");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;