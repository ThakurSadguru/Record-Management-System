import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import logoSrc from "../assets/logo.png";
import ForgotPasswordModal from "./ForgetPasswordModal";
import { useNavigate } from "react-router-dom";

function Logo({ size = 38 }) {
  return (
    <img
      src={logoSrc}
      alt="RMS"
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        display: "block",
        flexShrink: 0,
        filter: "drop-shadow(0 0 12px rgba(74,159,255,0.9))",
      }}
    />
  );
}

const ROLES = [
  { value: "SuperAdmin", label: "Super Admin", icon: "⭐" },
  { value: "Admin", label: "Admin", icon: "👑" },
  { value: "Staff", label: "Staff", icon: "👤" },
  { value: "Viewer", label: "Viewer", icon: "👁️" },
];

const FEATURES = [
  {
    icon: "🛡️",
    title: "Secure & Reliable",
    desc: "Enterprise-grade security for your data.",
  },
  {
    icon: "📁",
    title: "Organized Records",
    desc: "Store, categorize, and retrieve records efficiently.",
  },
  {
    icon: "👥",
    title: "Role-Based Access",
    desc: "Control permissions for Admin, Staff, and Viewer.",
  },
  {
    icon: "☁️",
    title: "Cloud Ready",
    desc: "Access your records anytime, anywhere.",
  },
  {
    icon: "📊",
    title: "Smart Insights",
    desc: "Get real-time insights and make better decisions.",
  },
];

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(ROLES[0]);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [showNavDropdown, setShowNavDropdown] = useState(false);
  const navDropdownRef = useRef(null);
  const roleDropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClick(e) {
      if (navDropdownRef.current && !navDropdownRef.current.contains(e.target))
        setShowNavDropdown(false);
      if (
        roleDropdownRef.current &&
        !roleDropdownRef.current.contains(e.target)
      )
        setShowRoleDropdown(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background:
          "linear-gradient(135deg, #050d1f 0%, #0a1628 40%, #0d1f3c 100%)",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        color: "#fff",
        overflowX: "hidden",
        position: "relative",
      }}
    >
      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} />
      )}

      {/* Grid bg */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          backgroundImage:
            "linear-gradient(rgba(74,159,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(74,159,255,0.04) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <div
        style={{
          position: "fixed",
          top: "-10%",
          right: "-5%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(30,80,200,0.15) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: "-10%",
          left: "-5%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(10,50,150,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Navbar */}
      <nav
        style={{
          position: "relative",
          zIndex: 100,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 52px",
          height: 70,
          background: "rgba(5,13,31,0.85)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(74,159,255,0.12)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Logo size={52} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 20, letterSpacing: 1 }}>
              RMS
            </div>
            <div
              style={{
                fontSize: 10.5,
                color: "rgba(255,255,255,0.4)",
                letterSpacing: 1.8,
                textTransform: "uppercase",
                marginTop: -1,
              }}
            >
              Record Management System
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 35 }}>
          {[
            { label: "Features", path: "/features" },
            { label: "Solutions", path: "/solutions" },
            { label: "Pricing", path: "/pricing" },
            { label: "About Us", path: "/about" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "rgba(255,255,255,0.7)",
                fontSize: 15,
                fontWeight: 500,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(255,255,255,0.7)")
              }
            >
              {item.label}
            </button>
          ))}
          <div ref={navDropdownRef} style={{ position: "relative" }}>
            <div
              style={{
                display: "flex",
                borderRadius: 9,
                overflow: "hidden",
                boxShadow: "0 0 20px rgba(74,159,255,0.3)",
              }}
            >
              <button
                onClick={() => {
                  setShowLoginForm(true);
                  setShowNavDropdown(false);
                }}
                style={{
                  background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
                  color: "#fff",
                  border: "none",
                  padding: "10px 26px",
                  fontWeight: 600,
                  fontSize: 15,
                  cursor: "pointer",
                }}
              >
                Login
              </button>
              <button
                onClick={() => setShowNavDropdown((p) => !p)}
                style={{
                  background: "linear-gradient(135deg,#1d4ed8,#1e40af)",
                  color: "#fff",
                  border: "none",
                  borderLeft: "1px solid rgba(255,255,255,0.15)",
                  padding: "10px 12px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Middle */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          flex: 1,
          display: "flex",
          alignItems: "stretch",
          padding: "16px 48px",
          gap: 40,
          minHeight: 0,
        }}
      >
        {/* Left: Hero */}
        <div
          style={{
            flex: "0 0 480px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <h1
            style={{
              fontSize: 58,
              fontWeight: 900,
              lineHeight: 1.1,
              margin: "0 0 16px",
              letterSpacing: -1,
            }}
          >
            Elevate Your
            <br />
            Enterprise with
            <br />
            <span
              style={{
                background: "linear-gradient(135deg,#4B9FFF,#60a5fa)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              RMS.
            </span>
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.55)",
              fontSize: 18,
              lineHeight: 1.7,
              margin: "0 0 28px",
            }}
          >
            Smart. Secure. Scalable.
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={() => setShowLoginForm(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
                color: "#fff",
                border: "none",
                padding: "13px 26px",
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 15,
                cursor: "pointer",
                boxShadow: "0 8px 30px rgba(37,99,235,0.4)",
              }}
            >
              Get Started
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(255,255,255,0.06)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.15)",
                padding: "13px 20px",
                borderRadius: 10,
                fontWeight: 600,
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              Learn More
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  border: "1px solid rgba(255,255,255,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>
            </button>
          </div>
        </div>

        {/* Right: Login form or Dashboard preview */}
        <div
          style={{
            flex: 1,
            alignSelf: "stretch",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {showLoginForm ? (
            <div
              style={{
                width: "100%",
                maxWidth: 460,
                background: "rgba(8,16,36,0.95)",
                backdropFilter: "blur(30px)",
                border: "1px solid rgba(74,159,255,0.2)",
                borderRadius: 18,
                padding: "28px 30px",
                boxShadow:
                  "0 40px 100px rgba(0,0,0,0.6), 0 0 60px rgba(37,99,235,0.1)",
              }}
            >
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: 14,
                  }}
                >
                  <Logo size={80} />
                </div>
                <h2
                  style={{ margin: "0 0 3px", fontSize: 20, fontWeight: 800 }}
                >
                  Welcome Back
                </h2>
                <p
                  style={{
                    color: "rgba(255,255,255,0.45)",
                    fontSize: 12,
                    margin: 0,
                  }}
                >
                  Sign in to your account
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Role selector */}

                {/* Email */}
                <div style={{ marginBottom: 11 }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: 12,
                      fontWeight: 500,
                      color: "rgba(255,255,255,0.7)",
                      marginBottom: 5,
                    }}
                  >
                    Username
                  </label>
                  <div style={{ position: "relative" }}>
                    <span
                      style={{
                        position: "absolute",
                        left: 11,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "rgba(255,255,255,0.35)",
                        display: "flex",
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </span>
                    <input
                      type="email"
                      placeholder="Enter your username"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "9px 13px 9px 34px",
                        borderRadius: 8,
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        color: "#fff",
                        fontSize: 13,
                        outline: "none",
                        boxSizing: "border-box",
                        WebkitTextFillColor: "#fff",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "rgba(74,159,255,0.5)";
                        e.target.style.background = "rgba(255,255,255,0.08)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "rgba(255,255,255,0.12)";
                        e.target.style.background = "rgba(255,255,255,0.06)";
                      }}
                    />
                  </div>
                </div>

                {/* Password */}
                <div style={{ marginBottom: 13 }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: 12,
                      fontWeight: 500,
                      color: "rgba(255,255,255,0.7)",
                      marginBottom: 5,
                    }}
                  >
                    Password
                  </label>
                  <div style={{ position: "relative" }}>
                    <span
                      style={{
                        position: "absolute",
                        left: 11,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "rgba(255,255,255,0.35)",
                        display: "flex",
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect
                          x="3"
                          y="11"
                          width="18"
                          height="11"
                          rx="2"
                          ry="2"
                        />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "9px 36px 9px 34px",
                        borderRadius: 8,
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        color: "#fff",
                        fontSize: 13,
                        outline: "none",
                        boxSizing: "border-box",
                        WebkitTextFillColor: "#fff",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "rgba(74,159,255,0.5)";
                        e.target.style.background = "rgba(255,255,255,0.08)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "rgba(255,255,255,0.12)";
                        e.target.style.background = "rgba(255,255,255,0.06)";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      style={{
                        position: "absolute",
                        right: 11,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "rgba(255,255,255,0.4)",
                        padding: 0,
                        display: "flex",
                      }}
                    >
                      {showPassword ? (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember + Forgot */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 16,
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      cursor: "pointer",
                      fontSize: 12,
                      color: "rgba(255,255,255,0.6)",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      style={{
                        width: 13,
                        height: 13,
                        accentColor: "#2563eb",
                        cursor: "pointer",
                      }}
                    />
                    Remember me
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 12,
                      color: "#4B9FFF",
                      fontWeight: 500,
                      padding: 0,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.textDecoration = "underline")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.textDecoration = "none")
                    }
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "11px",
                    borderRadius: 8,
                    border: "none",
                    background: loading
                      ? "rgba(37,99,235,0.5)"
                      : "linear-gradient(135deg,#2563eb,#1d4ed8)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: loading ? "not-allowed" : "pointer",
                    boxShadow: "0 8px 30px rgba(37,99,235,0.4)",
                    letterSpacing: 0.5,
                  }}
                >
                  {loading ? "Signing in…" : "Login"}
                </button>

                <p
                  style={{
                    textAlign: "center",
                    marginTop: 14,
                    fontSize: 11,
                    color: "rgba(255,255,255,0.4)",
                  }}
                >
                  Don't have an account?{" "}
                  <a
                    href="#"
                    style={{
                      color: "#4B9FFF",
                      textDecoration: "none",
                      fontWeight: 500,
                    }}
                  >
                    Contact Administrator
                  </a>
                </p>
              </form>
            </div>
          ) : (
            /* Dashboard preview */
            <div
              style={{
                width: "100%",
                maxWidth: 660,
                background: "rgba(8,16,36,0.9)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(74,159,255,0.15)",
                borderRadius: 16,
                overflow: "hidden",
                boxShadow: "0 40px 100px rgba(0,0,0,0.5)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 18px",
                  background: "rgba(5,13,31,0.8)",
                  borderBottom: "1px solid rgba(74,159,255,0.1)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Logo size={30} />
                  <span style={{ fontWeight: 700, fontSize: 14 }}>RMS</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{ color: "rgba(255,255,255,0.4)" }}>🔍</span>
                  <span style={{ color: "rgba(255,255,255,0.4)" }}>🔔</span>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg,#2563eb,#4B9FFF)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    A
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", height: 420 }}>
                <div
                  style={{
                    width: 150,
                    background: "rgba(5,10,25,0.7)",
                    borderRight: "1px solid rgba(74,159,255,0.08)",
                    padding: "14px 0",
                    flexShrink: 0,
                  }}
                >
                  {[
                    { icon: "⊞", label: "Dashboard", active: true },
                    { icon: "📋", label: "Records" },
                    { icon: "☰", label: "Modules" },
                    { icon: "📄", label: "Documents" },
                    { icon: "📊", label: "Reports" },
                    { icon: "👥", label: "Users" },
                    { icon: "⚙️", label: "Settings" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "9px 16px",
                        margin: "2px 7px",
                        borderRadius: 7,
                        background: item.active
                          ? "rgba(37,99,235,0.25)"
                          : "transparent",
                        color: item.active
                          ? "#4B9FFF"
                          : "rgba(255,255,255,0.5)",
                        fontSize: 11,
                        fontWeight: item.active ? 600 : 400,
                        borderLeft: item.active
                          ? "2px solid #4B9FFF"
                          : "2px solid transparent",
                      }}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
                <div
                  style={{ flex: 1, padding: "18px 20px", overflowY: "auto" }}
                >
                  <div
                    style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}
                  >
                    Dashboard
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4,1fr)",
                      gap: 10,
                      marginBottom: 18,
                    }}
                  >
                    {[
                      {
                        icon: "📋",
                        label: "Total Records",
                        value: "24,583",
                        color: "#4B9FFF",
                      },
                      {
                        icon: "☰",
                        label: "Modules",
                        value: "128",
                        color: "#34d399",
                      },
                      {
                        icon: "👥",
                        label: "Users",
                        value: "342",
                        color: "#a78bfa",
                      },
                      {
                        icon: "📄",
                        label: "Documents",
                        value: "8,752",
                        color: "#fbbf24",
                      },
                    ].map((s) => (
                      <div
                        key={s.label}
                        style={{
                          padding: "10px 11px",
                          borderRadius: 9,
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.07)",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 16,
                            marginBottom: 4,
                            color: s.color,
                          }}
                        >
                          {s.icon}
                        </div>
                        <div
                          style={{
                            fontSize: 10,
                            color: "rgba(255,255,255,0.4)",
                            marginBottom: 2,
                          }}
                        >
                          {s.label}
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 800 }}>
                          {s.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Feature bar */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          flexShrink: 0,
          borderTop: "1px solid rgba(74,159,255,0.1)",
          background: "rgba(5,13,31,0.7)",
          backdropFilter: "blur(10px)",
          padding: "16px 48px",
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 16,
        }}
      >
        {FEATURES.map((f) => (
          <div
            key={f.title}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 11,
                background: "rgba(74,159,255,0.08)",
                border: "1px solid rgba(74,159,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
              }}
            >
              {f.icon}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 3 }}>
                {f.title}
              </div>
              <div
                style={{
                  color: "rgba(255,255,255,0.45)",
                  fontSize: 11,
                  lineHeight: 1.5,
                }}
              >
                {f.desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px rgba(10,20,45,0.99) inset !important;
          -webkit-text-fill-color: #fff !important;
          border-color: rgba(74,159,255,0.5) !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
    </div>
  );
}
