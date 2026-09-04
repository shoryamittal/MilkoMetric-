import React from 'react'
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import { useApp } from '../../context/AppContext.jsx'

const ICONS = { critical: AlertTriangle, high: AlertTriangle, ok: CheckCircle2, info: Info }
const BORDER = {
  critical: 'border-l-signal-critical',
  high: 'border-l-signal-red',
  ok: 'border-l-pasture-500',
  info: 'border-l-signal-blue',
}

export default function ToastHost() {
  const { toasts, dismissToast } = useApp()
  if (!toasts.length) return null
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.tone] || Info
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto animate-riseIn rounded-md border border-line border-l-4 bg-canvas-raised p-3.5 shadow-pop ${BORDER[toast.tone] || BORDER.info}`}
          >
            <div className="flex items-start gap-2.5">
              <Icon size={17} className="mt-0.5 shrink-0 text-ink-soft" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">{toast.title}</p>
                {toast.message && <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">{toast.message}</p>}
              </div>
              <button onClick={() => dismissToast(toast.id)} aria-label="Dismiss" className="shrink-0 text-ink-faint hover:text-ink">
                <X size={15} />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
