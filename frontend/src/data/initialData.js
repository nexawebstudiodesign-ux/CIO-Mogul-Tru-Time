const now = new Date()
const monthValue = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

export const currentMonth = monthValue

export const initialUsers = []

export const initialLeaves = []

export const initialAttendance = []

export const initialMonthlySalaries = []
