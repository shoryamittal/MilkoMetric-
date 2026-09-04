import React, { useMemo } from 'react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useApp } from '../context/AppContext.jsx'
import { BREEDS } from '../data/animals.js'

const AXIS = { fontSize: 11, fill: '#8A928E' }

function ChartCard({ title, subtitle, children, className = '' }) {
  return (
    <div className={`rounded-lg border border-line bg-canvas-raised p-5 shadow-card ${className}`}>
      <h3 className="font-display text-base font-semibold text-ink">{title}</h3>
      {subtitle && <p className="mt-0.5 text-sm text-ink-soft">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </div>
  )
}

export default function Analytics() {
  const { animals } = useApp()

  const riskTrend = useMemo(() => {
    const points = []
    let base = 12
    for (let d = -29; d <= 0; d++) {
      base += Math.sin(d / 5) * 0.6 + 0.35
      points.push({ label: d === 0 ? 'Today' : `${d}d`, risk: Math.round(Math.max(8, base) * 10) / 10 })
    }
    return points
  }, [])

  const sccBuckets = useMemo(() => {
    const buckets = [
      { label: '<100k', min: 0, max: 100000 },
      { label: '100–200k', min: 100000, max: 200000 },
      { label: '200–300k', min: 200000, max: 300000 },
      { label: '300–400k', min: 300000, max: 400000 },
      { label: '400k+', min: 400000, max: Infinity },
    ]
    return buckets.map((b) => ({ label: b.label, count: animals.filter((a) => a.scc >= b.min && a.scc < b.max).length }))
  }, [animals])

  const milkProduction = useMemo(() => {
    const points = []
    let base = 17.4
    for (let d = -29; d <= 0; d++) {
      base += Math.cos(d / 6) * 0.15
      points.push({ label: d === 0 ? 'Today' : `${d}d`, yield: Math.round(base * 10) / 10 })
    }
    return points
  }, [])

  const riskByBreed = useMemo(
    () =>
      BREEDS.map((breed) => {
        const list = animals.filter((a) => a.breed === breed)
        const pct = list.length ? Math.round((list.filter((a) => a.riskLevel === 'high' || a.riskLevel === 'critical').length / list.length) * 100) : 0
        return { label: breed, value: pct }
      }).sort((a, b) => b.value - a.value),
    [animals]
  )

  const riskByLactation = useMemo(
    () =>
      [1, 2, 3, 4].map((n) => {
        const list = animals.filter((a) => (n === 4 ? a.lactationNumber >= 4 : a.lactationNumber === n))
        const pct = list.length ? Math.round((list.filter((a) => a.riskLevel === 'high' || a.riskLevel === 'critical').length / list.length) * 100) : 0
        return { label: n === 4 ? 'Lactation 4+' : `Lactation ${n}`, value: pct }
      }),
    [animals]
  )

  const environmental = [
    { label: 'Temperature', value: '28.4°C', tone: 'moderate' },
    { label: 'Humidity', value: '71%', tone: 'moderate' },
    { label: 'Rainfall (7d)', value: '38 mm', tone: 'ok' },
    { label: 'Bedding Cleanliness', value: '82 / 100', tone: 'ok' },
    { label: 'Hygiene Score', value: '76 / 100', tone: 'moderate' },
  ]

  return (
    <div className="space-y-5">
      <ChartCard title="Mastitis Risk Trend" subtitle="Herd-average risk score, last 30 days">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={riskTrend} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="riskTrendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#B23A34" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#B23A34" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#EDEBE1" vertical={false} />
            <XAxis dataKey="label" tick={AXIS} axisLine={{ stroke: '#E4E2D8' }} tickLine={false} interval={4} />
            <YAxis tick={AXIS} axisLine={false} tickLine={false} unit="%" />
            <Tooltip />
            <Area type="monotone" dataKey="risk" stroke="#B23A34" strokeWidth={2.2} fill="url(#riskTrendFill)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartCard title="SCC Distribution" subtitle="Somatic cell count across the herd">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={sccBuckets} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDEBE1" vertical={false} />
              <XAxis dataKey="label" tick={AXIS} axisLine={{ stroke: '#E4E2D8' }} tickLine={false} />
              <YAxis tick={AXIS} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {sccBuckets.map((b, i) => (
                  <Cell key={b.label} fill={i >= 3 ? '#C4571F' : i === 2 ? '#D79A3B' : '#3E7C52'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Milk Production" subtitle="Average herd yield, last 30 days">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={milkProduction} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="milkFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2B5FA8" stopOpacity={0.16} />
                  <stop offset="95%" stopColor="#2B5FA8" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDEBE1" vertical={false} />
              <XAxis dataKey="label" tick={AXIS} axisLine={{ stroke: '#E4E2D8' }} tickLine={false} interval={4} />
              <YAxis tick={AXIS} axisLine={false} tickLine={false} unit="L" domain={['auto', 'auto']} />
              <Tooltip />
              <Area type="monotone" dataKey="yield" stroke="#2B5FA8" strokeWidth={2.2} fill="url(#milkFill)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Risk by Breed" subtitle="% of animals at high or critical risk">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={riskByBreed} layout="vertical" margin={{ top: 4, right: 20, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDEBE1" horizontal={false} />
              <XAxis type="number" tick={AXIS} axisLine={false} tickLine={false} unit="%" />
              <YAxis type="category" dataKey="label" tick={AXIS} axisLine={false} tickLine={false} width={100} />
              <Tooltip />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} fill="#3E7C52" barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Risk by Lactation" subtitle="% of animals at high or critical risk">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={riskByLactation} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDEBE1" vertical={false} />
              <XAxis dataKey="label" tick={AXIS} axisLine={{ stroke: '#E4E2D8' }} tickLine={false} />
              <YAxis tick={AXIS} axisLine={false} tickLine={false} unit="%" />
              <Tooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="#B3690E" barSize={38} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Environmental Risk" subtitle="Farm-level conditions that correlate with mastitis risk">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {environmental.map((e) => (
            <div key={e.label} className="rounded-md bg-canvas-sunken p-3 text-center">
              <p className="font-display text-lg font-semibold text-ink tabular">{e.value}</p>
              <p className="mt-0.5 text-[11px] text-ink-soft">{e.label}</p>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  )
}
