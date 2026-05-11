// DataContext — wraps the in-memory store and provides reactive state.
// When backend is ready, replace store calls with axios calls here.
// Components don't need to change at all.

import { createContext, useContext, useState, useCallback } from 'react'
import { moduleStore, recordStore, userStore } from '../data/store'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const { user } = useAuth()

  // ── Modules ──────────────────────────────────────────────────────────────
  const [modules, setModules] = useState(() => moduleStore.getAll())

  const refreshModules = useCallback(() => {
    setModules(moduleStore.getAll())
  }, [])

  const createModule = useCallback((data) => {
    const m = moduleStore.create(data)
    refreshModules()
    toast.success('Module created!')
    return m
  }, [refreshModules])

  const updateModule = useCallback((id, data) => {
    const m = moduleStore.update(id, data)
    refreshModules()
    toast.success('Module updated!')
    return m
  }, [refreshModules])

  const deleteModule = useCallback((id) => {
    moduleStore.delete(id)
    refreshModules()
    refreshRecords()          // records for that module also gone
    toast.success('Module deleted')
  }, []) // eslint-disable-line

  // ── Records ───────────────────────────────────────────────────────────────
  const [recordsMap, setRecordsMap] = useState({}) // { moduleId: [...] }

  const refreshRecords = useCallback((moduleId) => {
    if (moduleId) {
      setRecordsMap(prev => ({
        ...prev,
        [moduleId]: recordStore.getByModule(moduleId),
      }))
    } else {
      // Refresh all loaded modules
      setRecordsMap(prev => {
        const next = {}
        Object.keys(prev).forEach(mid => { next[mid] = recordStore.getByModule(mid) })
        return next
      })
    }
  }, [])

  const loadRecords = useCallback((moduleId) => {
    setRecordsMap(prev => ({
      ...prev,
      [moduleId]: recordStore.getByModule(moduleId),
    }))
  }, [])

  const searchRecords = useCallback((moduleId, q) => {
    return recordStore.search(moduleId, q)
  }, [])

  const createRecord = useCallback((moduleId, values) => {
    const r = recordStore.create(moduleId, values, user?.email)
    refreshRecords(moduleId)
    toast.success('Record saved!')
    return r
  }, [user, refreshRecords])

  const updateRecord = useCallback((id, moduleId, values) => {
    const r = recordStore.update(id, values)
    refreshRecords(moduleId)
    toast.success('Record updated!')
    return r
  }, [refreshRecords])

  const deleteRecord = useCallback((id, moduleId) => {
    recordStore.delete(id)
    refreshRecords(moduleId)
    toast.success('Record deleted')
  }, [refreshRecords])

  // ── Users ─────────────────────────────────────────────────────────────────
  const [users, setUsers] = useState(() => userStore.getAll())

  const refreshUsers = useCallback(() => setUsers(userStore.getAll()), [])

  const updateUser = useCallback((id, data) => {
    userStore.update(id, data)
    refreshUsers()
    toast.success('User updated!')
  }, [refreshUsers])

  const deleteUser = useCallback((id) => {
    userStore.delete(id)
    refreshUsers()
    toast.success('User removed')
  }, [refreshUsers])

  return (
    <DataContext.Provider value={{
      // modules
      modules, createModule, updateModule, deleteModule,
      // records
      recordsMap, loadRecords, searchRecords,
      createRecord, updateRecord, deleteRecord,
      // users
      users, updateUser, deleteUser,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be inside DataProvider')
  return ctx
}
