import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/useApp'
import { apiService } from '../utils/api'
import {
  getNextLeaveId,
  getNextSalaryId,
  clampBalance,
  getEffectiveSickBalance,
} from '../utils/helpers'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const {
    users,
    setUsers,
    leaves,
    setLeaves,
    attendance,
    setAttendance,
    monthlySalaries,
    setMonthlySalaries,
    selectedMonth,
    setSelectedMonth,
    setIsAdminAuthorized,
  } = useApp()

  const [selectedUserId, setSelectedUserId] = useState(users[0]?.id ?? '')
  const [selectedLeaveId, setSelectedLeaveId] = useState('')
  const [showUserModal, setShowUserModal] = useState(false)
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [showSalaryModal, setShowSalaryModal] = useState(false)
  const [showUserSalarySlip, setShowUserSalarySlip] = useState(false)
  const [modalMode, setModalMode] = useState('add')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const [userForm, setUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    casualBalance: '0',
    sickBalance: '0',
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

  // Fetch data from backend on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const [usersData, leavesData, attendanceData, salariesData] = await Promise.all([
          apiService.getUsers(),
          apiService.getAllLeaves(),
          apiService.getAllAttendance(),
          apiService.getAllSalaries(),
        ])
        setUsers(usersData)
        setLeaves(leavesData)
        setAttendance(attendanceData)
        setMonthlySalaries(salariesData)
        if (usersData.length > 0 && !selectedUserId) {
          setSelectedUserId(usersData[0].id)
        }
      } catch (err) {
        console.error('Failed to fetch data:', err)
        setError('Failed to load data from server')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

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

  const performanceMetrics = useMemo(() => {
    const totalMails = userAttendance.reduce((sum, record) => sum + (record.mails || 0), 0)
    const totalData = userAttendance.reduce((sum, record) => sum + (record.data || 0), 0)
    const totalLinkedIn = userAttendance.reduce((sum, record) => sum + (record.linkedin || 0), 0)
    const totalFollowUps = userAttendance.reduce((sum, record) => sum + (record.followUps || 0), 0)
    const approvedLeaves = userLeaves.filter((leave) => leave.status === 'Approved').length
    const totalLeaveDays = userLeaves
      .filter((leave) => leave.status === 'Approved')
      .reduce((sum, leave) => sum + leave.days, 0)
    const daysInMonth = new Date(
      parseInt(selectedMonth.split('-')[0]),
      parseInt(selectedMonth.split('-')[1]),
      0
    ).getDate()
    const attendancePercentage = daysInMonth ? Math.round((userStats.entries / daysInMonth) * 100) : 0
    
    return {
      totalMails,
      totalData,
      totalLinkedIn,
      totalFollowUps,
      approvedLeaves,
      totalLeaveDays,
      attendancePercentage,
    }
  }, [userAttendance, userLeaves, userStats.entries, selectedMonth])

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
      setUserForm({ firstName: '', lastName: '', email: '', password: '', casualBalance: '0', sickBalance: '0' })
    }
    if (mode === 'edit') {
      const user = users.find((item) => item.id === selectedUserId)
      if (user) {
        const [firstName = '', ...lastNameParts] = user.name.split(' ')
        const lastName = lastNameParts.join(' ')
        setUserForm({
          firstName,
          lastName,
          email: user.email,
          password: '',
          casualBalance: String(user.casualBalance ?? 0),
          sickBalance: String(user.sickBalance ?? 0),
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
    if (!userForm.firstName.trim()) {
      errors.firstName = 'First name is required.'
    }
    if (!userForm.lastName.trim()) {
      errors.lastName = 'Last name is required.'
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
    // All fields are optional, only validate format if provided
    if (salaryForm.workingDays && (Number.isNaN(Number(salaryForm.workingDays)) || Number(salaryForm.workingDays) < 1 || Number(salaryForm.workingDays) > 31)) {
      errors.workingDays = 'Working days must be between 1 and 31'
    }
    if (salaryForm.baseSalary && (Number.isNaN(Number(salaryForm.baseSalary)) || Number(salaryForm.baseSalary) < 0)) {
      errors.baseSalary = 'Base salary must be 0 or greater'
    }
    if (salaryForm.hra && (Number.isNaN(Number(salaryForm.hra)) || Number(salaryForm.hra) < 0)) {
      errors.hra = 'HRA must be 0 or greater'
    }
    if (salaryForm.transportAllowance && (Number.isNaN(Number(salaryForm.transportAllowance)) || Number(salaryForm.transportAllowance) < 0)) {
      errors.transportAllowance = 'Transport allowance must be 0 or greater'
    }
    if (salaryForm.otherAllowance && (Number.isNaN(Number(salaryForm.otherAllowance)) || Number(salaryForm.otherAllowance) < 0)) {
      errors.otherAllowance = 'Other allowance must be 0 or greater'
    }
    if (salaryForm.performanceBonus && (Number.isNaN(Number(salaryForm.performanceBonus)) || Number(salaryForm.performanceBonus) < 0)) {
      errors.performanceBonus = 'Performance bonus must be 0 or greater'
    }
    if (salaryForm.pfDeduction && (Number.isNaN(Number(salaryForm.pfDeduction)) || Number(salaryForm.pfDeduction) < 0)) {
      errors.pfDeduction = 'PF deduction must be 0 or greater'
    }
    if (salaryForm.taxDeduction && (Number.isNaN(Number(salaryForm.taxDeduction)) || Number(salaryForm.taxDeduction) < 0)) {
      errors.taxDeduction = 'Tax deduction must be 0 or greater'
    }
    if (salaryForm.otherDeduction && (Number.isNaN(Number(salaryForm.otherDeduction)) || Number(salaryForm.otherDeduction) < 0)) {
      errors.otherDeduction = 'Other deduction must be 0 or greater'
    }
    return errors
  }

  const handleUserSubmit = async (event) => {
    event.preventDefault()
    const errors = validateUserForm(modalMode)
    setUserFormErrors(errors)
    if (Object.keys(errors).length > 0) {
      return
    }

    try {
      if (modalMode === 'add') {
        const userData = {
          name: `${userForm.firstName.trim()} ${userForm.lastName.trim()}`,
          email: userForm.email.trim(),
          password: userForm.password,
          casualBalance: clampBalance(Number(userForm.casualBalance || 0)),
          sickBalance: clampBalance(Number(userForm.sickBalance || 0)),
        }
        const newUser = await apiService.createUser(userData)
        setUsers((prev) => [newUser, ...prev])
        setSelectedUserId(newUser.id)
      }
      if (modalMode === 'edit') {
        const userData = {
          name: `${userForm.firstName.trim()} ${userForm.lastName.trim()}`,
          email: userForm.email.trim(),
          casualBalance: clampBalance(Number(userForm.casualBalance || 0)),
          sickBalance: clampBalance(Number(userForm.sickBalance || 0)),
        }
        if (userForm.password) {
          userData.password = userForm.password
        }
        const updatedUser = await apiService.updateUser(selectedUserId, userData)
        setUsers((prev) =>
          prev.map((user) => (user.id === selectedUserId ? updatedUser : user))
        )
      }
      setShowUserModal(false)
    } catch (error) {
      console.error('Failed to save user:', error)
      setUserFormErrors({ general: error.message || 'Failed to save user' })
    }
  }

  const handleUserDelete = async () => {
    if (!selectedUserId) {
      setUserFormErrors({ general: 'Select a user to delete.' })
      return
    }

    try {
      await apiService.deleteUser(selectedUserId)
      setUsers((prev) => prev.filter((user) => user.id !== selectedUserId))
      setLeaves((prev) => prev.filter((leave) => leave.userId !== selectedUserId))
      const remaining = users.filter((user) => user.id !== selectedUserId)
      setSelectedUserId(remaining[0]?.id ?? '')
      setShowUserModal(false)
    } catch (error) {
      console.error('Failed to delete user:', error)
      setUserFormErrors({ general: error.message || 'Failed to delete user' })
    }
  }

  const handleLeaveSubmit = async (event) => {
    event.preventDefault()
    const errors = validateLeaveForm()
    setLeaveFormErrors(errors)
    if (Object.keys(errors).length > 0) {
      return
    }

    try {
      if (modalMode === 'add') {
        const leaveData = {
          userId: leaveForm.userId,
          type: leaveForm.type,
          startDate: leaveForm.from,
          endDate: leaveForm.to,
          reason: leaveForm.reason || 'Not specified',
        }
        const newLeave = await apiService.adminCreateLeave(leaveData)
        setLeaves((prev) => [newLeave, ...prev])
        setSelectedLeaveId(newLeave.id)
      }
      if (modalMode === 'edit') {
        if (!selectedLeaveId) {
          setLeaveFormErrors({ general: 'Select a leave record to edit.' })
          return
        }
        const leaveData = {
          userId: leaveForm.userId,
          type: leaveForm.type,
          startDate: leaveForm.from,
          endDate: leaveForm.to,
          reason: leaveForm.reason || 'Not specified',
        }
        const updatedLeave = await apiService.adminUpdateLeave(selectedLeaveId, leaveData)
        setLeaves((prev) =>
          prev.map((leave) => (leave.id === selectedLeaveId ? updatedLeave : leave))
        )
      }
      setShowLeaveModal(false)
    } catch (error) {
      console.error('Failed to save leave:', error)
      setLeaveFormErrors({ general: error.message || 'Failed to save leave' })
    }
  }

  const handleLeaveDelete = async () => {
    if (!selectedLeaveId) {
      setLeaveFormErrors({ general: 'Select a leave record to delete.' })
      return
    }

    try {
      await apiService.deleteLeave(selectedLeaveId)
      setLeaves((prev) => prev.filter((leave) => leave.id !== selectedLeaveId))
      const remaining = leaves.filter((leave) => leave.id !== selectedLeaveId)
      setSelectedLeaveId(remaining[0]?.id ?? '')
      setShowLeaveModal(false)
    } catch (error) {
      console.error('Failed to delete leave:', error)
      setLeaveFormErrors({ general: error.message || 'Failed to delete leave' })
    }
  }

  const handleLeaveApprove = async () => {
    if (!selectedLeaveId) {
      return
    }
    const leave = leaves.find((item) => item.id === selectedLeaveId)
    if (!leave) {
      return
    }
    
    try {
      await apiService.updateLeaveStatus(selectedLeaveId, 'Approved')
      setLeaves((prev) =>
        prev.map((item) =>
          item.id === selectedLeaveId ? { ...item, status: 'Approved' } : item
        )
      )

      // Refresh users to get updated leave balances
      const usersData = await apiService.getUsers()
      setUsers(usersData)
    } catch (error) {
      console.error('Failed to approve leave:', error)
    }
  }

  const handleLeaveReject = async () => {
    if (!selectedLeaveId) {
      return
    }
    
    try {
      await apiService.updateLeaveStatus(selectedLeaveId, 'Rejected')
      setLeaves((prev) =>
        prev.map((item) =>
          item.id === selectedLeaveId ? { ...item, status: 'Rejected' } : item
        )
      )
    } catch (error) {
      console.error('Failed to reject leave:', error)
    }
  }

  const handleSalarySubmit = async (event) => {
    event.preventDefault()
    const errors = validateSalaryForm()
    setSalaryFormErrors(errors)
    if (Object.keys(errors).length > 0) {
      return
    }
    try {
      const existing = monthlySalaries.find(
        (s) => s.userId === selectedUserId && s.month === selectedMonth
      )
      
      const salaryData = {
        userId: selectedUserId,
        month: selectedMonth,
        workingDays: Number(salaryForm.workingDays) || 0,
        baseSalary: Number(salaryForm.baseSalary) || 0,
        hra: Number(salaryForm.hra) || 0,
        transportAllowance: Number(salaryForm.transportAllowance) || 0,
        otherAllowance: Number(salaryForm.otherAllowance) || 0,
        performanceBonus: Number(salaryForm.performanceBonus) || 0,
        pfDeduction: Number(salaryForm.pfDeduction) || 0,
        taxDeduction: Number(salaryForm.taxDeduction) || 0,
        otherDeduction: Number(salaryForm.otherDeduction) || 0,
      }

      if (existing) {
        const updatedSalary = await apiService.updateSalary(existing.id, salaryData)
        setMonthlySalaries((prev) =>
          prev.map((s) => (s.id === existing.id ? updatedSalary : s))
        )
      } else {
        const newSalary = await apiService.createSalary(salaryData)
        setMonthlySalaries((prev) => [newSalary, ...prev])
      }
      setShowSalaryModal(false)
      setSalaryFormErrors({})
    } catch (error) {
      console.error('Failed to save salary:', error)
      setSalaryFormErrors({ general: error.message || 'Failed to save salary. Please try again.' })
    }
  }

  return (
    <div className="min-h-screen p-6 md:p-10">
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-ink-300 text-lg">Loading dashboard...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="glass-panel rounded-3xl p-8 shadow-lift text-center">
            <p className="text-red-500 text-lg mb-2">⚠️ {error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white mt-4"
            >
              Reload Page
            </button>
          </div>
        </div>
      ) : users.length === 0 ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="glass-panel rounded-3xl p-8 shadow-lift text-center max-w-md">
            <p className="text-ink-500 text-lg mb-2">👋 Welcome!</p>
            <p className="text-ink-300 mb-4">No users found. Start by adding your first employee.</p>
            <button 
              onClick={() => openUserModal('add')} 
              className="rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white"
            >
              Add First Employee
            </button>
          </div>
        </div>
      ) : (
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-ink-300">CIO Mogul</p>
                <h1 className="section-title">Admin Performance Dashboard</h1>
                <p className="mt-2 max-w-xl text-sm text-ink-300">
                  Review all user records, drill into individual leave history, and track monthly 9-hour compliance.
                </p>
              </div>
              <button
                onClick={() => {
                  apiService.logout()
                  setIsAdminAuthorized(false)
                  navigate('/')
                }}
                className="rounded-xl bg-red-500 hover:bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow"
              >
                Logout
              </button>
            </div>
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
                <div
                  key={user.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedUserId(user.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedUserId(user.id) } }}
                  className={`grid w-full grid-cols-[1.2fr_0.7fr_0.7fr_0.7fr_0.6fr_0.6fr_0.6fr_0.9fr] items-center border-t px-4 py-3 text-left text-sm transition cursor-pointer ${
                    selectedUserId === user.id 
                      ? 'bg-brand-100 border-brand-300 border-l-4 border-l-brand-600' 
                      : 'border-sand-100 hover:bg-sand-50/80'
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
                </div>
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

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-ink-500">Performance Summary</h3>
                <button
                  className="rounded-lg bg-brand-600 px-3 py-1 text-xs font-semibold text-white"
                  onClick={() => setShowUserSalarySlip(true)}
                >
                  View Salary Slip
                </button>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-sand-200 bg-gradient-to-br from-blue-50 to-white p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-blue-600">Total Hours</p>
                  <p className="mt-2 text-2xl font-bold text-blue-700">{userStats.totalHours.toFixed(1)}</p>
                  <p className="mt-1 text-xs text-ink-300">This Month</p>
                </div>
                <div className="rounded-2xl border border-sand-200 bg-gradient-to-br from-green-50 to-white p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-green-600">Attendance</p>
                  <p className="mt-2 text-2xl font-bold text-green-700">{performanceMetrics.attendancePercentage}%</p>
                  <p className="mt-1 text-xs text-ink-300">{userStats.entries} days worked</p>
                </div>
                <div className="rounded-2xl border border-sand-200 bg-gradient-to-br from-purple-50 to-white p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-purple-600">Leaves Taken</p>
                  <p className="mt-2 text-2xl font-bold text-purple-700">{performanceMetrics.totalLeaveDays}</p>
                  <p className="mt-1 text-xs text-ink-300">{performanceMetrics.approvedLeaves} leave(s)</p>
                </div>
                <div className="rounded-2xl border border-sand-200 bg-gradient-to-br from-orange-50 to-white p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-orange-600">Leave Balance</p>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-700">{selectedUser?.casualBalance || 0}</p>
                      <p className="text-xs text-ink-400">Casual</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-700">{getEffectiveSickBalance(selectedUser, selectedMonth) || 0}</p>
                      <p className="text-xs text-ink-400">Sick</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 rounded-2xl border border-sand-200 p-4 bg-white/70">
                <h4 className="text-xs font-semibold text-ink-500 uppercase tracking-[0.2em] mb-3">Productivity Metrics</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-ink-400">Total Mails</p>
                    <p className="mt-1 text-xl font-bold text-brand-600">{performanceMetrics.totalMails}</p>
                  </div>
                  <div>
                    <p className="text-xs text-ink-400">Data Entries</p>
                    <p className="mt-1 text-xl font-bold text-brand-600">{performanceMetrics.totalData}</p>
                  </div>
                  <div>
                    <p className="text-xs text-ink-400">LinkedIn Posts</p>
                    <p className="mt-1 text-xl font-bold text-brand-600">{performanceMetrics.totalLinkedIn}</p>
                  </div>
                  <div>
                    <p className="text-xs text-ink-400">Follow Ups</p>
                    <p className="mt-1 text-xl font-bold text-brand-600">{performanceMetrics.totalFollowUps}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      )}

      {showSalaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="glass-panel w-full max-w-2xl rounded-3xl p-6 shadow-lift">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-ink-500">
                  {monthlySalaries.find((s) => s.userId === selectedUserId && s.month === selectedMonth)
                    ? `Edit Salary - ${selectedMonth}`
                    : `Create Salary - ${selectedMonth}`}
                </h3>
                <p className="text-xs text-ink-300 mt-1">
                  {monthlySalaries.find((s) => s.userId === selectedUserId && s.month === selectedMonth)
                    ? '✏️ Updating existing salary record'
                    : '➕ Creating new salary record'}
                </p>
              </div>
              <button className="text-sm text-ink-300" onClick={() => setShowSalaryModal(false)}>
                Close
              </button>
            </div>
            {!monthlySalaries.find((s) => s.userId === selectedUserId && s.month === selectedMonth) && (
              <div className="mt-3 rounded-lg bg-blue-50 p-2 border border-blue-200">
                <p className="text-xs text-blue-800">
                  ℹ️ Note: You can only create salary records for the current month or next month
                </p>
              </div>
            )}
            <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={handleSalarySubmit}>
              <div>
                <label className="text-xs font-semibold text-ink-400">Number of Working Days <span className="text-ink-300">(Optional)</span></label>
                <input
                  className="input-field mt-1"
                  type="number"
                  placeholder="22"
                  min="1"
                  max="31"
                  value={salaryForm.workingDays}
                  onChange={(e) => setSalaryForm((prev) => ({ ...prev, workingDays: e.target.value }))}
                />
                <p className="mt-1 text-xs text-ink-300">Number of days employee worked this month (1-31)</p>
                {salaryFormErrors.workingDays && (
                  <p className="mt-1 text-xs text-red-500">{salaryFormErrors.workingDays}</p>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-ink-400">Base Salary <span className="text-ink-300">(Optional)</span></label>
                <input
                  className="input-field mt-1"
                  type="number"
                  placeholder="50000"
                  min="0"
                  step="0.01"
                  value={salaryForm.baseSalary}
                  onChange={(e) => setSalaryForm((prev) => ({ ...prev, baseSalary: e.target.value }))}
                />
                <p className="mt-1 text-xs text-ink-300">Fixed monthly base salary amount</p>
                {salaryFormErrors.baseSalary && (
                  <p className="mt-1 text-xs text-red-500">{salaryFormErrors.baseSalary}</p>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-ink-400">HRA <span className="text-ink-300">(Optional)</span></label>
                <input
                  className="input-field mt-1"
                  type="number"
                  placeholder="15000"
                  min="0"
                  step="0.01"
                  value={salaryForm.hra}
                  onChange={(e) => setSalaryForm((prev) => ({ ...prev, hra: e.target.value }))}
                />
                <p className="mt-1 text-xs text-ink-300">House Rent Allowance</p>
                {salaryFormErrors.hra && <p className="mt-1 text-xs text-red-500">{salaryFormErrors.hra}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-ink-400">Transport Allowance <span className="text-ink-300">(Optional)</span></label>
                <input
                  className="input-field mt-1"
                  type="number"
                  placeholder="3000"
                  min="0"
                  step="0.01"
                  value={salaryForm.transportAllowance}
                  onChange={(e) => setSalaryForm((prev) => ({ ...prev, transportAllowance: e.target.value }))}
                />
                <p className="mt-1 text-xs text-ink-300">Travel and commute allowance</p>
                {salaryFormErrors.transportAllowance && (
                  <p className="mt-1 text-xs text-red-500">{salaryFormErrors.transportAllowance}</p>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-ink-400">Other Allowance <span className="text-ink-300">(Optional)</span></label>
                <input
                  className="input-field mt-1"
                  type="number"
                  placeholder="2000"
                  min="0"
                  step="0.01"
                  value={salaryForm.otherAllowance}
                  onChange={(e) => setSalaryForm((prev) => ({ ...prev, otherAllowance: e.target.value }))}
                />
                <p className="mt-1 text-xs text-ink-300">Any other additional allowances</p>
                {salaryFormErrors.otherAllowance && (
                  <p className="mt-1 text-xs text-red-500">{salaryFormErrors.otherAllowance}</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-green-700">Performance Bonus <span className="text-ink-300">(Optional)</span></label>
                <input
                  className="input-field mt-1"
                  type="number"
                  placeholder="0"
                  min="0"
                  step="0.01"
                  value={salaryForm.performanceBonus}
                  onChange={(e) => setSalaryForm((prev) => ({ ...prev, performanceBonus: e.target.value }))}
                />
                <p className="mt-1 text-xs text-ink-300">Additional bonus based on performance</p>
                {salaryFormErrors.performanceBonus && (
                  <p className="mt-1 text-xs text-red-500">{salaryFormErrors.performanceBonus}</p>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-ink-400">PF Deduction <span className="text-ink-300">(Optional)</span></label>
                <input
                  className="input-field mt-1"
                  type="number"
                  placeholder="6000"
                  min="0"
                  step="0.01"
                  value={salaryForm.pfDeduction}
                  onChange={(e) => setSalaryForm((prev) => ({ ...prev, pfDeduction: e.target.value }))}
                />
                <p className="mt-1 text-xs text-ink-300">Provident Fund deduction</p>
                {salaryFormErrors.pfDeduction && (
                  <p className="mt-1 text-xs text-red-500">{salaryFormErrors.pfDeduction}</p>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-ink-400">Tax Deduction (TDS) <span className="text-ink-300">(Optional)</span></label>
                <input
                  className="input-field mt-1"
                  type="number"
                  placeholder="5000"
                  min="0"
                  step="0.01"
                  value={salaryForm.taxDeduction}
                  onChange={(e) => setSalaryForm((prev) => ({ ...prev, taxDeduction: e.target.value }))}
                />
                <p className="mt-1 text-xs text-ink-300">Tax Deducted at Source</p>
                {salaryFormErrors.taxDeduction && (
                  <p className="mt-1 text-xs text-red-500">{salaryFormErrors.taxDeduction}</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-ink-400">Other Deductions <span className="text-ink-300">(Optional)</span></label>
                <input
                  className="input-field mt-1"
                  type="number"
                  placeholder="0"
                  min="0"
                  step="0.01"
                  value={salaryForm.otherDeduction}
                  onChange={(e) => setSalaryForm((prev) => ({ ...prev, otherDeduction: e.target.value }))}
                />
                <p className="mt-1 text-xs text-ink-300">Any other deductions from salary</p>
                {salaryFormErrors.otherDeduction && (
                  <p className="mt-1 text-xs text-red-500">{salaryFormErrors.otherDeduction}</p>
                )}
              </div>
              {salaryFormErrors.general && <p className="text-xs text-red-500">{salaryFormErrors.general}</p>}
              <div className="sm:col-span-2">
                <button className="w-full rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white">
                  {monthlySalaries.find((s) => s.userId === selectedUserId && s.month === selectedMonth)
                    ? 'Update Salary Record'
                    : 'Create Salary Record'}
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
                    placeholder="First Name"
                    required
                    value={userForm.firstName}
                    onChange={(event) => setUserForm((prev) => ({ ...prev, firstName: event.target.value }))}
                  />
                  <p className="mt-1 text-xs text-ink-300">Employee's first name</p>
                  {userFormErrors.firstName && <p className="mt-1 text-xs text-red-500">{userFormErrors.firstName}</p>}
                </div>
                <div>
                  <input
                    className="input-field"
                    placeholder="Last Name"
                    required
                    value={userForm.lastName}
                    onChange={(event) => setUserForm((prev) => ({ ...prev, lastName: event.target.value }))}
                  />
                  <p className="mt-1 text-xs text-ink-300">Employee's last name</p>
                  {userFormErrors.lastName && <p className="mt-1 text-xs text-red-500">{userFormErrors.lastName}</p>}
                </div>
                <div>
                  <input
                    className="input-field"
                    placeholder="Email Address"
                    type="email"
                    required
                    value={userForm.email}
                    onChange={(event) => setUserForm((prev) => ({ ...prev, email: event.target.value }))}
                  />
                  <p className="mt-1 text-xs text-ink-300">Valid email address for login</p>
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
                  <p className="mt-1 text-xs text-ink-300">Minimum 6 characters</p>
                  {userFormErrors.password && (
                    <p className="mt-1 text-xs text-red-500">{userFormErrors.password}</p>
                  )}
                </div>
                <div>
                  <input
                    className="input-field"
                    placeholder="Casual Leave Balance"
                    type="number"
                    min="0"
                    max="12"
                    required
                    value={userForm.casualBalance}
                    onChange={(event) =>
                      setUserForm((prev) => ({ ...prev, casualBalance: event.target.value }))
                    }
                  />
                  <p className="mt-1 text-xs text-ink-300">Number of casual leave days (0-12)</p>
                  {userFormErrors.casualBalance && (
                    <p className="mt-1 text-xs text-red-500">{userFormErrors.casualBalance}</p>
                  )}
                </div>
                <div>
                  <input
                    className="input-field"
                    placeholder="Sick Leave Balance"
                    type="number"
                    min="0"
                    max="12"
                    required
                    value={userForm.sickBalance}
                    onChange={(event) =>
                      setUserForm((prev) => ({ ...prev, sickBalance: event.target.value }))
                    }
                  />
                  <p className="mt-1 text-xs text-ink-300">Number of sick leave days (0-12)</p>
                  {userFormErrors.sickBalance && (
                    <p className="mt-1 text-xs text-red-500">{userFormErrors.sickBalance}</p>
                  )}
                </div>
                {modalMode === 'add' && (
                  <p className="text-xs text-ink-300">Employee ID will be auto-generated (e.g., CIO-0001, CIO-0002)</p>
                )}
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

      {showUserSalarySlip && (() => {
        const userSalary = monthlySalaries.find(
          (s) => s.userId === selectedUserId && s.month === selectedMonth
        )
        const baseSalary = userSalary?.baseSalary || selectedUser?.baseSalary || 0
        const hra = userSalary?.hra || selectedUser?.hra || 0
        const transportAllowance = userSalary?.transportAllowance || selectedUser?.transportAllowance || 0
        const otherAllowance = userSalary?.otherAllowance || selectedUser?.otherAllowance || 0
        const performanceBonus = userSalary?.performanceBonus || 0
        const pfDeduction = userSalary?.pfDeduction || selectedUser?.pfDeduction || 0
        const taxDeduction = userSalary?.taxDeduction || selectedUser?.taxDeduction || 0
        const otherDeduction = userSalary?.otherDeduction || selectedUser?.otherDeduction || 0
        const grossEarnings = baseSalary + hra + transportAllowance + otherAllowance + performanceBonus
        const totalDeductions = pfDeduction + taxDeduction + otherDeduction
        const netSalary = grossEarnings - totalDeductions

        const monthYear = new Date(selectedMonth + '-01').toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        })

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
            <div className="glass-panel w-full max-w-4xl rounded-3xl p-8 shadow-lift my-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-ink-500">
                  Salary Slip - {selectedUser?.name}
                </h3>
                <div className="flex gap-2">
                  <button
                    className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white"
                    onClick={() => window.print()}
                  >
                    Print
                  </button>
                  <button
                    className="rounded-lg border border-sand-200 px-3 py-2 text-sm font-semibold text-ink-400"
                    onClick={() => setShowUserSalarySlip(false)}
                  >
                    Close
                  </button>
                </div>
              </div>

              {baseSalary === 0 && hra === 0 ? (
                <div className="text-center py-12">
                  <p className="text-lg font-bold text-brand-600">
                    CIO MOGUL GLOBAL PUBLICATION PRIVATE LIMITED
                  </p>
                  <h1 className="mt-3 text-2xl font-bold text-ink-500">No Salary Data</h1>
                  <p className="mt-3 text-ink-400">No salary information available for {monthYear}.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="border-b border-sand-200 pb-4">
                    <div className="text-center mb-4">
                      <h2 className="text-lg font-bold text-brand-600">
                        CIO MOGUL GLOBAL PUBLICATION PRIVATE LIMITED
                      </h2>
                      <p className="text-xs text-ink-400 mt-1">UAN: U58132MH2025PTC459494</p>
                      <p className="text-xs text-ink-400 mt-0.5">
                        Sno. 80/1 Sai Nagari Bld, B/iwadmukhwadi Bhosari, Punawale, Pune, Pune City,
                        Maharashtra, India, 411033
                      </p>
                    </div>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-ink-300">Salary Slip</p>
                        <h1 className="mt-1 text-xl font-bold text-ink-500">{monthYear}</h1>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-ink-300">Employee Details</p>
                        <p className="font-semibold text-sm mt-1">{selectedUser?.name}</p>
                        <p className="text-ink-300 text-xs">{selectedUser?.id}</p>
                        <p className="text-ink-300 text-xs">{selectedUser?.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-sand-200 overflow-hidden">
                      <div className="bg-green-50 px-4 py-2">
                        <h3 className="text-sm font-semibold text-green-700">Earnings</h3>
                      </div>
                      <div className="bg-white p-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-ink-400">Base Salary</span>
                          <span className="font-semibold text-ink-500">₹{baseSalary.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-ink-400">HRA</span>
                          <span className="font-semibold text-ink-500">₹{hra.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-ink-400">Transport Allowance</span>
                          <span className="font-semibold text-ink-500">₹{transportAllowance.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-ink-400">Other Allowance</span>
                          <span className="font-semibold text-ink-500">₹{otherAllowance.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-ink-400">Performance Bonus</span>
                          <span className="font-semibold text-green-600">₹{performanceBonus.toLocaleString()}</span>
                        </div>
                        <div className="border-t border-sand-200 pt-2">
                          <div className="flex justify-between font-bold">
                            <span className="text-ink-500">Gross Earnings</span>
                            <span className="text-green-600">₹{grossEarnings.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-sand-200 overflow-hidden">
                      <div className="bg-red-50 px-4 py-2">
                        <h3 className="text-sm font-semibold text-red-700">Deductions</h3>
                      </div>
                      <div className="bg-white p-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-ink-400">PF Deduction</span>
                          <span className="font-semibold text-ink-500">₹{pfDeduction.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-ink-400">Tax Deduction</span>
                          <span className="font-semibold text-ink-500">₹{taxDeduction.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-ink-400">Other Deduction</span>
                          <span className="font-semibold text-ink-500">₹{otherDeduction.toLocaleString()}</span>
                        </div>
                        <div className="border-t border-sand-200 pt-2 mt-auto">
                          <div className="flex justify-between font-bold">
                            <span className="text-ink-500">Total Deductions</span>
                            <span className="text-red-600">₹{totalDeductions.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border-2 border-brand-200 bg-brand-50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-brand-700 font-semibold">Net Salary (Take Home)</p>
                        <p className="text-xs text-ink-400 mt-0.5">Gross Earnings - Total Deductions</p>
                      </div>
                      <p className="text-3xl font-bold text-brand-600">₹{netSalary.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-sand-200 bg-white/70 p-4">
                    <h4 className="text-xs font-semibold text-ink-500 mb-3">Attendance Summary</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-ink-400">Days Worked</p>
                        <p className="text-xl font-bold text-ink-500">{userStats.entries}</p>
                      </div>
                      <div>
                        <p className="text-ink-400">Total Hours</p>
                        <p className="text-xl font-bold text-ink-500">{userStats.totalHours.toFixed(1)}</p>
                      </div>
                      <div>
                        <p className="text-ink-400">9h Compliance</p>
                        <p className="text-xl font-bold text-brand-600">{userStats.compliance}%</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-sand-200">
                    <p className="text-xs text-ink-400 text-center">
                      This is a computer-generated salary slip and does not require a signature.
                    </p>
                    <p className="text-xs text-ink-300 text-center mt-1">
                      For queries, contact: info@theciomogul.com
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })()}
    </div>
  )
}
