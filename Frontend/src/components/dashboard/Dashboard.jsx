import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { useTheme } from "../layout/AppLayout";

function StatCard({ label, value, color, isDark }) {
  const colors = {
    green: {
      bg: isDark ? "rgba(52,211,153,0.08)" : "#d1fae5",
      border: isDark ? "rgba(52,211,153,0.2)" : "#6ee7b7",
      text: isDark ? "#34d399" : "#065f46",
      labelColor: isDark ? "rgba(255,255,255,0.5)" : "#047857",
    },
    blue: {
      bg: isDark ? "rgba(74,159,255,0.08)" : "#dbeafe",
      border: isDark ? "rgba(74,159,255,0.2)" : "#93c5fd",
      text: isDark ? "#4B9FFF" : "#1e40af",
      labelColor: isDark ? "rgba(255,255,255,0.5)" : "#1d4ed8",
    },
    purple: {
      bg: isDark ? "rgba(167,139,250,0.08)" : "#ede9fe",
      border: isDark ? "rgba(167,139,250,0.2)" : "#c4b5fd",
      text: isDark ? "#a78bfa" : "#5b21b6",
      labelColor: isDark ? "rgba(255,255,255,0.5)" : "#6d28d9",
    },
    amber: {
      bg: isDark ? "rgba(251,191,36,0.08)" : "#fef3c7",
      border: isDark ? "rgba(251,191,36,0.2)" : "#fcd34d",
      text: isDark ? "#fbbf24" : "#92400e",
      labelColor: isDark ? "rgba(255,255,255,0.5)" : "#b45309",
    },
  };
  const c = colors[color] || colors.blue;
  return (
    <div
      style={{
        background: c.bg,
        border: `1.5px solid ${c.border}`,
        borderRadius: 12,
        padding: "16px 20px",
        flex: 1,
      }}
    >
      <div
        style={{
          fontSize: 22,
          fontWeight: 800,
          color: c.text,
          marginBottom: 4,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 12,
          color: c.labelColor,
          fontWeight: 600,
        }}
      >
        {label}
      </div>
    </div>
  );
}

function ModuleCard({ module, isDark }) {
  return (
    <Link to={`/modules/${module.id}`} style={{ textDecoration: "none" }}>
      <div
        style={{
          background: isDark ? "rgba(255,255,255,0.04)" : "#ffffff",
          border: isDark
            ? "1px solid rgba(255,255,255,0.1)"
            : "1.5px solid #bfdbfe",
          borderRadius: 14,
          padding: "20px",
          cursor: "pointer",
          transition: "all 0.2s",
          boxShadow: isDark ? "none" : "0 2px 8px rgba(37,99,235,0.08)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = isDark
            ? "rgba(74,159,255,0.08)"
            : "#eff6ff";
          e.currentTarget.style.borderColor = isDark
            ? "rgba(74,159,255,0.3)"
            : "#93c5fd";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = isDark
            ? "rgba(255,255,255,0.04)"
            : "#ffffff";
          e.currentTarget.style.borderColor = isDark
            ? "rgba(255,255,255,0.1)"
            : "#bfdbfe";
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: isDark ? "rgba(74,159,255,0.15)" : "#dbeafe",
              border: isDark
                ? "1px solid rgba(74,159,255,0.25)"
                : "1.5px solid #93c5fd",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: isDark ? "#4B9FFF" : "#1d4ed8",
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            {module.name[0].toUpperCase()}
          </div>
          <span
            style={{
              fontSize: 12,
              color: isDark ? "#4B9FFF" : "#2563eb",
              fontWeight: 600,
            }}
          >
            View →
          </span>
        </div>
        <div
          style={{
            fontWeight: 700,
            fontSize: 15,
            color: isDark ? "#fff" : "#0f172a",
            marginBottom: 4,
          }}
        >
          {module.name}
        </div>
        <div
          style={{
            fontSize: 12,
            color: isDark ? "rgba(255,255,255,0.4)" : "#64748b",
            fontWeight: 500,
          }}
        >
          {module.fields?.length ?? 0} fields
        </div>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const { isDark } = useTheme();
  const { user, isAdmin } = useAuth();
  const { modules, loadModules } = useData();

  useEffect(() => {
    loadModules();
  }, [loadModules]);

  const totalFields = modules.reduce((s, m) => s + (m.fields?.length ?? 0), 0);

  const textPrimary = isDark ? "#fff" : "#0f172a";
  const textSecondary = isDark ? "rgba(255,255,255,0.45)" : "#475569";
  const headingColor = isDark ? "#fff" : "#1e293b";
  const sectionBorder = isDark
    ? "rgba(255,255,255,0.08)"
    : "rgba(37,99,235,0.15)";

  return (
    <div
      style={{ padding: "36px 40px", minHeight: "100%", color: textPrimary }}
    >
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 800,
            margin: "0 0 6px",
            letterSpacing: -0.5,
            color: textPrimary,
          }}
        >
          Good day, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p style={{ color: textSecondary, fontSize: 14, margin: 0 }}>
          Here's your RMS overview
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 14, marginBottom: 32 }}>
        <StatCard
          label="Modules"
          value={modules.length}
          color="green"
          isDark={isDark}
        />
        <StatCard
          label="Total Fields"
          value={totalFields}
          color="blue"
          isDark={isDark}
        />
        <StatCard
          label="Your Role"
          value={user?.role}
          color="purple"
          isDark={isDark}
        />
        <StatCard label="Status" value="Live" color="amber" isDark={isDark} />
      </div>

      {/* Modules section */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <h2
            style={{
              fontSize: 18,
              fontWeight: 700,
              margin: 0,
              color: headingColor,
            }}
          >
            Modules
          </h2>
          <div style={{ display: "flex", gap: 10 }}>
            <Link to="/modules" style={{ textDecoration: "none" }}>
              <button
                style={{
                  padding: "8px 18px",
                  borderRadius: 8,
                  background: isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9",
                  border: isDark
                    ? "1px solid rgba(255,255,255,0.15)"
                    : "1.5px solid #cbd5e1",
                  color: isDark ? "rgba(255,255,255,0.8)" : "#334155",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                View all
              </button>
            </Link>
            {isAdmin && (
              <Link to="/modules/new" style={{ textDecoration: "none" }}>
                <button
                  style={{
                    padding: "8px 18px",
                    borderRadius: 8,
                    background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
                    border: "none",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(37,99,235,0.4)",
                  }}
                >
                  + New
                </button>
              </Link>
            )}
          </div>
        </div>

        {modules.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              background: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc",
              border: isDark
                ? "1px dashed rgba(255,255,255,0.12)"
                : "1.5px dashed #94a3b8",
              borderRadius: 14,
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 14 }}>📂</div>
            <div
              style={{
                color: isDark ? "rgba(255,255,255,0.6)" : "#475569",
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              No modules yet
            </div>
            {isAdmin && (
              <Link to="/modules/new" style={{ textDecoration: "none" }}>
                <button
                  style={{
                    marginTop: 12,
                    padding: "10px 24px",
                    borderRadius: 8,
                    background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
                    border: "none",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  Create your first module
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16,
            }}
          >
            {modules.map((m) => (
              <ModuleCard key={m.id} module={m} isDark={isDark} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
