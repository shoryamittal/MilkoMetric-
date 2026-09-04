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

export const BREEDS = ['Gir', 'Sahiwal', 'Red Sindhi', 'Tharparkar', 'Jersey', 'Holstein Friesian', 'Murrah', 'Mehsana']

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
// COW-024 (index 23) is the pinned SIH demo animal and must land in the
// "high" tier — swap tiers with another "high" slot so the overall
// no/low/moderate/high/critical counts stay exactly on the plan above.
if (TIER_PLAN[23] !== 'high') {
  const swapIdx = TIER_PLAN.findIndex((t, i) => t === 'high' && i !== 23)
  if (swapIdx !== -1) {
    ;[TIER_PLAN[23], TIER_PLAN[swapIdx]] = [TIER_PLAN[swapIdx], TIER_PLAN[23]]
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
  const id = `COW-${String(index).padStart(3, '0')}`
  const range = TIER_RANGES[tier]
  const breed = pick(BREEDS)
  const age = Math.round(between(3, 9))
  const lactationNumber = Math.min(5, Math.max(1, Math.round(between(1, 5))))
  const scc = Math.round(between(range.scc[0], range.scc[1]) / 1000) * 1000
  const milkYieldChangePct = Math.round(between(range.yield[0], range.yield[1]) * 10) / 10
  const temperature = Math.round(between(range.temp[0], range.temp[1]) * 10) / 10
  const activityChangePct = Math.round(between(range.activity[0], range.activity[1]))
  const ruminationChangePct = Math.round(between(range.rumination[0], range.rumination[1]))
  const previousMastitis = rand() < range.prevRisk
  const baseYield = between(12, 24)
  const milkYield = Math.round(baseYield * (1 + milkYieldChangePct / 100) * 10) / 10
  const conductivityChangePct = Math.round(clampBand(scc) + between(-2, 2))

  const { score } = computeRiskScore({
    scc,
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
    breed,
    species: 'Bos indicus / taurus',
    age,
    lactationNumber,
    milkYield,
    milkYieldChangePct,
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

// The designated SIH demo animal — exact values pinned per the brief, and
// wired into alerts / forecast / recommendations throughout the app.
const demoIndex = ANIMALS.findIndex((a) => a.id === 'COW-024')
const demoAnimal = {
  ...ANIMALS[demoIndex],
  breed: 'Gir',
  age: 7,
  lactationNumber: 3,
  milkYield: 14.8,
  milkYieldChangePct: -18,
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
  predictedWindow: '7–10 days',
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

export function getAnimalById(id) {
  return ANIMALS.find((a) => a.id === id)
}

export const HERD_SUMMARY = {
  total: ANIMALS.length,
  noRisk: ANIMALS.filter((a) => a.riskLevel === 'none').length,
  low: ANIMALS.filter((a) => a.riskLevel === 'low').length,
  moderate: ANIMALS.filter((a) => a.riskLevel === 'moderate').length,
  high: ANIMALS.filter((a) => a.riskLevel === 'high').length,
  critical: ANIMALS.filter((a) => a.riskLevel === 'critical').length,
}
