import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../layout/AppLayout";
import { moduleApi } from "../../api/moduleApi";
import { recordApi } from "../../api/recordApi";
import { userApi } from "../../api/userApi";
import { activityApi } from "../../api/activityApi";
import { getPlanLimits } from "../../utils/planLimits";

// ─────────────────────────────────────────────────────────────────────────────
// Plan limits
// ─────────────────────────────────────────────────────────────────────────────
// Import from utils/planLimits.js — inlined here for completeness
// Remove this block if you already import getPlanLimits above
/*
const PLAN_LIMITS = { ... };
function getPlanLimits(plan) { ... }
*/

// ─────────────────────────────────────────────────────────────────────────────
// Small UI atoms
// ─────────────────────────────────────────────────────────────────────────────

function PlanBadge({ plan, isDark }) {
  const cfg = {
    STARTER: {
      label: "Free",
      bg: isDark ? "rgba(100,116,139,0.2)" : "#f1f5f9",
      color: isDark ? "#94a3b8" : "#475569",
    },
    PROFESSIONAL: {
      label: "Pro",
      bg: isDark ? "rgba(37,99,235,0.2)" : "#dbeafe",
      color: isDark ? "#60a5fa" : "#1d4ed8",
    },
    ENTERPRISE: {
      label: "Enterprise",
      bg: isDark ? "rgba(124,58,237,0.2)" : "#ede9fe",
      color: isDark ? "#a78bfa" : "#6d28d9",
    },
  }[plan?.toUpperCase()] ?? {
    label: "Free",
    bg: "rgba(100,116,139,0.15)",
    color: "#94a3b8",
  };
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        padding: "2px 8px",
        borderRadius: 99,
        background: cfg.bg,
        color: cfg.color,
        letterSpacing: "0.05em",
      }}
    >
      {cfg.label}
    </span>
  );
}

function ProBadge({ onClick, isDark }) {
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

function SectionHeader({ title, right, isDark }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 14,
      }}
    >
      <h2
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: isDark ? "#fff" : "#0f172a",
          margin: 0,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {title}
      </h2>
      {right}
    </div>
  );
}

