import { computeRiskScore, bandForScore, predictedWindowForBand } from '../utils/riskCalculator.js'

// Deterministic PRNG so the demo dataset looks the same on every load.
function mulberry32(seed) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rand = mulberry32(19840512)
const between = (min, max) => min + rand() * (max - min)
const pick = (arr) => arr[Math.floor(rand() * arr.length)]

export const COW_BREEDS = ['Gir', 'Sahiwal', 'Red Sindhi', 'Tharparkar', 'Jersey', 'Holstein Friesian']
export const BUFFALO_BREEDS = ['Murrah', 'Mehsana', 'Jaffarabadi', 'Surti', 'Nili-Ravi']
export const GOAT_BREEDS = ['Jamnapari', 'Barbari', 'Sirohi', 'Beetal', 'Osmanabadi']
export const BREEDS = [...COW_BREEDS, ...BUFFALO_BREEDS, ...GOAT_BREEDS]
export const SPECIES_LIST = ['All', 'Cow', 'Buffalo', 'Goat']

// Target herd composition — matches the dashboard KPI breakdown exactly.
// none: 78, low: 31, moderate: 7, high: 10, critical: 2  => 128 total
const TIER_PLAN = [
  ...Array(78).fill('none'),
  ...Array(31).fill('low'),
  ...Array(7).fill('moderate'),
  ...Array(10).fill('high'),
  ...Array(2).fill('critical'),
]
// shuffle deterministically
for (let i = TIER_PLAN.length - 1; i > 0; i--) {
  const j = Math.floor(rand() * (i + 1))
  ;[TIER_PLAN[i], TIER_PLAN[j]] = [TIER_PLAN[j], TIER_PLAN[i]]
}
// COW-024 (index 23) is the pinned SIH demo cow
if (TIER_PLAN[23] !== 'high') {
  const swapIdx = TIER_PLAN.findIndex((t, i) => t === 'high' && i !== 23)
  if (swapIdx !== -1) {
    ;[TIER_PLAN[23], TIER_PLAN[swapIdx]] = [TIER_PLAN[swapIdx], TIER_PLAN[23]]
  }
}
// BUF-008 (index 81: 74 cows + 7 = 81) is the pinned buffalo demo animal
if (TIER_PLAN[81] !== 'high') {
  const swapIdx = TIER_PLAN.findIndex((t, i) => t === 'high' && i !== 81 && i !== 23)
  if (swapIdx !== -1) {
    ;[TIER_PLAN[81], TIER_PLAN[swapIdx]] = [TIER_PLAN[swapIdx], TIER_PLAN[81]]
  }
}
// GOT-004 (index 113: 74 cows + 36 buffaloes + 3 = 113) is the pinned goat demo animal
if (TIER_PLAN[113] !== 'high') {
  const swapIdx = TIER_PLAN.findIndex((t, i) => t === 'high' && i !== 113 && i !== 23 && i !== 81)
  if (swapIdx !== -1) {
    ;[TIER_PLAN[113], TIER_PLAN[swapIdx]] = [TIER_PLAN[swapIdx], TIER_PLAN[113]]
  }
}

const TIER_RANGES = {
  none: { scc: [50000, 150000], yield: [0, 5], temp: [38.0, 38.6], activity: [-2, 5], rumination: [-2, 5], prevRisk: 0.03 },
  low: { scc: [120000, 220000], yield: [-5, 0], temp: [38.3, 38.8], activity: [-6, 0], rumination: [-6, 0], prevRisk: 0.08 },
  moderate: { scc: [200000, 320000], yield: [-10, -4], temp: [38.6, 39.0], activity: [-10, -4], rumination: [-9, -3], prevRisk: 0.22 },
  high: { scc: [300000, 450000], yield: [-18, -10], temp: [38.9, 39.3], activity: [-16, -9], rumination: [-14, -8], prevRisk: 0.45 },
  critical: { scc: [420000, 550000], yield: [-25, -16], temp: [39.1, 39.6], activity: [-20, -14], rumination: [-18, -12], prevRisk: 0.6 },
}

function buildHistory(currentValue, dailyDrift, days = 30, volatility = 0.02) {
  // Walk backwards from "today" so the series ends at currentValue.
  const series = new Array(days)
  series[days - 1] = currentValue
  let v = currentValue
  for (let i = days - 2; i >= 0; i--) {
    v = v - dailyDrift + (rand() - 0.5) * volatility * Math.abs(currentValue || 1)
    series[i] = Math.max(0, v)
  }
  return series.map((val, idx) => ({
    day: idx - (days - 1),
    label: idx === days - 1 ? 'Today' : `${idx - (days - 1)}d`,
    value: Math.round(val * 100) / 100,
  }))
}

