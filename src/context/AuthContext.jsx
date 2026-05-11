import { createContext, useContext, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { authStore } from '../data/store'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const navigate = useNavigate()

  // Persist across refresh via sessionStorage (lost on tab close — fine for dev)
  const [user, setUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('rms_user')) } catch { return null }
  })

  const login = useCallback((email, password) => {
    try {
      const u = authStore.login(email, password)
      sessionStorage.setItem('rms_user', JSON.stringify(u))
      setUser(u)
      navigate('/dashboard')
      toast.success(`Welcome, ${u.name}!`)
    } catch (err) {
      toast.error(err.message)
    }
  }, [navigate])

  const logout = useCallback(() => {
    sessionStorage.removeItem('rms_user')
    setUser(null)
    navigate('/login')
  }, [navigate])

  const isAdmin  = user?.role === 'ADMIN'
  const isStaff  = user?.role === 'STAFF' || user?.role === 'ADMIN'
  const isViewer = !!user

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isStaff, isViewer }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