function UpgradeBanner({ type, count, max, isDark, navigate }) {
  if (max === Infinity) return null;
  const near = count >= max * 0.8;
  const at = count >= max;
  if (!near) return null;
  const msg = at
    ? `You've reached your ${max}-${type} limit on the free plan.`
    : `Using ${count} of ${max} ${type}s — approaching your free plan limit.`;
  return (
    <div
      style={{
        padding: "12px 18px",
        borderRadius: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 6,
        background: isDark
          ? at
            ? "rgba(239,68,68,0.07)"
            : "rgba(251,191,36,0.07)"
          : at
            ? "#fef2f2"
            : "#fffbeb",
        border: `1px solid ${isDark ? (at ? "rgba(239,68,68,0.2)" : "rgba(251,191,36,0.2)") : at ? "#fecaca" : "#fde68a"}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 18 }}>{at ? "🚫" : "⚠️"}</span>
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: isDark
                ? at
                  ? "#f87171"
                  : "#fbbf24"
                : at
                  ? "#dc2626"
                  : "#d97706",
            }}
          >
            {at ? "Limit reached" : "Approaching limit"}
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
          flexShrink: 0,
          background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
          border: "none",
          color: "#fff",
          fontSize: 11,
          fontWeight: 700,
        }}
      >
        Upgrade →
      </button>
    </div>
  );
}

function FeatureLock({
  icon = "⭐",
  title,
  description,
  isDark,
  navigate,
  children,
  minHeight = 160,
}) {
  return (
    <div
      style={{
        position: "relative",
        borderRadius: 12,
        overflow: "hidden",
        minHeight,
      }}
    >
      {children && (
        <div
          style={{
            filter: "blur(3px)",
            opacity: 0.3,
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          {children}
        </div>
      )}
      <div
        style={{
          position: children ? "absolute" : "relative",
          inset: 0,
          background: isDark ? "rgba(251,191,36,0.05)" : "#fffbeb",
          border: `1px solid ${isDark ? "rgba(251,191,36,0.15)" : "#fde68a"}`,
          borderRadius: 12,
          padding: "24px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        <div style={{ fontSize: 28 }}>{icon}</div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: isDark ? "#fbbf24" : "#d97706",
          }}
        >
          {title}
        </div>
        <p
          style={{
            fontSize: 12,
            color: isDark ? "rgba(255,255,255,0.4)" : "#64748b",
            margin: 0,
            maxWidth: 300,
            lineHeight: 1.6,
          }}
        >
          {description}
        </p>
        <button
          onClick={() => navigate("/pricing")}
          style={{
            marginTop: 4,
            padding: "8px 20px",
            borderRadius: 8,
            cursor: "pointer",
            background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
            border: "none",
            color: "#fff",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          Upgrade to Professional →
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stat card
// ─────────────────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, icon, accent, max, isDark }) {
  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "#fff";
  const cardBorder = isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0";
  const textPrimary = isDark ? "#fff" : "#0f172a";
  const textSecondary = isDark ? "rgba(255,255,255,0.45)" : "#64748b";
  const pct =
    max && max !== Infinity ? Math.min((value / max) * 100, 100) : null;

  return (
    <div
      style={{
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        borderRadius: 14,
        padding: "20px 22px",
        boxShadow: isDark ? "none" : "0 1px 6px rgba(0,0,0,0.04)",
      }}
    >
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
            fontSize: 22,
            width: 40,
            height: 40,
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: isDark ? "rgba(255,255,255,0.06)" : "#f8fafc",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0"}`,
          }}
        >
          {icon}
        </div>
        {sub && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: sub.startsWith("+") ? "#16a34a" : textSecondary,
              background: sub.startsWith("+")
                ? isDark
                  ? "rgba(22,163,74,0.1)"
                  : "#dcfce7"
                : "transparent",
              padding: sub.startsWith("+") ? "2px 7px" : 0,
              borderRadius: 20,
            }}
          >
            {sub}
          </span>
        )}
      </div>
      <div
        style={{
          fontSize: 28,
          fontWeight: 800,
          color: textPrimary,
          letterSpacing: -0.5,
          marginBottom: 2,
        }}
      >
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      <div style={{ fontSize: 12, color: textSecondary, fontWeight: 500 }}>
        {label}
      </div>
      {pct !== null && (
        <div style={{ marginTop: 12 }}>
          <div
            style={{
              height: 4,
              borderRadius: 2,
              background: isDark ? "rgba(255,255,255,0.08)" : "#f1f5f9",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${pct}%`,
                borderRadius: 2,
                transition: "width 0.6s ease",
                background:
                  pct >= 100 ? "#ef4444" : pct >= 80 ? "#f59e0b" : accent,
              }}
            />
          </div>
          <div style={{ fontSize: 10, color: textSecondary, marginTop: 4 }}>
            {value}
            {max !== Infinity ? `/${max}` : ""} used
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Bar chart — built from activity log data (no extra endpoint needed)
// Groups the last 7 days of activity by day label
// ─────────────────────────────────────────────────────────────────────────────

function buildChartData(activityLogs) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  // Initialise last 7 days in order
  const map = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = days[d.getDay()];
    map[label] = { label, created: 0, updated: 0, deleted: 0 };
  }
  activityLogs.forEach((log) => {
    if (!log.timestamp) return;
    const d = new Date(log.timestamp);
    const diff = (Date.now() - d) / 86400000; // days ago
    if (diff > 7) return;
    const label = days[d.getDay()];
    if (!map[label]) return;
    const action = log.action?.toUpperCase();
    if (action === "CREATE") map[label].created++;
    else if (action === "UPDATE") map[label].updated++;
    else if (action === "DELETE") map[label].deleted++;
  });
  return Object.values(map);
}

function BarChart({ data, isDark }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data.length) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth,
      H = canvas.offsetHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const pad = { top: 12, right: 16, bottom: 28, left: 30 };
    const chartW = W - pad.left - pad.right;
    const chartH = H - pad.top - pad.bottom;
    const maxVal = Math.max(...data.map((d) => d.created + d.updated), 1);
    const barGroupW = chartW / data.length;
    const barW = Math.min(barGroupW * 0.28, 13);
    const gap = 3;

    const createColor = "#2563eb";
    const updateColor = isDark
      ? "rgba(37,99,235,0.38)"
      : "rgba(37,99,235,0.22)";
    const gridColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
    const textColor = isDark ? "rgba(255,255,255,0.35)" : "#94a3b8";

    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (chartH / 4) * i;
      ctx.beginPath();
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 0.5;
      ctx.setLineDash([4, 4]);
      ctx.moveTo(pad.left, y);
      ctx.lineTo(W - pad.right, y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = textColor;
      ctx.font = "9px system-ui";
      ctx.textAlign = "right";
      ctx.fillText(Math.round(maxVal - (maxVal / 4) * i), pad.left - 4, y + 3);
    }

    data.forEach((d, i) => {
      const x = pad.left + i * barGroupW + barGroupW / 2;
      const cH = (d.created / maxVal) * chartH;
      const uH = (d.updated / maxVal) * chartH;

      ctx.fillStyle = updateColor;
      rr(ctx, x - barW - gap / 2, pad.top + chartH - uH, barW, uH, 3);
      ctx.fill();

      ctx.fillStyle = createColor;
      rr(ctx, x + gap / 2, pad.top + chartH - cH, barW, cH, 3);
      ctx.fill();

      ctx.fillStyle = textColor;
      ctx.font = "10px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(d.label, x, H - 6);
    });

    function rr(ctx, x, y, w, h, r) {
      if (h <= 0) return;
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x, y + h);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    }
  }, [data, isDark]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ flex: 1, minHeight: 0 }}>
        <canvas
          ref={canvasRef}
          style={{
            width: "100%",
            height: "100%",
            display: "block",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 12,
          marginTop: 8,
        }}
      >
        {[
          ["Created", "#2563eb"],
          ["Updated", "rgba(37,99,235,0.45)"],
        ].map(([l, c]) => (
          <div
            key={l}
            style={{ display: "flex", alignItems: "center", gap: 4 }}
          >
            <div
              style={{ width: 8, height: 8, borderRadius: 2, background: c }}
            />
            <span
              style={{
                fontSize: 10,
                color: isDark ? "rgba(255,255,255,0.35)" : "#94a3b8",
              }}
            >
              {l}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Donut chart
// ─────────────────────────────────────────────────────────────────────────────

function DonutChart({ value, max, label, color, isDark }) {
  const pct = max === Infinity ? 0 : Math.min((value / max) * 100, 100);
  const r = 36,
    cx = 50,
    cy = 50,
    stroke = 8;
  const circ = 2 * Math.PI * r;
  const dash = `${(pct / 100) * circ} ${circ}`;
  const textPrimary = isDark ? "#fff" : "#0f172a";
  const textSecondary = isDark ? "rgba(255,255,255,0.4)" : "#64748b";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
      }}
    >
      <svg viewBox="0 0 100 100" style={{ width: 90, height: 90 }}>
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={isDark ? "rgba(255,255,255,0.07)" : "#f1f5f9"}
          strokeWidth={stroke}
        />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={dash}
          strokeDashoffset={circ * 0.25}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          fontSize="14"
          fontWeight="700"
          fill={textPrimary}
        >
          {value}
        </text>
        <text
          x={cx}
          y={cy + 10}
          textAnchor="middle"
          fontSize="9"
          fill={textSecondary}
        >
          {max !== Infinity ? `of ${max}` : "∞"}
        </text>
      </svg>
      <span style={{ fontSize: 11, color: textSecondary, fontWeight: 600 }}>
        {label}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Activity row — maps real ActivityLogDTO shape from your backend
// ─────────────────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "#2563eb",
  "#7c3aed",
  "#059669",
  "#dc2626",
  "#d97706",
  "#0891b2",
];
function avatarColor(str = "") {
  return AVATAR_COLORS[str.charCodeAt(0) % AVATAR_COLORS.length];
}

function fmtTime(ts) {
  if (!ts) return "—";
  const diff = (Date.now() - new Date(ts)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 172800) return "Yesterday";
  return `${Math.floor(diff / 86400)} days ago`;
}

function ActivityRow({ log, isDark }) {
  const cardBorder = isDark ? "rgba(255,255,255,0.08)" : "#f1f5f9";
  const textPrimary = isDark ? "#fff" : "#0f172a";
  const textSecondary = isDark ? "rgba(255,255,255,0.45)" : "#64748b";
  const actionCfg = {
    CREATE: {
      bg: isDark ? "rgba(22,163,74,0.12)" : "#dcfce7",
      color: isDark ? "#4ade80" : "#15803d",
    },
    UPDATE: {
      bg: isDark ? "rgba(37,99,235,0.12)" : "#dbeafe",
      color: isDark ? "#60a5fa" : "#1d4ed8",
    },
    DELETE: {
      bg: isDark ? "rgba(239,68,68,0.12)" : "#fee2e2",
      color: isDark ? "#f87171" : "#dc2626",
    },
    RESTORE: {
      bg: isDark ? "rgba(124,58,237,0.12)" : "#ede9fe",
      color: isDark ? "#a78bfa" : "#6d28d9",
    },
  }[log.action] ?? { bg: "rgba(100,116,139,0.1)", color: "#64748b" };

  // your ActivityLogDTO has: userEmail, userName, userRole, action,
  // entityType, entityId, entityName, details, timestamp
  const displayName = log.userName || log.userEmail?.split("@")[0] || "Unknown";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 14px",
        borderBottom: `1px solid ${cardBorder}`,
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: "50%",
          flexShrink: 0,
          background: avatarColor(log.userEmail ?? ""),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          fontWeight: 700,
          color: "#fff",
        }}
      >
        {initials}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            color: textPrimary,
            fontWeight: 500,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          <span style={{ fontWeight: 700 }}>{displayName}</span>{" "}
          <span style={{ color: textSecondary, fontWeight: 400 }}>
            {log.action?.toLowerCase()}d
          </span>{" "}
          <span>{log.entityName ?? log.entityId ?? "—"}</span>
        </div>
        <div style={{ fontSize: 11, color: textSecondary, marginTop: 1 }}>
          {log.entityType}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 4,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            padding: "2px 7px",
            borderRadius: 4,
            background: actionCfg.bg,
            color: actionCfg.color,
          }}
        >
          {log.action}
        </span>
        <span style={{ fontSize: 10, color: textSecondary }}>
          {fmtTime(log.timestamp)}
        </span>
      </div>
    </div>
  );
}

// Blurred placeholders for STARTER
function FakeActivityRows({ isDark }) {
  const cardBorder = isDark ? "rgba(255,255,255,0.08)" : "#f1f5f9";
  return (
    <div>
      {["PS", "RK", "AM", "PS"].map((initials, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 14px",
            borderBottom: `1px solid ${cardBorder}`,
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: "#94a3b8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            {initials}
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                height: 13,
                borderRadius: 4,
                width: "60%",
                background: isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0",
              }}
            />
            <div
              style={{
                height: 10,
                borderRadius: 4,
                width: "30%",
                marginTop: 4,
                background: isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function FakeBarChart({ isDark }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 8,
        height: 80,
        padding: "0 8px",
      }}
    >
      {[40, 65, 30, 80, 55, 25, 70].map((h, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: `${h}%`,
            background: isDark ? "rgba(37,99,235,0.3)" : "#bfdbfe",
            borderRadius: "3px 3px 0 0",
          }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Module row
// ─────────────────────────────────────────────────────────────────────────────

function ModuleRow({ mod, recordCount, max, isDark, navigate }) {
  const cardBorder = isDark ? "rgba(255,255,255,0.08)" : "#f1f5f9";
  const textPrimary = isDark ? "#fff" : "#0f172a";
  const textSecondary = isDark ? "rgba(255,255,255,0.45)" : "#64748b";
  const pct = max !== Infinity ? Math.min((recordCount / max) * 100, 100) : 0;

  return (
    <div
      onClick={() => navigate(`/modules/${mod.id}`)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "12px 14px",
        borderBottom: `1px solid ${cardBorder}`,
        cursor: "pointer",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = isDark
          ? "rgba(255,255,255,0.03)"
          : "#f8fafc")
      }
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 9,
          flexShrink: 0,
          background: isDark ? "rgba(37,99,235,0.12)" : "#dbeafe",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
        }}
      >
        ⊞
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: textPrimary }}>
          {mod.name}
        </div>
        <div style={{ fontSize: 11, color: textSecondary, marginTop: 1 }}>
          {mod.fields?.length ?? 0} fields
        </div>
        {max !== Infinity && (
          <div
            style={{
              marginTop: 6,
              height: 3,
              borderRadius: 2,
              overflow: "hidden",
              background: isDark ? "rgba(255,255,255,0.08)" : "#f1f5f9",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${pct}%`,
                borderRadius: 2,
                background: pct >= 90 ? "#ef4444" : "#2563eb",
                transition: "width 0.5s ease",
              }}
            />
          </div>
        )}
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: textPrimary }}>
          {recordCount.toLocaleString()}
        </div>
        <div style={{ fontSize: 10, color: textSecondary }}>records</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Quick action
