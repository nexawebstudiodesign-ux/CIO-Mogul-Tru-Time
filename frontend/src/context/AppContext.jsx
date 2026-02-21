import { createContext, useState, useMemo, useEffect } from 'react'
import { apiService } from '../utils/api'
import {
  currentMonth,
  initialUsers,
  initialLeaves,
  initialAttendance,
  initialMonthlySalaries,
} from '../data/initialData'

export const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [users, setUsers] = useState(initialUsers)
  const [leaves, setLeaves] = useState(initialLeaves)
  const [attendance, setAttendance] = useState(initialAttendance)
  const [monthlySalaries, setMonthlySalaries] = useState(initialMonthlySalaries)
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const [selectedUserId, setSelectedUserId] = useState(initialUsers[0]?.id ?? '')
  const [selectedLeaveId, setSelectedLeaveId] = useState(initialLeaves[0]?.id ?? '')

  // User auth - initialize from localStorage (access_token + ciomogul_user)
  const [loggedUserId, setLoggedUserId] = useState(localStorage.getItem('ciomogul_user_id') || '')
  const [loggedUser, setLoggedUser] = useState(() => {
    const stored = localStorage.getItem('ciomogul_user')
    return stored ? JSON.parse(stored) : null
  })

  // Admin auth: derived from token + user role (Supabase token system only)
  const [isAdminAuthorized, setIsAdminAuthorized] = useState(() => {
    const stored = localStorage.getItem('ciomogul_user')
    if (!stored) return false
    try {
      const user = JSON.parse(stored)
      return user?.role === 'ADMIN'
    } catch {
      return false
    }
  })

  // Validate session and sync user/role when access_token exists
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) return

    apiService
      .getMe()
      .then(async (userData) => {
        setLoggedUser(userData)
        setLoggedUserId(userData.id ?? '')
        localStorage.setItem('ciomogul_user', JSON.stringify(userData))
        localStorage.setItem('ciomogul_user_id', userData.id ?? '')
        setIsAdminAuthorized(userData.role === 'ADMIN')

        if (userData.role === 'USER') {
          const [myAttendance, myLeaves, mySalaries] = await Promise.all([
            apiService.getMyAttendance(),
            apiService.getMyLeaves(),
            apiService.getMySalaries(),
          ])

          const normalizedAttendance = (myAttendance ?? []).map((record) => ({
            userId: record.userId ?? record.user_id ?? userData.id,
            date: record.date,
            hours:
              record.hours ??
              (Number.isFinite(Number(record.total_minutes))
                ? Math.round((Number(record.total_minutes) / 60) * 10) / 10
                : 0),
            mails: record.mails ?? record.mails_count ?? 0,
            data: record.data ?? record.data_count ?? 0,
            linkedin: record.linkedin ?? record.linkedin_count ?? 0,
            followUps: record.followUps ?? record.follow_up_count ?? 0,
          }))

          const normalizedLeaves = (myLeaves ?? []).map((leave) => {
            const from = leave.from ?? leave.from_date
            const to = leave.to ?? leave.to_date
            const days =
              leave.days ??
              (from && to
                ? Math.floor((new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24)) + 1
                : 0)

            return {
              id: leave.id,
              userId: leave.userId ?? leave.user_id ?? userData.id,
              name: leave.name ?? userData.name,
              type: leave.type ?? leave.leave_type,
              from,
              to,
              days,
              status: leave.status,
            }
          })

          setAttendance(normalizedAttendance)
          setLeaves(normalizedLeaves)
          setMonthlySalaries(mySalaries ?? [])
        }
      })
      .catch((err) => {
        console.error('Failed to validate session:', err)
        localStorage.removeItem('access_token')
        localStorage.removeItem('ciomogul_user')
        localStorage.removeItem('ciomogul_user_id')
        setLoggedUser(null)
        setLoggedUserId('')
        setIsAdminAuthorized(false)
      })
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
      const complianceCount = records.filter((record) => record.hours >= 4.5).length
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
