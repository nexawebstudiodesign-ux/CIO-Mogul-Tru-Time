import { useMemo, useState } from 'react'

const users = [
  { id: 'CIO-0001', name: 'Anita Rao', email: 'anita@ciomogul.com', status: 'Active', leave: 12 },
  { id: 'CIO-0002', name: 'Kunal Mehta', email: 'kunal@ciomogul.com', status: 'Active', leave: 8 },
  { id: 'CIO-0003', name: 'Riya Nair', email: 'riya@ciomogul.com', status: 'Inactive', leave: 5 },
  { id: 'CIO-0004', name: 'Vikram Shah', email: 'vikram@ciomogul.com', status: 'Active', leave: 14 },
]

const leaves = [
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
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const [selectedUserId, setSelectedUserId] = useState(users[0].id)

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
              <div className="grid grid-cols-[1.2fr_1fr_0.8fr_0.8fr_0.8fr] bg-sand-50 px-4 py-3 text-xs uppercase tracking-[0.2em] text-ink-300">
                <span>User</span>
                <span>Entries</span>
                <span>Total Hours</span>
                <span>Avg Hours</span>
                <span>9h %</span>
              </div>
              {monthSummary.map((user) => (
                <button
                  type="button"
                  key={user.id}
                  onClick={() => setSelectedUserId(user.id)}
                  className={`grid w-full grid-cols-[1.2fr_1fr_0.8fr_0.8fr_0.8fr] items-center border-t border-sand-100 px-4 py-3 text-left text-sm transition ${
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
                </button>
              ))}
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
              <h3 className="text-sm font-semibold text-ink-500">Leaves</h3>
              <div className="mt-3 overflow-hidden rounded-2xl border border-sand-200">
                <div className="grid grid-cols-[1fr_0.8fr_0.6fr_0.6fr] bg-sand-50 px-4 py-3 text-xs uppercase tracking-[0.2em] text-ink-300">
                  <span>Type</span>
                  <span>Date Range</span>
                  <span>Days</span>
                  <span>Status</span>
                </div>
                {userLeaves.map((leave) => (
                  <div
                    key={leave.id}
                    className="grid grid-cols-[1fr_0.8fr_0.6fr_0.6fr] items-center border-t border-sand-100 px-4 py-3 text-sm"
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
                  </div>
                ))}
                {userLeaves.length === 0 && (
                  <div className="px-4 py-6 text-sm text-ink-300">No leave records for this month.</div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default App
