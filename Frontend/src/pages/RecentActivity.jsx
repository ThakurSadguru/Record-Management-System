// pages/RecentActivity.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../components/layout/AppLayout";
import { useAuth } from "../context/AuthContext";
import { activityApi } from "../api/activityApi";

const ACTION_STYLES = {
  CREATE: {
    color: "#16a34a",
    bg: "rgba(22,163,74,0.1)",
    border: "rgba(22,163,74,0.2)",
    icon: "＋",
    label: "Created",
  },
  UPDATE: {
    color: "#2563eb",
    bg: "rgba(37,99,235,0.1)",
    border: "rgba(37,99,235,0.2)",
    icon: "✎",
    label: "Updated",
  },
  DELETE: {
    color: "#dc2626",
    bg: "rgba(220,38,38,0.1)",
    border: "rgba(220,38,38,0.2)",
    icon: "🗑",
    label: "Deleted",
  },
  RESTORE: {
    color: "#059669",
    bg: "rgba(5,150,105,0.1)",
    border: "rgba(5,150,105,0.2)",
    icon: "↩",
    label: "Restored",
  },
  PURGE: {
    color: "#7c3aed",
    bg: "rgba(124,58,237,0.1)",
    border: "rgba(124,58,237,0.2)",
    icon: "✕",
    label: "Purged",
  },
  LOGIN: {
    color: "#0891b2",
    bg: "rgba(8,145,178,0.1)",
    border: "rgba(8,145,178,0.2)",
    icon: "→",
    label: "Logged in",
  },
  INVITE_SENT: {
    color: "#d97706",
    bg: "rgba(217,119,6,0.1)",
    border: "rgba(217,119,6,0.2)",
    icon: "✉",
    label: "Invite sent",
  },
};

const ENTITY_ICONS = {
  MODULE: "⊞",
  RECORD: "📋",
  USER: "👤",
  AUTH: "🔐",
};

