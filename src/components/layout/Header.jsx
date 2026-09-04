import React, { useState } from 'react'
import { Bell, ChevronDown, Globe, Menu, MapPin, ShieldCheck } from 'lucide-react'
import { useApp } from '../../context/AppContext.jsx'
import { LANGUAGES } from '../../utils/translations.js'
import Badge from '../common/Badge.jsx'

function timeAgo(min) {
  if (min < 1) return 'Just now'
  if (min < 60) return `${min} min ago`
  const h = Math.floor(min / 60)
  return `${h} hr${h > 1 ? 's' : ''} ago`
}

const SEV_TONE = { critical: 'critical', high: 'high', moderate: 'moderate', ok: 'ok' }

export default function Header({ onOpenMobileNav, title, subtitle }) {
  const { notifications, markNotificationsRead, language, setLanguage } = useApp()
  const [notifOpen, setNotifOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const unread = notifications.filter((n) => !n.read).length

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-line bg-canvas/90 px-4 backdrop-blur sm:px-6 lg:pl-6">
      <div className="flex min-w-0 items-center gap-3">
        <button onClick={onOpenMobileNav} className="rounded-sm p-1.5 text-ink-soft hover:bg-canvas-sunken lg:hidden" aria-label="Open menu">
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          {title ? (
            <>
              <h1 className="truncate font-display text-[15px] font-semibold leading-tight text-ink sm:text-base">{title}</h1>
              {subtitle && <p className="hidden truncate text-xs text-ink-soft sm:block">{subtitle}</p>}
            </>
          ) : (
            <button className="flex items-center gap-1.5 rounded-sm py-1 text-left hover:opacity-80">
              <div>
                <p className="text-[13px] font-semibold leading-tight text-ink">Shiv Dairy Farm</p>
                <p className="flex items-center gap-1 text-[11px] text-ink-soft">
                  <MapPin size={10} /> Pune, Maharashtra
                </p>
              </div>
              <ChevronDown size={14} className="text-ink-faint" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2.5">
        <div className="hidden items-center gap-1.5 rounded-sm border border-line bg-canvas-raised px-2.5 py-1.5 text-[11px] font-medium text-ink-soft md:flex">
          <ShieldCheck size={13} className="text-pasture-600" />
          Farm Data Protected
        </div>

        <div className="relative">
          <button
            onClick={() => { setLangOpen((o) => !o); setNotifOpen(false) }}
            className="flex items-center gap-1 rounded-sm p-2 text-ink-soft hover:bg-canvas-sunken"
            aria-label="Change language"
          >
            <Globe size={18} />
          </button>
          {langOpen && (
            <div className="absolute right-0 top-11 z-30 w-36 overflow-hidden rounded-md border border-line bg-canvas-raised py-1 shadow-pop">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => { setLanguage(l.code); setLangOpen(false) }}
                  className={`flex w-full items-center justify-between px-3 py-1.5 text-left text-sm hover:bg-canvas-sunken ${
                    language === l.code ? 'font-semibold text-pasture-700' : 'text-ink'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => { setNotifOpen((o) => !o); setLangOpen(false); if (!notifOpen) markNotificationsRead() }}
            className="relative rounded-sm p-2 text-ink-soft hover:bg-canvas-sunken"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-signal-red text-[9px] font-bold text-white">
                {unread}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-11 z-30 w-80 max-w-[90vw] overflow-hidden rounded-md border border-line bg-canvas-raised shadow-pop">
              <div className="border-b border-line px-3.5 py-2.5 text-sm font-semibold text-ink">Notifications</div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="flex items-start gap-2.5 border-b border-line/70 px-3.5 py-2.5 last:border-0">
                    <Badge tone={SEV_TONE[n.severity] || 'neutral'} dot />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] leading-snug text-ink">{n.text}</p>
                      <p className="mt-0.5 text-[11px] text-ink-faint">{timeAgo(n.minutesAgo)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="hidden h-8 w-8 items-center justify-center rounded-full bg-pasture-700 text-xs font-semibold text-white sm:flex">
          SF
        </div>
      </div>
    </header>
  )
}
