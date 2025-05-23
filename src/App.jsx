import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import AdminLogin from './pages/AdminLogin'
import Dashboard from './pages/Dashboard'
import UserManagement from './pages/UserManagement'
import NotFound from './pages/NotFound'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/users" element={
        <AdminRoute>
          <UserManagement />
        </AdminRoute>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App