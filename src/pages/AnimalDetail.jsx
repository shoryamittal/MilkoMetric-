import React, { useMemo, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Droplets, Activity as ActivityIcon, Thermometer, HeartPulse, Zap, Milk, ShieldQuestion } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { bandForScore, RISK_BANDS } from '../utils/riskCalculator.js'
import RiskGauge from '../components/common/RiskGauge.jsx'
import Badge from '../components/common/Badge.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import MetricLineChart from '../components/charts/MetricLineChart.jsx'
import RecommendationPanel from '../components/animals/RecommendationPanel.jsx'

const TABS = [
  { key: 'milkYield', label: 'Milk Yield', unit: ' L', color: '#2B5FA8' },
  { key: 'scc', label: 'SCC', unit: '', color: '#7E1F1B' },
  { key: 'temperature', label: 'Temperature', unit: '°C', color: '#B3690E' },
  { key: 'activity', label: 'Activity', unit: '%', color: '#3E7C52' },
  { key: 'rumination', label: 'Rumination', unit: '%', color: '#5C9C68' },
]

function buildRiskTimeline(animal) {
  const score = animal.riskScore
  const elevated = animal.riskLevel === 'moderate' || animal.riskLevel === 'high' || animal.riskLevel === 'critical'
  const day30 = elevated ? Math.max(4, Math.round(score - 46)) : Math.max(2, Math.round(score - 6))
  const day14 = elevated ? Math.max(6, Math.round(score - 30)) : Math.max(3, Math.round(score - 4))
  const day7 = elevated ? Math.max(9, Math.round(score - 15)) : Math.max(4, Math.round(score - 2))
  const predicted = elevated ? Math.min(99, Math.round(score + (animal.riskLevel === 'critical' ? 5 : 9))) : score

  return [
    { label: '30 Days Ago', score: day30 },
    { label: '14 Days Ago', score: day14 },
    { label: '7 Days Ago', score: day7 },
    { label: 'Today', score },
    { label: 'Predicted', score: predicted, predicted: true },
  ]
}

function reasonsFor(animal) {
  const reasons = []
  if (animal.scc > 220000) reasons.push('SCC has increased significantly.')
  if (animal.milkYieldChangePct < -5) reasons.push('Milk yield has dropped below the expected baseline.')
  if (animal.activity < -5) reasons.push('Activity has decreased relative to the animal\u2019s normal pattern.')
  if (animal.rumination < -5) reasons.push('Rumination time has decreased.')
  if (animal.temperature > 38.7) reasons.push('Body temperature is elevated.')
  if (animal.previousMastitis) reasons.push('Previous mastitis history increases baseline risk.')
  if (!reasons.length) reasons.push('All monitored parameters are within the normal range for this animal.')
  return reasons
}

