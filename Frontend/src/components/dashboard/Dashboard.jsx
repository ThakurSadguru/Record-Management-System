import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../layout/AppLayout";
import { moduleApi } from "../../api/moduleApi";
import { recordApi } from "../../api/recordApi";
import { userApi } from "../../api/userApi";
import { activityApi } from "../../api/activityApi";
import { getPlanLimits } from "../../utils/planLimits";

// ── Animated number counter ───────────────────────────────────────────────────
function AnimatedNumber({ value, duration = 900 }) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    if (typeof value !== "number") {
      setDisplay(value);
      return;
    }
    const start = prev.current;
    const end = value;
    prev.current = end;
    if (start === end) return;
    const startTime = performance.now();
    function step(now) {
      const p = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(start + (end - start) * ease));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, [value, duration]);
  return typeof value === "number" ? display.toLocaleString() : value;
}

// ── Plan badge ────────────────────────────────────────────────────────────────
function PlanBadge({ plan, isDark }) {
  const cfgs = {
    STARTER: {
      label: "Free",
      grad: "linear-gradient(135deg,#475569,#64748b)",
      glow: "rgba(100,116,139,0.4)",
    },
    PROFESSIONAL: {
      label: "Pro",
      grad: "linear-gradient(135deg,#1d4ed8,#2563eb)",
      glow: "rgba(37,99,235,0.4)",
    },
    ENTERPRISE: {
      label: "Enterprise",
      grad: "linear-gradient(135deg,#6d28d9,#7c3aed)",
      glow: "rgba(124,58,237,0.4)",
    },
  };
  const c = cfgs[plan?.toUpperCase()] ?? cfgs.STARTER;
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        padding: "3px 10px",
        borderRadius: 99,
        background: c.grad,
        color: "#fff",
        letterSpacing: "0.05em",
        boxShadow: `0 2px 8px ${c.glow}`,
      }}
    >
      {c.label}
    </span>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
const STAT_PALETTES = {
  blue: {
    grad: ["#1d4ed8", "#3b82f6"],
    glow: "rgba(59,130,246,0.25)",
    icon: "rgba(59,130,246,0.15)",
  },
  green: {
    grad: ["#15803d", "#22c55e"],
    glow: "rgba(34,197,94,0.25)",
    icon: "rgba(34,197,94,0.15)",
  },
  violet: {
    grad: ["#6d28d9", "#8b5cf6"],
    glow: "rgba(139,92,246,0.25)",
    icon: "rgba(139,92,246,0.15)",
  },
  amber: {
    grad: ["#b45309", "#f59e0b"],
    glow: "rgba(245,158,11,0.25)",
    icon: "rgba(245,158,11,0.15)",
  },
};

