export default function FieldInput({ field, value, onChange }) {
  const id = `field-${field.id}`
  const base = 'input'

  switch (field.type) {
    case 'text':
      return <input id={id} type="text" className={base} value={value ?? ''} placeholder={field.label}
        onChange={e => onChange(field.id, e.target.value)} />

    case 'number':
      return <input id={id} type="number" className={base} value={value ?? ''} placeholder="0"
        onChange={e => onChange(field.id, e.target.value === '' ? '' : Number(e.target.value))} />

    case 'date':
      return <input id={id} type="date" className={base} value={value ?? ''}
        onChange={e => onChange(field.id, e.target.value)} />

    case 'email':
      return <input id={id} type="email" className={base} value={value ?? ''} placeholder="email@example.com"
        onChange={e => onChange(field.id, e.target.value)} />

    case 'textarea':
      return <textarea id={id} className={`${base} resize-none`} rows={3} value={value ?? ''} placeholder={field.label}
        onChange={e => onChange(field.id, e.target.value)} />

    case 'boolean':
      return (
        <label htmlFor={id} className="flex items-center gap-2 cursor-pointer mt-1">
          <input id={id} type="checkbox" checked={value === true || value === 'true'}
            onChange={e => onChange(field.id, e.target.checked)}
            className="w-4 h-4 rounded accent-green-600" />
          <span className="text-sm text-gray-600">Yes</span>
        </label>
      )

    case 'dropdown':
      return (
        <select id={id} className={base} value={value ?? ''} onChange={e => onChange(field.id, e.target.value)}>
          <option value="">Select…</option>
          {(field.options ?? []).map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      )

    default:
      return <input id={id} type="text" className={base} value={value ?? ''}
        onChange={e => onChange(field.id, e.target.value)} />
  }
}
