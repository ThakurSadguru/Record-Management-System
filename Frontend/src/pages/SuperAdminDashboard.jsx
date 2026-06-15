import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../components/layout/AppLayout";
import axios from "../api/axiosInstance";

// ─── API helpers ──────────────────────────────────────────────────────────────
const superAdminApi = {
  getStats: () => axios.get("/super-admin/stats"),
  getOrgs: (page = 0, size = 20) =>
    axios.get(`/super-admin/organisations?page=${page}&size=${size}`),
  getOrgDetail: (orgId) => axios.get(`/super-admin/organisations/${orgId}`),
  setOrgStatus: (orgId, active) =>
    axios.put(`/super-admin/organisations/${orgId}/status?active=${active}`),
  changeOrgPlan: (orgId, plan) =>
    axios.put(`/super-admin/organisations/${orgId}/plan?plan=${plan}`),
  extendTrial: (orgId, days) =>
    axios.put(`/super-admin/organisations/${orgId}/extend-trial?days=${days}`),
  deleteOrg: (orgId) => axios.delete(`/super-admin/organisations/${orgId}`),
  getAllUsers: (search = "") =>
    axios.get(`/super-admin/users?search=${search}`),
  banUser: (userId, banned) =>
    axios.put(`/super-admin/users/${userId}/ban?banned=${banned}`),
  getSignups: (days = 30) =>
    axios.get(`/super-admin/analytics/signups?days=${days}`),
  getRevenue: () => axios.get("/super-admin/analytics/revenue"),
  getEnquiries: () => axios.get("/super-admin/enterprise-enquiries"),
  resolveEnquiry: (id) =>
    axios.put(`/super-admin/enterprise-enquiries/${id}/resolve`),
  setMaintenance: (enabled) =>
    axios.put(`/super-admin/settings/maintenance?enabled=${enabled}`),
};

// ─── Theme tokens ─────────────────────────────────────────────────────────────
function useTokens(isDark) {
  return {
    bg: isDark ? "#070d1a" : "#f8fafc",
    cardBg: isDark ? "rgba(255,255,255,0.04)" : "#ffffff",
    cardBorder: isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0",
    textPrimary: isDark ? "#ffffff" : "#0f172a",
    textSec: isDark ? "rgba(255,255,255,0.45)" : "#64748b",
    rowHover: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc",
    rowDivider: isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9",
    inputBg: isDark ? "rgba(255,255,255,0.06)" : "#ffffff",
    inputBorder: isDark ? "rgba(255,255,255,0.15)" : "#e2e8f0",
    headerBg: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc",
  };
}

// ─── Small atoms ──────────────────────────────────────────────────────────────
function Badge({ label, color, bg, border }) {
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        padding: "3px 9px",
        borderRadius: 99,
        background: bg,
        color,
        border: `1px solid ${border}`,
      }}
    >
      {label}
    </span>
  );
}

function PlanBadge({ plan, isDark }) {
  const map = {
    STARTER: {
      label: "Starter",
      color: isDark ? "#94a3b8" : "#475569",
      bg: isDark ? "rgba(100,116,139,0.2)" : "#f1f5f9",
      border: isDark ? "rgba(100,116,139,0.3)" : "#cbd5e1",
    },
    PROFESSIONAL: {
      label: "Professional",
      color: isDark ? "#60a5fa" : "#1d4ed8",
      bg: isDark ? "rgba(37,99,235,0.2)" : "#dbeafe",
      border: isDark ? "rgba(37,99,235,0.35)" : "#93c5fd",
    },
    ENTERPRISE: {
      label: "Enterprise",
      color: isDark ? "#a78bfa" : "#6d28d9",
      bg: isDark ? "rgba(124,58,237,0.2)" : "#ede9fe",
      border: isDark ? "rgba(124,58,237,0.35)" : "#c4b5fd",
    },
  }[plan?.toUpperCase()] ?? {
    label: plan,
    color: "#94a3b8",
    bg: "rgba(100,116,139,0.1)",
    border: "rgba(100,116,139,0.2)",
  };
  return <Badge {...map} />;
}

function StatusBadge({ active }) {
  return active ? (
    <Badge
      label="Active"
      color="#16a34a"
      bg="rgba(22,163,74,0.1)"
      border="rgba(22,163,74,0.2)"
    />
  ) : (
    <Badge
      label="Inactive"
      color="#dc2626"
      bg="rgba(220,38,38,0.1)"
      border="rgba(220,38,38,0.2)"
    />
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, accent, isDark }) {
  const T = useTokens(isDark);
  return (
    <div
      style={{
        background: T.cardBg,
        border: `1px solid ${T.cardBorder}`,
        borderRadius: 14,
        padding: "20px 22px",
        boxShadow: isDark ? "none" : "0 1px 6px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 14,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            fontSize: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: isDark ? "rgba(255,255,255,0.06)" : "#f8fafc",
            border: `1px solid ${T.cardBorder}`,
          }}
        >
          {icon}
        </div>
        {sub && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#16a34a",
              background: isDark ? "rgba(22,163,74,0.1)" : "#dcfce7",
              padding: "2px 7px",
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
          color: T.textPrimary,
          letterSpacing: -0.5,
          marginBottom: 2,
        }}
      >
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      <div style={{ fontSize: 12, color: T.textSec, fontWeight: 500 }}>
        {label}
      </div>
    </div>
  );
}

// ─── Mini bar chart (canvas) ──────────────────────────────────────────────────
function MiniBarChart({ data, isDark }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !data?.length) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth,
      H = canvas.offsetHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);
    const pad = { top: 10, right: 10, bottom: 24, left: 28 };
    const cW = W - pad.left - pad.right;
    const cH = H - pad.top - pad.bottom;
    const maxVal = Math.max(...data.map((d) => d.count), 1);
    const barW = Math.min((cW / data.length) * 0.5, 18);
    const gridC = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
    const textC = isDark ? "rgba(255,255,255,0.3)" : "#94a3b8";
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i <= 3; i++) {
      const y = pad.top + (cH / 3) * i;
      ctx.beginPath();
      ctx.strokeStyle = gridC;
      ctx.lineWidth = 0.5;
      ctx.setLineDash([4, 4]);
      ctx.moveTo(pad.left, y);
      ctx.lineTo(W - pad.right, y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = textC;
      ctx.font = "8px system-ui";
      ctx.textAlign = "right";
      ctx.fillText(Math.round(maxVal - (maxVal / 3) * i), pad.left - 3, y + 3);
    }
    data.forEach((d, i) => {
      const x = pad.left + i * (cW / data.length) + cW / data.length / 2;
      const h = (d.count / maxVal) * cH;
      const gradient = ctx.createLinearGradient(
        0,
        pad.top + cH - h,
        0,
        pad.top + cH,
      );
      gradient.addColorStop(0, "#2563eb");
      gradient.addColorStop(1, "rgba(37,99,235,0.4)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      const bx = x - barW / 2,
        by = pad.top + cH - h;
      const r = 3;
      ctx.moveTo(bx + r, by);
      ctx.lineTo(bx + barW - r, by);
      ctx.quadraticCurveTo(bx + barW, by, bx + barW, by + r);
      ctx.lineTo(bx + barW, pad.top + cH);
      ctx.lineTo(bx, pad.top + cH);
      ctx.lineTo(bx, by + r);
      ctx.quadraticCurveTo(bx, by, bx + r, by);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = textC;
      ctx.font = "8px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(d.label, x, H - 4);
    });
  }, [data, isDark]);
  return (
    <canvas
      ref={ref}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}

