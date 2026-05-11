function fmt(value, type) {
  if (value === undefined || value === null || value === '') return '—'
  if (type === 'boolean') return value === true || value === 'true' ? '✓ Yes' : '✗ No'
  if (type === 'date') { try { return new Date(value).toLocaleDateString() } catch { return value } }
  return String(value)
}

export default function RecordTable({ module, records, onEdit, onDelete, canEdit, canDelete }) {
  const showActions = canEdit || canDelete

  if (records.length === 0) {
    return (
      <div className="card p-12 text-center">
        <div className="text-4xl mb-3">📋</div>
        <div className="text-gray-500 font-medium">No records found</div>
        <p className="text-xs text-gray-400 mt-1">Add a record using the button above</p>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {module.fields.map(f => (
                <th key={f.id} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  {f.label}{f.required && <span className="text-red-400 ml-0.5">*</span>}
                </th>
              ))}
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Added</th>
              {showActions && <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {records.map(record => (
              <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                {module.fields.map(f => (
                  <td key={f.id} className="px-4 py-3 text-gray-700 whitespace-nowrap max-w-xs truncate">
                    {fmt(record.values?.[f.id], f.type)}
                  </td>
                ))}
                <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                  {record.createdAt ?? '—'}
                </td>
                {showActions && (
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      {canEdit   && <button onClick={() => onEdit(record)}     className="btn-ghost  text-xs py-1 px-2">Edit</button>}
                      {canDelete && <button onClick={() => onDelete(record.id)} className="btn-danger text-xs py-1 px-2">Delete</button>}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-400">
        {records.length} record{records.length !== 1 ? 's' : ''}
      </div>
    </div>
  )
}
