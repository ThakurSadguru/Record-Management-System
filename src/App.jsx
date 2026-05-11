import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import ProtectedRoute from './components/layout/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import Login from './pages/Login'
import Dashboard from './components/dashboard/Dashboard'
import ModuleList from './components/modules/ModuleList'
import ModuleBuilder from './components/modules/ModuleBuilder'
import ModuleDetail from './components/modules/ModuleDetail'
import UserManagement from './components/users/UserManagement'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            {/* DataProvider only mounts when user is logged in */}
            <Route element={<DataProvider><AppLayout /></DataProvider>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard"              element={<Dashboard />} />
              <Route path="/modules"                element={<ModuleList />} />
              <Route path="/modules/new"            element={<ModuleBuilder />} />
              <Route path="/modules/:moduleId"      element={<ModuleDetail />} />
              <Route path="/modules/:moduleId/edit" element={<ModuleBuilder />} />
              <Route path="/users"                  element={<UserManagement />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
