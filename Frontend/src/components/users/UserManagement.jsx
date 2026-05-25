import { useState } from 'react'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'

const ROLES = ['ADMIN', 'STAFF', 'VIEWER']
const roleCls = { ADMIN: 'bg-purple-100 text-purple-700', STAFF: 'bg-blue-100 text-blue-700', VIEWER: 'bg-gray-100 text-gray-600' }

export default function UserManagement() {
  const { user: me } = useAuth()
  const { users, updateUser, deleteUser } = useData()
  const [editId, setEditId]     = useState(null)
  const [editRole, setEditRole] = useState('')

  function startEdit(u) { setEditId(u.id); setEditRole(u.role) }
  function cancelEdit() { setEditId(null); setEditRole('') }

  function saveEdit(id) {
    updateUser(id, { role: editRole })
    cancelEdit()
  }

  function handleDelete(u) {
    if (u.email === me?.email) return alert("You can't delete yourself.")
    if (window.confirm(`Remove user "${u.name}"?`)) deleteUser(u.id)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-sm text-gray-500 mt-0.5">{users.length} registered users</p>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {['Name', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                <th key={h} className={`px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold shrink-0">
                      {u.name?.[0]?.toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-900">{u.name}</span>
                    {u.email === me?.email && <span className="badge bg-gray-100 text-gray-500">You</span>}
                  </div>
                </td>
                <td className="px-5 py-3 text-gray-500">{u.email}</td>
                <td className="px-5 py-3">
                  {editId === u.id
                    ? <select className="input py-1 text-xs w-28" value={editRole} onChange={e => setEditRole(e.target.value)}>
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    : <span className={`badge ${roleCls[u.role] ?? ''}`}>{u.role}</span>
                  }
                </td>
                <td className="px-5 py-3 text-gray-400 text-xs">{u.createdAt}</td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {editId === u.id ? (
                      <>
                        <button onClick={() => saveEdit(u.id)} className="btn-primary text-xs py-1 px-2">Save</button>
                        <button onClick={cancelEdit} className="btn-secondary text-xs py-1 px-2">Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(u)} className="btn-ghost text-xs py-1 px-2">Edit</button>
                        <button onClick={() => handleDelete(u)} disabled={u.email === me?.email}
                          className="btn-danger text-xs py-1 px-2 disabled:opacity-30">Remove</button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
