import { ANIMALS } from './animals.js'

function mulberry32(seed) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rand = mulberry32(77123)

export const DEVICE_COUNTS = {
  animalsConnected: 128,
  wearables: 42,
  milkSensors: 8,
  environmentalSensors: 6,
}

const wearableAnimals = [
  ...ANIMALS.filter((a) => a.species === 'Cow').slice(0, 24),
  ...ANIMALS.filter((a) => a.species === 'Buffalo').slice(0, 12),
  ...ANIMALS.filter((a) => a.species === 'Goat').slice(0, 6),
]
export const DEVICES = [
  ...wearableAnimals.map((a, i) => ({
    id: `ESP32-${a.id}`,
    type: `ESP32 Bio-Telemetry (${a.speciesEmoji} ${a.species})`,
    target: `${a.id} (${a.breed})`,
    battery: Math.round(40 + rand() * 58),
    connection: rand() > 0.06 ? 'Connected' : 'Weak Signal',
    lastUpdateSec: Math.round(5 + rand() * 90),
  })),
  ...Array.from({ length: 8 }).map((_, i) => ({
    id: `EC-PROBE-${String(i + 1).padStart(2, '0')}`,
    type: 'In-Line Milk EC Probe',
    target: `Milking Bay ${i + 1}`,
    battery: Math.round(55 + rand() * 44),
    connection: 'Connected',
    lastUpdateSec: Math.round(5 + rand() * 40),
  })),
  ...Array.from({ length: 6 }).map((_, i) => ({
    id: `THI-ENV-${String(i + 1).padStart(2, '0')}`,
    type: 'Shed THI Sensor (LoRaWAN)',
    target: ['Shed A (Main)', 'Shed B (Calving)', 'Milking Parlour', 'Feed Yard', 'Water Trough', 'Bedding Area'][i],
    battery: Math.round(60 + rand() * 39),
    connection: 'Connected',
    lastUpdateSec: Math.round(5 + rand() * 25),
  })),
]

export const LIVE_ENVIRONMENT = {
  farmTemperature: 31.4,
  humidity: 72,
  milkTemperature: 38.6,
  avgConductivity: 5.4,
  thiIndex: 78.4,
  environmentalRisk: 'Moderate Heat Stress (THI 78.4)',
}

export const NOTIFICATIONS = [
  { id: 'n1', severity: 'critical', text: 'COW-024 entered High Risk', minutesAgo: 2, read: false },
  { id: 'n2', severity: 'high', text: '3 animals showing elevated SCC', minutesAgo: 18, read: false },
  { id: 'n3', severity: 'moderate', text: 'Farm humidity above threshold', minutesAgo: 60, read: false },
  { id: 'n4', severity: 'ok', text: 'Daily herd report generated', minutesAgo: 180, read: true },
]