// ─── Donut chart ──────────────────────────────────────────────────────────────
function PlanDonut({ starter, professional, enterprise, isDark }) {
  const total = starter + professional + enterprise || 1;
  const segments = [
    { value: starter, color: isDark ? "#64748b" : "#94a3b8", label: "Starter" },
    { value: professional, color: "#2563eb", label: "Pro" },
    { value: enterprise, color: "#7c3aed", label: "Enterprise" },
  ];
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const S = 120;
    canvas.width = S * dpr;
    canvas.height = S * dpr;
    ctx.scale(dpr, dpr);
    const cx = S / 2,
      cy = S / 2,
      r = 44,
      innerR = 28;
    ctx.clearRect(0, 0, S, S);
    let start = -Math.PI / 2;
    segments.forEach((seg) => {
      const angle = (seg.value / total) * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(cx + innerR * Math.cos(start), cy + innerR * Math.sin(start));
      ctx.arc(cx, cy, r, start, start + angle);
      ctx.arc(cx, cy, innerR, start + angle, start, true);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();
      start += angle;
    });
    ctx.fillStyle = isDark ? "#fff" : "#0f172a";
    ctx.font = "bold 14px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(total, cx, cy + 4);
    ctx.fillStyle = isDark ? "rgba(255,255,255,0.4)" : "#64748b";
    ctx.font = "8px system-ui";
    ctx.fillText("orgs", cx, cy + 14);
  }, [starter, professional, enterprise, isDark]);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      <canvas ref={ref} style={{ width: 120, height: 120, flexShrink: 0 }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {segments.map((s) => (
          <div
            key={s.label}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: s.color,
                flexShrink: 0,
              }}
            />
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: isDark ? "#fff" : "#0f172a",
                }}
              >
                {s.value}{" "}
                <span
                  style={{
                    fontWeight: 400,
                    color: isDark ? "rgba(255,255,255,0.4)" : "#64748b",
                  }}
                >
                  {s.label}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Confirm modal ────────────────────────────────────────────────────────────
