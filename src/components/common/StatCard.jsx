import React from 'react'

export default function StatCard({ icon: Icon, label, value, trend, trendLabel, trendDirection = 'up', tone = 'default' }) {
  const toneRing = {
    default: 'text-ink',
    high: 'text-signal-red',
    moderate: 'text-signal-amber',
    ok: 'text-pasture-600',
  }[tone]

  return (
    <div className="rounded-lg border border-line bg-canvas-raised p-3.5 sm:p-5 shadow-card animate-riseIn flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-1.5">
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-sm bg-canvas-sunken">
            {Icon && <Icon size={16} strokeWidth={1.75} className={`${toneRing} sm:w-[18px] sm:h-[18px]`} />}
          </div>
          {trend != null && (
            <span
              className={`inline-flex items-center gap-0.5 sm:gap-1 text-[11px] sm:text-xs font-semibold tabular truncate max-w-[65%] text-right ${
                trendDirection === 'up' ? 'text-pasture-600' : 'text-signal-red'
              }`}
              title={trend}
            >
              <span className="shrink-0">{trendDirection === 'up' ? '↑' : '↓'}</span>
              <span className="truncate">{trend}</span>
            </span>
          )}
        </div>
        <div className="mt-3 font-display text-2xl sm:text-3xl font-semibold text-ink tabular truncate">{value}</div>
        <div className="mt-0.5 text-xs sm:text-sm font-medium text-ink-soft line-clamp-2 min-h-[2rem]" title={label}>
          {label}
        </div>
      </div>
      {trendLabel && <div className="mt-2 text-[10.5px] sm:text-xs text-ink-faint truncate" title={trendLabel}>{trendLabel}</div>}
    </div>
  )
}