function StatCard({ label, value, sub, icon, color = "blue", max, isDark }) {
  const p = STAT_PALETTES[color];
  const pct =
    max && max !== Infinity ? Math.min((Number(value) / max) * 100, 100) : null;
  const barColor =
    pct >= 100
      ? "#ef4444"
      : pct >= 80
        ? "#f59e0b"
        : `linear-gradient(90deg,${p.grad[0]},${p.grad[1]})`;

  return (
    <div
      style={{
        borderRadius: 18,
        padding: "22px 24px",
        position: "relative",
        overflow: "hidden",
        background: isDark
          ? `linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))`
          : "#ffffff",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8f0fe"}`,
        boxShadow: isDark
          ? `0 8px 32px ${p.glow}`
          : `0 4px 24px rgba(0,0,0,0.06)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -30,
          right: -30,
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: p.glow,
          filter: "blur(30px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 18,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: p.icon,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
          }}
        >
          {icon}
        </div>
        {sub && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: "3px 9px",
              borderRadius: 99,
              background: sub.startsWith("+")
                ? isDark
                  ? "rgba(34,197,94,0.15)"
                  : "#dcfce7"
                : isDark
                  ? "rgba(255,255,255,0.07)"
                  : "#f1f5f9",
              color: sub.startsWith("+")
                ? isDark
                  ? "#4ade80"
                  : "#15803d"
                : isDark
                  ? "rgba(255,255,255,0.45)"
                  : "#64748b",
            }}
          >
            {sub}
          </span>
        )}
      </div>
      <div
        style={{
          fontSize: 34,
          fontWeight: 900,
          color: isDark ? "#fff" : "#0f172a",
          letterSpacing: -1,
          lineHeight: 1,
          marginBottom: 6,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        <AnimatedNumber value={typeof value === "number" ? value : value} />
      </div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: isDark ? "rgba(255,255,255,0.45)" : "#64748b",
          textTransform: "uppercase",
          letterSpacing: "0.07em",
        }}
      >
        {label}
      </div>
      {pct !== null && (
        <div style={{ marginTop: 16 }}>
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
                background: barColor,
                transition: "width 0.8s ease",
              }}
            />
          </div>
          <div
            style={{
              fontSize: 10,
              color: isDark ? "rgba(255,255,255,0.3)" : "#94a3b8",
              marginTop: 5,
              fontWeight: 500,
            }}
          >
            {typeof value === "number" ? value.toLocaleString() : value}
            {max !== Infinity ? ` / ${max.toLocaleString()}` : ""} used
          </div>
        </div>
      )}
    </div>
  );
}

// ── Bar chart ─────────────────────────────────────────────────────────────────
function buildChartData(logs) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const map = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    map[days[d.getDay()]] = { label: days[d.getDay()], created: 0, updated: 0 };
  }
  logs.forEach((log) => {
    if (!log.timestamp) return;
    const d = new Date(log.timestamp);
    if ((Date.now() - d) / 86400000 > 7) return;
    const lbl = days[d.getDay()];
    if (!map[lbl]) return;
    const a = log.action?.toUpperCase();
    if (a === "CREATE") map[lbl].created++;
    else if (a === "UPDATE") map[lbl].updated++;
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
    const pad = { top: 16, right: 16, bottom: 30, left: 32 };
    const cW = W - pad.left - pad.right,
      cH = H - pad.top - pad.bottom;
    const mx = Math.max(...data.map((d) => d.created + d.updated), 1);
    const gW = cW / data.length,
      bW = Math.min(gW * 0.25, 12);
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (cH / 4) * i;
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
      ctx.lineWidth = 0.5;
      ctx.moveTo(pad.left, y);
      ctx.lineTo(W - pad.right, y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = isDark ? "rgba(255,255,255,0.25)" : "#94a3b8";
      ctx.font = `9px system-ui`;
      ctx.textAlign = "right";
      ctx.fillText(Math.round(mx - (mx / 4) * i), pad.left - 4, y + 3);
    }
    data.forEach((d, i) => {
      const x = pad.left + i * gW + gW / 2;
      const cH2 = (d.created / mx) * cH,
        uH = (d.updated / mx) * cH;
      const ug = ctx.createLinearGradient(
        0,
        pad.top + cH - uH,
        0,
        pad.top + cH,
      );
      ug.addColorStop(
        0,
        isDark ? "rgba(59,130,246,0.5)" : "rgba(59,130,246,0.3)",
      );
      ug.addColorStop(
        1,
        isDark ? "rgba(59,130,246,0.15)" : "rgba(59,130,246,0.1)",
      );
      ctx.fillStyle = ug;
      rr(ctx, x - bW - 2, pad.top + cH - uH, bW, uH, 3);
      ctx.fill();
      const cg = ctx.createLinearGradient(
        0,
        pad.top + cH - cH2,
        0,
        pad.top + cH,
      );
      cg.addColorStop(0, "#2563eb");
      cg.addColorStop(1, "rgba(37,99,235,0.5)");
      ctx.fillStyle = cg;
      rr(ctx, x + 2, pad.top + cH - cH2, bW, cH2, 3);
      ctx.fill();
      ctx.fillStyle = isDark ? "rgba(255,255,255,0.3)" : "#94a3b8";
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
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}

// ── Donut chart ───────────────────────────────────────────────────────────────
function DonutChart({ value, max, label, color, isDark }) {
  const pct = max === Infinity ? 0 : Math.min((value / max) * 100, 100);
  const r = 34,
    cx = 50,
    cy = 50,
    sw = 9;
  const circ = 2 * Math.PI * r;
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
      <svg viewBox="0 0 100 100" style={{ width: 88, height: 88 }}>
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9"}
          strokeWidth={sw}
        />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={sw}
          strokeDasharray={`${(pct / 100) * circ} ${circ}`}
          strokeDashoffset={circ * 0.25}
          strokeLinecap="round"
          style={{
            transition: "stroke-dasharray 0.8s ease",
            filter: `drop-shadow(0 0 4px ${color}88)`,
          }}
        />
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          fontSize="15"
          fontWeight="800"
          fill={textPrimary}
        >
          {value}
        </text>
        <text
          x={cx}
          y={cy + 10}
          textAnchor="middle"
          fontSize="8"
          fill={textSecondary}
        >
          {max !== Infinity ? `of ${max.toLocaleString()}` : "∞"}
        </text>
      </svg>
      <span
        style={{
          fontSize: 11,
          color: textSecondary,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ── Activity row ──────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  "#2563eb",
  "#7c3aed",
  "#059669",
  "#dc2626",
  "#d97706",
  "#0891b2",
  "#e11d48",
];
function avatarColor(s = "") {
  return AVATAR_COLORS[s.charCodeAt(0) % AVATAR_COLORS.length];
}
function fmtTime(ts) {
  if (!ts) return "—";
  const d = (Date.now() - new Date(ts)) / 1000;
  if (d < 60) return "just now";
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  if (d < 172800) return "Yesterday";
  return `${Math.floor(d / 86400)}d ago`;
}
const ACTION_CFG = {
  CREATE: { bg: "rgba(34,197,94,0.12)", color: "#22c55e", dot: "#22c55e" },
  UPDATE: { bg: "rgba(59,130,246,0.12)", color: "#3b82f6", dot: "#3b82f6" },
  DELETE: { bg: "rgba(239,68,68,0.12)", color: "#ef4444", dot: "#ef4444" },
  RESTORE: { bg: "rgba(139,92,246,0.12)", color: "#8b5cf6", dot: "#8b5cf6" },
  LOGIN: { bg: "rgba(100,116,139,0.1)", color: "#94a3b8", dot: "#94a3b8" },
};

function ActivityRow({ log, isDark }) {
  const div = isDark ? "rgba(255,255,255,0.06)" : "#f8fafc";
  const tp = isDark ? "#f1f5f9" : "#0f172a";
  const ts = isDark ? "rgba(255,255,255,0.4)" : "#64748b";
  const cfg = ACTION_CFG[log.action] ?? ACTION_CFG.LOGIN;
  const name = log.userName || log.userEmail?.split("@")[0] || "Unknown";
  const inits = name
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
        padding: "11px 20px",
        borderBottom: `1px solid ${div}`,
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: "50%",
          flexShrink: 0,
          background: avatarColor(log.userEmail ?? ""),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          fontWeight: 800,
          color: "#fff",
          boxShadow: `0 2px 8px ${avatarColor(log.userEmail ?? "")}66`,
        }}
      >
        {inits}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            color: tp,
            fontWeight: 500,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          <span style={{ fontWeight: 700 }}>{name}</span>{" "}
          <span style={{ color: ts, fontWeight: 400 }}>
            {log.action?.toLowerCase()}d
          </span>{" "}
          <span style={{ fontWeight: 600 }}>
            {log.entityName ?? log.entityId ?? "—"}
          </span>
        </div>
        <div style={{ fontSize: 10, color: ts, marginTop: 2, fontWeight: 500 }}>
          {log.entityType} · {fmtTime(log.timestamp)}
        </div>
      </div>
      <span
        style={{
          fontSize: 10,
          fontWeight: 800,
          padding: "3px 8px",
          borderRadius: 6,
          background: cfg.bg,
          color: cfg.color,
          flexShrink: 0,
          letterSpacing: "0.04em",
        }}
      >
        {log.action}
      </span>
    </div>
  );
}

// ── Module row ────────────────────────────────────────────────────────────────
const MOD_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
  "#14b8a6",
];
function modColor(i) {
  return MOD_COLORS[i % MOD_COLORS.length];
}

function ModuleRow({ mod, idx, recordCount, max, isDark, navigate }) {
  const div = isDark ? "rgba(255,255,255,0.06)" : "#f8fafc";
  const tp = isDark ? "#f1f5f9" : "#0f172a";
  const ts = isDark ? "rgba(255,255,255,0.4)" : "#64748b";
  const col = modColor(idx);
  const pct =
    max !== Infinity ? Math.min((recordCount / max) * 100, 100) : null;
  return (
    <div
      onClick={() => navigate(`/modules/${mod.id}`)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "13px 20px",
        borderBottom: `1px solid ${div}`,
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
          width: 38,
          height: 38,
          borderRadius: 11,
          flexShrink: 0,
          background: `${col}22`,
          border: `1px solid ${col}44`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
          fontWeight: 800,
          color: col,
        }}
      >
        {mod.name[0].toUpperCase()}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{ fontSize: 13, fontWeight: 700, color: tp, marginBottom: 2 }}
        >
          {mod.name}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 10, color: ts, fontWeight: 500 }}>
            {mod.fields?.length ?? 0} fields
          </span>
          {(mod.subModules?.length ?? 0) > 0 && (
            <>
              <span
                style={{
                  fontSize: 9,
                  color: isDark ? "rgba(255,255,255,0.2)" : "#e2e8f0",
                }}
              >
                ·
              </span>
              <span
                style={{
                  fontSize: 10,
                  color: isDark ? "#a5b4fc" : "#6366f1",
                  fontWeight: 600,
                }}
              >
                {mod.subModules.length} sub
              </span>
            </>
          )}
        </div>
        {pct !== null && (
          <div
            style={{
              marginTop: 5,
              height: 3,
              borderRadius: 2,
              overflow: "hidden",
              background: isDark ? "rgba(255,255,255,0.07)" : "#f1f5f9",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${pct}%`,
                borderRadius: 2,
                background: pct >= 90 ? "#ef4444" : col,
                transition: "width 0.6s ease",
              }}
            />
          </div>
        )}
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div
          style={{
            fontSize: 16,
            fontWeight: 900,
            color: tp,
            letterSpacing: -0.5,
          }}
        >
          {recordCount.toLocaleString()}
        </div>
        <div
          style={{
            fontSize: 9,
            color: ts,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          records
        </div>
      </div>
    </div>
  );
}

