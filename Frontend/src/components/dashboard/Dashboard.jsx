import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { useTheme } from "../layout/AppLayout";

// ── Animated counter ──────────────────────────────────────────────────────────
function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = Number(value) || 0;
    if (start === end) {
      setDisplay(end);
      return;
    }
    const duration = 800;
    const step = Math.ceil(end / (duration / 16));
    const timer = setInterval(() => {
      start = Math.min(start + step, end);
      setDisplay(start);
      if (start >= end) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return typeof value === "number" ? display : value;
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color, isDark, delay = 0 }) {
  const palette = {
    emerald: {
      grad: isDark
        ? "linear-gradient(135deg,rgba(16,185,129,0.18),rgba(5,150,105,0.08))"
        : "linear-gradient(135deg,#d1fae5,#a7f3d0)",
      border: isDark ? "rgba(16,185,129,0.25)" : "#6ee7b7",
      icon: isDark ? "rgba(16,185,129,0.2)" : "rgba(16,185,129,0.15)",
      iconText: isDark ? "#10b981" : "#065f46",
      val: isDark ? "#34d399" : "#065f46",
      lbl: isDark ? "rgba(255,255,255,0.5)" : "#047857",
      glow: "rgba(16,185,129,0.15)",
    },
    blue: {
      grad: isDark
        ? "linear-gradient(135deg,rgba(59,130,246,0.18),rgba(37,99,235,0.08))"
        : "linear-gradient(135deg,#dbeafe,#bfdbfe)",
      border: isDark ? "rgba(59,130,246,0.25)" : "#93c5fd",
      icon: isDark ? "rgba(59,130,246,0.2)" : "rgba(59,130,246,0.15)",
      iconText: isDark ? "#60a5fa" : "#1e40af",
      val: isDark ? "#60a5fa" : "#1e40af",
      lbl: isDark ? "rgba(255,255,255,0.5)" : "#1d4ed8",
      glow: "rgba(59,130,246,0.15)",
    },
    violet: {
      grad: isDark
        ? "linear-gradient(135deg,rgba(139,92,246,0.18),rgba(109,40,217,0.08))"
        : "linear-gradient(135deg,#ede9fe,#ddd6fe)",
      border: isDark ? "rgba(139,92,246,0.25)" : "#c4b5fd",
      icon: isDark ? "rgba(139,92,246,0.2)" : "rgba(139,92,246,0.15)",
      iconText: isDark ? "#a78bfa" : "#5b21b6",
      val: isDark ? "#a78bfa" : "#5b21b6",
      lbl: isDark ? "rgba(255,255,255,0.5)" : "#6d28d9",
      glow: "rgba(139,92,246,0.15)",
    },
    amber: {
      grad: isDark
        ? "linear-gradient(135deg,rgba(245,158,11,0.18),rgba(217,119,6,0.08))"
        : "linear-gradient(135deg,#fef3c7,#fde68a)",
      border: isDark ? "rgba(245,158,11,0.25)" : "#fcd34d",
      icon: isDark ? "rgba(245,158,11,0.2)" : "rgba(245,158,11,0.15)",
      iconText: isDark ? "#fbbf24" : "#92400e",
      val: isDark ? "#fbbf24" : "#92400e",
      lbl: isDark ? "rgba(255,255,255,0.5)" : "#b45309",
      glow: "rgba(245,158,11,0.15)",
    },
  };
  const p = palette[color] || palette.blue;

  return (
    <div
      style={{
        flex: 1,
        background: p.grad,
        border: `1px solid ${p.border}`,
        borderRadius: 16,
        padding: "20px 22px",
        position: "relative",
        overflow: "hidden",
        boxShadow: isDark ? `0 8px 32px ${p.glow}` : `0 4px 20px ${p.glow}`,
        animation: `fadeSlideUp 0.5s ease ${delay}ms both`,
      }}
    >
      {/* Subtle corner glow */}
      <div
        style={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: p.glow,
          filter: "blur(20px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: p.icon,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
          }}
        >
          {icon}
        </div>
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: p.val,
            opacity: 0.6,
            marginTop: 4,
          }}
        />
      </div>

      <div
        style={{
          fontSize: 28,
          fontWeight: 900,
          color: p.val,
          lineHeight: 1,
          marginBottom: 5,
          letterSpacing: -1,
        }}
      >
        <AnimatedNumber value={typeof value === "number" ? value : value} />
      </div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: p.lbl,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {label}
      </div>
    </div>
  );
}

