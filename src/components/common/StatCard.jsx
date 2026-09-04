import React from 'react'

export default function StatCard({ icon: Icon, label, value, trend, trendLabel, trendDirection = 'up', tone = 'default' }) {
  const toneRing = {
    default: 'text-ink',
    high: 'text-signal-red',
    moderate: 'text-signal-amber',
    ok: 'text-pasture-600',
  }[tone]

  return (
    <div className="rounded-lg border border-line bg-canvas-raised p-5 shadow-card animate-riseIn">
      <div className="flex items-start justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-canvas-sunken">
          {Icon && <Icon size={18} strokeWidth={1.75} className={toneRing} />}
        </div>
        {trend != null && (
          <span
            className={`inline-flex items-center gap-1 text-xs font-medium tabular ${
              trendDirection === 'up' ? 'text-pasture-600' : 'text-signal-red'
            }`}
          >
            {trendDirection === 'up' ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
      <div className="mt-4 font-display text-3xl font-semibold text-ink tabular">{value}</div>
      <div className="mt-1 text-sm text-ink-soft">{label}</div>
      {trendLabel && <div className="mt-2 text-xs text-ink-faint">{trendLabel}</div>}
    </div>
  )
}
