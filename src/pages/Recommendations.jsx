import React, { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import Badge from '../components/common/Badge.jsx'
import RecommendationPanel from '../components/animals/RecommendationPanel.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import { ClipboardCheck } from 'lucide-react'

export default function Recommendations() {
  const { animals } = useApp()
  const priority = animals
    .filter((a) => a.riskLevel === 'high' || a.riskLevel === 'critical' || a.riskLevel === 'moderate')
    .sort((a, b) => b.riskScore - a.riskScore)
  const [selectedId, setSelectedId] = useState(priority[0]?.id)
  const selected = animals.find((a) => a.id === selectedId)

  if (!priority.length) {
    return <EmptyState icon={ClipboardCheck} title="No animals need action right now" description="Recommendations appear here as soon as the model flags a moderate or higher risk." />
  }

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
      <div className="rounded-lg border border-line bg-canvas-raised shadow-card xl:col-span-4">
        <div className="border-b border-line px-4 py-3">
          <p className="text-sm font-semibold text-ink">Priority Queue</p>
          <p className="text-xs text-ink-soft">{priority.length} animals need review</p>
        </div>
        <div className="max-h-[260px] xl:max-h-[560px] divide-y divide-line/70 overflow-y-auto">
          {priority.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelectedId(a.id)}
              className={`flex w-full items-center justify-between px-4 py-3 text-left transition-colors ${
                selectedId === a.id ? 'bg-canvas-sunken' : 'hover:bg-canvas-sunken/60'
              }`}
            >
              <div>
                <p className="text-[13.5px] font-semibold text-ink">{a.id}</p>
                <p className="text-xs text-ink-soft">{a.breed} · Lactation {a.lactationNumber}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-display text-sm font-semibold tabular text-ink">{a.riskScore}%</span>
                <Badge tone={a.riskLevel} dot={false} />
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="xl:col-span-8">
        {selected && (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-display text-lg font-semibold text-ink">Recommended Actions — {selected.id}</h2>
                <p className="text-sm text-ink-soft">Prioritised by urgency, based on current sensor readings</p>
              </div>
              <Badge tone={selected.riskLevel}>{selected.riskLabel}</Badge>
            </div>
            <RecommendationPanel animal={selected} />
          </>
        )}
      </div>
    </div>
  )
}
