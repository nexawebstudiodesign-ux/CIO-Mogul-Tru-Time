export default function Welcome() {
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
            className="mt-4 ml-4 inline-flex items-center rounded-full border border-sand-200 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-ink-400"
            href="/login"
          >
            User Login
          </a>
        </div>
      </div>
    </div>
  )
}
