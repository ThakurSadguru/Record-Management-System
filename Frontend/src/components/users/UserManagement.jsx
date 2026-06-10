import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../layout/AppLayout";
import { getPlanLimits } from "../../utils/planLimits";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const ROLES = ["SUPER_ADMIN", "ADMIN", "STAFF", "VIEWER"];

const ROLE_STYLE = {
  SUPER_ADMIN: {
    bg: "rgba(251,191,36,0.15)",
    text: "#fbbf24",
    border: "rgba(251,191,36,0.3)",
  },
  ADMIN: {
    bg: "rgba(167,139,250,0.15)",
    text: "#a78bfa",
    border: "rgba(167,139,250,0.3)",
  },
  STAFF: {
    bg: "rgba(74,159,255,0.12)",
    text: "#4B9FFF",
    border: "rgba(74,159,255,0.3)",
  },
  VIEWER: {
    bg: "rgba(156,163,175,0.12)",
    text: "#9ca3af",
    border: "rgba(156,163,175,0.3)",
  },
};

const PLAN_STYLE = {
  STARTER: {
    label: "Starter",
    bgL: "#f1f5f9",
    bgD: "rgba(100,116,139,0.2)",
    clL: "#475569",
    clD: "#94a3b8",
    bdL: "#cbd5e1",
    bdD: "rgba(100,116,139,0.3)",
  },
  PROFESSIONAL: {
    label: "Professional",
    bgL: "#dbeafe",
    bgD: "rgba(37,99,235,0.2)",
    clL: "#1d4ed8",
    clD: "#60a5fa",
    bdL: "#93c5fd",
    bdD: "rgba(37,99,235,0.35)",
  },
  ENTERPRISE: {
    label: "Enterprise",
    bgL: "#ede9fe",
    bgD: "rgba(124,58,237,0.2)",
    clL: "#6d28d9",
    clD: "#a78bfa",
    bdL: "#c4b5fd",
    bdD: "rgba(124,58,237,0.35)",
  },
};

const AVATAR_COLORS = [
  "#2563eb",
  "#7c3aed",
  "#059669",
  "#dc2626",
  "#d97706",
  "#0891b2",
];
const avatarColor = (str = "") =>
  AVATAR_COLORS[str.charCodeAt(0) % AVATAR_COLORS.length];

// ─────────────────────────────────────────────────────────────────────────────
// Tiny shared atoms
// ─────────────────────────────────────────────────────────────────────────────
function RoleBadge({ role }) {
  const s = ROLE_STYLE[role] ?? ROLE_STYLE.VIEWER;
  return (
    <span
      style={{
        padding: "3px 10px",
        borderRadius: 99,
        fontSize: 11,
        fontWeight: 700,
        background: s.bg,
        color: s.text,
        border: `1px solid ${s.border}`,
      }}
    >
      {role}
    </span>
  );
}

function PlanBadge({ plan, isDark }) {
  const s = PLAN_STYLE[plan] ?? PLAN_STYLE.STARTER;
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        padding: "3px 9px",
        borderRadius: 99,
        background: isDark ? s.bgD : s.bgL,
        color: isDark ? s.clD : s.clL,
        border: `1px solid ${isDark ? s.bdD : s.bdL}`,
      }}
    >
      {s.label}
    </span>
  );
}