export default function AnimalDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getAnimal } = useApp()
  const [activeTab, setActiveTab] = useState('scc')
  const animal = getAnimal(id)

  const timeline = useMemo(() => {
    if (!animal) return []
    return buildRiskTimeline(animal)
  }, [animal])

  if (!animal) {
    return (
      <EmptyState
        icon={ShieldQuestion}
        title="Animal not found"
        description={`No record matches "${id}" in this herd.`}
        action={
          <button onClick={() => navigate('/animals')} className="rounded-sm bg-pasture-700 px-4 py-2 text-sm font-semibold text-white hover:bg-pasture-600">
            Back to Animals
          </button>
        }
      />
    )
  }

  const activeTabDef = TABS.find((t) => t.key === activeTab)

  return (
    <div className="space-y-6">
      <Link to="/animals" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink">
        <ArrowLeft size={15} /> Back to Animals
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">{animal.id}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-soft">
            <span>{animal.breed} Cow</span> · <span>Female</span> · <span>{animal.age} Years</span> · <span>Lactation {animal.lactationNumber}</span>
          </p>
        </div>
        <Badge tone={animal.riskLevel} className="text-[13px]">{animal.riskLabel}</Badge>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="flex flex-col items-center justify-center rounded-lg border border-line bg-canvas-raised p-6 shadow-card xl:col-span-4">
          <RiskGauge score={animal.riskScore} level={animal.riskLevel} levelLabel={animal.riskLabel} />
          <div className="mt-4 grid w-full grid-cols-2 gap-3 border-t border-line pt-4 text-center">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-ink-faint">Predicted onset</p>
              <p className="mt-0.5 text-sm font-semibold text-ink">{animal.predictedWindow || '48–72 hours'}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-ink-faint">Model confidence</p>
              <p className="mt-0.5 text-sm font-semibold text-ink tabular">{animal.modelConfidence || 88}%</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3.5 xl:col-span-8 sm:grid-cols-3">
          {[
            { icon: Milk, label: 'Milk Yield', value: `${animal.milkYield} L/day`, delta: animal.milkYieldChangePct, unit: '%' },
            { icon: Droplets, label: 'AI-Estimated SCC', value: `${animal.scc.toLocaleString('en-IN')} cells/mL`, delta: animal.scc > 200000 ? Math.round(((animal.scc - 150000) / 150000) * 100) : 0, unit: '%' },
            { icon: Thermometer, label: 'Udder Temperature', value: `${animal.temperature}°C`, delta: +(animal.temperature - 38.5).toFixed(1), unit: '°C', signed: true },
            { icon: Zap, label: 'Milk EC (In-Line)', value: `+${animal.conductivity}% (${(4.8 + animal.conductivity * 0.15).toFixed(1)} mS/cm)`, delta: animal.conductivity, unit: '%' },
            { icon: ActivityIcon, label: 'Activity Level', value: `${animal.activity > 0 ? '+' : ''}${animal.activity}%`, delta: animal.activity, unit: '%' },
            { icon: HeartPulse, label: 'Rumination Rate', value: `${animal.rumination > 0 ? '+' : ''}${animal.rumination}%`, delta: animal.rumination, unit: '%' },
          ].map((m) => (
            <div key={m.label} className="rounded-lg border border-line bg-canvas-raised p-4 shadow-card">
              <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-canvas-sunken">
                <m.icon size={15} className="text-ink-soft" />
              </div>
              <p className="mt-3 font-display text-lg font-semibold text-ink tabular">{m.value}</p>
              <p className="text-xs text-ink-soft">{m.label}</p>
              {m.delta !== 0 && (
                <p className={`mt-1 text-xs font-medium tabular ${m.delta > 0 && m.label !== 'Milk Yield' ? 'text-signal-red' : m.delta < 0 ? 'text-signal-red' : 'text-pasture-600'}`}>
                  {m.delta > 0 ? '↑' : '↓'} {Math.abs(m.delta)}
                  {m.unit}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-line bg-canvas-raised p-5 shadow-card">
        <h3 className="font-display text-base font-semibold text-ink">30-Day History</h3>
        <div className="mt-3 flex flex-wrap gap-1.5 border-b border-line pb-3">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-sm px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === tab.key ? 'bg-pasture-700 text-white' : 'bg-canvas-sunken text-ink-soft hover:bg-line'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="pt-4">
          <MetricLineChart data={animal.history[activeTab]} color={activeTabDef.color} unit={activeTabDef.unit} highlightLastDays={10} />
        </div>
      </div>

      <div className="rounded-lg border border-line bg-canvas-raised p-5 shadow-card">
        <h3 className="mb-1 font-display text-base font-semibold text-ink">AI Risk Timeline</h3>
        <p className="mb-6 text-sm text-ink-soft">How the model's confidence rose before any clinical signs appeared</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-5">
          {timeline.map((p, i) => {
            const isToday = p.label === 'Today'
            const b = isToday ? RISK_BANDS.find((band) => band.level === animal.riskLevel) || bandForScore(p.score) : bandForScore(p.score)
            return (
              <div key={p.label} className="relative flex flex-col items-center text-center">
                {i < timeline.length - 1 && (
                  <span className="absolute left-1/2 top-4 hidden h-px w-full bg-line sm:block" style={{ transform: 'translateX(50%)' }} />
                )}
                <span
                  className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 bg-canvas-raised text-[10px] font-bold"
                  style={{ borderColor: b.color, color: b.color }}
                >
                  {p.predicted ? '?' : `${p.score}`}
                </span>
                <p className="mt-2 text-xs font-medium text-ink">{p.label}</p>
                <p className="text-[11px] text-ink-faint">{p.predicted ? animal.riskLabel : `Risk ${p.score}%`}</p>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="rounded-lg border border-line bg-canvas-raised p-5 shadow-card xl:col-span-6">
          <h3 className="font-display text-base font-semibold text-ink">Why is {animal.id} {animal.riskLabel.toLowerCase()}?</h3>
          <ol className="mt-4 space-y-2.5">
            {reasonsFor(animal).map((r, i) => (
              <li key={i} className="flex gap-2.5 text-[13.5px] text-ink-soft">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-canvas-sunken text-[11px] font-semibold text-ink">
                  {i + 1}
                </span>
                {r}
              </li>
            ))}
          </ol>
          <div className="mt-4 rounded-md border border-signal-blue/20 bg-signal-blueSoft p-3.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-signal-blue">AI Interpretation</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink">
              The combination of {animal.scc > 220000 ? 'rising SCC, ' : ''}
              {animal.milkYieldChangePct < -5 ? 'declining milk production, ' : ''}
              {animal.temperature > 38.7 ? 'elevated temperature ' : ''}
              {animal.activity < -5 ? 'and reduced activity ' : ''}
              indicates an elevated probability of developing mastitis
              {animal.predictedWindow ? ` within the next ${animal.predictedWindow}` : ''}.
            </p>
          </div>
          <p className="mt-3 text-[11px] text-ink-faint">
            This is a predictive assessment from a prototype model, not a confirmed veterinary diagnosis.
          </p>
        </div>

        <div className="xl:col-span-6">
          <h3 className="mb-4 font-display text-base font-semibold text-ink">Recommended Actions</h3>
          <RecommendationPanel animal={animal} />
        </div>
      </div>
    </div>
  )
}
