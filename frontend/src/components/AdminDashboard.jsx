import { useEffect, useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import {
  getNextEmployeeId,
  getNextLeaveId,
  getNextSalaryId,
  clampBalance,
  getEffectiveSickBalance,
} from '../utils/helpers'

export default function AdminDashboard() {
  const {
    users,
    setUsers,
    leaves,
    setLeaves,
    attendance,
    monthlySalaries,
    setMonthlySalaries,
    selectedMonth,
    setSelectedMonth,
  } = useApp()

  const [selectedUserId, setSelectedUserId] = useState(users[0]?.id ?? '')
  const [selectedLeaveId, setSelectedLeaveId] = useState('')
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

  const [leaveForm, setLeaveForm] = useState({
    userId: '',
    type: 'Casual',
    from: '',
    to: '',
    reason: '',
  })
  const [leaveFormErrors, setLeaveFormErrors] = useState({})

  const [salaryForm, setSalaryForm] = useState({
    workingDays: '',
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

  const handleExportLeavesCsv = () => {
    const headers = ['Leave ID', 'Employee ID', 'Employee Name', 'Type', 'From Date', 'To Date', 'Days', 'Status']
    const rows = filteredLeaves.map((leave) => [
      leave.id,
      leave.userId,
      leave.name,
      leave.type,
      leave.from,
      leave.to,
      leave.days,
      leave.status,
    ])
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `ciomogul-${selectedMonth}-leaves.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleExportAttendanceCsv = () => {
    const headers = ['Employee ID', 'Employee Name', 'Date', 'Hours', 'Mails', 'Data', 'LinkedIn', 'Follow Ups']
    const rows = filteredAttendance.map((record) => {
      const user = users.find((u) => u.id === record.userId)
      return [
        record.userId,
        user?.name || 'Unknown',
        record.date,
        record.hours.toFixed(1),
        record.mails,
        record.data,
        record.linkedin,
        record.followUps,
      ]
    })
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `ciomogul-${selectedMonth}-attendance.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleExportSalaryCsv = () => {
    const headers = ['Employee ID', 'Employee Name', 'Month', 'Working Days', 'Base Salary', 'HRA', 'Transport', 'Other Allowance', 'Performance Bonus', 'Gross Earnings', 'PF Deduction', 'Tax Deduction', 'Other Deduction', 'Total Deductions', 'Net Salary']
    const rows = monthlySalaries
      .filter((s) => s.month === selectedMonth)
      .map((salary) => {
        const user = users.find((u) => u.id === salary.userId)
        const gross = salary.baseSalary + salary.hra + salary.transportAllowance + salary.otherAllowance + salary.performanceBonus
        const deductions = salary.pfDeduction + salary.taxDeduction + salary.otherDeduction
        const net = gross - deductions
        return [
          salary.userId,
          user?.name || 'Unknown',
          salary.month,
          salary.workingDays,
          salary.baseSalary,
          salary.hra,
          salary.transportAllowance,
          salary.otherAllowance,
          salary.performanceBonus,
          gross,
          salary.pfDeduction,
          salary.taxDeduction,
          salary.otherDeduction,
          deductions,
          net,
        ]
      })
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `ciomogul-${selectedMonth}-salaries.csv`
    link.click()
    URL.revokeObjectURL(url)
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

  const openSalaryModal = (mode) => {
    setModalMode(mode)
    setSalaryFormErrors({})
    const existing = monthlySalaries.find(
      (s) => s.userId === selectedUserId && s.month === selectedMonth
    )
    if (mode === 'add' || !existing) {
      setSalaryForm({
        workingDays: '22',
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
        workingDays: String(existing.workingDays || 22),
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

  const validateSalaryForm = () => {
    const errors = {}
    if (!salaryForm.workingDays || Number.isNaN(Number(salaryForm.workingDays)) || Number(salaryForm.workingDays) < 1 || Number(salaryForm.workingDays) > 31) {
      errors.workingDays = 'Valid working days required (1-31).'
    }
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

  const handleLeaveApprove = () => {
    if (!selectedLeaveId) {
      return
    }
    const leave = leaves.find((item) => item.id === selectedLeaveId)
    if (!leave) {
      return
    }
    
    // Update leave status to Approved
    setLeaves((prev) =>
      prev.map((item) =>
        item.id === selectedLeaveId ? { ...item, status: 'Approved' } : item
      )
    )

    // Deduct from user balance if Casual or Sick leave
    if (leave.type === 'Casual' || leave.type === 'Sick') {
      setUsers((prev) =>
        prev.map((user) => {
          if (user.id === leave.userId) {
            if (leave.type === 'Casual') {
              return {
                ...user,
                casualBalance: Math.max(0, user.casualBalance - leave.days),
              }
            }
            if (leave.type === 'Sick') {
              return {
                ...user,
                sickBalance: Math.max(0, user.sickBalance - leave.days),
              }
            }
          }
          return user
        })
      )
    }
  }

  const handleLeaveReject = () => {
    if (!selectedLeaveId) {
      return
    }
    // Update leave status to Rejected
    setLeaves((prev) =>
      prev.map((item) =>
        item.id === selectedLeaveId ? { ...item, status: 'Rejected' } : item
      )
    )
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
                workingDays: Number(salaryForm.workingDays),
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
        workingDays: Number(salaryForm.workingDays),
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
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-ink-500">Tru Time Records</h3>
                <button
                  className="rounded-lg bg-purple-600 px-3 py-1 text-xs font-semibold text-white"
                  onClick={handleExportAttendanceCsv}
                >
                  Export CSV
                </button>
              </div>
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
                  <button
                    className="rounded-lg bg-green-600 px-3 py-1 text-xs font-semibold text-white"
                    onClick={handleLeaveApprove}
                  >
                    Approve
                  </button>
                  <button
                    className="rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold text-white"
                    onClick={handleLeaveReject}
                  >
                    Reject
                  </button>
                  <button
                    className="rounded-lg bg-purple-600 px-3 py-1 text-xs font-semibold text-white"
                    onClick={handleExportLeavesCsv}
                  >
                    Export CSV
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
                          ? 'bg-green-100 text-green-700'
                          : leave.status === 'Rejected'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
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
                <div className="flex gap-2">
                  <button
                    className="rounded-lg bg-brand-600 px-3 py-1 text-xs font-semibold text-white"
                    onClick={() => openSalaryModal('edit')}
                  >
                    {monthlySalaries.find((s) => s.userId === selectedUserId && s.month === selectedMonth)
                      ? 'Edit Salary'
                      : 'Set Salary'}
                  </button>
                  <button
                    className="rounded-lg bg-purple-600 px-3 py-1 text-xs font-semibold text-white"
                    onClick={handleExportSalaryCsv}
                  >
                    Export CSV
                  </button>
                </div>
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
                <label className="text-xs font-semibold text-ink-400">Number of Working Days</label>
                <input
                  className="input-field mt-1"
                  type="number"
                  placeholder="22"
                  min="1"
                  max="31"
                  value={salaryForm.workingDays}
                  onChange={(e) => setSalaryForm((prev) => ({ ...prev, workingDays: e.target.value }))}
                />
                {salaryFormErrors.workingDays && (
                  <p className="mt-1 text-xs text-red-500">{salaryFormErrors.workingDays}</p>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-ink-400">Base Salary</label>
                <input
                  className="input-field mt-1"
                  type="number"
                  placeholder="50000"
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
