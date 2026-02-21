import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/useApp'
import { apiService } from '../utils/api'

export default function AdminAuth() {
  const navigate = useNavigate()
  const { setIsAdminAuthorized, setLoggedUser, setLoggedUserId } = useApp()

  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setAuthError('')
    setLoading(true)

    try {
      const data = await apiService.adminPasswordLogin(password)

      if (data.user?.role !== 'ADMIN') {
        throw new Error('Access denied. Not an admin.')
      }

      setLoggedUser(data.user)
      setLoggedUserId(data.user?.id ?? '')
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
            Enter the admin password to access the dashboard.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleLogin}>
            <input
              className="input-field"
              type="password"
              placeholder="Admin password"
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
