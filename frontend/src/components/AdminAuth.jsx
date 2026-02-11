import { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function AdminAuth() {
  const { isAdminAuthorized, setIsAdminAuthorized } = useApp()
  const [passwordInput, setPasswordInput] = useState('')
  const [authError, setAuthError] = useState('')
  const requiredPassword = import.meta.env.VITE_DASHBOARD_PASSWORD || 'ciomogul'

  const handlePasswordSubmit = (event) => {
    event.preventDefault()
    if (passwordInput === requiredPassword) {
      localStorage.setItem('ciomogul_admin_ok', 'true')
      setIsAdminAuthorized(true)
      setAuthError('')
      return
    }
    setAuthError('Incorrect password. Please try again.')
  }

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-lg">
        <div className="glass-panel rounded-3xl p-8 shadow-lift">
          <p className="text-sm uppercase tracking-[0.3em] text-ink-300">CIO Mogul</p>
          <h1 className="section-title mt-3">Dashboard Access</h1>
          <p className="mt-2 text-sm text-ink-300">Enter the admin password to continue.</p>
          <form className="mt-6 space-y-4" onSubmit={handlePasswordSubmit}>
            <input
              className="input-field"
              type="password"
              placeholder="Admin password"
              value={passwordInput}
              onChange={(event) => setPasswordInput(event.target.value)}
            />
            {authError && <p className="text-sm text-red-500">{authError}</p>}
            <button className="w-full rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow">
              Enter Dashboard
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
