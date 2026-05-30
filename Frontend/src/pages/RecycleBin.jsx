import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../components/layout/AppLayout";
import { useAuth } from "../context/AuthContext";
import { recycleBinApi } from "../api/Recyclebinapi";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(str) {
  if (!str) return "—";
  try {
    return new Date(str).toLocaleString();
  } catch {
    return str;
  }
}

function DaysChip({ days, isDark }) {
  const urgent = days <= 7;
  const warning = days <= 14;
  const bg = urgent
    ? isDark
      ? "rgba(239,68,68,0.15)"
      : "#fef2f2"
    : warning
      ? isDark
        ? "rgba(251,191,36,0.15)"
        : "#fffbeb"
      : isDark
        ? "rgba(34,197,94,0.12)"
        : "#f0fdf4";
  const color = urgent
    ? isDark
      ? "#f87171"
      : "#dc2626"
    : warning
      ? isDark
        ? "#fcd34d"
        : "#d97706"
      : isDark
        ? "#4ade80"
        : "#16a34a";
  const border = urgent
    ? isDark
      ? "rgba(239,68,68,0.25)"
      : "#fecaca"
    : warning
      ? isDark
        ? "rgba(251,191,36,0.25)"
        : "#fde68a"
      : isDark
        ? "rgba(34,197,94,0.2)"
        : "#bbf7d0";

  return (
    <span
      style={{
        padding: "3px 9px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        background: bg,
        color,
        border: `1px solid ${border}`,
        whiteSpace: "nowrap",
      }}
    >
      {days === 0 ? "Expires today" : `${days}d left`}
    </span>
  );
}

function TypeBadge({ type, isDark }) {
  const map = {
    module: {
      label: "Module",
      icon: "⊞",
      bg: isDark ? "rgba(59,130,246,0.12)" : "#eff6ff",
      color: isDark ? "#60a5fa" : "#2563eb",
      border: isDark ? "rgba(59,130,246,0.25)" : "#bfdbfe",
    },
    record: {
      label: "Record",
      icon: "📋",
      bg: isDark ? "rgba(16,185,129,0.12)" : "#f0fdf4",
      color: isDark ? "#34d399" : "#059669",
      border: isDark ? "rgba(16,185,129,0.25)" : "#bbf7d0",
    },
    "submodule-record": {
      label: "Sub-module Record",
      icon: "◫",
      bg: isDark ? "rgba(99,102,241,0.12)" : "#eef2ff",
      color: isDark ? "#a5b4fc" : "#4338ca",
      border: isDark ? "rgba(99,102,241,0.25)" : "#c7d2fe",
    },
  };
  const t = map[type] ?? map.record;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 9px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        background: t.bg,
        color: t.color,
        border: `1px solid ${t.border}`,
        whiteSpace: "nowrap",
      }}
    >
      <span>{t.icon}</span>
      {t.label}
    </span>
  );
}

