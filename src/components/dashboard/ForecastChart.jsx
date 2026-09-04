import React from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart, ReferenceLine } from 'recharts'
import { Sparkles } from 'lucide-react'
import { buildHerdForecast, HERD_FORECAST_CONFIDENCE } from '../../data/forecastData.js'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const actual = payload.find((p) => p.dataKey === 'actual')?.value
  const predicted = payload.find((p) => p.dataKey === 'predicted')?.value
  return (
    <div className="rounded-sm border border-line bg-canvas-raised px-3 py-2 text-xs shadow-pop">
      <p className="font-semibold text-ink">{label}</p>
      {actual != null && <p className="text-ink-soft">Observed risk: {actual}%</p>}
      {predicted != null && <p className="text-signal-blue">Predicted risk: {predicted}%</p>}
    </div>
  )
}

export default function ForecastChart() {
  const data = buildHerdForecast()
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-base font-semibold text-ink">AI Mastitis Risk Forecast</h3>
            <span className="inline-flex items-center gap-1 rounded-sm bg-signal-blueSoft px-2 py-0.5 text-[10.5px] font-semibold text-signal-blue">
              <Sparkles size={11} /> AI Forecast
            </span>
          </div>
          <p className="mt-0.5 text-sm text-ink-soft">Predicted herd risk for the next 14 days</p>
        </div>
        <div className="text-right">
          <p className="font-display text-lg font-semibold text-ink tabular">{HERD_FORECAST_CONFIDENCE}%</p>
          <p className="text-[11px] text-ink-faint">Forecast confidence</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={data} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="bandFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2B5FA8" stopOpacity={0.16} />
              <stop offset="95%" stopColor="#2B5FA8" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="actualFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3E7C52" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#3E7C52" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#EDEBE1" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#8A928E' }} axisLine={{ stroke: '#E4E2D8' }} tickLine={false} />
          <YAxis
            tick={{ fontSize: 11, fill: '#8A928E' }}
            axisLine={false}
            tickLine={false}
            unit="%"
            domain={[0, 60]}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine x="Today" stroke="#C9C5B4" strokeDasharray="3 3" />
          <Area type="monotone" dataKey="high" stroke="none" fill="url(#bandFill)" isAnimationActive={false} />
          <Area type="monotone" dataKey="low" stroke="none" fill="#FAFAF7" isAnimationActive={false} />
          <Area type="monotone" dataKey="actual" stroke="#2F6B44" strokeWidth={2.4} fill="url(#actualFill)" dot={false} />
          <Line
            type="monotone"
            dataKey="predicted"
            stroke="#2B5FA8"
            strokeWidth={2.4}
            strokeDasharray="6 4"
            dot={{ r: 3, fill: '#2B5FA8', strokeWidth: 0 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="mt-2 flex flex-wrap items-center gap-4 text-[11px] text-ink-faint">
        <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-pasture-600" /> Historical risk</span>
        <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 border-t-2 border-dashed border-signal-blue" /> Predicted risk</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-sm bg-signal-blue/15" /> Confidence band</span>
      </div>
    </div>
  )
}
