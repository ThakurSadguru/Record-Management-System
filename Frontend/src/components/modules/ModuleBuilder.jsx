import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useData } from "../../context/DataContext";
import { useTheme } from "../layout/AppLayout";
import { moduleApi } from "../../api/moduleApi";
import { useAuth } from "../../context/AuthContext";

const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "email", label: "Email" },
  { value: "textarea", label: "Long Text" },
  { value: "boolean", label: "Yes / No" },
  { value: "dropdown", label: "Dropdown" },
  { value: "file", label: "File Upload" },
];

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

// ─── Shared input styles ──────────────────────────────────────────────────────
function makeInputStyle(isDark) {
  return {
    width: "100%",
    boxSizing: "border-box",
    padding: "8px 10px",
    borderRadius: 8,
    fontSize: 13,
    background: isDark ? "rgba(255,255,255,0.06)" : "#fff",
    border: `1.5px solid ${isDark ? "rgba(255,255,255,0.12)" : "#e2e8f0"}`,
    color: isDark ? "#fff" : "#0f172a",
    outline: "none",
  };
}
function makeLabelStyle(isDark) {
  return {
    display: "block",
    fontSize: 11,
    fontWeight: 600,
    marginBottom: 5,
    color: isDark ? "rgba(255,255,255,0.45)" : "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  };
}

function containsFocusId(subModule, focusId) {
  if (!focusId) return false;
  if (subModule.id === focusId) return true;
  return (subModule.subModules ?? []).some((sm) =>
    containsFocusId(sm, focusId),
  );
}

// ─── Single field row ─────────────────────────────────────────────────────────
function FieldRow({ field, index, onChange, onRemove, isDark }) {
  function update(key, val) {
    onChange(index, { ...field, [key]: val });
  }
  const inputStyle = makeInputStyle(isDark);
  const labelStyle = makeLabelStyle(isDark);
  const focusIn = (e) =>
    (e.target.style.borderColor = isDark ? "#4B9FFF" : "#2563eb");
  const focusOut = (e) =>
    (e.target.style.borderColor = isDark
      ? "rgba(255,255,255,0.12)"
      : "#e2e8f0");

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "4fr 3fr 3fr auto auto",
        gap: 12,
        alignItems: "end",
        padding: "14px 16px",
        borderRadius: 10,
        background: isDark ? "rgba(255,255,255,0.04)" : "#f8fafc",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0"}`,
      }}
    >
      <div>
        <label style={labelStyle}>Label</label>
        <input
          style={inputStyle}
          placeholder="e.g. Full Name"
          value={field.label}
          onChange={(e) => update("label", e.target.value)}
          onFocus={focusIn}
          onBlur={focusOut}
        />
      </div>
      <div>
        <label style={labelStyle}>Type</label>
        <select
          style={inputStyle}
          value={field.type}
          onChange={(e) => update("type", e.target.value)}
        >
          {FIELD_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        {field.type === "dropdown" ? (
          <>
            <label style={labelStyle}>Options (comma separated)</label>
            <input
              style={inputStyle}
              placeholder="HR, Eng, Sales"
              value={field.options.join(", ")}
              onChange={(e) =>
                update(
                  "options",
                  e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                )
              }
              onFocus={focusIn}
              onBlur={focusOut}
            />
          </>
        ) : (
          <div />
        )}
      </div>
      <div style={{ paddingBottom: 4 }}>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={field.required}
            onChange={(e) => update("required", e.target.checked)}
            style={{
              width: 14,
              height: 14,
              accentColor: "#16a34a",
              cursor: "pointer",
            }}
          />
          <span
            style={{
              fontSize: 12,
              color: isDark ? "rgba(255,255,255,0.45)" : "#64748b",
              fontWeight: 500,
            }}
          >
            Req
          </span>
        </label>
      </div>
      <div style={{ paddingBottom: 4 }}>
        <button
          type="button"
          onClick={() => onRemove(index)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "2px 4px",
            fontSize: 20,
            lineHeight: 1,
            color: isDark ? "rgba(255,255,255,0.2)" : "#cbd5e1",
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = isDark
              ? "rgba(255,255,255,0.2)"
              : "#cbd5e1")
          }
        >
          ×
        </button>
      </div>
    </div>
  );
}