function ConfirmModal({
  title,
  message,
  confirmLabel,
  confirmColor,
  onConfirm,
  onCancel,
  isDark,
}) {
  const T = useTokens(isDark);
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: T.cardBg,
          border: `1.5px solid ${T.cardBorder}`,
          borderRadius: 16,
          padding: "28px 32px",
          maxWidth: 400,
          width: "calc(100% - 32px)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: 32, textAlign: "center", marginBottom: 14 }}>
          ⚠️
        </div>
        <h3
          style={{
            fontSize: 16,
            fontWeight: 700,
            textAlign: "center",
            color: T.textPrimary,
            margin: "0 0 10px",
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: 13,
            color: T.textSec,
            textAlign: "center",
            margin: "0 0 24px",
            lineHeight: 1.6,
          }}
        >
          {message}
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "9px 0",
              borderRadius: 9,
              cursor: "pointer",
              background: T.cardBg,
              border: `1px solid ${T.cardBorder}`,
              color: T.textSec,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: "9px 0",
              borderRadius: 9,
              cursor: "pointer",
              background:
                confirmColor || "linear-gradient(135deg,#ef4444,#dc2626)",
              border: "none",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Org Detail Modal ─────────────────────────────────────────────────────────
function OrgDetailModal({
  org,
  isDark,
  onClose,
  onPlanChange,
  onExtendTrial,
  onDelete,
  onStatusChange,
}) {
  const T = useTokens(isDark);
  const [plan, setPlan] = useState(org.plan);
  const [trialDays, setTrialDays] = useState(7);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const inputStyle = {
    padding: "8px 12px",
    borderRadius: 8,
    fontSize: 13,
    outline: "none",
    background: T.inputBg,
    border: `1.5px solid ${T.inputBorder}`,
    color: T.textPrimary,
    width: "100%",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 560,
          maxHeight: "88vh",
          overflowY: "auto",
          background: T.cardBg,
          border: `1.5px solid ${T.cardBorder}`,
          borderRadius: 18,
          padding: "28px 30px",
          boxShadow: "0 30px 80px rgba(0,0,0,0.4)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 24,
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
              <h2
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: T.textPrimary,
                  margin: 0,
                }}
              >
                {org.orgName}
              </h2>
              <StatusBadge active={org.active} />
              <PlanBadge plan={org.plan} isDark={isDark} />
            </div>
            <p style={{ fontSize: 12, color: T.textSec, margin: 0 }}>
              {org.adminEmail}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 22,
              color: T.textSec,
              padding: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
            onMouseLeave={(e) => (e.currentTarget.style.color = T.textSec)}
          >
            ×
          </button>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 10,
            marginBottom: 24,
          }}
        >
          {[
            ["👥", org.userCount ?? 0, "Users"],
            ["⊞", org.moduleCount ?? 0, "Modules"],
            ["📄", org.recordCount ?? 0, "Records"],
          ].map(([icon, val, label]) => (
            <div
              key={label}
              style={{
                background: T.headerBg,
                border: `1px solid ${T.cardBorder}`,
                borderRadius: 10,
                padding: "14px 16px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
              <div
                style={{ fontSize: 18, fontWeight: 800, color: T.textPrimary }}
              >
                {val}
              </div>
              <div style={{ fontSize: 11, color: T.textSec }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Change Plan */}
        <div style={{ marginBottom: 18 }}>
          <label
            style={{
              display: "block",
              fontSize: 11,
              fontWeight: 700,
              color: T.textSec,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 8,
            }}
          >
            Change Plan
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              style={{ ...inputStyle, flex: 1 }}
            >
              {["STARTER", "PROFESSIONAL", "ENTERPRISE"].map((p) => (
                <option
                  key={p}
                  value={p}
                  style={{ background: isDark ? "#1e293b" : "#fff" }}
                >
                  {p}
                </option>
              ))}
            </select>
            <button
              onClick={async () => {
                setSaving(true);
                await onPlanChange(org.orgId, plan);
                setSaving(false);
              }}
              disabled={saving}
              style={{
                padding: "8px 18px",
                borderRadius: 8,
                cursor: "pointer",
                border: "none",
                background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? "Saving…" : "Apply"}
            </button>
          </div>
        </div>

        {/* Extend Trial */}
        <div style={{ marginBottom: 18 }}>
          <label
            style={{
              display: "block",
              fontSize: 11,
              fontWeight: 700,
              color: T.textSec,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 8,
            }}
          >
            Extend Trial
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <select
              value={trialDays}
              onChange={(e) => setTrialDays(Number(e.target.value))}
              style={{ ...inputStyle, flex: 1 }}
            >
              {[3, 7, 14, 30].map((d) => (
                <option
                  key={d}
                  value={d}
                  style={{ background: isDark ? "#1e293b" : "#fff" }}
                >
                  +{d} days
                </option>
              ))}
            </select>
            <button
              onClick={() => onExtendTrial(org.orgId, trialDays)}
              style={{
                padding: "8px 18px",
                borderRadius: 8,
                cursor: "pointer",
                border: "none",
                background: "linear-gradient(135deg,#059669,#047857)",
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Extend
            </button>
          </div>
        </div>

        {/* Actions */}
        <div
          style={{
            display: "flex",
            gap: 10,
            paddingTop: 18,
            borderTop: `1px solid ${T.cardBorder}`,
          }}
        >
          <button
            onClick={() => onStatusChange(org.orgId, !org.active)}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: 9,
              cursor: "pointer",
              border: `1.5px solid ${org.active ? "rgba(239,68,68,0.3)" : "rgba(22,163,74,0.3)"}`,
              background: org.active
                ? isDark
                  ? "rgba(239,68,68,0.08)"
                  : "#fef2f2"
                : isDark
                  ? "rgba(22,163,74,0.08)"
                  : "#f0fdf4",
              color: org.active
                ? isDark
                  ? "#f87171"
                  : "#dc2626"
                : isDark
                  ? "#4ade80"
                  : "#16a34a",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {org.active ? "⛔ Deactivate Org" : "✅ Activate Org"}
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            style={{
              padding: "10px 20px",
              borderRadius: 9,
              cursor: "pointer",
              background: isDark ? "rgba(239,68,68,0.1)" : "#fef2f2",
              border: isDark
                ? "1px solid rgba(239,68,68,0.2)"
                : "1.5px solid #fecaca",
              color: isDark ? "#f87171" : "#dc2626",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            🗑 Delete Org
          </button>
        </div>
      </div>

      {confirmDelete && (
        <ConfirmModal
          title="Delete Organisation?"
          message={`This will permanently delete "${org.orgName}" and all its data. This cannot be undone.`}
          confirmLabel="Delete permanently"
          onConfirm={() => {
            setConfirmDelete(false);
            onDelete(org.orgId);
            onClose();
          }}
          onCancel={() => setConfirmDelete(false)}
          isDark={isDark}
        />
      )}
    </div>
  );
}

// ─── Tab button ───────────────────────────────────────────────────────────────
function Tab({ label, icon, active, onClick, badge, isDark }) {
  const T = useTokens(isDark);
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        padding: "8px 16px",
        borderRadius: 9,
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 600,
        border: "none",
        background: active
          ? isDark
            ? "rgba(37,99,235,0.2)"
            : "#dbeafe"
          : "transparent",
        color: active ? (isDark ? "#60a5fa" : "#1d4ed8") : T.textSec,
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = T.rowHover;
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = "transparent";
      }}
    >
      <span>{icon}</span>
      {label}
      {badge > 0 && (
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            padding: "1px 6px",
            borderRadius: 99,
            background: "#ef4444",
            color: "#fff",
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const { isSuperAdmin } = useAuth();
  const { isDark } = useTheme();
  const T = useTokens(isDark);

  // Redirect if not super admin
  useEffect(() => {
    if (!isSuperAdmin) navigate("/dashboard", { replace: true });
  }, [isSuperAdmin, navigate]);

  // ── State ─────────────────────────────────────────────────────────────────
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [orgs, setOrgs] = useState([]);
  const [users, setUsers] = useState([]);
  const [signups, setSignups] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orgSearch, setOrgSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [maintenance, setMaintenance] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirmMaintenance, setConfirmMaintenance] = useState(false);

  // ── Toast helper ──────────────────────────────────────────────────────────
  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  // ── Load data ─────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, orgsRes, signupsRes, enquiriesRes] =
        await Promise.allSettled([
          superAdminApi.getStats(),
          superAdminApi.getOrgs(),
          superAdminApi.getSignups(30),
          superAdminApi.getEnquiries(),
        ]);
      if (statsRes.status === "fulfilled") setStats(statsRes.value.data);
      if (orgsRes.status === "fulfilled") setOrgs(orgsRes.value.data);
      if (signupsRes.status === "fulfilled") setSignups(signupsRes.value.data);
      if (enquiriesRes.status === "fulfilled")
        setEnquiries(enquiriesRes.value.data);
    } catch (e) {
      showToast("Failed to load some data", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const loadUsers = useCallback(async (search = "") => {
    try {
      const res = await superAdminApi.getAllUsers(search);
      setUsers(res.data);
    } catch {
      showToast("Failed to load users", "error");
    }
  }, []);

  useEffect(() => {
    if (tab === "users") loadUsers(userSearch);
  }, [tab, userSearch, loadUsers]);

  // ── Actions ───────────────────────────────────────────────────────────────
  async function handleStatusChange(orgId, active) {
    try {
      await superAdminApi.setOrgStatus(orgId, active);
      setOrgs((p) => p.map((o) => (o.orgId === orgId ? { ...o, active } : o)));
      if (selectedOrg?.orgId === orgId)
        setSelectedOrg((p) => ({ ...p, active }));
      showToast(`Organisation ${active ? "activated" : "deactivated"}`);
    } catch {
      showToast("Failed to update status", "error");
    }
  }

  async function handlePlanChange(orgId, plan) {
    try {
      await superAdminApi.changeOrgPlan(orgId, plan);
      setOrgs((p) => p.map((o) => (o.orgId === orgId ? { ...o, plan } : o)));
      if (selectedOrg?.orgId === orgId) setSelectedOrg((p) => ({ ...p, plan }));
      showToast("Plan updated successfully");
    } catch {
      showToast("Failed to update plan", "error");
    }
  }

  async function handleExtendTrial(orgId, days) {
    try {
      await superAdminApi.extendTrial(orgId, days);
      showToast(`Trial extended by ${days} days`);
    } catch {
      showToast("Failed to extend trial", "error");
    }
  }

  async function handleDeleteOrg(orgId) {
    try {
      await superAdminApi.deleteOrg(orgId);
      setOrgs((p) => p.filter((o) => o.orgId !== orgId));
      showToast("Organisation deleted");
    } catch {
      showToast("Failed to delete organisation", "error");
    }
  }

  async function handleBanUser(userId, banned) {
    try {
      await superAdminApi.banUser(userId, banned);
      setUsers((p) => p.map((u) => (u.id === userId ? { ...u, banned } : u)));
      showToast(`User ${banned ? "banned" : "unbanned"}`);
    } catch {
      showToast("Failed to update user", "error");
    }
  }

  async function handleResolveEnquiry(id) {
    try {
      await superAdminApi.resolveEnquiry(id);
      setEnquiries((p) =>
        p.map((e) => (e.id === id ? { ...e, resolved: true } : e)),
      );
      showToast("Enquiry marked as resolved");
    } catch {
      showToast("Failed to resolve enquiry", "error");
    }
  }

  async function handleMaintenance(enabled) {
    try {
      await superAdminApi.setMaintenance(enabled);
      setMaintenance(enabled);
      showToast(`Maintenance mode ${enabled ? "enabled" : "disabled"}`);
    } catch {
      showToast("Failed to toggle maintenance", "error");
    }
  }

  // ── Filtered data ─────────────────────────────────────────────────────────
  const filteredOrgs = orgs.filter((o) => {
    const q = orgSearch.toLowerCase();
    const matchSearch =
      !q ||
      o.orgName?.toLowerCase().includes(q) ||
      o.adminEmail?.toLowerCase().includes(q);
    const matchPlan = planFilter === "ALL" || o.plan === planFilter;
    const matchStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" ? o.active : !o.active);
    return matchSearch && matchPlan && matchStatus;
  });

  const pendingEnquiries = enquiries.filter((e) => !e.resolved).length;

  // ── Input style ───────────────────────────────────────────────────────────
  const inputStyle = {
    padding: "8px 12px 8px 34px",
    borderRadius: 9,
    fontSize: 13,
    outline: "none",
    background: T.inputBg,
    border: `1.5px solid ${T.inputBorder}`,
    color: T.textPrimary,
    width: "100%",
    boxSizing: "border-box",
  };

  // ── Loading ───────────────────────────────────────────────────────────────
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
        {[60, 120, 200].map((h, i) => (
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
      {/* ── Toast ── */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 24,
            right: 24,
            zIndex: 999,
            padding: "12px 20px",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 600,
            background:
              toast.type === "error"
                ? isDark
                  ? "rgba(239,68,68,0.9)"
                  : "#dc2626"
                : isDark
                  ? "rgba(22,163,74,0.9)"
                  : "#16a34a",
            color: "#fff",
            boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
            animation: "slideIn 0.2s ease",
          }}
        >
          {toast.type === "error" ? "❌" : "✅"} {toast.msg}
        </div>
      )}
      <style>{`@keyframes slideIn{from{transform:translateX(40px);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>

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
                color: T.textPrimary,
                margin: 0,
                letterSpacing: -0.5,
              }}
            >
              Platform Admin
            </h1>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: "3px 9px",
                borderRadius: 99,
                background: isDark ? "rgba(251,191,36,0.15)" : "#fffbeb",
                color: isDark ? "#fbbf24" : "#d97706",
                border: isDark
                  ? "1px solid rgba(251,191,36,0.3)"
                  : "1px solid #fde68a",
              }}
            >
              SUPER ADMIN
            </span>
            {maintenance && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "3px 9px",
                  borderRadius: 99,
                  background: "rgba(239,68,68,0.1)",
                  color: "#ef4444",
                  border: "1px solid rgba(239,68,68,0.2)",
                }}
              >
                🔧 MAINTENANCE ON
              </span>
            )}
          </div>
          <p style={{ fontSize: 13, color: T.textSec, margin: 0 }}>
            Manage all organisations, plans, users and platform settings
          </p>
        </div>
        <button
          onClick={load}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            cursor: "pointer",
            background: T.cardBg,
            border: `1.5px solid ${T.cardBorder}`,
            color: T.textSec,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          ↻ Refresh
        </button>
      </div>

      {/* ── Tabs ── */}
      <div
        style={{
          display: "flex",
          gap: 4,
          flexWrap: "wrap",
          padding: "6px",
          borderRadius: 12,
          background: T.cardBg,
          border: `1px solid ${T.cardBorder}`,
          width: "fit-content",
        }}
      >
        {[
          { id: "overview", icon: "🌐", label: "Overview" },
          { id: "orgs", icon: "🏢", label: "Organisations" },
          { id: "users", icon: "👥", label: "Users" },
          { id: "analytics", icon: "📈", label: "Analytics" },
          {
            id: "enterprise",
            icon: "💼",
            label: "Enterprise",
            badge: pendingEnquiries,
          },
          { id: "settings", icon: "⚙️", label: "Settings" },
        ].map((t) => (
          <Tab
            key={t.id}
            {...t}
            active={tab === t.id}
            onClick={() => setTab(t.id)}
            isDark={isDark}
          />
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: OVERVIEW
      ══════════════════════════════════════════════════════════════════════ */}
      {tab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Stat cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))",
              gap: 14,
            }}
          >
            <StatCard
              icon="🏢"
              label="Total Organisations"
              value={stats?.totalOrgs ?? orgs.length}
              sub={
                stats?.newOrgsToday ? `+${stats.newOrgsToday} today` : undefined
              }
              isDark={isDark}
            />
            <StatCard
              icon="✅"
              label="Active Orgs"
              value={stats?.activeOrgs ?? orgs.filter((o) => o.active).length}
              isDark={isDark}
            />
            <StatCard
              icon="👥"
              label="Total Users"
              value={stats?.totalUsers ?? 0}
              isDark={isDark}
            />
            <StatCard
              icon="⊞"
              label="Total Modules"
              value={stats?.totalModules ?? 0}
              isDark={isDark}
            />
            <StatCard
              icon="📄"
              label="Total Records"
              value={stats?.totalRecords ?? 0}
              isDark={isDark}
            />
            <StatCard
              icon="💰"
              label="Est. Revenue"
              value={
                stats?.totalRevenue
                  ? `₹${stats.totalRevenue.toLocaleString()}`
                  : "—"
              }
              isDark={isDark}
            />
          </div>

          {/* 2-col: plan dist + recent orgs */}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}
          >
            {/* Plan distribution */}
            <div
              style={{
                background: T.cardBg,
                border: `1px solid ${T.cardBorder}`,
                borderRadius: 14,
                padding: "20px 22px",
              }}
            >
              <h2
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: T.textSec,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  margin: "0 0 20px",
                }}
              >
                Plan Distribution
              </h2>
              <PlanDonut
                starter={
                  stats?.starterOrgs ??
                  orgs.filter((o) => o.plan === "STARTER").length
                }
                professional={
                  stats?.professionalOrgs ??
                  orgs.filter((o) => o.plan === "PROFESSIONAL").length
                }
                enterprise={
                  stats?.enterpriseOrgs ??
                  orgs.filter((o) => o.plan === "ENTERPRISE").length
                }
                isDark={isDark}
              />
            </div>

            {/* Recent signups bar chart */}
            <div
              style={{
                background: T.cardBg,
                border: `1px solid ${T.cardBorder}`,
                borderRadius: 14,
                padding: "20px 22px",
              }}
            >
              <h2
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: T.textSec,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  margin: "0 0 16px",
                }}
              >
                New Signups — Last 30 Days
              </h2>
              {signups.length > 0 ? (
                <div style={{ height: 140 }}>
                  <MiniBarChart
                    data={signups.map((s) => ({
                      label: s.label ?? s.date?.slice(5),
                      count: s.count,
                    }))}
                    isDark={isDark}
                  />
                </div>
              ) : (
                <div
                  style={{
                    height: 140,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <p style={{ fontSize: 13, color: T.textSec, margin: 0 }}>
                    No signup data yet
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Recent organisations */}
          <div
            style={{
              background: T.cardBg,
              border: `1px solid ${T.cardBorder}`,
              borderRadius: 14,
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "18px 22px 0" }}>
              <h2
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: T.textSec,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  margin: "0 0 14px",
                }}
              >
                Recent Organisations
              </h2>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: T.headerBg,
                      borderBottom: `1.5px solid ${T.cardBorder}`,
                    }}
                  >
                    {[
                      "Organisation",
                      "Admin",
                      "Plan",
                      "Users",
                      "Records",
                      "Status",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "11px 16px",
                          textAlign: "left",
                          fontSize: 10,
                          fontWeight: 700,
                          color: T.textSec,
                          textTransform: "uppercase",
                          letterSpacing: "0.07em",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orgs.slice(0, 5).map((org, idx) => (
                    <tr
                      key={org.orgId}
                      style={{
                        borderBottom:
                          idx < 4 ? `1px solid ${T.rowDivider}` : "none",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = T.rowHover)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontWeight: 700, color: T.textPrimary }}>
                          {org.orgName}
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          color: T.textSec,
                          fontSize: 12,
                        }}
                      >
                        {org.adminEmail}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <PlanBadge plan={org.plan} isDark={isDark} />
                      </td>
                      <td
                        style={{ padding: "12px 16px", color: T.textPrimary }}
                      >
                        {org.userCount ?? 0}
                      </td>
                      <td
                        style={{ padding: "12px 16px", color: T.textPrimary }}
                      >
                        {org.recordCount ?? 0}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <StatusBadge active={org.active} />
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <button
                          onClick={() => setSelectedOrg(org)}
                          style={{
                            padding: "5px 12px",
                            borderRadius: 7,
                            cursor: "pointer",
                            background: isDark
                              ? "rgba(37,99,235,0.1)"
                              : "#eff6ff",
                            border: isDark
                              ? "1px solid rgba(37,99,235,0.2)"
                              : "1.5px solid #bfdbfe",
                            color: isDark ? "#60a5fa" : "#1d4ed8",
                            fontSize: 11,
                            fontWeight: 600,
                          }}
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {orgs.length > 5 && (
              <div
                style={{
                  padding: "10px 16px",
                  borderTop: `1px solid ${T.rowDivider}`,
                  background: T.headerBg,
                  textAlign: "center",
                }}
              >
                <button
                  onClick={() => setTab("orgs")}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                    color: isDark ? "#60a5fa" : "#2563eb",
                  }}
                >
                  View all {orgs.length} organisations →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: ORGANISATIONS
      ══════════════════════════════════════════════════════════════════════ */}
      {tab === "orgs" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Search + filters */}
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <div style={{ position: "relative", flex: "0 0 280px" }}>
              <span
                style={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 14,
                  color: T.textSec,
                }}
              >
                🔍
              </span>
              <input
                placeholder="Search org name or email…"
                value={orgSearch}
                onChange={(e) => setOrgSearch(e.target.value)}
                style={inputStyle}
                onFocus={(e) =>
                  (e.target.style.borderColor = isDark ? "#4B9FFF" : "#2563eb")
                }
                onBlur={(e) => (e.target.style.borderColor = T.inputBorder)}
              />
            </div>
            {/* Plan filter */}
            <div style={{ display: "flex", gap: 6 }}>
              {["ALL", "STARTER", "PROFESSIONAL", "ENTERPRISE"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPlanFilter(p)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 20,
                    cursor: "pointer",
                    fontSize: 11,
                    fontWeight: 600,
                    border: "none",
                    background:
                      planFilter === p
                        ? isDark
                          ? "rgba(37,99,235,0.2)"
                          : "#dbeafe"
                        : isDark
                          ? "rgba(255,255,255,0.04)"
                          : "#f8fafc",
                    color:
                      planFilter === p
                        ? isDark
                          ? "#60a5fa"
                          : "#1d4ed8"
                        : T.textSec,
                  }}
                >
                  {p === "ALL"
                    ? "All Plans"
                    : p.charAt(0) + p.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
            {/* Status filter */}
            <div style={{ display: "flex", gap: 6 }}>
              {["ALL", "ACTIVE", "INACTIVE"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 20,
                    cursor: "pointer",
                    fontSize: 11,
                    fontWeight: 600,
                    border: "none",
                    background:
                      statusFilter === s
                        ? isDark
                          ? "rgba(22,163,74,0.15)"
                          : "#dcfce7"
                        : isDark
                          ? "rgba(255,255,255,0.04)"
                          : "#f8fafc",
                    color:
                      statusFilter === s
                        ? isDark
                          ? "#4ade80"
                          : "#15803d"
                        : T.textSec,
                  }}
                >
                  {s === "ALL"
                    ? "All Status"
                    : s.charAt(0) + s.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
            <span
              style={{ fontSize: 12, color: T.textSec, marginLeft: "auto" }}
            >
              {filteredOrgs.length} organisation
              {filteredOrgs.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Org table */}
          <div
            style={{
              background: T.cardBg,
              border: `1.5px solid ${T.cardBorder}`,
              borderRadius: 14,
              overflow: "hidden",
            }}
          >
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: T.headerBg,
                      borderBottom: `1.5px solid ${T.cardBorder}`,
                    }}
                  >
                    {[
                      "Organisation",
                      "Admin Email",
                      "Plan",
                      "Users",
                      "Modules",
                      "Records",
                      "Status",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "12px 16px",
                          textAlign: "left",
                          fontSize: 10,
                          fontWeight: 700,
                          color: T.textSec,
                          textTransform: "uppercase",
                          letterSpacing: "0.07em",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredOrgs.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        style={{ padding: "56px 20px", textAlign: "center" }}
                      >
                        <div style={{ fontSize: 32, marginBottom: 10 }}>🏢</div>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: T.textPrimary,
                            marginBottom: 6,
                          }}
                        >
                          No organisations found
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredOrgs.map((org, idx) => (
                      <tr
                        key={org.orgId}
                        style={{
                          borderBottom:
                            idx < filteredOrgs.length - 1
                              ? `1px solid ${T.rowDivider}`
                              : "none",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = T.rowHover)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        <td style={{ padding: "13px 16px" }}>
                          <div
                            style={{ fontWeight: 700, color: T.textPrimary }}
                          >
                            {org.orgName}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: T.textSec,
                              marginTop: 2,
                            }}
                          >
                            {org.orgId?.slice(0, 16)}…
                          </div>
                        </td>
                        <td
                          style={{
                            padding: "13px 16px",
                            color: T.textSec,
                            fontSize: 12,
                          }}
                        >
                          {org.adminEmail}
                        </td>
                        <td style={{ padding: "13px 16px" }}>
                          <PlanBadge plan={org.plan} isDark={isDark} />
                        </td>
                        <td
                          style={{
                            padding: "13px 16px",
                            color: T.textPrimary,
                            fontWeight: 600,
                          }}
                        >
                          {org.userCount ?? 0}
                        </td>
                        <td
                          style={{
                            padding: "13px 16px",
                            color: T.textPrimary,
                            fontWeight: 600,
                          }}
                        >
                          {org.moduleCount ?? 0}
                        </td>
                        <td
                          style={{
                            padding: "13px 16px",
                            color: T.textPrimary,
                            fontWeight: 600,
                          }}
                        >
                          {org.recordCount ?? 0}
                        </td>
                        <td style={{ padding: "13px 16px" }}>
                          <StatusBadge active={org.active} />
                        </td>
                        <td style={{ padding: "13px 16px" }}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              onClick={() => setSelectedOrg(org)}
                              style={{
                                padding: "5px 12px",
                                borderRadius: 7,
                                cursor: "pointer",
                                background: isDark
                                  ? "rgba(37,99,235,0.1)"
                                  : "#eff6ff",
                                border: isDark
                                  ? "1px solid rgba(37,99,235,0.2)"
                                  : "1.5px solid #bfdbfe",
                                color: isDark ? "#60a5fa" : "#1d4ed8",
                                fontSize: 11,
                                fontWeight: 600,
                              }}
                            >
                              Manage
                            </button>
                            <button
                              onClick={() =>
                                handleStatusChange(org.orgId, !org.active)
                              }
                              style={{
                                padding: "5px 10px",
                                borderRadius: 7,
                                cursor: "pointer",
                                background: org.active
                                  ? isDark
                                    ? "rgba(239,68,68,0.1)"
                                    : "#fef2f2"
                                  : isDark
                                    ? "rgba(22,163,74,0.1)"
                                    : "#f0fdf4",
                                border: org.active
                                  ? isDark
                                    ? "1px solid rgba(239,68,68,0.2)"
                                    : "1.5px solid #fecaca"
                                  : isDark
                                    ? "1px solid rgba(22,163,74,0.2)"
                                    : "1.5px solid #bbf7d0",
                                color: org.active
                                  ? isDark
                                    ? "#f87171"
                                    : "#dc2626"
                                  : isDark
                                    ? "#4ade80"
                                    : "#16a34a",
                                fontSize: 11,
                                fontWeight: 600,
                              }}
                            >
                              {org.active ? "⛔" : "✅"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div
              style={{
                padding: "10px 16px",
                borderTop: `1px solid ${T.rowDivider}`,
                background: T.headerBg,
                fontSize: 12,
                color: T.textSec,
              }}
            >
              {filteredOrgs.length} of {orgs.length} organisations
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: USERS
      ══════════════════════════════════════════════════════════════════════ */}
      {tab === "users" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ position: "relative", maxWidth: 360 }}>
            <span
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 14,
                color: T.textSec,
              }}
            >
              🔍
            </span>
            <input
              placeholder="Search by name, email, org…"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              style={inputStyle}
              onFocus={(e) =>
                (e.target.style.borderColor = isDark ? "#4B9FFF" : "#2563eb")
              }
              onBlur={(e) => (e.target.style.borderColor = T.inputBorder)}
            />
          </div>

          <div
            style={{
              background: T.cardBg,
              border: `1.5px solid ${T.cardBorder}`,
              borderRadius: 14,
              overflow: "hidden",
            }}
          >
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: T.headerBg,
                      borderBottom: `1.5px solid ${T.cardBorder}`,
                    }}
                  >
                    {[
                      "User",
                      "Email",
                      "Org",
                      "Role",
                      "Plan",
                      "Status",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "12px 16px",
                          textAlign: "left",
                          fontSize: 10,
                          fontWeight: 700,
                          color: T.textSec,
                          textTransform: "uppercase",
                          letterSpacing: "0.07em",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        style={{ padding: "56px 20px", textAlign: "center" }}
                      >
                        <p
                          style={{ fontSize: 13, color: T.textSec, margin: 0 }}
                        >
                          {userSearch
                            ? "No users match"
                            : "No users loaded — search to find users"}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    users.map((u, idx) => (
                      <tr
                        key={u.id}
                        style={{
                          borderBottom:
                            idx < users.length - 1
                              ? `1px solid ${T.rowDivider}`
                              : "none",
                          transition: "background 0.15s",
                          opacity: u.banned ? 0.55 : 1,
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = T.rowHover)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        <td style={{ padding: "12px 16px" }}>
                          <div
                            style={{ fontWeight: 600, color: T.textPrimary }}
                          >
                            {u.name ?? "—"}
                          </div>
                        </td>
                        <td
                          style={{
                            padding: "12px 16px",
                            color: T.textSec,
                            fontSize: 12,
                          }}
                        >
                          {u.email}
                        </td>
                        <td
                          style={{
                            padding: "12px 16px",
                            color: T.textSec,
                            fontSize: 12,
                          }}
                        >
                          {u.orgName ?? "—"}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              padding: "3px 8px",
                              borderRadius: 99,
                              background: isDark
                                ? "rgba(167,139,250,0.15)"
                                : "#ede9fe",
                              color: isDark ? "#a78bfa" : "#6d28d9",
                            }}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <PlanBadge plan={u.plan} isDark={isDark} />
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          {u.banned ? (
                            <Badge
                              label="Banned"
                              color="#dc2626"
                              bg="rgba(220,38,38,0.1)"
                              border="rgba(220,38,38,0.2)"
                            />
                          ) : (
                            <Badge
                              label="Active"
                              color="#16a34a"
                              bg="rgba(22,163,74,0.1)"
                              border="rgba(22,163,74,0.2)"
                            />
                          )}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <button
                            onClick={() => handleBanUser(u.id, !u.banned)}
                            style={{
                              padding: "5px 12px",
                              borderRadius: 7,
                              cursor: "pointer",
                              background: u.banned
                                ? isDark
                                  ? "rgba(22,163,74,0.1)"
                                  : "#f0fdf4"
                                : isDark
                                  ? "rgba(239,68,68,0.1)"
                                  : "#fef2f2",
                              border: u.banned
                                ? isDark
                                  ? "1px solid rgba(22,163,74,0.2)"
                                  : "1.5px solid #bbf7d0"
                                : isDark
                                  ? "1px solid rgba(239,68,68,0.2)"
                                  : "1.5px solid #fecaca",
                              color: u.banned
                                ? isDark
                                  ? "#4ade80"
                                  : "#16a34a"
                                : isDark
                                  ? "#f87171"
                                  : "#dc2626",
                              fontSize: 11,
                              fontWeight: 600,
                            }}
                          >
                            {u.banned ? "Unban" : "Ban"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div
              style={{
                padding: "10px 16px",
                borderTop: `1px solid ${T.rowDivider}`,
                background: T.headerBg,
                fontSize: 12,
                color: T.textSec,
              }}
            >
              {users.length} user{users.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: ANALYTICS
      ══════════════════════════════════════════════════════════════════════ */}
      {tab === "analytics" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))",
              gap: 14,
            }}
          >
            <StatCard
              icon="🏢"
              label="Total Orgs"
              value={stats?.totalOrgs ?? orgs.length}
              isDark={isDark}
            />
            <StatCard
              icon="📈"
              label="New This Week"
              value={stats?.newOrgsThisWeek ?? "—"}
              isDark={isDark}
            />
            <StatCard
              icon="💰"
              label="Monthly Revenue"
              value={
                stats?.totalRevenue
                  ? `₹${stats.totalRevenue.toLocaleString()}`
                  : "—"
              }
              isDark={isDark}
            />
            <StatCard
              icon="🔵"
              label="Pro Orgs"
              value={
                stats?.professionalOrgs ??
                orgs.filter((o) => o.plan === "PROFESSIONAL").length
              }
              isDark={isDark}
            />
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}
          >
            <div
              style={{
                background: T.cardBg,
                border: `1px solid ${T.cardBorder}`,
                borderRadius: 14,
                padding: "20px 22px",
              }}
            >
              <h2
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: T.textSec,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  margin: "0 0 16px",
                }}
              >
                Daily Signups — Last 30 Days
              </h2>
              {signups.length > 0 ? (
                <div style={{ height: 180 }}>
                  <MiniBarChart
                    data={signups.map((s) => ({
                      label: s.label ?? s.date?.slice(5),
                      count: s.count,
                    }))}
                    isDark={isDark}
                  />
                </div>
              ) : (
                <div
                  style={{
                    height: 180,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <p style={{ fontSize: 13, color: T.textSec, margin: 0 }}>
                    No signup data yet
                  </p>
                </div>
              )}
            </div>

            <div
              style={{
                background: T.cardBg,
                border: `1px solid ${T.cardBorder}`,
                borderRadius: 14,
                padding: "20px 22px",
              }}
            >
              <h2
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: T.textSec,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  margin: "0 0 20px",
                }}
              >
                Plan Distribution
              </h2>
              <PlanDonut
                starter={
                  stats?.starterOrgs ??
                  orgs.filter((o) => o.plan === "STARTER").length
                }
                professional={
                  stats?.professionalOrgs ??
                  orgs.filter((o) => o.plan === "PROFESSIONAL").length
                }
                enterprise={
                  stats?.enterpriseOrgs ??
                  orgs.filter((o) => o.plan === "ENTERPRISE").length
                }
                isDark={isDark}
              />
            </div>
          </div>

          {/* Top orgs by records */}
          <div
            style={{
              background: T.cardBg,
              border: `1px solid ${T.cardBorder}`,
              borderRadius: 14,
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "18px 22px 0" }}>
              <h2
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: T.textSec,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  margin: "0 0 14px",
                }}
              >
                Most Active Organisations
              </h2>
            </div>
            <div>
              {[...orgs]
                .sort((a, b) => (b.recordCount ?? 0) - (a.recordCount ?? 0))
                .slice(0, 5)
                .map((org, idx, arr) => {
                  const maxR = arr[0]?.recordCount ?? 1;
                  const pct = Math.max(
                    ((org.recordCount ?? 0) / maxR) * 100,
                    2,
                  );
                  return (
                    <div
                      key={org.orgId}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        padding: "12px 22px",
                        borderBottom:
                          idx < arr.length - 1
                            ? `1px solid ${T.rowDivider}`
                            : "none",
                      }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          background: isDark
                            ? "rgba(37,99,235,0.15)"
                            : "#dbeafe",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 11,
                          fontWeight: 800,
                          color: isDark ? "#60a5fa" : "#1d4ed8",
                          flexShrink: 0,
                        }}
                      >
                        {idx + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 5,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: T.textPrimary,
                            }}
                          >
                            {org.orgName}
                          </span>
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: T.textPrimary,
                            }}
                          >
                            {(org.recordCount ?? 0).toLocaleString()} records
                          </span>
                        </div>
                        <div
                          style={{
                            height: 4,
                            borderRadius: 2,
                            overflow: "hidden",
                            background: isDark
                              ? "rgba(255,255,255,0.07)"
                              : "#f1f5f9",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${pct}%`,
                              borderRadius: 2,
                              background:
                                "linear-gradient(90deg,#2563eb,#7c3aed)",
                              transition: "width 0.6s ease",
                            }}
                          />
                        </div>
                      </div>
                      <PlanBadge plan={org.plan} isDark={isDark} />
                    </div>
                  );
                })}
              {orgs.length === 0 && (
                <div style={{ padding: "32px", textAlign: "center" }}>
                  <p style={{ fontSize: 13, color: T.textSec, margin: 0 }}>
                    No organisations yet
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: ENTERPRISE
      ══════════════════════════════════════════════════════════════════════ */}
      {tab === "enterprise" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h2
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: T.textPrimary,
                margin: 0,
              }}
            >
              Enterprise Enquiries
            </h2>
            {pendingEnquiries > 0 && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "3px 9px",
                  borderRadius: 99,
                  background: "rgba(239,68,68,0.1)",
                  color: "#ef4444",
                  border: "1px solid rgba(239,68,68,0.2)",
                }}
              >
                {pendingEnquiries} pending
              </span>
            )}
          </div>

          {enquiries.length === 0 ? (
            <div
              style={{
                background: T.cardBg,
                border: `1.5px solid ${T.cardBorder}`,
                borderRadius: 14,
                padding: "64px 20px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 12 }}>💼</div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: T.textPrimary,
                  marginBottom: 6,
                }}
              >
                No enterprise enquiries yet
              </div>
              <p style={{ fontSize: 13, color: T.textSec, margin: 0 }}>
                When organisations submit enterprise contact forms, they appear
                here.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {enquiries.map((enq) => (
                <div
                  key={enq.id}
                  style={{
                    background: T.cardBg,
                    border: `1.5px solid ${enq.resolved ? T.cardBorder : isDark ? "rgba(124,58,237,0.3)" : "#c4b5fd"}`,
                    borderRadius: 14,
                    padding: "20px 22px",
                    opacity: enq.resolved ? 0.6 : 1,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 14,
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
                        <span
                          style={{
                            fontSize: 15,
                            fontWeight: 700,
                            color: T.textPrimary,
                          }}
                        >
                          {enq.orgName}
                        </span>
                        {enq.resolved ? (
                          <Badge
                            label="Resolved"
                            color="#16a34a"
                            bg="rgba(22,163,74,0.1)"
                            border="rgba(22,163,74,0.2)"
                          />
                        ) : (
                          <Badge
                            label="Pending"
                            color="#7c3aed"
                            bg="rgba(124,58,237,0.1)"
                            border="rgba(124,58,237,0.2)"
                          />
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: T.textSec }}>
                        {enq.adminEmail}
                      </div>
                    </div>
                    {!enq.resolved && (
                      <button
                        onClick={() => handleResolveEnquiry(enq.id)}
                        style={{
                          padding: "7px 16px",
                          borderRadius: 8,
                          cursor: "pointer",
                          border: "none",
                          background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
                          color: "#fff",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        ✓ Mark Resolved
                      </button>
                    )}
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
                      gap: 12,
                    }}
                  >
                    {[
                      ["Company Size", enq.companySize],
                      ["Deployment", enq.deployment],
                      ["Phone", enq.adminPhone ?? "—"],
                      [
                        "Submitted",
                        enq.createdAt
                          ? new Date(enq.createdAt).toLocaleDateString("en-IN")
                          : "—",
                      ],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: T.textSec,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            marginBottom: 3,
                          }}
                        >
                          {k}
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color: T.textPrimary,
                            fontWeight: 500,
                          }}
                        >
                          {v ?? "—"}
                        </div>
                      </div>
                    ))}
                  </div>
                  {enq.requirements && (
                    <div
                      style={{
                        marginTop: 14,
                        padding: "12px 14px",
                        borderRadius: 9,
                        background: isDark
                          ? "rgba(255,255,255,0.03)"
                          : "#f8fafc",
                        border: `1px solid ${T.cardBorder}`,
                        fontSize: 13,
                        color: T.textSec,
                        lineHeight: 1.6,
                      }}
                    >
                      <strong style={{ color: T.textPrimary }}>
                        Requirements:{" "}
                      </strong>
                      {enq.requirements}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: SETTINGS
      ══════════════════════════════════════════════════════════════════════ */}
      {tab === "settings" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            maxWidth: 600,
          }}
        >
          <h2
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: T.textPrimary,
              margin: 0,
            }}
          >
            Platform Settings
          </h2>

          {/* Maintenance Mode */}
          <div
            style={{
              background: T.cardBg,
              border: `1.5px solid ${maintenance ? "rgba(239,68,68,0.3)" : T.cardBorder}`,
              borderRadius: 14,
              padding: "20px 22px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
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
                  <span style={{ fontSize: 20 }}>🔧</span>
                  <span
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: T.textPrimary,
                    }}
                  >
                    Maintenance Mode
                  </span>
                  {maintenance && (
                    <Badge
                      label="ON"
                      color="#ef4444"
                      bg="rgba(239,68,68,0.1)"
                      border="rgba(239,68,68,0.2)"
                    />
                  )}
                </div>
                <p
                  style={{
                    fontSize: 12,
                    color: T.textSec,
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  When enabled, all users see a maintenance page. Only super
                  admins can log in.
                </p>
              </div>
              <button
                onClick={() => setConfirmMaintenance(true)}
                style={{
                  padding: "9px 20px",
                  borderRadius: 9,
                  cursor: "pointer",
                  border: "none",
                  flexShrink: 0,
                  marginLeft: 20,
                  background: maintenance
                    ? "linear-gradient(135deg,#16a34a,#15803d)"
                    : "linear-gradient(135deg,#ef4444,#dc2626)",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                {maintenance ? "Disable" : "Enable"}
              </button>
            </div>
          </div>

          {/* Platform info */}
          <div
            style={{
              background: T.cardBg,
              border: `1.5px solid ${T.cardBorder}`,
              borderRadius: 14,
              padding: "20px 22px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 16,
              }}
            >
              <span style={{ fontSize: 20 }}>📊</span>
              <span
                style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary }}
              >
                Platform Summary
              </span>
            </div>
            {[
              ["Total Organisations", orgs.length],
              ["Active Organisations", orgs.filter((o) => o.active).length],
              ["Inactive Organisations", orgs.filter((o) => !o.active).length],
              ["Starter Plan", orgs.filter((o) => o.plan === "STARTER").length],
              [
                "Professional Plan",
                orgs.filter((o) => o.plan === "PROFESSIONAL").length,
              ],
              [
                "Enterprise Plan",
                orgs.filter((o) => o.plan === "ENTERPRISE").length,
              ],
              ["Total Users", stats?.totalUsers ?? "—"],
              ["Total Records", stats?.totalRecords ?? "—"],
            ].map(([k, v]) => (
              <div
                key={k}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: `1px solid ${T.rowDivider}`,
                  fontSize: 13,
                }}
              >
                <span style={{ color: T.textSec }}>{k}</span>
                <span style={{ fontWeight: 700, color: T.textPrimary }}>
                  {v}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Org Detail Modal ── */}
      {selectedOrg && (
        <OrgDetailModal
          org={selectedOrg}
          isDark={isDark}
          onClose={() => setSelectedOrg(null)}
          onPlanChange={handlePlanChange}
          onExtendTrial={handleExtendTrial}
          onDelete={handleDeleteOrg}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* ── Maintenance confirm ── */}
      {confirmMaintenance && (
        <ConfirmModal
          title={
            maintenance
              ? "Disable Maintenance Mode?"
              : "Enable Maintenance Mode?"
          }
          message={
            maintenance
              ? "All users will regain access to the platform immediately."
              : "All users will be locked out immediately. Only super admins can log in."
          }
          confirmLabel={maintenance ? "Disable" : "Enable"}
          confirmColor={
            maintenance
              ? "linear-gradient(135deg,#16a34a,#15803d)"
              : "linear-gradient(135deg,#ef4444,#dc2626)"
          }
          onConfirm={() => {
            setConfirmMaintenance(false);
            handleMaintenance(!maintenance);
          }}
          onCancel={() => setConfirmMaintenance(false)}
          isDark={isDark}
        />
      )}
    </div>
  );
}
