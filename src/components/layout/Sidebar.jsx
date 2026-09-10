import React, { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import {
  LayoutGrid, PawPrint, Radar, BellRing, Wifi, Map, BarChart3, ClipboardList, Settings, MapPin, ChevronsUpDown,
} from 'lucide-react'
import Logo from '../common/Logo.jsx'
import { useApp } from '../../context/AppContext.jsx'
import { SECTIONS } from '../../data/navigation.js'

// Re-export for compatibility
export { SECTIONS }

function NavItem({ to, label, icon: Icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `group flex items-center gap-2.5 rounded-sm px-3 py-2 text-[13.5px] font-medium transition-colors ${
          isActive ? 'bg-pasture-700 text-white' : 'text-white/65 hover:bg-white/[0.06] hover:text-white'
        }`
      }
    >
      <Icon size={17} strokeWidth={1.8} />
      {label}
    </NavLink>
  )
}

export default function Sidebar() {
  const { t, currentFarm, farmsList, switchFarm } = useApp()
  const [farmPickerOpen, setFarmPickerOpen] = useState(false)

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[236px] flex-col bg-ink lg:flex">
      {/* Official Graphic Logo in Sidebar Header */}
      <div className="flex h-18 items-center px-4 pt-3.5 pb-2">
        <Link
          to="/dashboard"
          title="Return to Dashboard Home"
          className="flex items-center justify-center rounded-xl bg-white px-3 py-1.5 shadow-sm border border-white/20 w-full transition-transform hover:scale-[1.02] active:scale-98 cursor-pointer"
          aria-label="Return to Dashboard Home"
        >
          <img
            src="/agrinex-logo.png"
            alt="AgriNex AI - Smart Farming · Healthier Livestock"
            className="h-8.5 w-auto max-w-[155px] object-contain"
          />
        </Link>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-4 pt-2 no-scrollbar">
        {SECTIONS.map((section) => (
          <div key={section.key}>
            <p className="px-3 pb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.09em] text-white/35">
              {t(section.key)}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavItem key={item.to} to={item.to} icon={item.icon} label={t(item.tKey) || item.label} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Interactive Farm Switcher */}
      <div className="relative m-3 rounded-md border border-white/10 bg-white/[0.04] p-3">
        <p className="text-[10.5px] font-semibold uppercase tracking-wide text-white/40">Demo Farm</p>
        <p className="mt-1 text-[13.5px] font-semibold text-white truncate">{currentFarm?.name || 'Shiv Dairy Farm'}</p>
        <p className="flex items-center gap-1 text-xs text-white/55 truncate">
          <MapPin size={11} className="shrink-0" /> {currentFarm?.location || 'Pune, Maharashtra'}
        </p>

        <button
          onClick={() => setFarmPickerOpen(!farmPickerOpen)}
          className="mt-2.5 flex w-full items-center justify-between rounded-sm border border-white/15 bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition-colors shadow-sm"
        >
          <span>Switch Farm</span>
          <ChevronsUpDown size={13} />
        </button>

        {/* Farm Switcher Dropdown Menu */}
        {farmPickerOpen && (
          <div className="absolute bottom-full left-0 right-0 mb-2 rounded-lg border border-white/20 bg-[#1A231E] p-2 shadow-2xl z-50 space-y-1.5">
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
                  }}
                  className={`flex w-full items-start justify-between rounded-md p-2 text-left text-xs transition-colors ${
                    isSelected
                      ? 'bg-pasture-700 text-white font-semibold ring-1 ring-pasture-400'
                      : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate leading-snug">{farm.name}</p>
                    <p className="text-[10.5px] text-white/60 truncate">{farm.location}</p>
                  </div>
                  <span className="ml-1.5 shrink-0 rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-mono">
                    {farm.totalAnimals} cows
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </aside>
  )
}