function fmtTime(ts) {
  if (!ts) return "—";
  const d = new Date(ts);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function avatarColor(email = "") {
  const colors = [
    "#2563eb",
    "#7c3aed",
    "#059669",
    "#dc2626",
    "#d97706",
    "#0891b2",
  ];
  return colors[email.charCodeAt(0) % colors.length];
}

export default function RecentActivity() {
  const { isDark } = useTheme();
  const { isAdmin, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!isAdmin && !isSuperAdmin) navigate("/modules", { replace: true });
  }, [isAdmin, isSuperAdmin, navigate]);

  const load = useCallback(() => {
    setLoading(true);
    activityApi
      .getRecent(200)
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const textPrimary = isDark ? "#fff" : "#0f172a";
  const textSecondary = isDark ? "rgba(255,255,255,0.45)" : "#64748b";
  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "#ffffff";
  const cardBorder = isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0";
  const headerBg = isDark ? "rgba(255,255,255,0.03)" : "#f8fafc";
  const rowDivider = isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9";
  const rowHover = isDark ? "rgba(255,255,255,0.03)" : "#f8fafc";
  const inputBg = isDark ? "rgba(255,255,255,0.06)" : "#fff";
  const inputBorder = isDark ? "rgba(255,255,255,0.15)" : "#e2e8f0";

  const actions = [
    "ALL",
    "CREATE",
    "UPDATE",
    "DELETE",
    "RESTORE",
    "PURGE",
    "LOGIN",
    "INVITE_SENT",
  ];

  const filtered = items.filter((i) => {
    const matchAction = filter === "ALL" || i.action === filter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      i.userEmail?.toLowerCase().includes(q) ||
      i.entityName?.toLowerCase().includes(q) ||
      i.entityType?.toLowerCase().includes(q) ||
      i.details?.toLowerCase().includes(q);
    return matchAction && matchSearch;
  });

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
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: textPrimary,
              margin: "0 0 4px",
              letterSpacing: -0.5,
            }}
          >
            Recent Activity
          </h1>
          <p style={{ fontSize: 13, color: textSecondary, margin: 0 }}>
            {items.length} events recorded
          </p>
        </div>
        <button
          onClick={load}
          style={{
            padding: "8px 18px",
            borderRadius: 8,
            cursor: "pointer",
            background: isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9",
            border: isDark
              ? "1px solid rgba(255,255,255,0.12)"
              : "1.5px solid #e2e8f0",
            color: isDark ? "rgba(255,255,255,0.7)" : "#475569",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          ↻ Refresh
        </button>
      </div>

      {/* Search + Filter */}
      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
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
            placeholder="Search user, entity…"
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

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {actions.map((a) => {
            const s = ACTION_STYLES[a];
            const active = filter === a;
            return (
              <button
                key={a}
                onClick={() => setFilter(a)}
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
                  color: active ? (s?.color ?? textPrimary) : textSecondary,
                }}
              >
                {a === "ALL" ? "All" : (ACTION_STYLES[a]?.label ?? a)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              style={{
                height: 60,
                borderRadius: 10,
                background: isDark ? "rgba(255,255,255,0.04)" : "#f1f5f9",
              }}
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            background: cardBg,
            border: `1.5px solid ${cardBorder}`,
            borderRadius: 14,
            padding: "80px 20px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: textPrimary,
              marginBottom: 6,
            }}
          >
            No activity found
          </div>
          <p style={{ fontSize: 13, color: textSecondary, margin: 0 }}>
            Try changing the filter or search term
          </p>
        </div>
      ) : (
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
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
              }}
            >
              <thead>
                <tr
                  style={{
                    background: headerBg,
                    borderBottom: `1.5px solid ${cardBorder}`,
                  }}
                >
                  {["User", "Action", "Entity", "Details", "Time"].map(
                    (h, i) => (
                      <th
                        key={h}
                        style={{
                          padding: "12px 16px",
                          textAlign: "left",
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
                {filtered.map((item, idx) => {
                  const actionStyle =
                    ACTION_STYLES[item.action] ?? ACTION_STYLES.CREATE;
                  return (
                    <tr
                      key={item.id}
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
                      {/* User */}
                      <td
                        style={{ padding: "12px 16px", whiteSpace: "nowrap" }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              background: avatarColor(item.userEmail),
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 12,
                              fontWeight: 700,
                              color: "#fff",
                              flexShrink: 0,
                            }}
                          >
                            {item.userEmail?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div
                              style={{
                                fontWeight: 600,
                                color: isDark ? "#fff" : "#0f172a",
                                fontSize: 13,
                              }}
                            >
                              {item.userEmail}
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: textSecondary,
                                marginTop: 1,
                              }}
                            >
                              {item.userRole}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Action badge */}
                      <td
                        style={{ padding: "12px 16px", whiteSpace: "nowrap" }}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "4px 10px",
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 700,
                            background: actionStyle.bg,
                            color: actionStyle.color,
                            border: `1px solid ${actionStyle.border}`,
                          }}
                        >
                          <span>{actionStyle.icon}</span>
                          {actionStyle.label}
                        </span>
                      </td>

                      {/* Entity */}
                      <td style={{ padding: "12px 16px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <span style={{ fontSize: 14 }}>
                            {ENTITY_ICONS[item.entityType] ?? "📄"}
                          </span>
                          <div>
                            <div
                              style={{
                                fontWeight: 600,
                                color: isDark
                                  ? "rgba(255,255,255,0.85)"
                                  : "#1e293b",
                                fontSize: 13,
                              }}
                            >
                              {item.entityName ?? "—"}
                            </div>
                            <div style={{ fontSize: 11, color: textSecondary }}>
                              {item.entityType}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Details */}
                      <td
                        style={{
                          padding: "12px 16px",
                          color: textSecondary,
                          fontSize: 12,
                          maxWidth: 200,
                        }}
                      >
                        <span
                          style={{
                            display: "block",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.details ?? "—"}
                        </span>
                      </td>

                      {/* Time */}
                      <td
                        style={{
                          padding: "12px 16px",
                          color: textSecondary,
                          fontSize: 12,
                          whiteSpace: "nowrap",
                        }}
                      >
                        <div
                          title={
                            item.timestamp
                              ? new Date(item.timestamp).toLocaleString()
                              : ""
                          }
                        >
                          {fmtTime(item.timestamp)}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div
            style={{
              padding: "10px 16px",
              borderTop: `1px solid ${rowDivider}`,
              background: headerBg,
              fontSize: 12,
              color: textSecondary,
            }}
          >
            {filtered.length} event{filtered.length !== 1 ? "s" : ""}
            {filter !== "ALL" || search
              ? ` (filtered from ${items.length})`
              : ""}
          </div>
        </div>
      )}
    </div>
  );
}
