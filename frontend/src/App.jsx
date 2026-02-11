import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import Welcome from './components/Welcome'
import Login from './components/Login'
import UserDashboard from './components/UserDashboard'
import SalarySlip from './components/SalarySlip'
import AdminAuth from './components/AdminAuth'
import AdminDashboard from './components/AdminDashboard'

function AdminRoute({ children }) {
  const { isAdminAuthorized } = useApp()
  return isAdminAuthorized ? children : <AdminAuth />
}

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/user" element={<UserDashboard />} />
          <Route path="/salary" element={<SalarySlip />} />
          <Route
            path="/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  )
}

export default App
