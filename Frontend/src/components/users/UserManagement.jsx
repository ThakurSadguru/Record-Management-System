import { useState, useEffect } from "react";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../layout/AppLayout";

const ROLES = ["ADMIN", "STAFF", "VIEWER"];

const roleStyle = {
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

function RoleBadge({ role }) {
  const s = roleStyle[role] || roleStyle.VIEWER;
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

// ── Create User Modal ─────────────────────────────────────────────────────────
function CreateUserModal({ isDark, onClose, onCreate }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "STAFF",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const overlay = {
    position: "fixed",
    inset: 0,
    zIndex: 200,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(0,0,0,0.6)",
    backdropFilter: "blur(4px)",
  };
  const card = {
    width: "100%",
    maxWidth: 440,
    borderRadius: 16,
    padding: "28px 30px",
    background: isDark ? "rgba(8,16,36,0.98)" : "#fff",
    border: `1px solid ${isDark ? "rgba(74,159,255,0.2)" : "#e2e8f0"}`,
    boxShadow: "0 30px 80px rgba(0,0,0,0.4)",
  };
  const label = {
    display: "block",
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 5,
    color: isDark ? "rgba(255,255,255,0.55)" : "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };
  const input = {
    width: "100%",
    boxSizing: "border-box",
    padding: "9px 12px",
    borderRadius: 8,
    fontSize: 13,
    background: isDark ? "rgba(255,255,255,0.06)" : "#f8fafc",
    border: `1.5px solid ${isDark ? "rgba(255,255,255,0.12)" : "#e2e8f0"}`,
    color: isDark ? "#fff" : "#0f172a",
    outline: "none",
  };
  const err = { fontSize: 11, color: "#f87171", marginTop: 3 };

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (form.password.length < 6) e.password = "Min 6 characters";
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

  function field(key, type, placeholder) {
    return (
      <div style={{ marginBottom: 14 }}>
        <label style={label}>
          {key.charAt(0).toUpperCase() + key.slice(1)}
        </label>
        <input
          type={type}
          placeholder={placeholder}
          value={form[key]}
          onChange={(e) => {
            setForm((p) => ({ ...p, [key]: e.target.value }));
            setErrors((p) => ({ ...p, [key]: null }));
          }}
          style={input}
          onFocus={(ev) =>
            (ev.target.style.borderColor = isDark ? "#4B9FFF" : "#2563eb")
          }
          onBlur={(ev) =>
            (ev.target.style.borderColor = isDark
              ? "rgba(255,255,255,0.12)"
              : "#e2e8f0")
          }
        />
        {errors[key] && <div style={err}>{errors[key]}</div>}
      </div>
    );
  }

  return (
    <div style={overlay} onClick={onClose}>
      <div style={card} onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 22,
          }}
        >
          <h2
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: isDark ? "#fff" : "#0f172a",
              margin: 0,
            }}
          >
            Create New User
          </h2>
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
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {field("name", "text", "Full name")}
          {field("email", "email", "user@example.com")}
          {field("password", "password", "Min 6 characters")}

          <div style={{ marginBottom: 20 }}>
            <label style={label}>Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
              style={input}
            >
              {ROLES.map((r) => (
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
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: 9,
                border: "none",
                cursor: "pointer",
                background: loading
                  ? "rgba(37,99,235,0.5)"
                  : "linear-gradient(135deg,#2563eb,#1d4ed8)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 14,
                boxShadow: "0 4px 14px rgba(37,99,235,0.35)",
              }}
            >
              {loading ? "Creating…" : "Create User"}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
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
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Edit User Modal ───────────────────────────────────────────────────────────
function EditUserModal({ user, isDark, onClose, onSave }) {
  const [form, setForm] = useState({ name: user.name, role: user.role });
  const [loading, setLoading] = useState(false);

  const overlay = {
    position: "fixed",
    inset: 0,
    zIndex: 200,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(0,0,0,0.6)",
    backdropFilter: "blur(4px)",
  };
  const card = {
    width: "100%",
    maxWidth: 400,
    borderRadius: 16,
    padding: "28px 30px",
    background: isDark ? "rgba(8,16,36,0.98)" : "#fff",
    border: `1px solid ${isDark ? "rgba(74,159,255,0.2)" : "#e2e8f0"}`,
    boxShadow: "0 30px 80px rgba(0,0,0,0.4)",
  };
  const label = {
    display: "block",
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 5,
    color: isDark ? "rgba(255,255,255,0.55)" : "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };
  const input = {
    width: "100%",
    boxSizing: "border-box",
    padding: "9px 12px",
    borderRadius: 8,
    fontSize: 13,
    background: isDark ? "rgba(255,255,255,0.06)" : "#f8fafc",
    border: `1.5px solid ${isDark ? "rgba(255,255,255,0.12)" : "#e2e8f0"}`,
    color: isDark ? "#fff" : "#0f172a",
    outline: "none",
  };

  async function handleSubmit(ev) {
    ev.preventDefault();
    setLoading(true);
    try {
      await onSave(user.id, form);
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={overlay} onClick={onClose}>
      <div style={card} onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 22,
          }}
        >
          <div>
            <h2
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: isDark ? "#fff" : "#0f172a",
                margin: 0,
              }}
            >
              Edit User
            </h2>
            <p
              style={{
                fontSize: 12,
                color: isDark ? "rgba(255,255,255,0.4)" : "#64748b",
                margin: "4px 0 0",
              }}
            >
              {user.email}
            </p>
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
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={label}>Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              style={input}
              onFocus={(ev) =>
                (ev.target.style.borderColor = isDark ? "#4B9FFF" : "#2563eb")
              }
              onBlur={(ev) =>
                (ev.target.style.borderColor = isDark
                  ? "rgba(255,255,255,0.12)"
                  : "#e2e8f0")
              }
            />
          </div>

          <div style={{ marginBottom: 22 }}>
            <label style={label}>Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
              style={input}
            >
              {ROLES.map((r) => (
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
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: 9,
                border: "none",
                cursor: "pointer",
                background: loading
                  ? "rgba(37,99,235,0.5)"
                  : "linear-gradient(135deg,#2563eb,#1d4ed8)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 14,
                boxShadow: "0 4px 14px rgba(37,99,235,0.35)",
              }}
            >
              {loading ? "Saving…" : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
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
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function UserManagement() {
  const { user: me } = useAuth();
  const { isDark } = useTheme();
  const { users, loadUsers, createUser, updateUser, deleteUser } = useData();

  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const textPrimary = isDark ? "#fff" : "#0f172a";
  const textSecondary = isDark ? "rgba(255,255,255,0.45)" : "#64748b";
  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "#ffffff";
  const cardBorder = isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0";
  const headerBg = isDark ? "rgba(255,255,255,0.03)" : "#f8fafc";
  const rowHover = isDark ? "rgba(255,255,255,0.03)" : "#f8fafc";
  const divider = isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9";
  const inputBg = isDark ? "rgba(255,255,255,0.06)" : "#fff";
  const inputBorder = isDark ? "rgba(255,255,255,0.15)" : "#e2e8f0";

  const filtered = users.filter(
    (u) =>
      !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.role?.toLowerCase().includes(search.toLowerCase()),
  );

  async function handleDelete(u) {
    if (u.email === me?.email) {
      alert("You can't delete yourself.");
      return;
    }
    if (!window.confirm(`Remove user "${u.name}"? This cannot be undone.`))
      return;
    await deleteUser(u.id);
  }

  function avatarColor(name) {
    const colors = [
      "#2563eb",
      "#7c3aed",
      "#059669",
      "#dc2626",
      "#d97706",
      "#0891b2",
    ];
    return colors[(name?.charCodeAt(0) ?? 0) % colors.length];
  }

  return (
    <div
      style={{ padding: "36px 40px", minHeight: "100%", color: textPrimary }}
    >
      {/* Modals */}
      {showCreate && (
        <CreateUserModal
          isDark={isDark}
          onClose={() => setShowCreate(false)}
          onCreate={createUser}
        />
      )}
      {editUser && (
        <EditUserModal
          user={editUser}
          isDark={isDark}
          onClose={() => setEditUser(null)}
          onSave={updateUser}
        />
      )}

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 28,
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
            Users
          </h1>
          <p style={{ color: textSecondary, fontSize: 13, margin: 0 }}>
            {users.length} registered user{users.length !== 1 ? "s" : ""}
          </p>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          style={{
            padding: "9px 20px",
            borderRadius: 9,
            border: "none",
            cursor: "pointer",
            background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
            color: "#fff",
            fontWeight: 600,
            fontSize: 13,
            boxShadow: "0 4px 14px rgba(37,99,235,0.35)",
            display: "flex",
            alignItems: "center",
            gap: 7,
          }}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
          Create User
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 18, position: "relative", maxWidth: 360 }}>
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

      {/* Table */}
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
                {["Name", "Email", "Role", "Joined", "Actions"].map((h) => (
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
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      padding: "48px 20px",
                      textAlign: "center",
                      color: textSecondary,
                    }}
                  >
                    {search ? "No users match your search." : "No users yet."}
                  </td>
                </tr>
              ) : (
                filtered.map((u, idx) => (
                  <tr
                    key={u.id}
                    style={{
                      borderBottom:
                        idx < filtered.length - 1
                          ? `1px solid ${divider}`
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
                    {/* Name */}
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
                            background: avatarColor(u.name),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#fff",
                            flexShrink: 0,
                          }}
                        >
                          {u.name?.[0]?.toUpperCase()}
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
                            {u.name}
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

                    {/* Actions */}
                    <td
                      style={{
                        padding: "14px 20px",
                        textAlign: "right",
                        whiteSpace: "nowrap",
                      }}
                    >
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
                            transition: "all 0.15s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = isDark
                              ? "rgba(74,159,255,0.18)"
                              : "#dbeafe";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = isDark
                              ? "rgba(74,159,255,0.1)"
                              : "#eff6ff";
                          }}
                        >
                          ✎ Edit
                        </button>

                        <button
                          onClick={() => handleDelete(u)}
                          disabled={u.email === me?.email}
                          style={{
                            padding: "6px 14px",
                            borderRadius: 7,
                            cursor:
                              u.email === me?.email ? "not-allowed" : "pointer",
                            fontSize: 12,
                            fontWeight: 600,
                            background: isDark
                              ? "rgba(239,68,68,0.1)"
                              : "#fef2f2",
                            border: isDark
                              ? "1px solid rgba(239,68,68,0.2)"
                              : "1.5px solid #fecaca",
                            color: isDark ? "#f87171" : "#dc2626",
                            opacity: u.email === me?.email ? 0.35 : 1,
                            transition: "all 0.15s",
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
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div
          style={{
            padding: "10px 20px",
            borderTop: `1px solid ${divider}`,
            background: headerBg,
            fontSize: 12,
            color: textSecondary,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>
            {filtered.length} user{filtered.length !== 1 ? "s" : ""}
          </span>
          {search && (
            <span
              style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#94a3b8" }}
            >
              Showing {filtered.length} of {users.length}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