// ── Quick action button ───────────────────────────────────────────────────────
function QuickAction({
  icon,
  label,
  sub,
  onClick,
  locked,
  color = "#2563eb",
  isDark,
}) {
  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "#fff";
  const tp = isDark ? "#fff" : "#0f172a";
  const ts = isDark ? "rgba(255,255,255,0.4)" : "#64748b";
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "13px 16px",
        borderRadius: 12,
        cursor: "pointer",
        background: cardBg,
        border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8f0fe"}`,
        textAlign: "left",
        width: "100%",
        opacity: locked ? 0.6 : 1,
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        if (!locked) {
          e.currentTarget.style.transform = "translateX(3px)";
          e.currentTarget.style.borderColor = isDark
            ? "rgba(255,255,255,0.18)"
            : "#bfdbfe";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateX(0)";
        e.currentTarget.style.borderColor = isDark
          ? "rgba(255,255,255,0.08)"
          : "#e8f0fe";
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: `${color}18`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 17,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: tp }}>
            {label}
          </span>
          {locked && (
            <span
              style={{
                fontSize: 9,
                fontWeight: 800,
                padding: "2px 7px",
                borderRadius: 99,
                background: "rgba(251,191,36,0.1)",
                color: "#f59e0b",
                border: "1px solid rgba(251,191,36,0.2)",
              }}
            >
              PRO
            </span>
          )}
        </div>
        {sub && (
          <div style={{ fontSize: 11, color: ts, marginTop: 1 }}>{sub}</div>
        )}
      </div>
      <span
        style={{
          fontSize: 14,
          color: isDark ? "rgba(255,255,255,0.2)" : "#cbd5e1",
        }}
      >
        ›
      </span>
    </button>
  );
}

