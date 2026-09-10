import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  HeartPulse,
  Shield,
  AlertTriangle,
  BarChart3,
  Stethoscope,
  Cpu,
  Settings as SettingsIcon,
  Sparkles,
  MapPin,
  PawPrint,
} from 'lucide-react'

// Section-adaptive icon mapping per Requirement 3
const SECTION_GLYPHS = {
  '/dashboard': { icon: HeartPulse, label: 'Overview', color: '#2F6B44', bg: '#EBF4ED' },
  '/animals': { icon: Shield, label: 'Risk Dossier', color: '#C4571F', bg: '#FDF0E9' },
  '/forecast': { icon: Sparkles, label: 'AI Forecast', color: '#2B5FA8', bg: '#EDF3FB' },
  '/alerts': { icon: AlertTriangle, label: 'Alerts', color: '#B23A34', bg: '#FDEEEF' },
  '/analytics': { icon: BarChart3, label: 'Analytics', color: '#0F766E', bg: '#E6F4F2' },
  '/recommendations': { icon: Stethoscope, label: 'Veterinary', color: '#047857', bg: '#E6F7F0' },
  '/iot': { icon: Cpu, label: 'Sensors / Edge', color: '#6366F1', bg: '#EEF2FF' },
  '/map': { icon: MapPin, label: 'Farm Clusters', color: '#854D0E', bg: '#FEF9C3' },
  '/settings': { icon: SettingsIcon, label: 'Settings', color: '#475569', bg: '#F1F5F9' },
}

export default function Logo({
  size = 32,
  withWordmark = true,
  tone = 'default',
  showSectionBadge = true,
  useGraphic = false,
  to = null,
  className = '',
}) {
  let pathname = '/dashboard'
  try {
    const loc = useLocation()
    if (loc?.pathname) pathname = loc.pathname
  } catch (e) {
    // Outside router fallback
  }

  // Find matching section glyph
  const matchingKey = Object.keys(SECTION_GLYPHS).find((key) =>
    pathname === key || (key !== '/dashboard' && pathname.startsWith(key))
  )
  const activeSection = SECTION_GLYPHS[matchingKey] || SECTION_GLYPHS['/dashboard']
  const SectionIcon = activeSection.icon
  const dark = tone === 'light'

  let content = null

  if (useGraphic) {
    content = (
      <div className={`flex items-center gap-3 ${className}`}>
        <img
          src="/agrinex-logo.png"
          alt="AgriNex AI - Smart Farming · Healthier Livestock"
          className="h-10 w-auto max-w-[160px] object-contain drop-shadow-sm sm:h-12"
        />
        {showSectionBadge && (
          <span
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
            style={{ backgroundColor: activeSection.bg, color: activeSection.color }}
            title={`Active Section: ${activeSection.label}`}
          >
            <SectionIcon size={12} />
            <span>{activeSection.label}</span>
          </span>
        )}
      </div>
    )
  } else {
    content = (
      <div className={`flex items-center gap-2.5 ${className}`}>
        {/* Dynamic Section-Adaptive Icon Mark */}
        <div
          className="relative flex items-center justify-center rounded-lg transition-transform duration-300 hover:scale-105"
          style={{
            width: size + 8,
            height: size + 8,
            backgroundColor: dark ? '#1E2922' : activeSection.bg,
            border: `1.5px solid ${dark ? 'rgba(255,255,255,0.15)' : activeSection.color + '40'}`,
          }}
        >
          <SectionIcon
            size={Math.max(16, size - 10)}
            style={{ color: dark ? '#86EFAC' : activeSection.color }}
            strokeWidth={2.2}
          />
        </div>

        {withWordmark && (
          <div className="flex flex-col leading-none">
            <div className="flex items-center gap-1.5">
              <span className={`font-display text-[17px] font-bold tracking-tight ${dark ? 'text-white' : 'text-ink'}`}>
                AgriNex <span className={dark ? 'text-pasture-400 font-semibold' : 'text-pasture-700 font-semibold'}>AI</span>
              </span>
            </div>
            {showSectionBadge && (
              <span className="text-[10px] font-medium tracking-wide uppercase mt-0.5 text-ink-faint">
                {activeSection.label} Mode
              </span>
            )}
          </div>
        )}
      </div>
    )
  }

  if (to) {
    return (
      <Link
        to={to}
        title="Return to Dashboard Home"
        aria-label="Return to Dashboard Home"
        className="inline-flex cursor-pointer transition-transform hover:scale-[1.02] active:scale-98"
      >
        {content}
      </Link>
    )
  }

  return content
}
