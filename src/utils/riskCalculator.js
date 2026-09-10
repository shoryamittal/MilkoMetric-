// Prototype AI Simulation — transparent, frontend-only risk scoring.
// This is NOT a clinically validated veterinary model. It exists to make the
// prototype's alerts, forecasts and recommendations respond coherently to
// simulated sensor changes.

export const RISK_BANDS = [
  { level: 'none', label: 'No Risk', min: 0, max: 20, color: '#3E7C52' },
  { level: 'low', label: 'Low Risk', min: 21, max: 40, color: '#5C9C68' },
  { level: 'moderate', label: 'Moderate Risk', min: 41, max: 60, color: '#B3690E' },
  { level: 'high', label: 'High Risk', min: 61, max: 80, color: '#C4571F' },
  { level: 'critical', label: 'Critical', min: 81, max: 100, color: '#7E1F1B' },
]

export function bandForScore(score) {
  return RISK_BANDS.find((b) => score >= b.min && score <= b.max) || RISK_BANDS[0]
}

export function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v))
}

// Weighted, transparent contribution model (weights sum to 100).
export function computeRiskScore({
  scc = 150000,
  milkYieldChangePct = 0, // negative = decline
  temperature = 38.4,
  activityChangePct = 0, // negative = decline
  ruminationChangePct = 0, // negative = decline
  previousMastitis = false,
} = {}) {
  const safeSCC = typeof scc === 'number' && !isNaN(scc) ? scc : 150000
  const safeYield = typeof milkYieldChangePct === 'number' && !isNaN(milkYieldChangePct) ? milkYieldChangePct : 0
  const safeTemp = typeof temperature === 'number' && !isNaN(temperature) ? temperature : 38.4
  const safeAct = typeof activityChangePct === 'number' && !isNaN(activityChangePct) ? activityChangePct : 0
  const safeRum = typeof ruminationChangePct === 'number' && !isNaN(ruminationChangePct) ? ruminationChangePct : 0

  const sccContribution = clamp((safeSCC - 100000) / 480000, 0, 1) * 34
  const yieldContribution = clamp(-safeYield / 26, 0, 1) * 24
  const tempContribution = clamp((safeTemp - 38.2) / 1.5, 0, 1) * 18
  const activityContribution = clamp(-safeAct / 22, 0, 1) * 12
  const ruminationContribution = clamp(-safeRum / 20, 0, 1) * 8
  const historyContribution = previousMastitis ? 4 : 0

  const raw =
    sccContribution +
    yieldContribution +
    tempContribution +
    activityContribution +
    ruminationContribution +
    historyContribution

  const score = Math.round(clamp(raw, 0, 100))
  return {
    score,
    breakdown: {
      scc: Math.round(sccContribution),
      milkYield: Math.round(yieldContribution),
      temperature: Math.round(tempContribution),
      activity: Math.round(activityContribution),
      rumination: Math.round(ruminationContribution),
      history: Math.round(historyContribution),
    },
  }
}

export function predictedWindowForBand(level) {
  switch (level) {
    case 'critical':
      return '24–48 hours'
    case 'high':
      return '48–72 hours'
    case 'moderate':
      return '3–5 days'
    default:
      return null
  }
}