// ─────────────────────────────────────────────────────────────────────────────

function QuickAction({ icon, label, sublabel, onClick, locked, isDark }) {
  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "#fff";
  const cardBorder = isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0";
  const textPrimary = isDark ? "#fff" : "#0f172a";
  const textSecondary = isDark ? "rgba(255,255,255,0.45)" : "#64748b";
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 16px",
        borderRadius: 12,
        cursor: "pointer",
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        textAlign: "left",
        width: "100%",
        opacity: locked ? 0.65 : 1,
        boxShadow: isDark ? "none" : "0 1px 4px rgba(0,0,0,0.04)",
      }}
      onMouseEnter={(e) => {
        if (!locked)
          e.currentTarget.style.borderColor = isDark
            ? "rgba(255,255,255,0.2)"
            : "#cbd5e1";
      }}
      onMouseLeave={(e) =>
        (e.currentTarget.style.borderColor = isDark
          ? "rgba(255,255,255,0.1)"
          : "#e2e8f0")
      }
    >
      <span style={{ fontSize: 20 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>
            {label}
          </span>
          {locked && <ProBadge isDark={isDark} />}
        </div>
        {sublabel && (
          <div style={{ fontSize: 11, color: textSecondary, marginTop: 1 }}>
            {sublabel}
          </div>
        )}
      </div>
      <span style={{ fontSize: 16, color: textSecondary }}>→</span>
    </button>
  );
}