// ─── Confirm modal ────────────────────────────────────────────────────────────
function ConfirmModal({ message, onConfirm, onCancel, isDark }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        style={{
          background: isDark ? "#1e293b" : "#fff",
          border: `1.5px solid ${isDark ? "rgba(239,68,68,0.3)" : "#fecaca"}`,
          borderRadius: 16,
          padding: "28px 32px",
          maxWidth: 400,
          width: "calc(100% - 32px)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ fontSize: 32, textAlign: "center", marginBottom: 14 }}>
          🗑️
        </div>
        <h3
          style={{
            fontSize: 16,
            fontWeight: 700,
            textAlign: "center",
            color: isDark ? "#fff" : "#0f172a",
            margin: "0 0 10px",
          }}
        >
          Permanently Delete?
        </h3>
        <p
          style={{
            fontSize: 13,
            color: isDark ? "rgba(255,255,255,0.55)" : "#64748b",
            textAlign: "center",
            margin: "0 0 24px",
            lineHeight: 1.6,
          }}
        >
          {message}{" "}
          <strong style={{ color: isDark ? "#f87171" : "#dc2626" }}>
            This cannot be undone.
          </strong>
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "9px 0",
              borderRadius: 9,
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
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: "9px 0",
              borderRadius: 9,
              cursor: "pointer",
              background: "linear-gradient(135deg,#ef4444,#dc2626)",
              border: "none",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              boxShadow: "0 4px 12px rgba(239,68,68,0.35)",
            }}
          >
            Delete Forever
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RecycleBin() {
  const { isDark } = useTheme();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // "all" | "module" | "record" | "submodule-record"
  const [actionLoading, setActionLoading] = useState(null); // id of item being acted on
  const [confirm, setConfirm] = useState(null); // { id, type, name, itemType }
  const [toast, setToast] = useState(null); // { message, ok }

  useEffect(() => {
    if (!isAdmin) navigate("/modules", { replace: true });
  }, [isAdmin, navigate]);

  const load = useCallback(() => {
    setLoading(true);
    recycleBinApi
      .getAll()
      .then(setItems)
      .catch(() => showToast("Failed to load recycle bin", false))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function showToast(message, ok = true) {
    setToast({ message, ok });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleRestore(item) {
    setActionLoading(item.id);
    try {
      if (item.type === "module") {
        await recycleBinApi.restoreModule(item.id);
      } else {
        await recycleBinApi.restoreRecord(item.id);
      }
      showToast(`"${item.name}" restored successfully`);
      load();
    } catch {
      showToast("Restore failed", false);
    } finally {
      setActionLoading(null);
    }
  }

  function askPurge(item) {
    setConfirm(item);
  }

  async function handlePurge() {
    const item = confirm;
    setConfirm(null);
    setActionLoading(item.id);
    try {
      if (item.type === "module") {
        await recycleBinApi.purgeModule(item.id);
      } else {
        await recycleBinApi.purgeRecord(item.id);
      }
      showToast(`"${item.name}" permanently deleted`);
      load();
    } catch {
      showToast("Delete failed", false);
    } finally {
      setActionLoading(null);
    }
  }

  // ── derived state ──
  const filtered =
    filter === "all" ? items : items.filter((i) => i.type === filter);
  const counts = {
    all: items.length,
    module: items.filter((i) => i.type === "module").length,
    record: items.filter((i) => i.type === "record").length,
    "submodule-record": items.filter((i) => i.type === "submodule-record")
      .length,
  };

  // ── theme tokens ──
  const textPrimary = isDark ? "#fff" : "#0f172a";
  const textSecondary = isDark ? "rgba(255,255,255,0.45)" : "#64748b";
  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "#ffffff";
  const cardBorder = isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0";
  const headerBg = isDark ? "rgba(255,255,255,0.03)" : "#f8fafc";
  const rowDivider = isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9";
  const rowHoverBg = isDark ? "rgba(255,255,255,0.03)" : "#f8fafc";
  const cellText = isDark ? "rgba(255,255,255,0.85)" : "#1e293b";
  const cellMuted = isDark ? "rgba(255,255,255,0.3)" : "#94a3b8";

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
      <div>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            fontSize: 12,
            marginBottom: 10,
            color: isDark ? "rgba(255,255,255,0.4)" : "#64748b",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = isDark ? "#fff" : "#0f172a")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = isDark
              ? "rgba(255,255,255,0.4)"
              : "#64748b")
          }
        >
          ← Back
        </button>
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
                color: textPrimary,
                margin: "0 0 6px",
                letterSpacing: -0.5,
              }}
            >
              🗑️ Recycle Bin
            </h1>
            <p style={{ fontSize: 13, color: textSecondary, margin: 0 }}>
              Deleted items are kept for 30 days before being permanently
              removed
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
      </div>

      {/* ── Filter tabs ── */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {[
          { key: "all", label: "All" },
          { key: "module", label: "Modules" },
          { key: "record", label: "Records" },
          { key: "submodule-record", label: "Sub-module Records" },
        ].map(({ key, label }) => {
          const active = filter === key;
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={{
                padding: "6px 16px",
                borderRadius: 20,
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
                transition: "all 0.15s",
                background: active
                  ? isDark
                    ? "rgba(239,68,68,0.2)"
                    : "#fef2f2"
                  : isDark
                    ? "rgba(255,255,255,0.05)"
                    : "#f1f5f9",
                border: active
                  ? isDark
                    ? "1.5px solid rgba(239,68,68,0.4)"
                    : "1.5px solid #fca5a5"
                  : isDark
                    ? "1px solid rgba(255,255,255,0.1)"
                    : "1.5px solid #e2e8f0",
                color: active
                  ? isDark
                    ? "#f87171"
                    : "#dc2626"
                  : isDark
                    ? "rgba(255,255,255,0.55)"
                    : "#64748b",
              }}
            >
              {label}
              <span
                style={{
                  marginLeft: 6,
                  padding: "1px 6px",
                  borderRadius: 20,
                  fontSize: 10,
                  fontWeight: 700,
                  background: active
                    ? isDark
                      ? "rgba(239,68,68,0.2)"
                      : "#fee2e2"
                    : isDark
                      ? "rgba(255,255,255,0.08)"
                      : "#e2e8f0",
                  color: active
                    ? isDark
                      ? "#f87171"
                      : "#dc2626"
                    : isDark
                      ? "rgba(255,255,255,0.4)"
                      : "#94a3b8",
                }}
              >
                {counts[key]}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                height: 60,
                borderRadius: 10,
                background: isDark ? "rgba(255,255,255,0.04)" : "#f1f5f9",
                animation: "pulse 1.5s ease-in-out infinite",
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
          <div style={{ fontSize: 48, marginBottom: 16 }}>✨</div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: textPrimary,
              marginBottom: 8,
            }}
          >
            Recycle bin is empty
          </div>
          <p style={{ fontSize: 13, color: textSecondary, margin: 0 }}>
            Deleted modules and records will appear here
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
                    borderBottom: `1.5px solid ${cardBorder}`,
                    background: headerBg,
                  }}
                >
                  {[
                    "Type",
                    "Name",
                    "Module",
                    "Deleted By",
                    "Deleted At",
                    "Expires",
                    "Actions",
                  ].map((h, i) => (
                    <th
                      key={h}
                      style={{
                        textAlign: i === 6 ? "right" : "left",
                        padding: "12px 16px",
                        fontSize: 11,
                        fontWeight: 700,
                        color: isDark ? "rgba(255,255,255,0.4)" : "#64748b",
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
                {filtered.map((item, idx) => {
                  const isLoading = actionLoading === item.id;
                  return (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom:
                          idx < filtered.length - 1
                            ? `1px solid ${rowDivider}`
                            : "none",
                        opacity: isLoading ? 0.5 : 1,
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = rowHoverBg)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      {/* Type */}
                      <td
                        style={{ padding: "14px 16px", whiteSpace: "nowrap" }}
                      >
                        <TypeBadge type={item.type} isDark={isDark} />
                      </td>

                      {/* Name */}
                      <td style={{ padding: "14px 16px", maxWidth: 200 }}>
                        <div
                          style={{
                            fontWeight: 600,
                            color: cellText,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.name}
                        </div>
                        {/* Show a preview of record values */}
                        {item.values && (
                          <div
                            style={{
                              fontSize: 11,
                              color: cellMuted,
                              marginTop: 2,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {Object.values(item.values)
                              .filter(Boolean)
                              .slice(0, 3)
                              .join(" · ")}
                          </div>
                        )}
                      </td>

                      {/* Module context */}
                      <td
                        style={{
                          padding: "14px 16px",
                          color: cellMuted,
                          fontSize: 12,
                        }}
                      >
                        {item.type === "module" ? (
                          <span
                            style={{ color: cellMuted, fontStyle: "italic" }}
                          >
                            —
                          </span>
                        ) : (
                          <div>
                            <div style={{ color: cellText, fontWeight: 500 }}>
                              {item.moduleName ?? item.moduleId}
                            </div>
                            {item.subModuleName && (
                              <div
                                style={{
                                  fontSize: 11,
                                  color: cellMuted,
                                  marginTop: 1,
                                }}
                              >
                                ↳ {item.subModuleName}
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Deleted by */}
                      <td
                        style={{
                          padding: "14px 16px",
                          color: cellMuted,
                          fontSize: 12,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.deletedBy ?? "—"}
                      </td>

                      {/* Deleted at */}
                      <td
                        style={{
                          padding: "14px 16px",
                          color: cellMuted,
                          fontSize: 12,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {fmtDate(item.deletedAt)}
                      </td>

                      {/* Days remaining */}
                      <td
                        style={{ padding: "14px 16px", whiteSpace: "nowrap" }}
                      >
                        <DaysChip days={item.daysRemaining} isDark={isDark} />
                      </td>

                      {/* Actions */}
                      <td
                        style={{
                          padding: "14px 16px",
                          textAlign: "right",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            gap: 6,
                          }}
                        >
                          {/* Restore */}
                          <button
                            disabled={isLoading}
                            onClick={() => handleRestore(item)}
                            style={{
                              padding: "5px 12px",
                              borderRadius: 7,
                              cursor: "pointer",
                              fontSize: 12,
                              fontWeight: 600,
                              transition: "all 0.15s",
                              background: isDark
                                ? "rgba(34,197,94,0.1)"
                                : "#f0fdf4",
                              border: isDark
                                ? "1px solid rgba(34,197,94,0.2)"
                                : "1.5px solid #bbf7d0",
                              color: isDark ? "#4ade80" : "#16a34a",
                              opacity: isLoading ? 0.5 : 1,
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background = isDark
                                ? "rgba(34,197,94,0.18)"
                                : "#dcfce7")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = isDark
                                ? "rgba(34,197,94,0.1)"
                                : "#f0fdf4")
                            }
                          >
                            {isLoading ? "…" : "↩ Restore"}
                          </button>

                          {/* Permanent delete */}
                          <button
                            disabled={isLoading}
                            onClick={() => askPurge(item)}
                            style={{
                              padding: "5px 12px",
                              borderRadius: 7,
                              cursor: "pointer",
                              fontSize: 12,
                              fontWeight: 600,
                              transition: "all 0.15s",
                              background: isDark
                                ? "rgba(239,68,68,0.1)"
                                : "#fef2f2",
                              border: isDark
                                ? "1px solid rgba(239,68,68,0.2)"
                                : "1.5px solid #fecaca",
                              color: isDark ? "#f87171" : "#dc2626",
                              opacity: isLoading ? 0.5 : 1,
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background = isDark
                                ? "rgba(239,68,68,0.2)"
                                : "#fee2e2")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = isDark
                                ? "rgba(239,68,68,0.1)"
                                : "#fef2f2")
                            }
                          >
                            🗑 Delete Forever
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div
            style={{
              padding: "10px 16px",
              borderTop: `1px solid ${rowDivider}`,
              background: isDark ? "rgba(255,255,255,0.02)" : "#f8fafc",
              fontSize: 12,
              color: cellMuted,
            }}
          >
            {filtered.length} item{filtered.length !== 1 ? "s" : ""} in recycle
            bin
          </div>
        </div>
      )}

      {/* ── Confirm Modal ── */}
      {confirm && (
        <ConfirmModal
          message={`"${confirm.name}" will be permanently removed.`}
          onConfirm={handlePurge}
          onCancel={() => setConfirm(null)}
          isDark={isDark}
        />
      )}

      {/* ── Toast ── */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 28,
            right: 28,
            zIndex: 200,
            padding: "12px 20px",
            borderRadius: 12,
            background: toast.ok
              ? isDark
                ? "rgba(34,197,94,0.15)"
                : "#f0fdf4"
              : isDark
                ? "rgba(239,68,68,0.15)"
                : "#fef2f2",
            border: `1.5px solid ${
              toast.ok
                ? isDark
                  ? "rgba(34,197,94,0.3)"
                  : "#bbf7d0"
                : isDark
                  ? "rgba(239,68,68,0.3)"
                  : "#fecaca"
            }`,
            color: toast.ok
              ? isDark
                ? "#4ade80"
                : "#16a34a"
              : isDark
                ? "#f87171"
                : "#dc2626",
            fontSize: 13,
            fontWeight: 600,
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>{toast.ok ? "✓" : "✗"}</span>
          {toast.message}
        </div>
      )}
    </div>
  );
}
