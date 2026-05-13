export default function FieldInput({ field, value, onChange }) {
  const id = `field-${field.id}`;
  const base = "input";

  switch (field.type) {
    case "text":
      return (
        <input
          id={id}
          type="text"
          className={base}
          value={value ?? ""}
          placeholder={field.label}
          onChange={(e) => onChange(field.id, e.target.value)}
        />
      );

    case "number":
      return (
        <input
          id={id}
          type="number"
          className={base}
          value={value ?? ""}
          placeholder="0"
          onChange={(e) =>
            onChange(
              field.id,
              e.target.value === "" ? "" : Number(e.target.value),
            )
          }
        />
      );

    case "date":
      return (
        <input
          id={id}
          type="date"
          className={base}
          value={value ?? ""}
          onChange={(e) => onChange(field.id, e.target.value)}
        />
      );

    case "email":
      return (
        <input
          id={id}
          type="email"
          className={base}
          value={value ?? ""}
          placeholder="email@example.com"
          onChange={(e) => onChange(field.id, e.target.value)}
        />
      );

    case "textarea":
      return (
        <textarea
          id={id}
          className={`${base} resize-none`}
          rows={3}
          value={value ?? ""}
          placeholder={field.label}
          onChange={(e) => onChange(field.id, e.target.value)}
        />
      );

    case "boolean":
      return (
        <label
          htmlFor={id}
          className="flex items-center gap-2 cursor-pointer mt-1"
        >
          <input
            id={id}
            type="checkbox"
            checked={value === true || value === "true"}
            onChange={(e) => onChange(field.id, e.target.checked)}
            className="w-4 h-4 rounded accent-green-600"
          />
          <span className="text-sm text-gray-600">Yes</span>
        </label>
      );

    case "dropdown":
      return (
        <select
          id={id}
          className={base}
          value={value ?? ""}
          onChange={(e) => onChange(field.id, e.target.value)}
        >
          <option value="">Select…</option>
          {(field.options ?? []).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      );

    case "file": {
      const fileData = value ?? null;

      function handleFile(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          onChange(field.id, {
            name: file.name,
            size: file.size,
            type: file.type,
            dataUrl: ev.target.result,
          });
        };
        reader.readAsDataURL(file);
      }

      function clearFile() {
        onChange(field.id, null);
        const input = document.getElementById(id);
        if (input) input.value = "";
      }

      function fmtSize(bytes) {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / 1048576).toFixed(1) + " MB";
      }

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

      if (fileData) {
        return (
          <div className="flex items-center gap-3 px-3 py-2.5 border border-green-200 bg-green-50 rounded-lg">
            <span className="text-xl shrink-0">{fileIcon(fileData.type)}</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-gray-800 truncate">
                {fileData.name}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                {fmtSize(fileData.size)}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {fileData.type && fileData.type.startsWith("image/") ? (
                <a
                  href={fileData.dataUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-500 hover:underline"
                >
                  View
                </a>
              ) : (
                <a
                  href={fileData.dataUrl}
                  download={fileData.name}
                  className="text-xs text-blue-500 hover:underline"
                >
                  Download
                </a>
              )}
              <button
                type="button"
                onClick={clearFile}
                className="text-gray-300 hover:text-red-500 text-lg leading-none transition-colors"
                title="Remove"
              >
                ×
              </button>
            </div>
          </div>
        );
      }

      return (
        <label
          htmlFor={id}
          className="flex flex-col items-center justify-center gap-1.5 px-4 py-6 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-green-400 hover:bg-green-50 transition-all group"
        >
          <span className="text-2xl group-hover:scale-110 transition-transform">
            📎
          </span>
          <span className="text-xs font-medium text-gray-500">
            Click to upload any file
          </span>
          <span className="text-xs text-gray-400">
            PDF, image, Word, Excel, video, zip…
          </span>
          <input
            id={id}
            type="file"
            accept="*/*"
            className="hidden"
            onChange={handleFile}
          />
        </label>
      );
    }

    default:
      return (
        <input
          id={id}
          type="text"
          className={base}
          value={value ?? ""}
          onChange={(e) => onChange(field.id, e.target.value)}
        />
      );
  }
}
