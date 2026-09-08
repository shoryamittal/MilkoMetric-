import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldAlert, AlertTriangle, ArrowRight, CheckCircle2, Clock, Siren, Syringe, Eye, Stethoscope } from 'lucide-react'
import Badge from '../common/Badge.jsx'

export default function LiveTriageTable({ animals = [], alerts = [] }) {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('high_risk')
  const [actionSuccess, setActionSuccess] = useState({})

  // Filter animals that need immediate clinical attention
  const highRiskAnimals = animals.filter(
    (a) => a.riskLevel === 'critical' || a.riskLevel === 'high' || a.riskScore >= 60
  ).sort((a, b) => b.riskScore - a.riskScore)

  const moderateAnimals = animals.filter(
    (a) => a.riskLevel === 'moderate'
  ).sort((a, b) => b.riskScore - a.riskScore)

  const displayedList = filter === 'critical'
    ? highRiskAnimals.filter((a) => a.riskLevel === 'critical')
    : filter === 'high_risk'
    ? highRiskAnimals
    : moderateAnimals

  const handleAction = (cowId, actionType) => {
    setActionSuccess((prev) => ({ ...prev, [cowId]: actionType }))
    setTimeout(() => {
      setActionSuccess((prev) => {
        const next = { ...prev }
        delete next[cowId]
        return next
      })
    }, 4000)
  }

  return (
    <div className="rounded-lg border border-line bg-canvas-raised shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-base font-semibold text-ink">Rapid Clinical Triage Queue</h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-signal-redSoft px-2 py-0.5 text-[11px] font-bold text-signal-red">
              <Siren size={11} className="animate-pulse" /> {highRiskAnimals.length} Require Action
            </span>
          </div>
          <p className="mt-0.5 text-xs text-ink-soft">
            Priority triage based on multi-parameter sensor spikes (SCC, Conductivity, Udder Temp)
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center rounded-md border border-line bg-canvas p-0.5 text-xs font-medium text-ink-soft">
          <button
            onClick={() => setFilter('high_risk')}
            className={`rounded px-2.5 py-1 transition-colors ${
              filter === 'high_risk' ? 'bg-white font-semibold text-ink shadow-sm' : 'hover:text-ink'
            }`}
          >
            All Urgent ({highRiskAnimals.length})
          </button>
          <button
            onClick={() => setFilter('critical')}
            className={`rounded px-2.5 py-1 transition-colors ${
              filter === 'critical' ? 'bg-white font-semibold text-signal-red shadow-sm' : 'hover:text-ink'
            }`}
          >
            Critical Only ({highRiskAnimals.filter((a) => a.riskLevel === 'critical').length})
          </button>
          <button
            onClick={() => setFilter('moderate')}
            className={`rounded px-2.5 py-1 transition-colors ${
              filter === 'moderate' ? 'bg-white font-semibold text-signal-amber shadow-sm' : 'hover:text-ink'
            }`}
          >
            Moderate ({moderateAnimals.length})
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-line bg-canvas/60 text-[11px] uppercase tracking-wider text-ink-faint">
              <th className="px-5 py-3 font-semibold">Animal Tag</th>
              <th className="px-4 py-3 font-semibold">Breed & Age</th>
              <th className="px-4 py-3 font-semibold">AI Risk Score</th>
              <th className="px-4 py-3 font-semibold">AI-Estimated SCC</th>
              <th className="px-4 py-3 font-semibold">Probe Telemetry (EC / Yield / Temp)</th>
              <th className="px-4 py-3 font-semibold">Clinical Window</th>
              <th className="px-5 py-3 text-right font-semibold">Milking & Vet Action Protocols</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/70">
            {displayedList.slice(0, 6).map((animal) => {
              const isCritical = animal.riskLevel === 'critical'
              const executed = actionSuccess[animal.id]

              return (
                <tr
                  key={animal.id}
                  className={`transition-colors hover:bg-canvas/50 ${
                    animal.id === 'COW-024' ? 'bg-pasture-50/40 font-medium' : ''
                  }`}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-[13px] font-bold text-ink">{animal.id}</span>
                      {animal.id === 'COW-024' && (
                        <span className="rounded bg-pasture-600 px-1.5 py-0.5 text-[9.5px] font-bold uppercase text-white">
                          Target Demo
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3.5 text-ink-soft">
                    {animal.breed} · {animal.age}y (L{animal.lactationNumber})
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-display text-sm font-bold tabular ${
                          isCritical ? 'text-signal-critical' : 'text-signal-red'
                        }`}
                      >
                        {animal.riskScore}%
                      </span>
                      <Badge tone={isCritical ? 'critical' : 'high'} dot>
                        {isCritical ? 'CRITICAL' : 'HIGH'}
                      </Badge>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <div>
                      <span className="font-semibold text-ink tabular">{animal.scc.toLocaleString()}</span>
                      <span className="ml-1 text-[10.5px] text-ink-faint">cells/ml</span>
                    </div>
                    <div className="text-[11px] font-medium text-signal-red">
                      ↑{Math.round(((animal.scc - 150000) / 150000) * 100)}% vs baseline
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="space-y-0.5">
                      <div className="font-medium text-[11px] text-signal-red flex items-center gap-1">
                        <span className="font-semibold">Milk EC:</span> +{animal.conductivity}% ({(4.8 + animal.conductivity * 0.15).toFixed(1)} mS/cm)
                      </div>
                      <div className="text-[10.5px] text-ink-soft">
                        Yield: <strong className="text-signal-red">{animal.milkYieldChangePct}%</strong> · Udder: <strong className="text-signal-amber">{animal.temperature}°C</strong>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 font-medium text-ink">
                      <Clock size={12} className="text-pasture-600" />
                      <span className="text-xs font-semibold text-pasture-800 bg-pasture-100/60 px-1.5 py-0.5 rounded">
                        {animal.predictedWindow || '48–72h'}
                      </span>
                    </div>
                  </td>

                  <td className="px-5 py-3.5 text-right">
                    {executed ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-pasture-700">
                        <CheckCircle2 size={13} /> {executed} Executed!
                      </span>
                    ) : (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleAction(animal.id, 'Quarantine & Teat Dip')}
                          title="Isolate & Apply Teat Dip Protocol"
                          className="rounded border border-line bg-canvas-sunken px-2 py-1 text-[11px] font-semibold text-ink hover:bg-line/60"
                        >
                          Quarantine
                        </button>
                        <button
                          onClick={() => handleAction(animal.id, 'Milk Diverted')}
                          title="Divert Milk from Bulk Tank (Milking Advisory)"
                          className="rounded border border-signal-red/30 bg-signal-redSoft px-2 py-1 text-[11px] font-semibold text-signal-red hover:bg-signal-red/15"
                        >
                          Divert Line
                        </button>
                        <button
                          onClick={() => handleAction(animal.id, 'Vet Tele-Alert Sent')}
                          title="Instant Veterinary Escalation via SMS/App"
                          className="flex items-center gap-1 rounded border border-signal-blue/30 bg-signal-blueSoft px-2 py-1 text-[11px] font-semibold text-signal-blue hover:bg-signal-blue/15"
                        >
                          <Stethoscope size={11} /> Alert Vet
                        </button>
                        <button
                          onClick={() => navigate(`/animals/${animal.id}`)}
                          className="flex items-center gap-1 rounded bg-pasture-700 px-2 py-1 text-[11px] font-semibold text-white hover:bg-pasture-600"
                        >
                          <Eye size={11} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-line px-5 py-3 text-xs text-ink-soft">
        <span>Displaying top urgent candidates requiring non-antibiotic early intervention</span>
        <button
          onClick={() => navigate('/alerts')}
          className="flex items-center gap-1 font-semibold text-pasture-700 hover:text-pasture-600"
        >
          View Full Triage Log ({animals.length} animals) <ArrowRight size={13} />
        </button>
      </div>
    </div>
  )
}