import { ANIMALS, getAnimalById } from './animals.js'

const severityForLevel = (level) => (level === 'critical' ? 'critical' : level === 'high' ? 'high' : 'moderate')

function reasonFor(animal) {
  const parts = []
  if (animal.conductivity > 3) parts.push(`Milk EC +${animal.conductivity}%`)
  if (animal.scc > 250000) parts.push(`Est. SCC ${animal.scc > 250000 ? '+' : ''}${Math.round(((animal.scc - 150000) / 150000) * 100)}%`)
  if (animal.milkYieldChangePct < -3) parts.push(`Milk yield ${animal.milkYieldChangePct}%`)
  if (animal.temperature > 38.8) parts.push(`Udder Temp +${(animal.temperature - 38.5).toFixed(1)}°C`)
  if (animal.activity < -5) parts.push(`Activity ${animal.activity}%`)
  return parts.slice(0, 3).join(' · ')
}

let counter = 1
function makeAlert(animal, minutesAgo, status = 'active', prevScore = null) {
  if (!animal) return null
  return {
    id: `ALT-${String(counter++).padStart(3, '0')}`,
    animalId: animal.id,
    species: animal.species || 'Cow',
    speciesEmoji: animal.speciesEmoji || '🐄',
    speciesLabel: animal.speciesLabel || 'Cattle / Cow',
    severity: severityForLevel(animal.riskLevel),
    riskScore: animal.riskScore,
    prevScore,
    reason: reasonFor(animal),
    predictedWindow: animal.predictedWindow,
    breed: animal.breed,
    lactation: animal.lactationNumber,
    timestampMinutesAgo: minutesAgo,
    status, // active | resolved
  }
}

const flagged = ANIMALS.filter((a) => a.riskLevel === 'high' || a.riskLevel === 'critical')
const bufAlert = getAnimalById('BUF-008')
const gotAlert = getAnimalById('GOT-004')

export const INITIAL_ALERTS = [
  makeAlert(getAnimalById('COW-024'), 2, 'active', 64),
  ...(bufAlert ? [makeAlert(bufAlert, 8, 'active', 58)] : []),
  ...(gotAlert ? [makeAlert(gotAlert, 15, 'active', 52)] : []),
  ...flagged
    .filter((a) => a.id !== 'COW-024' && a.id !== 'BUF-008' && a.id !== 'GOT-004')
    .slice(0, 7)
    .map((a, i) => makeAlert(a, 20 + i * 17, 'active')),
  ...ANIMALS.filter((a) => a.riskLevel === 'moderate')
    .slice(0, 4)
    .map((a, i) => makeAlert(a, 40 + i * 25, 'active')),
  makeAlert(ANIMALS[2], 60 * 6, 'resolved'),
  makeAlert(ANIMALS[9], 60 * 20, 'resolved'),
  makeAlert(ANIMALS[15], 60 * 30, 'resolved'),
].filter(Boolean)
