// ─────────────────────────────────────────────────────────────────────────────
// RMS In-Memory Store  (replaces Spring Boot backend while it's not ready)
// All data lives in JS arrays. Changes are lost on page refresh — that's fine
// for now. Swap each function body with an axios call when backend is ready.
// ─────────────────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

// ── Seed Users ────────────────────────────────────────────────────────────────
let USERS = [
  { id: 'u1', name: 'Admin User',  email: 'admin@rms.com',  password: 'admin123',  role: 'ADMIN',  createdAt: '2025-01-10' },
  { id: 'u2', name: 'Staff User',  email: 'staff@rms.com',  password: 'staff123',  role: 'STAFF',  createdAt: '2025-02-14' },
  { id: 'u3', name: 'View Only',   email: 'viewer@rms.com', password: 'viewer123', role: 'VIEWER', createdAt: '2025-03-01' },
]

// ── Seed Modules ──────────────────────────────────────────────────────────────
let MODULES = [
  {
    id: 'm1',
    name: 'Employee',
    createdAt: '2025-01-15',
    fields: [
      { id: 'f1', label: 'Full Name',   type: 'text',     required: true,  options: [] },
      { id: 'f2', label: 'Department',  type: 'dropdown', required: true,  options: ['HR', 'Engineering', 'Sales', 'Finance'] },
      { id: 'f3', label: 'Email',       type: 'email',    required: true,  options: [] },
      { id: 'f4', label: 'Join Date',   type: 'date',     required: false, options: [] },
      { id: 'f5', label: 'Active',      type: 'boolean',  required: false, options: [] },
    ],
  },
  {
    id: 'm2',
    name: 'Project',
    createdAt: '2025-02-01',
    fields: [
      { id: 'f1', label: 'Project Name', type: 'text',     required: true,  options: [] },
      { id: 'f2', label: 'Status',       type: 'dropdown', required: true,  options: ['Planning', 'Active', 'On Hold', 'Done'] },
      { id: 'f3', label: 'Deadline',     type: 'date',     required: false, options: [] },
      { id: 'f4', label: 'Budget',       type: 'number',   required: false, options: [] },
      { id: 'f5', label: 'Description',  type: 'textarea', required: false, options: [] },
    ],
  },
  {
    id: 'm3',
    name: 'Inventory',
    createdAt: '2025-03-05',
    fields: [
      { id: 'f1', label: 'Item Name',  type: 'text',     required: true,  options: [] },
      { id: 'f2', label: 'Category',   type: 'dropdown', required: true,  options: ['Electronics', 'Furniture', 'Stationery', 'Other'] },
      { id: 'f3', label: 'Quantity',   type: 'number',   required: true,  options: [] },
      { id: 'f4', label: 'In Stock',   type: 'boolean',  required: false, options: [] },
    ],
  },
]

// ── Seed Records ──────────────────────────────────────────────────────────────
let RECORDS = [
  // Employee records
  { id: 'r1', moduleId: 'm1', createdAt: '2025-01-20', createdBy: 'admin@rms.com', values: { f1: 'Priya Sharma',  f2: 'Engineering', f3: 'priya@company.com',  f4: '2023-06-01', f5: true  } },
  { id: 'r2', moduleId: 'm1', createdAt: '2025-01-21', createdBy: 'admin@rms.com', values: { f1: 'Rahul Mehta',   f2: 'HR',          f3: 'rahul@company.com',  f4: '2022-03-15', f5: true  } },
  { id: 'r3', moduleId: 'm1', createdAt: '2025-02-10', createdBy: 'staff@rms.com', values: { f1: 'Anjali Singh',  f2: 'Sales',       f3: 'anjali@company.com', f4: '2024-01-10', f5: true  } },
  { id: 'r4', moduleId: 'm1', createdAt: '2025-02-14', createdBy: 'staff@rms.com', values: { f1: 'Vikram Patel',  f2: 'Finance',     f3: 'vikram@company.com', f4: '2021-09-01', f5: false } },
  // Project records
  { id: 'r5', moduleId: 'm2', createdAt: '2025-02-05', createdBy: 'admin@rms.com', values: { f1: 'RMS Portal',    f2: 'Active',   f3: '2025-06-30', f4: 150000, f5: 'Build the internal records portal' } },
  { id: 'r6', moduleId: 'm2', createdAt: '2025-02-20', createdBy: 'admin@rms.com', values: { f1: 'HR Revamp',     f2: 'Planning', f3: '2025-09-01', f4: 80000,  f5: 'Redesign HR onboarding process'    } },
  { id: 'r7', moduleId: 'm2', createdAt: '2025-03-01', createdBy: 'staff@rms.com', values: { f1: 'Infra Upgrade', f2: 'On Hold',  f3: '2025-12-01', f4: 500000, f5: 'Server and network upgrade'         } },
  // Inventory records
  { id: 'r8', moduleId: 'm3', createdAt: '2025-03-10', createdBy: 'admin@rms.com', values: { f1: 'MacBook Pro',   f2: 'Electronics', f3: 12, f4: true  } },
  { id: 'r9', moduleId: 'm3', createdAt: '2025-03-11', createdBy: 'admin@rms.com', values: { f1: 'Office Chair',  f2: 'Furniture',   f3: 30, f4: true  } },
  { id:'r10', moduleId: 'm3', createdAt: '2025-03-12', createdBy: 'staff@rms.com', values: { f1: 'Sticky Notes',  f2: 'Stationery',  f3: 200,f4: true  } },
]

