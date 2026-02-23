export default function Welcome() {
  return (
    <div className="app-page page-center">
      <div className="mx-auto max-w-3xl">
        <div className="panel-shell">
          <p className="text-sm uppercase tracking-[0.3em] text-ink-300">CIO Mogul</p>
          <h1 className="section-title mt-3">Welcome</h1>
          <p className="mt-3 text-sm text-ink-300">
            Go to the admin dashboard to view attendance and leave records.
          </p>
          <a
            className="btn-pill mt-6 bg-ink-500 text-sand-50"
            href="/dashboard"
          >
            Open Dashboard
          </a>
          <a
            className="btn-pill mt-4 ml-4 border border-sand-200 text-ink-400"
            href="/login"
          >
            User Login
          </a>
        </div>
      </div>
    </div>
  )
}
