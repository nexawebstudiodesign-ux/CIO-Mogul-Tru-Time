import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/useApp'
import { apiService } from '../utils/api'

export default function UserDashboard() {
  const navigate = useNavigate()
  const {
    loggedUser,
    setLoggedUser,
    loggedUserId,
    monthlySalaries,
    setMonthlySalaries,
    setLeaves,
    setAttendance,
    selectedMonth,
    setSelectedMonth,
    filteredAttendance,
    filteredLeaves,
    showToast,
    publicHolidays,
  } = useApp()

  const normalizeAttendanceRecord = (record) => ({
    id: record?.id,
    userId: record?.userId ?? record?.user_id ?? loggedUserId,
    date: record?.date ?? '',
    hours:
      record?.hours ??
      (Number.isFinite(Number(record?.total_minutes))
        ? Math.round((Number(record.total_minutes) / 60) * 10) / 10
        : 0),
    mails: record?.mails ?? record?.mails_count ?? 0,
    data: record?.data ?? record?.data_count ?? 0,
    linkedin: record?.linkedin ?? record?.linkedin_count ?? 0,
    followUps: record?.followUps ?? record?.follow_up_count ?? 0,
  })

  const normalizeLeaveRecord = (leave) => {
    const from = leave?.from ?? leave?.from_date ?? ''
    const to = leave?.to ?? leave?.to_date ?? ''
    const days = leave?.days ?? (from && to ? Math.floor((new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24)) + 1 : 0)
    return {
      id: leave?.id,
      userId: leave?.userId ?? leave?.user_id ?? loggedUserId,
      type: leave?.type ?? leave?.leave_type ?? 'UNKNOWN',
      from,
      to,
      days,
      status: String(leave?.status ?? 'PENDING').toUpperCase(),
      reason: leave?.reason ?? '',
    }
  }

  const refreshMyAttendance = async () => {
    if (!loggedUserId) return
    try {
      const attendanceRows = await apiService.getMyAttendance()
      if (Array.isArray(attendanceRows)) {
        setAttendance(attendanceRows.map(normalizeAttendanceRecord))
      }
    } catch (error) {
      console.error('Failed to refresh user attendance:', error)
    }
  }

  const refreshMyLeaves = async () => {
    if (!loggedUserId) return
    try {
      const leavesRows = await apiService.getMyLeaves()
      if (Array.isArray(leavesRows)) {
        setLeaves(leavesRows.map(normalizeLeaveRecord))
      }
    } catch (error) {
      console.error('Failed to refresh user leaves:', error)
    }
  }

  useEffect(() => {
    if (!loggedUserId) return
    refreshMyAttendance()
    refreshMyLeaves()
  }, [loggedUserId, selectedMonth])

  useEffect(() => {
    if (!loggedUserId || !selectedMonth) {
      return
    }

    const loadSalaryForSelectedMonth = async () => {
      try {
        const salaryRows = await apiService.getMySalaries(selectedMonth)
        const list = Array.isArray(salaryRows) ? salaryRows : []
        setMonthlySalaries((prev) => {
          const keep = prev.filter(
            (salary) => !(salary.userId === loggedUserId && salary.month === selectedMonth),
          )
          return [...list, ...keep]
        })
      } catch (error) {
        console.error('Failed to refresh salary for selected month:', error)
      }
    }

    loadSalaryForSelectedMonth()
  }, [loggedUserId, selectedMonth, setMonthlySalaries])

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
  const [activeTab, setActiveTab] = useState('trutime')

  const holidayLookup = useMemo(() => {
    const map = new Map()
    if (Array.isArray(publicHolidays)) {
      publicHolidays.forEach((holiday) => {
        map.set(holiday.date, holiday.description)
      })
    }
    return map
  }, [publicHolidays])

  const sortedHolidays = useMemo(() => {
    const list = Array.isArray(publicHolidays) ? [...publicHolidays] : []
    return list.sort((a, b) => String(a.date).localeCompare(String(b.date)))
  }, [publicHolidays])

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
    return holidayLookup.has(dateString)
  }

  // Helper function to get date status message
  const getDateStatusMessage = (dateString) => {
    if (!dateString) return null
    if (isWeekend(dateString)) {
      return { type: 'weekend', message: 'Weekend - Attendance cannot be marked' }
    }
    if (isHoliday(dateString)) {
      const description = holidayLookup.get(dateString)
      return {
        type: 'holiday',
        message: description
          ? `Holiday - ${description} (attendance cannot be marked)`
          : 'Holiday - Attendance cannot be marked',
      }
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
  const userComplianceDays = loggedUserAttendance.filter((rec) => rec.hours >= 4.5).length
  const userComplianceRate = userTotalDays ? Math.round((userComplianceDays / userTotalDays) * 100) : 0
  const userTotalMails = loggedUserAttendance.reduce((sum, rec) => sum + rec.mails, 0)
  const userTotalData = loggedUserAttendance.reduce((sum, rec) => sum + rec.data, 0)
  const userTotalLinkedin = loggedUserAttendance.reduce((sum, rec) => sum + rec.linkedin, 0)
  const userTotalFollowUps = loggedUserAttendance.reduce((sum, rec) => sum + rec.followUps, 0)

  const selectedMonthSalary = useMemo(
    () => monthlySalaries.find((salary) => salary.userId === loggedUserId && salary.month === selectedMonth),
    [monthlySalaries, loggedUserId, selectedMonth],
  )

  const salaryBase = selectedMonthSalary?.baseSalary || loggedUser?.baseSalary || 0
  const salaryHra = selectedMonthSalary?.hra || loggedUser?.hra || 0
  const salaryTransport = selectedMonthSalary?.transportAllowance || loggedUser?.transportAllowance || 0
  const salaryOtherAllowance = selectedMonthSalary?.otherAllowance || loggedUser?.otherAllowance || 0
  const salaryBonus = selectedMonthSalary?.performanceBonus || 0
  const salaryPf = selectedMonthSalary?.pfDeduction || loggedUser?.pfDeduction || 0
  const salaryTax = selectedMonthSalary?.taxDeduction || loggedUser?.taxDeduction || 0
  const salaryOtherDeduction = selectedMonthSalary?.otherDeduction || loggedUser?.otherDeduction || 0

  const grossSalary = salaryBase + salaryHra + salaryTransport + salaryOtherAllowance + salaryBonus
  const totalDeductions = salaryPf + salaryTax + salaryOtherDeduction
  const netSalary = grossSalary - totalDeductions
  const pendingLeaveCount = loggedUserLeaves.filter((leave) => leave.status === 'PENDING').length
  const approvedLeaveCount = loggedUserLeaves.filter((leave) => leave.status === 'APPROVED').length

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
    
    // Check leave balance based on type
    const casualBalance = loggedUser?.casualBalance ?? loggedUser?.casual_balance ?? 0
    const sickBalance = loggedUser?.sickBalance ?? loggedUser?.sick_balance ?? 0
    
    if (userLeaveForm.type === 'CASUAL') {
      if (casualBalance === 0) {
        errors.type = '⚠️ Casual leave balance is 0. Please select PAID leave option or contact Admin at info@theciomogul.com'
      } else if (requestedDays > casualBalance) {
        errors.type = `⚠️ Insufficient casual leave: You have ${casualBalance} days but requesting ${requestedDays} days. Please select PAID leave, reduce days, or contact Admin at info@theciomogul.com`
      }
    } else if (userLeaveForm.type === 'SICK') {
      if (sickBalance === 0) {
        errors.type = '⚠️ Sick leave balance is 0. Please select PAID leave option or contact Admin at info@theciomogul.com'
      } else if (requestedDays > sickBalance) {
        errors.type = `⚠️ Insufficient sick leave: You have ${sickBalance} days but requesting ${requestedDays} days. Please select PAID leave, reduce days, or contact Admin at info@theciomogul.com`
      }
    }
    
    return errors
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

      const savedAttendance = await apiService.createAttendance(attendanceData)

      const normalizedRecord = {
        id: savedAttendance?.id,
        userId: savedAttendance?.userId ?? savedAttendance?.user_id ?? loggedUserId,
        date: savedAttendance?.date ?? dateStr,
        hours:
          Number.isFinite(Number(savedAttendance?.hours))
            ? Number(savedAttendance.hours)
            : Number.isFinite(Number(savedAttendance?.total_minutes))
            ? Math.round((Number(savedAttendance.total_minutes) / 60) * 10) / 10
            : Math.round(((logoutDateTime - loginDateTime) / 3600000) * 10) / 10,
        mails: savedAttendance?.mails ?? savedAttendance?.mails_count ?? Number(userAttendanceForm.mails),
        data: savedAttendance?.data ?? savedAttendance?.data_count ?? Number(userAttendanceForm.data),
        linkedin:
          savedAttendance?.linkedin ?? savedAttendance?.linkedin_count ?? Number(userAttendanceForm.linkedin),
        followUps:
          savedAttendance?.followUps ?? savedAttendance?.follow_up_count ?? Number(userAttendanceForm.followUps),
        loginTime:
          savedAttendance?.loginTime ?? savedAttendance?.login_time ?? attendanceData.loginTime,
        logoutTime:
          savedAttendance?.logoutTime ?? savedAttendance?.logout_time ?? attendanceData.logoutTime,
        totalMinutes:
          savedAttendance?.total_minutes ?? savedAttendance?.totalMinutes ??
          Math.round((logoutDateTime.getTime() - loginDateTime.getTime()) / 60000),
      }

      setAttendance((prev) => [normalizedRecord, ...prev])

      setUserAttendanceForm({
        date: '',
        login: '',
        logout: '',
        mails: '',
        data: '',
        linkedin: '',
        followUps: '',
      })
      showToast('Attendance submitted successfully.', 'success')
    } catch (error) {
      console.error('Failed to submit attendance:', error)
      setUserAttendanceErrors({ general: error.message || 'Failed to submit attendance' })
      showToast(error.message || 'Failed to submit attendance', 'error')
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
      const leaveFrom = newLeave?.from ?? newLeave?.from_date ?? userLeaveForm.from
      const leaveTo = newLeave?.to ?? newLeave?.to_date ?? userLeaveForm.to
      const leaveDays = newLeave?.days ??
        (leaveFrom && leaveTo
          ? Math.max(
              0,
              Math.floor((new Date(leaveTo).getTime() - new Date(leaveFrom).getTime()) / (1000 * 60 * 60 * 24)) + 1,
            )
          : 0)

      const normalizedLeave = {
        id: newLeave?.id,
        userId: newLeave?.userId ?? newLeave?.user_id ?? loggedUserId,
        type: newLeave?.leaveType ?? newLeave?.leave_type ?? userLeaveForm.type,
        from: leaveFrom,
        to: leaveTo,
        reason: newLeave?.reason ?? '',
        days: leaveDays,
        status: String(newLeave?.status ?? 'PENDING').toUpperCase(),
      }
      setLeaves((prev) => [normalizedLeave, ...prev])
      setUserLeaveForm({ type: 'CASUAL', from: '', to: '', reason: '' })
      setUserLeaveErrors({})

      // Refresh user data after successful leave apply
      await refreshMyLeaves()
      await refreshMyAttendance()

      try {
        const updatedUser = await apiService.getMe()
        setLoggedUser(updatedUser)
        localStorage.setItem('ciomogul_user', JSON.stringify(updatedUser))
      } catch (error) {
        console.warn('Failed to refresh current user after leave apply:', error)
      }

      showToast('Leave request submitted successfully.', 'success')
    } catch (error) {
      console.error('Failed to apply leave:', error)
      setUserLeaveErrors({ general: error.message || 'Failed to apply leave. Please try again.' })
      showToast(error.message || 'Failed to apply leave', 'error')
    }
  }

  const handleCancelLeave = async (leaveId) => {
    if (!window.confirm('Are you sure you want to cancel this leave? Your balance will be restored if applicable.')) {
      return
    }

    try {
      await apiService.cancelLeave(leaveId)
      await refreshMyLeaves()
      await refreshMyAttendance()
      try {
        const updatedUser = await apiService.getMe()
        setLoggedUser(updatedUser)
        localStorage.setItem('ciomogul_user', JSON.stringify(updatedUser))
      } catch (error) {
        console.warn('Failed to refresh current user after cancel leave:', error)
      }
      showToast('Leave canceled successfully.', 'success')
    } catch (error) {
      console.error('Failed to cancel leave:', error)
      showToast(error.message || 'Failed to cancel leave', 'error')
    }
  }

  if (!loggedUser) {
    return (
      <div className="app-page page-center">
        <div className="mx-auto max-w-lg">
          <div className="panel-shell">
            <p className="text-sm uppercase tracking-[0.3em] text-ink-300">CIO Mogul</p>
            <h1 className="section-title mt-3">User Access</h1>
            <p className="mt-2 text-sm text-ink-300">Please log in to view your dashboard.</p>
            <a
              className="btn-pill mt-6 bg-ink-500 text-sand-50"
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
    <div className="dashboard-page">
      <div className="mx-auto w-full max-w-5xl">
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
              className="btn-danger bg-red-500/90"
            >
              Logout
            </button>
            <div className="toolbar-panel">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-ink-300">Month</span>
                <input
                  type="month"
                  className="control-input font-semibold"
                  value={selectedMonth}
                  onChange={(event) => setSelectedMonth(event.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 toolbar-panel p-2">
          <div className="grid gap-2 sm:grid-cols-3">
            <button
              className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                activeTab === 'trutime' ? 'bg-brand-600 text-white' : 'bg-white/70 text-ink-500'
              }`}
              onClick={() => setActiveTab('trutime')}
            >
              Tru Time
            </button>
            <button
              className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                activeTab === 'leave' ? 'bg-brand-600 text-white' : 'bg-white/70 text-ink-500'
              }`}
              onClick={() => setActiveTab('leave')}
            >
              Apply Leave
            </button>
            <button
              className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                activeTab === 'salary' ? 'bg-brand-600 text-white' : 'bg-white/70 text-ink-500'
              }`}
              onClick={() => setActiveTab('salary')}
            >
              Salary Slip
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {activeTab === 'trutime' && (
            <>
              <div className="stat-card">
                <p className="text-xs uppercase tracking-wide text-ink-300">Days Worked</p>
                <p className="mt-1 text-2xl font-bold text-ink-500">{userTotalDays}</p>
              </div>
              <div className="stat-card">
                <p className="text-xs uppercase tracking-wide text-ink-300">Compliance</p>
                <p className="mt-1 text-2xl font-bold text-brand-600">{userComplianceRate}%</p>
              </div>
            </>
          )}
          {activeTab === 'leave' && (
            <>
              <div className="stat-card">
                <p className="text-xs uppercase tracking-wide text-ink-300">Leave Balance</p>
                <p className="mt-1 text-2xl font-bold text-ink-500">
                  C: {loggedUser?.casualBalance ?? loggedUser?.casual_balance ?? 0} | S: {loggedUser?.sickBalance ?? loggedUser?.sick_balance ?? 0}
                </p>
              </div>
              <div className="stat-card">
                <p className="text-xs uppercase tracking-wide text-ink-300">Pending / Approved</p>
                <p className="mt-1 text-2xl font-bold text-brand-600">{pendingLeaveCount} / {approvedLeaveCount}</p>
              </div>
            </>
          )}
          {activeTab === 'salary' && (
            <>
              <div className="stat-card">
                <p className="text-xs uppercase tracking-wide text-ink-300">Gross Salary</p>
                <p className="mt-1 text-2xl font-bold text-ink-500">₹{grossSalary.toLocaleString()}</p>
              </div>
              <div className="stat-card">
                <p className="text-xs uppercase tracking-wide text-ink-300">Net Salary</p>
                <p className="mt-1 text-2xl font-bold text-brand-600">₹{netSalary.toLocaleString()}</p>
              </div>
            </>
          )}
        </div>

        {activeTab === 'trutime' && (
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
        )}

        {activeTab === 'trutime' && (
        <div className="mt-8 grid gap-6">
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
        </div>
        )}

        {activeTab === 'trutime' && (
        <div className="mt-6 grid gap-6">
          <section className="glass-panel rounded-3xl p-6 shadow-lift">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink-500">Public Holidays</h3>
              <span className="pill bg-sand-100 text-ink-400">{sortedHolidays.length} days</span>
            </div>
            <div className="mt-3 space-y-2">
              {sortedHolidays.length === 0 ? (
                <p className="text-sm text-ink-300">No public holidays configured yet.</p>
              ) : (
                sortedHolidays.map((holiday) => (
                  <div
                    key={holiday.id}
                    className="flex items-center justify-between rounded-xl border border-sand-200 bg-white/70 px-3 py-2"
                  >
                    <p className="text-sm font-semibold text-ink-500">{holiday.date}</p>
                    <p className="text-xs text-ink-300">{holiday.description}</p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
        )}

        {activeTab === 'trutime' && (
        <div className="mt-8 grid gap-6">
          <section className="glass-panel rounded-3xl p-6 shadow-lift">
            <h3 className="text-sm font-semibold text-ink-500">My Tru Time Records</h3>
            <div className="mt-3 overflow-x-auto overflow-hidden rounded-2xl border border-sand-200">
              <div className="grid grid-cols-[0.9fr_0.6fr_0.7fr_0.7fr_0.7fr_0.7fr] bg-sand-50 px-4 py-4 text-xs uppercase tracking-[0.2em] text-ink-500 font-semibold border-b border-sand-200 min-w-[700px]">
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
                  className="grid grid-cols-[0.9fr_0.6fr_0.7fr_0.7fr_0.7fr_0.7fr] items-center border-t border-sand-200 px-4 py-4 text-sm font-semibold text-ink-500"
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
        </div>
        )}

        {activeTab === 'leave' && (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="glass-panel rounded-3xl p-6 shadow-lift">
            <h2 className="section-title text-xl">Apply Leave</h2>
            <div className="mt-3 rounded-xl bg-blue-50 p-3">
              <p className="text-xs font-semibold text-blue-700 mb-1">Your Leave Balance</p>
              <p className="text-lg font-bold text-blue-900">
                Casual: {loggedUser?.casualBalance ?? loggedUser?.casual_balance ?? 0} days | 
                Sick: {loggedUser?.sickBalance ?? loggedUser?.sick_balance ?? 0} days
              </p>
              <p className="text-xs text-blue-600 mt-1">💡 If balance is insufficient, select PAID leave</p>
            </div>
            <div className="mt-3 rounded-lg bg-amber-50 p-2 border border-amber-200">
              <p className="text-xs text-amber-800">⚠️ Leave can be applied for dates up to 7 days in the past</p>
            </div>
            <div className="mt-3 rounded-lg bg-green-50 p-2 border border-green-200">
              <p className="text-xs text-green-800">📧 Need help? Contact Admin at <a href="mailto:info@theciomogul.com" className="underline font-semibold">info@theciomogul.com</a></p>
            </div>
            <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={handleUserLeaveSubmit}>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink-400">Leave Type</label>
                <select
                  className="input-field w-full"
                  required
                  value={userLeaveForm.type}
                  onChange={(event) => setUserLeaveForm((prev) => ({ ...prev, type: event.target.value }))}
                >
                  <option value="CASUAL">Casual Leave</option>
                  <option value="SICK">Sick Leave</option>
                  <option value="PAID">Paid Leave</option>
                </select>
                {userLeaveErrors.type && <p className="text-xs text-red-500">{userLeaveErrors.type}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink-400">From Date</label>
                <input
                  className="input-field w-full"
                  type="date"
                  required
                  value={userLeaveForm.from}
                  onChange={(event) => setUserLeaveForm((prev) => ({ ...prev, from: event.target.value }))}
                />
                {userLeaveErrors.from && <p className="text-xs text-red-500">{userLeaveErrors.from}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink-400">To Date</label>
                <input
                  className="input-field w-full"
                  type="date"
                  required
                  value={userLeaveForm.to}
                  onChange={(event) => setUserLeaveForm((prev) => ({ ...prev, to: event.target.value }))}
                />
                {userLeaveErrors.to && <p className="text-xs text-red-500">{userLeaveErrors.to}</p>}
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-semibold text-ink-400">Reason (minimum 10 characters)</label>
                <textarea
                  className="input-field w-full"
                  placeholder="Provide detailed reason for leave..."
                  required
                  rows="3"
                  value={userLeaveForm.reason}
                  onChange={(event) => setUserLeaveForm((prev) => ({ ...prev, reason: event.target.value }))}
                />
                <div className="flex items-center justify-between text-xs text-ink-300">
                  <span>{userLeaveForm.reason.trim().length}/10 characters minimum</span>
                  <button
                    type="submit"
                    className="rounded-xl bg-ink-500 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Apply Leave
                  </button>
                </div>
                {userLeaveErrors.reason && <p className="text-xs text-red-500">{userLeaveErrors.reason}</p>}
                {userLeaveErrors.general && <p className="text-xs text-red-500">{userLeaveErrors.general}</p>}
              </div>
            </form>
          </section>

          <section className="glass-panel rounded-3xl p-6 shadow-lift">
            <h3 className="text-sm font-semibold text-ink-500">My Leave Requests</h3>
            <div className="mt-3 overflow-x-auto overflow-hidden rounded-2xl border border-sand-200">
              <div className="grid grid-cols-[1fr_0.8fr_0.6fr_0.6fr_0.6fr] bg-sand-50 px-4 py-4 text-xs uppercase tracking-[0.2em] text-ink-500 font-semibold border-b border-sand-200 min-w-[650px]">
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
                    className="grid grid-cols-[1fr_0.8fr_0.6fr_0.6fr_0.6fr] items-center border-t border-sand-200 px-4 py-4 text-sm font-semibold text-ink-500"
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
        )}

        {activeTab === 'salary' && (
        <div className="mt-8 grid gap-6">
          <section className="glass-panel rounded-3xl p-6 shadow-lift">
            <div className="flex items-center justify-between">
              <h2 className="section-title text-xl">Salary Slip</h2>
              <a
                href="/salary"
                className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Open Printable Slip
              </a>
            </div>
            <p className="mt-2 text-sm text-ink-300">Showing salary for {selectedMonth}</p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-sand-200 bg-white/70 p-4">
                <h3 className="text-sm font-semibold text-ink-500">Earnings</h3>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-ink-400">Base Salary</span><span>₹{salaryBase.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-ink-400">HRA</span><span>₹{salaryHra.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-ink-400">Transport</span><span>₹{salaryTransport.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-ink-400">Other Allowance</span><span>₹{salaryOtherAllowance.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-ink-400">Performance Bonus</span><span>₹{salaryBonus.toLocaleString()}</span></div>
                  <div className="flex justify-between border-t border-sand-200 pt-2 font-semibold"><span>Gross</span><span>₹{grossSalary.toLocaleString()}</span></div>
                </div>
              </div>

              <div className="rounded-2xl border border-sand-200 bg-white/70 p-4">
                <h3 className="text-sm font-semibold text-ink-500">Deductions</h3>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-ink-400">PF</span><span>₹{salaryPf.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-ink-400">Tax</span><span>₹{salaryTax.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-ink-400">Other Deduction</span><span>₹{salaryOtherDeduction.toLocaleString()}</span></div>
                  <div className="flex justify-between border-t border-sand-200 pt-2 font-semibold"><span>Total Deductions</span><span>₹{totalDeductions.toLocaleString()}</span></div>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-brand-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-ink-500">Net Salary</span>
                <span className="text-2xl font-bold text-brand-600">₹{netSalary.toLocaleString()}</span>
              </div>
            </div>
          </section>
        </div>
        )}
      </div>
    </div>
  )
}