function generateAnimal(index, tier) {
  // Determine Species: 1-74 Cattle, 75-110 Buffalo, 111-128 Goat (Total 128)
  let species = 'Cow'
  let speciesLabel = 'Cattle / Cow'
  let speciesEmoji = '🐄'
  let id = `COW-${String(index).padStart(3, '0')}`
  let breed = pick(COW_BREEDS)
  let scientificName = 'Bos indicus / taurus'
  let baseYield = between(12, 24)
  let milkFat = Number(between(3.8, 4.6).toFixed(1))

  if (index > 74 && index <= 110) {
    species = 'Buffalo'
    speciesLabel = 'Water Buffalo'
    speciesEmoji = '🐃'
    const bufNum = index - 74
    id = `BUF-${String(bufNum).padStart(3, '0')}`
    breed = pick(BUFFALO_BREEDS)
    scientificName = 'Bubalus bubalis'
    baseYield = between(10, 18)
    milkFat = Number(between(6.8, 8.4).toFixed(1))
  } else if (index > 110) {
    species = 'Goat'
    speciesLabel = 'Dairy Goat'
    speciesEmoji = '🐐'
    const gotNum = index - 110
    id = `GOT-${String(gotNum).padStart(3, '0')}`
    breed = pick(GOAT_BREEDS)
    scientificName = 'Capra hircus'
    baseYield = between(1.8, 4.2)
    milkFat = Number(between(3.5, 4.5).toFixed(1))
  }

  const range = TIER_RANGES[tier]
  const age = species === 'Goat' ? Math.round(between(2, 6)) : Math.round(between(3, 9))
  const lactationNumber = Math.min(5, Math.max(1, Math.round(between(1, 5))))

  // Species-calibrated Somatic Cell Count
  // Goats naturally have apocrine cytoplasmic particles (normal 550k-900k)
  let scc = Math.round(between(range.scc[0], range.scc[1]) / 1000) * 1000
  if (species === 'Goat') {
    scc = Math.round((scc * 2.1) / 1000) * 1000
  }

  const milkYieldChangePct = Math.round(between(range.yield[0], range.yield[1]) * 10) / 10

  // Species-calibrated temperature
  let baseTemp = between(range.temp[0], range.temp[1])
  if (species === 'Buffalo') baseTemp -= 0.3 // Buffalo normal body temp is slightly lower
  if (species === 'Goat') baseTemp += 0.5 // Goat normal body temp is slightly higher (39.0-39.7°C)
  const temperature = Math.round(baseTemp * 10) / 10

  const activityChangePct = Math.round(between(range.activity[0], range.activity[1]))
  const ruminationChangePct = Math.round(between(range.rumination[0], range.rumination[1]))
  const previousMastitis = rand() < range.prevRisk
  const milkYield = Math.round(baseYield * (1 + milkYieldChangePct / 100) * 10) / 10
  const conductivityChangePct = Math.round(clampBand(scc) + between(-2, 2))

  const { score } = computeRiskScore({
    scc: species === 'Goat' ? Math.round(scc / 2.1) : scc,
    milkYieldChangePct,
    temperature,
    activityChangePct,
    ruminationChangePct,
    previousMastitis,
  })
  const band = TIER_RANGES[tier] ? bandForTier(tier) : bandForScore(score)
  const clampedScore = clampToBand(score, band)

  const vaccinationStatus = pick(['Up to date', 'Up to date', 'Up to date', 'Due Soon', 'Overdue'])

  return {
    id,
    species,
    speciesLabel,
    speciesEmoji,
    breed,
    scientificName,
    age,
    lactationNumber,
    milkYield,
    milkYieldChangePct,
    milkFat,
    scc,
    temperature,
    activity: activityChangePct,
    rumination: ruminationChangePct,
    conductivity: conductivityChangePct,
    vaccinationStatus,
    previousMastitis,
    riskScore: clampedScore,
    riskLevel: band.level,
    riskLabel: band.label,
    predictedWindow: predictedWindowForBand(band.level),
    history: {
      milkYield: buildHistory(milkYield, -milkYieldChangePct < 0 ? 0.05 : -0.02, 30, 0.6),
      scc: buildHistory(scc, tier === 'high' || tier === 'critical' ? -8000 : -500, 30, 6000),
      temperature: buildHistory(temperature, tier === 'high' || tier === 'critical' ? -0.02 : 0, 30, 0.15),
      activity: buildHistory(100 + activityChangePct, tier === 'high' || tier === 'critical' ? 0.5 : 0.05, 30, 1.5),
      rumination: buildHistory(100 + ruminationChangePct, tier === 'high' || tier === 'critical' ? 0.45 : 0.05, 30, 1.4),
    },
  }
}

function bandForTier(tier) {
  const map = {
    none: { level: 'none', label: 'No Risk', min: 0, max: 20 },
    low: { level: 'low', label: 'Low Risk', min: 21, max: 40 },
    moderate: { level: 'moderate', label: 'Moderate Risk', min: 41, max: 60 },
    high: { level: 'high', label: 'High Risk', min: 61, max: 80 },
    critical: { level: 'critical', label: 'Critical', min: 81, max: 100 },
  }
  return map[tier]
}
function clampToBand(score, band) {
  return Math.max(band.min, Math.min(band.max, score))
}
function clampBand(scc) {
  return Math.round(((scc - 100000) / 500000) * 20)
}

export const ANIMALS = TIER_PLAN.map((tier, i) => generateAnimal(i + 1, tier))

