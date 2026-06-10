import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function fmt(value, type) {
  if (value === undefined || value === null || value === "")
    return "";

  if (type === "boolean")
    return value === true || value === "true" ? "Yes" : "No";

  if (type === "date")
    return new Date(value).toLocaleDateString();

  if (type === "file")
    return value?.name || "";

  return String(value);
}

export function exportRecordsToExcel({
  moduleName,
  fields,
  records,
}) {
  const data = records.map((record, index) => {
    const row = {
      SrNo: index + 1,
    };

    fields.forEach((field) => {
      row[field.label] = fmt(
        record.values?.[field.id],
        field.type
      );
    });

    row["Added"] = record.createdAt
      ? new Date(record.createdAt).toLocaleString()
      : "";

    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(data);

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    moduleName
  );

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const file = new Blob(
    [excelBuffer],
    {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }
  );

  saveAs(
    file,
    `${moduleName.replace(/\s+/g, "_")}.xlsx`
  );
}