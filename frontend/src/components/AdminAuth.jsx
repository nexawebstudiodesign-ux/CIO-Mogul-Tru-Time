import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/useApp'
import { apiService } from '../utils/api'

export default function AdminAuth() {
  const navigate = useNavigate()
  const { setIsAdminAuthorized, setLoggedUser, setLoggedUserId } = useApp()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setAuthError('')
    setLoading(true)

    try {
      const data = await apiService.adminEmailLogin(email, password)

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
    <div className="app-page page-center">
      <div className="mx-auto max-w-lg">
        <div className="panel-shell">
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
              type="email"
              placeholder="Admin email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Enter Dashboard'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
