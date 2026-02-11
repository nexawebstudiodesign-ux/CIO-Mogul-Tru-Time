import { useEffect, useMemo, useState } from 'react'

const initialUsers = [
  { id: 'CIO-0001', name: 'Anita Rao', email: 'anita@ciomogul.com', status: 'Active', leave: 12 },
  { id: 'CIO-0002', name: 'Kunal Mehta', email: 'kunal@ciomogul.com', status: 'Active', leave: 8 },
  { id: 'CIO-0003', name: 'Riya Nair', email: 'riya@ciomogul.com', status: 'Inactive', leave: 5 },
  { id: 'CIO-0004', name: 'Vikram Shah', email: 'vikram@ciomogul.com', status: 'Active', leave: 14 },
]

const initialLeaves = [
  {
    id: 'L-1001',
    userId: 'CIO-0003',
    name: 'Riya Nair',
    type: 'Sick',
    from: '2026-02-10',
    to: '2026-02-12',
    days: 3,
    status: 'Pending',
  },
  {
    id: 'L-1002',
    userId: 'CIO-0001',
    name: 'Anita Rao',
    type: 'Paid',
    from: '2026-02-18',
    to: '2026-02-18',
    days: 1,
    status: 'Approved',
  },
  {
    id: 'L-1003',
    userId: 'CIO-0002',
    name: 'Kunal Mehta',
    type: 'Casual',
    from: '2026-02-20',
    to: '2026-02-21',
    days: 2,
    status: 'Pending',
  },
  {
    id: 'L-1004',
    userId: 'CIO-0004',
    name: 'Vikram Shah',
    type: 'Paid',
    from: '2026-01-06',
    to: '2026-01-06',
    days: 1,
    status: 'Approved',
  },
]

const attendance = [
  { userId: 'CIO-0001', date: '2026-02-01', hours: 9.2, mails: 210, data: 48, linkedin: 34, followUps: 9 },
  { userId: 'CIO-0001', date: '2026-02-02', hours: 8.4, mails: 180, data: 45, linkedin: 28, followUps: 7 },
  { userId: 'CIO-0001', date: '2026-02-03', hours: 9.0, mails: 240, data: 52, linkedin: 36, followUps: 10 },
  { userId: 'CIO-0001', date: '2026-02-04', hours: 9.4, mails: 195, data: 50, linkedin: 31, followUps: 8 },
  { userId: 'CIO-0002', date: '2026-02-01', hours: 8.8, mails: 170, data: 38, linkedin: 24, followUps: 6 },
  { userId: 'CIO-0002', date: '2026-02-02', hours: 9.1, mails: 190, data: 42, linkedin: 29, followUps: 7 },
  { userId: 'CIO-0002', date: '2026-02-03', hours: 9.3, mails: 205, data: 40, linkedin: 26, followUps: 9 },
  { userId: 'CIO-0003', date: '2026-02-01', hours: 7.9, mails: 120, data: 33, linkedin: 18, followUps: 5 },
  { userId: 'CIO-0003', date: '2026-02-02', hours: 8.2, mails: 135, data: 34, linkedin: 21, followUps: 6 },
  { userId: 'CIO-0004', date: '2026-02-01', hours: 9.6, mails: 220, data: 58, linkedin: 40, followUps: 12 },
  { userId: 'CIO-0004', date: '2026-02-02', hours: 9.4, mails: 210, data: 55, linkedin: 38, followUps: 11 },
  { userId: 'CIO-0004', date: '2026-01-20', hours: 9.1, mails: 190, data: 49, linkedin: 32, followUps: 8 },
]

const currentMonth = new Date().toISOString().slice(0, 7)

