import { useEffect, useMemo, useState } from 'react'


const initialUsers = [
  {
    id: 'CIO-0001',
    name: 'Anita Rao',
    email: 'anita@ciomogul.com',
    status: 'Active',
    casualBalance: 12,
    sickBalance: 12,
    sickBaseMonth: currentMonth,
    baseSalary: 50000,
    hra: 15000,
    transportAllowance: 3000,
    otherAllowance: 2000,
    pfDeduction: 6000,
    taxDeduction: 5000,
    otherDeduction: 0,
  },
  {
    id: 'CIO-0002',
    name: 'Kunal Mehta',
    email: 'kunal@ciomogul.com',
    status: 'Active',
    casualBalance: 12,
    sickBalance: 12,
    sickBaseMonth: currentMonth,
    baseSalary: 55000,
    hra: 16500,
    transportAllowance: 3000,
    otherAllowance: 2500,
    pfDeduction: 6600,
    taxDeduction: 6000,
    otherDeduction: 0,
  },
  {
    id: 'CIO-0003',
    name: 'Riya Nair',
    email: 'riya@ciomogul.com',
    status: 'Inactive',
    casualBalance: 10,
    sickBalance: 12,
    sickBaseMonth: currentMonth,
    baseSalary: 45000,
    hra: 13500,
    transportAllowance: 3000,
    otherAllowance: 1500,
    pfDeduction: 5400,
    taxDeduction: 4000,
    otherDeduction: 0,
  },
  {
    id: 'CIO-0004',
    name: 'Vikram Shah',
    email: 'vikram@ciomogul.com',
    status: 'Active',
    casualBalance: 12,
    sickBalance: 12,
    sickBaseMonth: currentMonth,
    baseSalary: 60000,
    hra: 18000,
    transportAllowance: 3500,
    otherAllowance: 3000,
    pfDeduction: 7200,
    taxDeduction: 7500,
    otherDeduction: 0,
  },
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

const initialAttendance = [
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

const initialMonthlySalaries = [
  {
    id: 'MS-001',
    userId: 'CIO-0001',
    month: '2026-02',
    baseSalary: 50000,
    hra: 15000,
    transportAllowance: 3000,
    otherAllowance: 2000,
    performanceBonus: 5000,
    pfDeduction: 6000,
    taxDeduction: 5000,
    otherDeduction: 0,
  },
  {
    id: 'MS-002',
    userId: 'CIO-0002',
    month: '2026-02',
    baseSalary: 55000,
    hra: 16500,
    transportAllowance: 3000,
    otherAllowance: 2500,
    performanceBonus: 3000,
    pfDeduction: 6600,
    taxDeduction: 6000,
    otherDeduction: 0,
  },
  {
    id: 'MS-003',
    userId: 'CIO-0004',
    month: '2026-02',
    baseSalary: 60000,
    hra: 18000,
    transportAllowance: 3500,
    otherAllowance: 3000,
    performanceBonus: 7000,
    pfDeduction: 7200,
    taxDeduction: 7500,
    otherDeduction: 0,
  },
]

function App() {
  const currentPath = window.location.pathname.toLowerCase()
  const isDashboardRoute = currentPath === '/dashboard'
  const isLoginRoute = currentPath === '/login'
  const isUserRoute = currentPath === '/user'
  const isSalaryRoute = currentPath === '/salary'
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
  const [attendance, setAttendance] = useState(initialAttendance)
  const [monthlySalaries, setMonthlySalaries] = useState(initialMonthlySalaries)
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const [selectedUserId, setSelectedUserId] = useState(initialUsers[0].id)
  const [selectedLeaveId, setSelectedLeaveId] = useState(initialLeaves[0]?.id ?? '')
  const [showUserModal, setShowUserModal] = useState(false)
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [showSalaryModal, setShowSalaryModal] = useState(false)
  const [modalMode, setModalMode] = useState('add')
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    casualBalance: '',
    sickBalance: '',
  })
  const [userFormErrors, setUserFormErrors] = useState({})
  const [leaveForm, setLeaveForm] = useState({ userId: '', type: 'Casual', from: '', to: '', reason: '' })
  const [leaveFormErrors, setLeaveFormErrors] = useState({})
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
  const [userLeaveForm, setUserLeaveForm] = useState({ type: 'Casual', from: '', to: '', reason: '' })
  const [userLeaveErrors, setUserLeaveErrors] = useState({})
  const [salaryForm, setSalaryForm] = useState({
    baseSalary: '',
    hra: '',
    transportAllowance: '',
    otherAllowance: '',
    performanceBonus: '',
    pfDeduction: '',
    taxDeduction: '',
    otherDeduction: '',
  })
  const [salaryFormErrors, setSalaryFormErrors] = useState({})

  const filteredAttendance = useMemo(
    () => attendance.filter((record) => record.date.startsWith(selectedMonth)),
    [attendance, selectedMonth],
  )

  const userAttendance = useMemo(
    () => filteredAttendance.filter((record) => record.userId === selectedUserId),
    [filteredAttendance, selectedUserId],
  )

  const filteredLeaves = useMemo(
    () => leaves.filter((leave) => leave.from.startsWith(selectedMonth)),
    [leaves, selectedMonth],
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
  }, [filteredAttendance, users])

  const selectedUser = users.find((user) => user.id === selectedUserId)
  const loggedUserId = localStorage.getItem('ciomogul_user_id') || ''
  const loggedUser = users.find((user) => user.id === loggedUserId)
  const loggedUserAttendance = filteredAttendance.filter((record) => record.userId === loggedUserId)
  const loggedUserLeaves = filteredLeaves.filter((leave) => leave.userId === loggedUserId)

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
      setUserForm({ name: '', email: '', password: '', casualBalance: '12', sickBalance: '12' })
    }
    if (mode === 'edit') {
      const user = users.find((item) => item.id === selectedUserId)
      if (user) {
        setUserForm({
          name: user.name,
          email: user.email,
          password: '',
          casualBalance: String(user.casualBalance ?? 12),
          sickBalance: String(user.sickBalance ?? 12),
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
      localStorage.setItem('ciomogul_user_id', sampleId)
      window.location.href = '/user'
      return
    }
    setLoginError('Invalid credentials. Try the sample login below.')
  }

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
    if (!userLeaveForm.from) {
      errors.from = 'From date is required.'
    }
    if (!userLeaveForm.to) {
      errors.to = 'To date is required.'
    }
    if (userLeaveForm.from && userLeaveForm.to && userLeaveForm.to < userLeaveForm.from) {
      errors.to = 'To date must be after From date.'
    }
    if (!userLeaveForm.reason.trim()) {
      errors.reason = 'Reason is required.'
    }
    return errors
  }

  const handleUserAttendanceSubmit = (event, overrideLogout) => {
    event.preventDefault()
    const effectiveLogin = userAttendanceForm.login
    const effectiveLogout = overrideLogout || userAttendanceForm.logout
    const errors = validateUserAttendance()
    setUserAttendanceErrors(errors)
    if (Object.keys(errors).length > 0) {
      return
    }
    const loginDate = new Date(`1970-01-01T${effectiveLogin}:00`)
    const logoutDate = new Date(`1970-01-01T${effectiveLogout}:00`)
    const hours = Math.round(((logoutDate - loginDate) / 3600000) * 10) / 10
    const newRecord = {
      userId: loggedUserId,
      date: userAttendanceForm.date,
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
  }


  const handleUserLeaveSubmit = (event) => {
    event.preventDefault()
    const errors = validateUserLeave()
    setUserLeaveErrors(errors)
    if (Object.keys(errors).length > 0) {
      return
    }
    const days = Math.round((new Date(userLeaveForm.to) - new Date(userLeaveForm.from)) / 86400000) + 1
    const newLeave = {
      id: getNextLeaveId(leaves),
      userId: loggedUserId,
      name: loggedUser?.name ?? 'User',
      type: userLeaveForm.type,
      from: userLeaveForm.from,
      to: userLeaveForm.to,
      days,
      status: 'Pending',
    }
    setLeaves((prev) => [newLeave, ...prev])
    setUserLeaveForm({ type: 'Casual', from: '', to: '', reason: '' })
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

  const getNextSalaryId = (list) => {
    let max = 0
    list.forEach((salary) => {
      const match = salary.id.match(/MS-(\d+)/)
      if (match) {
        max = Math.max(max, Number(match[1]))
      }
    })
    return `MS-${String(max + 1).padStart(3, '0')}`
  }

  const clampBalance = (value) => Math.min(12, Math.max(0, value))

  const monthDiff = (fromMonth, toMonth) => {
    const [fromYear, fromMon] = fromMonth.split('-').map(Number)
    const [toYear, toMon] = toMonth.split('-').map(Number)
    return (toYear - fromYear) * 12 + (toMon - fromMon)
  }

  const getEffectiveSickBalance = (user, month) => {
    if (!user) {
      return 0
    }
    const baseMonth = user.sickBaseMonth || month
    const diff = Math.max(0, monthDiff(baseMonth, month))
    return clampBalance(user.sickBalance - diff)
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
    if (!userForm.password.trim()) {
      errors.password = 'Password is required.'
    } else if (userForm.password.length < 6) {
      errors.password = 'Password must be at least 6 characters.'
    }
    const casualValue = userForm.casualBalance === '' ? NaN : Number(userForm.casualBalance)
    const sickValue = userForm.sickBalance === '' ? NaN : Number(userForm.sickBalance)
    if (Number.isNaN(casualValue) || casualValue < 0 || casualValue > 12) {
      errors.casualBalance = 'Casual leave must be between 0 and 12.'
    }
    if (Number.isNaN(sickValue) || sickValue < 0 || sickValue > 12) {
      errors.sickBalance = 'Sick leave must be between 0 and 12.'
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
        casualBalance: clampBalance(Number(userForm.casualBalance || 0)),
        sickBalance: clampBalance(Number(userForm.sickBalance || 0)),
        sickBaseMonth: selectedMonth,
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
                casualBalance: clampBalance(Number(userForm.casualBalance || 0)),
                sickBalance: clampBalance(Number(userForm.sickBalance || 0)),
                sickBaseMonth: selectedMonth,
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

  const openSalaryModal = (mode) => {
    setModalMode(mode)
    setSalaryFormErrors({})
    const existing = monthlySalaries.find(
      (s) => s.userId === selectedUserId && s.month === selectedMonth
    )
    if (mode === 'add' || !existing) {
      setSalaryForm({
        baseSalary: '',
        hra: '',
        transportAllowance: '',
        otherAllowance: '',
        performanceBonus: '0',
        pfDeduction: '',
        taxDeduction: '',
        otherDeduction: '0',
      })
    } else {
      setSalaryForm({
        baseSalary: String(existing.baseSalary),
        hra: String(existing.hra),
        transportAllowance: String(existing.transportAllowance),
        otherAllowance: String(existing.otherAllowance),
        performanceBonus: String(existing.performanceBonus),
        pfDeduction: String(existing.pfDeduction),
        taxDeduction: String(existing.taxDeduction),
        otherDeduction: String(existing.otherDeduction),
      })
    }
    setShowSalaryModal(true)
  }

  const validateSalaryForm = () => {
    const errors = {}
    if (!salaryForm.baseSalary || Number.isNaN(Number(salaryForm.baseSalary)) || Number(salaryForm.baseSalary) < 0) {
      errors.baseSalary = 'Valid base salary required.'
    }
    if (!salaryForm.hra || Number.isNaN(Number(salaryForm.hra)) || Number(salaryForm.hra) < 0) {
      errors.hra = 'Valid HRA required.'
    }
    if (!salaryForm.transportAllowance || Number.isNaN(Number(salaryForm.transportAllowance)) || Number(salaryForm.transportAllowance) < 0) {
      errors.transportAllowance = 'Valid transport allowance required.'
    }
    if (!salaryForm.otherAllowance || Number.isNaN(Number(salaryForm.otherAllowance)) || Number(salaryForm.otherAllowance) < 0) {
      errors.otherAllowance = 'Valid other allowance required.'
    }
    if (salaryForm.performanceBonus === '' || Number.isNaN(Number(salaryForm.performanceBonus)) || Number(salaryForm.performanceBonus) < 0) {
      errors.performanceBonus = 'Valid bonus required (0 or more).'
    }
    if (!salaryForm.pfDeduction || Number.isNaN(Number(salaryForm.pfDeduction)) || Number(salaryForm.pfDeduction) < 0) {
      errors.pfDeduction = 'Valid PF deduction required.'
    }
    if (!salaryForm.taxDeduction || Number.isNaN(Number(salaryForm.taxDeduction)) || Number(salaryForm.taxDeduction) < 0) {
      errors.taxDeduction = 'Valid tax deduction required.'
    }
    if (salaryForm.otherDeduction === '' || Number.isNaN(Number(salaryForm.otherDeduction)) || Number(salaryForm.otherDeduction) < 0) {
      errors.otherDeduction = 'Valid other deduction required (0 or more).'
    }
    return errors
  }

  const handleSalarySubmit = (event) => {
    event.preventDefault()
    const errors = validateSalaryForm()
    setSalaryFormErrors(errors)
    if (Object.keys(errors).length > 0) {
      return
    }
    const existing = monthlySalaries.find(
      (s) => s.userId === selectedUserId && s.month === selectedMonth
    )
    if (existing) {
      setMonthlySalaries((prev) =>
        prev.map((s) =>
          s.id === existing.id
            ? {
                ...s,
                baseSalary: Number(salaryForm.baseSalary),
                hra: Number(salaryForm.hra),
                transportAllowance: Number(salaryForm.transportAllowance),
                otherAllowance: Number(salaryForm.otherAllowance),
                performanceBonus: Number(salaryForm.performanceBonus),
                pfDeduction: Number(salaryForm.pfDeduction),
                taxDeduction: Number(salaryForm.taxDeduction),
                otherDeduction: Number(salaryForm.otherDeduction),
              }
            : s
        )
      )
    } else {
      const newSalary = {
        id: getNextSalaryId(monthlySalaries),
        userId: selectedUserId,
        month: selectedMonth,
        baseSalary: Number(salaryForm.baseSalary),
        hra: Number(salaryForm.hra),
        transportAllowance: Number(salaryForm.transportAllowance),
        otherAllowance: Number(salaryForm.otherAllowance),
        performanceBonus: Number(salaryForm.performanceBonus),
        pfDeduction: Number(salaryForm.pfDeduction),
        taxDeduction: Number(salaryForm.taxDeduction),
        otherDeduction: Number(salaryForm.otherDeduction),
      }
      setMonthlySalaries((prev) => [newSalary, ...prev])
    }
    setShowSalaryModal(false)
  }

  if (isSalaryRoute) {
    if (!loggedUser) {
      return (
        <div className="min-h-screen p-6 md:p-10">
          <div className="mx-auto max-w-lg">
            <div className="glass-panel rounded-3xl p-8 shadow-lift">
              <p className="text-sm uppercase tracking-[0.3em] text-ink-300">CIO Mogul</p>
              <h1 className="section-title mt-3">Access Denied</h1>
              <p className="mt-2 text-sm text-ink-300">Please log in to view your salary slip.</p>
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

    const monthYear = new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    const loggedUserMonthAttendance = filteredAttendance.filter((record) => record.userId === loggedUserId)
    const totalDays = loggedUserMonthAttendance.length
    const totalHours = loggedUserMonthAttendance.reduce((sum, record) => sum + record.hours, 0)
    const avgHours = totalDays ? (totalHours / totalDays).toFixed(1) : 0
    const complianceDays = loggedUserMonthAttendance.filter((rec) => rec.hours >= 9).length
    const complianceRate = totalDays ? Math.round((complianceDays / totalDays) * 100) : 0
    const totalMails = loggedUserMonthAttendance.reduce((sum, rec) => sum + rec.mails, 0)
    const totalData = loggedUserMonthAttendance.reduce((sum, rec) => sum + rec.data, 0)
    const totalLinkedin = loggedUserMonthAttendance.reduce((sum, rec) => sum + rec.linkedin, 0)
    const totalFollowUps = loggedUserMonthAttendance.reduce((sum, rec) => sum + rec.followUps, 0)

    const monthlySalary = monthlySalaries.find(
      (s) => s.userId === loggedUserId && s.month === selectedMonth
    )
    const baseSalary = monthlySalary?.baseSalary || loggedUser.baseSalary || 0
    const hra = monthlySalary?.hra || loggedUser.hra || 0
    const transportAllowance = monthlySalary?.transportAllowance || loggedUser.transportAllowance || 0
    const otherAllowance = monthlySalary?.otherAllowance || loggedUser.otherAllowance || 0
    const performanceBonus = monthlySalary?.performanceBonus || 0
    const pfDeduction = monthlySalary?.pfDeduction || loggedUser.pfDeduction || 0
    const taxDeduction = monthlySalary?.taxDeduction || loggedUser.taxDeduction || 0
    const otherDeduction = monthlySalary?.otherDeduction || loggedUser.otherDeduction || 0
    
    const grossEarnings = baseSalary + hra + transportAllowance + otherAllowance + performanceBonus
    const totalDeductions = pfDeduction + taxDeduction + otherDeduction
    const netSalary = grossEarnings - totalDeductions

    return (
      <>
        <style>{`
          @media print {
            .no-print { display: none !important; }
            body { background: white; }
            .salary-slip-container { box-shadow: none; padding: 20px; }
          }
        `}</style>
        <div className="min-h-screen p-6 md:p-10">
          <div className="mx-auto max-w-4xl">
            <div className="no-print mb-6 flex items-center justify-between">
              <a
                href="/user"
                className="inline-flex items-center gap-2 text-sm font-semibold text-ink-500 hover:text-brand-600"
              >
                ← Back to Dashboard
              </a>
              <button
                onClick={() => window.print()}
                className="rounded-xl bg-brand-600 px-6 py-2 text-sm font-semibold text-white shadow hover:bg-brand-700"
              >
                Print / Save as PDF (Ctrl+P)
              </button>
            </div>
            
            <div className="salary-slip-container glass-panel rounded-3xl p-8 shadow-lift">
              <div className="border-b border-sand-200 pb-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-ink-300">CIO Mogul</p>
                    <h1 className="mt-2 text-3xl font-bold text-ink-500">Salary Slip</h1>
                    <p className="mt-1 text-sm text-ink-300">{monthYear}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-semibold text-ink-500">{loggedUser.name}</p>
                    <p className="text-ink-300">{loggedUser.id}</p>
                    <p className="text-ink-300">{loggedUser.email}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid gap-8 md:grid-cols-2">
                <div>
                  <h2 className="text-lg font-bold text-ink-500">Earnings</h2>
                  <div className="mt-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-ink-400">Basic Salary</span>
                      <span className="font-semibold text-ink-500">₹{baseSalary.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-ink-400">HRA</span>
                      <span className="font-semibold text-ink-500">₹{hra.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-ink-400">Transport Allowance</span>
                      <span className="font-semibold text-ink-500">₹{transportAllowance.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-ink-400">Other Allowance</span>
                      <span className="font-semibold text-ink-500">₹{otherAllowance.toLocaleString()}</span>
                    </div>
                    {performanceBonus > 0 && (
                      <div className="flex justify-between rounded-lg bg-green-50 px-3 py-2 text-sm">
                        <span className="font-semibold text-green-700">Performance Bonus</span>
                        <span className="font-bold text-green-900">₹{performanceBonus.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="border-t border-sand-200 pt-3">
                      <div className="flex justify-between font-bold">
                        <span className="text-ink-500">Gross Earnings</span>
                        <span className="text-brand-600">₹{grossEarnings.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-ink-500">Deductions</h2>
                  <div className="mt-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-ink-400">Provident Fund (PF)</span>
                      <span className="font-semibold text-ink-500">₹{pfDeduction.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-ink-400">Tax Deduction (TDS)</span>
                      <span className="font-semibold text-ink-500">₹{taxDeduction.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-ink-400">Other Deductions</span>
                      <span className="font-semibold text-ink-500">₹{otherDeduction.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-sand-200 pt-3">
                      <div className="flex justify-between font-bold">
                        <span className="text-ink-500">Total Deductions</span>
                        <span className="text-red-600">₹{totalDeductions.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-2xl bg-brand-50 p-6">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-ink-500">Net Salary</span>
                  <span className="text-2xl font-bold text-brand-600">₹{netSalary.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-8 border-t border-sand-200 pt-8">
                <h2 className="text-lg font-bold text-ink-500">Performance Summary</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl border border-sand-200 bg-white/50 p-4">
                    <p className="text-xs uppercase tracking-wide text-ink-300">Days Worked</p>
                    <p className="mt-1 text-2xl font-bold text-ink-500">{totalDays}</p>
                  </div>
                  <div className="rounded-xl border border-sand-200 bg-white/50 p-4">
                    <p className="text-xs uppercase tracking-wide text-ink-300">Avg Hours/Day</p>
                    <p className="mt-1 text-2xl font-bold text-ink-500">{avgHours}</p>
                  </div>
                  <div className="rounded-xl border border-sand-200 bg-white/50 p-4">
                    <p className="text-xs uppercase tracking-wide text-ink-300">Compliance</p>
                    <p className="mt-1 text-2xl font-bold text-brand-600">{complianceRate}%</p>
                  </div>
                  <div className="rounded-xl border border-sand-200 bg-white/50 p-4">
                    <p className="text-xs uppercase tracking-wide text-ink-300">Total Hours</p>
                    <p className="mt-1 text-2xl font-bold text-ink-500">{totalHours.toFixed(1)}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-ink-500">Productivity Metrics</h3>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg bg-blue-50 px-4 py-3">
                      <p className="text-xs text-blue-700">Mails Processed</p>
                      <p className="mt-1 text-xl font-bold text-blue-900">{totalMails}</p>
                    </div>
                    <div className="rounded-lg bg-green-50 px-4 py-3">
                      <p className="text-xs text-green-700">Data Entries</p>
                      <p className="mt-1 text-xl font-bold text-green-900">{totalData}</p>
                    </div>
                    <div className="rounded-lg bg-purple-50 px-4 py-3">
                      <p className="text-xs text-purple-700">LinkedIn Activities</p>
                      <p className="mt-1 text-xl font-bold text-purple-900">{totalLinkedin}</p>
                    </div>
                    <div className="rounded-lg bg-orange-50 px-4 py-3">
                      <p className="text-xs text-orange-700">Follow-ups</p>
                      <p className="mt-1 text-xl font-bold text-orange-900">{totalFollowUps}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t border-sand-200 pt-6 text-center text-xs text-ink-300">
                <p>This is a system-generated salary slip. No signature required.</p>
                <p className="mt-1">For queries, contact HR at hr@ciomogul.com</p>
              </div>
            </div>
          </div>
        </div>
      </>
    )
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

  if (isUserRoute) {
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

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
            <section className="glass-panel rounded-3xl p-6 shadow-lift">
              <h2 className="section-title text-xl">Daily Tru Time Entry</h2>
              <form className="mt-4 grid gap-3" onSubmit={handleUserAttendanceSubmit}>
                <div>
                  <input
                    className="input-field"
                    type="date"
                    required
                    value={userAttendanceForm.date}
                    onChange={(event) =>
                      setUserAttendanceForm((prev) => ({ ...prev, date: event.target.value }))
                    }
                  />
                  {userAttendanceErrors.date && (
                    <p className="mt-1 text-xs text-red-500">{userAttendanceErrors.date}</p>
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
              <form className="mt-4 grid gap-3" onSubmit={handleUserLeaveSubmit}>
                <select
                  className="input-field"
                  required
                  value={userLeaveForm.type}
                  onChange={(event) => setUserLeaveForm((prev) => ({ ...prev, type: event.target.value }))}
                >
                  <option>Casual</option>
                  <option>Sick</option>
                  <option>Paid</option>
                </select>
                <div>
                  <input
                    className="input-field"
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
                  <input
                    className="input-field"
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
                  <input
                    className="input-field"
                    placeholder="Reason"
                    required
                    value={userLeaveForm.reason}
                    onChange={(event) => setUserLeaveForm((prev) => ({ ...prev, reason: event.target.value }))}
                  />
                  {userLeaveErrors.reason && (
                    <p className="mt-1 text-xs text-red-500">{userLeaveErrors.reason}</p>
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
                <div className="grid grid-cols-[1fr_0.8fr_0.6fr_0.6fr] bg-sand-50 px-4 py-3 text-xs uppercase tracking-[0.2em] text-ink-300">
                  <span>Type</span>
                  <span>Date Range</span>
                  <span>Days</span>
                  <span>Status</span>
                </div>
                {loggedUserLeaves.map((leave) => (
                  <div
                    key={leave.id}
                    className="grid grid-cols-[1fr_0.8fr_0.6fr_0.6fr] items-center border-t border-sand-100 px-4 py-3 text-sm"
                  >
                    <span className="font-semibold text-ink-500">{leave.type}</span>
                    <span className="text-ink-400">{leave.from} → {leave.to}</span>
                    <span className="text-ink-400">{leave.days}</span>
                    <span className="pill bg-sand-100 text-ink-300">{leave.status}</span>
                  </div>
                ))}
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
              <div className="grid grid-cols-[1.2fr_0.7fr_0.7fr_0.7fr_0.6fr_0.6fr_0.6fr_0.9fr] bg-sand-50 px-4 py-3 text-xs uppercase tracking-[0.2em] text-ink-300">
                <span>User</span>
                <span>Entries</span>
                <span>Total Hours</span>
                <span>Avg Hours</span>
                <span>9h %</span>
                <span>Casual</span>
                <span>Sick</span>
                <span>Actions</span>
              </div>
              {monthSummary.map((user) => (
                <button
                  type="button"
                  key={user.id}
                  onClick={() => setSelectedUserId(user.id)}
                  className={`grid w-full grid-cols-[1.2fr_0.7fr_0.7fr_0.7fr_0.6fr_0.6fr_0.6fr_0.9fr] items-center border-t border-sand-100 px-4 py-3 text-left text-sm transition ${
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
                  <span className="text-ink-400">{user.casualBalance}</span>
                  <span className="text-ink-400">{getEffectiveSickBalance(user, selectedMonth)}</span>
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

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-ink-500">Monthly Salary</h3>
                <button
                  className="rounded-lg bg-brand-600 px-3 py-1 text-xs font-semibold text-white"
                  onClick={() => openSalaryModal('edit')}
                >
                  {monthlySalaries.find((s) => s.userId === selectedUserId && s.month === selectedMonth)
                    ? 'Edit Salary'
                    : 'Set Salary'}
                </button>
              </div>
              <div className="mt-3 rounded-2xl border border-sand-200 p-4">
                {monthlySalaries.find((s) => s.userId === selectedUserId && s.month === selectedMonth) ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-ink-400">Base Salary</span>
                      <span className="font-semibold text-ink-500">
                        ₹{monthlySalaries
                          .find((s) => s.userId === selectedUserId && s.month === selectedMonth)
                          ?.baseSalary.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-400">Performance Bonus</span>
                      <span className="font-semibold text-green-700">
                        ₹{monthlySalaries
                          .find((s) => s.userId === selectedUserId && s.month === selectedMonth)
                          ?.performanceBonus.toLocaleString()}
                      </span>
                    </div>
                    <div className="border-t border-sand-200 pt-2">
                      <div className="flex justify-between font-bold">
                        <span className="text-ink-500">Net Salary</span>
                        <span className="text-brand-600">
                          ₹{(() => {
                            const sal = monthlySalaries.find(
                              (s) => s.userId === selectedUserId && s.month === selectedMonth
                            )
                            if (!sal) return '0'
                            const gross =
                              sal.baseSalary +
                              sal.hra +
                              sal.transportAllowance +
                              sal.otherAllowance +
                              sal.performanceBonus
                            const deductions = sal.pfDeduction + sal.taxDeduction + sal.otherDeduction
                            return (gross - deductions).toLocaleString()
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-ink-300">No salary set for this month.</p>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      {showSalaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="glass-panel w-full max-w-2xl rounded-3xl p-6 shadow-lift">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-ink-500">
                Manage Monthly Salary - {selectedMonth}
              </h3>
              <button className="text-sm text-ink-300" onClick={() => setShowSalaryModal(false)}>
                Close
              </button>
            </div>
            <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={handleSalarySubmit}>
              <div>
                <label className="text-xs font-semibold text-ink-400">Base Salary</label>
                <input
                  className="input-field mt-1"
                  type="number"
                  placeholder="50000"
                  required
                  min="0"
                  step="0.01"
                  value={salaryForm.baseSalary}
                  onChange={(e) => setSalaryForm((prev) => ({ ...prev, baseSalary: e.target.value }))}
                />
                {salaryFormErrors.baseSalary && (
                  <p className="mt-1 text-xs text-red-500">{salaryFormErrors.baseSalary}</p>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-ink-400">HRA</label>
                <input
                  className="input-field mt-1"
                  type="number"
                  placeholder="15000"
                  required
                  min="0"
                  step="0.01"
                  value={salaryForm.hra}
                  onChange={(e) => setSalaryForm((prev) => ({ ...prev, hra: e.target.value }))}
                />
                {salaryFormErrors.hra && <p className="mt-1 text-xs text-red-500">{salaryFormErrors.hra}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-ink-400">Transport Allowance</label>
                <input
                  className="input-field mt-1"
                  type="number"
                  placeholder="3000"
                  required
                  min="0"
                  step="0.01"
                  value={salaryForm.transportAllowance}
                  onChange={(e) => setSalaryForm((prev) => ({ ...prev, transportAllowance: e.target.value }))}
                />
                {salaryFormErrors.transportAllowance && (
                  <p className="mt-1 text-xs text-red-500">{salaryFormErrors.transportAllowance}</p>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-ink-400">Other Allowance</label>
                <input
                  className="input-field mt-1"
                  type="number"
                  placeholder="2000"
                  required
                  min="0"
                  step="0.01"
                  value={salaryForm.otherAllowance}
                  onChange={(e) => setSalaryForm((prev) => ({ ...prev, otherAllowance: e.target.value }))}
                />
                {salaryFormErrors.otherAllowance && (
                  <p className="mt-1 text-xs text-red-500">{salaryFormErrors.otherAllowance}</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-green-700">Performance Bonus (if applicable)</label>
                <input
                  className="input-field mt-1"
                  type="number"
                  placeholder="0"
                  required
                  min="0"
                  step="0.01"
                  value={salaryForm.performanceBonus}
                  onChange={(e) => setSalaryForm((prev) => ({ ...prev, performanceBonus: e.target.value }))}
                />
                {salaryFormErrors.performanceBonus && (
                  <p className="mt-1 text-xs text-red-500">{salaryFormErrors.performanceBonus}</p>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-ink-400">PF Deduction</label>
                <input
                  className="input-field mt-1"
                  type="number"
                  placeholder="6000"
                  required
                  min="0"
                  step="0.01"
                  value={salaryForm.pfDeduction}
                  onChange={(e) => setSalaryForm((prev) => ({ ...prev, pfDeduction: e.target.value }))}
                />
                {salaryFormErrors.pfDeduction && (
                  <p className="mt-1 text-xs text-red-500">{salaryFormErrors.pfDeduction}</p>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-ink-400">Tax Deduction (TDS)</label>
                <input
                  className="input-field mt-1"
                  type="number"
                  placeholder="5000"
                  required
                  min="0"
                  step="0.01"
                  value={salaryForm.taxDeduction}
                  onChange={(e) => setSalaryForm((prev) => ({ ...prev, taxDeduction: e.target.value }))}
                />
                {salaryFormErrors.taxDeduction && (
                  <p className="mt-1 text-xs text-red-500">{salaryFormErrors.taxDeduction}</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-ink-400">Other Deductions</label>
                <input
                  className="input-field mt-1"
                  type="number"
                  placeholder="0"
                  required
                  min="0"
                  step="0.01"
                  value={salaryForm.otherDeduction}
                  onChange={(e) => setSalaryForm((prev) => ({ ...prev, otherDeduction: e.target.value }))}
                />
                {salaryFormErrors.otherDeduction && (
                  <p className="mt-1 text-xs text-red-500">{salaryFormErrors.otherDeduction}</p>
                )}
              </div>
              {salaryFormErrors.general && <p className="text-xs text-red-500">{salaryFormErrors.general}</p>}
              <div className="sm:col-span-2">
                <button className="w-full rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white">
                  Save Salary Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                    required
                    value={userForm.name}
                    onChange={(event) => setUserForm((prev) => ({ ...prev, name: event.target.value }))}
                  />
                  {userFormErrors.name && <p className="mt-1 text-xs text-red-500">{userFormErrors.name}</p>}
                </div>
                <div>
                  <input
                    className="input-field"
                    placeholder="Email"
                    required
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
                    required
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
                    placeholder="Casual leave (0-12)"
                    required
                    value={userForm.casualBalance}
                    onChange={(event) =>
                      setUserForm((prev) => ({ ...prev, casualBalance: event.target.value }))
                    }
                  />
                  {userFormErrors.casualBalance && (
                    <p className="mt-1 text-xs text-red-500">{userFormErrors.casualBalance}</p>
                  )}
                </div>
                <div>
                  <input
                    className="input-field"
                    placeholder="Sick leave (0-12)"
                    required
                    value={userForm.sickBalance}
                    onChange={(event) =>
                      setUserForm((prev) => ({ ...prev, sickBalance: event.target.value }))
                    }
                  />
                  {userFormErrors.sickBalance && (
                    <p className="mt-1 text-xs text-red-500">{userFormErrors.sickBalance}</p>
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
                    required
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
                    required
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
                    required
                    value={leaveForm.from}
                    onChange={(event) => setLeaveForm((prev) => ({ ...prev, from: event.target.value }))}
                  />
                  {leaveFormErrors.from && <p className="mt-1 text-xs text-red-500">{leaveFormErrors.from}</p>}
                </div>
                <div>
                  <input
                    className="input-field"
                    type="date"
                    required
                    value={leaveForm.to}
                    onChange={(event) => setLeaveForm((prev) => ({ ...prev, to: event.target.value }))}
                  />
                  {leaveFormErrors.to && <p className="mt-1 text-xs text-red-500">{leaveFormErrors.to}</p>}
                </div>
                <div>
                  <input
                    className="input-field"
                    placeholder="Reason"
                    required
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
