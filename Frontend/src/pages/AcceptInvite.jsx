// pages/AcceptInvite.jsx
import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post("/invite/accept", { token, password });
      setDone(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired invite link");
    } finally {
      setLoading(false);
    }
  }

  if (!token)
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#ef4444" }}>
        Invalid invite link — no token provided.
      </div>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8fafc",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          padding: "36px 32px",
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 8px 40px rgba(0,0,0,0.1)",
          border: "1.5px solid #e2e8f0",
        }}
      >
        {done ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: "#0f172a",
                margin: "0 0 8px",
              }}
            >
              Account activated!
            </h2>
            <p style={{ color: "#64748b", fontSize: 13 }}>
              Redirecting you to login…
            </p>
          </div>
        ) : (
          <>
            <h2
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "#0f172a",
                margin: "0 0 6px",
              }}
            >
              Set your password
            </h2>
            <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 24px" }}>
              Choose a password to activate your RMS account.
            </p>

            <form onSubmit={handleSubmit}>
              {[
                ["Password", password, setPassword, "password"],
                ["Confirm password", confirm, setConfirm, "password"],
              ].map(([label, val, setter, type]) => (
                <div key={label} style={{ marginBottom: 16 }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: 11,
                      fontWeight: 600,
                      marginBottom: 5,
                      color: "#475569",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {label}
                  </label>
                  <input
                    type={type}
                    value={val}
                    onChange={(e) => setter(e.target.value)}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "9px 12px",
                      borderRadius: 8,
                      fontSize: 13,
                      background: "#f8fafc",
                      border: "1.5px solid #e2e8f0",
                      color: "#0f172a",
                      outline: "none",
                    }}
                  />
                </div>
              ))}

              {error && (
                <p
                  style={{ fontSize: 12, color: "#ef4444", margin: "0 0 14px" }}
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: 9,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#fff",
                  background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
                  boxShadow: "0 4px 14px rgba(37,99,235,0.35)",
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? "Activating…" : "Activate Account"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
