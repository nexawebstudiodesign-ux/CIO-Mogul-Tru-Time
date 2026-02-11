export const getNextEmployeeId = (list) => {
  const prefix = 'CIO-'
  let max = 0
  list.forEach((user) => {
    const match = user.id.match(/CIO-(\\d+)/)
    if (match) {
      max = Math.max(max, Number(match[1]))
    }
  })
  return `${prefix}${String(max + 1).padStart(4, '0')}`
}

export const getNextLeaveId = (list) => {
  let max = 0
  list.forEach((leave) => {
    const match = leave.id.match(/L-(\\d+)/)
    if (match) {
      max = Math.max(max, Number(match[1]))
    }
  })
  return `L-${String(max + 1).padStart(4, '0')}`
}

export const getNextSalaryId = (list) => {
  let max = 0
  list.forEach((salary) => {
    const match = salary.id.match(/MS-(\\d+)/)
    if (match) {
      max = Math.max(max, Number(match[1]))
    }
  })
  return `MS-${String(max + 1).padStart(3, '0')}`
}

export const clampBalance = (value) => Math.min(12, Math.max(0, value))

export const monthDiff = (fromMonth, toMonth) => {
  const [fromYear, fromMon] = fromMonth.split('-').map(Number)
  const [toYear, toMon] = toMonth.split('-').map(Number)
  return (toYear - fromYear) * 12 + (toMon - fromMon)
}

export const getEffectiveSickBalance = (user, month) => {
  if (!user) {
    return 0
  }
  const baseMonth = user.sickBaseMonth || month
  const diff = Math.max(0, monthDiff(baseMonth, month))
  return clampBalance(user.sickBalance - diff)
}
