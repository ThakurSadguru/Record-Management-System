import { useState, useEffect } from 'react'
import FieldInput from './FieldInput'
import { useData } from '../../context/DataContext'

export default function DynamicForm({ module, moduleId, initialValues, recordId, onSuccess }) {
  const isEdit = !!recordId
  const { createRecord, updateRecord } = useData()
  const [values, setValues] = useState({})
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setValues(initialValues ?? {})
    setErrors({})
  }, [initialValues, recordId])

  function handleChange(fieldId, value) {
    setValues(p => ({ ...p, [fieldId]: value }))
    setErrors(p => ({ ...p, [fieldId]: null }))
  }

  function validate() {
    const errs = {}
    module.fields.forEach(f => {
      if (f.required && (values[f.id] === undefined || values[f.id] === null || values[f.id] === ''))
        errs[f.id] = `${f.label} is required`
    })
    return errs
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    if (isEdit) updateRecord(recordId, moduleId, values)
    else createRecord(moduleId, values)
    onSuccess?.()
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        {module.fields.map(field => (
          <div key={field.id} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
            <label htmlFor={`field-${field.id}`} className="label">
              {field.label}
              {field.required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            <FieldInput field={field} value={values[field.id]} onChange={handleChange} />
            {errors[field.id] && <p className="text-xs text-red-500 mt-1">{errors[field.id]}</p>}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" className="btn-primary">{isEdit ? 'Update Record' : 'Save Record'}</button>
        <button type="button" onClick={onSuccess} className="btn-secondary">Cancel</button>
      </div>
    </form>
  )
}