// ─── Fields section (reusable) ────────────────────────────────────────────────
function FieldsSection({ fields, onChange, isDark, accent = "default" }) {
  const isIndigo = accent === "indigo";

  function addField() {
    onChange([
      ...fields,
      { id: uid(), label: "", type: "text", required: false, options: [] },
    ]);
  }
  function changeField(i, updated) {
    onChange(fields.map((f, idx) => (idx === i ? updated : f)));
  }
  function removeField(i) {
    onChange(fields.filter((_, idx) => idx !== i));
  }

  const addBtnStyle = {
    padding: "6px 14px",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 600,
    background: isIndigo
      ? isDark
        ? "rgba(99,102,241,0.1)"
        : "#ede9fe"
      : isDark
        ? "rgba(255,255,255,0.06)"
        : "#f1f5f9",
    border: isIndigo
      ? isDark
        ? "1px solid rgba(99,102,241,0.25)"
        : "1.5px solid #c4b5fd"
      : isDark
        ? "1px solid rgba(255,255,255,0.15)"
        : "1.5px solid #cbd5e1",
    color: isIndigo
      ? isDark
        ? "#a5b4fc"
        : "#4338ca"
      : isDark
        ? "rgba(255,255,255,0.8)"
        : "#334155",
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: fields.length > 0 ? 10 : 0,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: isIndigo
              ? isDark
                ? "rgba(165,180,252,0.6)"
                : "#6366f1"
              : isDark
                ? "rgba(255,255,255,0.4)"
                : "#94a3b8",
          }}
        >
          Fields{" "}
          <span
            style={{
              marginLeft: 6,
              padding: "1px 7px",
              borderRadius: 20,
              fontSize: 10,
              fontWeight: 700,
              background: isIndigo
                ? isDark
                  ? "rgba(99,102,241,0.15)"
                  : "#e0e7ff"
                : isDark
                  ? "rgba(255,255,255,0.08)"
                  : "#f1f5f9",
              color: isIndigo
                ? isDark
                  ? "#a5b4fc"
                  : "#4338ca"
                : isDark
                  ? "rgba(255,255,255,0.4)"
                  : "#94a3b8",
            }}
          >
            {fields.length}
          </span>
        </span>
        <button
          type="button"
          onClick={addField}
          style={addBtnStyle}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          + Add Field
        </button>
      </div>

      {fields.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "20px 16px",
            borderRadius: 10,
            marginTop: 8,
            background: isIndigo
              ? isDark
                ? "rgba(99,102,241,0.04)"
                : "rgba(99,102,241,0.03)"
              : isDark
                ? "rgba(255,255,255,0.02)"
                : "#f8fafc",
            border: `1px dashed ${isIndigo ? (isDark ? "rgba(99,102,241,0.2)" : "#c7d2fe") : isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0"}`,
          }}
        >
          <p
            style={{
              fontSize: 12,
              margin: 0,
              color: isIndigo
                ? isDark
                  ? "rgba(165,180,252,0.35)"
                  : "#a5b4fc"
                : isDark
                  ? "rgba(255,255,255,0.25)"
                  : "#94a3b8",
            }}
          >
            No fields yet — click "+ Add Field" to define this{" "}
            {isIndigo ? "sub-module's" : "module's"} structure.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            marginTop: 8,
          }}
        >
          {fields.map((f, i) => (
            <FieldRow
              key={f.id}
              field={f}
              index={i}
              onChange={changeField}
              onRemove={removeField}
              isDark={isDark}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Sub-module card (supports nested sub-modules recursively) ────────────────
function SubModuleCard({
  subModule,
  onUpdate,
  onRemove,
  isDark,
  depth = 0,
  isFocused = false,
  focusId = null,
}) {
  const [expanded, setExpanded] = useState(
    isFocused || containsFocusId(subModule, focusId), // ← auto-expand if focused or contains focus
  );

  const [showNestedPicker, setShowNestedPicker] = useState(false);
  const [newNestedName, setNewNestedName] = useState("");

  // Update fields of THIS sub-module
  function updateFields(newFields) {
    onUpdate({ ...subModule, fields: newFields });
  }

  // Update name of THIS sub-module
  function updateName(val) {
    onUpdate({ ...subModule, name: val });
  }

  // Add a nested sub-module INSIDE this sub-module
  function addNestedSubModule() {
    if (!newNestedName.trim()) return;
    const nested = {
      id: uid(),
      name: newNestedName.trim(),
      fields: [],
      subModules: [],
    };
    onUpdate({
      ...subModule,
      subModules: [...(subModule.subModules ?? []), nested],
    });
    setNewNestedName("");
    setShowNestedPicker(false);
  }

  // Update a nested sub-module inside this sub-module
  function updateNestedSubModule(id, updated) {
    onUpdate({
      ...subModule,
      subModules: (subModule.subModules ?? []).map((sm) =>
        sm.id === id ? updated : sm,
      ),
    });
  }

  // Remove a nested sub-module inside this sub-module
  function removeNestedSubModule(id) {
    onUpdate({
      ...subModule,
      subModules: (subModule.subModules ?? []).filter((sm) => sm.id !== id),
    });
  }

  const accentBg = isDark ? "rgba(99,102,241,0.07)" : "#eef2ff";
  const accentBorder = isDark ? "rgba(99,102,241,0.22)" : "#c7d2fe";

  // Slightly different shade for deeper nesting
  const nestedBg = isDark ? "rgba(99,102,241,0.04)" : "#f5f3ff";
  const nestedBorder = isDark ? "rgba(99,102,241,0.15)" : "#ddd6fe";

  const bg = depth === 0 ? accentBg : nestedBg;
  const border = depth === 0 ? accentBorder : nestedBorder;

  const nameInputStyle = {
    flex: 1,
    padding: "6px 10px",
    borderRadius: 7,
    fontSize: 13,
    fontWeight: 600,
    background: isDark ? "rgba(99,102,241,0.1)" : "rgba(99,102,241,0.06)",
    border: `1.5px solid ${isDark ? "rgba(99,102,241,0.25)" : "#c4b5fd"}`,
    color: isDark ? "#a5b4fc" : "#3730a3",
    outline: "none",
  };
  const inputStyle = makeInputStyle(isDark);
  const focusIn = (e) =>
    (e.target.style.borderColor = isDark ? "#818cf8" : "#6366f1");
  const focusOut = (e) =>
    (e.target.style.borderColor = isDark ? "rgba(99,102,241,0.25)" : "#c4b5fd");

  return (
    <div
      id={`submodule-${subModule.id}`}
      style={{
        borderRadius: 12,
        border: isFocused
          ? `2px solid ${isDark ? "#818cf8" : "#6366f1"}`
          : `1.5px solid ${border}`,
        background: bg,
        overflow: "hidden",
      }}
    >
      {/* Card header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 16px",
        }}
      >
        <button
          type="button"
          onClick={() => setExpanded((p) => !p)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "2px 4px",
            fontSize: 11,
            lineHeight: 1,
            color: isDark ? "#818cf8" : "#6366f1",
            transition: "transform 0.2s",
            transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
          }}
        >
          ▶
        </button>
        <span style={{ fontSize: 15, opacity: 0.65 }}>◫</span>
        <input
          style={nameInputStyle}
          value={subModule.name}
          onChange={(e) => updateName(e.target.value)}
          placeholder="Sub-module name"
          onFocus={focusIn}
          onBlur={focusOut}
        />
        <span
          style={{
            padding: "2px 8px",
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 600,
            whiteSpace: "nowrap",
            background: isDark ? "rgba(99,102,241,0.15)" : "#e0e7ff",
            color: isDark ? "#a5b4fc" : "#4338ca",
          }}
        >
          {subModule.fields?.length ?? 0} field
          {subModule.fields?.length !== 1 ? "s" : ""}
        </span>
        {/* Nested sub-modules count badge */}
        {(subModule.subModules?.length ?? 0) > 0 && (
          <span
            style={{
              padding: "2px 8px",
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 600,
              whiteSpace: "nowrap",
              background: isDark ? "rgba(99,102,241,0.1)" : "#ede9fe",
              color: isDark ? "#c4b5fd" : "#6d28d9",
            }}
          >
            {subModule.subModules.length} nested
          </span>
        )}
        <button
          type="button"
          onClick={onRemove}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "2px 4px",
            fontSize: 20,
            lineHeight: 1,
            color: isDark ? "rgba(165,180,252,0.3)" : "#a5b4fc",
            transition: "color 0.15s",
            marginLeft: 2,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = isDark
              ? "rgba(165,180,252,0.3)"
              : "#a5b4fc")
          }
        >
          ×
        </button>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div
          style={{
            borderTop: `1px solid ${border}`,
            padding: "14px 16px",
            background: isDark ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.5)",
          }}
        >
          {/* This sub-module's own fields */}
          <FieldsSection
            fields={subModule.fields ?? []}
            onChange={updateFields}
            isDark={isDark}
            accent="indigo"
          />

          {/* ── Nested sub-modules inside this sub-module ── */}
          <div
            style={{
              marginTop: 16,
              paddingTop: 14,
              borderTop: `1px dashed ${isDark ? "rgba(99,102,241,0.15)" : "#c7d2fe"}`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: isDark ? "rgba(165,180,252,0.5)" : "#7c3aed",
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
                  {subModule.subModules?.length ?? 0}
                </span>
              </span>
              <button
                type="button"
                onClick={() => setShowNestedPicker((p) => !p)}
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
                  color: isDark ? "#a5b4fc" : "#6d28d9",
                }}
              >
                {showNestedPicker ? "− Cancel" : "+ Add Nested"}
              </button>
            </div>

            {/* Inline picker to add a nested sub-module */}
            {showNestedPicker && (
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <input
                  style={{ ...inputStyle, flex: 1 }}
                  placeholder="Nested sub-module name (e.g. Addresses, Skills)"
                  value={newNestedName}
                  onChange={(e) => setNewNestedName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addNestedSubModule();
                    }
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderColor = isDark
                      ? "#818cf8"
                      : "#6366f1")
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = isDark
                      ? "rgba(255,255,255,0.12)"
                      : "#e2e8f0")
                  }
                />
                <button
                  type="button"
                  onClick={addNestedSubModule}
                  disabled={!newNestedName.trim()}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    cursor: "pointer",
                    background: "linear-gradient(135deg,#6366f1,#4f46e5)",
                    border: "none",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 600,
                    opacity: newNestedName.trim() ? 1 : 0.4,
                  }}
                >
                  Add
                </button>
              </div>
            )}

            {/* Render nested sub-modules recursively */}
            {(subModule.subModules ?? []).length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {subModule.subModules.map((nested) => (
                  <SubModuleCard
                    key={nested.id}
                    subModule={nested}
                    depth={depth + 1}
                    isDark={isDark}
                    isFocused={focusId === nested.id}
                    focusId={focusId}
                    onUpdate={(updated) =>
                      updateNestedSubModule(nested.id, updated)
                    }
                    onRemove={() => removeNestedSubModule(nested.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main ModuleBuilder component ─────────────────────────────────────────────
export default function ModuleBuilder() {
  const { moduleId } = useParams();
  const isEdit = !!moduleId;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const focusId = searchParams.get("focus");
  const { createModule, updateModule } = useData();
  const { isDark } = useTheme();
  const { isAdmin } = useAuth();

  const [name, setName] = useState("");
  const [fields, setFields] = useState([]);
  const [subModules, setSubModules] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [newSubName, setNewSubName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAdmin) navigate("/modules", { replace: true });
  }, [isAdmin, navigate]);

  useEffect(() => {
    if (isEdit) {
      moduleApi
        .getById(moduleId)
        .then((m) => {
          setName(m.name);
          setFields(m.fields ?? []);
          setSubModules(m.subModules ?? []);
        })
        .catch(() => navigate("/modules"));
    }
  }, [isEdit, moduleId, navigate]);

  useEffect(() => {
    if (focusId) {
      setTimeout(() => {
        const el = document.getElementById(`submodule-${focusId}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300); // wait for render
    }
  }, [focusId, subModules]);

  // Top-level sub-module CRUD
  function addSubModule() {
    if (!newSubName.trim()) return;
    setSubModules((p) => [
      ...p,
      { id: uid(), name: newSubName.trim(), fields: [], subModules: [] },
    ]);
    setNewSubName("");
    setShowPicker(false);
  }

  function updateSubModule(id, updated) {
    // updated already carries the full nested tree because SubModuleCard
    // calls onUpdate with the complete updated object including subModules
    setSubModules((p) => p.map((sm) => (sm.id === id ? updated : sm)));
  }

  function removeSubModule(id) {
    setSubModules((p) => p.filter((sm) => sm.id !== id));
  }

  const canSubmit = name.trim() && (fields.length > 0 || subModules.length > 0);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      // subModules tree is already fully nested — just send it as-is
      const payload = { name: name.trim(), fields, subModules };
      if (isEdit) {
        await updateModule(moduleId, payload);
        navigate(`/modules/${moduleId}`);
      } else {
        const m = await createModule(payload);
        navigate(`/modules/${m.id}`);
      }
    } finally {
      setLoading(false);
    }
  }

  const textPrimary = isDark ? "#fff" : "#0f172a";
  const textSecondary = isDark ? "rgba(255,255,255,0.45)" : "#64748b";
  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "#ffffff";
  const cardBorder = isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0";
  const inputStyle = { ...makeInputStyle(isDark), maxWidth: 380 };

  return (
    <div style={{ padding: "36px 40px", maxWidth: 820 }}>
      {/* Back + Title */}
      <div style={{ marginBottom: 28 }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            fontSize: 12,
            color: isDark ? "rgba(255,255,255,0.4)" : "#64748b",
            display: "flex",
            alignItems: "center",
            gap: 4,
            marginBottom: 10,
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
        <h1
          style={{
            fontSize: 24,
            fontWeight: 800,
            color: textPrimary,
            margin: "0 0 6px",
            letterSpacing: -0.5,
          }}
        >
          {isEdit ? "Edit Module" : "New Module"}
        </h1>
        <p style={{ fontSize: 13, color: textSecondary, margin: 0 }}>
          Define the name, fields, and optional sub-modules (with nesting
          support)
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 20 }}
      >
        {/* Module Name */}
        <div
          style={{
            background: cardBg,
            border: `1.5px solid ${cardBorder}`,
            borderRadius: 14,
            padding: "20px 24px",
            boxShadow: isDark ? "none" : "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <h2
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: isDark ? "rgba(255,255,255,0.6)" : "#475569",
              margin: "0 0 12px",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Module Name
          </h2>
          <input
            style={inputStyle}
            placeholder="e.g. Employee, Project, Inventory"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            onFocus={(e) =>
              (e.target.style.borderColor = isDark ? "#4B9FFF" : "#2563eb")
            }
            onBlur={(e) =>
              (e.target.style.borderColor = isDark
                ? "rgba(255,255,255,0.12)"
                : "#e2e8f0")
            }
          />
        </div>

        {/* Main Fields */}
        <div
          style={{
            background: cardBg,
            border: `1.5px solid ${cardBorder}`,
            borderRadius: 14,
            padding: "20px 24px",
            boxShadow: isDark ? "none" : "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ marginBottom: 16 }}>
            <h2
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: isDark ? "rgba(255,255,255,0.6)" : "#475569",
                margin: 0,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Fields
            </h2>
            {subModules.length > 0 && fields.length === 0 && (
              <p
                style={{
                  fontSize: 11,
                  color: isDark ? "rgba(255,255,255,0.35)" : "#94a3b8",
                  margin: "4px 0 0",
                }}
              >
                Optional — structure lives in sub-modules
              </p>
            )}
          </div>
          <FieldsSection
            fields={fields}
            onChange={setFields}
            isDark={isDark}
            accent="default"
          />
        </div>

        {/* Sub-modules card */}
        <div
          style={{
            background: isDark ? "rgba(99,102,241,0.05)" : "#fafafe",
            border: `1.5px solid ${isDark ? "rgba(99,102,241,0.2)" : "#e0e7ff"}`,
            borderRadius: 14,
            padding: "20px 24px",
            boxShadow: isDark ? "none" : "0 2px 8px rgba(99,102,241,0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <div>
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
                Sub-modules{" "}
                <span
                  style={{
                    marginLeft: 8,
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
              </h2>
              <p
                style={{
                  fontSize: 11,
                  color: isDark ? "rgba(165,180,252,0.5)" : "#818cf8",
                  margin: "4px 0 0",
                }}
              >
                Each sub-module can have its own fields and further nested
                sub-modules
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowPicker((p) => !p)}
              style={{
                padding: "7px 16px",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
                flexShrink: 0,
                background: showPicker
                  ? isDark
                    ? "rgba(99,102,241,0.2)"
                    : "#e0e7ff"
                  : isDark
                    ? "rgba(99,102,241,0.1)"
                    : "#ede9fe",
                border: isDark
                  ? "1px solid rgba(99,102,241,0.3)"
                  : "1.5px solid #c4b5fd",
                color: isDark ? "#a5b4fc" : "#4338ca",
              }}
            >
              {showPicker ? "− Cancel" : "+ Add Sub-module"}
            </button>
          </div>

          {/* Top-level sub-module name picker */}
          {showPicker && (
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <input
                style={{ ...makeInputStyle(isDark), flex: 1 }}
                placeholder="Sub-module name (e.g. Address, Education)"
                value={newSubName}
                onChange={(e) => setNewSubName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSubModule();
                  }
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = isDark ? "#818cf8" : "#6366f1")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = isDark
                    ? "rgba(255,255,255,0.12)"
                    : "#e2e8f0")
                }
              />
              <button
                type="button"
                onClick={addSubModule}
                disabled={!newSubName.trim()}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  cursor: "pointer",
                  background: "linear-gradient(135deg,#6366f1,#4f46e5)",
                  border: "none",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 600,
                  opacity: newSubName.trim() ? 1 : 0.4,
                }}
              >
                Add
              </button>
            </div>
          )}

          {/* Empty state */}
          {subModules.length === 0 && !showPicker && (
            <div style={{ textAlign: "center", padding: "28px 20px" }}>
              <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.3 }}>
                ◫
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: isDark ? "rgba(165,180,252,0.3)" : "#a5b4fc",
                  margin: 0,
                }}
              >
                No sub-modules yet. Click "+ Add Sub-module" to add nested
                sections.
              </p>
            </div>
          )}

          {/* Sub-module cards — each renders its own nested tree */}
          {subModules.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {subModules.map((sm) => (
                <SubModuleCard
                  key={sm.id}
                  subModule={sm}
                  depth={0}
                  isDark={isDark}
                  isFocused={focusId === sm.id}
                  focusId={focusId}
                  onUpdate={(updated) => updateSubModule(sm.id, updated)}
                  onRemove={() => removeSubModule(sm.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Validation hint */}
        {!canSubmit && name.trim() && (
          <p
            style={{
              fontSize: 12,
              color: isDark ? "rgba(255,100,100,0.7)" : "#ef4444",
              margin: "-8px 0 0",
            }}
          >
            Add at least one field or one sub-module.
          </p>
        )}

        {/* Action buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            type="submit"
            disabled={loading || !canSubmit}
            style={{
              padding: "10px 24px",
              borderRadius: 9,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
              background: "linear-gradient(135deg,#16a34a,#15803d)",
              border: "none",
              color: "#fff",
              boxShadow: "0 4px 14px rgba(22,163,74,0.35)",
              opacity: loading || !canSubmit ? 0.5 : 1,
            }}
          >
            {loading ? "Saving…" : isEdit ? "Save Changes" : "Create Module"}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              padding: "10px 24px",
              borderRadius: 9,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
              background: isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9",
              border: isDark
                ? "1px solid rgba(255,255,255,0.15)"
                : "1.5px solid #cbd5e1",
              color: isDark ? "rgba(255,255,255,0.7)" : "#475569",
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