// ── Feature lock overlay ──────────────────────────────────────────────────────
function FeatureLock({
  icon,
  title,
  desc,
  isDark,
  navigate,
  children,
  minH = 160,
}) {
  const tp = isDark ? "#fbbf24" : "#d97706";
  return (
    <div
      style={{
        position: "relative",
        borderRadius: 12,
        overflow: "hidden",
        minHeight: minH,
      }}
    >
      {children && (
        <div
          style={{
            filter: "blur(3px)",
            opacity: 0.25,
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
          background: isDark ? "rgba(15,20,40,0.85)" : "rgba(255,251,235,0.9)",
          backdropFilter: "blur(4px)",
          borderRadius: 12,
          padding: 24,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        }}
      >
        <div style={{ fontSize: 28 }}>{icon}</div>
        <div style={{ fontSize: 13, fontWeight: 800, color: tp }}>{title}</div>
        <p
          style={{
            fontSize: 12,
            color: isDark ? "rgba(255,255,255,0.45)" : "#64748b",
            margin: 0,
            maxWidth: 280,
            lineHeight: 1.65,
          }}
        >
          {desc}
        </p>
        <button
          onClick={() => navigate("/pricing")}
          style={{
            marginTop: 4,
            padding: "8px 20px",
            borderRadius: 9,
            cursor: "pointer",
            background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
            border: "none",
            color: "#fff",
            fontSize: 12,
            fontWeight: 700,
            boxShadow: "0 4px 14px rgba(37,99,235,0.4)",
          }}
        >
          Upgrade to Professional →
        </button>
      </div>
    </div>
  );
}

// ── Fake placeholders ─────────────────────────────────────────────────────────
function FakeBars({ isDark }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 6,
        height: 80,
        padding: "0 8px",
      }}
    >
      {[35, 60, 25, 75, 50, 20, 65].map((h, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: `${h}%`,
            background: isDark ? "rgba(37,99,235,0.25)" : "#bfdbfe",
            borderRadius: "3px 3px 0 0",
          }}
        />
      ))}
    </div>
  );
}
function FakeActivity({ isDark }) {
  const div = isDark ? "rgba(255,255,255,0.06)" : "#f8fafc";
  return [0, 1, 2, 3].map((i) => (
    <div
      key={i}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "11px 20px",
        borderBottom: `1px solid ${div}`,
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: "50%",
          background: isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0",
        }}
      />
      <div style={{ flex: 1 }}>
        <div
          style={{
            height: 11,
            borderRadius: 4,
            width: "58%",
            background: isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0",
            marginBottom: 5,
          }}
        />
        <div
          style={{
            height: 9,
            borderRadius: 4,
            width: "32%",
            background: isDark ? "rgba(255,255,255,0.05)" : "#f1f5f9",
          }}
        />
      </div>
    </div>
  ));
}