function UsageSummary({
  totalRecords,
  totalModules,
  totalUsers,
  limits,
  isDark,
}) {
  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "#fff";
  const cardBorder = isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0";
  const textSecondary = isDark ? "rgba(255,255,255,0.45)" : "#64748b";
  return (
    <div
      style={{
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        borderRadius: 14,
        padding: "20px 22px",
        boxShadow: isDark ? "none" : "0 1px 6px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: textSecondary,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: 20,
        }}
      >
        Plan usage
      </div>
      <div style={{ display: "flex", justifyContent: "space-around" }}>
        <DonutChart
          value={totalRecords}
          max={limits.maxRecords}
          label="Records"
          color="#2563eb"
          isDark={isDark}
        />
        <DonutChart
          value={totalModules}
          max={limits.maxModules}
          label="Modules"
          color="#16a34a"
          isDark={isDark}
        />
        <DonutChart
          value={totalUsers}
          max={limits.maxUsers}
          label="Members"
          color="#7c3aed"
          isDark={isDark}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Dashboard
// ─────────────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isAdmin, isStaff } = useAuth();
  const { isDark } = useTheme();
  const limits = getPlanLimits(user?.plan ?? "STARTER");

  // ── State ──────────────────────────────────────────────────────────────────
  const [modules, setModules] = useState([]);
  const [recordCounts, setRecordCounts] = useState({}); // { moduleId: count }
  const [totalRecords, setTotalRecords] = useState(0);
  const [users, setUsers] = useState([]);
  const [activity, setActivity] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Load ───────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Modules — always needed
      const mods = await moduleApi.getAll();
      setModules(mods);

      // 2. Record counts per module — fetch in parallel, sum for total
      const counts = {};
      let total = 0;
      await Promise.all(
        mods.map(async (m) => {
          try {
            const records = await recordApi.getByModule(m.id);
            counts[m.id] = records.length;
            total += records.length;
          } catch {
            counts[m.id] = 0;
          }
        }),
      );
      setRecordCounts(counts);
      setTotalRecords(total);

      // 3. Users — always needed
      const u = await userApi.getAll();
      setUsers(u);

      // 4. Activity — only fetch if plan allows; used for both
      //    the activity feed AND the bar chart
      if (limits.activityLog) {
        const logs = await activityApi.getRecent(200);
        setActivity(logs);
        setChartData(buildChartData(logs));
      }
    } catch (e) {
      console.error("Dashboard load error:", e);
      setError("Some data failed to load.");
    } finally {
      setLoading(false);
    }
  }, [limits.activityLog]);

  useEffect(() => {
    load();
  }, [load]);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalModules = modules.length;
  const totalUsers = users.length;

  // Top 5 modules sorted by record count
  const topModules = [...modules]
    .sort((a, b) => (recordCounts[b.id] ?? 0) - (recordCounts[a.id] ?? 0))
    .slice(0, 5);

  // Recent 7 activity items for the feed
  const recentActivity = activity.slice(0, 7);

  // Count records created/updated this week from activity logs
  const weekAgo = Date.now() - 7 * 86400000;
  const recordsThisWeek = activity.filter(
    (l) =>
      l.action === "CREATE" &&
      l.entityType === "RECORD" &&
      new Date(l.timestamp) > weekAgo,
  ).length;
  const modulesThisWeek = activity.filter(
    (l) =>
      l.action === "CREATE" &&
      l.entityType === "MODULE" &&
      new Date(l.timestamp) > weekAgo,
  ).length;

  const atRecordLimit =
    limits.maxRecords !== Infinity && totalRecords >= limits.maxRecords;

  // ── Theme tokens ───────────────────────────────────────────────────────────
  const textPrimary = isDark ? "#fff" : "#0f172a";
  const textSecondary = isDark ? "rgba(255,255,255,0.45)" : "#64748b";
  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "#fff";
  const cardBorder = isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0";

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        style={{
          padding: "36px 40px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
        {[80, 180, 96, 96].map((h, i) => (
          <div
            key={i}
            style={{
              height: h,
              borderRadius: 14,
              animation: "pulse 1.5s ease-in-out infinite",
              background: isDark ? "rgba(255,255,255,0.04)" : "#f1f5f9",
            }}
          />
        ))}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        padding: "36px 40px",
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 4,
            }}
          >
            <h1
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: textPrimary,
                margin: 0,
                letterSpacing: -0.5,
              }}
            >
              Dashboard
            </h1>
            <PlanBadge plan={user?.plan} isDark={isDark} />
          </div>
          <p style={{ fontSize: 13, color: textSecondary, margin: 0 }}>
            Welcome back, {user?.name?.split(" ")[0] ?? "there"}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={load}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              background: isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9",
              border: isDark
                ? "1px solid rgba(255,255,255,0.12)"
                : "1.5px solid #e2e8f0",
              color: isDark ? "rgba(255,255,255,0.7)" : "#475569",
            }}
          >
            ↻ Refresh
          </button>
          {isAdmin && (
            <button
              onClick={() => navigate("/modules/new")}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
                background: "linear-gradient(135deg,#16a34a,#15803d)",
                border: "none",
                color: "#fff",
                boxShadow: "0 3px 10px rgba(22,163,74,0.3)",
              }}
            >
              + New module
            </button>
          )}
        </div>
      </div>

      {/* ── Partial error ── */}
      {error && (
        <div
          style={{
            padding: "10px 16px",
            borderRadius: 10,
            fontSize: 12,
            color: isDark ? "#f87171" : "#dc2626",
            background: isDark ? "rgba(239,68,68,0.07)" : "#fef2f2",
            border: `1px solid ${isDark ? "rgba(239,68,68,0.2)" : "#fecaca"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>⚠️ {error}</span>
          <button
            onClick={load}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 600,
              color: isDark ? "#f87171" : "#dc2626",
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Record limit nudge ── */}
      <UpgradeBanner
        type="record"
        count={totalRecords}
        max={limits.maxRecords}
        isDark={isDark}
        navigate={navigate}
      />

      {/* ── Stat cards ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 14,
        }}
      >
        <StatCard
          label="Total records"
          value={totalRecords}
          sub={limits.activityLog ? `+${recordsThisWeek} this week` : undefined}
          icon="📄"
          accent="#2563eb"
          max={limits.maxRecords}
          isDark={isDark}
        />
        <StatCard
          label="Modules"
          value={totalModules}
          sub={limits.activityLog ? `+${modulesThisWeek} this week` : undefined}
          icon="⊞"
          accent="#16a34a"
          max={limits.maxModules}
          isDark={isDark}
        />
        <StatCard
          label="Team members"
          value={totalUsers}
          icon="👥"
          accent="#7c3aed"
          max={limits.maxUsers}
          isDark={isDark}
        />
        <StatCard
          label="Recycle bin"
          value={limits.recycleBin ? "On" : "Off"}
          icon="🗑"
          isDark={isDark}
        />
      </div>

      {/* ── 2-col grid ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: 20,
          alignItems: "start",
        }}
      >
        {/* LEFT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Bar chart */}
          <div
            style={{
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              borderRadius: 14,
              padding: "20px 22px",
              boxShadow: isDark ? "none" : "0 1px 6px rgba(0,0,0,0.04)",
            }}
          >
            <SectionHeader
              isDark={isDark}
              title="Record activity — last 7 days"
              right={
                !limits.dashboardCharts && (
                  <ProBadge
                    onClick={() => navigate("/pricing")}
                    isDark={isDark}
                  />
                )
              }
            />
            {limits.dashboardCharts ? (
              chartData.length > 0 ? (
                <div style={{ height: 160 }}>
                  <BarChart data={chartData} isDark={isDark} />
                </div>
              ) : (
                <div
                  style={{
                    height: 160,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <p style={{ fontSize: 13, color: textSecondary, margin: 0 }}>
                    No activity in the last 7 days
                  </p>
                </div>
              )
            ) : (
              <FeatureLock
                icon="📊"
                title="Charts require Professional plan"
                description="See a 7-day breakdown of records created, updated, and deleted across all your modules."
                isDark={isDark}
                navigate={navigate}
                minHeight={160}
              >
                <div style={{ height: 100 }}>
                  <FakeBarChart isDark={isDark} />
                </div>
              </FeatureLock>
            )}
          </div>

          {/* Activity feed */}
          <div
            style={{
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              borderRadius: 14,
              overflow: "hidden",
              boxShadow: isDark ? "none" : "0 1px 6px rgba(0,0,0,0.04)",
            }}
          >
            <div style={{ padding: "20px 22px 0" }}>
              <SectionHeader
                isDark={isDark}
                title="Recent activity"
                right={
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    {!limits.activityLog && (
                      <ProBadge
                        onClick={() => navigate("/pricing")}
                        isDark={isDark}
                      />
                    )}
                    {limits.activityLog && (
                      <button
                        onClick={() => navigate("/activity")}
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: isDark ? "#60a5fa" : "#2563eb",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                        }}
                      >
                        View all →
                      </button>
                    )}
                  </div>
                }
              />
            </div>
            {limits.activityLog ? (
              recentActivity.length > 0 ? (
                <div>
                  {recentActivity.map((log) => (
                    <ActivityRow key={log.id} log={log} isDark={isDark} />
                  ))}
                </div>
              ) : (
                <div style={{ padding: "32px 22px", textAlign: "center" }}>
                  <p style={{ fontSize: 13, color: textSecondary, margin: 0 }}>
                    No activity recorded yet
                  </p>
                </div>
              )
            ) : (
              <div style={{ padding: "0 22px 22px" }}>
                <FeatureLock
                  icon="📋"
                  title="Activity log requires Professional plan"
                  description="Track every create, edit, and delete action across your workspace — who did what and when."
                  isDark={isDark}
                  navigate={navigate}
                  minHeight={200}
                >
                  <FakeActivityRows isDark={isDark} />
                </FeatureLock>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Plan usage donuts */}
          <UsageSummary
            totalRecords={totalRecords}
            totalModules={totalModules}
            totalUsers={totalUsers}
            limits={limits}
            isDark={isDark}
          />

          {/* Top modules */}
          <div
            style={{
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              borderRadius: 14,
              overflow: "hidden",
              boxShadow: isDark ? "none" : "0 1px 6px rgba(0,0,0,0.04)",
            }}
          >
            <div style={{ padding: "20px 22px 0" }}>
              <SectionHeader
                isDark={isDark}
                title="Your modules"
                right={
                  <button
                    onClick={() => navigate("/modules")}
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: isDark ? "#60a5fa" : "#2563eb",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    View all →
                  </button>
                }
              />
            </div>
            {topModules.length > 0 ? (
              <div>
                {topModules.map((mod) => (
                  <ModuleRow
                    key={mod.id}
                    mod={mod}
                    recordCount={recordCounts[mod.id] ?? 0}
                    max={limits.maxRecords}
                    isDark={isDark}
                    navigate={navigate}
                  />
                ))}
              </div>
            ) : (
              <div style={{ padding: "32px 22px", textAlign: "center" }}>
                <p style={{ fontSize: 13, color: textSecondary, margin: 0 }}>
                  No modules yet
                </p>
                {isAdmin && (
                  <button
                    onClick={() => navigate("/modules/new")}
                    style={{
                      marginTop: 12,
                      padding: "7px 16px",
                      borderRadius: 8,
                      cursor: "pointer",
                      background: "linear-gradient(135deg,#16a34a,#15803d)",
                      border: "none",
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    + Create your first module
                  </button>
                )}
              </div>
            )}
            {limits.maxModules !== Infinity &&
              totalModules >= limits.maxModules * 0.8 && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderTop: `1px solid ${cardBorder}`,
                  }}
                >
                  <UpgradeBanner
                    type="module"
                    count={totalModules}
                    max={limits.maxModules}
                    isDark={isDark}
                    navigate={navigate}
                  />
                </div>
              )}
          </div>

          {/* Quick actions */}
          <div
            style={{
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              borderRadius: 14,
              padding: "20px 22px",
              boxShadow: isDark ? "none" : "0 1px 6px rgba(0,0,0,0.04)",
            }}
          >
            <SectionHeader isDark={isDark} title="Quick actions" />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {isAdmin && (
                <QuickAction
                  icon="⊞"
                  label={
                    atRecordLimit ? "Upgrade for more modules" : "New module"
                  }
                  sublabel={
                    atRecordLimit
                      ? "You've reached your plan limit"
                      : "Define fields and structure"
                  }
                  onClick={() =>
                    navigate(atRecordLimit ? "/pricing" : "/modules/new")
                  }
                  isDark={isDark}
                />
              )}
              {isStaff && (
                <QuickAction
                  icon="📄"
                  label="Browse modules"
                  sublabel="View and manage records"
                  onClick={() => navigate("/modules")}
                  isDark={isDark}
                />
              )}
              <QuickAction
                icon="📋"
                label="Activity log"
                sublabel={
                  limits.activityLog
                    ? "See all recent changes"
                    : "Track actions across your workspace"
                }
                onClick={() =>
                  navigate(limits.activityLog ? "/activity" : "/pricing")
                }
                locked={!limits.activityLog}
                isDark={isDark}
              />
              {limits.recycleBin && (
                <QuickAction
                  icon="🗑"
                  label="Recycle bin"
                  sublabel="Restore deleted records"
                  onClick={() => navigate("/recycle-bin")}
                  isDark={isDark}
                />
              )}
              {isAdmin && (
                <QuickAction
                  icon="↓"
                  label="Export data"
                  sublabel={
                    limits.dashboardExport
                      ? "Download records as CSV/PDF"
                      : "Export all your records"
                  }
                  onClick={() =>
                    navigate(limits.dashboardExport ? "/export" : "/pricing")
                  }
                  locked={!limits.dashboardExport}
                  isDark={isDark}
                />
              )}
              {isAdmin && (
                <QuickAction
                  icon="👥"
                  label="Invite team member"
                  sublabel={`${totalUsers}/${limits.maxUsers === Infinity ? "∞" : limits.maxUsers} seats used`}
                  onClick={() =>
                    navigate(
                      totalUsers >= limits.maxUsers
                        ? "/pricing"
                        : "/settings/users",
                    )
                  }
                  locked={
                    limits.maxUsers !== Infinity &&
                    totalUsers >= limits.maxUsers
                  }
                  isDark={isDark}
                />
              )}
            </div>
          </div>

          {/* Upgrade CTA — STARTER only */}
          {user?.plan?.toUpperCase() === "STARTER" && (
            <div
              style={{
                borderRadius: 14,
                padding: "20px 22px",
                background: isDark ? "rgba(37,99,235,0.08)" : "#eff6ff",
                border: `1px solid ${isDark ? "rgba(37,99,235,0.2)" : "#bfdbfe"}`,
              }}
            >
              <div style={{ fontSize: 18, marginBottom: 8 }}>⭐</div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: isDark ? "#60a5fa" : "#1d4ed8",
                  marginBottom: 6,
                }}
              >
                Unlock the full workspace
              </div>
              <p
                style={{
                  fontSize: 12,
                  color: isDark ? "rgba(255,255,255,0.5)" : "#475569",
                  margin: "0 0 14px",
                  lineHeight: 1.6,
                }}
              >
                Sub-modules, file uploads, 100K records, activity logs, PDF
                export, and a 30-day recycle bin — all on Professional.
              </p>
              <button
                onClick={() => navigate("/pricing")}
                style={{
                  width: "100%",
                  padding: "9px",
                  borderRadius: 9,
                  cursor: "pointer",
                  background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
                  border: "none",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 700,
                  boxShadow: "0 4px 14px rgba(37,99,235,0.35)",
                }}
              >
                View Professional plan →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