// ─────────────────────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────────────────────
export const authStore = {
  login(email, password) {
    const user = USERS.find(u => u.email === email && u.password === password)
    if (!user) throw new Error('Invalid email or password')
    const { password: _p, ...safe } = user
    return safe
  },
  register({ name, email, password, role = 'STAFF' }) {
    if (USERS.find(u => u.email === email)) throw new Error('Email already in use')
    const newUser = { id: uid(), name, email, password, role, createdAt: new Date().toISOString().slice(0, 10) }
    USERS.push(newUser)
    const { password: _p, ...safe } = newUser
    return safe
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────────────────────────────────────
export const userStore = {
  getAll() {
    return USERS.map(({ password: _p, ...u }) => u)
  },
  update(id, { name, role }) {
    const i = USERS.findIndex(u => u.id === id)
    if (i === -1) throw new Error('User not found')
    USERS[i] = { ...USERS[i], ...(name && { name }), ...(role && { role }) }
    const { password: _p, ...safe } = USERS[i]
    return safe
  },
  delete(id) {
    USERS = USERS.filter(u => u.id !== id)
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// MODULES
// ─────────────────────────────────────────────────────────────────────────────
export const moduleStore = {
  getAll() {
    return [...MODULES]
  },
  getById(id) {
    const m = MODULES.find(m => m.id === id)
    if (!m) throw new Error('Module not found')
    return { ...m }
  },
  create({ name, fields }) {
    const m = { id: uid(), name, fields, createdAt: new Date().toISOString().slice(0, 10) }
    MODULES.push(m)
    return { ...m }
  },
  update(id, { name, fields }) {
    const i = MODULES.findIndex(m => m.id === id)
    if (i === -1) throw new Error('Module not found')
    MODULES[i] = { ...MODULES[i], ...(name && { name }), ...(fields && { fields }) }
    return { ...MODULES[i] }
  },
  delete(id) {
    MODULES = MODULES.filter(m => m.id !== id)
    // Also delete associated records
    RECORDS = RECORDS.filter(r => r.moduleId !== id)
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// RECORDS
// ─────────────────────────────────────────────────────────────────────────────
export const recordStore = {
  getByModule(moduleId) {
    return RECORDS.filter(r => r.moduleId === moduleId)
  },
  search(moduleId, q) {
    if (!q) return RECORDS.filter(r => r.moduleId === moduleId)
    const lower = q.toLowerCase()
    return RECORDS.filter(r => {
      if (r.moduleId !== moduleId) return false
      return Object.values(r.values).some(v =>
        String(v).toLowerCase().includes(lower)
      )
    })
  },
  create(moduleId, values, createdBy = 'user') {
    const r = {
      id: uid(),
      moduleId,
      values,
      createdAt: new Date().toISOString().slice(0, 10),
      createdBy,
    }
    RECORDS.push(r)
    return { ...r }
  },
  update(id, values) {
    const i = RECORDS.findIndex(r => r.id === id)
    if (i === -1) throw new Error('Record not found')
    RECORDS[i] = { ...RECORDS[i], values: { ...RECORDS[i].values, ...values } }
    return { ...RECORDS[i] }
  },
  delete(id) {
    RECORDS = RECORDS.filter(r => r.id !== id)
  },
  countByModule(moduleId) {
    return RECORDS.filter(r => r.moduleId === moduleId).length
  },
}
