import React, { useState } from 'react'
import { BellOff } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import AlertCard from '../components/alerts/AlertCard.jsx'
import EmptyState from '../components/common/EmptyState.jsx'

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'critical', label: 'Critical' },
  { key: 'high', label: 'High Risk' },
  { key: 'moderate', label: 'Moderate' },
  { key: 'resolved', label: 'Resolved' },
]

export default function Alerts() {
  const { alerts } = useApp()
  const [tab, setTab] = useState('all')

  const filtered = alerts.filter((a) => {
    if (tab === 'all') return a.status === 'active'
    if (tab === 'resolved') return a.status === 'resolved'
    return a.status === 'active' && a.severity === tab
  })

  return (
    <div className="space-y-5">
      <div className="flex max-w-full overflow-x-auto no-scrollbar gap-1 rounded-lg border border-line bg-canvas-raised p-1 w-full sm:w-fit">
        {TABS.map((tItem) => (
          <button
            key={tItem.key}
            onClick={() => setTab(tItem.key)}
            className={`shrink-0 whitespace-nowrap rounded-md px-3.5 py-1.5 text-xs sm:text-[13px] font-medium transition-colors ${
              tab === tItem.key ? 'bg-pasture-700 text-white font-semibold shadow-sm' : 'text-ink-soft hover:bg-canvas-sunken'
            }`}
          >
            {tItem.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={BellOff} title="No alerts found" description="Your herd currently has no active warnings in this category." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      )}
    </div>
  )
}
