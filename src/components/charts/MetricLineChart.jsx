import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts'

function CustomTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-sm border border-line bg-canvas-raised px-3 py-2 text-xs shadow-pop">
      <p className="font-semibold text-ink">{label}</p>
      <p className="text-ink-soft">
        {payload[0].value}
        {unit}
      </p>
    </div>
  )
}

export default function MetricLineChart({ data, color = '#2F6B44', unit = '', highlightLastDays = 0, height = 240 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#EDEBE1" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 10.5, fill: '#8A928E' }} axisLine={{ stroke: '#E4E2D8' }} tickLine={false} interval={4} />
        <YAxis tick={{ fontSize: 10.5, fill: '#8A928E' }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
        <Tooltip content={<CustomTooltip unit={unit} />} />
        {highlightLastDays > 0 && (
          <ReferenceArea
            x1={data[Math.max(0, data.length - highlightLastDays)]?.label}
            x2={data[data.length - 1]?.label}
            fill="#B23A34"
            fillOpacity={0.05}
          />
        )}
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2.2} dot={false} activeDot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
