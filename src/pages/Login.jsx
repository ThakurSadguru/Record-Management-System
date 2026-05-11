import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const DEMO_ACCOUNTS = [
  { role: 'ADMIN',  email: 'admin@rms.com',  password: 'admin123',  color: 'purple' },
  { role: 'STAFF',  email: 'staff@rms.com',  password: 'staff123',  color: 'blue'   },
  { role: 'VIEWER', email: 'viewer@rms.com', password: 'viewer123', color: 'gray'   },
]

const roleColors = {
  purple: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100',
  blue:   'bg-blue-50   border-blue-200   text-blue-700   hover:bg-blue-100',
  gray:   'bg-gray-50   border-gray-200   text-gray-600   hover:bg-gray-100',
}

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    login(email, password)
  }

  function quickLogin(account) {
    login(account.email, account.password)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-green-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg">R</div>
          <h1 className="text-2xl font-bold text-gray-900">RMS</h1>
          <p className="text-sm text-gray-500 mt-1">Record Management System</p>
        </div>

        {/* Form */}
        <div className="card p-7">
          <h2 className="text-base font-semibold text-gray-800 mb-5">Sign in</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn-primary w-full justify-center py-2.5 mt-1">
              Sign in
            </button>
          </form>

          {/* Quick login demo cards */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-400 mb-3 text-center uppercase tracking-wider">
              Quick login (demo accounts)
            </p>
            <div className="space-y-2">
              {DEMO_ACCOUNTS.map(a => (
                <button
                  key={a.role}
                  onClick={() => quickLogin(a)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm transition-all ${roleColors[a.color]}`}
                >
                  <div className="text-left">
                    <div className="font-medium">{a.role}</div>
                    <div className="text-xs opacity-70">{a.email}</div>
                  </div>
                  <div className="text-xs opacity-60 font-mono">{a.password}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-5">
          Data is temporary — resets on page refresh
        </p>
      </div>
    </div>
  )
}
