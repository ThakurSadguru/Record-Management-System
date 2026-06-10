// src/components/plan/PlanGate.jsx
import { useNavigate } from "react-router-dom";
import { useTheme } from "../layout/AppLayout";

// ── Upgrade banner (near/at any limit) ───────────────────────────────────────
export function UpgradeBanner({ type, count, max, isDark }) {
  const navigate = useNavigate();
  if (max === Infinity) return null;
  const nearLimit = count >= max * 0.8;
  const atLimit = count >= max;
  if (!nearLimit) return null;

  const msgs = {
    records: {
      near: `${count}/${max} records used.`,
      at: `${max}-record limit reached.`,
    },
    modules: {
      near: `${count}/${max} modules used.`,
      at: `Module limit reached.`,
    },
    users: {
      near: `${count}/${max} user seats used.`,
      at: `User limit reached.`,
    },
    submodules: {
      near: "Sub-modules are a Pro feature.",
      at: "Sub-modules require Pro.",
    },
    export: { near: "Export is a Pro feature.", at: "Upgrade to export." },
  };
  const msg = (msgs[type] ?? msgs.records)[atLimit ? "at" : "near"];

  return (
    <div
      style={{
        padding: "12px 18px",
        borderRadius: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        background: isDark
          ? atLimit
            ? "rgba(239,68,68,0.07)"
            : "rgba(251,191,36,0.07)"
          : atLimit
            ? "#fef2f2"
            : "#fffbeb",
        border: `1px solid ${
          isDark
            ? atLimit
              ? "rgba(239,68,68,0.2)"
              : "rgba(251,191,36,0.2)"
            : atLimit
              ? "#fecaca"
              : "#fde68a"
        }`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 18 }}>{atLimit ? "🚫" : "⚠️"}</span>
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: isDark
                ? atLimit
                  ? "#f87171"
                  : "#fbbf24"
                : atLimit
                  ? "#dc2626"
                  : "#d97706",
            }}
          >
            {atLimit ? "Limit Reached" : "Approaching Limit"}
          </div>
          <div
            style={{
              fontSize: 11,
              color: isDark ? "rgba(255,255,255,0.45)" : "#64748b",
              marginTop: 1,
            }}
          >
            {msg}
          </div>
        </div>
      </div>
      <button
        onClick={() => navigate("/pricing")}
        style={{
          padding: "6px 14px",
          borderRadius: 7,
          cursor: "pointer",
          background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
          border: "none",
          color: "#fff",
          fontSize: 11,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        Upgrade →
      </button>
    </div>
  );
}

// ── Feature lock overlay (for PRO-only sections) ──────────────────────────────
export function FeatureLock({
  icon = "⭐",
  title,
  description,
  isDark,
  blurPreview,
  children,
}) {
  const navigate = useNavigate();
  return (
    <div style={{ position: "relative", borderRadius: 12, overflow: "hidden" }}>
      {/* Optional blurred preview of the content beneath */}
      {blurPreview && children && (
        <div
          style={{
            filter: "blur(4px)",
            opacity: 0.35,
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          {children}
        </div>
      )}
      {/* Lock overlay */}
      <div
        style={{
          ...(blurPreview ? { position: "absolute", inset: 0 } : {}),
          background: isDark ? "rgba(251,191,36,0.05)" : "#fffbeb",
          border: `1px solid ${isDark ? "rgba(251,191,36,0.15)" : "#fde68a"}`,
          borderRadius: 12,
          padding: "28px 24px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        }}
      >
        <div style={{ fontSize: 32 }}>{icon}</div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: isDark ? "#fbbf24" : "#d97706",
          }}
        >
          {title}
        </div>
        <p
          style={{
            fontSize: 13,
            color: isDark ? "rgba(255,255,255,0.4)" : "#64748b",
            margin: 0,
            maxWidth: 340,
            lineHeight: 1.6,
          }}
        >
          {description}
        </p>
        <button
          onClick={() => navigate("/pricing")}
          style={{
            marginTop: 6,
            padding: "9px 22px",
            borderRadius: 9,
            cursor: "pointer",
            background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
            border: "none",
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          Upgrade to Professional →
        </button>
      </div>
    </div>
  );
}

// ── Pro badge (inline, for locked widgets/buttons) ────────────────────────────
export function ProBadge({ onClick, isDark }) {
  return (
    <span
      onClick={onClick}
      style={{
        fontSize: 10,
        fontWeight: 700,
        padding: "2px 8px",
        borderRadius: 99,
        cursor: "pointer",
        background: isDark ? "rgba(251,191,36,0.1)" : "#fffbeb",
        color: isDark ? "#fbbf24" : "#d97706",
        border: isDark ? "1px solid rgba(251,191,36,0.2)" : "1px solid #fde68a",
      }}
    >
      ⭐ Pro
    </span>
  );
}
