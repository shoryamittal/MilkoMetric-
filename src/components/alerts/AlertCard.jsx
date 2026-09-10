import React from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, ArrowRight, Clock, Stethoscope } from 'lucide-react'
import Badge from '../common/Badge.jsx'
import { useApp } from '../../context/AppContext.jsx'

function timeAgo(min) {
  if (min < 1) return 'Just now'
  if (min < 60) return `${min} minutes ago`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h} hour${h > 1 ? 's' : ''} ago`
  return `${Math.floor(h / 24)} day${Math.floor(h / 24) > 1 ? 's' : ''} ago`
}

const LABEL = { critical: 'CRITICAL', high: 'HIGH RISK', moderate: 'MODERATE' }

export default function AlertCard({ alert }) {
  const navigate = useNavigate()
  const { vetReviews, requestVeterinaryReview } = useApp()
  const resolved = alert.status === 'resolved'
  const activeReview = vetReviews?.find((r) => r.animalId === alert.animalId)

  const handleRequestReview = (e) => {
    e.stopPropagation()
    requestVeterinaryReview(
      alert.animalId,
      `Escalated from Alert Center. Severity: ${alert.severity}, Risk: ${alert.riskScore}%`
    )
  }

  return (
    <div className={`rounded-lg border bg-canvas-raised p-4 shadow-card sm:p-4.5 ${resolved ? 'border-line opacity-70' : 'border-line'}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <Badge tone={resolved ? 'neutral' : alert.severity} dot>
          {resolved ? <CheckCircle2 size={11} className="-ml-0.5" /> : <AlertTriangle size={11} className="-ml-0.5" />}
          {resolved ? 'RESOLVED' : LABEL[alert.severity]}
        </Badge>
        <span className="flex items-center gap-1 text-[11px] text-ink-faint">
          <Clock size={11} /> {timeAgo(alert.timestampMinutesAgo)}
        </span>
      </div>

      <div className="mt-2.5 flex items-baseline justify-between">
        <p className="font-display text-[15px] font-semibold text-ink">{alert.animalId}</p>
        <span className="font-display text-base font-semibold tabular text-ink">{alert.riskScore}%</span>
      </div>
      <p className="text-xs text-ink-soft truncate">{alert.breed} · Lactation {alert.lactation}</p>

      {alert.prevScore != null && (
        <p className="mt-1.5 text-xs text-ink-soft">
          Risk increased from <span className="font-semibold text-ink tabular">{alert.prevScore}%</span> → <span className="font-semibold text-signal-red tabular">{alert.riskScore}%</span>
        </p>
      )}

      <div className="mt-2 rounded-sm bg-canvas-sunken px-2.5 py-2">
        <p className="text-[10px] uppercase tracking-wide text-ink-faint">Anomaly Trigger</p>
        <p className="mt-0.5 text-xs text-ink-soft">{alert.reason || 'Within normal range'}</p>
      </div>

      {alert.predictedWindow && (
        <p className="mt-2 text-xs text-ink-soft">
          Subclinical window: <span className="font-semibold text-ink">{alert.predictedWindow}</span>
        </p>
      )}

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={() => navigate(`/animals/${alert.animalId}`)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-sm border border-line py-2 text-xs font-semibold text-ink hover:bg-canvas-sunken transition-colors"
        >
          View Animal <ArrowRight size={12} />
        </button>

        {!resolved && (
          activeReview ? (
            <span
              onClick={() => navigate('/recommendations')}
              className="cursor-pointer rounded-sm border border-signal-blue/40 bg-signal-blueSoft px-2.5 py-2 text-[11px] font-semibold text-signal-blue hover:bg-signal-blue hover:text-white transition-colors"
              title="Click to view veterinary workflow"
            >
              In Review
            </span>
          ) : (
            <button
              onClick={handleRequestReview}
              className="flex items-center gap-1 rounded-sm border border-signal-red/30 bg-signal-redSoft px-2.5 py-2 text-xs font-semibold text-signal-red hover:bg-signal-red hover:text-white transition-colors"
              title="Escalate to Veterinarian"
            >
              <Stethoscope size={13} />
              <span>Escalate</span>
            </button>
          )
        )}
      </div>
    </div>
  )
}