function App() {
  const currentPath = window.location.pathname.toLowerCase()
  const isDashboardRoute = currentPath === '/dashboard'
  const isLoginRoute = currentPath === '/login'
  const requiredPassword = import.meta.env.VITE_DASHBOARD_PASSWORD || 'ciomogul'
  const [passwordInput, setPasswordInput] = useState('')
  const [authError, setAuthError] = useState('')
  const [isAuthorized, setIsAuthorized] = useState(
    localStorage.getItem('ciomogul_admin_ok') === 'true',
  )
  const [loginInput, setLoginInput] = useState({ employeeId: '', password: '' })
  const [loginError, setLoginError] = useState('')
  const [users, setUsers] = useState(initialUsers)
  const [leaves, setLeaves] = useState(initialLeaves)
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const [selectedUserId, setSelectedUserId] = useState(initialUsers[0].id)
  const [selectedLeaveId, setSelectedLeaveId] = useState(initialLeaves[0]?.id ?? '')
  const [showUserModal, setShowUserModal] = useState(false)
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [modalMode, setModalMode] = useState('add')
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', leaveBalance: '' })
  const [userFormErrors, setUserFormErrors] = useState({})
  const [leaveForm, setLeaveForm] = useState({ userId: '', type: 'Casual', from: '', to: '', reason: '' })
  const [leaveFormErrors, setLeaveFormErrors] = useState({})

  const filteredAttendance = useMemo(
    () => attendance.filter((record) => record.date.startsWith(selectedMonth)),
    [selectedMonth],
  )

  const userAttendance = useMemo(
    () => filteredAttendance.filter((record) => record.userId === selectedUserId),
    [filteredAttendance, selectedUserId],
  )

  const filteredLeaves = useMemo(
    () => leaves.filter((leave) => leave.from.startsWith(selectedMonth)),
    [selectedMonth],
  )

  const userLeaves = useMemo(
    () => filteredLeaves.filter((leave) => leave.userId === selectedUserId),
    [filteredLeaves, selectedUserId],
  )

  useEffect(() => {
    if (userLeaves.length === 0) {
      setSelectedLeaveId('')
      return
    }
    setSelectedLeaveId((prev) => (userLeaves.some((leave) => leave.id === prev) ? prev : userLeaves[0].id))
  }, [userLeaves])

  const userStats = useMemo(() => {
    const entries = userAttendance.length
    const totalHours = userAttendance.reduce((sum, record) => sum + record.hours, 0)
    const avgHours = entries ? totalHours / entries : 0
    const complianceCount = userAttendance.filter((record) => record.hours >= 9).length
    const compliance = entries ? Math.round((complianceCount / entries) * 100) : 0
    return { entries, totalHours, avgHours, compliance }
  }, [userAttendance])

  const monthSummary = useMemo(() => {
    return users.map((user) => {
      const records = filteredAttendance.filter((record) => record.userId === user.id)
      const entries = records.length
      const totalHours = records.reduce((sum, record) => sum + record.hours, 0)
      const avgHours = entries ? totalHours / entries : 0
      const complianceCount = records.filter((record) => record.hours >= 9).length
      const compliance = entries ? Math.round((complianceCount / entries) * 100) : 0
      return {
        ...user,
        entries,
        totalHours,
        avgHours,
        compliance,
      }
    })
  }, [filteredAttendance])

  const selectedUser = users.find((user) => user.id === selectedUserId)

  const handlePasswordSubmit = (event) => {
    event.preventDefault()
    if (passwordInput === requiredPassword) {
      localStorage.setItem('ciomogul_admin_ok', 'true')
      setIsAuthorized(true)
      setAuthError('')
      return
    }
    setAuthError('Incorrect password. Please try again.')
  }

  const openUserModal = (mode) => {
    setModalMode(mode)
    setUserFormErrors({})
    if (mode === 'add') {
      setUserForm({ name: '', email: '', password: '', leaveBalance: '' })
    }
    if (mode === 'edit') {
      const user = users.find((item) => item.id === selectedUserId)
      if (user) {
        setUserForm({
          name: user.name,
          email: user.email,
          password: '',
          leaveBalance: String(user.leave ?? 0),
        })
      }
    }
    setShowUserModal(true)
  }

  const openLeaveModal = (mode) => {
    setModalMode(mode)
    setLeaveFormErrors({})
    if (mode === 'add') {
      setLeaveForm({
        userId: selectedUserId,
        type: 'Casual',
        from: '',
        to: '',
        reason: '',
      })
    }
    if (mode === 'edit') {
      const leave = leaves.find((item) => item.id === selectedLeaveId)
      if (leave) {
        setLeaveForm({
          userId: leave.userId,
          type: leave.type,
          from: leave.from,
          to: leave.to,
          reason: '',
        })
      }
    }
    setShowLeaveModal(true)
  }

  const handleLoginSubmit = (event) => {
    event.preventDefault()
    const sampleId = 'CIO-0001'
    const samplePassword = 'Welcome@123'
    if (loginInput.employeeId === sampleId && loginInput.password === samplePassword) {
      setLoginError('')
      window.location.href = '/dashboard'
      return
    }
    setLoginError('Invalid credentials. Try the sample login below.')
  }

  const getNextEmployeeId = (list) => {
    const prefix = 'CIO-'
    let max = 0
    list.forEach((user) => {
      const match = user.id.match(/CIO-(\d+)/)
      if (match) {
        max = Math.max(max, Number(match[1]))
      }
    })
    return `${prefix}${String(max + 1).padStart(4, '0')}`
  }

  const getNextLeaveId = (list) => {
    let max = 0
    list.forEach((leave) => {
      const match = leave.id.match(/L-(\d+)/)
      if (match) {
        max = Math.max(max, Number(match[1]))
      }
    })
    return `L-${String(max + 1).padStart(4, '0')}`
  }

  const validateUserForm = (mode) => {
    const errors = {}
    if (!userForm.name.trim()) {
      errors.name = 'Name is required.'
    }
    if (!userForm.email.trim()) {
      errors.email = 'Email is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userForm.email)) {
      errors.email = 'Enter a valid email.'
    }
    if (mode === 'add' && !userForm.password.trim()) {
      errors.password = 'Password is required.'
    } else if (userForm.password && userForm.password.length < 6) {
      errors.password = 'Password must be at least 6 characters.'
    }
    const balanceValue = userForm.leaveBalance === '' ? 0 : Number(userForm.leaveBalance)
    if (Number.isNaN(balanceValue) || balanceValue < 0) {
      errors.leaveBalance = 'Leave balance must be 0 or more.'
    }
    return errors
  }

  const validateLeaveForm = () => {
    const errors = {}
    if (!leaveForm.userId.trim()) {
      errors.userId = 'Employee is required.'
    }
    if (!leaveForm.from) {
      errors.from = 'From date is required.'
    }
    if (!leaveForm.to) {
      errors.to = 'To date is required.'
    }
    if (leaveForm.from && leaveForm.to && leaveForm.to < leaveForm.from) {
      errors.to = 'To date must be after From date.'
    }
    if (!leaveForm.reason.trim()) {
      errors.reason = 'Reason is required.'
    }
    return errors
  }

  const handleUserSubmit = (event) => {
    event.preventDefault()
    const errors = validateUserForm(modalMode)
    setUserFormErrors(errors)
    if (Object.keys(errors).length > 0) {
      return
    }
    if (modalMode === 'add') {
      const newUser = {
        id: getNextEmployeeId(users),
        name: userForm.name.trim(),
        email: userForm.email.trim(),
        status: 'Active',
        leave: Number(userForm.leaveBalance || 0),
      }
      setUsers((prev) => [newUser, ...prev])
      setSelectedUserId(newUser.id)
    }
    if (modalMode === 'edit') {
      setUsers((prev) =>
        prev.map((user) =>
          user.id === selectedUserId
            ? {
                ...user,
                name: userForm.name.trim(),
                email: userForm.email.trim(),
                leave: Number(userForm.leaveBalance || 0),
              }
            : user,
        ),
      )
    }
    setShowUserModal(false)
  }

  const handleUserDelete = () => {
    if (!selectedUserId) {
      setUserFormErrors({ general: 'Select a user to delete.' })
      return
    }
    setUsers((prev) => prev.filter((user) => user.id !== selectedUserId))
    setLeaves((prev) => prev.filter((leave) => leave.userId !== selectedUserId))
    const remaining = users.filter((user) => user.id !== selectedUserId)
    setSelectedUserId(remaining[0]?.id ?? '')
    setShowUserModal(false)
  }

  const handleLeaveSubmit = (event) => {
    event.preventDefault()
    const errors = validateLeaveForm()
    setLeaveFormErrors(errors)
    if (Object.keys(errors).length > 0) {
      return
    }
    const days = Math.round((new Date(leaveForm.to) - new Date(leaveForm.from)) / 86400000) + 1
    if (modalMode === 'add') {
      const user = users.find((item) => item.id === leaveForm.userId)
      const newLeave = {
        id: getNextLeaveId(leaves),
        userId: leaveForm.userId,
        name: user?.name ?? 'Unknown',
        type: leaveForm.type,
        from: leaveForm.from,
        to: leaveForm.to,
        days,
        status: 'Pending',
      }
      setLeaves((prev) => [newLeave, ...prev])
      setSelectedLeaveId(newLeave.id)
    }
    if (modalMode === 'edit') {
      if (!selectedLeaveId) {
        setLeaveFormErrors({ general: 'Select a leave record to edit.' })
        return
      }
      setLeaves((prev) =>
        prev.map((leave) =>
          leave.id === selectedLeaveId
            ? {
                ...leave,
                userId: leaveForm.userId,
                name: users.find((item) => item.id === leaveForm.userId)?.name ?? leave.name,
                type: leaveForm.type,
                from: leaveForm.from,
                to: leaveForm.to,
                days,
              }
            : leave,
        ),
      )
    }
    setShowLeaveModal(false)
  }

  const handleLeaveDelete = () => {
    if (!selectedLeaveId) {
      setLeaveFormErrors({ general: 'Select a leave record to delete.' })
      return
    }
    setLeaves((prev) => prev.filter((leave) => leave.id !== selectedLeaveId))
    const remaining = leaves.filter((leave) => leave.id !== selectedLeaveId)
    setSelectedLeaveId(remaining[0]?.id ?? '')
    setShowLeaveModal(false)
  }

  if (isLoginRoute) {
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
                value={loginInput.employeeId}
                onChange={(event) =>
                  setLoginInput((prev) => ({ ...prev, employeeId: event.target.value }))
                }
              />
              <input
                className="input-field"
                type="password"
                placeholder="Password"
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
            <div className="mt-6 rounded-2xl border border-sand-200 bg-white/70 p-4 text-sm text-ink-400">
              <p className="text-xs uppercase tracking-[0.2em] text-ink-300">Sample login</p>
              <p className="mt-2">Employee ID: <span className="font-semibold text-ink-500">CIO-0001</span></p>
              <p>Password: <span className="font-semibold text-ink-500">Welcome@123</span></p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isDashboardRoute) {
    return (
      <div className="min-h-screen p-6 md:p-10">
        <div className="mx-auto max-w-3xl">
          <div className="glass-panel rounded-3xl p-8 shadow-lift">
            <p className="text-sm uppercase tracking-[0.3em] text-ink-300">CIO Mogul</p>
            <h1 className="section-title mt-3">Welcome</h1>
            <p className="mt-3 text-sm text-ink-300">
              Go to the admin dashboard to view attendance and leave records.
            </p>
            <a
              className="mt-6 inline-flex items-center rounded-full bg-ink-500 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-sand-50"
              href="/dashboard"
            >
              Open Dashboard
            </a>
            <a
              className="mt-4 inline-flex items-center rounded-full border border-sand-200 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-ink-400"
              href="/login"
            >
              User Login
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen p-6 md:p-10">
        <div className="mx-auto max-w-lg">
          <div className="glass-panel rounded-3xl p-8 shadow-lift">
            <p className="text-sm uppercase tracking-[0.3em] text-ink-300">CIO Mogul</p>
            <h1 className="section-title mt-3">Dashboard Access</h1>
            <p className="mt-2 text-sm text-ink-300">
              Enter the admin password to continue.
            </p>
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

  const handleExportCsv = () => {
    const headers = ['Employee ID', 'Name', 'Email', 'Entries', 'Total Hours', 'Avg Hours', '9h Compliance %']
    const rows = monthSummary.map((user) => [
      user.id,
      user.name,
      user.email,
      user.entries,
      user.totalHours.toFixed(1),
      user.avgHours.toFixed(1),
      user.compliance,
    ])
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `ciomogul-${selectedMonth}-summary.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-ink-300">CIO Mogul</p>
            <h1 className="section-title">Admin Performance Dashboard</h1>
            <p className="mt-2 max-w-xl text-sm text-ink-300">
              Review all user records, drill into individual leave history, and track monthly 9-hour compliance.
            </p>
          </div>
          <div className="glass-panel flex w-full flex-col gap-3 rounded-2xl p-4 shadow-lift md:w-auto md:min-w-[280px]">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-300">Selected Month</span>
              <input
                type="month"
                className="rounded-lg border border-sand-200 bg-white/80 px-3 py-1 text-sm font-semibold text-ink-500"
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
              />
            </div>
            <div className="h-px bg-sand-200" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-300">Overall Compliance</span>
              <span className="pill bg-brand-100 text-brand-700">{Math.round(
                (monthSummary.reduce((sum, user) => sum + user.compliance, 0) / monthSummary.length) || 0,
              )}%</span>
            </div>
          </div>
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <section className="glass-panel rounded-3xl p-6 shadow-lift">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="section-title text-xl">All User Records</h2>
                <p className="text-sm text-ink-300">Click a user to see leave and Tru Time details.</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs uppercase tracking-[0.2em] text-ink-300">Month</span>
                <input
                  type="month"
                  className="rounded-lg border border-sand-200 bg-white/80 px-3 py-1 text-sm font-semibold text-ink-500"
                  value={selectedMonth}
                  onChange={(event) => setSelectedMonth(event.target.value)}
                />
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="rounded-full bg-ink-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-sand-50"
                >
                  Export CSV
                </button>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-sand-200">
              <div className="grid grid-cols-[1.2fr_0.9fr_0.8fr_0.8fr_0.7fr_0.9fr] bg-sand-50 px-4 py-3 text-xs uppercase tracking-[0.2em] text-ink-300">
                <span>User</span>
                <span>Entries</span>
                <span>Total Hours</span>
                <span>Avg Hours</span>
                <span>9h %</span>
                <span>Actions</span>
              </div>
              {monthSummary.map((user) => (
                <button
                  type="button"
                  key={user.id}
                  onClick={() => setSelectedUserId(user.id)}
                  className={`grid w-full grid-cols-[1.2fr_0.9fr_0.8fr_0.8fr_0.7fr_0.9fr] items-center border-t border-sand-100 px-4 py-3 text-left text-sm transition ${
                    selectedUserId === user.id ? 'bg-brand-50/80' : 'hover:bg-sand-50/80'
                  }`}
                >
                  <div>
                    <p className="font-semibold text-ink-500">{user.name}</p>
                    <p className="text-xs text-ink-300">{user.id}</p>
                  </div>
                  <span className="font-semibold text-ink-500">{user.entries}</span>
                  <span className="text-ink-400">{user.totalHours.toFixed(1)}</span>
                  <span className="text-ink-400">{user.avgHours.toFixed(1)}</span>
                  <span className="pill bg-brand-100 text-brand-700">{user.compliance}%</span>
                  <span className="flex flex-wrap gap-2 text-xs font-semibold text-ink-400">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation()
                        setSelectedUserId(user.id)
                        openUserModal('edit')
                      }}
                      className="rounded-lg border border-sand-200 px-2 py-1"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation()
                        setSelectedUserId(user.id)
                        openUserModal('delete')
                      }}
                      className="rounded-lg border border-sand-200 px-2 py-1"
                    >
                      Delete
                    </button>
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow"
                onClick={() => openUserModal('add')}
              >
                Add user
              </button>
              <button
                className="rounded-xl border border-sand-200 px-4 py-2 text-sm font-semibold text-ink-400"
                onClick={() => openUserModal('edit')}
              >
                Edit selected
              </button>
              <button
                className="rounded-xl border border-sand-200 px-4 py-2 text-sm font-semibold text-ink-400"
                onClick={() => openUserModal('delete')}
              >
                Delete selected
              </button>
            </div>
          </section>

          <section className="glass-panel rounded-3xl p-6 shadow-lift">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="section-title text-xl">{selectedUser?.name ?? 'User'} Overview</h2>
                <p className="text-sm text-ink-300">{selectedUser?.id} · {selectedUser?.email}</p>
              </div>
              <span
                className={`pill ${
                  selectedUser?.status === 'Active'
                    ? 'bg-brand-100 text-brand-700'
                    : 'bg-sand-100 text-ink-300'
                }`}
              >
                {selectedUser?.status}
              </span>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-sand-200 bg-white/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-ink-300">Entries</p>
                <p className="mt-2 text-2xl font-semibold text-ink-500">{userStats.entries}</p>
              </div>
              <div className="rounded-2xl border border-sand-200 bg-white/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-ink-300">Avg Hours</p>
                <p className="mt-2 text-2xl font-semibold text-ink-500">{userStats.avgHours.toFixed(1)}</p>
              </div>
              <div className="rounded-2xl border border-sand-200 bg-white/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-ink-300">9h Compliance</p>
                <p className="mt-2 text-2xl font-semibold text-ink-500">{userStats.compliance}%</p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-sand-100">
                  <div
                    className="h-full rounded-full bg-brand-500"
                    style={{ width: `${userStats.compliance}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-ink-500">Tru Time Records</h3>
              <div className="mt-3 overflow-hidden rounded-2xl border border-sand-200">
                <div className="grid grid-cols-[0.9fr_0.6fr_0.7fr_0.7fr_0.7fr_0.7fr] bg-sand-50 px-4 py-3 text-xs uppercase tracking-[0.2em] text-ink-300">
                  <span>Date</span>
                  <span>Hours</span>
                  <span>Mails</span>
                  <span>Data</span>
                  <span>LinkedIn</span>
                  <span>Follow Ups</span>
                </div>
                {userAttendance.map((record) => (
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
                {userAttendance.length === 0 && (
                  <div className="px-4 py-6 text-sm text-ink-300">No Tru Time records for this month.</div>
                )}
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-ink-500">Leaves</h3>
                <div className="flex gap-2">
                  <button
                    className="rounded-lg bg-brand-600 px-3 py-1 text-xs font-semibold text-white"
                    onClick={() => openLeaveModal('add')}
                  >
                    Add leave
                  </button>
                  <button
                    className="rounded-lg border border-sand-200 px-3 py-1 text-xs font-semibold text-ink-400"
                    onClick={() => openLeaveModal('edit')}
                  >
                    Edit leave
                  </button>
                  <button
                    className="rounded-lg border border-sand-200 px-3 py-1 text-xs font-semibold text-ink-400"
                    onClick={() => openLeaveModal('delete')}
                  >
                    Delete leave
                  </button>
                </div>
              </div>
              <div className="mt-3 overflow-hidden rounded-2xl border border-sand-200">
                <div className="grid grid-cols-[1fr_0.8fr_0.6fr_0.6fr] bg-sand-50 px-4 py-3 text-xs uppercase tracking-[0.2em] text-ink-300">
                  <span>Type</span>
                  <span>Date Range</span>
                  <span>Days</span>
                  <span>Status</span>
                </div>
                {userLeaves.map((leave) => (
                  <button
                    type="button"
                    key={leave.id}
                    onClick={() => setSelectedLeaveId(leave.id)}
                    className={`grid w-full grid-cols-[1fr_0.8fr_0.6fr_0.6fr] items-center border-t border-sand-100 px-4 py-3 text-left text-sm transition ${
                      selectedLeaveId === leave.id ? 'bg-brand-50/80' : 'hover:bg-sand-50/80'
                    }`}
                  >
                    <span className="font-semibold text-ink-500">{leave.type}</span>
                    <span className="text-ink-400">{leave.from} → {leave.to}</span>
                    <span className="text-ink-400">{leave.days}</span>
                    <span
                      className={`pill ${
                        leave.status === 'Approved'
                          ? 'bg-brand-100 text-brand-700'
                          : 'bg-sand-100 text-ink-300'
                      }`}
                    >
                      {leave.status}
                    </span>
                  </button>
                ))}
                {userLeaves.length === 0 && (
                  <div className="px-4 py-6 text-sm text-ink-300">No leave records for this month.</div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 shadow-lift">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-ink-500">
                {modalMode === 'add' && 'Add User'}
                {modalMode === 'edit' && 'Edit User'}
                {modalMode === 'delete' && 'Delete User'}
              </h3>
              <button
                className="text-sm text-ink-300"
                onClick={() => setShowUserModal(false)}
              >
                Close
              </button>
            </div>
            {modalMode !== 'delete' ? (
              <form className="mt-4 grid gap-3" onSubmit={handleUserSubmit}>
                <div>
                  <input
                    className="input-field"
                    placeholder="Full name"
                    value={userForm.name}
                    onChange={(event) => setUserForm((prev) => ({ ...prev, name: event.target.value }))}
                  />
                  {userFormErrors.name && <p className="mt-1 text-xs text-red-500">{userFormErrors.name}</p>}
                </div>
                <div>
                  <input
                    className="input-field"
                    placeholder="Email"
                    value={userForm.email}
                    onChange={(event) => setUserForm((prev) => ({ ...prev, email: event.target.value }))}
                  />
                  {userFormErrors.email && <p className="mt-1 text-xs text-red-500">{userFormErrors.email}</p>}
                </div>
                <div>
                  <input
                    className="input-field"
                    placeholder="Password"
                    type="password"
                    value={userForm.password}
                    onChange={(event) => setUserForm((prev) => ({ ...prev, password: event.target.value }))}
                  />
                  {userFormErrors.password && (
                    <p className="mt-1 text-xs text-red-500">{userFormErrors.password}</p>
                  )}
                </div>
                <div>
                  <input
                    className="input-field"
                    placeholder="Leave balance"
                    value={userForm.leaveBalance}
                    onChange={(event) =>
                      setUserForm((prev) => ({ ...prev, leaveBalance: event.target.value }))
                    }
                  />
                  {userFormErrors.leaveBalance && (
                    <p className="mt-1 text-xs text-red-500">{userFormErrors.leaveBalance}</p>
                  )}
                </div>
                <button className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white">
                  Save
                </button>
              </form>
            ) : (
              <div className="mt-4">
                {userFormErrors.general && (
                  <p className="text-sm text-red-500">{userFormErrors.general}</p>
                )}
                <p className="text-sm text-ink-300">This will remove the selected user.</p>
                <button
                  className="mt-4 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
                  onClick={handleUserDelete}
                >
                  Confirm delete
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 shadow-lift">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-ink-500">
                {modalMode === 'add' && 'Add Leave'}
                {modalMode === 'edit' && 'Edit Leave'}
                {modalMode === 'delete' && 'Delete Leave'}
              </h3>
              <button
                className="text-sm text-ink-300"
                onClick={() => setShowLeaveModal(false)}
              >
                Close
              </button>
            </div>
            {modalMode !== 'delete' ? (
              <form className="mt-4 grid gap-3" onSubmit={handleLeaveSubmit}>
                <div>
                  <select
                    className="input-field"
                    value={leaveForm.userId}
                    onChange={(event) => setLeaveForm((prev) => ({ ...prev, userId: event.target.value }))}
                  >
                    <option value="">Select employee</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.id})
                      </option>
                    ))}
                  </select>
                  {leaveFormErrors.userId && <p className="mt-1 text-xs text-red-500">{leaveFormErrors.userId}</p>}
                </div>
                <div>
                  <select
                    className="input-field"
                    value={leaveForm.type}
                    onChange={(event) => setLeaveForm((prev) => ({ ...prev, type: event.target.value }))}
                  >
                    <option>Casual</option>
                    <option>Sick</option>
                    <option>Paid</option>
                  </select>
                </div>
                <div>
                  <input
                    className="input-field"
                    type="date"
                    value={leaveForm.from}
                    onChange={(event) => setLeaveForm((prev) => ({ ...prev, from: event.target.value }))}
                  />
                  {leaveFormErrors.from && <p className="mt-1 text-xs text-red-500">{leaveFormErrors.from}</p>}
                </div>
                <div>
                  <input
                    className="input-field"
                    type="date"
                    value={leaveForm.to}
                    onChange={(event) => setLeaveForm((prev) => ({ ...prev, to: event.target.value }))}
                  />
                  {leaveFormErrors.to && <p className="mt-1 text-xs text-red-500">{leaveFormErrors.to}</p>}
                </div>
                <div>
                  <input
                    className="input-field"
                    placeholder="Reason"
                    value={leaveForm.reason}
                    onChange={(event) => setLeaveForm((prev) => ({ ...prev, reason: event.target.value }))}
                  />
                  {leaveFormErrors.reason && (
                    <p className="mt-1 text-xs text-red-500">{leaveFormErrors.reason}</p>
                  )}
                </div>
                {leaveFormErrors.general && <p className="text-xs text-red-500">{leaveFormErrors.general}</p>}
                <button className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white">
                  Save
                </button>
              </form>
            ) : (
              <div className="mt-4">
                {leaveFormErrors.general && (
                  <p className="text-sm text-red-500">{leaveFormErrors.general}</p>
                )}
                <p className="text-sm text-ink-300">This will remove the selected leave record.</p>
                <button
                  className="mt-4 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
                  onClick={handleLeaveDelete}
                >
                  Confirm delete
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
