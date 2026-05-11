import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { recordStore } from '../../data/store'

export default function ModuleList() {
  const { modules, deleteModule } = useData()
  const { isAdmin } = useAuth()
  const navigate = useNavigate()

  function handleDelete(m) {
    if (window.confirm(`Delete module "${m.name}"? All records will also be deleted.`))
      deleteModule(m.id)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Modules</h1>
          <p className="text-sm text-gray-500 mt-0.5">{modules.length} module{modules.length !== 1 ? 's' : ''}</p>
        </div>
        {isAdmin && <Link to="/modules/new" className="btn-primary">+ New Module</Link>}
      </div>

      {modules.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-5xl mb-4">📦</div>
          <div className="text-gray-600 font-medium text-lg">No modules yet</div>
          {isAdmin && <Link to="/modules/new" className="btn-primary inline-flex mt-4">Create Module</Link>}
        </div>
      ) : (
        <div className="space-y-2">
          {modules.map(m => (
            <div key={m.id} className="card p-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-green-100 text-green-700 font-bold flex items-center justify-center shrink-0">
                {m.name[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900">{m.name}</div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {m.fields.length} fields · {recordStore.countByModule(m.id)} records
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => navigate(`/modules/${m.id}`)} className="btn-secondary text-xs py-1.5 px-3">
                  View records
                </button>
                {isAdmin && (
                  <>
                    <button onClick={() => navigate(`/modules/${m.id}/edit`)} className="btn-ghost text-xs py-1.5 px-3">Edit</button>
                    <button onClick={() => handleDelete(m)} className="btn-danger text-xs py-1.5 px-3">Delete</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
