# RMS Frontend (Static / In-Memory Mode)

React 18 + Vite frontend with **no backend required**.
All data lives in memory (resets on page refresh).
When Spring Boot backend is ready, swap `src/data/store.js` calls with axios.

## Quick Start

```bash
npm install
npm run dev
# → http://localhost:5173
```

## Login Credentials

| Role   | Email             | Password   |
|--------|-------------------|------------|
| ADMIN  | admin@rms.com     | admin123   |
| STAFF  | staff@rms.com     | staff123   |
| VIEWER | viewer@rms.com    | viewer123  |

> Quick-login buttons are on the login page — no typing needed.

## Role Permissions

| Action                    | ADMIN | STAFF | VIEWER |
|---------------------------|-------|-------|--------|
| View modules & records    | ✓     | ✓     | ✓      |
| Add & edit records        | ✓     | ✓     | ✗      |
| Create / edit modules     | ✓     | ✗     | ✗      |
| Delete records            | ✓     | ✗     | ✗      |
| Manage users              | ✓     | ✗     | ✗      |

## Seed Data

3 modules pre-loaded: **Employee**, **Project**, **Inventory** — each with sample records.

## How to connect to Spring Boot later

1. Install axios: `npm install axios`
2. Create `src/api/axiosInstance.js` (see previous version)
3. Replace functions in `src/data/store.js` with axios calls
4. Remove `src/context/DataContext.jsx` reactive wrapper — use React Query instead

## Structure

```
src/
├── data/store.js          ← ALL in-memory data + CRUD functions
├── context/
│   ├── AuthContext.jsx    ← login/logout, role helpers
│   └── DataContext.jsx    ← reactive wrapper, provides data to components
├── components/
│   ├── layout/            ← AppLayout, Sidebar, ProtectedRoute
│   ├── dashboard/         ← Dashboard with stats
│   ├── modules/           ← ModuleList, ModuleBuilder, ModuleDetail
│   ├── records/           ← DynamicForm, FieldInput, RecordTable
│   └── users/             ← UserManagement
└── pages/                 ← Login, NotFound
```
