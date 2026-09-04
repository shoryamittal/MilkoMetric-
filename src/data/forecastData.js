import { HERD_SUMMARY } from './animals.js'

// Herd-level risk forecast: last 7 days observed, next 14 days predicted.
export function buildHerdForecast() {
  const points = []
  const historicalDays = [-7, -5, -3, -1, 0]
  const historical = [14, 15.5, 16, 17.2, 18]
  historicalDays.forEach((d, i) => {
    points.push({ label: d === 0 ? 'Today' : `${d}d`, day: d, actual: historical[i], predicted: null, high: null, low: null })
  })
  const futureDays = [2, 4, 7, 10, 14]
  const predicted = [24, 29, 34, 41, 47]
  const spread = [3, 5, 7, 9, 11]
  futureDays.forEach((d, i) => {
    points.push({
      label: `+${d}d`,
      day: d,
      actual: null,
      predicted: predicted[i],
      high: predicted[i] + spread[i],
      low: Math.max(0, predicted[i] - spread[i]),
    })
  })
  // bridge point so the line connects
  points[4] = { ...points[4], predicted: points[4].actual, high: points[4].actual, low: points[4].actual }
  return points
}

export const HERD_FORECAST_CONFIDENCE = 91

export const HERD_RISK_PROJECTION = {
  current: HERD_SUMMARY.high + HERD_SUMMARY.critical,
  in7Days: HERD_SUMMARY.high + HERD_SUMMARY.critical + 5,
  in14Days: HERD_SUMMARY.high + HERD_SUMMARY.critical + 9,
}

export function individualForecast(animal) {
  const current = animal.riskScore
  const day7 = Math.min(99, Math.round(current + (current > 50 ? 8 : 4)))
  const day14 = Math.min(99, Math.round(current + (current > 50 ? 15 : 7)))
  return { current, day7, day14, confidence: animal.modelConfidence || 88 }
}
