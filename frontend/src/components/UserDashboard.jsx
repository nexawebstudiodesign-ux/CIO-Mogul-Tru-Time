import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/useApp'
import { apiService } from '../utils/api'

export default function UserDashboard() {
  const navigate = useNavigate()
  const {
    users,
    loggedUser,
    setLoggedUser,
    loggedUserId,
    leaves,
    setLeaves,
    attendance,
    setAttendance,
    selectedMonth,
    setSelectedMonth,
    filteredAttendance,
    filteredLeaves,
  } = useApp()

  const [userAttendanceForm, setUserAttendanceForm] = useState({
    date: '',
    login: '',
    logout: '',
    mails: '',
    data: '',
    linkedin: '',
    followUps: '',
  })
  const [userAttendanceErrors, setUserAttendanceErrors] = useState({})

  const [userLeaveForm, setUserLeaveForm] = useState({ type: 'CASUAL', from: '', to: '', reason: '' })
  const [userLeaveErrors, setUserLeaveErrors] = useState({})

  // Configurable holidays (should match backend)
  const holidays = [
    '2026-01-26', // Republic Day
    '2026-08-15', // Independence Day
    '2026-10-02', // Gandhi Jayanti
    '2026-12-25', // Christmas
  ]

  // Helper function to check if date is weekend
  const isWeekend = (dateString) => {
    if (!dateString) return false
    const date = new Date(dateString + 'T00:00:00')
    const dayOfWeek = date.getDay()
    return dayOfWeek === 0 || dayOfWeek === 6 // Sunday or Saturday
  }

  // Helper function to check if date is holiday
  const isHoliday = (dateString) => {
    if (!dateString) return false
    return holidays.includes(dateString)
  }

  // Helper function to get date status message
  const getDateStatusMessage = (dateString) => {
    if (!dateString) return null
    if (isWeekend(dateString)) {
      return { type: 'weekend', message: 'Weekend - Attendance cannot be marked' }
    }
    if (isHoliday(dateString)) {
      return { type: 'holiday', message: 'Holiday - Attendance cannot be marked' }
    }
    const selectedDate = new Date(dateString + 'T00:00:00')
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const diffTime = today - selectedDate
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (selectedDate > today) {
      return { type: 'future', message: 'Future date - Attendance cannot be marked' }
    }
    if (diffDays > 7) {
      return { type: 'old', message: `Date is ${diffDays} days old - Maximum 7 days allowed` }
    }
    return null
  }

  // Computed data
  const loggedUserAttendance = useMemo(
    () => filteredAttendance.filter((record) => record.userId === loggedUserId),
    [filteredAttendance, loggedUserId],
  )

  const loggedUserLeaves = useMemo(
    () => filteredLeaves.filter((leave) => leave.userId === loggedUserId),
    [filteredLeaves, loggedUserId],
  )

  const userTotalDays = loggedUserAttendance.length
  const userTotalHours = loggedUserAttendance.reduce((sum, record) => sum + record.hours, 0)
  const userAvgHours = userTotalDays ? (userTotalHours / userTotalDays).toFixed(1) : 0
  const userComplianceDays = loggedUserAttendance.filter((rec) => rec.hours >= 9).length
  const userComplianceRate = userTotalDays ? Math.round((userComplianceDays / userTotalDays) * 100) : 0
  const userTotalMails = loggedUserAttendance.reduce((sum, rec) => sum + rec.mails, 0)
  const userTotalData = loggedUserAttendance.reduce((sum, rec) => sum + rec.data, 0)
  const userTotalLinkedin = loggedUserAttendance.reduce((sum, rec) => sum + rec.linkedin, 0)
  const userTotalFollowUps = loggedUserAttendance.reduce((sum, rec) => sum + rec.followUps, 0)

  // Validation
  const validateUserAttendance = () => {
    const errors = {}
    if (!userAttendanceForm.date) {
      errors.date = 'Date is required.'
    }
    if (!userAttendanceForm.login) {
      errors.login = 'Login time is required.'
    }
    if (!userAttendanceForm.logout) {
      errors.logout = 'Logout time is required.'
    }
    if (userAttendanceForm.login && userAttendanceForm.logout) {
      const loginDate = new Date(`1970-01-01T${userAttendanceForm.login}:00`)
      const logoutDate = new Date(`1970-01-01T${userAttendanceForm.logout}:00`)
      if (logoutDate <= loginDate) {
        errors.logout = 'Logout must be after login.'
      }
    }
    if (userAttendanceForm.mails === '' || Number.isNaN(Number(userAttendanceForm.mails))) {
      errors.mails = 'Mails count is required.'
    }
    if (userAttendanceForm.data === '' || Number.isNaN(Number(userAttendanceForm.data))) {
      errors.data = 'Data count is required.'
    }
    if (userAttendanceForm.linkedin === '' || Number.isNaN(Number(userAttendanceForm.linkedin))) {
      errors.linkedin = 'LinkedIn count is required.'
    }
    if (userAttendanceForm.followUps === '' || Number.isNaN(Number(userAttendanceForm.followUps))) {
      errors.followUps = 'Follow ups are required.'
    }
    return errors
  }

  const validateUserLeave = () => {
    const errors = {}
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(today.getDate() - 7)
    
    if (!userLeaveForm.from) {
      errors.from = 'From date is required.'
    } else {
      const fromDate = new Date(userLeaveForm.from + 'T00:00:00')
      if (fromDate < sevenDaysAgo) {
        errors.from = 'Cannot apply leave for dates older than 7 days.'
      }
    }
    
    if (!userLeaveForm.to) {
      errors.to = 'To date is required.'
    } else {
      const toDate = new Date(userLeaveForm.to + 'T00:00:00')
      if (toDate < sevenDaysAgo) {
        errors.to = 'Cannot apply leave for dates older than 7 days.'
      }
    }
    
    if (userLeaveForm.from && userLeaveForm.to && userLeaveForm.to < userLeaveForm.from) {
      errors.to = 'To date must be after From date.'
    }
    
    // Reason validation - minimum 10 characters
    if (!userLeaveForm.reason.trim()) {
      errors.reason = 'Reason is required (minimum 10 characters).'
    } else if (userLeaveForm.reason.trim().length < 10) {
      errors.reason = `Reason must be at least 10 characters (current: ${userLeaveForm.reason.trim().length}).`
    }
    
    // Calculate requested days
    let requestedDays = 0
    if (userLeaveForm.from && userLeaveForm.to) {
      const from = new Date(userLeaveForm.from + 'T00:00:00')
      const to = new Date(userLeaveForm.to + 'T00:00:00')
      const diffTime = to.getTime() - from.getTime()
      requestedDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1
    }
    
    // Check leave balance
    const leaveBalance = loggedUser?.leaveBalance || 0
    
    if (userLeaveForm.type === 'CASUAL' || userLeaveForm.type === 'SICK') {
      if (leaveBalance === 0) {
        errors.type = '⚠️ Leave balance is 0. Please select PAID leave option or contact Admin at info@theciomogul.com'
      } else if (requestedDays > leaveBalance) {
        errors.type = `⚠️ Insufficient balance: You have ${leaveBalance} days but requesting ${requestedDays} days. Please select PAID leave, reduce days, or contact Admin at info@theciomogul.com`
      }
    }
    
    return errors
  }

  const getNextLeaveId = (list) => {
    let max = 0
    list.forEach((leave) => {
      const match = leave.id.match(/L-(\\d+)/)
      if (match) {
        max = Math.max(max, Number(match[1]))
      }
    })
    return `L-${String(max + 1).padStart(4, '0')}`
  }

  // Handlers
  const handleUserAttendanceSubmit = async (event) => {
    event.preventDefault()
    const errors = validateUserAttendance()
    setUserAttendanceErrors(errors)
    if (Object.keys(errors).length > 0) {
      return
    }

    try {
      const dateStr = userAttendanceForm.date
      const loginDateTime = new Date(`${dateStr}T${userAttendanceForm.login}:00`)
      const logoutDateTime = new Date(`${dateStr}T${userAttendanceForm.logout}:00`)
      
      const attendanceData = {
        date: dateStr,
        loginTime: loginDateTime.toISOString(),
        logoutTime: logoutDateTime.toISOString(),
        mailsCount: Number(userAttendanceForm.mails),
        dataCount: Number(userAttendanceForm.data),
        linkedinCount: Number(userAttendanceForm.linkedin),
        followUpCount: Number(userAttendanceForm.followUps),
      }
      
      await apiService.createAttendance(attendanceData)
      
      const hours = Math.round(((logoutDateTime - loginDateTime) / 3600000) * 10) / 10
      const newRecord = {
        userId: loggedUserId,
        date: dateStr,
        hours,
        mails: Number(userAttendanceForm.mails),
        data: Number(userAttendanceForm.data),
        linkedin: Number(userAttendanceForm.linkedin),
        followUps: Number(userAttendanceForm.followUps),
      }
      setAttendance((prev) => [newRecord, ...prev])
      
      setUserAttendanceForm({
        date: '',
        login: '',
        logout: '',
        mails: '',
        data: '',
        linkedin: '',
        followUps: '',
      })
    } catch (error) {
      console.error('Failed to submit attendance:', error)
      setUserAttendanceErrors({ general: error.message || 'Failed to submit attendance' })
    }
  }

  const handleUserLeaveSubmit = async (event) => {
    event.preventDefault()
    const errors = validateUserLeave()
    setUserLeaveErrors(errors)
    if (Object.keys(errors).length > 0) {
      return
    }

    try {
      const leaveData = {
        leaveType: userLeaveForm.type,
        fromDate: userLeaveForm.from,
        toDate: userLeaveForm.to,
        reason: userLeaveForm.reason.trim(),
      }
      
      const newLeave = await apiService.applyLeave(leaveData)
      setLeaves((prev) => [newLeave, ...prev])
      setUserLeaveForm({ type: 'CASUAL', from: '', to: '', reason: '' })
      setUserLeaveErrors({})
      
      // Refresh user data to update leave balance
      const updatedUser = await apiService.getMe()
      setLoggedUser(updatedUser)
      localStorage.setItem('ciomogul_user', JSON.stringify(updatedUser))
    } catch (error) {
      console.error('Failed to apply leave:', error)
      setUserLeaveErrors({ general: error.message || 'Failed to apply leave. Please try again.' })
    }
  }

  const handleCancelLeave = async (leaveId) => {
    if (!window.confirm('Are you sure you want to cancel this leave? Your balance will be restored if applicable.')) {
      return
    }

    try {
      await apiService.cancelLeave(leaveId)
      setLeaves((prev) => prev.filter((leave) => leave.id !== leaveId))
      
      // Refresh user data to update leave balance
      const updatedUser = await apiService.getMe()
      setLoggedUser(updatedUser)
      localStorage.setItem('ciomogul_user', JSON.stringify(updatedUser))
    } catch (error) {
      console.error('Failed to cancel leave:', error)
      alert(error.message || 'Failed to cancel leave. Please try again.')
    }
  }

  if (!loggedUser) {
    return (
      <div className="min-h-screen p-6 md:p-10">
        <div className="mx-auto max-w-lg">
          <div className="glass-panel rounded-3xl p-8 shadow-lift">
            <p className="text-sm uppercase tracking-[0.3em] text-ink-300">CIO Mogul</p>
            <h1 className="section-title mt-3">User Access</h1>
            <p className="mt-2 text-sm text-ink-300">Please log in to view your dashboard.</p>
            <a
              className="mt-6 inline-flex items-center rounded-full bg-ink-500 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-sand-50"
              href="/login"
            >
              Go to Login
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-ink-300">CIO Mogul</p>
            <h1 className="section-title">User Dashboard</h1>
            <p className="mt-2 text-sm text-ink-300">Welcome back, {loggedUser.name}.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                apiService.logout()
                navigate('/')
              }}
              className="glass-panel rounded-2xl px-4 py-3 shadow-lift text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              Logout
            </button>
            <a
              href="/salary"
              className="glass-panel rounded-2xl px-4 py-3 shadow-lift text-sm font-semibold text-brand-600 hover:bg-brand-50"
            >
              View Salary Slip
            </a>
            <div className="glass-panel rounded-2xl p-4 shadow-lift">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-ink-300">Month</span>
                <input
                  type="month"
                  className="rounded-lg border border-sand-200 bg-white/80 px-3 py-1 text-sm font-semibold text-ink-500"
                  value={selectedMonth}
                  onChange={(event) => setSelectedMonth(event.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 glass-panel rounded-3xl p-6 shadow-lift">
          <h2 className="text-xl font-bold text-ink-500">Performance Summary</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-sand-200 bg-white/50 p-4">
              <p className="text-xs uppercase tracking-wide text-ink-300">Days Worked</p>
              <p className="mt-1 text-2xl font-bold text-ink-500">{userTotalDays}</p>
            </div>
            <div className="rounded-xl border border-sand-200 bg-white/50 p-4">
              <p className="text-xs uppercase tracking-wide text-ink-300">Avg Hours/Day</p>
              <p className="mt-1 text-2xl font-bold text-ink-500">{userAvgHours}</p>
            </div>
            <div className="rounded-xl border border-sand-200 bg-white/50 p-4">
              <p className="text-xs uppercase tracking-wide text-ink-300">Compliance</p>
              <p className="mt-1 text-2xl font-bold text-brand-600">{userComplianceRate}%</p>
            </div>
            <div className="rounded-xl border border-sand-200 bg-white/50 p-4">
              <p className="text-xs uppercase tracking-wide text-ink-300">Total Hours</p>
              <p className="mt-1 text-2xl font-bold text-ink-500">{userTotalHours.toFixed(1)}</p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-ink-500">Productivity Metrics</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg bg-blue-50 px-4 py-3">
                <p className="text-xs text-blue-700">Mails Processed</p>
                <p className="mt-1 text-xl font-bold text-blue-900">{userTotalMails}</p>
              </div>
              <div className="rounded-lg bg-green-50 px-4 py-3">
                <p className="text-xs text-green-700">Data Entries</p>
                <p className="mt-1 text-xl font-bold text-green-900">{userTotalData}</p>
              </div>
              <div className="rounded-lg bg-purple-50 px-4 py-3">
                <p className="text-xs text-purple-700">LinkedIn Activities</p>
                <p className="mt-1 text-xl font-bold text-purple-900">{userTotalLinkedin}</p>
              </div>
              <div className="rounded-lg bg-orange-50 px-4 py-3">
                <p className="text-xs text-orange-700">Follow-ups</p>
                <p className="mt-1 text-xl font-bold text-orange-900">{userTotalFollowUps}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <section className="glass-panel rounded-3xl p-6 shadow-lift">
            <h2 className="section-title text-xl">Daily Tru Time Entry</h2>
            <form className="mt-4 grid gap-3" onSubmit={handleUserAttendanceSubmit}>
              <div>
                <input
                  className="input-field"
                  type="date"
                  required
                  max={new Date().toISOString().split('T')[0]}
                  value={userAttendanceForm.date}
                  onChange={(event) =>
                    setUserAttendanceForm((prev) => ({ ...prev, date: event.target.value }))
                  }
                />
                {userAttendanceForm.date && getDateStatusMessage(userAttendanceForm.date) && (
                  <p className={`mt-1 text-xs font-semibold ${
                    getDateStatusMessage(userAttendanceForm.date).type === 'holiday' 
                      ? 'text-orange-600' 
                      : 'text-red-500'
                  }`}>
                    ⚠️ {getDateStatusMessage(userAttendanceForm.date).message}
                  </p>
                )}
                {userAttendanceErrors.date && (
                  <p className="mt-1 text-xs text-red-500">{userAttendanceErrors.date}</p>
                )}
                {userAttendanceErrors.general && (
                  <p className="mt-1 text-xs text-red-500">{userAttendanceErrors.general}</p>
                )}
              </div>
              <div>
                <input
                  className="input-field"
                  type="time"
                  placeholder="Login time"
                  required
                  value={userAttendanceForm.login}
                  onChange={(event) =>
                    setUserAttendanceForm((prev) => ({ ...prev, login: event.target.value }))
                  }
                />
                {userAttendanceErrors.login && (
                  <p className="mt-1 text-xs text-red-500">{userAttendanceErrors.login}</p>
                )}
                <p className="mt-1 text-xs text-ink-300">Enter login time</p>
              </div>
              <div>
                <input
                  className="input-field"
                  type="time"
                  placeholder="Logout time"
                  required
                  value={userAttendanceForm.logout}
                  onChange={(event) =>
                    setUserAttendanceForm((prev) => ({ ...prev, logout: event.target.value }))
                  }
                />
                {userAttendanceErrors.logout && (
                  <p className="mt-1 text-xs text-red-500">{userAttendanceErrors.logout}</p>
                )}
                <p className="mt-1 text-xs text-ink-300">Enter logout time</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <input
                    className="input-field"
                    placeholder="Mails"
                    required
                    value={userAttendanceForm.mails}
                    onChange={(event) =>
                      setUserAttendanceForm((prev) => ({ ...prev, mails: event.target.value }))
                    }
                  />
                  {userAttendanceErrors.mails && (
                    <p className="mt-1 text-xs text-red-500">{userAttendanceErrors.mails}</p>
                  )}
                </div>
                <div>
                  <input
                    className="input-field"
                    placeholder="Data"
                    required
                    value={userAttendanceForm.data}
                    onChange={(event) =>
                      setUserAttendanceForm((prev) => ({ ...prev, data: event.target.value }))
                    }
                  />
                  {userAttendanceErrors.data && (
                    <p className="mt-1 text-xs text-red-500">{userAttendanceErrors.data}</p>
                  )}
                </div>
                <div>
                  <input
                    className="input-field"
                    placeholder="LinkedIn"
                    required
                    value={userAttendanceForm.linkedin}
                    onChange={(event) =>
                      setUserAttendanceForm((prev) => ({ ...prev, linkedin: event.target.value }))
                    }
                  />
                  {userAttendanceErrors.linkedin && (
                    <p className="mt-1 text-xs text-red-500">{userAttendanceErrors.linkedin}</p>
                  )}
                </div>
                <div>
                  <input
                    className="input-field"
                    placeholder="Follow ups"
                    required
                    value={userAttendanceForm.followUps}
                    onChange={(event) =>
                      setUserAttendanceForm((prev) => ({ ...prev, followUps: event.target.value }))
                    }
                  />
                  {userAttendanceErrors.followUps && (
                    <p className="mt-1 text-xs text-red-500">{userAttendanceErrors.followUps}</p>
                  )}
                </div>
              </div>
              <button className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white">
                Submit Tru Time
              </button>
            </form>
          </section>

          <section className="glass-panel rounded-3xl p-6 shadow-lift">
            <h2 className="section-title text-xl">Apply Leave</h2>
            <div className="mt-3 rounded-xl bg-blue-50 p-3">
              <p className="text-xs font-semibold text-blue-700 mb-1">Your Leave Balance</p>
              <p className="text-2xl font-bold text-blue-900">{loggedUser?.leaveBalance || 0} days</p>
              <p className="text-xs text-blue-600 mt-1">💡 If balance is insufficient, select PAID leave</p>
            </div>
            <div className="mt-3 rounded-lg bg-amber-50 p-2 border border-amber-200">
              <p className="text-xs text-amber-800">⚠️ Leave can be applied for dates up to 7 days in the past</p>
            </div>
            <div className="mt-3 rounded-lg bg-green-50 p-2 border border-green-200">
              <p className="text-xs text-green-800">📧 Need help? Contact Admin at <a href="mailto:info@theciomogul.com" className="underline font-semibold">info@theciomogul.com</a></p>
            </div>
            <form className="mt-4 grid gap-3" onSubmit={handleUserLeaveSubmit}>
              <div>
                <select
                  className="input-field"
                  required
                  value={userLeaveForm.type}
                  onChange={(event) => setUserLeaveForm((prev) => ({ ...prev, type: event.target.value }))}
                >
                  <option value="CASUAL">Casual Leave</option>
                  <option value="SICK">Sick Leave</option>
                  <option value="PAID">Paid Leave</option>
                </select>
                <p className="mt-1 text-xs text-ink-300">Select leave type based on your balance</p>
                {userLeaveErrors.type && (
                  <p className="mt-1 text-xs text-red-500">{userLeaveErrors.type}</p>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-ink-400">From Date</label>
                <input
                  className="input-field mt-1"
                  type="date"
                  required
                  value={userLeaveForm.from}
                  onChange={(event) => setUserLeaveForm((prev) => ({ ...prev, from: event.target.value }))}
                />
                {userLeaveErrors.from && (
                  <p className="mt-1 text-xs text-red-500">{userLeaveErrors.from}</p>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-ink-400">To Date</label>
                <input
                  className="input-field mt-1"
                  type="date"
                  required
                  value={userLeaveForm.to}
                  onChange={(event) => setUserLeaveForm((prev) => ({ ...prev, to: event.target.value }))}
                />
                {userLeaveErrors.to && (
                  <p className="mt-1 text-xs text-red-500">{userLeaveErrors.to}</p>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-ink-400">Reason (minimum 10 characters)</label>
                <textarea
                  className="input-field mt-1"
                  placeholder="Provide detailed reason for leave..."
                  required
                  rows="3"
                  value={userLeaveForm.reason}
                  onChange={(event) => setUserLeaveForm((prev) => ({ ...prev, reason: event.target.value }))}
                />
                <p className="mt-1 text-xs text-ink-300">
                  {userLeaveForm.reason.trim().length}/10 characters minimum
                </p>
                {userLeaveErrors.reason && (
                  <p className="mt-1 text-xs text-red-500">{userLeaveErrors.reason}</p>
                )}
                {userLeaveErrors.general && (
                  <p className="mt-1 text-xs text-red-500">{userLeaveErrors.general}</p>
                )}
              </div>
              <button className="rounded-xl bg-ink-500 px-4 py-2 text-sm font-semibold text-white">
                Apply Leave
              </button>
            </form>
          </section>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="glass-panel rounded-3xl p-6 shadow-lift">
            <h3 className="text-sm font-semibold text-ink-500">My Tru Time Records</h3>
            <div className="mt-3 overflow-hidden rounded-2xl border border-sand-200">
              <div className="grid grid-cols-[0.9fr_0.6fr_0.7fr_0.7fr_0.7fr_0.7fr] bg-sand-50 px-4 py-3 text-xs uppercase tracking-[0.2em] text-ink-300">
                <span>Date</span>
                <span>Hours</span>
                <span>Mails</span>
                <span>Data</span>
                <span>LinkedIn</span>
                <span>Follow Ups</span>
              </div>
              {loggedUserAttendance.map((record) => (
                <div
                  key={`${record.userId}-${record.date}`}
                  className="grid grid-cols-[0.9fr_0.6fr_0.7fr_0.7fr_0.7fr_0.7fr] items-center border-t border-sand-100 px-4 py-3 text-sm"
                >
                  <span className="font-semibold text-ink-500">{record.date}</span>
                  <span className="text-ink-400">{record.hours.toFixed(1)}</span>
                  <span className="text-ink-400">{record.mails}</span>
                  <span className="text-ink-400">{record.data}</span>
                  <span className="text-ink-400">{record.linkedin}</span>
                  <span className="text-ink-400">{record.followUps}</span>
                </div>
              ))}
              {loggedUserAttendance.length === 0 && (
                <div className="px-4 py-6 text-sm text-ink-300">No Tru Time records for this month.</div>
              )}
            </div>
          </section>

          <section className="glass-panel rounded-3xl p-6 shadow-lift">
            <h3 className="text-sm font-semibold text-ink-500">My Leave Requests</h3>
            <div className="mt-3 overflow-hidden rounded-2xl border border-sand-200">
              <div className="grid grid-cols-[1fr_0.8fr_0.6fr_0.6fr_0.6fr] bg-sand-50 px-4 py-3 text-xs uppercase tracking-[0.2em] text-ink-300">
                <span>Type</span>
                <span>Date Range</span>
                <span>Days</span>
                <span>Status</span>
                <span>Action</span>
              </div>
              {loggedUserLeaves.map((leave) => {
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                const leaveEndDate = new Date(leave.to)
                leaveEndDate.setHours(0, 0, 0, 0)
                const canCancel = (leave.status === 'PENDING' || leave.status === 'APPROVED') && leaveEndDate >= today
                
                return (
                  <div
                    key={leave.id}
                    className="grid grid-cols-[1fr_0.8fr_0.6fr_0.6fr_0.6fr] items-center border-t border-sand-100 px-4 py-3 text-sm"
                  >
                    <span className="font-semibold text-ink-500">{leave.type}</span>
                    <span className="text-ink-400">
                      {leave.from} → {leave.to}
                    </span>
                    <span className="text-ink-400">{leave.days}</span>
                    <span className="pill bg-sand-100 text-ink-300">{leave.status}</span>
                    <span>
                      {canCancel ? (
                        <button
                          onClick={() => handleCancelLeave(leave.id)}
                          className="text-xs font-medium text-red-600 hover:text-red-700 hover:underline"
                        >
                          Cancel
                        </button>
                      ) : (
                        <span className="text-xs text-ink-200">—</span>
                      )}
                    </span>
                  </div>
                )
              })}
              {loggedUserLeaves.length === 0 && (
                <div className="px-4 py-6 text-sm text-ink-300">No leave records for this month.</div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
