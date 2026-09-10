import React from 'react'
import { Link } from 'react-router-dom'
import {
  PawPrint,
  AlertTriangle,
  ShieldAlert,
  HeartPulse,
  Gauge,
  ArrowRight,
  Activity,
  Thermometer,
  Droplet,
  Clock,
  Wifi,
  WifiOff,
  RefreshCw,
  Siren,
  Eye,
} from 'lucide-react'
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
import ShedHeatStressCard from '../components/dashboard/ShedHeatStressCard.jsx'
import { t } from '../utils/translations.js'

export default function Dashboard() {
  const {
    auth,
    alerts,
    animals,
    language,
    networkStatus,
    lastSyncTime,
    pendingRecords,
    toggleNetworkStatus,
    refreshTelemetry,
    liveEnvironment,
  } = useApp()
  const demo = animals.find((a) => a.id === 'COW-024') || getAnimalById('COW-024')
  const activeWarnings = alerts
    .filter((a) => a.status === 'active' && (a.severity === 'high' || a.severity === 'critical'))
    .slice(0, 3)

  // Dynamic greeting using actual local time and user name (Requirement 4)
  const currentHour = new Date().getHours()
  const greetingPrefix =
    currentHour < 12
      ? t(language, 'goodMorning')
      : currentHour < 17
      ? t(language, 'goodAfternoon')
      : t(language, 'goodEvening')
  const greeting = `${greetingPrefix}, ${auth.name || 'Guest'} 👋`

  // Dynamic risk factor calculation for COW-024 reflecting live changes & hardware EC probe
  const factors = [
    {
      label: 'Milk Electrical Conductivity (In-Line EC Probe)',
      value: Math.round(demo.conductivity * 6.5),
      display: `+${demo.conductivity}% (${(4.8 + demo.conductivity * 0.15).toFixed(1)} mS/cm)`,
      color: '#7E1F1B',
    },
    {
      label: 'AI-Estimated Somatic Cells (SCC)',
      value: Math.round(((demo.scc - 150000) / 150000) * 100),
      display: `${demo.scc.toLocaleString()} cells/ml (Elevated)`,
      color: '#A82B27',
    },
    {
      label: 'Daily Milk Yield Reduction (Variance)',
      value: Math.abs(demo.milkYieldChangePct),
      display: `${demo.milkYieldChangePct}%`,
      color: '#C4571F',
    },
    {
      label: 'Udder Thermal Delta (IR Sensor)',
      value: Math.round((demo.temperature - 38.4) * 20),
      display: `+${(demo.temperature - 38.4).toFixed(1)}°C (${demo.temperature}°C)`,
      color: '#B3690E',
    },
    {
      label: `Shed Heat Stress Vulnerability (THI ${liveEnvironment?.thiIndex || 78.4})`,
      value: 48,
      display: 'Elevated (Liu et al.)',
      color: '#D79A3B',
    },
    {
      label: 'Rumination Variance',
      value: Math.abs(demo.rumination),
      display: `${demo.rumination}%`,
      color: '#B7A66B',
    },
  ]

  // Requirement 5 breakdown
  const criticalCount = animals.filter((a) => a.riskLevel === 'critical').length
  const highCount = animals.filter((a) => a.riskLevel === 'high').length
  const moderateCount = animals.filter((a) => a.riskLevel === 'moderate').length
  const healthyCount = animals.filter((a) => a.riskLevel === 'none' || a.riskLevel === 'low').length
  const attentionCount = criticalCount + highCount
  const healthScore = Math.round(((healthyCount * 100 + moderateCount * 60 + attentionCount * 20) / animals.length))

  return (
    <div className="space-y-6">
      {/* 1. Championship Live Demo Bar */}
      <CompetitionHeroBar />

      {/* 2. Greeting & Dynamic Status Strip */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink sm:text-[26px]">
            {greeting}
          </h1>
          <p className="mt-0.5 text-sm text-ink-soft">
            {t(language, 'consoleSubtitle')}
          </p>
        </div>

        {/* Real-time Connectivity & Sync Status Strip (Requirement 5 & 13) */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs">
          {/* Refresh Telemetry Button */}
          <button
            onClick={refreshTelemetry}
            title="Refresh real-time telemetry (temperatures, THI, milk EC, and ESP32 nodes)"
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-canvas-raised px-2.5 sm:px-3 py-1 font-semibold text-ink shadow-sm hover:bg-canvas-sunken hover:border-pasture-500 transition-all active:scale-95 text-[11px] sm:text-xs"
          >
            <RefreshCw size={12} className="text-pasture-700" />
            <span className="sm:hidden">Refresh</span>
            <span className="hidden sm:inline">Refresh Live Telemetry</span>
          </button>

          <button
            onClick={toggleNetworkStatus}
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 sm:px-3 py-1 font-semibold transition-all shadow-sm text-[11px] sm:text-xs ${
              networkStatus === 'online'
                ? 'border-pasture-500/30 bg-pasture-50 text-pasture-800 hover:bg-pasture-100'
                : networkStatus === 'offline'
                ? 'border-signal-amber/40 bg-signal-amberSoft text-signal-amber hover:bg-signal-amber/15'
                : 'border-signal-blue/40 bg-signal-blueSoft text-signal-blue'
            }`}
          >
            {networkStatus === 'online' ? (
              <>
                <span className="h-2 w-2 rounded-full bg-pasture-600 animate-pulseDot" />
                <span className="sm:hidden">Online</span>
                <span className="hidden sm:inline">100% Offline Edge Ready · Online</span>
              </>
            ) : networkStatus === 'offline' ? (
              <>
                <WifiOff size={12} />
                <span className="sm:hidden">Offline Edge</span>
                <span className="hidden sm:inline">Offline Edge Mode (Local Buffering)</span>
              </>
            ) : (
              <>
                <RefreshCw size={12} className="animate-spin" />
                <span>Syncing...</span>
              </>
            )}
          </button>

          <span className="rounded-full bg-canvas-sunken px-2 sm:px-2.5 py-1 text-[10.5px] sm:text-[11px] text-ink-soft border border-line">
            <span className="hidden sm:inline">Last sync: </span><strong>{lastSyncTime}</strong>
          </span>
        </div>
      </div>

      {/* 3. Comprehensive Overview KPI Grid (Requirement 5) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard
          icon={PawPrint}
          label={t(language, 'totalAnimals')}
          value={animals.length}
          trend="100% Monitored"
          trendLabel="Continuous telemetry"
          trendDirection="up"
        />
        <StatCard
          icon={HeartPulse}
          label={t(language, 'healthy')}
          value={healthyCount}
          trend={`${Math.round((healthyCount / animals.length) * 100)}%`}
          trendLabel="Normal EC & temp"
          trendDirection="up"
          tone="ok"
        />
        <StatCard
          icon={AlertTriangle}
          label={t(language, 'watchRisk')}
          value={moderateCount}
          trend="Watchlist"
          trendLabel="Baseline monitoring"
          trendDirection="up"
          tone="moderate"
        />
        <StatCard
          icon={ShieldAlert}
          label={t(language, 'highRisk')}
          value={highCount}
          trend={`${highCount} Cattle`}
          trendLabel="Subclinical warnings"
          trendDirection="down"
          tone="high"
        />
        <StatCard
          icon={Siren}
          label={t(language, 'criticalRisk')}
          value={criticalCount}
          trend={`${criticalCount} Urgent`}
          trendLabel="Immediate triage"
          trendDirection="down"
          tone="critical"
        />
        <StatCard
          icon={Gauge}
          label={t(language, 'immediateAction')}
          value={`${attentionCount} Cattle`}
          trend={`${healthScore}/100 Score`}
          trendLabel="Clinical action queue"
          trendDirection="up"
          tone="high"
        />
      </div>

      {/* 4. Economic Impact & ROI Safeguard Card */}
      <EconomicImpactCard totalAnimals={animals.length} highRiskCount={attentionCount} />

      {/* 5. Herd Risk Distribution & AI Forecast */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="rounded-lg border border-line bg-canvas-raised p-5 shadow-card xl:col-span-5">
          <h3 className="font-display text-base font-semibold text-ink">Herd Mastitis Risk Distribution</h3>
          <p className="mt-0.5 mb-5 text-sm text-ink-soft">
            Dynamic categorization across {animals.length} tagged cattle
          </p>
          <HerdRiskChart />
        </div>
        <div className="rounded-lg border border-line bg-canvas-raised p-5 shadow-card xl:col-span-7">
          <ForecastChart />
        </div>
      </div>

      {/* 6. Shed Environmental Microclimate & Heat Stress Index (Hardware Telemetry) */}
      <ShedHeatStressCard />

      {/* 7. Rapid Clinical Triage Queue (Interactive Table) */}
      <LiveTriageTable animals={animals} alerts={alerts} />

      {/* 8. Early Warning Cards Grid */}
      <div>
        <div className="mb-3.5 flex items-center justify-between">
          <div>
            <h3 className="font-display text-base font-semibold text-ink">Active Clinical Early Warnings</h3>
            <p className="text-sm text-ink-soft">Animals the AI model flags for immediate preventive protocols</p>
          </div>
          <Link
            to="/alerts"
            className="flex items-center gap-1 text-sm font-medium text-pasture-700 hover:text-pasture-600"
          >
            View all alerts <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {activeWarnings.map((alert) => (
            <EarlyWarningCard key={alert.id} alert={alert} animal={animals.find((a) => a.id === alert.animalId)} />
          ))}
        </div>
      </div>

      {/* 9. Explainable AI Feature Contribution for Target Cow */}
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
