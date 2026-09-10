import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Cpu, Users, TrendingUp, Search } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { individualForecast, HERD_RISK_PROJECTION } from '../data/forecastData.js'
import { HERD_SUMMARY } from '../data/animals.js'
import ForecastChart from '../components/dashboard/ForecastChart.jsx'
import { RiskFactorBars } from '../components/dashboard/RiskFactors.jsx'
import Badge from '../components/common/Badge.jsx'

function ModelStatusCard() {
  return (
    <div className="rounded-lg border border-line bg-canvas-raised p-5 shadow-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu size={16} className="text-pasture-600" />
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">AI Model</p>
        </div>
        <Badge tone="ok" dot>Active</Badge>
      </div>
      <p className="mt-2 font-display text-base font-semibold text-ink">Agrinex Predictive Engine</p>
      <div className="mt-4 grid grid-cols-2 gap-y-3 text-xs sm:grid-cols-4">
        <div>
          <p className="text-ink-faint">Prediction window</p>
          <p className="mt-0.5 font-semibold text-ink">48–72 hours (Pre-Clinical)</p>
        </div>
        <div>
          <p className="text-ink-faint">Model confidence</p>
          <p className="mt-0.5 font-semibold text-ink tabular">91%</p>
        </div>
        <div>
          <p className="text-ink-faint">Data points analyzed</p>
          <p className="mt-0.5 font-semibold text-ink tabular">24,681</p>
        </div>
        <div>
          <p className="text-ink-faint">Animals monitored</p>
          <p className="mt-0.5 font-semibold text-ink tabular">{HERD_SUMMARY.total}</p>
        </div>
      </div>
      <p className="mt-4 text-[11px] text-ink-faint">
        Prototype AI Simulation (SIH26109) — last updated today, 08:30 AM. Local edge-first inference synchronized.
      </p>
    </div>
  )
}

export default function Forecast() {
  const { animals } = useApp()
  const navigate = useNavigate()
  const [tab, setTab] = useState('herd')
  const [selectedId, setSelectedId] = useState('COW-024')
  const selected = animals.find((a) => a.id === selectedId)
  const indiv = selected ? individualForecast(selected) : null

  const factors = selected
    ? [
        { label: 'Milk Electrical Conductivity (EC)', value: Math.round(selected.conductivity * 6.5), display: `+${selected.conductivity}% (${(4.8 + selected.conductivity * 0.15).toFixed(1)} mS/cm)`, color: '#7E1F1B' },
        { label: 'AI-Estimated SCC', value: Math.round(((selected.scc - 100000) / 500000) * 100), display: `${Math.round(selected.scc / 1000)}k cells/mL`, color: '#A82B27' },
        { label: 'Daily milk yield change', value: Math.abs(selected.milkYieldChangePct), display: `${selected.milkYieldChangePct}%`, color: '#C4571F' },
        { label: 'Body temperature (Udder IR)', value: Math.max(1, (selected.temperature - 38.2) * 20), display: `${selected.temperature}°C`, color: '#B3690E' },
        { label: 'Activity change', value: Math.abs(selected.activity), display: `${selected.activity}%`, color: '#D79A3B' },
      ]
    : []

  return (
    <div className="space-y-6">
      <ModelStatusCard />

      <div className="flex w-full sm:w-fit gap-1 rounded-lg border border-line bg-canvas-raised p-1">
        {[
          { key: 'herd', label: 'Herd Forecast', icon: Users },
          { key: 'individual', label: 'Individual Forecast', icon: Search },
        ].map((tItem) => (
          <button
            key={tItem.key}
            onClick={() => setTab(tItem.key)}
            className={`flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-md px-3.5 py-2 text-xs sm:text-[13px] font-medium transition-colors ${
              tab === tItem.key ? 'bg-pasture-700 text-white font-semibold shadow-sm' : 'text-ink-soft hover:bg-canvas-sunken'
            }`}
          >
            <tItem.icon size={14} /> {tItem.label}
          </button>
        ))}
      </div>

      {tab === 'herd' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
            <div className="rounded-lg border border-line bg-canvas-raised p-5 shadow-card">
              <p className="text-xs text-ink-faint">Current High Risk</p>
              <p className="mt-1 font-display text-2xl font-semibold text-signal-red tabular">{HERD_RISK_PROJECTION.current} animals</p>
            </div>
            <div className="rounded-lg border border-line bg-canvas-raised p-5 shadow-card">
              <p className="text-xs text-ink-faint">Predicted in 7 Days</p>
              <p className="mt-1 font-display text-2xl font-semibold text-signal-amber tabular">{HERD_RISK_PROJECTION.in7Days} animals</p>
            </div>
            <div className="rounded-lg border border-line bg-canvas-raised p-5 shadow-card">
              <p className="text-xs text-ink-faint">Predicted in 14 Days</p>
              <p className="mt-1 font-display text-2xl font-semibold text-ink tabular">{HERD_RISK_PROJECTION.in14Days} animals</p>
            </div>
          </div>
          <div className="rounded-lg border border-line bg-canvas-raised p-5 shadow-card">
            <ForecastChart />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          <div className="rounded-lg border border-line bg-canvas-raised p-5 shadow-card xl:col-span-4">
            <label className="mb-1.5 block text-[13px] font-medium text-ink">Select animal</label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full rounded-sm border border-line bg-canvas px-3 py-2 text-sm text-ink focus:border-pasture-500"
            >
              {animals.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.id} — {a.riskLabel}
                </option>
              ))}
            </select>
            {selected && (
              <>
                <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-md bg-canvas-sunken p-2.5">
                    <p className="text-[10px] uppercase tracking-wide text-ink-faint">Current</p>
                    <p className="mt-0.5 font-display text-lg font-semibold text-ink tabular">{indiv.current}%</p>
                  </div>
                  <div className="rounded-md bg-canvas-sunken p-2.5">
                    <p className="text-[10px] uppercase tracking-wide text-ink-faint">7-Day</p>
                    <p className="mt-0.5 font-display text-lg font-semibold text-signal-amber tabular">{indiv.day7}%</p>
                  </div>
                  <div className="rounded-md bg-canvas-sunken p-2.5">
                    <p className="text-[10px] uppercase tracking-wide text-ink-faint">14-Day</p>
                    <p className="mt-0.5 font-display text-lg font-semibold text-signal-red tabular">{indiv.day14}%</p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-ink-soft">
                  Model confidence <span className="font-semibold text-ink tabular">{indiv.confidence}%</span>
                </p>
                <button
                  onClick={() => navigate(`/animals/${selected.id}`)}
                  className="mt-4 w-full rounded-sm bg-pasture-700 py-2 text-xs font-semibold text-white hover:bg-pasture-600"
                >
                  Open Full Profile
                </button>
              </>
            )}
          </div>
          <div className="rounded-lg border border-line bg-canvas-raised p-5 shadow-card xl:col-span-8">
            {selected && <RiskFactorBars factors={factors} title="Contributing Factors" subtitle={`What is driving ${selected.id}'s risk score`} />}
          </div>
        </div>
      )}
    </div>
  )
}
