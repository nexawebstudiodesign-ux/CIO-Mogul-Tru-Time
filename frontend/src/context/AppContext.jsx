import { createContext, useContext, useState, useMemo, useEffect } from 'react'
import { apiService } from '../utils/api'
import {
  currentMonth,
  initialUsers,
  initialLeaves,
  initialAttendance,
  initialMonthlySalaries,
} from '../data/initialData'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [users, setUsers] = useState(initialUsers)
  const [leaves, setLeaves] = useState(initialLeaves)
  const [attendance, setAttendance] = useState(initialAttendance)
  const [monthlySalaries, setMonthlySalaries] = useState(initialMonthlySalaries)
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const [selectedUserId, setSelectedUserId] = useState(initialUsers[0]?.id ?? '')
  const [selectedLeaveId, setSelectedLeaveId] = useState(initialLeaves[0]?.id ?? '')

  // Admin auth
  const [isAdminAuthorized, setIsAdminAuthorized] = useState(
    localStorage.getItem('ciomogul_admin_ok') === 'true',
  )

  // User auth - initialize from localStorage
  const [loggedUserId, setLoggedUserId] = useState(localStorage.getItem('ciomogul_user_id') || '')
  const [loggedUser, setLoggedUser] = useState(() => {
    const stored = localStorage.getItem('ciomogul_user')
    return stored ? JSON.parse(stored) : null
  })

  // Fetch logged-in user data on mount if token exists
  useEffect(() => {
    const token = localStorage.getItem('ciomogul_token')
    const userId = localStorage.getItem('ciomogul_user_id')
    
    if (token && userId && !loggedUser) {
      apiService.getMe()
        .then(userData => {
          setLoggedUser(userData)
          localStorage.setItem('ciomogul_user', JSON.stringify(userData))
        })
        .catch(err => {
          console.error('Failed to fetch user data:', err)
          // Clear invalid session
          localStorage.removeItem('ciomogul_token')
          localStorage.removeItem('ciomogul_user_id')
          localStorage.removeItem('ciomogul_user')
        })
    }
  }, [])

  // Computed data
  const filteredAttendance = useMemo(
    () => attendance.filter((record) => record.date.startsWith(selectedMonth)),
    [attendance, selectedMonth],
  )

  const filteredLeaves = useMemo(
    () => leaves.filter((leave) => leave.from.startsWith(selectedMonth)),
    [leaves, selectedMonth],
  )

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

  const value = {
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
    selectedUserId,
    setSelectedUserId,
    selectedLeaveId,
    setSelectedLeaveId,
    isAdminAuthorized,
    setIsAdminAuthorized,
    loggedUser,
    setLoggedUser,
    loggedUserId,
    setLoggedUserId,
    filteredAttendance,
    filteredLeaves,
    monthSummary,
    currentMonth,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
