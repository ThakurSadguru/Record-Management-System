import { useState } from "react";
function fileIcon(mime) {
  if (!mime) return "📎";
  if (mime.startsWith("image/")) return "🖼️";
  if (mime === "application/pdf") return "📄";
  if (mime.includes("word") || mime.includes("document")) return "📝";
  if (mime.includes("sheet") || mime.includes("excel")) return "📊";
  if (mime.includes("zip") || mime.includes("rar")) return "🗜️";
  if (mime.startsWith("video/")) return "🎬";
  if (mime.startsWith("audio/")) return "🎵";
  return "📎";
}

function fmtSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

function fmt(value, type) {
  if (value === undefined || value === null || value === "") return "—";
  if (type === "boolean")
    return value === true || value === "true" ? "✓ Yes" : "✗ No";
  if (type === "date") {
    try {
      return new Date(value).toLocaleDateString();
    } catch {
      return value;
    }
  }
  if (type === "file") return null; // handled by FileCell
  return String(value);
}

function FileCell({ fileData }) {
  const [preview, setPreview] = useState(false);

  if (!fileData || !fileData.name)
    return <span className="text-gray-300">—</span>;

  const isImage = fileData.type && fileData.type.startsWith("image/");
  const isPdf = fileData.type === "application/pdf";

  function handleDownload() {
    const a = document.createElement("a");
    a.href = fileData.dataUrl;
    a.download = fileData.name;
    a.click();
  }

  return (
    <>
      <div className="flex items-center gap-1.5">
        <span>{fileIcon(fileData.type)}</span>
        <div className="min-w-0">
          <button
            onClick={() =>
              isImage || isPdf ? setPreview(true) : handleDownload()
            }
            className="text-xs text-blue-500 hover:underline truncate block max-w-[120px] text-left"
            title={fileData.name}
          >
            {fileData.name}
          </button>
          <div className="text-xs text-gray-400">{fmtSize(fileData.size)}</div>
        </div>
      </div>

      {/* ── Popup Modal ── */}
      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setPreview(false)} // click backdrop to close
        >
          <div
            className="relative bg-white rounded-xl shadow-2xl max-w-3xl w-full mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()} // don't close when clicking content
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2 min-w-0">
                <span>{fileIcon(fileData.type)}</span>
                <span className="text-sm font-medium text-gray-700 truncate">
                  {fileData.name}
                </span>
                <span className="text-xs text-gray-400">
                  {fmtSize(fileData.size)}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-3">
                <button
                  onClick={handleDownload}
                  className="text-xs text-blue-500 hover:underline"
                >
                  ⬇ Download
                </button>
                <button
                  onClick={() => setPreview(false)}
                  className="text-gray-400 hover:text-gray-700 text-xl leading-none ml-2"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 flex items-center justify-center bg-gray-50 max-h-[75vh] overflow-auto">
              {isImage ? (
                <img
                  src={fileData.dataUrl}
                  alt={fileData.name}
                  className="max-w-full max-h-[65vh] object-contain rounded"
                />
              ) : isPdf ? (
                <iframe
                  src={fileData.dataUrl}
                  title={fileData.name}
                  className="w-full h-[65vh] rounded border-0"
                />
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
export default function RecordTable({
  module,
  records,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}) {
  const showActions = canEdit || canDelete;

  if (records.length === 0) {
    return (
      <div className="card p-12 text-center">
        <div className="text-4xl mb-3">📋</div>
        <div className="text-gray-500 font-medium">No records found</div>
        <p className="text-xs text-gray-400 mt-1">
          Add a record using the button above
        </p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {module.fields.map((f) => (
                <th
                  key={f.id}
                  className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {f.label}
                  {f.required && <span className="text-red-400 ml-0.5">*</span>}
                </th>
              ))}
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Added
              </th>
              {showActions && (
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {records.map((record) => (
              <tr
                key={record.id}
                className="hover:bg-gray-50 transition-colors"
              >
                {module.fields.map((f) => (
                  <td
                    key={f.id}
                    className="px-4 py-3 text-gray-700 whitespace-nowrap max-w-xs"
                  >
                    {f.type === "file" ? (
                      <FileCell fileData={record.values?.[f.id]} />
                    ) : (
                      <span className="truncate block">
                        {fmt(record.values?.[f.id], f.type)}
                      </span>
                    )}
                  </td>
                ))}
                <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                  {record.createdAt ?? "—"}
                </td>
                {showActions && (
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      {canEdit && (
                        <button
                          onClick={() => onEdit(record)}
                          className="btn-ghost  text-xs py-1 px-2"
                        >
                          Edit
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => onDelete(record.id)}
                          className="btn-danger text-xs py-1 px-2"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-400">
        {records.length} record{records.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
