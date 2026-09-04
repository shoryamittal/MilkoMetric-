import React from 'react'
import { Link } from 'react-router-dom'
import { PawPrint, AlertTriangle, ShieldAlert, HeartPulse, Gauge, ArrowRight, Activity, Thermometer, Droplet, Clock } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { HERD_SUMMARY, getAnimalById } from '../data/animals.js'
import StatCard from '../components/common/StatCard.jsx'
import HerdRiskChart from '../components/dashboard/HerdRiskChart.jsx'
import ForecastChart from '../components/dashboard/ForecastChart.jsx'
import EarlyWarningCard from '../components/dashboard/EarlyWarningCard.jsx'
import { RiskFactorBars } from '../components/dashboard/RiskFactors.jsx'
import CompetitionHeroBar from '../components/dashboard/CompetitionHeroBar.jsx'
import EconomicImpactCard from '../components/dashboard/EconomicImpactCard.jsx'
import LiveTriageTable from '../components/dashboard/LiveTriageTable.jsx'

function greetingWord() {
  const h = new Date().getHours()
  if (h < 12) return 'Good Morning'
  if (h < 17) return 'Good Afternoon'
  return 'Good Evening'
}

export default function Dashboard() {
  const { auth, alerts, animals } = useApp()
  const demo = animals.find((a) => a.id === 'COW-024') || getAnimalById('COW-024')
  const activeWarnings = alerts
    .filter((a) => a.status === 'active' && (a.severity === 'high' || a.severity === 'critical'))
    .slice(0, 3)

  // Dynamic risk factor calculation for COW-024 reflecting live changes
  const factors = [
    { label: 'SCC In-Line Elevation', value: Math.round(((demo.scc - 150000) / 150000) * 100), display: `${demo.scc.toLocaleString()} cells/ml`, color: '#7E1F1B' },
    { label: 'Milk Yield Reduction', value: Math.abs(demo.milkYieldChangePct), display: `${demo.milkYieldChangePct}%`, color: '#C4571F' },
    { label: 'Udder Thermal Delta', value: Math.round((demo.temperature - 38.4) * 20), display: `+${(demo.temperature - 38.4).toFixed(1)}°C (${demo.temperature}°C)`, color: '#B3690E' },
    { label: 'Activity Drop (Lethargy)', value: Math.abs(demo.activity), display: `${demo.activity}%`, color: '#D79A3B' },
    { label: 'Rumination Retraction', value: Math.abs(demo.rumination), display: `${demo.rumination}%`, color: '#B7A66B' },
  ]

  const highAndCriticalCount = animals.filter((a) => a.riskLevel === 'high' || a.riskLevel === 'critical').length
  const moderateCount = animals.filter((a) => a.riskLevel === 'moderate').length
  const healthyCount = animals.filter((a) => a.riskLevel === 'none' || a.riskLevel === 'low').length
  const healthScore = Math.round(((healthyCount * 100 + moderateCount * 60 + highAndCriticalCount * 20) / animals.length))

  return (
    <div className="space-y-6">
      {/* 1. Championship Live Demo Bar */}
      <CompetitionHeroBar />

      {/* Greeting & Subtitle */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink sm:text-[26px]">
            {greetingWord()}, {auth.name || 'Dairy Manager'} 👋
          </h1>
          <p className="mt-0.5 text-sm text-ink-soft">
            Autonomous herd health diagnostics and pre-symptomatic mastitis detection console.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-ink-faint">
          <span className="h-2 w-2 rounded-full bg-pasture-600 animate-ping" />
          <span>Real-time IoT telemetry synchronized</span>
        </div>
      </div>

      {/* 2. Key Herd Metrics */}
      <div className="grid grid-cols-2 gap-3.5 sm:gap-4 lg:grid-cols-5">
        <StatCard icon={PawPrint} label="Total Animals" value={animals.length} trend="100% Monitored" trendLabel="Continuous telemetry" trendDirection="up" />
        <StatCard icon={ShieldAlert} label="High & Critical" value={highAndCriticalCount} trend={`${highAndCriticalCount} flagged`} trendLabel="Requires intervention" trendDirection="down" tone="high" />
        <StatCard icon={AlertTriangle} label="Moderate Risk" value={moderateCount} trend="Watchlist" trendLabel="Under observation" trendDirection="up" tone="moderate" />
        <StatCard icon={HeartPulse} label="Healthy Cattle" value={healthyCount} trend={`${Math.round((healthyCount / animals.length) * 100)}%`} trendLabel="Normal milk & temp" trendDirection="up" tone="ok" />
        <StatCard icon={Gauge} label="Herd Health Score" value={`${healthScore}/100`} trend="Calculated live" trendLabel="Composite index" trendDirection="up" />
      </div>

      {/* 3. Economic Impact & ROI Safeguard Card */}
      <EconomicImpactCard totalAnimals={animals.length} highRiskCount={highAndCriticalCount} />

      {/* 4. Herd Risk Distribution & AI Forecast */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="rounded-lg border border-line bg-canvas-raised p-5 shadow-card xl:col-span-5">
          <h3 className="font-display text-base font-semibold text-ink">Herd Mastitis Risk Distribution</h3>
          <p className="mt-0.5 mb-5 text-sm text-ink-soft">Dynamic categorization across {animals.length} tagged cattle</p>
          <HerdRiskChart />
        </div>
        <div className="rounded-lg border border-line bg-canvas-raised p-5 shadow-card xl:col-span-7">
          <ForecastChart />
        </div>
      </div>

      {/* 5. Rapid Clinical Triage Queue (Interactive Table) */}
      <LiveTriageTable animals={animals} alerts={alerts} />

      {/* 6. Early Warning Cards Grid */}
      <div>
        <div className="mb-3.5 flex items-center justify-between">
          <div>
            <h3 className="font-display text-base font-semibold text-ink">Active Clinical Early Warnings</h3>
            <p className="text-sm text-ink-soft">Animals the AI model flags for immediate preventive protocols</p>
          </div>
          <Link to="/alerts" className="flex items-center gap-1 text-sm font-medium text-pasture-700 hover:text-pasture-600">
            View all alerts <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {activeWarnings.map((alert) => (
            <EarlyWarningCard key={alert.id} alert={alert} animal={animals.find((a) => a.id === alert.animalId)} />
          ))}
        </div>
      </div>

      {/* 7. Explainable AI Feature Contribution for Target Cow */}
      <div className="rounded-lg border border-line bg-canvas-raised p-5 shadow-card">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-display text-base font-semibold text-ink">
                Multi-Modal Explainable AI (XAI) Diagnostics
              </p>
              <span className="rounded bg-signal-amberSoft px-2 py-0.5 text-[11px] font-bold text-signal-amber">
                Pinned Demo Case: {demo.id}
              </span>
            </div>
            <p className="text-xs text-ink-soft">
              Weight attribution model indicating biometric indicators driving current risk classification
            </p>
          </div>
          <Link
            to={`/animals/${demo.id}`}
            className="flex items-center gap-1 text-xs font-semibold text-pasture-700 hover:text-pasture-600"
          >
            Open Full Biometric Dossier <ArrowRight size={12} />
          </Link>
        </div>
        <RiskFactorBars
          factors={factors}
          title="Biometric Feature Contribution Breakdown"
          subtitle={`Relative weights contributing to ${demo.id}'s ${demo.riskScore}% risk score`}
        />
      </div>
    </div>
  )
}