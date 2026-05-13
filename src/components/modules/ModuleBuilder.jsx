import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useData } from "../../context/DataContext";
import { moduleStore } from "../../data/store";

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

function FieldRow({ field, index, onChange, onRemove }) {
  function update(key, val) {
    onChange(index, { ...field, [key]: val });
  }

  return (
    <div className="grid grid-cols-12 gap-3 items-end p-3 bg-gray-50 rounded-lg border border-gray-100">
      <div className="col-span-4">
        <label className="label">Label</label>
        <input
          className="input"
          placeholder="e.g. Full Name"
          value={field.label}
          onChange={(e) => update("label", e.target.value)}
        />
      </div>
      <div className="col-span-3">
        <label className="label">Type</label>
        <select
          className="input"
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
      <div className="col-span-3">
        {field.type === "dropdown" ? (
          <>
            <label className="label">Options (comma separated)</label>
            <input
              className="input"
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
            />
          </>
        ) : (
          <div />
        )}
      </div>
      <div className="col-span-1 pb-1">
        <label className="flex items-center gap-1 cursor-pointer">
          <input
            type="checkbox"
            checked={field.required}
            onChange={(e) => update("required", e.target.checked)}
            className="accent-green-600 w-3.5 h-3.5"
          />
          <span className="text-xs text-gray-500">Req</span>
        </label>
      </div>
      <div className="col-span-1 flex justify-end pb-1">
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="text-gray-300 hover:text-red-500 text-xl leading-none transition-colors"
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

  const [name, setName] = useState("");
  const [fields, setFields] = useState([]);

  useEffect(() => {
    if (isEdit) {
      try {
        const m = moduleStore.getById(moduleId);
        setName(m.name);
        setFields(m.fields);
      } catch {
        navigate("/modules");
      }
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

  function handleSubmit(e) {
    e.preventDefault();
    const payload = { name: name.trim(), fields };
    if (isEdit) {
      updateModule(moduleId, payload);
      navigate(`/modules/${moduleId}`);
    } else {
      const m = createModule(payload);
      navigate(`/modules/${m.id}`);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <button
          onClick={() => navigate(-1)}
          className="text-xs text-gray-400 hover:text-gray-600 mb-3 flex items-center gap-1"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? "Edit Module" : "New Module"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Define the name and fields for this module
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Module Name
          </h2>
          <input
            className="input max-w-sm"
            placeholder="e.g. Employee, Project, Inventory"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">
              Fields{" "}
              <span className="ml-2 badge bg-gray-100 text-gray-500">
                {fields.length}
              </span>
            </h2>
            <button
              type="button"
              onClick={addField}
              className="btn-secondary text-xs py-1.5 px-3"
            >
              + Add Field
            </button>
          </div>

          {fields.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <div className="text-3xl mb-2">⊞</div>
              <p className="text-sm">
                No fields yet. Click "Add Field" to start.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {fields.map((f, i) => (
                <FieldRow
                  key={f.id}
                  field={f}
                  index={i}
                  onChange={changeField}
                  onRemove={removeField}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={!name.trim() || fields.length === 0}
            className="btn-primary disabled:opacity-50"
          >
            {isEdit ? "Save Changes" : "Create Module"}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
