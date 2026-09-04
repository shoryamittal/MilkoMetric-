// Thin service layer over mock data today. Swap the bodies of these
// functions for real HTTP calls (e.g. fetch(`${API_BASE}/animals`)) once a
// FastAPI backend is available — nothing in the UI should need to change.
import { ANIMALS, getAnimalById, HERD_SUMMARY } from '../data/animals.js'
import { INITIAL_ALERTS } from '../data/alerts.js'
import { buildHerdForecast, HERD_FORECAST_CONFIDENCE, HERD_RISK_PROJECTION, individualForecast } from '../data/forecastData.js'
import { DEVICES, DEVICE_COUNTS, LIVE_ENVIRONMENT } from '../data/sensorData.js'

const delay = (ms = 120) => new Promise((res) => setTimeout(res, ms))

export async function getAnimals() {
  await delay()
  return ANIMALS
}

export async function getAnimal(id) {
  await delay(80)
  return getAnimalById(id)
}

export async function getAlerts() {
  await delay()
  return INITIAL_ALERTS
}

export async function getForecast() {
  await delay()
  return {
    herd: buildHerdForecast(),
    confidence: HERD_FORECAST_CONFIDENCE,
    projection: HERD_RISK_PROJECTION,
  }
}

export async function getIndividualForecast(id) {
  const animal = getAnimalById(id)
  return animal ? individualForecast(animal) : null
}

export async function getSensorData() {
  await delay()
  return { devices: DEVICES, counts: DEVICE_COUNTS, environment: LIVE_ENVIRONMENT }
}

export async function getAnalytics() {
  await delay()
  return { herdSummary: HERD_SUMMARY }
}

export async function getRecommendations(id) {
  await delay(80)
  return getAnimalById(id)
}
