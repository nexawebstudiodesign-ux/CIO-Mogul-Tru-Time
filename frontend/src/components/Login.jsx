import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const navigate = useNavigate()
  const [loginInput, setLoginInput] = useState({ employeeId: '', password: '' })
  const [loginError, setLoginError] = useState('')

  const handleLoginSubmit = (event) => {
    event.preventDefault()
    const sampleId = 'CIO-0003'
    const samplePassword = 'Welcome@123'
    if (loginInput.employeeId === sampleId && loginInput.password === samplePassword) {
      setLoginError('')
      localStorage.setItem('ciomogul_user_id', sampleId)
      navigate('/user')
      return
    }
    setLoginError('Invalid credentials. Try the sample login below.')
  }

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-lg">
        <div className="glass-panel rounded-3xl p-8 shadow-lift">
          <p className="text-sm uppercase tracking-[0.3em] text-ink-300">CIO Mogul</p>
          <h1 className="section-title mt-3">User Login</h1>
          <p className="mt-2 text-sm text-ink-300">Sign in with your Employee ID and password.</p>
          <form className="mt-6 space-y-4" onSubmit={handleLoginSubmit}>
            <input
              className="input-field"
              placeholder="Employee ID"
              required
              value={loginInput.employeeId}
              onChange={(event) =>
                setLoginInput((prev) => ({ ...prev, employeeId: event.target.value }))
              }
            />
            <input
              className="input-field"
              type="password"
              placeholder="Password"
              required
              value={loginInput.password}
              onChange={(event) =>
                setLoginInput((prev) => ({ ...prev, password: event.target.value }))
              }
            />
            {loginError && <p className="text-sm text-red-500">{loginError}</p>}
            <button className="w-full rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow">
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
