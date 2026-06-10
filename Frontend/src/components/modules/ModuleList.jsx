import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useData } from "../../context/DataContext";
import { useTheme } from "../layout/AppLayout";
import { moduleApi } from "../../api/moduleApi";

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

function FieldRow({ field, index, onChange, onRemove, isDark }) {
  function update(key, val) {
    onChange(index, { ...field, [key]: val });
  }

  const inputStyle = {
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
  const labelStyle = {
    display: "block",
    fontSize: 11,
    fontWeight: 600,
    marginBottom: 5,
    color: isDark ? "rgba(255,255,255,0.45)" : "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  };

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
      {/* Label */}
      <div>
        <label style={labelStyle}>Label</label>
        <input
          style={inputStyle}
          placeholder="e.g. Full Name"
          value={field.label}
          onChange={(e) => update("label", e.target.value)}
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

      {/* Type */}
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

      {/* Options (only for dropdown) */}
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
              onFocus={(e) =>
                (e.target.style.borderColor = isDark ? "#4B9FFF" : "#2563eb")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = isDark
                  ? "rgba(255,255,255,0.12)"
                  : "#e2e8f0")
              }
            />
          </>
        ) : (
          <div />
        )}
      </div>

      {/* Required checkbox */}
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

      {/* Remove */}
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

export default function ModuleBuilder() {
  const { moduleId } = useParams();
  const isEdit = !!moduleId;
  const navigate = useNavigate();
  const { createModule, updateModule } = useData();
  const { isDark } = useTheme();
  const { modules } = useData();

  const [name, setName] = useState("");
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      moduleApi
        .getById(moduleId)
        .then((m) => {
          setName(m.name);
          setFields(m.fields ?? []);
        })
        .catch(() => navigate("/modules"));
    }
  }, [isEdit, moduleId, navigate]);

  function addField() {
    setFields((p) => [
      ...p,
      { id: uid(), label: "", type: "text", required: false, options: [] },
    ]);
  }
  function changeField(i, updated) {
    setFields((p) => p.map((f, idx) => (idx === i ? updated : f)));
  }
  function removeField(i) {
    setFields((p) => p.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { name: name.trim(), fields };
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

  // Theme tokens
  const textPrimary = isDark ? "#fff" : "#0f172a";
  const textSecondary = isDark ? "rgba(255,255,255,0.45)" : "#64748b";
  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "#ffffff";
  const cardBorder = isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0";
  const labelStyle = {
    display: "block",
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 6,
    color: isDark ? "rgba(255,255,255,0.5)" : "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  };
  const inputStyle = {
    maxWidth: 380,
    width: "100%",
    boxSizing: "border-box",
    padding: "9px 12px",
    borderRadius: 9,
    fontSize: 14,
    background: isDark ? "rgba(255,255,255,0.06)" : "#fff",
    border: `1.5px solid ${isDark ? "rgba(255,255,255,0.12)" : "#e2e8f0"}`,
    color: textPrimary,
    outline: "none",
  };

  return (
    <div style={{ padding: "36px 40px", maxWidth: 780 }}>
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
          Define the name and fields for this module
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 20 }}
      >
        {/* Module Name card */}
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
            onFocus={(e) =>
              (e.target.style.borderColor = isDark ? "#4B9FFF" : "#2563eb")
            }
            onBlur={(e) =>
              (e.target.style.borderColor = isDark
                ? "rgba(255,255,255,0.12)"
                : "#e2e8f0")
            }
            required
          />
        </div>

        {/* Fields card */}
        <div
          style={{
            background: cardBg,
            border: `1.5px solid ${cardBorder}`,
            borderRadius: 14,
            padding: "20px 24px",
            boxShadow: isDark ? "none" : "0 2px 8px rgba(0,0,0,0.04)",
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
              Fields{" "}
              <span
                style={{
                  marginLeft: 8,
                  padding: "2px 8px",
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 700,
                  background: isDark ? "rgba(255,255,255,0.08)" : "#f1f5f9",
                  color: isDark ? "rgba(255,255,255,0.5)" : "#64748b",
                }}
              >
                {fields.length}
              </span>
            </h2>
            <button
              type="button"
              onClick={addField}
              style={{
                padding: "7px 16px",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
                background: isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9",
                border: isDark
                  ? "1px solid rgba(255,255,255,0.15)"
                  : "1.5px solid #cbd5e1",
                color: isDark ? "rgba(255,255,255,0.8)" : "#334155",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isDark
                  ? "rgba(255,255,255,0.1)"
                  : "#e2e8f0";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isDark
                  ? "rgba(255,255,255,0.06)"
                  : "#f1f5f9";
              }}
            >
              + Add Field
            </button>
          </div>

          {fields.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ fontSize: 32, marginBottom: 10, opacity: 0.4 }}>
                ⊞
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: isDark ? "rgba(255,255,255,0.3)" : "#94a3b8",
                  margin: 0,
                }}
              >
                No fields yet. Click "+ Add Field" to start.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
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

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            type="submit"
            disabled={loading || !name.trim() || fields.length === 0}
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
              opacity: loading || !name.trim() || fields.length === 0 ? 0.5 : 1,
              transition: "opacity 0.2s",
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
