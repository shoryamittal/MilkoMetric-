import React, { useState } from 'react'
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

  const [selectedSpecies, setSelectedSpecies] = useState('All')
  const [selectedDemoId, setSelectedDemoId] = useState('COW-024')

  const displayAnimals = selectedSpecies === 'All'
    ? animals
    : animals.filter((a) => a.species === selectedSpecies)

  const cowsList = animals.filter((a) => a.species === 'Cow')
  const buffaloList = animals.filter((a) => a.species === 'Buffalo')
  const goatList = animals.filter((a) => a.species === 'Goat')

  const cowsAtRisk = cowsList.filter((a) => a.riskLevel === 'high' || a.riskLevel === 'critical').length
  const buffaloAtRisk = buffaloList.filter((a) => a.riskLevel === 'high' || a.riskLevel === 'critical').length
  const goatAtRisk = goatList.filter((a) => a.riskLevel === 'high' || a.riskLevel === 'critical').length

  const demo = animals.find((a) => a.id === selectedDemoId) || animals.find((a) => a.id === 'COW-024') || getAnimalById('COW-024')
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

  // Dynamic risk factor calculation for selected demo animal reflecting live changes & hardware EC probe
  const normalEC = demo.species === 'Buffalo' ? 5.2 : 4.8
  const normalTemp = demo.species === 'Buffalo' ? 38.1 : demo.species === 'Goat' ? 39.0 : 38.4
  const normalSCCBase = demo.species === 'Goat' ? 500000 : 150000

  const factors = [
    {
      label: `Milk Electrical Conductivity (${demo.species === 'Buffalo' ? 'In-Line Fat & EC Probe' : 'In-Line EC Probe'})`,
      value: Math.round(demo.conductivity * 6.5),
      display: `+${demo.conductivity}% (${(normalEC + demo.conductivity * 0.15).toFixed(1)} mS/cm)`,
      color: '#7E1F1B',
    },
    {
      label: demo.species === 'Goat' ? 'Apocrine Secretion-Adjusted SCC' : 'AI-Estimated Somatic Cells (SCC)',
      value: Math.round(((demo.scc - normalSCCBase) / normalSCCBase) * 100),
      display: `${demo.scc.toLocaleString()} cells/ml (${demo.species === 'Goat' ? 'Apocrine' : 'Elevated'})`,
      color: '#A82B27',
    },
    {
      label: 'Daily Milk Yield Reduction (Variance)',
      value: Math.abs(demo.milkYieldChangePct),
      display: `${demo.milkYieldChangePct}% (${demo.milkYield} L/day)`,
      color: '#C4571F',
    },
    {
      label: 'Udder Thermal Delta (IR Sensor)',
      value: Math.round((demo.temperature - normalTemp) * 20),
      display: `+${(demo.temperature - normalTemp).toFixed(1)}°C (${demo.temperature}°C)`,
      color: '#B3690E',
    },
    {
      label: `Shed Heat Stress Vulnerability (THI ${liveEnvironment?.thiIndex || 78.4})`,
      value: demo.species === 'Buffalo' ? 58 : 48,
      display: demo.species === 'Buffalo' ? 'High (Dark Hide & Fewer Sweat Glands)' : 'Elevated (Liu et al.)',
      color: '#D79A3B',
    },
    {
      label: 'Rumination Variance',
      value: Math.abs(demo.rumination),
      display: `${demo.rumination}%`,
      color: '#B7A66B',
    },
  ]

  // Dynamic breakdown reflecting active species selection
  const criticalCount = displayAnimals.filter((a) => a.riskLevel === 'critical').length
  const highCount = displayAnimals.filter((a) => a.riskLevel === 'high').length
  const moderateCount = displayAnimals.filter((a) => a.riskLevel === 'moderate').length
  const healthyCount = displayAnimals.filter((a) => a.riskLevel === 'none' || a.riskLevel === 'low').length
  const attentionCount = criticalCount + highCount
  const healthScore = Math.round(((healthyCount * 100 + moderateCount * 60 + attentionCount * 20) / (displayAnimals.length || 1)))

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

      {/* 2.5 Multi-Species Herd Telemetry & Biometric Filter */}
      <div className="rounded-xl border border-line bg-canvas-raised p-4 sm:p-5 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5 border-b border-line pb-3.5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-base sm:text-lg font-bold text-ink">
                Multi-Species Dairy Herd Telemetry
              </h2>
              <span className="rounded-full bg-pasture-100 text-pasture-800 dark:bg-pasture-900/40 dark:text-pasture-300 px-2.5 py-0.5 text-xs font-semibold">
                128 Monitored Head · 3 Dairy Species
              </span>
            </div>
            <p className="text-xs text-ink-soft mt-0.5">
              Species-calibrated biological baselines: Indian Cattle, Murrah/Mehsana Buffaloes & Dairy Goats
            </p>
          </div>

          {/* Species filter toggle tabs */}
          <div className="inline-flex rounded-lg border border-line bg-canvas-sunken p-1 text-xs font-semibold overflow-x-auto max-w-full">
            {[
              { id: 'All', label: 'All Livestock', count: animals.length },
              { id: 'Cow', label: '🐄 Cows', count: cowsList.length },
              { id: 'Buffalo', label: '🐃 Buffaloes', count: buffaloList.length },
              { id: 'Goat', label: '🐐 Goats', count: goatList.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedSpecies(tab.id)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-md transition-all text-xs ${
                  selectedSpecies === tab.id
                    ? 'bg-canvas-raised text-pasture-700 shadow-sm font-bold ring-1 ring-black/5 dark:ring-white/10'
                    : 'text-ink-soft hover:text-ink'
                }`}
              >
                {tab.label} <span className="opacity-75 text-[10.5px]">({tab.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Species comparative summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Cows Card */}
          <div
            onClick={() => setSelectedSpecies(selectedSpecies === 'Cow' ? 'All' : 'Cow')}
            className={`cursor-pointer rounded-lg border p-3 transition-all ${
              selectedSpecies === 'Cow'
                ? 'border-pasture-500 bg-pasture-50/50 dark:bg-pasture-950/20 ring-1 ring-pasture-500'
                : 'border-line bg-canvas hover:border-pasture-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🐄</span>
                <div>
                  <h3 className="text-xs font-bold text-ink">Dairy Cattle (Bos indicus)</h3>
                  <p className="text-[11px] text-ink-soft">Gir, Sahiwal, Red Sindhi</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-ink">{cowsList.length} Head</span>
            </div>
            <div className="mt-2.5 grid grid-cols-3 gap-1 text-[11px] bg-canvas-sunken/60 rounded p-1.5 text-center">
              <div>
                <span className="text-ink-soft block text-[10px]">At Risk</span>
                <span className="font-bold text-signal-red">{cowsAtRisk}</span>
              </div>
              <div>
                <span className="text-ink-soft block text-[10px]">Avg Fat</span>
                <span className="font-semibold text-ink">4.1%</span>
              </div>
              <div>
                <span className="text-ink-soft block text-[10px]">Normal EC</span>
                <span className="font-semibold text-ink">4.8 mS</span>
              </div>
            </div>
          </div>

          {/* Buffaloes Card */}
          <div
            onClick={() => setSelectedSpecies(selectedSpecies === 'Buffalo' ? 'All' : 'Buffalo')}
            className={`cursor-pointer rounded-lg border p-3 transition-all ${
              selectedSpecies === 'Buffalo'
                ? 'border-pasture-500 bg-pasture-50/50 dark:bg-pasture-950/20 ring-1 ring-pasture-500'
                : 'border-line bg-canvas hover:border-pasture-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🐃</span>
                <div>
                  <h3 className="text-xs font-bold text-ink">Water Buffalo (Bubalus bubalis)</h3>
                  <p className="text-[11px] text-ink-soft">Murrah, Mehsana, Nili-Ravi</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-ink">{buffaloList.length} Head</span>
            </div>
            <div className="mt-2.5 grid grid-cols-3 gap-1 text-[11px] bg-canvas-sunken/60 rounded p-1.5 text-center">
              <div>
                <span className="text-ink-soft block text-[10px]">At Risk</span>
                <span className="font-bold text-signal-red">{buffaloAtRisk}</span>
              </div>
              <div>
                <span className="text-ink-soft block text-[10px]">High Fat</span>
                <span className="font-bold text-pasture-700">7.2%</span>
              </div>
              <div>
                <span className="text-ink-soft block text-[10px]">Heat Vulnerable</span>
                <span className="font-semibold text-signal-amber">Elevated</span>
              </div>
            </div>
          </div>

          {/* Goats Card */}
          <div
            onClick={() => setSelectedSpecies(selectedSpecies === 'Goat' ? 'All' : 'Goat')}
            className={`cursor-pointer rounded-lg border p-3 transition-all ${
              selectedSpecies === 'Goat'
                ? 'border-pasture-500 bg-pasture-50/50 dark:bg-pasture-950/20 ring-1 ring-pasture-500'
                : 'border-line bg-canvas hover:border-pasture-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🐐</span>
                <div>
                  <h3 className="text-xs font-bold text-ink">Dairy Goats (Capra hircus)</h3>
                  <p className="text-[11px] text-ink-soft">Jamnapari, Barbari, Beetal</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-ink">{goatList.length} Head</span>
            </div>
            <div className="mt-2.5 grid grid-cols-3 gap-1 text-[11px] bg-canvas-sunken/60 rounded p-1.5 text-center">
              <div>
                <span className="text-ink-soft block text-[10px]">At Risk</span>
                <span className="font-bold text-signal-red">{goatAtRisk}</span>
              </div>
              <div>
                <span className="text-ink-soft block text-[10px]">Normal Temp</span>
                <span className="font-semibold text-ink">39.0°C</span>
              </div>
              <div>
                <span className="text-ink-soft block text-[10px]">Apocrine SCC</span>
                <span className="font-semibold text-signal-blue">Calibrated</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Comprehensive Overview KPI Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard
          icon={PawPrint}
          label={selectedSpecies === 'All' ? t(language, 'totalAnimals') : `${selectedSpecies} Population`}
          value={displayAnimals.length}
          trend={selectedSpecies === 'All' ? '100% Monitored' : `${Math.round((displayAnimals.length / animals.length) * 100)}% of Herd`}
          trendLabel="Continuous telemetry"
          trendDirection="up"
        />
        <StatCard
          icon={HeartPulse}
          label={t(language, 'healthy')}
          value={healthyCount}
          trend={`${Math.round((healthyCount / (displayAnimals.length || 1)) * 100)}%`}
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
          trend={`${highCount} ${selectedSpecies === 'All' ? 'Animals' : selectedSpecies + 's'}`}
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
          value={`${attentionCount} ${selectedSpecies === 'All' ? 'Animals' : selectedSpecies + 's'}`}
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
            Dynamic categorization across {displayAnimals.length} tagged {selectedSpecies === 'All' ? 'livestock' : selectedSpecies.toLowerCase() + 's'}
          </p>
          <HerdRiskChart animals={displayAnimals} />
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

      {/* 9. Explainable AI Feature Contribution for Target Animals */}
      <div className="rounded-lg border border-line bg-canvas-raised p-5 shadow-card">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-3.5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-display text-base font-semibold text-ink">
                Multi-Modal Explainable AI (XAI) Diagnostics
              </p>
              <span className="rounded bg-signal-amberSoft px-2 py-0.5 text-[11px] font-bold text-signal-amber">
                Demo Case: {demo.id} ({demo.speciesEmoji || '🐄'} {demo.breed} {demo.species})
              </span>
            </div>
            <p className="text-xs text-ink-soft mt-0.5">
              Weight attribution model indicating biometric indicators driving current risk classification
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Demo Animal Switcher */}
            <div className="inline-flex rounded-lg border border-line bg-canvas-sunken p-1 text-xs font-semibold overflow-x-auto max-w-full">
              {[
                { id: 'COW-024', emoji: '🐄', label: 'COW-024', risk: '87%' },
                { id: 'BUF-008', emoji: '🐃', label: 'BUF-008', risk: '78%' },
                { id: 'GOT-004', emoji: '🐐', label: 'GOT-004', risk: '68%' },
              ].map((d) => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDemoId(d.id)}
                  className={`px-2.5 py-1 rounded transition-all text-xs font-medium flex items-center gap-1 ${
                    selectedDemoId === d.id
                      ? 'bg-canvas-raised text-pasture-800 font-bold shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                      : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  <span>{d.emoji}</span>
                  <span>{d.label}</span>
                  <span className="text-signal-red font-bold">({d.risk})</span>
                </button>
              ))}
            </div>

            <Link
              to={`/animals/${demo.id}`}
              className="flex items-center gap-1 text-xs font-semibold text-pasture-700 hover:text-pasture-600 bg-pasture-50 dark:bg-pasture-950/30 px-2.5 py-1.5 rounded border border-pasture-500/20"
            >
              Open Dossier <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        <RiskFactorBars
          factors={factors}
          title={`${demo.speciesEmoji || '🐄'} ${demo.name} (${demo.id}) Biometric Feature Breakdown`}
          subtitle={`Relative multi-modal weights contributing to ${demo.id}'s ${demo.riskScore}% (${(demo.riskLevel || 'moderate').toUpperCase()}) risk score`}
        />
      </div>
    </div>
  )
}
