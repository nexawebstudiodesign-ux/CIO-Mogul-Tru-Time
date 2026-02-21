import { useApp } from '../context/useApp'

const toastStyles = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  error: 'border-red-200 bg-red-50 text-red-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  info: 'border-sky-200 bg-sky-50 text-sky-900',
}

export default function ToastHost() {
  const { toasts, dismissToast } = useApp()

  if (!toasts.length) return null

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[9999] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast-enter pointer-events-auto flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 shadow-lift ${
            toastStyles[toast.type] || toastStyles.info
          }`}
        >
          <p className="text-sm font-semibold leading-5">{toast.message}</p>
          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            className="rounded-full px-2 text-xs font-bold uppercase tracking-[0.2em] text-ink-400 hover:text-ink-500"
            aria-label="Dismiss notification"
          >
            X
          </button>
        </div>
      ))}
    </div>
  )
}
