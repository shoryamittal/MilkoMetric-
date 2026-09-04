import React, { useState } from 'react'
import { Info } from 'lucide-react'

export function InfoTooltip({ text }) {
  const [open, setOpen] = useState(false)
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label="More information"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((o) => !o)}
        className="flex h-4 w-4 items-center justify-center rounded-full text-ink-faint hover:text-ink-soft"
      >
        <Info size={14} />
      </button>
      {open && (
        <span className="absolute bottom-6 left-1/2 z-20 w-56 -translate-x-1/2 rounded-md border border-line bg-ink px-3 py-2 text-xs leading-relaxed text-canvas shadow-pop">
          {text}
        </span>
      )}
    </span>
  )
}

export default function Tooltip({ label, children }) {
  const [open, setOpen] = useState(false)
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {children}
      {open && (
        <span className="pointer-events-none absolute -top-8 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-sm bg-ink px-2 py-1 text-xs text-canvas">
          {label}
        </span>
      )}
    </span>
  )
}
