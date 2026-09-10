import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ChevronRight, ArrowUpDown } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { BREEDS } from '../data/animals.js'
import Badge from '../components/common/Badge.jsx'
import EmptyState from '../components/common/EmptyState.jsx'

const RISK_OPTIONS = [
  { value: 'all', label: 'All Risk Levels' },
  { value: 'none', label: 'No Risk' },
  { value: 'low', label: 'Low Risk' },
  { value: 'moderate', label: 'Moderate Risk' },
  { value: 'high', label: 'High Risk' },
  { value: 'critical', label: 'Critical' },
]
const SORTS = [
  { value: 'riskDesc', label: 'Risk: High to Low' },
  { value: 'riskAsc', label: 'Risk: Low to High' },
  { value: 'sccDesc', label: 'SCC: High to Low' },
  { value: 'yieldAsc', label: 'Milk Yield: Low to High' },
]

function Select({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-sm border border-line bg-canvas-raised px-2.5 py-2 text-[13px] text-ink focus:border-pasture-500"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

export default function Animals() {
  const { animals } = useApp()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [risk, setRisk] = useState('all')
  const [breed, setBreed] = useState('all')
  const [lactation, setLactation] = useState('all')
  const [sort, setSort] = useState('riskDesc')

  const filtered = useMemo(() => {
    let list = animals.filter((a) => {
      if (query && !a.id.toLowerCase().includes(query.toLowerCase())) return false
      if (risk !== 'all' && a.riskLevel !== risk) return false
      if (breed !== 'all' && a.breed !== breed) return false
      if (lactation !== 'all' && String(a.lactationNumber) !== lactation) return false
      return true
    })
    const sorters = {
      riskDesc: (a, b) => b.riskScore - a.riskScore,
      riskAsc: (a, b) => a.riskScore - b.riskScore,
      sccDesc: (a, b) => b.scc - a.scc,
      yieldAsc: (a, b) => a.milkYield - b.milkYield,
    }
    return list.sort(sorters[sort])
  }, [animals, query, risk, breed, lactation, sort])

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2.5 rounded-lg border border-line bg-canvas-raised p-3 sm:p-3.5 shadow-card">
        <div className="relative w-full">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by Animal ID (e.g. COW-024)..."
            className="w-full rounded-md border border-line bg-canvas py-2 pl-8 pr-3 text-[13px] text-ink placeholder:text-ink-faint focus:border-pasture-500"
          />
        </div>

        {/* Filters in 2x2 grid on phone, inline flex on tablet/desktop */}
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-2.5">
          <Select value={risk} onChange={setRisk} options={RISK_OPTIONS} />
          <Select value={breed} onChange={setBreed} options={[{ value: 'all', label: 'All Breeds' }, ...BREEDS.map((b) => ({ value: b, label: b }))]} />
          <Select
            value={lactation}
            onChange={setLactation}
            options={[{ value: 'all', label: 'All Lactations' }, ...[1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: `Lactation ${n}` }))]}
          />
          <div className="flex items-center gap-1.5 sm:ml-auto">
            <ArrowUpDown size={13} className="text-ink-faint hidden sm:inline" />
            <Select value={sort} onChange={setSort} options={SORTS} />
          </div>
        </div>
      </div>

      <p className="text-xs text-ink-faint">
        Showing {filtered.length} of {animals.length} animals
      </p>

      {filtered.length === 0 ? (
        <EmptyState icon={Search} title="No animals match these filters" description="Try clearing a filter or searching a different Animal ID." />
      ) : (
        <>
          {/* Mobile Card List View (Visible on phones & small screens) */}
          <div className="grid grid-cols-1 gap-2.5 md:hidden">
            {filtered.map((a) => (
              <div
                key={a.id}
                onClick={() => navigate(`/animals/${a.id}`)}
                className="rounded-lg border border-line bg-canvas-raised p-3.5 shadow-sm transition-all active:scale-[0.99] active:bg-canvas-sunken"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-display text-base font-bold text-ink">{a.id}</span>
                    {a.id === 'COW-024' && (
                      <span className="shrink-0 rounded bg-pasture-700 px-1.5 py-0.5 text-[9.5px] font-bold text-white uppercase">
                        Demo
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge tone={a.riskLevel}>{a.riskLabel}</Badge>
                    <ChevronRight size={16} className="text-ink-faint shrink-0" />
                  </div>
                </div>

                <p className="mt-1 text-xs text-ink-soft truncate">
                  {a.breed} · {a.age} yrs · Lactation {a.lactationNumber}
                </p>

                {/* 4 Quick Telemetry Badges */}
                <div className="mt-3 grid grid-cols-4 gap-1.5 border-t border-line/70 pt-2.5 text-center text-xs">
                  <div className="rounded bg-canvas-sunken/80 px-1 py-1">
                    <p className="text-[10px] text-ink-faint uppercase">Yield</p>
                    <p className="font-semibold text-ink tabular">{a.milkYield}L</p>
                  </div>
                  <div className="rounded bg-canvas-sunken/80 px-1 py-1">
                    <p className="text-[10px] text-ink-faint uppercase">Est. SCC</p>
                    <p className="font-semibold text-ink tabular">{Math.round(a.scc / 1000)}k</p>
                  </div>
                  <div className="rounded bg-canvas-sunken/80 px-1 py-1">
                    <p className="text-[10px] text-ink-faint uppercase">Temp</p>
                    <p className={`font-semibold tabular ${a.temperature > 38.8 ? 'text-signal-red font-bold' : 'text-ink'}`}>
                      {a.temperature}°
                    </p>
                  </div>
                  <div className="rounded bg-canvas-sunken/80 px-1 py-1">
                    <p className="text-[10px] text-ink-faint uppercase">Risk</p>
                    <p className="font-semibold text-ink tabular">{a.riskScore}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop & Tablet Table View */}
          <div className="hidden md:block overflow-x-auto rounded-lg border border-line bg-canvas-raised shadow-card">
            <table className="w-full min-w-[880px] border-collapse text-left text-[13px]">
              <thead>
                <tr className="border-b border-line text-[11px] uppercase tracking-wide text-ink-faint">
                  <th className="px-4 py-3 font-medium">Animal ID</th>
                  <th className="px-4 py-3 font-medium">Breed</th>
                  <th className="px-4 py-3 font-medium">Age</th>
                  <th className="px-4 py-3 font-medium">Lactation</th>
                  <th className="px-4 py-3 font-medium">Milk Yield</th>
                  <th className="px-4 py-3 font-medium">SCC</th>
                  <th className="px-4 py-3 font-medium">Temp</th>
                  <th className="px-4 py-3 font-medium">Activity</th>
                  <th className="px-4 py-3 font-medium">Rumination</th>
                  <th className="px-4 py-3 font-medium">Risk</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr
                    key={a.id}
                    onClick={() => navigate(`/animals/${a.id}`)}
                    className="cursor-pointer border-b border-line/70 last:border-0 hover:bg-canvas-sunken"
                  >
                    <td className="px-4 py-3 font-semibold text-ink">{a.id}</td>
                    <td className="px-4 py-3 text-ink-soft">{a.breed}</td>
                    <td className="px-4 py-3 text-ink-soft tabular">{a.age} yrs</td>
                    <td className="px-4 py-3 text-ink-soft tabular">{a.lactationNumber}</td>
                    <td className="px-4 py-3 text-ink-soft tabular">{a.milkYield} L</td>
                    <td className="px-4 py-3 text-ink-soft tabular">{Math.round(a.scc / 1000)}k</td>
                    <td className="px-4 py-3 text-ink-soft tabular">{a.temperature}°C</td>
                    <td className={`px-4 py-3 tabular ${a.activity < -5 ? 'text-signal-red' : 'text-ink-soft'}`}>
                      {a.activity === 0 ? 'Normal' : `${a.activity > 0 ? '↑' : '↓'} ${Math.abs(a.activity)}%`}
                    </td>
                    <td className={`px-4 py-3 tabular ${a.rumination < -5 ? 'text-signal-red' : 'text-ink-soft'}`}>
                      {a.rumination === 0 ? 'Normal' : `${a.rumination > 0 ? '↑' : '↓'} ${Math.abs(a.rumination)}%`}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={a.riskLevel}>{a.riskLabel}</Badge>
                    </td>
                    <td className="px-4 py-3 text-ink-faint">
                      <ChevronRight size={15} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
