import React, { useState } from 'react'
import { Wifi, Battery, Radio, Thermometer, Droplets, Milk, Zap, Sparkles, RotateCcw } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { DEVICES, DEVICE_COUNTS, LIVE_ENVIRONMENT } from '../data/sensorData.js'
import Badge from '../components/common/Badge.jsx'

function timeAgo(sec) {
  if (sec < 60) return `${sec} sec ago`
  return `${Math.round(sec / 60)} min ago`
}

function LiveCard({ icon: Icon, label, value, tone = 'default' }) {
  return (
    <div className="rounded-lg border border-line bg-canvas-raised p-4 shadow-card">
      <div className="flex items-center justify-between">
        <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-canvas-sunken text-ink-soft">
          <Icon size={15} />
        </span>
        <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-pasture-600">
          <span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-pasture-600" /> Live
        </span>
      </div>
      <p className={`mt-3 font-display text-xl font-semibold tabular ${tone === 'moderate' ? 'text-signal-amber' : 'text-ink'}`}>{value}</p>
      <p className="text-xs text-ink-soft">{label}</p>
    </div>
  )
}

export default function IoT() {
  const { simulationActive, simulateMastitisEvent, resetSimulation } = useApp()
  const [deviceFilter, setDeviceFilter] = useState('all')

  const filteredDevices = DEVICES.filter((d) => deviceFilter === 'all' || d.type === deviceFilter)
  const deviceTypes = ['all', ...new Set(DEVICES.map((d) => d.type))]

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-pasture-300/50 bg-pasture-50 p-4 shadow-card sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="flex items-center gap-1.5 font-display text-[15px] font-semibold text-ink">
              <Sparkles size={15} className="text-pasture-600" /> Simulated Sensor Mode
            </p>
            <p className="mt-0.5 text-sm text-ink-soft">
              Trigger a live mastitis event on COW-024 and watch alerts, forecasts and the dashboard update in real time.
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              onClick={simulateMastitisEvent}
              className="rounded-sm bg-signal-red px-4 py-2.5 text-sm font-semibold text-white hover:bg-signal-critical"
            >
              Simulate Mastitis Event
            </button>
            <button
              onClick={resetSimulation}
              disabled={!simulationActive}
              className="flex items-center gap-1.5 rounded-sm border border-line bg-canvas-raised px-4 py-2.5 text-sm font-semibold text-ink disabled:opacity-40 hover:bg-canvas-sunken"
            >
              <RotateCcw size={14} /> Reset Simulation
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
        {[
          { icon: Wifi, label: 'Animals Connected', value: DEVICE_COUNTS.animalsConnected },
          { icon: Radio, label: 'Wearable Sensors', value: DEVICE_COUNTS.wearables },
          { icon: Milk, label: 'Milk Sensors', value: DEVICE_COUNTS.milkSensors },
          { icon: Thermometer, label: 'Environmental Sensors', value: DEVICE_COUNTS.environmentalSensors },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-line bg-canvas-raised p-4 shadow-card">
            <s.icon size={16} className="text-pasture-600" />
            <p className="mt-2.5 font-display text-2xl font-semibold text-ink tabular">{s.value}</p>
            <p className="text-xs text-ink-soft">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
        <LiveCard icon={Thermometer} label="Farm Temperature" value={`${LIVE_ENVIRONMENT.farmTemperature}°C`} />
        <LiveCard icon={Droplets} label="Humidity" value={`${LIVE_ENVIRONMENT.humidity}%`} />
        <LiveCard icon={Milk} label="Milk Temperature" value={`${LIVE_ENVIRONMENT.milkTemperature}°C`} />
        <LiveCard icon={Zap} label="Avg Conductivity" value={`${LIVE_ENVIRONMENT.avgConductivity} mS/cm`} />
        <LiveCard icon={Wifi} label="Environmental Risk" value={LIVE_ENVIRONMENT.environmentalRisk} tone="moderate" />
      </div>

      <div className="rounded-lg border border-line bg-canvas-raised shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
          <p className="text-sm font-semibold text-ink">Connected Devices</p>
          <select
            value={deviceFilter}
            onChange={(e) => setDeviceFilter(e.target.value)}
            className="rounded-sm border border-line bg-canvas px-2.5 py-1.5 text-xs text-ink focus:border-pasture-500"
          >
            {deviceTypes.map((t) => (
              <option key={t} value={t}>
                {t === 'all' ? 'All Device Types' : t}
              </option>
            ))}
          </select>
        </div>
        <div className="max-h-[420px] overflow-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-[13px]">
            <thead className="sticky top-0 bg-canvas-raised">
              <tr className="border-b border-line text-[11px] uppercase tracking-wide text-ink-faint">
                <th className="px-4 py-2.5 font-medium">Device</th>
                <th className="px-4 py-2.5 font-medium">Type</th>
                <th className="px-4 py-2.5 font-medium">Animal / Farm</th>
                <th className="px-4 py-2.5 font-medium">Battery</th>
                <th className="px-4 py-2.5 font-medium">Connection</th>
                <th className="px-4 py-2.5 font-medium">Last Update</th>
              </tr>
            </thead>
            <tbody>
              {filteredDevices.map((d) => (
                <tr key={d.id} className="border-b border-line/70 last:border-0">
                  <td className="px-4 py-2.5 font-semibold text-ink">{d.id}</td>
                  <td className="px-4 py-2.5 text-ink-soft">{d.type}</td>
                  <td className="px-4 py-2.5 text-ink-soft">{d.target}</td>
                  <td className="px-4 py-2.5">
                    <span className="flex items-center gap-1.5 text-ink-soft tabular">
                      <Battery size={13} className={d.battery < 25 ? 'text-signal-red' : 'text-ink-faint'} /> {d.battery}%
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge tone={d.connection === 'Connected' ? 'ok' : 'moderate'} dot>
                      {d.connection}
                    </Badge>
                  </td>
                  <td className="px-4 py-2.5 text-ink-faint">{timeAgo(d.lastUpdateSec)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
