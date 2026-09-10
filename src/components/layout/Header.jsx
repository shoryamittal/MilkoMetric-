import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, ChevronDown, Globe, Menu, MapPin, Wifi, WifiOff, RefreshCw, LogOut, User } from 'lucide-react'
import { useApp } from '../../context/AppContext.jsx'
import { LANGUAGES } from '../../utils/translations.js'
import Badge from '../common/Badge.jsx'
import Logo from '../common/Logo.jsx'

function timeAgo(min) {
  if (min < 1) return 'Just now'
  if (min < 60) return `${min} min ago`
  const h = Math.floor(min / 60)
  return `${h} hr${h > 1 ? 's' : ''} ago`
}

const SEV_TONE = { critical: 'critical', high: 'high', moderate: 'moderate', ok: 'ok' }

export default function Header({ onOpenMobileNav, title, subtitle }) {
  const navigate = useNavigate()
  const {
    auth,
    userInitials,
    logout,
    notifications,
    markNotificationsRead,
    language,
    setLanguage,
    networkStatus,
    lastSyncTime,
    pendingRecords,
    toggleNetworkStatus,
    currentFarm,
    refreshTelemetry,
  } = useApp()

  const [notifOpen, setNotifOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const unread = notifications.filter((n) => !n.read).length

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleRefresh = () => {
    setRefreshing(true)
    refreshTelemetry()
    setTimeout(() => setRefreshing(false), 700)
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-line bg-canvas-raised/95 px-4 backdrop-blur sm:px-6">
      {/* Left side: mobile menu + Logo / Section context */}
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3 mr-2">
        <button
          onClick={onOpenMobileNav}
          className="shrink-0 rounded-md p-1.5 text-ink-soft hover:bg-canvas-sunken lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        {/* Section Adaptive Logo in Header */}
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <div className="shrink-0">
            <Logo size={28} withWordmark={false} showSectionBadge={false} />
          </div>
          <div className="min-w-0 flex-1">
            {title ? (
              <>
                <h1 className="truncate font-display text-sm font-semibold leading-tight text-ink sm:text-base">
                  {title}
                </h1>
                {subtitle && <p className="hidden truncate text-xs text-ink-soft sm:block">{subtitle}</p>}
              </>
            ) : (
              <div className="min-w-0">
                <p className="text-[12.5px] sm:text-[13px] font-semibold leading-tight text-ink truncate">{currentFarm?.name || 'Shiv Dairy Farm'}</p>
                <p className="flex items-center gap-1 text-[10.5px] sm:text-[11px] text-ink-soft truncate">
                  <MapPin size={10} className="shrink-0" /> <span className="truncate">{currentFarm?.location || 'Pune, Maharashtra'}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right side controls: Refresh + Offline Sync + Language + Notifications + User Avatar */}
      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        {/* Real-time Telemetry Refresh Button */}
        <button
          onClick={handleRefresh}
          title="Refresh real-time telemetry (temperatures, THI, milk EC, and ESP32 nodes)"
          className={`flex h-8 w-8 sm:h-auto sm:w-auto items-center justify-center gap-1.5 rounded-full border border-line bg-canvas sm:px-2.5 sm:py-1 text-xs font-semibold text-ink shadow-sm hover:bg-canvas-sunken hover:border-pasture-500 transition-all active:scale-95 ${
            refreshing ? 'opacity-70 pointer-events-none' : ''
          }`}
        >
          <RefreshCw size={12} className={`text-pasture-700 shrink-0 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="hidden md:inline">
            {language === 'hi' ? 'रिफ्रेश' : language === 'mr' ? 'ताजे करा' : 'Refresh Telemetry'}
          </span>
        </button>

        {/* Interactive Offline-First Sync Indicator (Requirement 13) */}
        <button
          onClick={toggleNetworkStatus}
          title="Click to simulate Online / Offline transition & Edge Store-and-Forward sync"
          className={`flex h-8 w-8 sm:h-auto sm:w-auto items-center justify-center gap-1.5 rounded-full sm:px-2.5 sm:py-1 text-xs font-medium transition-all ${
            networkStatus === 'online'
              ? 'border border-pasture-500/30 bg-pasture-50 text-pasture-800 hover:bg-pasture-100'
              : networkStatus === 'offline'
              ? 'border border-signal-amber/40 bg-signal-amberSoft text-signal-amber hover:bg-signal-amber/15'
              : 'border border-signal-blue/40 bg-signal-blueSoft text-signal-blue'
          }`}
        >
          {networkStatus === 'online' && (
            <>
              <span className="h-2 w-2 rounded-full bg-pasture-600 animate-pulse shrink-0" />
              <span className="hidden sm:inline">Online</span>
              <span className="hidden md:inline text-[10px] opacity-75">· {lastSyncTime}</span>
            </>
          )}
          {networkStatus === 'offline' && (
            <>
              <WifiOff size={12} className="text-signal-amber shrink-0" />
              <span className="hidden sm:inline">Offline Edge</span>
              {pendingRecords > 0 && (
                <span className="rounded bg-signal-amber px-1 text-[9.5px] font-bold text-white">
                  {pendingRecords}
                </span>
              )}
            </>
          )}
          {networkStatus === 'syncing' && (
            <>
              <RefreshCw size={12} className="animate-spin text-signal-blue shrink-0" />
              <span className="hidden sm:inline">Syncing...</span>
            </>
          )}
        </button>

        {/* 3-Language Selector (Requirement 18: English, Hindi, Marathi) */}
        <div className="relative">
          <button
            onClick={() => {
              setLangOpen((o) => !o)
              setNotifOpen(false)
              setProfileOpen(false)
            }}
            className="flex items-center gap-1 rounded-md border border-line bg-canvas-raised px-2 py-1.5 sm:px-2.5 text-xs font-semibold text-ink hover:bg-canvas-sunken"
            aria-label="Change language"
          >
            <Globe size={13} className="text-pasture-700" />
            <span className="uppercase text-[11px] sm:text-xs">{language}</span>
            <ChevronDown size={11} className="hidden sm:inline text-ink-faint" />
          </button>
          {langOpen && (
            <div className="fixed inset-x-4 top-16 z-50 sm:absolute sm:inset-auto sm:right-0 sm:top-11 sm:w-36 overflow-hidden rounded-md border border-line bg-canvas-raised py-1 shadow-2xl">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLanguage(l.code)
                    setLangOpen(false)
                  }}
                  className={`flex w-full items-center justify-between px-3 py-2 sm:py-1.5 text-left text-sm hover:bg-canvas-sunken ${
                    language === l.code ? 'font-semibold text-pasture-700' : 'text-ink'
                  }`}
                >
                  {l.label}
                  {language === l.code && <span className="h-1.5 w-1.5 rounded-full bg-pasture-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setNotifOpen((o) => !o)
              setLangOpen(false)
              setProfileOpen(false)
              if (!notifOpen) markNotificationsRead()
            }}
            className="relative rounded-md p-1.5 sm:p-2 text-ink-soft hover:bg-canvas-sunken"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-signal-red text-[9px] font-bold text-white">
                {unread}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className="fixed inset-x-3 top-16 z-50 sm:absolute sm:inset-auto sm:right-0 sm:top-11 sm:w-80 overflow-hidden rounded-md border border-line bg-canvas-raised shadow-2xl">
              <div className="border-b border-line px-3.5 py-2.5 text-sm font-semibold text-ink">
                Notifications
              </div>
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

        {/* Dynamic User Avatar & Profile Dropdown (Requirement 4) */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileOpen((o) => !o)
              setLangOpen(false)
              setNotifOpen(false)
            }}
            className="flex items-center gap-2 rounded-full p-0.5 hover:ring-2 hover:ring-pasture-500/40 transition-all"
            aria-label="User Profile"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-pasture-800 to-pasture-600 text-xs font-bold text-white shadow-sm">
              {userInitials}
            </div>
            <span className="hidden font-medium text-xs text-ink max-w-[110px] truncate sm:inline">
              {auth.name || 'Guest'}
            </span>
          </button>

          {profileOpen && (
            <div className="fixed inset-x-4 top-16 z-50 sm:absolute sm:inset-auto sm:right-0 sm:top-11 sm:w-52 overflow-hidden rounded-md border border-line bg-canvas-raised py-1.5 shadow-2xl">
              <div className="border-b border-line px-3.5 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Signed in as</p>
                <p className="font-display text-sm font-bold text-ink truncate">{auth.name || 'Guest'}</p>
                <p className="text-[11px] text-pasture-700 font-medium">Initials: {userInitials}</p>
              </div>

              <div className="p-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded px-3 py-2 text-xs font-semibold text-signal-red hover:bg-signal-redSoft transition-colors"
                >
                  <LogOut size={13} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
