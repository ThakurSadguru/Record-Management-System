import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function fmt(value, type) {
  if (value === undefined || value === null || value === "") return "—";
  if (type === "boolean") return value === true || value === "true" ? "Yes" : "No";
  if (type === "date") {
    try { return new Date(value).toLocaleDateString(); } catch { return value; }
  }
  if (type === "file") return value?.name ?? "—";
  return String(value);
}

export function exportRecordsToPdf({ moduleName, fields, records }) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  // ── Header ──
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(moduleName, 14, 18);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Exported on ${new Date().toLocaleString()} · ${records.length} record${records.length !== 1 ? "s" : ""}`,
    14, 25
  );

  // ── Table ──
  const columns = [
    { header: "#", dataKey: "_idx" },
    ...fields.map((f) => ({ header: f.label, dataKey: f.id })),
    { header: "Added", dataKey: "_createdAt" },
  ];

  const rows = records.map((r, i) => {
    const row = { _idx: i + 1 };
    fields.forEach((f) => { row[f.id] = fmt(r.values?.[f.id], f.type); });
    row._createdAt = r.createdAt
      ? new Date(r.createdAt).toLocaleDateString()
      : "—";
    return row;
  });

  autoTable(doc, {
  startY: 30,
  columns,
  body: rows,

  theme: "grid",

  styles: {
    fontSize: 7,
    cellPadding: 2,
    overflow: "hidden",
    valign: "middle",
  },

  headStyles: {
    fillColor: [37, 99, 235],
    textColor: 255,
    fontStyle: "bold",
    fontSize: 7,
    halign: "center",
  },

  alternateRowStyles: {
    fillColor: [248, 250, 252],
  },

  columnStyles: {
    _idx: {
      cellWidth: 8,
      halign: "center",
    },

    _createdAt: {
      cellWidth: 18,
    },
  },

  margin: {
    left: 8,
    right: 8,
  },

  tableWidth: "auto",

  didParseCell: function (data) {
    if (typeof data.cell.raw === "string") {

      // limit long text
      if (data.cell.raw.length > 20) {
        data.cell.text = [
          data.cell.raw.substring(0, 20) + "..."
        ];
      }
    }
  },
});

  // ── Footer ──
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: "center" }
    );
  }

  doc.save(`${moduleName.replace(/\s+/g, "_")}_records.pdf`);
}

export function exportSingleRecordToPdf({ moduleName, fields, record }) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(moduleName, 14, 20);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(`Record · Exported ${new Date().toLocaleString()}`, 14, 27);

  // Draw a card-style layout
  let y = 36;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(14, y - 4, 182, fields.length * 12 + 8, 3, 3, "S");

  fields.forEach((f, i) => {
    const val = fmt(record.values?.[f.id], f.type);
    const rowY = y + i * 12;

    // Alternate row bg
    if (i % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, rowY - 4, 182, 12, "F");
    }

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(71, 85, 105);
    doc.text(f.label.toUpperCase(), 18, rowY + 3);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    doc.text(val, 80, rowY + 3, { maxWidth: 112 });
  });

  doc.save(`${moduleName}_record_${record.id?.slice(-6) ?? "export"}.pdf`);
}