// ── Module card ───────────────────────────────────────────────────────────────
function ModuleCard({ module, isDark, index }) {
  const avatarColors = [
    ["#3b82f6", "#1d4ed8"],
    ["#8b5cf6", "#6d28d9"],
    ["#10b981", "#065f46"],
    ["#f59e0b", "#92400e"],
    ["#ef4444", "#991b1b"],
    ["#06b6d4", "#0e7490"],
  ];
  const [c1, c2] = avatarColors[index % avatarColors.length];

  return (
    <Link to={`/modules/${module.id}`} style={{ textDecoration: "none" }}>
      <div
        style={{
          background: isDark ? "rgba(255,255,255,0.04)" : "#ffffff",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8f0fe"}`,
          borderRadius: 16,
          padding: "20px 22px",
          cursor: "pointer",
          transition: "all 0.2s ease",
          boxShadow: isDark
            ? "0 2px 16px rgba(0,0,0,0.2)"
            : "0 2px 12px rgba(37,99,235,0.06)",
          animation: `fadeSlideUp 0.5s ease ${100 + index * 60}ms both`,
          position: "relative",
          overflow: "hidden",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-3px)";
          e.currentTarget.style.boxShadow = isDark
            ? `0 12px 40px rgba(0,0,0,0.3)`
            : `0 12px 32px rgba(37,99,235,0.14)`;
          e.currentTarget.style.borderColor = isDark
            ? "rgba(255,255,255,0.16)"
            : "#bfdbfe";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = isDark
            ? "0 2px 16px rgba(0,0,0,0.2)"
            : "0 2px 12px rgba(37,99,235,0.06)";
          e.currentTarget.style.borderColor = isDark
            ? "rgba(255,255,255,0.08)"
            : "#e8f0fe";
        }}
      >
        {/* Top row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: `linear-gradient(135deg,${c1},${c2})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 800,
              fontSize: 16,
              boxShadow: `0 4px 12px ${c1}55`,
            }}
          >
            {module.name[0].toUpperCase()}
          </div>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: isDark ? "rgba(255,255,255,0.25)" : "#94a3b8",
              background: isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9",
              padding: "3px 8px",
              borderRadius: 99,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            View →
          </span>
        </div>

        {/* Name */}
        <div
          style={{
            fontWeight: 700,
            fontSize: 15,
            color: isDark ? "#fff" : "#0f172a",
            marginBottom: 6,
            letterSpacing: -0.3,
          }}
        >
          {module.name}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: isDark ? "rgba(255,255,255,0.2)" : "#cbd5e1",
            }}
          />
          <span
            style={{
              fontSize: 11,
              color: isDark ? "rgba(255,255,255,0.35)" : "#94a3b8",
              fontWeight: 500,
            }}
          >
            {module.fields?.length ?? 0} field
            {module.fields?.length !== 1 ? "s" : ""}
          </span>
          {(module.subModules?.length ?? 0) > 0 && (
            <>
              <div
                style={{
                  width: 3,
                  height: 3,
                  borderRadius: "50%",
                  background: isDark ? "rgba(255,255,255,0.15)" : "#e2e8f0",
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  color: isDark ? "rgba(99,102,241,0.7)" : "#6366f1",
                  fontWeight: 500,
                }}
              >
                {module.subModules.length} sub
              </span>
            </>
          )}
        </div>

        {/* Hover shine */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            background: `linear-gradient(90deg,transparent,${c1}44,transparent)`,
          }}
        />
      </div>
    </Link>
  );
}

