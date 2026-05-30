import { useState, useEffect } from "react";
import FieldInput from "./FieldInput";
import { useData } from "../../context/DataContext";
import { useTheme } from "../layout/AppLayout";

export default function DynamicForm({
  module,
  moduleId,
  initialValues,
  recordId,
  subModuleId,
  onSuccess,
  isDark: isDarkProp,
}) {
  const isEdit = !!recordId;
  const { createRecord, updateRecord } = useData();

  // Allow parent to pass isDark directly (e.g. SubModulePanel),
  // otherwise fall back to the global theme context.
  const themeCtx = useTheme();
  const isDark = isDarkProp !== undefined ? isDarkProp : themeCtx.isDark;

  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setValues(initialValues ?? {});
    setErrors({});
  }, [initialValues, recordId]);

  function handleChange(fieldId, value) {
    setValues((p) => ({ ...p, [fieldId]: value }));
    setErrors((p) => ({ ...p, [fieldId]: null }));
  }

  function validate() {
    const errs = {};
    module.fields.forEach((f) => {
      if (f.required) {
        const v = values[f.id];
        const empty =
          f.type === "file" ? !v : v === undefined || v === null || v === "";
        if (empty) errs[f.id] = `${f.label} is required`;
      }
    });
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      // AFTER
      if (isEdit) await updateRecord(recordId, subModuleId ?? moduleId, values);
      else await createRecord(moduleId, values, subModuleId ?? null);
      onSuccess?.();
    } finally {
      setLoading(false);
    }
  }

  const fullWidthTypes = new Set(["textarea", "file"]);

  const labelStyle = {
    display: "block",
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 6,
    color: isDark ? "rgba(255,255,255,0.55)" : "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  };

  return (
    <form onSubmit={handleSubmit}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 16,
          marginBottom: 20,
        }}
      >
        {module.fields.map((field) => (
          <div
            key={field.id}
            style={{
              gridColumn: fullWidthTypes.has(field.type) ? "1 / -1" : "auto",
            }}
          >
            <label htmlFor={`field-${field.id}`} style={labelStyle}>
              {field.label}
              {field.required && (
                <span style={{ color: "#ef4444", marginLeft: 3 }}>*</span>
              )}
            </label>
            <FieldInput
              field={field}
              value={values[field.id]}
              onChange={handleChange}
              isDark={isDark}
            />
            {errors[field.id] && (
              <p style={{ fontSize: 12, color: "#f87171", margin: "5px 0 0" }}>
                {errors[field.id]}
              </p>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "9px 22px",
            borderRadius: 9,
            fontSize: 13,
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            background: "linear-gradient(135deg,#16a34a,#15803d)",
            border: "none",
            color: "#fff",
            boxShadow: "0 4px 14px rgba(22,163,74,0.35)",
            opacity: loading ? 0.6 : 1,
            transition: "opacity 0.2s",
          }}
        >
          {loading ? "Saving…" : isEdit ? "Update Record" : "Save Record"}
        </button>
        <button
          type="button"
          onClick={onSuccess}
          style={{
            padding: "9px 22px",
            borderRadius: 9,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
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
  );
}
