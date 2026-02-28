import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/useApp'
import { apiService } from '../utils/api'

export default function UserProfile() {
  const navigate = useNavigate()
  const { loggedUser, setLoggedUser, showToast } = useApp()
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({
    name: loggedUser?.name || '',
    email: loggedUser?.email || '',
    currentPassword: '',
    newPassword: '',
  })
  const [errors, setErrors] = useState({})

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {}
    if (!form.name.trim()) newErrors.name = 'Name is required'
    if (!form.email.trim()) newErrors.email = 'Email is required'
    if (form.newPassword && form.newPassword.length < 6) newErrors.newPassword = 'Password must be at least 6 characters'
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      await apiService.updateUser(loggedUser.id, {
        name: form.name.trim(),
        email: form.email.trim(),
      })
      
      if (form.newPassword) {
        await apiService.resetPassword(loggedUser.id, form.newPassword)
      }

      const updatedUser = await apiService.getMe()
      setLoggedUser(updatedUser)
      localStorage.setItem('ciomogul_user', JSON.stringify(updatedUser))
      setIsEditing(false)
      setForm({ ...form, currentPassword: '', newPassword: '' })
      showToast('Profile updated successfully', 'success')
    } catch (error) {
      setErrors({ general: error.message || 'Failed to update profile' })
      showToast(error.message || 'Failed to update profile', 'error')
    }
  }

  if (!loggedUser) {
    return (
      <div className="min-h-screen p-6 md:p-10">
        <div className="mx-auto max-w-lg">
          <div className="glass-panel rounded-3xl p-8 shadow-lift">
            <p className="text-sm uppercase tracking-[0.3em] text-ink-300">CIO Mogul</p>
            <h1 className="section-title mt-3">Access Denied</h1>
            <p className="mt-2 text-sm text-ink-300">Please log in to view your profile.</p>
            <a className="mt-6 inline-flex items-center rounded-full bg-ink-500 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-sand-50" href="/login">
              Go to Login
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <a href="/user" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-500 hover:text-brand-600">
            ← Back to Dashboard
          </a>
        </div>

        <div className="glass-panel rounded-3xl p-6 shadow-lift">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-ink-300">CIO Mogul</p>
              <h1 className="section-title mt-2">My Profile</h1>
            </div>
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white">
                Edit Profile
              </button>
            )}
          </div>

          {!isEditing ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-sand-200 bg-white/70 p-4">
                <p className="text-xs text-ink-400">Name</p>
                <p className="mt-1 text-sm font-semibold text-ink-500">{loggedUser.name}</p>
              </div>
              <div className="rounded-xl border border-sand-200 bg-white/70 p-4">
                <p className="text-xs text-ink-400">Email</p>
                <p className="mt-1 text-sm font-semibold text-ink-500">{loggedUser.email}</p>
              </div>
              <div className="rounded-xl border border-sand-200 bg-white/70 p-4">
                <p className="text-xs text-ink-400">Employee ID</p>
                <p className="mt-1 text-sm font-semibold text-ink-500">{loggedUser.employeeId}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-ink-400">Name</label>
                <input
                  className="input-field mt-1"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-ink-400">Email</label>
                <input
                  className="input-field mt-1"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-ink-400">New Password (optional)</label>
                <input
                  className="input-field mt-1"
                  type="password"
                  placeholder="Leave blank to keep current password"
                  value={form.newPassword}
                  onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                />
                <p className="mt-1 text-xs text-ink-300">Minimum 6 characters</p>
                {errors.newPassword && <p className="mt-1 text-xs text-red-500">{errors.newPassword}</p>}
              </div>
              {errors.general && <p className="text-xs text-red-500">{errors.general}</p>}
              <div className="flex gap-3">
                <button type="submit" className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white">
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false)
                    setForm({ name: loggedUser.name, email: loggedUser.email, currentPassword: '', newPassword: '' })
                    setErrors({})
                  }}
                  className="rounded-xl bg-sand-200 px-4 py-2 text-sm font-semibold text-ink-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