// 1. PINNED DEMO COW: COW-024 (Gir Indigenous Cow)
const demoIndex = ANIMALS.findIndex((a) => a.id === 'COW-024')
if (demoIndex !== -1) {
  const demoAnimal = {
    ...ANIMALS[demoIndex],
    species: 'Cow',
    speciesLabel: 'Cattle / Cow',
    speciesEmoji: '🐄',
    breed: 'Gir',
    age: 7,
    lactationNumber: 3,
    milkYield: 14.8,
    milkYieldChangePct: -18,
    milkFat: 4.2,
    scc: 480000,
    temperature: 39.2,
    activity: -14,
    rumination: -11,
    conductivity: 9,
    previousMastitis: true,
    vaccinationStatus: 'Up to date',
    riskScore: 87,
    riskLevel: 'high',
    riskLabel: 'High Risk',
    predictedWindow: '48–72 hours',
    modelConfidence: 91,
  }
  demoAnimal.history = {
    milkYield: buildHistory(14.8, 0.14, 30, 0.4),
    scc: buildHistory(480000, -10500, 30, 8000),
    temperature: buildHistory(39.2, -0.02, 30, 0.1),
    activity: buildHistory(86, 0.42, 30, 1.2),
    rumination: buildHistory(89, 0.38, 30, 1.2),
  }
  ANIMALS[demoIndex] = demoAnimal
}

// 2. PINNED DEMO BUFFALO: BUF-008 (Murrah Water Buffalo)
const bufIndex = ANIMALS.findIndex((a) => a.id === 'BUF-008')
if (bufIndex !== -1) {
  const bufDemo = {
    ...ANIMALS[bufIndex],
    species: 'Buffalo',
    speciesLabel: 'Water Buffalo',
    speciesEmoji: '🐃',
    breed: 'Murrah',
    age: 6,
    lactationNumber: 3,
    milkYield: 11.4,
    milkYieldChangePct: -16,
    milkFat: 5.8, // Fat dropped from 7.4% baseline (lipid depression)
    scc: 520000,
    temperature: 39.1,
    activity: -15,
    rumination: -13,
    conductivity: 11, // High in-line EC anomaly
    previousMastitis: true,
    vaccinationStatus: 'Up to date',
    riskScore: 78,
    riskLevel: 'high',
    riskLabel: 'High Risk',
    predictedWindow: '48–72 hours',
    modelConfidence: 90,
  }
  bufDemo.history = {
    milkYield: buildHistory(11.4, 0.12, 30, 0.35),
    scc: buildHistory(520000, -9500, 30, 7000),
    temperature: buildHistory(39.1, -0.02, 30, 0.1),
    activity: buildHistory(85, 0.38, 30, 1.1),
    rumination: buildHistory(87, 0.35, 30, 1.1),
  }
  ANIMALS[bufIndex] = bufDemo
}

// 3. PINNED DEMO GOAT: GOT-004 (Jamnapari Dairy Goat)
const gotIndex = ANIMALS.findIndex((a) => a.id === 'GOT-004')
if (gotIndex !== -1) {
  const gotDemo = {
    ...ANIMALS[gotIndex],
    species: 'Goat',
    speciesLabel: 'Dairy Goat',
    speciesEmoji: '🐐',
    breed: 'Jamnapari',
    age: 3,
    lactationNumber: 2,
    milkYield: 2.1,
    milkYieldChangePct: -26,
    milkFat: 3.6,
    scc: 980000, // Apocrine-secretion threshold elevation
    temperature: 39.8,
    activity: -18,
    rumination: -14,
    conductivity: 8,
    previousMastitis: false,
    vaccinationStatus: 'Up to date',
    riskScore: 68,
    riskLevel: 'high',
    riskLabel: 'High Risk',
    predictedWindow: '48–72 hours',
    modelConfidence: 89,
  }
  gotDemo.history = {
    milkYield: buildHistory(2.1, 0.04, 30, 0.1),
    scc: buildHistory(980000, -18000, 30, 12000),
    temperature: buildHistory(39.8, -0.02, 30, 0.12),
    activity: buildHistory(82, 0.45, 30, 1.2),
    rumination: buildHistory(86, 0.4, 30, 1.1),
  }
  ANIMALS[gotIndex] = gotDemo
}

export function getAnimalById(id) {
  if (!id) return null
  return ANIMALS.find((a) => a.id.toUpperCase() === id.toUpperCase())
}

export const HERD_SUMMARY = {
  total: ANIMALS.length,
  noRisk: ANIMALS.filter((a) => a.riskLevel === 'none').length,
  low: ANIMALS.filter((a) => a.riskLevel === 'low').length,
  moderate: ANIMALS.filter((a) => a.riskLevel === 'moderate').length,
  high: ANIMALS.filter((a) => a.riskLevel === 'high').length,
  critical: ANIMALS.filter((a) => a.riskLevel === 'critical').length,
  // Multi-Species breakdown:
  cows: ANIMALS.filter((a) => a.species === 'Cow').length,
  buffaloes: ANIMALS.filter((a) => a.species === 'Buffalo').length,
  goats: ANIMALS.filter((a) => a.species === 'Goat').length,
}
