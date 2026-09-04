import React from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, ArrowRight } from 'lucide-react'
import Badge from '../common/Badge.jsx'

export default function EarlyWarningCard({ alert, animal }) {
  const navigate = useNavigate()
  if (!animal) return null
  const isCritical = alert.severity === 'critical'

  return (
    <div className={`rounded-lg border bg-canvas-raised p-4 shadow-card ${isCritical ? 'border-signal-critical/25' : 'border-signal-red/20'}`}>
      <div className="flex items-start justify-between gap-3">
        <Badge tone={alert.severity} dot>
          <AlertTriangle size={11} className="-ml-0.5" /> {isCritical ? 'CRITICAL' : 'HIGH RISK'}
        </Badge>
        <span className="font-display text-lg font-semibold tabular" style={{ color: isCritical ? '#7E1F1B' : '#C4571F' }}>
          {alert.riskScore}%
        </span>
      </div>

      <p className="mt-2.5 font-display text-[15px] font-semibold text-ink">{animal.id}</p>
      <p className="text-xs text-ink-soft">{animal.breed} · Lactation {animal.lactationNumber}</p>

      <div className="mt-3 grid grid-cols-3 gap-2 rounded-sm bg-canvas-sunken p-2.5 text-center">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-ink-faint">SCC</p>
          <p className="text-xs font-semibold text-signal-red">↑ {Math.round(((animal.scc - 150000) / 150000) * 100)}%</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-ink-faint">Milk Yield</p>
          <p className="text-xs font-semibold text-signal-red">↓ {Math.abs(animal.milkYieldChangePct)}%</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-ink-faint">Activity</p>
          <p className="text-xs font-semibold text-signal-red">↓ {Math.abs(animal.activity)}%</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-ink-faint">Predicted onset</p>
          <p className="text-[13px] font-medium text-ink">{animal.predictedWindow || '—'}</p>
        </div>
        <button
          onClick={() => navigate(`/animals/${animal.id}`)}
          className="flex items-center gap-1 rounded-sm border border-line px-2.5 py-1.5 text-xs font-semibold text-ink hover:bg-canvas-sunken"
        >
          View Animal <ArrowRight size={12} />
        </button>
      </div>
    </div>
  )
}
