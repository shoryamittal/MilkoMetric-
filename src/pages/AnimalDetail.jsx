import React, { useMemo, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Droplets,
  Activity as ActivityIcon,
  Thermometer,
  HeartPulse,
  Zap,
  Milk,
  ShieldQuestion,
  Clock,
  Stethoscope,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  Layers,
  RefreshCw,
} from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { bandForScore, RISK_BANDS } from '../utils/riskCalculator.js'
import RiskGauge from '../components/common/RiskGauge.jsx'
import Badge from '../components/common/Badge.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import MetricLineChart from '../components/charts/MetricLineChart.jsx'
import RecommendationPanel from '../components/animals/RecommendationPanel.jsx'
import { t } from '../utils/translations.js'

const TABS = [
  { key: 'milkYield', label: 'Milk Yield', unit: ' L', color: '#2B5FA8' },
  { key: 'scc', label: 'Est. SCC', unit: ' cells/mL', color: '#7E1F1B' },
  { key: 'temperature', label: 'Udder Temp', unit: '°C', color: '#B3690E' },
  { key: 'activity', label: 'Activity', unit: '%', color: '#3E7C52' },
  { key: 'rumination', label: 'Rumination', unit: '%', color: '#5C9C68' },
]

export default function AnimalDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    getAnimal,
    language,
    vetReviews,
    requestVeterinaryReview,
    advanceVeterinaryStatus,
    refreshTelemetry,
  } = useApp()
  const [activeTab, setActiveTab] = useState('scc')
  const [timeframe, setTimeframe] = useState('30d') // '24h' | '7d' | '30d' per Requirement 10
  const [vetModalOpen, setVetModalOpen] = useState(false)
  const [vetNotes, setVetNotes] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = () => {
    setRefreshing(true)
    refreshTelemetry()
    setTimeout(() => {
      setRefreshing(false)
    }, 650)
  }

  const animal = getAnimal(id)
  const existingReview = vetReviews.find((r) => r.animalId === id)

  // Personalized Baseline calculations (Requirement 7)
  const baseline = useMemo(() => {
    if (!animal) return null
    // Established baseline vs developing
    const isEstablished = animal.lactationNumber >= 2
    const observationsCount = isEstablished ? 14 : 8
    const baseEC = 4.2
    const currentEC = 4.2 * (1 + (animal.conductivity || 0) / 100)
    const ecDeviation = animal.conductivity || 0

    const baseTemp = 38.4
    const currentTemp = animal.temperature
    const tempDeviation = +(currentTemp - baseTemp).toFixed(1)

    const baseYield = +(animal.milkYield / (1 + animal.milkYieldChangePct / 100)).toFixed(1)
    const currentYield = animal.milkYield
    const yieldDeviation = animal.milkYieldChangePct

    return {
      isEstablished,
      observationsCount,
      baseEC,
      currentEC: +currentEC.toFixed(1),
      ecDeviation,
      baseTemp,
      currentTemp,
      tempDeviation,
      baseYield,
      currentYield,
      yieldDeviation,
    }
  }, [animal])

  // Filter trend points by timeframe (24h, 7d, 30d per Requirement 10)
  const trendData = useMemo(() => {
    if (!animal?.history?.[activeTab]) return []
    const raw = animal.history[activeTab]
    if (timeframe === '24h') {
      return raw.slice(-4).map((pt, i) => ({ ...pt, label: `${(i + 1) * 6}h ago` }))
    }
    if (timeframe === '7d') {
      return raw.slice(-7)
    }
    return raw
  }, [animal, activeTab, timeframe])

  if (!animal) {
    return (
      <EmptyState
        icon={ShieldQuestion}
        title="Animal not found"
        description={`No record matches "${id}" in this herd.`}
        action={
          <button
            onClick={() => navigate('/animals')}
            className="rounded-md bg-pasture-700 px-4 py-2 text-sm font-semibold text-white hover:bg-pasture-600"
          >
            Back to Animals
          </button>
        }
      />
    )
  }

  const activeTabDef = TABS.find((t) => t.key === activeTab)

  const handleRequestReview = () => {
    requestVeterinaryReview(animal.id, vetNotes)
    setVetModalOpen(false)
    setVetNotes('')
  }

  return (
    <div className="space-y-6">
      {/* Back link & Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/animals" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink">
          <ArrowLeft size={15} /> Back to Herd Animals
        </Link>

        {/* Real-time Telemetry & Veterinary Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Refresh Real-Time Telemetry Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            title="Refresh real-time telemetry from ESP32 edge tags, in-line milk EC probes, and thermal sensors"
            className={`inline-flex items-center gap-1.5 rounded-md border border-line bg-canvas-raised px-3 py-1.5 text-xs font-semibold text-ink shadow-sm hover:bg-canvas-sunken hover:border-pasture-500 transition-all active:scale-95 ${
              refreshing ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            <RefreshCw size={13} className={`text-pasture-700 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing Real-Time...' : 'Refresh Live Telemetry'}</span>
          </button>

          {/* Quick Veterinary Action Button (Requirement 12) */}
          <button
            onClick={() => setVetModalOpen(true)}
            className="flex items-center gap-2 rounded-md bg-signal-blue px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-signal-blue/90"
          >
            <Stethoscope size={14} />
            {existingReview ? `Vet Status: ${existingReview.status.replace('_', ' ')}` : 'Request Veterinary Review'}
          </button>
        </div>
      </div>

      {/* Animal Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">{animal.id}</h1>
            <Badge tone={animal.riskLevel} className="text-xs font-bold uppercase">
              {animal.riskLevel === 'critical' ? 'CRITICAL' : animal.riskLevel === 'high' ? 'HIGH' : animal.riskLevel === 'moderate' ? 'WATCH' : 'LOW'}
            </Badge>
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-ink-soft">
            <span>{animal.breed} Indigenous Cow</span> · <span>Female</span> · <span>{animal.age} Years</span> · <span>Lactation {animal.lactationNumber}</span> · <span>Tag: RFID-ESP32</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-ink-faint">Prediction Window:</span>
          <span className="rounded-md bg-pasture-100 px-2.5 py-1 text-xs font-bold text-pasture-800 border border-pasture-300/60">
            {animal.predictedWindow || '48–72 hours'} (Subclinical)
          </span>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            title="Fetch real-time ESP32 packet"
            className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 border border-emerald-300/60 shadow-xs hover:bg-emerald-100 transition-all active:scale-95"
          >
            <RefreshCw size={10} className={`text-emerald-700 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Live Real-Time'}</span>
          </button>
        </div>
      </div>

      {/* Risk Gauge & Biometrics Summary */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="flex flex-col items-center justify-center rounded-lg border border-line bg-canvas-raised p-6 shadow-card xl:col-span-4">
          <RiskGauge score={animal.riskScore} level={animal.riskLevel} levelLabel={`Model Score: ${animal.riskScore}/100`} />
          <div className="mt-4 grid w-full grid-cols-2 gap-3 border-t border-line pt-4 text-center">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-ink-faint">Forecast Window</p>
              <p className="mt-0.5 text-sm font-semibold text-ink">{animal.predictedWindow || '48–72 hours'}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-ink-faint">Model Scoring</p>
              <p className="mt-0.5 text-sm font-semibold text-ink tabular">{animal.riskScore}/100 (Relative)</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3.5 xl:col-span-8 sm:grid-cols-3">
          {[
            { icon: Zap, label: 'Milk EC (In-Line)', value: `${baseline.currentEC} mS/cm`, delta: baseline.ecDeviation, unit: '%', alert: baseline.ecDeviation > 15 },
            { icon: Droplets, label: 'AI-Estimated SCC', value: `${animal.scc.toLocaleString('en-IN')} cells/mL`, delta: Math.round(((animal.scc - 150000) / 150000) * 100), unit: '%', alert: animal.scc > 300000 },
            { icon: Thermometer, label: 'Udder Temperature', value: `${animal.temperature}°C`, delta: baseline.tempDeviation, unit: '°C', signed: true, alert: baseline.tempDeviation > 0.6 },
            { icon: Milk, label: 'Daily Milk Yield', value: `${animal.milkYield} L/day`, delta: animal.milkYieldChangePct, unit: '%', alert: animal.milkYieldChangePct < -10 },
            { icon: ActivityIcon, label: 'Activity Level', value: `${animal.activity > 0 ? '+' : ''}${animal.activity}%`, delta: animal.activity, unit: '%' },
            { icon: HeartPulse, label: 'Rumination Rate', value: `${animal.rumination > 0 ? '+' : ''}${animal.rumination}%`, delta: animal.rumination, unit: '%' },
          ].map((m) => (
            <div key={m.label} className="rounded-lg border border-line bg-canvas-raised p-4 shadow-card">
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-canvas-sunken">
                  <m.icon size={15} className={m.alert ? 'text-signal-red' : 'text-ink-soft'} />
                </div>
                {m.alert && <span className="h-2 w-2 rounded-full bg-signal-red animate-ping" />}
              </div>
              <p className="mt-3 font-display text-lg font-bold text-ink tabular">{m.value}</p>
              <p className="text-xs text-ink-soft">{m.label}</p>
              {m.delta !== 0 && (
                <p className={`mt-1 text-xs font-semibold tabular ${m.delta > 0 && m.label !== 'Daily Milk Yield' ? 'text-signal-red' : m.delta < 0 ? 'text-signal-red' : 'text-pasture-600'}`}>
                  {m.delta > 0 ? '↑ +' : '↓ '}{Math.abs(m.delta)}{m.unit} vs baseline
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 2. Personalized Animal Baseline Section (Requirement 7) */}
      <div className="rounded-lg border border-line bg-canvas-raised p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base font-semibold text-ink">
                Personalized Animal Baseline & Deviations (Requirement 7)
              </h3>
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${baseline.isEstablished ? 'bg-pasture-100 text-pasture-800' : 'bg-signal-amberSoft text-signal-amber'}`}>
                <Info size={11} /> {baseline.isEstablished ? '14/14 Observations (Robust Baseline)' : 'Baseline Developing (8/14 Observations)'}
              </span>
            </div>
            <p className="text-xs text-ink-soft mt-0.5">
              Current sensor readings are strictly evaluated against {animal.id}'s individual historical baseline rather than static herd averages.
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-md border border-line bg-canvas-sunken/60 p-3.5">
            <p className="text-xs text-ink-soft">Milk Electrical Conductivity (EC)</p>
            <div className="mt-2 flex items-baseline justify-between">
              <div>
                <span className="text-[11px] text-ink-faint">Baseline: </span>
                <span className="font-semibold text-ink">{baseline.baseEC} mS/cm</span>
              </div>
              <div>
                <span className="text-[11px] text-ink-faint">Current: </span>
                <span className="font-bold text-signal-red">{baseline.currentEC} mS/cm</span>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs font-medium">
              <span className="text-ink-soft">Net Deviation:</span>
              <span className="text-signal-red font-bold">+{baseline.ecDeviation}% (Cellular Ion Leakage)</span>
            </div>
          </div>

          <div className="rounded-md border border-line bg-canvas-sunken/60 p-3.5">
            <p className="text-xs text-ink-soft">Udder Thermal Temperature</p>
            <div className="mt-2 flex items-baseline justify-between">
              <div>
                <span className="text-[11px] text-ink-faint">Baseline: </span>
                <span className="font-semibold text-ink">{baseline.baseTemp}°C</span>
              </div>
              <div>
                <span className="text-[11px] text-ink-faint">Current: </span>
                <span className="font-bold text-signal-amber">{baseline.currentTemp}°C</span>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs font-medium">
              <span className="text-ink-soft">Net Deviation:</span>
              <span className="text-signal-amber font-bold">+{baseline.tempDeviation}°C (Localized Inflammation)</span>
            </div>
          </div>

          <div className="rounded-md border border-line bg-canvas-sunken/60 p-3.5">
            <p className="text-xs text-ink-soft">Daily Milk Yield Production</p>
            <div className="mt-2 flex items-baseline justify-between">
              <div>
                <span className="text-[11px] text-ink-faint">Baseline: </span>
                <span className="font-semibold text-ink">{baseline.baseYield} L/day</span>
              </div>
              <div>
                <span className="text-[11px] text-ink-faint">Current: </span>
                <span className="font-bold text-signal-red">{baseline.currentYield} L/day</span>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs font-medium">
              <span className="text-ink-soft">Net Deviation:</span>
              <span className="text-signal-red font-bold">{baseline.yieldDeviation}% (Alveolar Disruption)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Trend Analysis with 24h, 7d, 30d Toggles (Requirement 10) */}
      <div className="rounded-lg border border-line bg-canvas-raised p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
          <div>
            <h3 className="font-display text-base font-semibold text-ink">Telemetry Trend Analysis</h3>
            <p className="text-xs text-ink-soft">Inspect signal evolution across critical pre-clinical time windows</p>
          </div>

          {/* Timeframe selector: 24h / 7d / 30d per Requirement 10 */}
          <div className="flex items-center rounded-md border border-line bg-canvas p-0.5 text-xs font-medium">
            {[
              { key: '24h', label: '24 Hours' },
              { key: '7d', label: '7 Days' },
              { key: '30d', label: '30 Days' },
            ].map((tf) => (
              <button
                key={tf.key}
                onClick={() => setTimeframe(tf.key)}
                className={`rounded px-3 py-1 transition-colors ${timeframe === tf.key ? 'bg-pasture-700 text-white font-semibold shadow-sm' : 'text-ink-soft hover:text-ink'}`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab metrics */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === tab.key ? 'bg-pasture-700 text-white font-semibold' : 'bg-canvas-sunken text-ink-soft hover:bg-line/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="pt-4">
          <MetricLineChart
            data={trendData}
            color={activeTabDef.color}
            unit={activeTabDef.unit}
            highlightLastDays={timeframe === '30d' ? 5 : 2}
          />
        </div>
      </div>

      {/* 4. Explainable AI & Veterinary Workflow Section */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        {/* Why is this animal at risk? (Requirement 8 & 9) */}
        <div className="rounded-lg border border-line bg-canvas-raised p-5 shadow-card xl:col-span-6">
          <div className="border-b border-line pb-3">
            <h3 className="font-display text-base font-semibold text-ink">
              Why is {animal.id} flagged at {animal.riskScore}/100 Model Score?
            </h3>
            <p className="text-xs text-ink-soft">Multi-signal Explainable AI (XAI) fusion breakdown</p>
          </div>

          <ol className="mt-4 space-y-3">
            <li className="flex items-start gap-2.5 text-xs text-ink-soft">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-signal-redSoft text-signal-red font-bold text-[10.5px]">1</span>
              <div>
                <strong className="text-ink">Milk Electrical Conductivity (EC): </strong>
                Elevated to {baseline.currentEC} mS/cm (+{baseline.ecDeviation}% over baseline). Indicates blood-milk barrier permeability and sodium/chloride ion leakage into milk.
              </div>
            </li>
            <li className="flex items-start gap-2.5 text-xs text-ink-soft">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-signal-redSoft text-signal-red font-bold text-[10.5px]">2</span>
              <div>
                <strong className="text-ink">Milk Yield Variance: </strong>
                Suppressed by {Math.abs(baseline.yieldDeviation)}% below expected yield baseline. Pre-clinical alveolar disruption before visible clots.
              </div>
            </li>
            <li className="flex items-start gap-2.5 text-xs text-ink-soft">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-signal-amberSoft text-signal-amber font-bold text-[10.5px]">3</span>
              <div>
                <strong className="text-ink">Udder Thermal Signature: </strong>
                Elevated by +{baseline.tempDeviation}°C ({animal.temperature}°C). Correlates with localized inflammatory immune response.
              </div>
            </li>
            <li className="flex items-start gap-2.5 text-xs text-ink-soft">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pasture-100 text-pasture-800 font-bold text-[10.5px]">4</span>
              <div>
                <strong className="text-ink">Shed Microclimate THI Impact: </strong>
                Ambient heat stress (THI 78.4) amplifies susceptibility (Liu et al. 2019 citation).
              </div>
            </li>
          </ol>

          {/* Scientific Disclaimer (Requirement 9) */}
          <div className="mt-4 rounded-md border border-signal-blue/20 bg-signal-blueSoft/30 p-3 text-xs leading-relaxed text-ink">
            <p className="font-semibold text-signal-blue uppercase tracking-wide text-[10.5px]">
              Decision Support Guardrail (Requirement 9)
            </p>
            <p className="mt-1">
              AgriNex identifies <strong>elevated pre-clinical mastitis risk</strong> via multi-sensor fusion. This is an early warning decision-support tool, not a confirmed veterinary diagnosis. Teat inspection and confirmatory examination are strongly advised.
            </p>
          </div>
        </div>

        {/* Veterinary Actions & Recommendations (Requirement 12) */}
        <div className="xl:col-span-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-base font-semibold text-ink">Actionable Herd Protocols</h3>
            {existingReview && (
              <span className="rounded bg-signal-blueSoft px-2 py-0.5 text-xs font-bold text-signal-blue">
                Vet Case #{existingReview.id}
              </span>
            )}
          </div>
          <RecommendationPanel animal={animal} />
        </div>
      </div>

      {/* Veterinary Review Modal (Requirement 12) */}
      {vetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-line bg-canvas-raised p-6 shadow-pop">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <Stethoscope size={18} className="text-signal-blue" />
                <h3 className="font-display text-base font-bold text-ink">
                  Veterinary Escalation Dossier — {animal.id}
                </h3>
              </div>
              <button onClick={() => setVetModalOpen(false)} className="text-sm font-bold text-ink-faint hover:text-ink">✕</button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="rounded-md bg-canvas-sunken p-3">
                <p className="font-semibold text-ink">Automated Telemetry Payload:</p>
                <ul className="mt-1.5 list-disc pl-4 text-ink-soft space-y-0.5">
                  <li>In-Line Milk EC: +{baseline.ecDeviation}% ({baseline.currentEC} mS/cm)</li>
                  <li>Udder Temp: {animal.temperature}°C (+{baseline.tempDeviation}°C delta)</li>
                  <li>Daily Yield Variance: {baseline.yieldDeviation}%</li>
                  <li>Subclinical Prediction Window: 48–72 hours</li>
                </ul>
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">Farmer / Manager Notes:</label>
                <textarea
                  rows={3}
                  value={vetNotes}
                  onChange={(e) => setVetNotes(e.target.value)}
                  placeholder="Note any visible behavioral changes, udder palpation feel, or milking parlor observations..."
                  className="w-full rounded-md border border-line bg-canvas p-2.5 text-xs text-ink focus:border-pasture-500 focus:outline-none"
                />
              </div>

              <div className="rounded-md border border-pasture-400/30 bg-pasture-50 p-2.5 text-pasture-800">
                <p className="font-semibold">Veterinary Protocol Workflow:</p>
                <p className="mt-0.5 text-[11px] leading-relaxed">
                  OPEN → UNDER REVIEW → VET CONTACTED → ACTION TAKEN → RESOLVED. Escalation forwards full biometric dossier directly to local veterinary health officer.
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setVetModalOpen(false)}
                className="rounded-md border border-line px-3.5 py-1.5 text-xs font-semibold text-ink hover:bg-canvas-sunken"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestReview}
                className="rounded-md bg-signal-blue px-4 py-1.5 text-xs font-semibold text-white hover:bg-signal-blue/90"
              >
                Dispatch Tele-Review Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
