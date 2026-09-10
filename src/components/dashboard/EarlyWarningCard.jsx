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

      <div className="mt-3 grid grid-cols-4 gap-1.5 rounded-sm bg-canvas-sunken p-2.5 text-center">
        <div>
          <p className="text-[9.5px] uppercase tracking-wide text-ink-faint">Milk EC</p>
          <p className="text-xs font-semibold text-signal-red">+{animal.conductivity}%</p>
        </div>
        <div>
          <p className="text-[9.5px] uppercase tracking-wide text-ink-faint">Est. SCC</p>
          <p className="text-xs font-semibold text-signal-red">↑ {Math.round(((animal.scc - 150000) / 150000) * 100)}%</p>
        </div>
        <div>
          <p className="text-[9.5px] uppercase tracking-wide text-ink-faint">Yield Drop</p>
          <p className="text-xs font-semibold text-signal-red">↓ {Math.abs(animal.milkYieldChangePct)}%</p>
        </div>
        <div>
          <p className="text-[9.5px] uppercase tracking-wide text-ink-faint">Udder Temp</p>
          <p className="text-xs font-semibold text-signal-amber">+{Math.max(0, animal.temperature - 38.4).toFixed(1)}°C</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line/50 pt-2.5">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wide text-ink-faint">Predicted Subclinical Onset</p>
          <p className="text-xs sm:text-[13px] font-semibold text-pasture-800 truncate">{animal.predictedWindow || '48–72 hours'}</p>
        </div>
        <button
          onClick={() => navigate(`/animals/${animal.id}`)}
          className="flex items-center gap-1 rounded-sm border border-line px-2.5 py-1.5 text-xs font-semibold text-ink hover:bg-canvas-sunken shrink-0 transition-colors"
        >
          View Animal <ArrowRight size={12} />
        </button>
      </div>
    </div>
  )
}