// ── Quick action button ───────────────────────────────────────────────────────
function QuickAction({ to, icon, label, desc, color, isDark }) {
  const colors = {
    blue: {
      bg: isDark ? "rgba(59,130,246,0.1)" : "#eff6ff",
      border: isDark ? "rgba(59,130,246,0.2)" : "#bfdbfe",
      text: isDark ? "#60a5fa" : "#1d4ed8",
    },
    green: {
      bg: isDark ? "rgba(16,185,129,0.1)" : "#f0fdf4",
      border: isDark ? "rgba(16,185,129,0.2)" : "#bbf7d0",
      text: isDark ? "#34d399" : "#15803d",
    },
    violet: {
      bg: isDark ? "rgba(139,92,246,0.1)" : "#f5f3ff",
      border: isDark ? "rgba(139,92,246,0.2)" : "#ddd6fe",
      text: isDark ? "#a78bfa" : "#6d28d9",
    },
    amber: {
      bg: isDark ? "rgba(245,158,11,0.1)" : "#fffbeb",
      border: isDark ? "rgba(245,158,11,0.2)" : "#fde68a",
      text: isDark ? "#fbbf24" : "#b45309",
    },
  };
  const c = colors[color] || colors.blue;
  return (
    <Link to={to} style={{ textDecoration: "none" }}>
      <div
        style={{
          background: c.bg,
          border: `1px solid ${c.border}`,
          borderRadius: 12,
          padding: "14px 16px",
          cursor: "pointer",
          transition: "all 0.18s",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateX(3px)";
          e.currentTarget.style.opacity = "0.85";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateX(0)";
          e.currentTarget.style.opacity = "1";
        }}
      >
        <div style={{ fontSize: 22, lineHeight: 1 }}>{icon}</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: c.text }}>
            {label}
          </div>
          <div
            style={{
              fontSize: 11,
              color: isDark ? "rgba(255,255,255,0.35)" : "#94a3b8",
              marginTop: 2,
            }}
          >
            {desc}
          </div>
        </div>
        <div
          style={{
            marginLeft: "auto",
            fontSize: 16,
            color: isDark ? "rgba(255,255,255,0.2)" : "#cbd5e1",
          }}
        >
          →
        </div>
      </div>
    </Link>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { isDark } = useTheme();
  const { user, isAdmin } = useAuth();
  const { modules, loadModules } = useData();

  useEffect(() => {
    loadModules();
  }, [loadModules]);

  const totalFields = modules.reduce((s, m) => s + (m.fields?.length ?? 0), 0);
  const totalRecords = 0; // placeholder — wire to your records count if available
  const recentModules = [...modules].slice(0, 6);

  const textPrimary = isDark ? "#fff" : "#0f172a";
  const textSecondary = isDark ? "rgba(255,255,255,0.45)" : "#64748b";
  const cardBg = isDark ? "rgba(255,255,255,0.03)" : "#ffffff";
  const cardBorder = isDark ? "rgba(255,255,255,0.07)" : "#e8f0fe";
  const divider = isDark ? "rgba(255,255,255,0.07)" : "#f1f5f9";

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div
      style={{ padding: "32px 40px", minHeight: "100%", color: textPrimary }}
    >
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%,100% { opacity: 1; } 50% { opacity: 0.5; }
        }
      `}</style>

      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 32,
          animation: "fadeSlideUp 0.4s ease both",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 6,
            }}
          >
            <h1
              style={{
                fontSize: 26,
                fontWeight: 900,
                margin: 0,
                letterSpacing: -0.8,
                color: textPrimary,
              }}
            >
              {greeting}, {user?.name?.split(" ")[0]}
            </h1>
            <span style={{ fontSize: 24 }}>👋</span>
          </div>
          <p
            style={{
              color: textSecondary,
              fontSize: 13,
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#10b981",
                  display: "inline-block",
                  animation: "pulse 2s infinite",
                }}
              />
              System live
            </span>
            <span
              style={{ color: isDark ? "rgba(255,255,255,0.15)" : "#e2e8f0" }}
            >
              ·
            </span>
            <span>
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </span>
          </p>
        </div>

        {isAdmin && (
          <Link to="/modules/new" style={{ textDecoration: "none" }}>
            <button
              style={{
                padding: "10px 20px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 4px 16px rgba(37,99,235,0.4)",
                letterSpacing: 0.2,
              }}
            >
              <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
              New Module
            </button>
          </Link>
        )}
      </div>

      {/* ── Stats row ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 14,
          marginBottom: 32,
        }}
      >
        <StatCard
          label="Modules"
          value={modules.length}
          icon="📦"
          color="emerald"
          isDark={isDark}
          delay={0}
        />
        <StatCard
          label="Total Fields"
          value={totalFields}
          icon="🔧"
          color="blue"
          isDark={isDark}
          delay={80}
        />
        <StatCard
          label="Your Role"
          value={user?.role}
          icon="🛡️"
          color="violet"
          isDark={isDark}
          delay={160}
        />
        <StatCard
          label="Status"
          value="Live"
          icon="⚡"
          color="amber"
          isDark={isDark}
          delay={240}
        />
      </div>

      {/* ── Main content: modules grid + sidebar ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 280px",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* Left: Modules */}
        <div>
          {/* Section header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h2
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  margin: 0,
                  color: textPrimary,
                  letterSpacing: -0.3,
                }}
              >
                Modules
              </h2>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: 99,
                  background: isDark ? "rgba(59,130,246,0.15)" : "#dbeafe",
                  color: isDark ? "#60a5fa" : "#1d4ed8",
                }}
              >
                {modules.length}
              </span>
            </div>
            <Link to="/modules" style={{ textDecoration: "none" }}>
              <button
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  background: isDark ? "rgba(255,255,255,0.05)" : "#f8fafc",
                  border: isDark
                    ? "1px solid rgba(255,255,255,0.1)"
                    : "1px solid #e2e8f0",
                  color: isDark ? "rgba(255,255,255,0.6)" : "#64748b",
                }}
              >
                View all →
              </button>
            </Link>
          </div>

          {modules.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "56px 20px",
                background: cardBg,
                border: `1.5px dashed ${isDark ? "rgba(255,255,255,0.1)" : "#cbd5e1"}`,
                borderRadius: 16,
              }}
            >
              <div style={{ fontSize: 44, marginBottom: 14 }}>📂</div>
              <div
                style={{
                  fontWeight: 700,
                  color: isDark ? "rgba(255,255,255,0.5)" : "#475569",
                  marginBottom: 6,
                }}
              >
                No modules yet
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: textSecondary,
                  margin: "0 0 20px",
                }}
              >
                Create your first module to start managing records
              </p>
              {isAdmin && (
                <Link to="/modules/new" style={{ textDecoration: "none" }}>
                  <button
                    style={{
                      padding: "10px 24px",
                      borderRadius: 9,
                      background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
                      border: "none",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    Create Module
                  </button>
                </Link>
              )}
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 14,
              }}
            >
              {recentModules.map((m, i) => (
                <ModuleCard key={m.id} module={m} isDark={isDark} index={i} />
              ))}
            </div>
          )}

          {modules.length > 6 && (
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <Link to="/modules" style={{ textDecoration: "none" }}>
                <button
                  style={{
                    padding: "9px 22px",
                    borderRadius: 9,
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 600,
                    background: isDark ? "rgba(255,255,255,0.05)" : "#f8fafc",
                    border: isDark
                      ? "1px solid rgba(255,255,255,0.1)"
                      : "1px solid #e2e8f0",
                    color: textSecondary,
                  }}
                >
                  View {modules.length - 6} more modules →
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Profile card */}
          <div
            style={{
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              borderRadius: 16,
              padding: "20px",
              boxShadow: isDark ? "none" : "0 2px 12px rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "linear-gradient(135deg,#2563eb,#7c3aed)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  fontWeight: 800,
                  color: "#fff",
                  boxShadow: "0 4px 14px rgba(37,99,235,0.4)",
                }}
              >
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div
                  style={{ fontWeight: 700, fontSize: 14, color: textPrimary }}
                >
                  {user?.name}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: textSecondary,
                    marginTop: 2,
                    textTransform: "capitalize",
                  }}
                >
                  {user?.role?.toLowerCase()}
                </div>
              </div>
            </div>
            <div
              style={{
                borderTop: `1px solid ${divider}`,
                paddingTop: 14,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              <div
                style={{
                  textAlign: "center",
                  padding: "10px 8px",
                  borderRadius: 10,
                  background: isDark ? "rgba(255,255,255,0.04)" : "#f8fafc",
                }}
              >
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 900,
                    color: isDark ? "#60a5fa" : "#1d4ed8",
                  }}
                >
                  {modules.length}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: textSecondary,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginTop: 2,
                  }}
                >
                  Modules
                </div>
              </div>
              <div
                style={{
                  textAlign: "center",
                  padding: "10px 8px",
                  borderRadius: 10,
                  background: isDark ? "rgba(255,255,255,0.04)" : "#f8fafc",
                }}
              >
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 900,
                    color: isDark ? "#34d399" : "#065f46",
                  }}
                >
                  {totalFields}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: textSecondary,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginTop: 2,
                  }}
                >
                  Fields
                </div>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div
            style={{
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              borderRadius: 16,
              padding: "18px 20px",
              boxShadow: isDark ? "none" : "0 2px 12px rgba(0,0,0,0.04)",
            }}
          >
            <h3
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: textSecondary,
                margin: "0 0 12px",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Quick Actions
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <QuickAction
                to="/modules"
                icon="📋"
                label="All Modules"
                desc="Browse every module"
                color="blue"
                isDark={isDark}
              />
              {isAdmin && (
                <QuickAction
                  to="/modules/new"
                  icon="✨"
                  label="New Module"
                  desc="Create a module"
                  color="green"
                  isDark={isDark}
                />
              )}
              {isAdmin && (
                <QuickAction
                  to="/users"
                  icon="👥"
                  label="Users"
                  desc="Manage team members"
                  color="violet"
                  isDark={isDark}
                />
              )}
            </div>
          </div>

          {/* System info */}
          <div
            style={{
              background: isDark ? "rgba(37,99,235,0.08)" : "#eff6ff",
              border: `1px solid ${isDark ? "rgba(37,99,235,0.2)" : "#bfdbfe"}`,
              borderRadius: 16,
              padding: "16px 18px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 10,
              }}
            >
              <span style={{ fontSize: 14 }}>ℹ️</span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: isDark ? "#60a5fa" : "#1d4ed8",
                }}
              >
                System Info
              </span>
            </div>
            {[
              { label: "Version", value: "v1.0.0" },
              { label: "Environment", value: "Production" },
              { label: "Uptime", value: "99.9%" },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "6px 0",
                  borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "#e0effe"}`,
                }}
              >
                <span style={{ fontSize: 11, color: textSecondary }}>
                  {label}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: isDark ? "#93c5fd" : "#1d4ed8",
                  }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
