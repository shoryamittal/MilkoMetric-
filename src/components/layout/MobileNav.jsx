import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { X, LayoutGrid, PawPrint, BellRing, Radar, MapPin, ChevronsUpDown } from 'lucide-react'
import Logo from '../common/Logo.jsx'
import { SECTIONS } from '../../data/navigation.js'
import { useApp } from '../../context/AppContext.jsx'

export function MobileDrawer({ open, onClose }) {
  const { t, currentFarm, farmsList, switchFarm } = useApp()
  const [farmPickerOpen, setFarmPickerOpen] = useState(false)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-xs" onClick={onClose} />
      <div className="absolute inset-y-0 left-0 flex w-[82%] max-w-xs flex-col bg-ink shadow-2xl">
        <div className="flex h-18 items-center justify-between px-4 pt-3 pb-2 border-b border-white/10">
          <div className="flex items-center justify-center rounded-xl bg-white px-3 py-1.5 shadow-sm border border-white/20">
            <img
              src="/agrinex-logo.png"
              alt="AgriNex AI"
              className="h-8 w-auto max-w-[135px] object-contain"
            />
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-white/70 hover:bg-white/10 active:scale-95" aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4 pt-3 no-scrollbar">
          {SECTIONS.map((section) => (
            <div key={section.key}>
              <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.09em] text-white/40">{t(section.key)}</p>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 rounded-md px-3 py-2 text-[13.5px] font-medium transition-colors ${
                        isActive ? 'bg-pasture-700 text-white font-semibold shadow-sm' : 'text-white/75 hover:bg-white/10'
                      }`
                    }
                  >
                    <item.icon size={17} strokeWidth={1.8} />
                    {t(item.tKey) || item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Mobile Farm Switcher at bottom of drawer */}
        <div className="relative border-t border-white/10 bg-white/[0.03] p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Active Facility</p>
          <p className="mt-0.5 text-[13px] font-semibold text-white truncate">{currentFarm?.name || 'Shiv Dairy Farm'}</p>
          <p className="flex items-center gap-1 text-[11px] text-white/60 truncate">
            <MapPin size={10} className="shrink-0" /> {currentFarm?.location || 'Pune, Maharashtra'}
          </p>

          <button
            onClick={() => setFarmPickerOpen(!farmPickerOpen)}
            className="mt-2 flex w-full items-center justify-between rounded-md border border-white/15 bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-white/20 active:scale-98 transition-colors"
          >
            <span>Switch Facility</span>
            <ChevronsUpDown size={13} />
          </button>

          {farmPickerOpen && (
            <div className="absolute bottom-full left-2 right-2 mb-2 rounded-lg border border-white/20 bg-[#1A231E] p-1.5 shadow-2xl z-50 space-y-1">
              <p className="px-2 pt-1 text-[10px] font-semibold uppercase tracking-wider text-white/40">
                Select Dairy Facility:
              </p>
              {farmsList?.map((farm) => {
                const isSelected = farm.id === currentFarm?.id
                return (
                  <button
                    key={farm.id}
                    onClick={() => {
                      switchFarm(farm.id)
                      setFarmPickerOpen(false)
                      onClose()
                    }}
                    className={`flex w-full items-start justify-between rounded-md p-2 text-left text-xs transition-colors ${
                      isSelected
                        ? 'bg-pasture-700 text-white font-semibold'
                        : 'text-white/80 hover:bg-white/10'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate leading-snug">{farm.name}</p>
                      <p className="text-[10px] text-white/60 truncate">{farm.location}</p>
                    </div>
                    <span className="ml-1 shrink-0 rounded bg-white/10 px-1 py-0.5 text-[9.5px] font-mono">
                      {farm.totalAnimals}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const BOTTOM_ITEMS = [
  { to: '/dashboard', label: 'Home', icon: LayoutGrid },
  { to: '/animals', label: 'Animals', icon: PawPrint },
  { to: '/forecast', label: 'Forecast', icon: Radar },
  { to: '/alerts', label: 'Alerts', icon: BellRing },
]

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-line bg-canvas-raised/95 backdrop-blur px-1 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.04)]">
      {BOTTOM_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-0.5 py-0.5 text-[10.5px] font-medium transition-colors ${
              isActive ? 'text-pasture-800 font-semibold' : 'text-ink-soft hover:text-ink'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={`flex h-7 w-12 items-center justify-center rounded-full transition-all ${
                  isActive ? 'bg-pasture-100 text-pasture-800 shadow-xs' : 'text-ink-soft'
                }`}
              >
                <item.icon size={18} strokeWidth={isActive ? 2.2 : 1.7} />
              </span>
              <span className="leading-tight">{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
