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
  if (type === "file") return null;
  return String(value);
}

function FileCell({ fileData, isDark }) {
  const [preview, setPreview] = useState(false);
  if (!fileData || !fileData.name)
    return (
      <span style={{ color: isDark ? "rgba(255,255,255,0.2)" : "#cbd5e1" }}>
        —
      </span>
    );

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
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span>{fileIcon(fileData.type)}</span>
        <div style={{ minWidth: 0 }}>
          <button
            onClick={() =>
              isImage || isPdf ? setPreview(true) : handleDownload()
            }
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              fontSize: 12,
              color: isDark ? "#4B9FFF" : "#2563eb",
              textDecoration: "underline",
              display: "block",
              maxWidth: 120,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              textAlign: "left",
            }}
            title={fileData.name}
          >
            {fileData.name}
          </button>
          <div
            style={{
              fontSize: 11,
              color: isDark ? "rgba(255,255,255,0.3)" : "#94a3b8",
            }}
          >
            {fmtSize(fileData.size)}
          </div>
        </div>
      </div>

      {preview && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(4px)",
          }}
          onClick={() => setPreview(false)}
        >
          <div
            style={{
              position: "relative",
              background: "#fff",
              borderRadius: 14,
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              maxWidth: 760,
              width: "calc(100% - 32px)",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  minWidth: 0,
                }}
              >
                <span>{fileIcon(fileData.type)}</span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#1e293b",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {fileData.name}
                </span>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>
                  {fmtSize(fileData.size)}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  flexShrink: 0,
                  marginLeft: 12,
                }}
              >
                <button
                  onClick={handleDownload}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 12,
                    color: "#2563eb",
                  }}
                >
                  ⬇ Download
                </button>
                <button
                  onClick={() => setPreview(false)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 22,
                    color: "#94a3b8",
                    lineHeight: 1,
                    padding: 0,
                  }}
                >
                  ×
                </button>
              </div>
            </div>
            <div
              style={{
                padding: 16,
                background: "#f8fafc",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                maxHeight: "75vh",
                overflow: "auto",
              }}
            >
              {isImage ? (
                <img
                  src={fileData.dataUrl}
                  alt={fileData.name}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "65vh",
                    objectFit: "contain",
                    borderRadius: 8,
                  }}
                />
              ) : isPdf ? (
                <iframe
                  src={fileData.dataUrl}
                  title={fileData.name}
                  style={{
                    width: "100%",
                    height: "65vh",
                    border: "none",
                    borderRadius: 8,
                  }}
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
  isDark = false,
}) {
  const showActions = canEdit || canDelete;

  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "#ffffff";
  const cardBorder = isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0";
  const headerBg = isDark ? "rgba(255,255,255,0.04)" : "#f8fafc";
  const headerText = isDark ? "rgba(255,255,255,0.4)" : "#64748b";
  const rowHoverBg = isDark ? "rgba(255,255,255,0.03)" : "#f8fafc";
  const rowDivider = isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9";
  const cellText = isDark ? "rgba(255,255,255,0.85)" : "#1e293b";
  const cellMuted = isDark ? "rgba(255,255,255,0.3)" : "#94a3b8";
  const footerBg = isDark ? "rgba(255,255,255,0.02)" : "#f8fafc";
  const requiredDot = isDark ? "#f87171" : "#ef4444";

  if (records.length === 0) {
    return (
      <div
        style={{
          background: cardBg,
          border: `1.5px solid ${cardBorder}`,
          borderRadius: 14,
          padding: "60px 20px",
          textAlign: "center",
          boxShadow: isDark ? "none" : "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
        <div
          style={{
            color: isDark ? "rgba(255,255,255,0.5)" : "#475569",
            fontWeight: 600,
            fontSize: 15,
          }}
        >
          No records found
        </div>
        <p
          style={{
            fontSize: 12,
            color: isDark ? "rgba(255,255,255,0.25)" : "#94a3b8",
            marginTop: 6,
          }}
        >
          Add a record using the button above
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: cardBg,
        border: `1.5px solid ${cardBorder}`,
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: isDark ? "none" : "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      <div style={{ overflowX: "auto" }}>
        <table
          style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
        >
          <thead>
            <tr
              style={{
                borderBottom: `1.5px solid ${cardBorder}`,
                background: headerBg,
              }}
            >
              {module.fields.map((f) => (
                <th
                  key={f.id}
                  style={{
                    textAlign: "left",
                    padding: "12px 16px",
                    fontSize: 11,
                    fontWeight: 700,
                    color: headerText,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {f.label}
                  {f.required && (
                    <span style={{ color: requiredDot, marginLeft: 2 }}>*</span>
                  )}
                </th>
              ))}
              <th
                style={{
                  textAlign: "left",
                  padding: "12px 16px",
                  fontSize: 11,
                  fontWeight: 700,
                  color: headerText,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  whiteSpace: "nowrap",
                }}
              >
                Added
              </th>
              {showActions && (
                <th
                  style={{
                    textAlign: "right",
                    padding: "12px 16px",
                    fontSize: 11,
                    fontWeight: 700,
                    color: headerText,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                  }}
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {records.map((record, idx) => (
              <tr
                key={record.id}
                style={{
                  borderBottom:
                    idx < records.length - 1
                      ? `1px solid ${rowDivider}`
                      : "none",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = rowHoverBg)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                {module.fields.map((f) => (
                  <td
                    key={f.id}
                    style={{
                      padding: "12px 16px",
                      color: cellText,
                      whiteSpace: "nowrap",
                      maxWidth: 200,
                    }}
                  >
                    {f.type === "file" ? (
                      <FileCell
                        fileData={record.values?.[f.id]}
                        isDark={isDark}
                      />
                    ) : (
                      <span
                        style={{
                          display: "block",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          color:
                            fmt(record.values?.[f.id], f.type) === "—"
                              ? cellMuted
                              : cellText,
                        }}
                      >
                        {fmt(record.values?.[f.id], f.type)}
                      </span>
                    )}
                  </td>
                ))}
                <td
                  style={{
                    padding: "12px 16px",
                    color: cellMuted,
                    fontSize: 12,
                    whiteSpace: "nowrap",
                  }}
                >
                  {record.createdAt
                    ? new Date(record.createdAt).toLocaleString()
                    : "—"}
                </td>
                {showActions && (
                  <td
                    style={{
                      padding: "12px 16px",
                      textAlign: "right",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        gap: 6,
                      }}
                    >
                      {canEdit && (
                        <button
                          onClick={() => onEdit(record)}
                          style={{
                            padding: "5px 12px",
                            borderRadius: 7,
                            cursor: "pointer",
                            fontSize: 12,
                            fontWeight: 600,
                            background: isDark
                              ? "rgba(255,255,255,0.06)"
                              : "#f1f5f9",
                            border: isDark
                              ? "1px solid rgba(255,255,255,0.12)"
                              : "1.5px solid #e2e8f0",
                            color: isDark
                              ? "rgba(255,255,255,0.75)"
                              : "#334155",
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
                          Edit
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => onDelete(record.id)}
                          style={{
                            padding: "5px 12px",
                            borderRadius: 7,
                            cursor: "pointer",
                            fontSize: 12,
                            fontWeight: 600,
                            background: isDark
                              ? "rgba(239,68,68,0.1)"
                              : "#fef2f2",
                            border: isDark
                              ? "1px solid rgba(239,68,68,0.2)"
                              : "1.5px solid #fecaca",
                            color: isDark ? "#f87171" : "#dc2626",
                            transition: "all 0.15s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = isDark
                              ? "rgba(239,68,68,0.2)"
                              : "#fee2e2";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = isDark
                              ? "rgba(239,68,68,0.1)"
                              : "#fef2f2";
                          }}
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
      <div
        style={{
          padding: "10px 16px",
          borderTop: `1px solid ${rowDivider}`,
          background: footerBg,
          fontSize: 12,
          color: cellMuted,
        }}
      >
        {records.length} record{records.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
