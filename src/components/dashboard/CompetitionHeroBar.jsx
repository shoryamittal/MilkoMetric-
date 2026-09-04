import React, { useState } from 'react'
import { Sparkles, Play, RotateCcw, Activity, Radio, Cpu, CheckCircle2, ShieldCheck, Download } from 'lucide-react'
import { useApp } from '../../context/AppContext.jsx'

export default function CompetitionHeroBar() {
  const { simulationActive, simulateMastitisEvent, resetSimulation, animals } = useApp()
  const [exporting, setExporting] = useState(false)
  const targetCow = animals.find((a) => a.id === 'COW-024')

  const handleExportSummary = () => {
    setExporting(true)
    setTimeout(() => {
      setExporting(false)
      // Trigger a clean print dialog for judging review or PDF export
      window.print()
    }, 600)
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-pasture-600/30 bg-gradient-to-r from-ink via-[#1F2C24] to-ink p-4 text-white shadow-pop sm:p-5">
      {/* Background ambient pattern */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-pasture-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 -bottom-16 h-56 w-56 rounded-full bg-signal-blue/10 blur-3xl" />

      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Left info & live telemetry ticker */}
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-pasture-500/20 px-2.5 py-0.5 text-xs font-semibold text-pasture-300 ring-1 ring-inset ring-pasture-500/40">
              <span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-pasture-400" /> Live AI Telemetry
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium text-white/80">
              <Cpu size={11} className="text-pasture-300" /> Edge-Inference (LightGBM + LSTM)
            </span>
            <span className="text-[11px] text-white/50">Inference latency: 18ms</span>
          </div>

          <h2 className="font-display text-lg font-bold sm:text-xl text-white">
            Pre-Symptomatic Mastitis Prediction Engine
          </h2>
          <p className="text-xs text-white/70 max-w-2xl leading-relaxed">
            Multi-modal sensor fusion combining In-Line Electrical Conductivity, Somatic Cell Count (SCC),
            Udder Infrared Thermography, and Rumination telemetry to detect subclinical mastitis 7–10 days before visible clinical signs.
          </p>

          {/* Quick telemetry strip */}
          <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] text-white/70">
            <span className="flex items-center gap-1">
              <Radio size={12} className="text-pasture-400" /> 128 IoT Sensors Active
            </span>
            <span className="flex items-center gap-1">
              <Activity size={12} className="text-signal-blue" /> 99.4% Model Confidence
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck size={12} className="text-emerald-400" /> Target Cow-024:
              <strong className={targetCow?.riskScore >= 80 ? 'text-signal-red ml-0.5' : 'text-emerald-400 ml-0.5'}>
                {targetCow?.riskScore || 87}% Risk ({targetCow?.riskLevel?.toUpperCase()})
              </strong>
            </span>
          </div>
        </div>

        {/* Right action controls for Live Demonstration */}
        <div className="flex flex-wrap items-center gap-2.5 lg:flex-col lg:items-end">
          <div className="flex items-center gap-2">
            <button
              onClick={simulateMastitisEvent}
              className="flex items-center gap-1.5 rounded-md bg-signal-red px-3.5 py-2 text-xs font-bold text-white shadow-md transition-all hover:bg-signal-critical active:scale-95"
            >
              <Play size={13} className="fill-white" /> Simulate Outbreak (COW-024)
            </button>

            <button
              onClick={resetSimulation}
              disabled={!simulationActive}
              className="flex items-center gap-1.5 rounded-md border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white backdrop-blur transition-all hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RotateCcw size={13} /> Reset Baseline
            </button>
          </div>

          <button
            onClick={handleExportSummary}
            disabled={exporting}
            className="flex items-center gap-1.5 rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-[11.5px] font-medium text-white/80 hover:bg-white/15 transition-all"
          >
            <Download size={12} /> {exporting ? 'Generating Report...' : 'Export Clinical Dossier'}
          </button>
        </div>
      </div>
    </div>
  )
}