import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'

export default function SalarySlip() {
  const { loggedUser, loggedUserId, attendance, monthlySalaries, currentMonth } = useApp()
  const [salarySlipMonth, setSalarySlipMonth] = useState(currentMonth)

  const monthYear = new Date(salarySlipMonth + '-01').toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  const salaryMonthAttendance = useMemo(
    () =>
      attendance.filter(
        (record) => record.userId === loggedUserId && record.date.startsWith(salarySlipMonth),
      ),
    [attendance, loggedUserId, salarySlipMonth],
  )

  const totalDays = salaryMonthAttendance.length

  const monthlySalary = useMemo(
    () => monthlySalaries.find((s) => s.userId === loggedUserId && s.month === salarySlipMonth),
    [monthlySalaries, loggedUserId, salarySlipMonth],
  )

  const baseSalary = monthlySalary?.baseSalary || loggedUser?.baseSalary || 0
  const hra = monthlySalary?.hra || loggedUser?.hra || 0
  const transportAllowance = monthlySalary?.transportAllowance || loggedUser?.transportAllowance || 0
  const otherAllowance = monthlySalary?.otherAllowance || loggedUser?.otherAllowance || 0
  const performanceBonus = monthlySalary?.performanceBonus || 0
  const pfDeduction = monthlySalary?.pfDeduction || loggedUser?.pfDeduction || 0
  const taxDeduction = monthlySalary?.taxDeduction || loggedUser?.taxDeduction || 0
  const otherDeduction = monthlySalary?.otherDeduction || loggedUser?.otherDeduction || 0

  const grossEarnings = baseSalary + hra + transportAllowance + otherAllowance + performanceBonus
  const totalDeductions = pfDeduction + taxDeduction + otherDeduction
  const netSalary = grossEarnings - totalDeductions

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

  return (
    <>
      <style>{`
        @media print {
          @page { 
            margin: 0.25in 0.4in; 
            size: A4 portrait;
          }
          .no-print { display: none !important; }
          body { 
            background: white; 
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          * {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .salary-slip-container { 
            box-shadow: none !important; 
            padding: 8px 16px !important;
            margin: 0 !important;
            border-radius: 0 !important;
            page-break-inside: avoid;
            break-inside: avoid;
            display: block !important;
          }
          .print-reduce { 
            margin-top: 8px !important; 
            margin-bottom: 8px !important; 
          }
          .print-reduce-sm { 
            margin-top: 6px !important; 
            margin-bottom: 6px !important; 
          }
          .print-text { font-size: 10px !important; line-height: 1.3 !important; }
          .print-heading { font-size: 14px !important; line-height: 1.2 !important; }
          .font-signature { 
            font-family: 'Brush Script MT', cursive; 
            font-size: 20px !important;
          }
          h1, h2, h3 { margin: 4px 0 !important; }
          .space-y-2 > * + * { margin-top: 4px !important; }
        }
        .font-signature { 
          font-family: 'Brush Script MT', 'Lucida Handwriting', cursive; 
          font-style: italic;
        }
      `}</style>
      <div className="min-h-screen p-6 md:p-10">
        <div className="mx-auto max-w-4xl">
          <div className="no-print mb-6">
            <div className="flex items-center justify-between mb-4">
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
            <div className="glass-panel rounded-2xl p-4 shadow-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink-500">Select Month</p>
                  <p className="text-xs text-ink-300">Choose a month to view salary slip</p>
                </div>
                <input
                  type="month"
                  className="rounded-lg border border-sand-200 bg-white/80 px-4 py-2 text-sm font-semibold text-ink-500"
                  value={salarySlipMonth}
                  onChange={(event) => setSalarySlipMonth(event.target.value)}
                />
              </div>
            </div>
          </div>

          {baseSalary === 0 && hra === 0 ? (
            <div className="glass-panel rounded-3xl p-8 shadow-lift">
              <div className="text-center py-12">
                <p className="text-lg font-bold text-brand-600">
                  CIO MOGUL GLOBAL PUBLICATION PRIVATE LIMITED
                </p>
                <h1 className="mt-3 text-2xl font-bold text-ink-500">No Salary Data</h1>
                <p className="mt-3 text-ink-400">No salary information available for {monthYear}.</p>
                <p className="mt-2 text-sm text-ink-300">
                  Please contact HR or select a different month.
                </p>
              </div>
            </div>
          ) : (
            <div className="salary-slip-container glass-panel rounded-3xl p-8 shadow-lift">
              <div className="border-b border-sand-200 pb-3 print-reduce-sm">
                <div className="text-center mb-3">
                  <h2 className="text-lg font-bold text-brand-600 print-heading">
                    CIO MOGUL GLOBAL PUBLICATION PRIVATE LIMITED
                  </h2>
                  <p className="text-[10px] text-ink-400 mt-0.5 print-text">
                    UAN: U58132MH2025PTC459494
                  </p>
                  <p className="text-[10px] text-ink-400 mt-0.5 print-text">
                    Sno. 80/1 Sai Nagari Bld, B/iwadmukhwadi Bhosari, Punawale, Pune, Pune City,
                    Maharashtra, India, 411033
                  </p>
                </div>
                <div className="flex items-start justify-between text-xs print-text">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-ink-300">Salary Slip</p>
                    <h1 className="mt-0.5 text-lg font-bold text-ink-500 print-heading">
                      {monthYear}
                    </h1>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-ink-300">Employee Details</p>
                    <p className="font-semibold text-xs mt-0.5">{loggedUser.name}</p>
                    <p className="text-ink-300 text-[10px]">{loggedUser.id}</p>
                    <p className="text-ink-300 text-[10px]">{loggedUser.email}</p>
                  </div>
                </div>
              </div>

              <div className="mt-3 rounded-xl border border-sand-200 overflow-hidden print-reduce-sm">
                <div className="bg-sand-50 px-3 py-1">
                  <h3 className="text-xs font-semibold text-ink-500 print-text">Salary Details</h3>
                </div>
                <div className="bg-white">
                  <div className="grid grid-cols-2 border-b border-sand-100">
                    <div className="px-3 py-1 text-[10px] text-ink-400 border-r border-sand-100 print-text">
                      Pay Period
                    </div>
                    <div className="px-3 py-1 text-xs font-semibold text-ink-500 print-text">
                      {monthYear}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 border-b border-sand-100">
                    <div className="px-3 py-1 text-[10px] text-ink-400 border-r border-sand-100 print-text">
                      Working Days
                    </div>
                    <div className="px-3 py-1 text-xs font-semibold text-ink-500 print-text">
                      {monthlySalary?.workingDays || 22} days
                    </div>
                  </div>
                  <div className="grid grid-cols-2">
                    <div className="px-3 py-1 text-[10px] text-ink-400 border-r border-sand-100 print-text">
                      Days Attended
                    </div>
                    <div className="px-3 py-1 text-xs font-semibold text-ink-500 print-text">
                      {totalDays} days
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2 print-reduce">
                <div>
                  <h2 className="text-sm font-bold text-ink-500 print-text">Earnings</h2>
                  <div className="mt-2 space-y-1.5">
                    <div className="flex justify-between text-xs print-text">
                      <span className="text-ink-400">Basic Salary</span>
                      <span className="font-semibold text-ink-500">
                        ₹{baseSalary.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs print-text">
                      <span className="text-ink-400">HRA</span>
                      <span className="font-semibold text-ink-500">₹{hra.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs print-text">
                      <span className="text-ink-400">Transport Allowance</span>
                      <span className="font-semibold text-ink-500">
                        ₹{transportAllowance.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs print-text">
                      <span className="text-ink-400">Other Allowance</span>
                      <span className="font-semibold text-ink-500">
                        ₹{otherAllowance.toLocaleString()}
                      </span>
                    </div>
                    {performanceBonus > 0 && (
                      <div className="flex justify-between rounded bg-green-50 px-2 py-1 text-xs print-text">
                        <span className="font-semibold text-green-700">Performance Bonus</span>
                        <span className="font-bold text-green-900">
                          ₹{performanceBonus.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="border-t border-sand-200 pt-1.5 mt-1.5">
                      <div className="flex justify-between font-bold text-xs print-text">
                        <span className="text-ink-500">Gross Earnings</span>
                        <span className="text-brand-600">₹{grossEarnings.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-sm font-bold text-ink-500 print-text">Deductions</h2>
                  <div className="mt-2 space-y-1.5">
                    <div className="flex justify-between text-xs print-text">
                      <span className="text-ink-400">Provident Fund (PF)</span>
                      <span className="font-semibold text-ink-500">
                        ₹{pfDeduction.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs print-text">
                      <span className="text-ink-400">Tax Deduction (TDS)</span>
                      <span className="font-semibold text-ink-500">
                        ₹{taxDeduction.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs print-text">
                      <span className="text-ink-400">Other Deductions</span>
                      <span className="font-semibold text-ink-500">
                        ₹{otherDeduction.toLocaleString()}
                      </span>
                    </div>
                    <div className="border-t border-sand-200 pt-1.5 mt-1.5">
                      <div className="flex justify-between font-bold text-xs print-text">
                        <span className="text-ink-500">Total Deductions</span>
                        <span className="text-red-600">₹{totalDeductions.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-brand-50 p-3 print-reduce-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-ink-500 print-text">Net Salary</span>
                  <span className="text-lg font-bold text-brand-600 print-heading">
                    ₹{netSalary.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="mt-3 border-t border-sand-200 pt-3 print-reduce-sm">
                <div className="flex justify-end mb-2">
                  <div className="text-center">
                    <div className="mb-1 text-xs font-bold text-brand-600 print-text">
                      CIO MOGUL GLOBAL PUBLICATION PVT. LTD.
                    </div>
                    <div className="border-2 border-brand-400 rounded px-4 py-2 bg-white">
                      <img
                        src="/signature.png"
                        alt="Director Signature"
                        className="h-16 mx-auto object-contain"
                      />
                      <div className="text-[10px] font-semibold text-ink-500 print-text mt-1">
                        Director
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-center text-[9px] text-ink-300 space-y-0 print-text">
                  <p className="font-semibold text-ink-400">
                    CIO MOGUL GLOBAL PUBLICATION PRIVATE LIMITED
                  </p>
                  <p>
                    UAN: U58132MH2025PTC459494 | Sno. 80/1 Sai Nagari Bld, Punawale, Pune - 411033
                  </p>
                  <p className="text-ink-300">
                    This is a system-generated salary slip. For queries: info@theciomogul.com
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
