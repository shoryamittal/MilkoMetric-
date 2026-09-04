import React from 'react'

export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-sm bg-canvas-sunken ${className}`} />
}

export default function LoadingState({ label = 'Analyzing herd health…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-pasture-600" />
      <p className="text-sm text-ink-soft">{label}</p>
    </div>
  )
}
