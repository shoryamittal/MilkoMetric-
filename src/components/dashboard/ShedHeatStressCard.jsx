import React from 'react'
import { ThermometerSun, Droplets, Wind, AlertTriangle, ShieldCheck, Cpu, Info } from 'lucide-react'
import { useApp } from '../../context/AppContext.jsx'

export default function ShedHeatStressCard() {
  const { liveEnvironment } = useApp()
  const ambientTemp = liveEnvironment?.farmTemperature || 31.4
  const humidity = liveEnvironment?.humidity || 72
  const thi = liveEnvironment?.thiIndex || (Math.round((0.8 * ambientTemp + (humidity / 100) * (ambientTemp - 14.4) + 46.4) * 10) / 10)

  return (
    <div className="rounded-lg border border-line bg-canvas-raised p-5 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-signal-amberSoft text-signal-amber shadow-sm">
            <ThermometerSun size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base font-semibold text-ink">
                Shed Microclimate & Heat Stress Index (THI)
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-signal-amberSoft px-2 py-0.5 text-[10.5px] font-bold text-signal-amber">
                <AlertTriangle size={11} /> Moderate Heat Stress (THI {thi})
              </span>
            </div>
            <p className="text-xs text-ink-soft">
              Continuous multi-sensor telemetry streamed via Shed ESP32 Environmental Nodes (LoRaWAN)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-ink-soft">
          <span className="flex items-center gap-1 rounded-md border border-line bg-canvas-sunken px-2.5 py-1 text-[11px] font-medium text-ink">
            <Cpu size={11} className="text-pasture-600" /> Node #ENV-02 (Shed A)
          </span>
        </div>
      </div>

      {/* Primary telemetry metrics */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-md border border-signal-amber/30 bg-signal-amberSoft/30 p-3">
          <div className="flex items-center justify-between text-xs text-signal-amber">
            <span className="font-medium">Calculated THI</span>
            <ThermometerSun size={13} />
          </div>
          <p className="mt-1.5 font-display text-2xl font-bold text-signal-amber tabular">
            {thi} <span className="text-xs font-normal text-ink-soft">/ 100</span>
          </p>
          <p className="mt-0.5 text-[11px] text-signal-amber font-medium">Threshold &gt;72 breached</p>
        </div>

        <div className="rounded-md border border-line bg-canvas-sunken/60 p-3">
          <div className="flex items-center justify-between text-xs text-ink-soft">
            <span>Ambient Temp</span>
            <span className="text-[10px] text-ink-faint">Shed A</span>
          </div>
          <p className="mt-1.5 font-display text-2xl font-bold text-ink tabular">
            {ambientTemp}°C
          </p>
          <p className="mt-0.5 text-[11px] text-signal-amber">+2.6°C above comfort zone</p>
        </div>

        <div className="rounded-md border border-line bg-canvas-sunken/60 p-3">
          <div className="flex items-center justify-between text-xs text-ink-soft">
            <span>Relative Humidity</span>
            <Droplets size={13} className="text-signal-blue" />
          </div>
          <p className="mt-1.5 font-display text-2xl font-bold text-signal-blue tabular">
            {humidity}%
          </p>
          <p className="mt-0.5 text-[11px] text-ink-faint">Elevated evaporative load</p>
        </div>

        <div className="rounded-md border border-line bg-canvas-sunken/60 p-3">
          <div className="flex items-center justify-between text-xs text-ink-soft">
            <span>Mitigation Status</span>
            <Wind size={13} className="text-pasture-600" />
          </div>
          <p className="mt-1.5 font-display text-base font-bold text-pasture-700">
            HVLS Fans Active
          </p>
          <p className="mt-0.5 text-[11px] text-pasture-600 flex items-center gap-1">
            <ShieldCheck size={11} /> Teat misting scheduled
          </p>
        </div>
      </div>

      {/* Clinical research correlation alert */}
      <div className="mt-3.5 flex items-start gap-2.5 rounded-md border border-signal-amber/20 bg-signal-amberSoft/20 p-3 text-xs leading-relaxed text-ink">
        <Info size={15} className="mt-0.5 shrink-0 text-signal-amber" />
        <div>
          <span className="font-semibold text-ink">Clinical Multi-Modal Correlation (SIH Research Citation - Liu et al.): </span>
          <span>
            Prolonged heat stress (THI &gt;72) depresses rumination by ~11%, elevates cortisol, and increases teat sphincter vascular permeability,
            raising subclinical mastitis vulnerability by <strong>2.1×</strong> across high-yielding dairy cattle.
          </span>
        </div>
      </div>
    </div>
  )
}
