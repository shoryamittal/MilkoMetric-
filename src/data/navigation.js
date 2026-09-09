import {
  LayoutGrid,
  PawPrint,
  Radar,
  BellRing,
  Wifi,
  Map,
  BarChart3,
  ClipboardList,
  Settings,
} from 'lucide-react'

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
