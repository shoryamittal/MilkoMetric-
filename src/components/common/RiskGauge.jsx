import React, { useEffect, useState } from 'react'
import { bandForScore, RISK_BANDS } from '../../utils/riskCalculator.js'

export default function RiskGauge({ score, size = 200, label = 'AI Mastitis Risk', sublabel, level, levelLabel }) {
  const [animated, setAnimated] = useState(0)
  // Allow the caller to pin the exact risk level/label shown (e.g. a demo
  // animal whose score sits right at a band boundary) instead of always
  // re-deriving it from the numeric score.
  const band = level ? RISK_BANDS.find((b) => b.level === level) || bandForScore(score) : bandForScore(score)
  const displayLabel = levelLabel || band.label

  useEffect(() => {
    setAnimated(0)
    const raf = requestAnimationFrame(() => {
      const t = setTimeout(() => setAnimated(score), 60)
      return () => clearTimeout(t)
    })
    return () => cancelAnimationFrame(raf)
  }, [score])

  const stroke = 14
  const r = (size - stroke) / 2
  const cx = size / 2
  const cy = size / 2
  const startAngle = 135
  const sweep = 270
  const angle = startAngle + (animated / 100) * sweep

  const polarToCartesian = (cxx, cyy, radius, deg) => {
    const rad = ((deg - 90) * Math.PI) / 180
    return { x: cxx + radius * Math.cos(rad), y: cyy + radius * Math.sin(rad) }
  }
  const describeArc = (cxx, cyy, radius, a1, a2) => {
    const start = polarToCartesian(cxx, cyy, radius, a2)
    const end = polarToCartesian(cxx, cyy, radius, a1)
    const largeArc = a2 - a1 <= 180 ? 0 : 1
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y}`
  }

  const trackPath = describeArc(cx, cy, r, startAngle, startAngle + sweep)
  const valuePath = describeArc(cx, cy, r, startAngle, Math.max(startAngle + 0.001, angle))

  return (
    <div className="flex flex-col items-center" style={{ width: size }}>
      <svg width={size} height={size * 0.86} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        <path d={trackPath} fill="none" stroke="#EDEBE1" strokeWidth={stroke} strokeLinecap="round" />
        <path
          d={valuePath}
          fill="none"
          stroke={band.color}
          strokeWidth={stroke}
          strokeLinecap="round"
          style={{ transition: 'all 900ms cubic-bezier(0.22, 1, 0.36, 1)' }}
        />
        <text x={cx} y={cy - 6} textAnchor="middle" className="font-display" style={{ fontSize: size * 0.19, fontWeight: 700, fill: '#1B1F1D' }}>
          {Math.round(animated)}%
        </text>
        <text x={cx} y={cy + 20} textAnchor="middle" style={{ fontSize: size * 0.06, fill: '#8A928E', letterSpacing: '0.02em' }}>
          risk score
        </text>
      </svg>
      <div className="-mt-2 flex flex-col items-center gap-1 text-center">
        <span
          className="rounded-sm border px-2.5 py-0.5 text-xs font-semibold tracking-wide"
          style={{ color: band.color, borderColor: `${band.color}40`, background: `${band.color}14` }}
        >
          {displayLabel.toUpperCase()}
        </span>
        {sublabel && <span className="text-xs text-ink-faint">{sublabel}</span>}
      </div>
    </div>
  )
}
