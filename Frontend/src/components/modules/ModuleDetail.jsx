import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import { moduleApi } from "../../api/moduleApi";
import DynamicForm from "../records/DynamicForm";
import RecordTable from "../records/RecordTable";

export default function ModuleDetail() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isStaff } = useAuth();
  const { recordsMap, loadRecords, searchRecords, deleteRecord } = useData();

  const [module, setModule] = useState(null);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editRecord, setEditRecord] = useState(null);

  useEffect(() => {
    moduleApi
      .getById(moduleId)
      .then((m) => {
        setModule(m);
        loadRecords(moduleId);
      })
      .catch(() => navigate("/modules"));
  }, [moduleId, navigate, loadRecords]);

  // Live search
  useEffect(() => {
    if (search.length > 1) {
      searchRecords(moduleId, search).then(setSearchResults);
    } else {
      setSearchResults([]);
    }
  }, [search, moduleId, searchRecords]);

  if (!module)
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-100 rounded w-48" />
        <div className="h-4 bg-gray-100 rounded w-64" />
      </div>
    );

  const rawRecords = recordsMap[moduleId] ?? [];
  const records = search.length > 1 ? searchResults : rawRecords;

  function handleDelete(id) {
    if (window.confirm("Delete this record?")) deleteRecord(id, moduleId);
  }

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
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => navigate("/modules")}
            className="text-xs text-gray-400 hover:text-gray-600 mb-2 flex items-center gap-1"
          >
            ← Modules
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{module.name}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {module.fields?.length} fields · {rawRecords.length} records
          </p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Link
              to={`/modules/${moduleId}/edit`}
              className="btn-secondary text-sm"
            >
              Edit module
            </Link>
          )}
          {isStaff && !showForm && (
            <button
              onClick={() => {
                setShowForm(true);
                setEditRecord(null);
              }}
              className="btn-primary text-sm"
            >
              + Add Record
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800 text-sm">
              {editRecord ? "Edit Record" : "New Record"}
            </h2>
            <button
              onClick={closeForm}
              className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            >
              ×
            </button>
          </div>
          <DynamicForm
            module={module}
            moduleId={moduleId}
            initialValues={editRecord?.values}
            recordId={editRecord?.id}
            onSuccess={closeForm}
          />
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            🔍
          </span>
          <input
            className="input pl-8"
            placeholder="Search records…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {search && (
          <button
            onClick={() => setSearch("")}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            Clear
          </button>
        )}
        <span className="text-xs text-gray-400 ml-auto">
          {records.length} result{records.length !== 1 ? "s" : ""}
        </span>
      </div>

      <RecordTable
        module={module}
        records={records}
        onEdit={openEdit}
        onDelete={handleDelete}
        canEdit={isStaff}
        canDelete={isAdmin}
      />
    </div>
  );
}