// Upgrade banner — near / at a numeric limit
function UpgradeBanner({ count, max, isDark, navigate }) {
  if (max === Infinity) return null;
  const near = count >= max * 0.8;
  const at = count >= max;
  if (!near) return null;
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
            {at ? "User limit reached" : "Approaching user limit"}
          </div>
          <div
            style={{
              fontSize: 11,
              color: isDark ? "rgba(255,255,255,0.45)" : "#64748b",
              marginTop: 1,
            }}
          >
            {at
              ? `Your plan supports up to ${max} users. Upgrade to add more.`
              : `Using ${count} of ${max} seats on your current plan.`}
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

// ─────────────────────────────────────────────────────────────────────────────
// Shared modal shell
// ─────────────────────────────────────────────────────────────────────────────
function Modal({ title, subtitle, onClose, isDark, children }) {
  const textPrimary = isDark ? "#fff" : "#0f172a";
  const textSecondary = isDark ? "rgba(255,255,255,0.4)" : "#64748b";
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
          maxWidth: 440,
          borderRadius: 16,
          padding: "28px 30px",
          background: isDark ? "rgba(8,16,36,0.98)" : "#fff",
          border: `1px solid ${isDark ? "rgba(74,159,255,0.2)" : "#e2e8f0"}`,
          boxShadow: "0 30px 80px rgba(0,0,0,0.4)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 22,
          }}
        >
          <div>
            <h2
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: textPrimary,
                margin: 0,
              }}
            >
              {title}
            </h2>
            {subtitle && (
              <p
                style={{
                  fontSize: 12,
                  color: textSecondary,
                  margin: "4px 0 0",
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 22,
              lineHeight: 1,
              color: isDark ? "rgba(255,255,255,0.4)" : "#94a3b8",
              padding: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = isDark
                ? "rgba(255,255,255,0.4)"
                : "#94a3b8")
            }
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared field + input styles (factory — avoids re-creating objects on every render)
// ─────────────────────────────────────────────────────────────────────────────
function makeStyles(isDark) {
  return {
    label: {
      display: "block",
      fontSize: 12,
      fontWeight: 600,
      marginBottom: 5,
      color: isDark ? "rgba(255,255,255,0.55)" : "#475569",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    },
    input: {
      width: "100%",
      boxSizing: "border-box",
      padding: "9px 12px",
      borderRadius: 8,
      fontSize: 13,
      outline: "none",
      background: isDark ? "rgba(255,255,255,0.06)" : "#f8fafc",
      border: `1.5px solid ${isDark ? "rgba(255,255,255,0.12)" : "#e2e8f0"}`,
      color: isDark ? "#fff" : "#0f172a",
    },
    focusIn: (e) => {
      e.target.style.borderColor = isDark ? "#4B9FFF" : "#2563eb";
    },
    focusOut: (e) => {
      e.target.style.borderColor = isDark
        ? "rgba(255,255,255,0.12)"
        : "#e2e8f0";
    },
    errorText: { fontSize: 11, color: "#f87171", marginTop: 3 },
    primaryBtn: {
      flex: 1,
      padding: "10px",
      borderRadius: 9,
      border: "none",
      cursor: "pointer",
      background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
      color: "#fff",
      fontWeight: 700,
      fontSize: 14,
      boxShadow: "0 4px 14px rgba(37,99,235,0.35)",
    },
    cancelBtn: (isDark) => ({
      padding: "10px 20px",
      borderRadius: 9,
      cursor: "pointer",
      background: isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9",
      border: isDark
        ? "1px solid rgba(255,255,255,0.12)"
        : "1.5px solid #e2e8f0",
      color: isDark ? "rgba(255,255,255,0.7)" : "#475569",
      fontWeight: 600,
      fontSize: 14,
    }),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Create user modal
// ─────────────────────────────────────────────────────────────────────────────
function CreateUserModal({
  isDark,
  onClose,
  onCreate,
  isSuperAdmin,
  atLimit,
  navigate,
}) {
  const S = makeStyles(isDark);
  const textSecondary = isDark ? "rgba(255,255,255,0.45)" : "#64748b";
  const [form, setForm] = useState({ name: "", email: "", role: "STAFF" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Show upgrade wall instead of form if plan limit is hit
  if (atLimit) {
    return (
      <Modal title="User limit reached" isDark={isDark} onClose={onClose}>
        <div style={{ textAlign: "center", padding: "12px 0 8px" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🚫</div>
          <p
            style={{
              fontSize: 13,
              color: textSecondary,
              marginBottom: 20,
              lineHeight: 1.6,
            }}
          >
            Your plan has reached its user limit. Upgrade to add more team
            members.
          </p>
          <button
            onClick={() => {
              onClose();
              navigate("/pricing");
            }}
            style={{ ...S.primaryBtn, width: "100%", boxSizing: "border-box" }}
          >
            View upgrade options →
          </button>
        </div>
      </Modal>
    );
  }

  function set(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: null }));
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    return e;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setLoading(true);
    try {
      await onCreate(form);
      onClose();
    } catch (err) {
      setErrors({
        email: err.response?.data?.message || "Failed to create user",
      });
    } finally {
      setLoading(false);
    }
  }

  // roles visible to admins (not SUPER_ADMIN unless they are one)
  const visibleRoles = ROLES.filter((r) =>
    isSuperAdmin ? true : r !== "SUPER_ADMIN",
  );

  return (
    <Modal title="Create new user" isDark={isDark} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {/* Name */}
        <div style={{ marginBottom: 14 }}>
          <label style={S.label}>Full name</label>
          <input
            style={S.input}
            placeholder="Priya Sharma"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            onFocus={S.focusIn}
            onBlur={S.focusOut}
          />
          {errors.name && <div style={S.errorText}>{errors.name}</div>}
        </div>

        {/* Email */}
        <div style={{ marginBottom: 14 }}>
          <label style={S.label}>Work email</label>
          <input
            type="email"
            style={S.input}
            placeholder="priya@yourcompany.com"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            onFocus={S.focusIn}
            onBlur={S.focusOut}
          />
          {errors.email && <div style={S.errorText}>{errors.email}</div>}
        </div>

        {/* Role */}
        <div style={{ marginBottom: 22 }}>
          <label style={S.label}>Role</label>
          <select
            style={S.input}
            value={form.role}
            onChange={(e) => set("role", e.target.value)}
          >
            {visibleRoles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          {/* Role guide */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 6,
              marginTop: 10,
            }}
          >
            {[
              ["Admin", "Full access", "#a78bfa"],
              ["Staff", "Add & edit", "#4B9FFF"],
              ["Viewer", "Read only", "#9ca3af"],
            ].map(([r, d, c]) => (
              <div
                key={r}
                style={{
                  padding: "8px 10px",
                  borderRadius: 8,
                  background: isDark ? "rgba(255,255,255,0.04)" : "#f8fafc",
                  border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "#e2e8f0"}`,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: c,
                    marginBottom: 2,
                  }}
                >
                  {r}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: isDark ? "rgba(255,255,255,0.35)" : "#94a3b8",
                  }}
                >
                  {d}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="submit"
            disabled={loading}
            style={{ ...S.primaryBtn, opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "Creating…" : "Create user"}
          </button>
          <button type="button" onClick={onClose} style={S.cancelBtn(isDark)}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Edit user modal
// ─────────────────────────────────────────────────────────────────────────────
function EditUserModal({ targetUser, isDark, onClose, onSave, isSuperAdmin }) {
  const S = makeStyles(isDark);
  const [form, setForm] = useState({
    name: targetUser.name,
    role: targetUser.role,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const visibleRoles = ROLES.filter((r) =>
    isSuperAdmin ? true : r !== "SUPER_ADMIN",
  );

  async function handleSubmit(ev) {
    ev.preventDefault();
    if (!form.name.trim()) {
      setError("Name cannot be empty");
      return;
    }
    setLoading(true);
    try {
      await onSave(targetUser.id, form);
      onClose();
    } catch (e) {
      setError(e.response?.data?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      title="Edit user"
      subtitle={targetUser.email}
      isDark={isDark}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 14 }}>
          <label style={S.label}>Full name</label>
          <input
            style={S.input}
            value={form.name}
            onChange={(e) => {
              setForm((p) => ({ ...p, name: e.target.value }));
              setError("");
            }}
            onFocus={S.focusIn}
            onBlur={S.focusOut}
          />
          {error && <div style={S.errorText}>{error}</div>}
        </div>
        <div style={{ marginBottom: 22 }}>
          <label style={S.label}>Role</label>
          <select
            style={S.input}
            value={form.role}
            onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
          >
            {visibleRoles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="submit"
            disabled={loading}
            style={{ ...S.primaryBtn, opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "Saving…" : "Save changes"}
          </button>
          <button type="button" onClick={onClose} style={S.cancelBtn(isDark)}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Delete confirm modal
// ─────────────────────────────────────────────────────────────────────────────
function DeleteConfirmModal({ targetUser, isDark, onConfirm, onCancel }) {
  const [loading, setLoading] = useState(false);
  const textSecondary = isDark ? "rgba(255,255,255,0.5)" : "#64748b";
  return (
    <Modal title="Remove user?" isDark={isDark} onClose={onCancel}>
      <div style={{ textAlign: "center", padding: "4px 0 12px" }}>
        <div style={{ fontSize: 32, marginBottom: 10 }}>🗑️</div>
        <p
          style={{
            fontSize: 13,
            color: textSecondary,
            lineHeight: 1.6,
            marginBottom: 24,
          }}
        >
          Remove{" "}
          <strong style={{ color: isDark ? "#fff" : "#0f172a" }}>
            {targetUser.name}
          </strong>{" "}
          ({targetUser.email}) from your organisation? This cannot be undone.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "9px",
              borderRadius: 9,
              cursor: "pointer",
              background: isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9",
              border: isDark
                ? "1px solid rgba(255,255,255,0.12)"
                : "1.5px solid #e2e8f0",
              color: isDark ? "rgba(255,255,255,0.7)" : "#475569",
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              setLoading(true);
              await onConfirm();
              setLoading(false);
            }}
            disabled={loading}
            style={{
              flex: 1,
              padding: "9px",
              borderRadius: 9,
              cursor: "pointer",
              border: "none",
              background: "linear-gradient(135deg,#ef4444,#dc2626)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 13,
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Removing…" : "Remove user"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main UserManagement page
// ─────────────────────────────────────────────────────────────────────────────
export default function UserManagement() {
  const navigate = useNavigate();
  const { user: me, isAdmin, isSuperAdmin } = useAuth();
  const { isDark } = useTheme();

  // useData() must return users scoped to the current org by the backend.
  // The backend filters by orgId from the JWT — see notes above.
  const { users, loadUsers, sendInvite, updateUser, deleteUser } = useData();

  // Plan limits derived from the logged-in user's plan
  const limits = getPlanLimits(me?.plan);
  const userCount = users?.length ?? 0;
  const atLimit = limits.maxUsers !== Infinity && userCount >= limits.maxUsers;

  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState(null); // user object to edit
  const [deleteTarget, setDeleteTarget] = useState(null); // user object to delete
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // ── Theme tokens ──────────────────────────────────────────────────────────
  const textPrimary = isDark ? "#fff" : "#0f172a";
  const textSecondary = isDark ? "rgba(255,255,255,0.45)" : "#64748b";
  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "#ffffff";
  const cardBorder = isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0";
  const headerBg = isDark ? "rgba(255,255,255,0.03)" : "#f8fafc";
  const rowHover = isDark ? "rgba(255,255,255,0.03)" : "#f8fafc";
  const rowDivider = isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9";
  const inputBg = isDark ? "rgba(255,255,255,0.06)" : "#fff";
  const inputBorder = isDark ? "rgba(255,255,255,0.15)" : "#e2e8f0";

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = (users ?? []).filter((u) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q);
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  // ── Handlers ──────────────────────────────────────────────────────────────
  async function handleDelete(u) {
    await deleteUser(u.id);
    setDeleteTarget(null);
  }

  // ── Invite button label ───────────────────────────────────────────────────
  const inviteBtnLabel = atLimit ? "Upgrade to add more →" : "+ Add user";
  const inviteBtnStyle = {
    padding: "9px 20px",
    borderRadius: 9,
    border: "none",
    cursor: "pointer",
    background: atLimit
      ? "linear-gradient(135deg,#2563eb,#1d4ed8)"
      : "linear-gradient(135deg,#16a34a,#15803d)",
    color: "#fff",
    fontWeight: 600,
    fontSize: 13,
    boxShadow: atLimit
      ? "0 4px 14px rgba(37,99,235,0.35)"
      : "0 4px 14px rgba(22,163,74,0.35)",
    display: "flex",
    alignItems: "center",
    gap: 7,
  };

  return (
    <div
      style={{
        padding: "36px 40px",
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 22,
        color: textPrimary,
      }}
    >
      {/* ── Modals ── */}
      {showCreate && (
        <CreateUserModal
          isDark={isDark}
          onClose={() => setShowCreate(false)}
          onCreate={sendInvite}
          isSuperAdmin={isSuperAdmin}
          atLimit={atLimit}
          navigate={navigate}
        />
      )}
      {editUser && (
        <EditUserModal
          targetUser={editUser}
          isDark={isDark}
          onClose={() => setEditUser(null)}
          onSave={updateUser}
          isSuperAdmin={isSuperAdmin}
        />
      )}
      {deleteTarget && (
        <DeleteConfirmModal
          targetUser={deleteTarget}
          isDark={isDark}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

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
          <h1
            style={{
              fontSize: 24,
              fontWeight: 800,
              margin: "0 0 4px",
              letterSpacing: -0.5,
              color: textPrimary,
            }}
          >
            Team
          </h1>
          <p style={{ fontSize: 13, color: textSecondary, margin: 0 }}>
            {userCount}
            {limits.maxUsers !== Infinity ? `/${limits.maxUsers}` : ""} member
            {userCount !== 1 ? "s" : ""} in your organisation
          </p>
        </div>

        {/* Only admins can add users */}
        {isAdmin && (
          <button
            onClick={() =>
              atLimit ? navigate("/pricing") : setShowCreate(true)
            }
            style={inviteBtnStyle}
          >
            <span style={{ fontSize: 16, lineHeight: 1 }}>
              {atLimit ? "⭐" : "+"}
            </span>
            {inviteBtnLabel}
          </button>
        )}
      </div>

      {/* ── Plan upgrade nudge ── */}
      <UpgradeBanner
        count={userCount}
        max={limits.maxUsers}
        isDark={isDark}
        navigate={navigate}
      />

      {/* ── Search + role filter ── */}
      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {/* Search */}
        <div style={{ position: "relative", flex: "0 0 280px" }}>
          <span
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 14,
              color: textSecondary,
            }}
          >
            🔍
          </span>
          <input
            placeholder="Search by name, email, role…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              boxSizing: "border-box",
              paddingLeft: 36,
              paddingRight: 14,
              paddingTop: 9,
              paddingBottom: 9,
              borderRadius: 9,
              fontSize: 13,
              background: inputBg,
              border: `1.5px solid ${inputBorder}`,
              color: textPrimary,
              outline: "none",
            }}
            onFocus={(e) =>
              (e.target.style.borderColor = isDark ? "#4B9FFF" : "#2563eb")
            }
            onBlur={(e) => (e.target.style.borderColor = inputBorder)}
          />
        </div>

        {/* Role filter pills */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["ALL", ...ROLES].map((r) => {
            const s = ROLE_STYLE[r];
            const active = roleFilter === r;
            return (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                style={{
                  padding: "5px 12px",
                  borderRadius: 20,
                  cursor: "pointer",
                  fontSize: 11,
                  fontWeight: 600,
                  background: active
                    ? (s?.bg ?? (isDark ? "rgba(255,255,255,0.1)" : "#f1f5f9"))
                    : isDark
                      ? "rgba(255,255,255,0.04)"
                      : "#f8fafc",
                  border: active
                    ? `1.5px solid ${s?.border ?? "#e2e8f0"}`
                    : `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0"}`,
                  color: active ? (s?.text ?? textPrimary) : textSecondary,
                }}
              >
                {r === "ALL" ? "All roles" : r}
              </button>
            );
          })}
        </div>

        <span
          style={{ fontSize: 12, color: textSecondary, marginLeft: "auto" }}
        >
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Table ── */}
      <div
        style={{
          background: cardBg,
          border: `1.5px solid ${cardBorder}`,
          borderRadius: 14,
          overflow: "hidden",
          boxShadow: isDark ? "none" : "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
          >
            <thead>
              <tr
                style={{
                  background: headerBg,
                  borderBottom: `1.5px solid ${cardBorder}`,
                }}
              >
                {["Member", "Email", "Role", "Plan", "Joined", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        padding: "12px 20px",
                        textAlign: h === "Actions" ? "right" : "left",
                        fontSize: 11,
                        fontWeight: 700,
                        color: textSecondary,
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{ padding: "56px 20px", textAlign: "center" }}
                  >
                    <div style={{ fontSize: 32, marginBottom: 10 }}>👥</div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: textPrimary,
                        marginBottom: 6,
                      }}
                    >
                      {search || roleFilter !== "ALL"
                        ? "No members match"
                        : "No team members yet"}
                    </div>
                    <p
                      style={{ fontSize: 13, color: textSecondary, margin: 0 }}
                    >
                      {search || roleFilter !== "ALL"
                        ? "Try adjusting your search or filter"
                        : "Add your first team member to get started"}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((u, idx) => (
                  <tr
                    key={u.id}
                    style={{
                      borderBottom:
                        idx < filtered.length - 1
                          ? `1px solid ${rowDivider}`
                          : "none",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = rowHover)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    {/* Member / avatar */}
                    <td style={{ padding: "14px 20px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            flexShrink: 0,
                            background: avatarColor(u.name ?? u.email),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#fff",
                          }}
                        >
                          {(u.name ?? u.email)?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div
                            style={{
                              fontWeight: 600,
                              color: textPrimary,
                              display: "flex",
                              alignItems: "center",
                              gap: 7,
                            }}
                          >
                            {u.name ?? "—"}
                            {u.email === me?.email && (
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 700,
                                  padding: "1px 7px",
                                  borderRadius: 99,
                                  background: isDark
                                    ? "rgba(255,255,255,0.08)"
                                    : "#f1f5f9",
                                  color: isDark
                                    ? "rgba(255,255,255,0.4)"
                                    : "#64748b",
                                }}
                              >
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td style={{ padding: "14px 20px", color: textSecondary }}>
                      {u.email}
                    </td>

                    {/* Role */}
                    <td style={{ padding: "14px 20px" }}>
                      <RoleBadge role={u.role} />
                    </td>

                    {/* Plan */}
                    <td style={{ padding: "14px 20px" }}>
                      <PlanBadge plan={u.plan} isDark={isDark} />
                    </td>

                    {/* Joined */}
                    <td
                      style={{
                        padding: "14px 20px",
                        color: textSecondary,
                        fontSize: 12,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>

                    {/* Actions — only admins see these; can't act on themselves */}
                    <td
                      style={{
                        padding: "14px 20px",
                        textAlign: "right",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {isAdmin ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            gap: 8,
                          }}
                        >
                          <button
                            onClick={() => setEditUser(u)}
                            style={{
                              padding: "6px 14px",
                              borderRadius: 7,
                              cursor: "pointer",
                              fontSize: 12,
                              fontWeight: 600,
                              background: isDark
                                ? "rgba(74,159,255,0.1)"
                                : "#eff6ff",
                              border: isDark
                                ? "1px solid rgba(74,159,255,0.2)"
                                : "1.5px solid #bfdbfe",
                              color: isDark ? "#4B9FFF" : "#1d4ed8",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background = isDark
                                ? "rgba(74,159,255,0.18)"
                                : "#dbeafe")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = isDark
                                ? "rgba(74,159,255,0.1)"
                                : "#eff6ff")
                            }
                          >
                            ✎ Edit
                          </button>
                          <button
                            onClick={() =>
                              u.email !== me?.email && setDeleteTarget(u)
                            }
                            disabled={u.email === me?.email}
                            style={{
                              padding: "6px 14px",
                              borderRadius: 7,
                              cursor:
                                u.email === me?.email
                                  ? "not-allowed"
                                  : "pointer",
                              fontSize: 12,
                              fontWeight: 600,
                              opacity: u.email === me?.email ? 0.35 : 1,
                              background: isDark
                                ? "rgba(239,68,68,0.1)"
                                : "#fef2f2",
                              border: isDark
                                ? "1px solid rgba(239,68,68,0.2)"
                                : "1.5px solid #fecaca",
                              color: isDark ? "#f87171" : "#dc2626",
                            }}
                            onMouseEnter={(e) => {
                              if (u.email !== me?.email)
                                e.currentTarget.style.background = isDark
                                  ? "rgba(239,68,68,0.2)"
                                  : "#fee2e2";
                            }}
                            onMouseLeave={(e) => {
                              if (u.email !== me?.email)
                                e.currentTarget.style.background = isDark
                                  ? "rgba(239,68,68,0.1)"
                                  : "#fef2f2";
                            }}
                          >
                            🗑 Remove
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: textSecondary }}>
                          —
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "10px 20px",
            borderTop: `1px solid ${rowDivider}`,
            background: headerBg,
            fontSize: 12,
            color: textSecondary,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>
            {filtered.length} member{filtered.length !== 1 ? "s" : ""}
          </span>
          {(search || roleFilter !== "ALL") && (
            <button
              onClick={() => {
                setSearch("");
                setRoleFilter("ALL");
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                color: isDark ? "#4B9FFF" : "#2563eb",
                fontWeight: 600,
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
