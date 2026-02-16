// import { useState } from 'react'
// import { useApp } from '../context/AppContext'

// export default function AdminAuth() {
//   const { isAdminAuthorized, setIsAdminAuthorized } = useApp()
//   const [passwordInput, setPasswordInput] = useState('')
//   const [authError, setAuthError] = useState('')
//   const requiredPassword = import.meta.env.VITE_DASHBOARD_PASSWORD || 'ciomogul'

//   const handlePasswordSubmit = (event) => {
//     event.preventDefault()
//     if (passwordInput === requiredPassword) {
//       localStorage.setItem('ciomogul_admin_ok', 'true')
//       setIsAdminAuthorized(true)
//       setAuthError('')
//       return
//     }
//     setAuthError('Incorrect password. Please try again.')
//   }

//   return (
//     <div className="min-h-screen p-6 md:p-10">
//       <div className="mx-auto max-w-lg">
//         <div className="glass-panel rounded-3xl p-8 shadow-lift">
//           <p className="text-sm uppercase tracking-[0.3em] text-ink-300">CIO Mogul</p>
//           <h1 className="section-title mt-3">Dashboard Access</h1>
//           <p className="mt-2 text-sm text-ink-300">Enter the admin password to continue.</p>
//           <form className="mt-6 space-y-4" onSubmit={handlePasswordSubmit}>
//             <input
//               className="input-field"
//               type="password"
//               placeholder="Admin password"
//               value={passwordInput}
//               onChange={(event) => setPasswordInput(event.target.value)}
//             />
//             {authError && <p className="text-sm text-red-500">{authError}</p>}
//             <button className="w-full rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow">
//               Enter Dashboard
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   )
// }

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { apiService } from '../utils/api'

export default function AdminAuth() {
  const navigate = useNavigate()
  const { setIsAdminAuthorized } = useApp()

  const [employeeId, setEmployeeId] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setAuthError('')
    setLoading(true)

    try {
      const data = await apiService.login(employeeId, password)

      if (data.user?.role !== 'ADMIN') {
        throw new Error('Access denied. Not an admin.')
      }

      setIsAdminAuthorized(true)
      navigate('/dashboard')
    } catch (err) {
      setAuthError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-lg">
        <div className="glass-panel rounded-3xl p-8 shadow-lift">
          <p className="text-sm uppercase tracking-[0.3em] text-ink-300">
            CIO Mogul
          </p>
          <h1 className="section-title mt-3">Admin Login</h1>
          <p className="mt-2 text-sm text-ink-300">
            Sign in using your Employee ID and password.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleLogin}>
            <input
              className="input-field"
              placeholder="Employee ID"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              required
            />

            <input
              className="input-field"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {authError && (
              <p className="text-sm text-red-500">{authError}</p>
            )}

            <button
              disabled={loading}
              className="w-full rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Enter Dashboard'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
