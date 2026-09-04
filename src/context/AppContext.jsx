import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { ANIMALS as INITIAL_ANIMALS, getAnimalById } from '../data/animals.js'
import { INITIAL_ALERTS } from '../data/alerts.js'
import { NOTIFICATIONS as INITIAL_NOTIFICATIONS } from '../data/sensorData.js'
import { computeRiskScore, bandForScore, predictedWindowForBand } from '../utils/riskCalculator.js'
import { t as translate } from '../utils/translations.js'

const AppContext = createContext(null)

const DEMO_BASELINE = JSON.parse(JSON.stringify(getAnimalById('COW-024')))

export function AppProvider({ children }) {
  const [auth, setAuth] = useState({ isLoggedIn: false, name: '', demo: false })
  const [animals, setAnimals] = useState(INITIAL_ANIMALS)
  const [alerts, setAlerts] = useState(INITIAL_ALERTS)
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS)
  const [language, setLanguage] = useState('en')
  const [toasts, setToasts] = useState([])
  const [simulationActive, setSimulationActive] = useState(false)

  const login = useCallback((name) => setAuth({ isLoggedIn: true, name: name || 'Farmer', demo: false }), [])
  const loginDemo = useCallback(() => setAuth({ isLoggedIn: true, name: 'Demo Farmer', demo: true }), [])
  const logout = useCallback(() => setAuth({ isLoggedIn: false, name: '', demo: false }), [])

  const showToast = useCallback((toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    setToasts((prev) => [...prev, { id, ...toast }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((tItem) => tItem.id !== id))
    }, 5200)
  }, [])
  const dismissToast = useCallback((id) => setToasts((prev) => prev.filter((tItem) => tItem.id !== id)), [])

  const markNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const simulateMastitisEvent = useCallback(() => {
    setAnimals((prev) => {
      const idx = prev.findIndex((a) => a.id === 'COW-024')
      if (idx === -1) return prev
      const current = prev[idx]
      const worsened = {
        ...current,
        scc: Math.min(620000, current.scc + 42000),
        milkYieldChangePct: Math.max(-32, current.milkYieldChangePct - 4),
        temperature: Math.min(40.1, +(current.temperature + 0.3).toFixed(1)),
        activity: Math.max(-30, current.activity - 5),
        rumination: Math.max(-26, current.rumination - 4),
      }
      const { score } = computeRiskScore({
        scc: worsened.scc,
        milkYieldChangePct: worsened.milkYieldChangePct,
        temperature: worsened.temperature,
        activityChangePct: worsened.activity,
        ruminationChangePct: worsened.rumination,
        previousMastitis: worsened.previousMastitis,
      })
      const band = bandForScore(Math.max(score, 88))
      worsened.riskScore = Math.max(score, 88)
      worsened.riskLevel = band.level
      worsened.riskLabel = band.label
      worsened.predictedWindow = predictedWindowForBand(band.level) || '3–6 days'
      worsened.milkYield = Math.round(18.05 * (1 + worsened.milkYieldChangePct / 100) * 10) / 10

      const prevScore = current.riskScore
      setAlerts((prevAlerts) => [
        {
          id: `ALT-SIM-${Date.now()}`,
          animalId: 'COW-024',
          severity: 'critical',
          riskScore: worsened.riskScore,
          prevScore,
          reason: `SCC +${Math.round(((worsened.scc - current.scc) / current.scc) * 100)}% · Temperature +${(worsened.temperature - current.temperature).toFixed(1)}°C · Milk yield ${worsened.milkYieldChangePct}%`,
          predictedWindow: worsened.predictedWindow,
          breed: worsened.breed,
          lactation: worsened.lactationNumber,
          timestampMinutesAgo: 0,
          status: 'active',
        },
        ...prevAlerts,
      ])
      setNotifications((prevN) => [
        { id: `notif-sim-${Date.now()}`, severity: 'critical', text: 'COW-024 entered Critical status', minutesAgo: 0, read: false },
        ...prevN,
      ])

      const next = [...prev]
      next[idx] = worsened
      return next
    })
    setSimulationActive(true)
    showToast({
      tone: 'critical',
      title: 'New Early Warning Generated',
      message: 'COW-024 has entered high-risk status.',
    })
  }, [showToast])

  const resetSimulation = useCallback(() => {
    setAnimals((prev) => {
      const idx = prev.findIndex((a) => a.id === 'COW-024')
      if (idx === -1) return prev
      const next = [...prev]
      next[idx] = JSON.parse(JSON.stringify(DEMO_BASELINE))
      return next
    })
    setAlerts((prev) => prev.filter((a) => !a.id.startsWith('ALT-SIM-')))
    setSimulationActive(false)
    showToast({ tone: 'ok', title: 'Simulation Reset', message: 'All sensor values restored to baseline.' })
  }, [showToast])

  const lang = useCallback((key) => translate(language, key), [language])

  const value = useMemo(
    () => ({
      auth,
      login,
      loginDemo,
      logout,
      animals,
      getAnimal: (id) => animals.find((a) => a.id === id),
      alerts,
      notifications,
      markNotificationsRead,
      language,
      setLanguage,
      t: lang,
      toasts,
      showToast,
      dismissToast,
      simulationActive,
      simulateMastitisEvent,
      resetSimulation,
    }),
    [auth, login, loginDemo, logout, animals, alerts, notifications, markNotificationsRead, language, lang, toasts, showToast, dismissToast, simulationActive, simulateMastitisEvent, resetSimulation]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
