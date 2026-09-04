import React, { useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { HERD_SUMMARY } from '../../data/animals.js'

const SEGMENTS = [
  { key: 'noRisk', label: 'No Risk', color: '#3E7C52', value: HERD_SUMMARY.noRisk },
  { key: 'low', label: 'Low Risk', color: '#9AC3A0', value: HERD_SUMMARY.low },
  { key: 'moderate', label: 'Moderate', color: '#D79A3B', value: HERD_SUMMARY.moderate },
  { key: 'high', label: 'High', color: '#C4571F', value: HERD_SUMMARY.high },
  { key: 'critical', label: 'Critical', color: '#7E1F1B', value: HERD_SUMMARY.critical },
]

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-sm border border-line bg-canvas-raised px-3 py-2 text-xs shadow-pop">
      <p className="font-semibold text-ink">{d.label}</p>
      <p className="text-ink-soft">
        {d.value} animals · {Math.round((d.value / HERD_SUMMARY.total) * 100)}%
      </p>
    </div>
  )
}

export default function HerdRiskChart() {
  const [active, setActive] = useState(null)
  const healthyPct = Math.round(((HERD_SUMMARY.noRisk + HERD_SUMMARY.low) / HERD_SUMMARY.total) * 100)

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
      <div className="relative h-56 w-56 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={SEGMENTS}
              dataKey="value"
              nameKey="label"
              innerRadius={72}
              outerRadius={100}
              paddingAngle={2}
              stroke="none"
              onMouseEnter={(_, idx) => setActive(idx)}
              onMouseLeave={() => setActive(null)}
            >
              {SEGMENTS.map((s, idx) => (
                <Cell key={s.key} fill={s.color} opacity={active === null || active === idx ? 1 : 0.35} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-3xl font-semibold text-ink tabular">{healthyPct}%</span>
          <span className="text-xs text-ink-soft">Healthy</span>
          <span className="mt-1 text-[11px] text-ink-faint">{HERD_SUMMARY.total} Animals</span>
        </div>
      </div>

      <div className="grid w-full grid-cols-2 gap-x-6 gap-y-3 sm:w-auto">
        {SEGMENTS.map((s, idx) => (
          <button
            key={s.key}
            onMouseEnter={() => setActive(idx)}
            onMouseLeave={() => setActive(null)}
            className="flex items-center justify-between gap-3 rounded-sm px-1 py-0.5 text-left transition-opacity"
            style={{ opacity: active === null || active === idx ? 1 : 0.45 }}
          >
            <span className="flex items-center gap-2 text-[13px] text-ink-soft">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
              {s.label}
            </span>
            <span className="font-display text-[13px] font-semibold text-ink tabular">{s.value}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
