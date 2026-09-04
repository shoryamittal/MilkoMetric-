import React from 'react'
import { NavLink } from 'react-router-dom'
import { X, LayoutGrid, PawPrint, BellRing, Radar } from 'lucide-react'
import Logo from '../common/Logo.jsx'
import { SECTIONS } from './Sidebar.jsx'
import { useApp } from '../../context/AppContext.jsx'

export function MobileDrawer({ open, onClose }) {
  const { t } = useApp()
  if (!open) return null
  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="absolute inset-y-0 left-0 flex w-[78%] max-w-xs flex-col bg-ink shadow-pop">
        <div className="flex h-16 items-center justify-between px-5">
          <Logo tone="light" />
          <button onClick={onClose} className="rounded-sm p-1.5 text-white/70 hover:bg-white/10" aria-label="Close menu">
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-6 pt-2">
          {SECTIONS.map((section) => (
            <div key={section.key}>
              <p className="px-3 pb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.09em] text-white/35">{t(section.key)}</p>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 rounded-sm px-3 py-2.5 text-[14px] font-medium ${
                        isActive ? 'bg-pasture-700 text-white' : 'text-white/70 hover:bg-white/10'
                      }`
                    }
                  >
                    <item.icon size={18} strokeWidth={1.8} />
                    {t(item.tKey) || item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
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
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-canvas-raised/95 backdrop-blur lg:hidden">
      {BOTTOM_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-1 py-2.5 text-[10.5px] font-medium ${
              isActive ? 'text-pasture-700' : 'text-ink-faint'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <item.icon size={19} strokeWidth={isActive ? 2.1 : 1.7} />
              {item.label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
