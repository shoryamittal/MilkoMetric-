import React from 'react'
import { InfoTooltip } from '../common/Tooltip.jsx'

export function RiskFactorBars({ factors, title = 'AI Risk Factors', subtitle = 'Factors contributing to current mastitis risk' }) {
  const max = Math.max(...factors.map((f) => Math.abs(f.value)))
  return (
    <div>
      <div className="mb-4 flex items-center gap-1.5">
        <h3 className="font-display text-base font-semibold text-ink">{title}</h3>
        <InfoTooltip text="These factors are used by the predictive model to estimate mastitis risk." />
      </div>
      <p className="-mt-3 mb-4 text-sm text-ink-soft">{subtitle}</p>
      <div className="space-y-4">
        {factors.map((f) => (
          <div key={f.label}>
            <div className="mb-1 flex items-center justify-between text-[13px]">
              <span className="text-ink-soft">{f.label}</span>
              <span className="font-semibold text-ink tabular">{f.display}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-canvas-sunken">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, (Math.abs(f.value) / max) * 100)}%`, background: f.color || '#2F6B44' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
