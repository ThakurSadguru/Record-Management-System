import { NavLink } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { useTheme } from "../layout/AppLayout";
import logoSrc from "../../assets/logo.png";

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
        filter: "drop-shadow(0 0 10px rgba(74,159,255,0.8))",
      }}
    />
  );
}

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const { modules, loadModules } = useData();
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    loadModules();
  }, [loadModules]);

  // ── theme tokens ──────────────────────────────────────────────────────────
  const t = isDark
    ? {
        aside: "rgba(5,13,31,0.95)",
        border: "rgba(74,159,255,0.1)",
        logoTitle: "#fff",
        logoSub: "rgba(255,255,255,0.35)",
        sectionLabel: "rgba(255,255,255,0.3)",
        navText: "rgba(255,255,255,0.55)",
        navActive: "#4B9FFF",
        navActiveBg: "rgba(37,99,235,0.25)",
        navHoverBg: "rgba(255,255,255,0.05)",
        dotColor: "rgba(255,255,255,0.5)",
        emptyText: "rgba(255,255,255,0.25)",
        plusColor: "rgba(255,255,255,0.4)",
        userName: "#fff",
        userRole: "rgba(255,255,255,0.38)",
        logoutColor: "rgba(255,255,255,0.3)",
        toggleBg: "rgba(30,64,175,0.3)",
        toggleBorder: "rgba(96,165,250,0.3)",
        toggleLabel: "#93c5fd",
        trackBg: "#2563eb",
        knobLeft: 22,
      }
    : {
        aside: "rgba(255,255,255,0.98)",
        border: "rgba(37,99,235,0.12)",
        logoTitle: "#0f172a",
        logoSub: "rgba(15,23,42,0.4)",
        sectionLabel: "rgba(15,23,42,0.35)",
        navText: "rgba(15,23,42,0.6)",
        navActive: "#2563eb",
        navActiveBg: "rgba(37,99,235,0.1)",
        navHoverBg: "rgba(37,99,235,0.06)",
        dotColor: "rgba(15,23,42,0.5)",
        emptyText: "rgba(15,23,42,0.3)",
        plusColor: "rgba(15,23,42,0.4)",
        userName: "#0f172a",
        userRole: "rgba(15,23,42,0.45)",
        logoutColor: "rgba(15,23,42,0.35)",
        toggleBg: "rgba(37,99,235,0.08)",
        toggleBorder: "rgba(37,99,235,0.25)",
        toggleLabel: "#2563eb",
        trackBg: "#e2e8f0",
        knobLeft: 3,
      };

  function NavRow({ to, icon, label }) {
    return (
      <NavLink to={to} style={{ textDecoration: "none" }}>
        {({ isActive }) => (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 16px",
              margin: "2px 8px",
              borderRadius: 9,
              background: isActive ? t.navActiveBg : "transparent",
              color: isActive ? t.navActive : t.navText,
              fontSize: 13,
              fontWeight: isActive ? 600 : 400,
              cursor: "pointer",
              transition: "all 0.15s",
              borderLeft: isActive
                ? `2px solid ${t.navActive}`
                : "2px solid transparent",
            }}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.background = t.navHoverBg;
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.background = "transparent";
            }}
          >
            <span style={{ fontSize: 15 }}>{icon}</span>
            <span>{label}</span>
          </div>
        )}
      </NavLink>
    );
  }

  return (
    <aside
      style={{
        width: 230,
        background: t.aside,
        backdropFilter: "blur(20px)",
        borderRight: `1px solid ${t.border}`,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        flexShrink: 0,
        transition: "background 0.3s, border-color 0.3s",
      }}
    >
      {/* ── Logo ── */}
      <div
        style={{
          padding: "20px 20px 16px",
          borderBottom: `1px solid ${t.border}`,
          display: "flex",
          alignItems: "center",
          gap: 12,
          transition: "border-color 0.3s",
        }}
      >
        <Logo size={38} />
        <div>
          <div
            style={{
              fontWeight: 800,
              fontSize: 16,
              color: t.logoTitle,
              letterSpacing: 0.5,
              transition: "color 0.3s",
            }}
          >
            RMS
          </div>
          <div
            style={{
              fontSize: 10,
              color: t.logoSub,
              letterSpacing: 0.5,
              transition: "color 0.3s",
            }}
          >
            Record Management
          </div>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav style={{ flex: 1, paddingTop: 14, overflowY: "auto" }}>
        <NavRow to="/dashboard" icon="⊞" label="Dashboard" />

        {/* Modules section */}
        <div style={{ marginTop: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "4px 16px 8px",
              marginBottom: 2,
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: t.sectionLabel,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                transition: "color 0.3s",
              }}
            >
              Modules
            </span>
            {isAdmin && (
              <NavLink to="/modules/new" style={{ textDecoration: "none" }}>
                <span
                  style={{
                    fontSize: 18,
                    color: t.plusColor,
                    cursor: "pointer",
                    lineHeight: 1,
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={(e) => (e.target.style.color = t.navActive)}
                  onMouseLeave={(e) => (e.target.style.color = t.plusColor)}
                >
                  +
                </span>
              </NavLink>
            )}
          </div>

          {modules.length === 0 ? (
            <div
              style={{
                padding: "6px 18px",
                fontSize: 12,
                color: t.emptyText,
                fontStyle: "italic",
              }}
            >
              No modules yet
            </div>
          ) : (
            modules.map((m) => (
              <NavLink
                key={m.id}
                to={`/modules/${m.id}`}
                style={{ textDecoration: "none" }}
              >
                {({ isActive }) => (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      padding: "8px 16px",
                      margin: "1px 8px",
                      borderRadius: 8,
                      background: isActive ? t.navActiveBg : "transparent",
                      color: isActive ? t.navActive : t.dotColor,
                      fontSize: 13,
                      fontWeight: isActive ? 600 : 400,
                      cursor: "pointer",
                      transition: "all 0.15s",
                      borderLeft: isActive
                        ? `2px solid ${t.navActive}`
                        : "2px solid transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive)
                        e.currentTarget.style.background = t.navHoverBg;
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive)
                        e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "currentColor",
                        opacity: 0.6,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {m.name}
                    </span>
                  </div>
                )}
              </NavLink>
            ))
          )}
        </div>

        <div style={{ marginTop: 8 }}>
          <NavRow to="/modules" icon="☰" label="All Modules" />
          {isAdmin && <NavRow to="/users" icon="👥" label="Users" />}
        </div>

        {/* ── Recycle Bin — admin only ── */}
        {isAdmin && (
          <div
            style={{
              marginTop: 8,
              paddingTop: 8,
              borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
            }}
          >
            <NavLink to="/recycle-bin" style={{ textDecoration: "none" }}>
              {({ isActive }) => (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 16px",
                    margin: "2px 8px",
                    borderRadius: 9,
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 400,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    background: isActive
                      ? "rgba(239,68,68,0.12)"
                      : "transparent",
                    color: isActive
                      ? isDark
                        ? "#f87171"
                        : "#dc2626"
                      : isDark
                        ? "rgba(248,113,113,0.6)"
                        : "rgba(220,38,38,0.55)",
                    borderLeft: isActive
                      ? `2px solid ${isDark ? "#f87171" : "#dc2626"}`
                      : "2px solid transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive)
                      e.currentTarget.style.background = isDark
                        ? "rgba(239,68,68,0.08)"
                        : "rgba(239,68,68,0.05)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive)
                      e.currentTarget.style.background = "transparent";
                  }}
                >
                  <span style={{ fontSize: 15 }}>🗑️</span>
                  <span>Recycle Bin</span>
                </div>
              )}
            </NavLink>
          </div>
        )}
      </nav>

      {/* ── Theme Toggle ── */}
      <div
        style={{
          padding: "10px 14px",
          borderTop: `1px solid ${t.border}`,
          transition: "border-color 0.3s",
        }}
      >
        <button
          onClick={toggleTheme}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 14px",
            borderRadius: 10,
            border: `1px solid ${t.toggleBorder}`,
            background: t.toggleBg,
            cursor: "pointer",
            transition: "all 0.3s",
          }}
        >
          {/* Icon + label */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 15 }}>{isDark ? "🌙" : "☀️"}</span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: t.toggleLabel,
                transition: "color 0.3s",
              }}
            >
              {isDark ? "Dark Mode" : "Light Mode"}
            </span>
          </div>

          {/* Pill toggle */}
          <div
            style={{
              width: 44,
              height: 24,
              borderRadius: 99,
              background: t.trackBg,
              position: "relative",
              transition: "background 0.3s",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 3,
                left: isDark ? 23 : 3,
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "#fff",
                boxShadow: "0 1px 4px rgba(0,0,0,0.35)",
                transition: "left 0.25s",
              }}
            />
          </div>
        </button>
      </div>

      {/* ── User footer ── */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: `1px solid ${t.border}`,
          display: "flex",
          alignItems: "center",
          gap: 10,
          transition: "border-color 0.3s",
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: "linear-gradient(135deg,#2563eb,#4B9FFF)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 700,
            color: "#fff",
            flexShrink: 0,
          }}
        >
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: t.userName,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              transition: "color 0.3s",
            }}
          >
            {user?.name}
          </div>
          <div
            style={{
              fontSize: 11,
              color: t.userRole,
              textTransform: "capitalize",
              transition: "color 0.3s",
            }}
          >
            {user?.role?.toLowerCase()}
          </div>
        </div>
        <button
          onClick={logout}
          title="Logout"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: t.logoutColor,
            fontSize: 16,
            padding: 4,
            transition: "color 0.15s",
            display: "flex",
            alignItems: "center",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
          onMouseLeave={(e) => (e.currentTarget.style.color = t.logoutColor)}
        >
          ⏻
        </button>
      </div>
    </aside>
  );
}
