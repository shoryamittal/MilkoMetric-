import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutGrid, PawPrint, Radar, BellRing, Wifi, Map, BarChart3, ClipboardList, Settings, MapPin, ChevronsUpDown,
} from 'lucide-react'
import Logo from '../common/Logo.jsx'
import { useApp } from '../../context/AppContext.jsx'

export const SECTIONS = [
  {
    key: 'main',
    items: [
      { to: '/dashboard', tKey: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
      { to: '/animals', tKey: 'animals', label: 'Animals', icon: PawPrint },
      { to: '/forecast', tKey: 'aiForecast', label: 'AI Forecast', icon: Radar },
    ],
  },
  {
    key: 'monitoring',
    items: [
      { to: '/alerts', tKey: 'alerts', label: 'Alerts', icon: BellRing },
      { to: '/iot', tKey: 'iotMonitoring', label: 'IoT Monitoring', icon: Wifi },
      { to: '/map', tKey: 'farmMap', label: 'Farm Map', icon: Map },
    ],
  },
  {
    key: 'insights',
    items: [
      { to: '/analytics', tKey: 'analytics', label: 'Analytics', icon: BarChart3 },
      { to: '/recommendations', tKey: 'recommendations', label: 'Recommendations', icon: ClipboardList },
    ],
  },
  {
    key: 'system',
    items: [{ to: '/settings', tKey: 'settings', label: 'Settings', icon: Settings }],
  },
]

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
  const { t } = useApp()
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[236px] flex-col bg-ink lg:flex">
      <div className="flex h-16 items-center px-5">
        <Logo tone="light" />
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
      <div className="m-3 rounded-md border border-white/10 bg-white/[0.04] p-3">
        <p className="text-[10.5px] font-semibold uppercase tracking-wide text-white/40">Demo Farm</p>
        <p className="mt-1.5 text-[13px] font-medium text-white">Shiv Dairy Farm</p>
        <p className="flex items-center gap-1 text-xs text-white/55">
          <MapPin size={11} /> Pune, Maharashtra
        </p>
        <button className="mt-2.5 flex w-full items-center justify-between rounded-sm border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-white/80 hover:bg-white/10">
          Switch Farm
          <ChevronsUpDown size={13} />
        </button>
      </div>
    </aside>
  )
}
