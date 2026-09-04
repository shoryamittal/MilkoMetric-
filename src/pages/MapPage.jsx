import 'leaflet/dist/leaflet.css'
import React, { useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Link } from 'react-router-dom'
import { HERD_SUMMARY } from '../data/animals.js'

const FARMS = [
  {
    id: 'shiv', name: 'Shiv Dairy Farm', place: 'Pune, Maharashtra', lat: 18.5204, lng: 73.8567,
    animals: HERD_SUMMARY.total, highRisk: HERD_SUMMARY.high + HERD_SUMMARY.critical,
    herdRisk: Math.round(((HERD_SUMMARY.high + HERD_SUMMARY.critical) / HERD_SUMMARY.total) * 100) + 6,
    severity: 'critical', latestAlert: 'COW-024', isPrimary: true,
  },
  { id: 'nashik', name: 'Godavari Dairy Co-op', place: 'Nashik, Maharashtra', lat: 19.9975, lng: 73.7898, animals: 84, highRisk: 3, herdRisk: 9, severity: 'low', latestAlert: 'COW-041' },
  { id: 'kolhapur', name: 'Panchganga Farms', place: 'Kolhapur, Maharashtra', lat: 16.705, lng: 74.2433, animals: 96, highRisk: 6, herdRisk: 14, severity: 'moderate', latestAlert: 'COW-018' },
  { id: 'nagpur', name: 'Vidarbha Milk Union', place: 'Nagpur, Maharashtra', lat: 21.1458, lng: 79.0882, animals: 112, highRisk: 9, herdRisk: 19, severity: 'high', latestAlert: 'COW-057' },
  { id: 'aurangabad', name: 'Ajanta Dairy Farm', place: 'Chhatrapati Sambhajinagar, Maharashtra', lat: 19.8762, lng: 75.3433, animals: 70, highRisk: 1, herdRisk: 5, severity: 'low', latestAlert: 'COW-009' },
]

const SEVERITY_COLOR = { low: '#3E7C52', moderate: '#B3690E', high: '#C4571F', critical: '#7E1F1B' }
const SEVERITY_LABEL = { low: 'Low', moderate: 'Moderate', high: 'High', critical: 'Critical' }

function markerIcon(severity, isPrimary) {
  const color = SEVERITY_COLOR[severity]
  const size = isPrimary ? 26 : 20
  return L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;border-radius:9999px;background:${color};border:3px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.35);${isPrimary ? 'outline:2px solid ' + color + '55;' : ''}"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function FlyToFarm({ farm }) {
  const map = useMap()
  React.useEffect(() => {
    if (farm) map.flyTo([farm.lat, farm.lng], 8, { duration: 0.6 })
  }, [farm, map])
  return null
}

export default function MapPage() {
  const [selected, setSelected] = useState(FARMS[0])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {Object.entries(SEVERITY_LABEL).map(([key, label]) => (
          <span key={key} className="flex items-center gap-1.5 rounded-sm border border-line bg-canvas-raised px-2.5 py-1 text-xs text-ink-soft">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: SEVERITY_COLOR[key] }} /> {label}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="overflow-hidden rounded-lg border border-line shadow-card lg:col-span-8">
          <MapContainer center={[19.4, 76.0]} zoom={6.4} style={{ height: '560px', width: '100%' }} scrollWheelZoom={false}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FlyToFarm farm={selected} />
            {FARMS.map((farm) => (
              <Marker
                key={farm.id}
                position={[farm.lat, farm.lng]}
                icon={markerIcon(farm.severity, farm.isPrimary)}
                eventHandlers={{ click: () => setSelected(farm) }}
              >
                <Popup>
                  <div className="min-w-[180px]">
                    <p className="font-semibold text-ink">{farm.name}</p>
                    <p className="text-xs text-ink-soft">{farm.animals} animals · High Risk: {farm.highRisk}</p>
                    <p className="text-xs text-ink-soft">Herd Risk: {farm.herdRisk}%</p>
                    <p className="mt-1 text-xs text-ink-soft">Latest Alert: {farm.latestAlert}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div className="space-y-3 lg:col-span-4">
          {FARMS.map((farm) => (
            <button
              key={farm.id}
              onClick={() => setSelected(farm)}
              className={`w-full rounded-lg border bg-canvas-raised p-4 text-left shadow-card transition-colors ${
                selected?.id === farm.id ? 'border-pasture-500' : 'border-line hover:bg-canvas-sunken'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-display text-[15px] font-semibold text-ink">{farm.name}</p>
                  <p className="text-xs text-ink-soft">{farm.place}</p>
                </div>
                <span className="rounded-sm border px-2 py-0.5 text-[10px] font-semibold" style={{ color: SEVERITY_COLOR[farm.severity], borderColor: `${SEVERITY_COLOR[farm.severity]}40`, background: `${SEVERITY_COLOR[farm.severity]}14` }}>
                  {SEVERITY_LABEL[farm.severity].toUpperCase()}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="font-display text-sm font-semibold text-ink tabular">{farm.animals}</p>
                  <p className="text-[10px] text-ink-faint">Animals</p>
                </div>
                <div>
                  <p className="font-display text-sm font-semibold text-signal-red tabular">{farm.highRisk}</p>
                  <p className="text-[10px] text-ink-faint">High Risk</p>
                </div>
                <div>
                  <p className="font-display text-sm font-semibold text-ink tabular">{farm.herdRisk}%</p>
                  <p className="text-[10px] text-ink-faint">Herd Risk</p>
                </div>
              </div>
              {farm.isPrimary && (
                <Link to="/dashboard" className="mt-3 block text-center text-xs font-semibold text-pasture-700 hover:text-pasture-600">
                  Open Dashboard →
                </Link>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
