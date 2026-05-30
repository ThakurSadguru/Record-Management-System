export default function FieldInput({ field, value, onChange, isDark = false }) {
  const id = `field-${field.id}`;

  const base = {
    width: "100%",
    boxSizing: "border-box",
    padding: "9px 12px",
    borderRadius: 8,
    fontSize: 13,
    background: isDark ? "rgba(255,255,255,0.06)" : "#ffffff",
    border: `1.5px solid ${isDark ? "rgba(255,255,255,0.12)" : "#e2e8f0"}`,
    color: isDark ? "#ffffff" : "#0f172a",
    outline: "none",
    transition: "border-color 0.15s",
  };

  const focusIn = (e) =>
    (e.target.style.borderColor = isDark ? "#4B9FFF" : "#2563eb");
  const focusOut = (e) =>
    (e.target.style.borderColor = isDark
      ? "rgba(255,255,255,0.12)"
      : "#e2e8f0");

  switch (field.type) {
    case "text":
      return (
        <input
          id={id}
          type="text"
          style={base}
          value={value ?? ""}
          placeholder={field.label}
          onChange={(e) => onChange(field.id, e.target.value)}
          onFocus={focusIn}
          onBlur={focusOut}
        />
      );

    case "number":
      return (
        <input
          id={id}
          type="number"
          style={base}
          value={value ?? ""}
          placeholder="0"
          onChange={(e) =>
            onChange(
              field.id,
              e.target.value === "" ? "" : Number(e.target.value),
            )
          }
          onFocus={focusIn}
          onBlur={focusOut}
        />
      );

    case "date":
      return (
        <input
          id={id}
          type="date"
          style={{ ...base, colorScheme: isDark ? "dark" : "light" }}
          value={value ?? ""}
          onChange={(e) => onChange(field.id, e.target.value)}
          onFocus={focusIn}
          onBlur={focusOut}
        />
      );

    case "email":
      return (
        <input
          id={id}
          type="email"
          style={base}
          value={value ?? ""}
          placeholder="email@example.com"
          onChange={(e) => onChange(field.id, e.target.value)}
          onFocus={focusIn}
          onBlur={focusOut}
        />
      );

    case "textarea":
      return (
        <textarea
          id={id}
          rows={3}
          style={{ ...base, resize: "none" }}
          value={value ?? ""}
          placeholder={field.label}
          onChange={(e) => onChange(field.id, e.target.value)}
          onFocus={focusIn}
          onBlur={focusOut}
        />
      );

    case "boolean":
      return (
        <label
          htmlFor={id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
            marginTop: 4,
          }}
        >
          <input
            id={id}
            type="checkbox"
            checked={value === true || value === "true"}
            onChange={(e) => onChange(field.id, e.target.checked)}
            style={{
              width: 16,
              height: 16,
              accentColor: "#16a34a",
              cursor: "pointer",
            }}
          />
          <span
            style={{
              fontSize: 13,
              color: isDark ? "rgba(255,255,255,0.7)" : "#475569",
            }}
          >
            Yes
          </span>
        </label>
      );

    case "dropdown":
      return (
        <select
          id={id}
          style={{ ...base, cursor: "pointer" }}
          value={value ?? ""}
          onChange={(e) => onChange(field.id, e.target.value)}
          onFocus={focusIn}
          onBlur={focusOut}
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 14px",
              borderRadius: 9,
              background: isDark ? "rgba(34,197,94,0.08)" : "#f0fdf4",
              border: `1.5px solid ${isDark ? "rgba(34,197,94,0.2)" : "#bbf7d0"}`,
            }}
          >
            <span style={{ fontSize: 20, flexShrink: 0 }}>
              {fileIcon(fileData.type)}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: isDark ? "#fff" : "#0f172a",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {fileData.name}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: isDark ? "rgba(255,255,255,0.4)" : "#64748b",
                  marginTop: 2,
                }}
              >
                {fmtSize(fileData.size)}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexShrink: 0,
              }}
            >
              {fileData.type?.startsWith("image/") ? (
                <a
                  href={fileData.dataUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    fontSize: 12,
                    color: isDark ? "#4B9FFF" : "#2563eb",
                    textDecoration: "underline",
                  }}
                >
                  View
                </a>
              ) : (
                <a
                  href={fileData.dataUrl}
                  download={fileData.name}
                  style={{
                    fontSize: 12,
                    color: isDark ? "#4B9FFF" : "#2563eb",
                    textDecoration: "underline",
                  }}
                >
                  Download
                </a>
              )}
              <button
                type="button"
                onClick={clearFile}
                title="Remove"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 20,
                  lineHeight: 1,
                  padding: 0,
                  color: isDark ? "rgba(255,255,255,0.3)" : "#cbd5e1",
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = isDark
                    ? "rgba(255,255,255,0.3)"
                    : "#cbd5e1")
                }
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
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "28px 20px",
            border: `2px dashed ${isDark ? "rgba(255,255,255,0.12)" : "#e2e8f0"}`,
            borderRadius: 10,
            cursor: "pointer",
            background: isDark ? "rgba(255,255,255,0.02)" : "#f8fafc",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = isDark
              ? "rgba(74,159,255,0.4)"
              : "#93c5fd";
            e.currentTarget.style.background = isDark
              ? "rgba(74,159,255,0.05)"
              : "#eff6ff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = isDark
              ? "rgba(255,255,255,0.12)"
              : "#e2e8f0";
            e.currentTarget.style.background = isDark
              ? "rgba(255,255,255,0.02)"
              : "#f8fafc";
          }}
        >
          <span style={{ fontSize: 24, opacity: 0.5 }}>📎</span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: isDark ? "rgba(255,255,255,0.5)" : "#64748b",
            }}
          >
            Click to upload any file
          </span>
          <span
            style={{
              fontSize: 11,
              color: isDark ? "rgba(255,255,255,0.25)" : "#94a3b8",
            }}
          >
            PDF, image, Word, Excel, video, zip…
          </span>
          <input
            id={id}
            type="file"
            accept="*/*"
            style={{ display: "none" }}
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
          style={base}
          value={value ?? ""}
          onChange={(e) => onChange(field.id, e.target.value)}
          onFocus={focusIn}
          onBlur={focusOut}
        />
      );
  }
}
