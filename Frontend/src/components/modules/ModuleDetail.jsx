import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../layout/AppLayout";
import { moduleApi } from "../../api/moduleApi";
import DynamicForm from "../records/DynamicForm";
import RecordTable from "../records/RecordTable";

// ─── Confirm delete modal ─────────────────────────────────────────────────────
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

// ─── Sub-module Panel ─────────────────────────────────────────────────────────
function SubModulePanel({
  subModule,
  parentModuleId,
  isStaff,
  isAdmin,
  isDark,
}) {
  const { recordsMap, loadRecords, deleteRecord } = useData();
  const [expanded, setExpanded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [confirmDeleteRecord, setConfirmDeleteRecord] = useState(null); // record id
  const navigate = useNavigate();

  useEffect(() => {
    if (expanded) loadRecords(parentModuleId, subModule.id);
  }, [expanded, subModule.id, parentModuleId, loadRecords]);

  const records = recordsMap[subModule.id] ?? [];

  const accentBg = isDark ? "rgba(99,102,241,0.08)" : "#eef2ff";
  const accentBorder = isDark ? "rgba(99,102,241,0.22)" : "#c7d2fe";
  const innerBg = isDark ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.6)";
  const formBg = isDark ? "rgba(255,255,255,0.04)" : "#fff";
  const formBorder = isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0";

  function handleDeleteRecord(id) {
    setConfirmDeleteRecord(id);
  }

  function confirmRecordDelete() {
    deleteRecord(confirmDeleteRecord, subModule.id);
    setConfirmDeleteRecord(null);
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
        {/* ── Header row ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 18px",
            cursor: "pointer",
            userSelect: "none",
          }}
          onClick={() => setExpanded((p) => !p)}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                fontSize: 12,
                transition: "transform 0.2s",
                transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
                color: isDark ? "#818cf8" : "#6366f1",
                display: "inline-block",
              }}
            >
              ▶
            </span>
            <span style={{ fontSize: 16 }}>◫</span>
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
            {isStaff && expanded && !showForm && (
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
            )}
          </div>
        </div>

        {/* ── Expanded body ── */}
        {expanded && (
          <div
            style={{
              borderTop: `1px solid ${accentBorder}`,
              padding: "16px 18px",
              background: innerBg,
            }}
          >
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
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <p
                  style={{
                    fontSize: 13,
                    color: isDark ? "rgba(165,180,252,0.4)" : "#a5b4fc",
                    margin: 0,
                  }}
                >
                  No records yet in this sub-module.
                </p>
              </div>
            ) : (
              <RecordTable
                module={subModule}
                records={records}
                onEdit={openEdit}
                onDelete={handleDeleteRecord}
                canEdit={isStaff}
                canDelete={isAdmin}
                isDark={isDark}
              />
            )}

            {/* Nested sub-modules */}
            {(subModule.subModules ?? []).length > 0 && (
              <div
                style={{
                  marginTop: 16,
                  paddingTop: 14,
                  borderTop: `1px dashed ${isDark ? "rgba(99,102,241,0.15)" : "#c7d2fe"}`,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: isDark ? "rgba(165,180,252,0.5)" : "#7c3aed",
                    marginBottom: 4,
                    display: "block",
                  }}
                >
                  Nested Sub-modules{" "}
                  <span
                    style={{
                      marginLeft: 6,
                      padding: "1px 7px",
                      borderRadius: 20,
                      fontSize: 10,
                      fontWeight: 700,
                      background: isDark ? "rgba(99,102,241,0.12)" : "#ede9fe",
                      color: isDark ? "#c4b5fd" : "#7c3aed",
                    }}
                  >
                    {subModule.subModules.length}
                  </span>
                </span>
                {subModule.subModules.map((nested) => (
                  <SubModulePanel
                    key={nested.id}
                    subModule={nested}
                    parentModuleId={parentModuleId}
                    isStaff={isStaff}
                    isAdmin={isAdmin}
                    isDark={isDark}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Record delete confirm */}
      {confirmDeleteRecord && (
        <DeleteConfirmModal
          title="Delete Record?"
          message="This record will be moved to the Recycle Bin. You can restore it within 30 days."
          onConfirm={confirmRecordDelete}
          onCancel={() => setConfirmDeleteRecord(null)}
          isDark={isDark}
        />
      )}
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ModuleDetail() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isStaff } = useAuth();
  const { recordsMap, loadRecords, searchRecords, deleteRecord, deleteModule } =
    useData();
  const { isDark } = useTheme();

  const [module, setModule] = useState(null);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [confirmDeleteModule, setConfirmDeleteModule] = useState(false);
  const [confirmDeleteRecord, setConfirmDeleteRecord] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    moduleApi
      .getById(moduleId)
      .then((m) => {
        setModule(m);
        loadRecords(moduleId);
      })
      .catch(() => navigate("/modules"));
  }, [moduleId, navigate, loadRecords]);

  useEffect(() => {
    if (search.length > 1)
      searchRecords(moduleId, search).then(setSearchResults);
    else setSearchResults([]);
  }, [search, moduleId, searchRecords]);

  async function handleDeleteModule() {
    setDeleting(true);
    try {
      await moduleApi.delete(moduleId);
      // Also update local state if deleteModule is in context
      deleteModule?.(moduleId);
      navigate("/modules");
    } catch {
      alert("Failed to delete module");
    } finally {
      setDeleting(false);
      setConfirmDeleteModule(false);
    }
  }

  function handleDeleteRecord(id) {
    setConfirmDeleteRecord(id);
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
  const records = search.length > 1 ? searchResults : rawRecords;
  const subModules = module.subModules ?? [];

  const textPrimary = isDark ? "#fff" : "#0f172a";
  const textSecondary = isDark ? "rgba(255,255,255,0.45)" : "#64748b";
  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "#ffffff";
  const cardBorder = isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0";
  const inputBg = isDark ? "rgba(255,255,255,0.06)" : "#ffffff";
  const inputBorder = isDark ? "rgba(255,255,255,0.15)" : "#cbd5e1";

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
        gap: 24,
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
          <h1
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: textPrimary,
              margin: "0 0 4px",
              letterSpacing: -0.5,
            }}
          >
            {module.name}
          </h1>
          <p style={{ fontSize: 13, color: textSecondary, margin: 0 }}>
            {module.fields?.length} fields · {rawRecords.length} records
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
          {isStaff && !showForm && (
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
          )}
          {/* ── Delete Module button (admin only) ── */}
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
                transition: "all 0.15s",
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

      {/* ── Add/Edit form ── */}
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

      {/* ── Search bar ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
          <span
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 14,
              color: isDark ? "rgba(255,255,255,0.3)" : "#94a3b8",
            }}
          >
            🔍
          </span>
          <input
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
            placeholder="Search records…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={(e) =>
              (e.target.style.borderColor = isDark ? "#4B9FFF" : "#2563eb")
            }
            onBlur={(e) => (e.target.style.borderColor = inputBorder)}
          />
        </div>
        {search && (
          <button
            onClick={() => setSearch("")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 12,
              color: isDark ? "rgba(255,255,255,0.4)" : "#64748b",
            }}
          >
            Clear
          </button>
        )}
        <span
          style={{ fontSize: 12, color: textSecondary, marginLeft: "auto" }}
        >
          {records.length} result{records.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Main records table ── */}
      <RecordTable
        module={module}
        records={records}
        onEdit={openEdit}
        onDelete={handleDeleteRecord}
        canEdit={isStaff}
        canDelete={isAdmin}
        isDark={isDark}
      />

      {/* ── Sub-modules section ── */}
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
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {subModules.map((sm) => (
              <SubModulePanel
                key={sm.id}
                subModule={sm}
                parentModuleId={moduleId}
                isStaff={isStaff}
                isAdmin={isAdmin}
                isDark={isDark}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Delete module confirm modal ── */}
      {confirmDeleteModule && (
        <DeleteConfirmModal
          title={`Delete "${module.name}"?`}
          message={`This module and all its records will be moved to the Recycle Bin. You can restore them within 30 days.`}
          onConfirm={handleDeleteModule}
          onCancel={() => setConfirmDeleteModule(false)}
          isDark={isDark}
        />
      )}

      {/* ── Delete record confirm modal ── */}
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
