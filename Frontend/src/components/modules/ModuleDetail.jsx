import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../layout/AppLayout";
import { moduleApi } from "../../api/moduleApi";
import { recordApi } from "../../api/recordApi";
import DynamicForm from "../records/DynamicForm";
import RecordTable from "../records/RecordTable";

// ── Plan limits ───────────────────────────────────────────────────────────────
const PLAN_LIMITS = {
  STARTER: {
    maxRecords: 500,
    maxModules: 5,
    subModules: false,
    fileUpload: false,
    recycleBin: false,
    export: false,
  },
  PROFESSIONAL: {
    maxRecords: 100_000,
    maxModules: Infinity,
    subModules: true,
    fileUpload: true,
    recycleBin: true,
    export: true,
  },
  ENTERPRISE: {
    maxRecords: Infinity,
    maxModules: Infinity,
    subModules: true,
    fileUpload: true,
    recycleBin: true,
    export: true,
  },
};
function getPlanLimits(plan) {
  return PLAN_LIMITS[plan?.toUpperCase()] ?? PLAN_LIMITS.STARTER;
}

// ── Delete confirm modal ──────────────────────────────────────────────────────
function DeleteConfirmModal({ title, message, onConfirm, onCancel, isDark }) {
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
          {title}
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
            Move to Recycle Bin
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Upgrade nudge banner ──────────────────────────────────────────────────────
function UpgradeBanner({ type, count, max, isDark, navigate }) {
  const nearLimit = max !== Infinity && count >= max * 0.8;
  const atLimit = max !== Infinity && count >= max;
  if (!nearLimit && !atLimit) return null;
  const msgs = {
    records: {
      near: `You've used ${count} of ${max} records on the free plan.`,
      at: `You've reached the ${max}-record limit on the free plan.`,
    },
  };
  const msg = (msgs[type] || msgs.records)[atLimit ? "at" : "near"];
  return (
    <div
      style={{
        padding: "12px 18px",
        borderRadius: 10,
        background: isDark
          ? atLimit
            ? "rgba(239,68,68,0.07)"
            : "rgba(251,191,36,0.07)"
          : atLimit
            ? "#fef2f2"
            : "#fffbeb",
        border: `1px solid ${isDark ? (atLimit ? "rgba(239,68,68,0.2)" : "rgba(251,191,36,0.2)") : atLimit ? "#fecaca" : "#fde68a"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
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
          boxShadow: "0 3px 10px rgba(37,99,235,0.4)",
        }}
      >
        Upgrade →
      </button>
    </div>
  );
}

// ── Plan badge ────────────────────────────────────────────────────────────────
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

// ── Module Search (dashboard-style, locked to this module) ────────────────────
function ModuleSearch({ module, isDark }) {
  const [selectedSubModule, setSelectedSubModule] = useState("");
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  // Recursively collect all field definitions
  function collectFields(subModules) {
    if (!subModules) return [];
    return subModules.flatMap((sm) => [
      ...(sm.fields ?? []),
      ...collectFields(sm.subModules),
    ]);
  }

  function fmtVal(value) {
    if (value === null || value === undefined || value === "") return "—";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "object" && value.name) return value.name;
    if (typeof value === "object") return null;
    return String(value);
  }

  async function handleSearch() {
    if (!searchText.trim()) {
      setError("Please enter a search term.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const data = await recordApi.filter(
        module.id,
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
    setSelectedSubModule("");
    setSearchText("");
    setResults([]);
    setSearched(false);
    setError("");
  }

  // Find which sub-module a record belongs to (for result tag)
  function findSubModule(subModules, id) {
    for (const sm of subModules ?? []) {
      if (sm.id === id) return sm;
      const found = findSubModule(sm.subModules, id);
      if (found) return found;
    }
    return null;
  }

  const allFields = [
    ...(module.fields ?? []),
    ...collectFields(module.subModules),
  ];
  const activeSubModule = selectedSubModule
    ? findSubModule(module.subModules, selectedSubModule)
    : null;

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
            🔍 Search &amp; Filter Records
          </div>
          <div style={{ fontSize: 11, color: textSecondary, marginTop: 2 }}>
            Filter by sub-module and keyword across all fields
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

      {/* Controls — sub-module selector + search text + button */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr auto",
          gap: 10,
          alignItems: "end",
        }}
      >
        {/* Sub-module filter */}
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
            style={{
              ...inputStyle,
              opacity: (module.subModules?.length ?? 0) === 0 ? 0.5 : 1,
            }}
            disabled={(module.subModules?.length ?? 0) === 0}
          >
            <option value="">All (module + sub-modules)</option>
            {(module.subModules ?? []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Search keyword */}
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
              in <strong>{module.name}</strong>
              {activeSubModule
                ? ` › ${activeSubModule.name}`
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
                maxHeight: 400,
                overflowY: "auto",
              }}
            >
              {results.map((record) => {
                const entries = Object.entries(record.values || {}).filter(
                  ([, v]) => {
                    if (v === null || v === undefined || v === "") return false;
                    if (typeof v === "object" && !v.name) return false;
                    return true;
                  },
                );

                const belongsTo = record.subModuleId
                  ? findSubModule(module.subModules, record.subModuleId)
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
                    {/* Sub-module origin tag */}
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

// ── Sub-module panel ──────────────────────────────────────────────────────────
function SubModulePanel({
  subModule,
  parentModuleId,
  isStaff,
  isAdmin,
  isDark,
  limits,
  recordCount,
}) {
  const { recordsMap, loadRecords, deleteRecord } = useData();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  useEffect(() => {
    if (expanded) loadRecords(parentModuleId, subModule.id);
  }, [expanded, subModule.id, parentModuleId, loadRecords]);

  const records = recordsMap[subModule.id] ?? [];
  const subRecCount = records.length;
  const atRecLimit =
    limits.maxRecords !== Infinity &&
    recordCount + subRecCount >= limits.maxRecords;

  const accentBg = isDark ? "rgba(99,102,241,0.08)" : "#eef2ff";
  const accentBorder = isDark ? "rgba(99,102,241,0.22)" : "#c7d2fe";
  const innerBg = isDark ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.6)";
  const formBg = isDark ? "rgba(255,255,255,0.04)" : "#fff";
  const formBorder = isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0";

  function confirmDelete() {
    deleteRecord(confirmDel, subModule.id);
    setConfirmDel(null);
  }
  function openEdit(r) {
    setEditRecord(r);
    setShowForm(true);
  }
  function closeForm() {
    setShowForm(false);
    setEditRecord(null);
  }

  return (
    <>
      <div
        style={{
          borderRadius: 12,
          border: `1.5px solid ${accentBorder}`,
          background: accentBg,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "13px 18px",
            cursor: "pointer",
            userSelect: "none",
          }}
          onClick={() => setExpanded((p) => !p)}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                fontSize: 11,
                transition: "transform 0.2s",
                transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
                color: isDark ? "#818cf8" : "#6366f1",
                display: "inline-block",
              }}
            >
              ▶
            </span>
            <span style={{ fontSize: 15 }}>◫</span>
            <div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: isDark ? "#a5b4fc" : "#3730a3",
                }}
              >
                {subModule.name}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: isDark ? "rgba(165,180,252,0.55)" : "#6366f1",
                  marginTop: 1,
                }}
              >
                {subModule.fields?.length ?? 0} fields
                {expanded ? ` · ${records.length} records` : ""}
              </div>
            </div>
          </div>
          <div
            style={{ display: "flex", gap: 8 }}
            onClick={(e) => e.stopPropagation()}
          >
            {isAdmin && (
              <button
                onClick={() =>
                  navigate(
                    `/modules/${parentModuleId}/edit?focus=${subModule.id}`,
                  )
                }
                style={{
                  padding: "5px 12px",
                  borderRadius: 7,
                  cursor: "pointer",
                  fontSize: 11,
                  fontWeight: 600,
                  background: isDark ? "rgba(99,102,241,0.1)" : "#ede9fe",
                  border: isDark
                    ? "1px solid rgba(99,102,241,0.2)"
                    : "1.5px solid #c4b5fd",
                  color: isDark ? "#a5b4fc" : "#4f46e5",
                }}
              >
                Edit structure
              </button>
            )}
            {isStaff &&
              expanded &&
              !showForm &&
              (atRecLimit ? (
                <button
                  onClick={() => navigate("/pricing")}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 7,
                    cursor: "pointer",
                    fontSize: 11,
                    fontWeight: 600,
                    background: isDark ? "rgba(37,99,235,0.1)" : "#eff6ff",
                    border: isDark
                      ? "1px solid rgba(37,99,235,0.2)"
                      : "1.5px solid #bfdbfe",
                    color: isDark ? "#60a5fa" : "#2563eb",
                  }}
                >
                  Upgrade for more →
                </button>
              ) : (
                <button
                  onClick={() => {
                    setEditRecord(null);
                    setShowForm(true);
                  }}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 7,
                    cursor: "pointer",
                    fontSize: 11,
                    fontWeight: 600,
                    background: "linear-gradient(135deg,#6366f1,#4f46e5)",
                    border: "none",
                    color: "#fff",
                    boxShadow: "0 2px 8px rgba(99,102,241,0.3)",
                  }}
                >
                  + Add Record
                </button>
              ))}
          </div>
        </div>

        {/* Body */}
        {expanded && (
          <div
            style={{
              borderTop: `1px solid ${accentBorder}`,
              padding: "16px 18px",
              background: innerBg,
            }}
          >
            {limits.maxRecords !== Infinity && (
              <div style={{ marginBottom: records.length > 0 ? 12 : 0 }}>
                <UpgradeBanner
                  type="records"
                  count={recordCount}
                  max={limits.maxRecords}
                  isDark={isDark}
                  navigate={navigate}
                />
              </div>
            )}
            {showForm && (
              <div
                style={{
                  marginBottom: 16,
                  padding: 16,
                  borderRadius: 10,
                  background: formBg,
                  border: `1px solid ${formBorder}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 14,
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: isDark ? "#a5b4fc" : "#4338ca",
                    }}
                  >
                    {editRecord ? "Edit Record" : "New Record"}
                  </span>
                  <button
                    onClick={closeForm}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 20,
                      lineHeight: 1,
                      color: isDark ? "rgba(255,255,255,0.4)" : "#94a3b8",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "#ef4444")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = isDark
                        ? "rgba(255,255,255,0.4)"
                        : "#94a3b8")
                    }
                  >
                    ×
                  </button>
                </div>
                <DynamicForm
                  module={subModule}
                  moduleId={parentModuleId}
                  subModuleId={subModule.id}
                  initialValues={editRecord?.values}
                  recordId={editRecord?.id}
                  isDark={isDark}
                  onSuccess={() => {
                    closeForm();
                    loadRecords(parentModuleId, subModule.id);
                  }}
                />
              </div>
            )}
            {records.length === 0 && !showForm ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <p
                  style={{
                    fontSize: 12,
                    color: isDark ? "rgba(165,180,252,0.4)" : "#a5b4fc",
                    margin: 0,
                  }}
                >
                  No records yet in this sub-module.
                </p>
              </div>
            ) : records.length > 0 ? (
              <RecordTable
                module={subModule}
                records={records}
                onEdit={openEdit}
                onDelete={(id) => setConfirmDel(id)}
                canEdit={isStaff}
                canDelete={isAdmin}
                isDark={isDark}
              />
            ) : null}

            {/* Nested sub-modules */}
            {(subModule.subModules ?? []).length > 0 && (
              <div
                style={{
                  marginTop: 16,
                  paddingTop: 12,
                  borderTop: `1px dashed ${isDark ? "rgba(99,102,241,0.15)" : "#c7d2fe"}`,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: isDark ? "rgba(165,180,252,0.5)" : "#7c3aed",
                    marginBottom: 6,
                  }}
                >
                  Nested Sub-modules · {subModule.subModules.length}
                </div>
                {subModule.subModules.map((nested) => (
                  <SubModulePanel
                    key={nested.id}
                    subModule={nested}
                    parentModuleId={parentModuleId}
                    isStaff={isStaff}
                    isAdmin={isAdmin}
                    isDark={isDark}
                    limits={limits}
                    recordCount={recordCount}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      {confirmDel && (
        <DeleteConfirmModal
          title="Delete Record?"
          message="This record will be moved to the Recycle Bin."
          onConfirm={confirmDelete}
          onCancel={() => setConfirmDel(null)}
          isDark={isDark}
        />
      )}
    </>
  );
}

// ── Main ModuleDetail ─────────────────────────────────────────────────────────
export default function ModuleDetail() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isStaff, user } = useAuth();
  const { recordsMap, loadRecords, deleteRecord, deleteModule } = useData();
  const { isDark } = useTheme();

  const [module, setModule] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [confirmDeleteModule, setConfirmDeleteModule] = useState(false);
  const [confirmDeleteRecord, setConfirmDeleteRecord] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const limits = getPlanLimits(user?.plan ?? "STARTER");

  useEffect(() => {
    moduleApi
      .getById(moduleId)
      .then((m) => {
        setModule(m);
        loadRecords(moduleId);
      })
      .catch(() => navigate("/modules"));
  }, [moduleId, navigate, loadRecords]);

  async function handleDeleteModule() {
    setDeleting(true);
    try {
      await moduleApi.delete(moduleId);
      deleteModule?.(moduleId);
      navigate("/modules");
    } catch {
      alert("Failed to delete module");
    } finally {
      setDeleting(false);
      setConfirmDeleteModule(false);
    }
  }

  function confirmRecordDelete() {
    deleteRecord(confirmDeleteRecord, moduleId);
    setConfirmDeleteRecord(null);
  }

  if (!module)
    return (
      <div style={{ padding: "36px 40px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div
            style={{
              height: 32,
              background: isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0",
              borderRadius: 8,
              width: 192,
            }}
          />
          <div
            style={{
              height: 16,
              background: isDark ? "rgba(255,255,255,0.04)" : "#e2e8f0",
              borderRadius: 8,
              width: 256,
            }}
          />
        </div>
      </div>
    );

  const rawRecords = recordsMap[moduleId] ?? [];
  const subModules = module.subModules ?? [];
  const recordCount = rawRecords.length;
  const atRecLimit =
    limits.maxRecords !== Infinity && recordCount >= limits.maxRecords;

  const textPrimary = isDark ? "#fff" : "#0f172a";
  const textSecondary = isDark ? "rgba(255,255,255,0.45)" : "#64748b";
  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "#ffffff";
  const cardBorder = isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0";

  function openEdit(record) {
    setEditRecord(record);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function closeForm() {
    setShowForm(false);
    setEditRecord(null);
  }

  return (
    <div
      style={{
        padding: "36px 40px",
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 22,
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <div>
          <button
            onClick={() => navigate("/modules")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 12,
              color: isDark ? "rgba(255,255,255,0.4)" : "#64748b",
              display: "flex",
              alignItems: "center",
              gap: 4,
              marginBottom: 8,
              padding: 0,
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
            ← Modules
          </button>
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
              {module.name}
            </h1>
            <PlanBadge plan={user?.plan} isDark={isDark} />
          </div>
          <p style={{ fontSize: 13, color: textSecondary, margin: 0 }}>
            {module.fields?.length ?? 0} fields · {rawRecords.length}
            {limits.maxRecords !== Infinity ? `/${limits.maxRecords}` : ""}{" "}
            records
            {subModules.length > 0 &&
              ` · ${subModules.length} sub-module${subModules.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          {isAdmin && (
            <Link
              to={`/modules/${moduleId}/edit`}
              style={{ textDecoration: "none" }}
            >
              <button
                style={{
                  padding: "8px 18px",
                  borderRadius: 8,
                  cursor: "pointer",
                  background: isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9",
                  border: isDark
                    ? "1px solid rgba(255,255,255,0.15)"
                    : "1.5px solid #cbd5e1",
                  color: isDark ? "rgba(255,255,255,0.8)" : "#334155",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Edit module
              </button>
            </Link>
          )}
          {isStaff &&
            !showForm &&
            (atRecLimit ? (
              <button
                onClick={() => navigate("/pricing")}
                style={{
                  padding: "8px 18px",
                  borderRadius: 8,
                  cursor: "pointer",
                  background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
                  border: "none",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  boxShadow: "0 4px 14px rgba(37,99,235,0.35)",
                }}
              >
                Upgrade for more records →
              </button>
            ) : (
              <button
                onClick={() => {
                  setShowForm(true);
                  setEditRecord(null);
                }}
                style={{
                  padding: "8px 18px",
                  borderRadius: 8,
                  cursor: "pointer",
                  background: "linear-gradient(135deg,#16a34a,#15803d)",
                  border: "none",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  boxShadow: "0 4px 14px rgba(22,163,74,0.35)",
                }}
              >
                + Add Record
              </button>
            ))}
          {isAdmin && (
            <button
              onClick={() => setConfirmDeleteModule(true)}
              disabled={deleting}
              style={{
                padding: "8px 18px",
                borderRadius: 8,
                cursor: "pointer",
                background: isDark ? "rgba(239,68,68,0.1)" : "#fef2f2",
                border: isDark
                  ? "1px solid rgba(239,68,68,0.25)"
                  : "1.5px solid #fecaca",
                color: isDark ? "#f87171" : "#dc2626",
                fontSize: 13,
                fontWeight: 600,
                opacity: deleting ? 0.5 : 1,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = isDark
                  ? "rgba(239,68,68,0.18)"
                  : "#fee2e2")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = isDark
                  ? "rgba(239,68,68,0.1)"
                  : "#fef2f2")
              }
            >
              🗑 Delete Module
            </button>
          )}
        </div>
      </div>

      {/* ── Record limit nudge ── */}
      <UpgradeBanner
        type="records"
        count={recordCount}
        max={limits.maxRecords}
        isDark={isDark}
        navigate={navigate}
      />

      {/* ── Add / Edit form ── */}
      {showForm && (
        <div
          style={{
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            borderRadius: 14,
            padding: 24,
            boxShadow: isDark ? "none" : "0 2px 12px rgba(0,0,0,0.06)",
          }}
        >
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
                fontSize: 15,
                fontWeight: 700,
                color: textPrimary,
                margin: 0,
              }}
            >
              {editRecord ? "Edit Record" : "New Record"}
            </h2>
            <button
              onClick={closeForm}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: isDark ? "rgba(255,255,255,0.4)" : "#94a3b8",
                fontSize: 22,
                lineHeight: 1,
                padding: 0,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = isDark ? "#fff" : "#0f172a")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = isDark
                  ? "rgba(255,255,255,0.4)"
                  : "#94a3b8")
              }
            >
              ×
            </button>
          </div>
          <DynamicForm
            module={module}
            moduleId={moduleId}
            initialValues={editRecord?.values}
            recordId={editRecord?.id}
            isDark={isDark}
            onSuccess={closeForm}
          />
        </div>
      )}

      {/* ── Search & Filter ── replaces the old simple search bar ── */}
      <ModuleSearch module={module} isDark={isDark} />

      {/* ── Records table (all records, no search filter applied here) ── */}
      <RecordTable
        module={module}
        records={rawRecords}
        onEdit={openEdit}
        onDelete={isAdmin ? (id) => setConfirmDeleteRecord(id) : null}
        canEdit={isStaff}
        canDelete={isAdmin}
        isDark={isDark}
      />

      {/* ── Sub-modules ── */}
      {subModules.length > 0 && (
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 14,
              paddingBottom: 12,
              borderBottom: `1px solid ${isDark ? "rgba(99,102,241,0.15)" : "#e0e7ff"}`,
            }}
          >
            <span style={{ fontSize: 16, opacity: 0.7 }}>◫</span>
            <h2
              style={{
                fontSize: 13,
                fontWeight: 700,
                margin: 0,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: isDark ? "rgba(165,180,252,0.7)" : "#4338ca",
              }}
            >
              Sub-modules
            </h2>
            <span
              style={{
                padding: "2px 8px",
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 700,
                background: isDark ? "rgba(99,102,241,0.15)" : "#e0e7ff",
                color: isDark ? "#a5b4fc" : "#4338ca",
              }}
            >
              {subModules.length}
            </span>
            {!limits.subModules && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: 99,
                  background: isDark ? "rgba(251,191,36,0.1)" : "#fffbeb",
                  color: isDark ? "#fbbf24" : "#d97706",
                  border: isDark
                    ? "1px solid rgba(251,191,36,0.2)"
                    : "1px solid #fde68a",
                  cursor: "pointer",
                }}
                onClick={() => navigate("/pricing")}
              >
                ⭐ Pro feature — Upgrade
              </span>
            )}
          </div>

          {!limits.subModules ? (
            <div
              style={{
                background: isDark ? "rgba(251,191,36,0.04)" : "#fffbeb",
                border: `1px solid ${isDark ? "rgba(251,191,36,0.15)" : "#fde68a"}`,
                borderRadius: 12,
                padding: "20px 24px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 10 }}>◫</div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: isDark ? "#fbbf24" : "#d97706",
                  marginBottom: 6,
                }}
              >
                Sub-modules require Professional plan
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: isDark ? "rgba(255,255,255,0.4)" : "#64748b",
                  margin: "0 0 16px",
                }}
              >
                This module has {subModules.length} sub-module
                {subModules.length !== 1 ? "s" : ""}. Upgrade to view and manage
                sub-module records.
              </p>
              <button
                onClick={() => navigate("/pricing")}
                style={{
                  padding: "9px 22px",
                  borderRadius: 9,
                  cursor: "pointer",
                  background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
                  border: "none",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 700,
                  boxShadow: "0 4px 14px rgba(37,99,235,0.4)",
                }}
              >
                Upgrade to Professional →
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {subModules.map((sm) => (
                <SubModulePanel
                  key={sm.id}
                  subModule={sm}
                  parentModuleId={moduleId}
                  isStaff={isStaff}
                  isAdmin={isAdmin}
                  isDark={isDark}
                  limits={limits}
                  recordCount={recordCount}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Modals ── */}
      {confirmDeleteModule && (
        <DeleteConfirmModal
          title={`Delete "${module.name}"?`}
          message="This module and all its records will be moved to the Recycle Bin. You can restore them within 30 days."
          onConfirm={handleDeleteModule}
          onCancel={() => setConfirmDeleteModule(false)}
          isDark={isDark}
        />
      )}
      {confirmDeleteRecord && (
        <DeleteConfirmModal
          title="Delete Record?"
          message="This record will be moved to the Recycle Bin. You can restore it within 30 days."
          onConfirm={confirmRecordDelete}
          onCancel={() => setConfirmDeleteRecord(null)}
          isDark={isDark}
        />
      )}
    </div>
  );
}