// ── Usage donuts card ─────────────────────────────────────────────────────────
function UsageCard({ totalRecords, totalModules, totalUsers, limits, isDark }) {
  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "#fff";
  const cardBd = isDark ? "rgba(255,255,255,0.08)" : "#e8f0fe";
  const ts = isDark ? "rgba(255,255,255,0.4)" : "#64748b";
  return (
    <div
      style={{
        background: cardBg,
        border: `1px solid ${cardBd}`,
        borderRadius: 18,
        padding: "20px 24px",
        boxShadow: isDark ? "none" : "0 4px 20px rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          color: ts,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
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
          color="#3b82f6"
          isDark={isDark}
        />
        <DonutChart
          value={totalModules}
          max={limits.maxModules}
          label="Modules"
          color="#22c55e"
          isDark={isDark}
        />
        <DonutChart
          value={totalUsers}
          max={limits.maxUsers}
          label="Members"
          color="#8b5cf6"
          isDark={isDark}
        />
      </div>
    </div>
  );
}

// ── Upgrade CTA ───────────────────────────────────────────────────────────────
function UpgradeCTA({ isDark, navigate }) {
  return (
    <div
      style={{
        borderRadius: 18,
        padding: "22px 24px",
        background: isDark
          ? "linear-gradient(135deg,rgba(37,99,235,0.12),rgba(124,58,237,0.08))"
          : "linear-gradient(135deg,#eff6ff,#f5f3ff)",
        border: `1px solid ${isDark ? "rgba(37,99,235,0.25)" : "#bfdbfe"}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 10,
        }}
      >
        <span style={{ fontSize: 20 }}>⭐</span>
        <span
          style={{
            fontSize: 13,
            fontWeight: 800,
            color: isDark ? "#60a5fa" : "#1d4ed8",
          }}
        >
          Unlock the full workspace
        </span>
      </div>
      <p
        style={{
          fontSize: 12,
          color: isDark ? "rgba(255,255,255,0.5)" : "#475569",
          margin: "0 0 14px",
          lineHeight: 1.7,
        }}
      >
        Sub-modules, file uploads, 100K records, activity logs, PDF export, and
        30-day recycle bin — on Professional.
      </p>
      <button
        onClick={() => navigate("/pricing")}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: 10,
          cursor: "pointer",
          background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
          border: "none",
          color: "#fff",
          fontSize: 13,
          fontWeight: 700,
          boxShadow: "0 4px 16px rgba(37,99,235,0.4)",
        }}
      >
        View Professional plan →
      </button>
    </div>
  );
}

// ── Skeleton loader ───────────────────────────────────────────────────────────
function Skeleton({ isDark }) {
  return (
    <div
      style={{
        padding: "36px 40px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      <style>{`@keyframes shimmer{0%{background-position:-600px 0}100%{background-position:600px 0}}`}</style>
      {[72, 200, 120].map((h, i) => (
        <div
          key={i}
          style={{
            height: h,
            borderRadius: 18,
            backgroundImage: isDark
              ? "linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.08) 37%,rgba(255,255,255,0.04) 63%)"
              : "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 37%,#f1f5f9 63%)",
            backgroundSize: "600px 100%",
            animation: "shimmer 1.4s ease infinite",
          }}
        />
      ))}
    </div>
  );
}

// ── Global Search ─────────────────────────────────────────────────────────────
// Searches records by fetching all records for a module/sub-module and
// filtering client-side by the search term across all string field values.
function GlobalSearch({ modules, isDark }) {
  const [selectedModule, setSelectedModule] = useState("");
  const [selectedSubModule, setSelectedSubModule] = useState("");
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currentModule = modules.find((m) => m.id === selectedModule);

  const cardBg = isDark ? "rgba(255,255,255,0.03)" : "#ffffff";
  const cardBorder = isDark ? "rgba(255,255,255,0.07)" : "#e8f0fe";
  const textPrimary = isDark ? "#fff" : "#0f172a";
  const textSecondary = isDark ? "rgba(255,255,255,0.4)" : "#64748b";

  const inputStyle = {
    padding: "9px 12px",
    borderRadius: 8,
    fontSize: 13,
    background: isDark ? "rgba(255,255,255,0.06)" : "#fff",
    border: `1.5px solid ${isDark ? "rgba(255,255,255,0.12)" : "#e2e8f0"}`,
    color: textPrimary,
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  };

  // Collect all field definitions recursively from module + sub-modules
  function collectFields(subModules) {
    if (!subModules) return [];
    return subModules.flatMap((sm) => [
      ...(sm.fields ?? []),
      ...collectFields(sm.subModules),
    ]);
  }

  // Format a single field value for display
  function fmtVal(value) {
    if (value === null || value === undefined || value === "") return "—";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "object" && value.name) return value.name; // file upload
    if (typeof value === "object") return null; // skip raw objects
    return String(value);
  }

  async function handleSearch() {
    if (!selectedModule) {
      setError("Please select a module first.");
      return;
    }
    if (!searchText.trim()) {
      setError("Please enter a search term.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      // POST /api/records/filter — backend handles module + optional subModule + keyword
      const data = await recordApi.filter(
        selectedModule,
        selectedSubModule || null,
        searchText.trim(),
      );
      setResults(data);
      setSearched(true);
    } catch (err) {
      console.error(err);
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setSelectedModule("");
    setSelectedSubModule("");
    setSearchText("");
    setResults([]);
    setSearched(false);
    setError("");
  }

  return (
    <div
      style={{
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        borderRadius: 18,
        padding: "22px 24px",
        boxShadow: isDark ? "none" : "0 4px 20px rgba(0,0,0,0.05)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: textPrimary,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
            }}
          >
            🔍 Global Record Search
          </div>
          <div style={{ fontSize: 11, color: textSecondary, marginTop: 2 }}>
            Search across any module or sub-module
          </div>
        </div>
        {searched && (
          <button
            onClick={handleClear}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              color: textSecondary,
            }}
          >
            Clear results
          </button>
        )}
      </div>

      {/* Controls */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 2fr auto",
          gap: 10,
          alignItems: "end",
        }}
      >
        {/* Module selector */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: 11,
              fontWeight: 600,
              marginBottom: 5,
              color: textSecondary,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Module *
          </label>
          <select
            value={selectedModule}
            onChange={(e) => {
              setSelectedModule(e.target.value);
              setSelectedSubModule("");
              setResults([]);
              setSearched(false);
              setError("");
            }}
            style={inputStyle}
          >
            <option value="">Select Module</option>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sub-module selector */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: 11,
              fontWeight: 600,
              marginBottom: 5,
              color: textSecondary,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Sub-module
          </label>
          <select
            value={selectedSubModule}
            onChange={(e) => {
              setSelectedSubModule(e.target.value);
              setResults([]);
              setSearched(false);
            }}
            style={{ ...inputStyle, opacity: !selectedModule ? 0.5 : 1 }}
            disabled={!selectedModule}
          >
            <option value="">All (module + sub-modules)</option>
            {currentModule?.subModules?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Search text */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: 11,
              fontWeight: 600,
              marginBottom: 5,
              color: textSecondary,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Search term *
          </label>
          <input
            type="text"
            placeholder="Type to search records…"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            onFocus={(e) =>
              (e.target.style.borderColor = isDark ? "#4B9FFF" : "#2563eb")
            }
            onBlur={(e) =>
              (e.target.style.borderColor = isDark
                ? "rgba(255,255,255,0.12)"
                : "#e2e8f0")
            }
            style={inputStyle}
          />
        </div>

        {/* Search button */}
        <button
          onClick={handleSearch}
          disabled={loading}
          style={{
            padding: "9px 20px",
            borderRadius: 8,
            cursor: "pointer",
            background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
            border: "none",
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
            opacity: loading ? 0.7 : 1,
            whiteSpace: "nowrap",
          }}
        >
          {loading ? "…" : "Search"}
        </button>
      </div>

      {/* Validation error */}
      {error && (
        <p
          style={{
            margin: "8px 0 0",
            fontSize: 12,
            color: isDark ? "#f87171" : "#dc2626",
          }}
        >
          ⚠ {error}
        </p>
      )}

      {/* Results */}
      {searched && !loading && (
        <div style={{ marginTop: 18 }}>
          {/* Results header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 10,
              paddingBottom: 10,
              borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "#f1f5f9"}`,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 700, color: textPrimary }}>
              Results
            </span>
            <span
              style={{
                padding: "2px 8px",
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 700,
                background:
                  results.length > 0
                    ? isDark
                      ? "rgba(34,197,94,0.15)"
                      : "#f0fdf4"
                    : isDark
                      ? "rgba(255,255,255,0.06)"
                      : "#f1f5f9",
                color:
                  results.length > 0
                    ? isDark
                      ? "#4ade80"
                      : "#16a34a"
                    : isDark
                      ? "rgba(255,255,255,0.4)"
                      : "#94a3b8",
              }}
            >
              {results.length} found
            </span>
            <span style={{ fontSize: 12, color: textSecondary }}>
              in <strong>{currentModule?.name}</strong>
              {selectedSubModule &&
              currentModule?.subModules?.find((s) => s.id === selectedSubModule)
                ? ` › ${currentModule.subModules.find((s) => s.id === selectedSubModule).name}`
                : " (all sub-modules)"}
            </span>
          </div>

          {results.length === 0 ? (
            <div style={{ textAlign: "center", padding: "28px 0" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
              <p style={{ fontSize: 13, color: textSecondary, margin: 0 }}>
                No records match "<strong>{searchText}</strong>"
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                maxHeight: 380,
                overflowY: "auto",
              }}
            >
              {results.map((record) => {
                const allFields = [
                  ...(currentModule?.fields ?? []),
                  ...collectFields(currentModule?.subModules),
                ];

                const entries = Object.entries(record.values || {}).filter(
                  ([, v]) => {
                    if (v === null || v === undefined || v === "") return false;
                    if (typeof v === "object" && !v.name) return false;
                    return true;
                  },
                );

                // Find which sub-module this record belongs to
                function findSubModule(subModules, id) {
                  for (const sm of subModules ?? []) {
                    if (sm.id === id) return sm;
                    const found = findSubModule(sm.subModules, id);
                    if (found) return found;
                  }
                  return null;
                }
                const belongsTo = record.subModuleId
                  ? findSubModule(currentModule?.subModules, record.subModuleId)
                  : null;

                return (
                  <div
                    key={record.id}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 10,
                      background: isDark ? "rgba(255,255,255,0.04)" : "#f8fafc",
                      border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0"}`,
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill,minmax(140px,1fr))",
                        gap: "6px 16px",
                      }}
                    >
                      {entries.map(([fieldId, value]) => {
                        const field = allFields.find((f) => f.id === fieldId);
                        if (!field) return null;
                        const displayVal = fmtVal(value);
                        if (displayVal === null) return null;
                        return (
                          <div key={fieldId}>
                            <div
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                                color: textSecondary,
                                marginBottom: 2,
                              }}
                            >
                              {field.label}
                            </div>
                            <div
                              style={{
                                fontSize: 13,
                                color: textPrimary,
                                fontWeight: 500,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {displayVal}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {belongsTo && (
                      <div
                        style={{
                          marginTop: 8,
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 10,
                            color: isDark ? "rgba(165,180,252,0.5)" : "#6366f1",
                          }}
                        >
                          ◫
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            color: isDark ? "rgba(165,180,252,0.6)" : "#6366f1",
                          }}
                        >
                          {belongsTo.name}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── MAIN DASHBOARD ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isAdmin, isStaff } = useAuth();
  const { isDark } = useTheme();
  const limits = getPlanLimits(user?.plan ?? "STARTER");

  const [modules, setModules] = useState([]);
  const [recordCounts, setRecordCounts] = useState({});
  const [totalRecords, setTotalRecords] = useState(0);
  const [users, setUsers] = useState([]);
  const [activity, setActivity] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [mods, u] = await Promise.all([
        moduleApi.getAll(),
        userApi.getAll(),
      ]);
      setModules(mods);
      setUsers(u);
      const counts = {};
      let total = 0;
      await Promise.all(
        mods.map(async (m) => {
          try {
            const r = await recordApi.getByModule(m.id);
            counts[m.id] = r.length;
            total += r.length;
          } catch {
            counts[m.id] = 0;
          }
        }),
      );
      setRecordCounts(counts);
      setTotalRecords(total);
      if (limits.activityLog) {
        const logs = await activityApi.getRecent(200);
        setActivity(logs);
        setChartData(buildChartData(logs));
      }
    } catch (e) {
      setError("Some data failed to load.");
    } finally {
      setLoading(false);
    }
  }, [limits.activityLog]);

  useEffect(() => {
    load();
  }, [load]);

  const topModules = [...modules]
    .sort((a, b) => (recordCounts[b.id] ?? 0) - (recordCounts[a.id] ?? 0))
    .slice(0, 5);
  const recentActivity = activity.slice(0, 8);
  const weekAgo = Date.now() - 7 * 86400000;
  const recThisWeek = activity.filter(
    (l) =>
      l.action === "CREATE" &&
      l.entityType === "RECORD" &&
      new Date(l.timestamp) > weekAgo,
  ).length;
  const modThisWeek = activity.filter(
    (l) =>
      l.action === "CREATE" &&
      l.entityType === "MODULE" &&
      new Date(l.timestamp) > weekAgo,
  ).length;
  const atRecordLimit =
    limits.maxRecords !== Infinity && totalRecords >= limits.maxRecords;

  const textPrimary = isDark ? "#f1f5f9" : "#0f172a";
  const textSecondary = isDark ? "rgba(255,255,255,0.42)" : "#64748b";
  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "#fff";
  const cardBd = isDark ? "rgba(255,255,255,0.08)" : "#e8f0fe";

  if (loading) return <Skeleton isDark={isDark} />;

  const hour = new Date().getHours();
  const greet =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div
      style={{
        padding: "32px 40px 48px",
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          animation: "fadeUp 0.4s ease both",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 5,
            }}
          >
            <h1
              style={{
                fontSize: 26,
                fontWeight: 900,
                color: textPrimary,
                margin: 0,
                letterSpacing: -0.8,
              }}
            >
              Dashboard
            </h1>
            <PlanBadge plan={user?.plan} isDark={isDark} />
          </div>
          <p
            style={{
              fontSize: 13,
              color: textSecondary,
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
                  background: "#22c55e",
                  display: "inline-block",
                  boxShadow: "0 0 0 2px rgba(34,197,94,0.3)",
                }}
              />
              Live
            </span>
            <span
              style={{ color: isDark ? "rgba(255,255,255,0.15)" : "#e2e8f0" }}
            >
              ·
            </span>
            {greet}, {user?.name?.split(" ")[0] ?? "there"}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={load}
            style={{
              padding: "8px 16px",
              borderRadius: 9,
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              background: isDark ? "rgba(255,255,255,0.06)" : "#f8fafc",
              border: isDark
                ? "1px solid rgba(255,255,255,0.1)"
                : "1.5px solid #e2e8f0",
              color: textSecondary,
              display: "flex",
              alignItems: "center",
              gap: 6,
              transition: "all 0.15s",
            }}
          >
            <span style={{ fontSize: 14 }}>↻</span> Refresh
          </button>
          {isAdmin && (
            <button
              onClick={() => navigate("/modules/new")}
              style={{
                padding: "8px 18px",
                borderRadius: 9,
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 700,
                background: "linear-gradient(135deg,#16a34a,#15803d)",
                border: "none",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 4px 16px rgba(22,163,74,0.35)",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 20px rgba(22,163,74,0.45)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 16px rgba(22,163,74,0.35)";
              }}
            >
              <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> New module
            </button>
          )}
        </div>
      </div>

      {/* ── Error ── */}
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
      {limits.maxRecords !== Infinity &&
        totalRecords >= limits.maxRecords * 0.8 && (
          <div
            style={{
              padding: "12px 18px",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              background: isDark
                ? totalRecords >= limits.maxRecords
                  ? "rgba(239,68,68,0.08)"
                  : "rgba(251,191,36,0.07)"
                : totalRecords >= limits.maxRecords
                  ? "#fef2f2"
                  : "#fffbeb",
              border: `1px solid ${isDark ? (totalRecords >= limits.maxRecords ? "rgba(239,68,68,0.2)" : "rgba(251,191,36,0.2)") : totalRecords >= limits.maxRecords ? "#fecaca" : "#fde68a"}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18 }}>
                {totalRecords >= limits.maxRecords ? "🚫" : "⚠️"}
              </span>
              <div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: isDark
                      ? totalRecords >= limits.maxRecords
                        ? "#f87171"
                        : "#fbbf24"
                      : totalRecords >= limits.maxRecords
                        ? "#dc2626"
                        : "#d97706",
                  }}
                >
                  {totalRecords >= limits.maxRecords
                    ? "Record limit reached"
                    : "Approaching limit"}
                </div>
                <div
                  style={{ fontSize: 11, color: textSecondary, marginTop: 1 }}
                >
                  Using {totalRecords} of {limits.maxRecords} records on the
                  free plan.
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate("/pricing")}
              style={{
                padding: "6px 14px",
                borderRadius: 8,
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
        )}

      {/* ── Stat cards ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))",
          gap: 14,
          animation: "fadeUp 0.45s ease 0.05s both",
        }}
      >
        <StatCard
          label="Total records"
          value={totalRecords}
          sub={limits.activityLog ? `+${recThisWeek} this week` : undefined}
          icon="📄"
          color="blue"
          max={limits.maxRecords}
          isDark={isDark}
        />
        <StatCard
          label="Modules"
          value={modules.length}
          sub={limits.activityLog ? `+${modThisWeek} this week` : undefined}
          icon="⊞"
          color="green"
          max={limits.maxModules}
          isDark={isDark}
        />
        <StatCard
          label="Team members"
          value={users.length}
          icon="👥"
          color="violet"
          max={limits.maxUsers}
          isDark={isDark}
        />
        <StatCard
          label="Recycle bin"
          value={limits.recycleBin ? "Active" : "Locked"}
          icon="🗑"
          color="amber"
          isDark={isDark}
        />
      </div>

      {/* ── Global Search ── */}
      <div style={{ animation: "fadeUp 0.5s ease 0.1s both" }}>
        <GlobalSearch modules={modules} isDark={isDark} />
      </div>

      {/* ── 2-col body ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gap: 20,
          alignItems: "start",
          animation: "fadeUp 0.5s ease 0.15s both",
        }}
      >
        {/* LEFT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Chart card */}
          <div
            style={{
              background: cardBg,
              border: `1px solid ${cardBd}`,
              borderRadius: 18,
              padding: "22px 24px",
              boxShadow: isDark ? "none" : "0 4px 20px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: textPrimary,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                  }}
                >
                  Record activity
                </div>
                <div
                  style={{ fontSize: 11, color: textSecondary, marginTop: 2 }}
                >
                  Last 7 days
                </div>
              </div>
              {limits.dashboardCharts ? (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {[
                    ["Created", "#2563eb"],
                    ["Updated", "rgba(59,130,246,0.4)"],
                  ].map(([l, c]) => (
                    <div
                      key={l}
                      style={{ display: "flex", alignItems: "center", gap: 4 }}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 2,
                          background: c,
                        }}
                      />
                      <span style={{ fontSize: 10, color: textSecondary }}>
                        {l}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    padding: "3px 9px",
                    borderRadius: 99,
                    background: "rgba(251,191,36,0.1)",
                    color: "#f59e0b",
                    border: "1px solid rgba(251,191,36,0.2)",
                  }}
                >
                  PRO
                </span>
              )}
            </div>
            {limits.dashboardCharts ? (
              <div style={{ height: 148 }}>
                {chartData.length > 0 ? (
                  <BarChart data={chartData} isDark={isDark} />
                ) : (
                  <div
                    style={{
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <p
                      style={{ fontSize: 13, color: textSecondary, margin: 0 }}
                    >
                      No activity in the last 7 days
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <FeatureLock
                icon="📊"
                title="Charts require Professional plan"
                desc="See a 7-day breakdown of records created, updated, and deleted across all your modules."
                isDark={isDark}
                navigate={navigate}
                minH={148}
              >
                <div style={{ height: 80 }}>
                  <FakeBars isDark={isDark} />
                </div>
              </FeatureLock>
            )}
          </div>

          {/* Activity feed */}
          <div
            style={{
              background: cardBg,
              border: `1px solid ${cardBd}`,
              borderRadius: 18,
              overflow: "hidden",
              boxShadow: isDark ? "none" : "0 4px 20px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                padding: "22px 24px 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 4,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: textPrimary,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                  }}
                >
                  Recent activity
                </div>
                {limits.activityLog && (
                  <div
                    style={{ fontSize: 11, color: textSecondary, marginTop: 2 }}
                  >
                    {recentActivity.length} recent events
                  </div>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {!limits.activityLog && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      padding: "3px 9px",
                      borderRadius: 99,
                      background: "rgba(251,191,36,0.1)",
                      color: "#f59e0b",
                      border: "1px solid rgba(251,191,36,0.2)",
                    }}
                  >
                    PRO
                  </span>
                )}
                {limits.activityLog && (
                  <button
                    onClick={() => navigate("/activity")}
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
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
            </div>
            {limits.activityLog ? (
              recentActivity.length > 0 ? (
                <div style={{ marginTop: 8 }}>
                  {recentActivity.map((log) => (
                    <ActivityRow key={log.id} log={log} isDark={isDark} />
                  ))}
                </div>
              ) : (
                <div style={{ padding: "36px 24px", textAlign: "center" }}>
                  <p style={{ fontSize: 13, color: textSecondary, margin: 0 }}>
                    No activity recorded yet
                  </p>
                </div>
              )
            ) : (
              <div style={{ padding: "0 24px 24px", marginTop: 12 }}>
                <FeatureLock
                  icon="📋"
                  title="Activity log requires Professional plan"
                  desc="Track every create, edit, and delete action across your workspace — who did what and when."
                  isDark={isDark}
                  navigate={navigate}
                  minH={160}
                >
                  <FakeActivity isDark={isDark} />
                </FeatureLock>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <UsageCard
            totalRecords={totalRecords}
            totalModules={modules.length}
            totalUsers={users.length}
            limits={limits}
            isDark={isDark}
          />

          {/* Modules list */}
          <div
            style={{
              background: cardBg,
              border: `1px solid ${cardBd}`,
              borderRadius: 18,
              overflow: "hidden",
              boxShadow: isDark ? "none" : "0 4px 20px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                padding: "20px 24px 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: textPrimary,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                }}
              >
                Your modules
              </div>
              <button
                onClick={() => navigate("/modules")}
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: isDark ? "#60a5fa" : "#2563eb",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                View all →
              </button>
            </div>
            {topModules.length > 0 ? (
              topModules.map((mod, i) => (
                <ModuleRow
                  key={mod.id}
                  mod={mod}
                  idx={i}
                  recordCount={recordCounts[mod.id] ?? 0}
                  max={limits.maxRecords}
                  isDark={isDark}
                  navigate={navigate}
                />
              ))
            ) : (
              <div style={{ padding: "32px 24px", textAlign: "center" }}>
                <p style={{ fontSize: 13, color: textSecondary, margin: 0 }}>
                  No modules yet
                </p>
                {isAdmin && (
                  <button
                    onClick={() => navigate("/modules/new")}
                    style={{
                      marginTop: 10,
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
                    + Create first module
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div
            style={{
              background: cardBg,
              border: `1px solid ${cardBd}`,
              borderRadius: 18,
              padding: "20px 24px",
              boxShadow: isDark ? "none" : "0 4px 20px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: textPrimary,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                marginBottom: 14,
              }}
            >
              Quick actions
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {isAdmin && (
                <QuickAction
                  icon="⊞"
                  label={atRecordLimit ? "Upgrade for modules" : "New module"}
                  sub={
                    atRecordLimit
                      ? "Plan limit reached"
                      : "Define fields & structure"
                  }
                  onClick={() =>
                    navigate(atRecordLimit ? "/pricing" : "/modules/new")
                  }
                  color="#16a34a"
                  isDark={isDark}
                />
              )}
              <QuickAction
                icon="📄"
                label="Browse modules"
                sub="View and manage records"
                onClick={() => navigate("/modules")}
                color="#2563eb"
                isDark={isDark}
              />
              <QuickAction
                icon="📋"
                label="Activity log"
                sub={
                  limits.activityLog
                    ? "See all changes"
                    : "Track workspace actions"
                }
                onClick={() =>
                  navigate(limits.activityLog ? "/activity" : "/pricing")
                }
                locked={!limits.activityLog}
                color="#7c3aed"
                isDark={isDark}
              />
              {limits.recycleBin && (
                <QuickAction
                  icon="🗑"
                  label="Recycle bin"
                  sub="Restore deleted records"
                  onClick={() => navigate("/recycle-bin")}
                  color="#dc2626"
                  isDark={isDark}
                />
              )}
              {isAdmin && (
                <QuickAction
                  icon="👥"
                  label="Invite member"
                  sub={`${users.length}/${limits.maxUsers === Infinity ? "∞" : limits.maxUsers} seats used`}
                  onClick={() =>
                    navigate(
                      users.length >= limits.maxUsers &&
                        limits.maxUsers !== Infinity
                        ? "/pricing"
                        : "/users",
                    )
                  }
                  locked={
                    limits.maxUsers !== Infinity &&
                    users.length >= limits.maxUsers
                  }
                  color="#0891b2"
                  isDark={isDark}
                />
              )}
            </div>
          </div>

          {user?.plan?.toUpperCase() === "STARTER" && (
            <UpgradeCTA isDark={isDark} navigate={navigate} />
          )}
        </div>
      </div>
    </div>
  );
}
