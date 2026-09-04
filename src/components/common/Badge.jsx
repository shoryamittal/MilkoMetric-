import React from 'react'

const TONES = {
  none: 'bg-pasture-100 text-pasture-700 border-pasture-300/60',
  low: 'bg-pasture-50 text-pasture-600 border-pasture-300/50',
  moderate: 'bg-signal-amberSoft text-signal-amber border-signal-amber/25',
  high: 'bg-signal-redSoft text-signal-red border-signal-red/25',
  critical: 'bg-signal-criticalSoft text-signal-critical border-signal-critical/30',
  info: 'bg-signal-blueSoft text-signal-blue border-signal-blue/20',
  neutral: 'bg-canvas-sunken text-ink-soft border-line',
  ok: 'bg-pasture-100 text-pasture-700 border-pasture-300/60',
}

const DOT = {
  none: '#3E7C52',
  low: '#5C9C68',
  moderate: '#B3690E',
  high: '#C4571F',
  critical: '#7E1F1B',
  info: '#2B5FA8',
  neutral: '#8A928E',
  ok: '#3E7C52',
}

export default function Badge({ tone = 'neutral', children, dot = true, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-xs font-medium leading-5 ${TONES[tone] || TONES.neutral} ${className}`}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full" style={{ background: DOT[tone] || DOT.neutral }} />}
      {children}
    </span>
  )
}

export function riskTone(level) {
  return TONES[level] ? level : 'neutral'
}
