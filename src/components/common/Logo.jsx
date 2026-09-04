import React from 'react'

// Custom mark: an udder/droplet silhouette with an AI pulse (ECG-style) line
// running through it — built in pure SVG, no external asset dependency.
export default function Logo({ size = 30, withWordmark = true, tone = 'default' }) {
  const dark = tone === 'light'
  return (
    <div className="flex items-center gap-2.5">
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="1" width="38" height="38" rx="11" fill={dark ? '#FFFFFF' : '#1B1F1D'} />
        <path
          d="M20 9c-5.2 0-9 3.7-9 8.6 0 4 2.6 6.9 6.1 9.2l2.4 5.4a.6.6 0 0 0 1.1 0l2.4-5.4c3.5-2.3 6.1-5.2 6.1-9.2C29 12.7 25.2 9 20 9Z"
          fill="none"
          stroke={dark ? '#1B1F1D' : '#F1F6F1'}
          strokeWidth="1.6"
          opacity="0.55"
        />
        <path
          d="M9.5 20.5h4l1.8-3.4 2.2 6.6 2-4.2 1.6 2.6h5.9"
          fill="none"
          stroke={dark ? '#245537' : '#9AC3A0'}
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {withWordmark && (
        <span className={`font-display text-[17px] font-semibold tracking-tight ${dark ? 'text-white' : 'text-ink'}`}>
          MastiSense <span className={dark ? 'text-white/70 font-medium' : 'text-ink-soft font-medium'}>AI</span>
        </span>
      )}
    </div>
  )
}
