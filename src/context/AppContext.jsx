import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { ANIMALS as INITIAL_ANIMALS, getAnimalById } from '../data/animals.js'
import { INITIAL_ALERTS } from '../data/alerts.js'
import { NOTIFICATIONS as INITIAL_NOTIFICATIONS, DEVICES, LIVE_ENVIRONMENT } from '../data/sensorData.js'
import { computeRiskScore, bandForScore, predictedWindowForBand } from '../utils/riskCalculator.js'
import { t as translate } from '../utils/translations.js'
import { FARMS_LIST } from '../data/farms.js'
import { getStoredAuth, setStoredAuth, clearStoredAuth, getInitials } from '../utils/authStorage.js'

// Re-export for any modules importing from AppContext
export { FARMS_LIST, getInitials }

const AppContext = createContext(null)

const DEMO_BASELINE = JSON.parse(JSON.stringify(getAnimalById('COW-024')))

// Initial veterinary review tickets
const INITIAL_VET_REVIEWS = [
  {
    id: 'VET-101',
    animalId: 'COW-024',
    riskScore: 87,
    riskLevel: 'critical',
    status: 'UNDER_REVIEW', // OPEN | UNDER_REVIEW | VET_CONTACTED | ACTION_TAKEN | RESOLVED
    assignedVet: 'Dr. Patil (Senior Veterinary Officer, Pune)',
    requestedAt: '2026-09-09 10:15 AM',
    farm: 'Shiv Dairy Farm, Bay 3',
    signals: ['In-Line Milk EC +28%', 'Udder Temp +0.8°C (39.2°C)', 'Milk Yield -18%'],
    recommendedChecks: ['Teat canal palpation', 'California Mastitis Test (CMT)', 'Herbal barrier dip'],
  },
]

export function AppProvider({ children }) {
  // Synchronously initialize from storage to avoid redirect lag/bouncing
  const [auth, setAuth] = useState(() => {
    const stored = getStoredAuth()
    return (
      stored || {
        isLoggedIn: false,
        name: '',
        demo: false,
      }
    )
  })

  const [currentFarm, setCurrentFarm] = useState(FARMS_LIST[0])
  const [liveEnvironment, setLiveEnvironment] = useState(LIVE_ENVIRONMENT)
  const [animals, setAnimals] = useState(INITIAL_ANIMALS)
  const [alerts, setAlerts] = useState(INITIAL_ALERTS)
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS)
  const [vetReviews, setVetReviews] = useState(INITIAL_VET_REVIEWS)
  const [language, setLanguage] = useState('en')
  const [toasts, setToasts] = useState([])
  const [simulationActive, setSimulationActive] = useState(false)

  // Requirement 13: Offline-First state management
  const [networkStatus, setNetworkStatus] = useState('online') // 'online' | 'offline' | 'syncing'
  const [lastSyncTime, setLastSyncTime] = useState('Just now')
  const [pendingRecords, setPendingRecords] = useState(0)

  // Auth functions with synchronous sessionStorage persistence
  const login = useCallback((name) => {
    const cleanName = name && name.trim() ? name.trim() : 'Guest'
    const nextAuth = { isLoggedIn: true, name: cleanName, demo: false }
    setStoredAuth(nextAuth)
    setAuth(nextAuth)
    return nextAuth
  }, [])

  const loginDemo = useCallback(() => {
    const nextAuth = { isLoggedIn: true, name: 'Demo Evaluator', demo: true }
    setStoredAuth(nextAuth)
    setAuth(nextAuth)
    return nextAuth
  }, [])

  const logout = useCallback(() => {
    const nextAuth = { isLoggedIn: false, name: '', demo: false }
    clearStoredAuth()
    setAuth(nextAuth)
    return nextAuth
  }, [])

  // Toast notifications
  const showToast = useCallback((toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    setToasts((prev) => [...prev, { id, ...toast }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((tItem) => tItem.id !== id))
    }, 5500)
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((tItem) => tItem.id !== id))
  }, [])

  // Offline / Online toggle & sync simulation
  const toggleNetworkStatus = useCallback(() => {
    setNetworkStatus((current) => {
      if (current === 'online') {
        showToast({
          tone: 'moderate',
          title: '📶 Offline Mode Activated',
          message: 'System running 100% on local TinyML edge buffer. Telemetry will queue locally.',
        })
        return 'offline'
      } else if (current === 'offline') {
        // Trigger syncing transition
        setTimeout(() => {
          setPendingRecords(0)
          setLastSyncTime('Just now')
          setNetworkStatus('online')
          showToast({
            tone: 'ok',
            title: '✅ Cloud Synchronized',
            message: 'All local records validated & synced via MQTT v5.0.',
          })
        }, 1800)
        return 'syncing'
      }
      return 'online'
    })
  }, [showToast])

  const markNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  // Veterinary review workflow action
  const requestVeterinaryReview = useCallback(
    (animalId, reason = '') => {
      const animal = animals.find((a) => a.id === animalId) || getAnimalById(animalId)
      const newReview = {
        id: `VET-${Date.now().toString().slice(-4)}`,
        animalId,
        riskScore: animal?.riskScore || 75,
        riskLevel: animal?.riskLevel || 'high',
        status: 'UNDER_REVIEW',
        assignedVet: 'Dr. Patil (SVO, District Hospital, Pune)',
        requestedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        farm: 'Shiv Dairy Farm',
        signals: [
          `Milk EC: +${animal?.conductivity || 12}%`,
          `Udder Temp: ${animal?.temperature || 39.0}°C`,
          `Daily Yield: ${animal?.milkYieldChangePct || -12}%`,
        ],
        recommendedChecks: ['Teat canal physical palpation', 'California Mastitis Test (CMT)', 'Herbal teat barrier dip'],
        notes: reason || 'Farmer triggered urgent review based on 48–72h subclinical warning',
      }

      setVetReviews((prev) => [newReview, ...prev.filter((r) => r.animalId !== animalId)])

      if (networkStatus === 'offline') {
        setPendingRecords((c) => c + 1)
      }

      showToast({
        tone: 'info',
        title: '🚨 Veterinary Review Requested',
        message: `Case ${newReview.id} logged for ${animalId}. Tele-dossier queued for Dr. Patil.`,
      })
      return newReview
    },
    [animals, networkStatus, showToast]
  )

  const advanceVeterinaryStatus = useCallback(
    (reviewId, nextStatus) => {
      setVetReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, status: nextStatus } : r))
      )
      if (networkStatus === 'offline') {
        setPendingRecords((c) => c + 1)
      }
      showToast({
        tone: 'ok',
        title: 'Veterinary Workflow Updated',
        message: `Case ${reviewId} transitioned to: ${nextStatus.replace('_', ' ')}.`,
      })
    },
    [networkStatus, showToast]
  )

  // Simulation controls
  const simulateMastitisEvent = useCallback(() => {
    setAnimals((prev) => {
      const idx = prev.findIndex((a) => a.id === 'COW-024')
      if (idx === -1) return prev
      const current = prev[idx]
      const worsened = {
        ...current,
        conductivity: 28,
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
      worsened.predictedWindow = '24–48 hours'
      worsened.milkYield = Math.round(18.05 * (1 + worsened.milkYieldChangePct / 100) * 10) / 10

      const prevScore = current.riskScore
      setAlerts((prevAlerts) => [
        {
          id: `ALT-SIM-${Date.now()}`,
          animalId: 'COW-024',
          severity: 'critical',
          riskScore: worsened.riskScore,
          prevScore,
          reason: `Milk EC +28% (6.8 mS/cm) · Udder Temp +${(worsened.temperature - current.temperature).toFixed(1)}°C · Yield ${worsened.milkYieldChangePct}%`,
          predictedWindow: worsened.predictedWindow,
          breed: worsened.breed,
          lactation: worsened.lactationNumber,
          timestampMinutesAgo: 0,
          status: 'active',
        },
        ...prevAlerts,
      ])
      setNotifications((prevN) => [
        { id: `notif-sim-${Date.now()}`, severity: 'critical', text: 'COW-024 entered Critical status (EC Spike +28%)', minutesAgo: 0, read: false },
        ...prevN,
      ])

      const next = [...prev]
      next[idx] = worsened
      return next
    })
    setSimulationActive(true)
    showToast({
      tone: 'critical',
      title: '🚨 Critical Telemetry Spike Detected',
      message: 'COW-024: In-line EC spike (+28%) and udder thermal elevation. 48–72h subclinical warning active.',
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
    showToast({ tone: 'ok', title: 'Simulation Reset', message: 'All sensor values restored to normal baseline.' })
  }, [showToast])

  // Farm switcher action
  const switchFarm = useCallback((farmId) => {
    const target = FARMS_LIST.find((f) => f.id === farmId)
    if (!target) return
    setCurrentFarm(target)
    setLiveEnvironment((prev) => ({
      ...prev,
      thiIndex: target.thi,
      farmTemperature: target.thi > 78 ? 32.2 : 29.8,
      environmentalRisk: target.thi > 78 ? `Moderate Heat Stress (THI ${target.thi})` : `Comfortable (THI ${target.thi})`,
    }))
    showToast({
      tone: 'ok',
      title: '🏡 Demo Farm Switched',
      message: `Active farm set to ${target.name} (${target.location}).`,
    })
  }, [showToast])

  // Real-time sensor refresh option
  const refreshTelemetry = useCallback(() => {
    setLiveEnvironment((prev) => {
      const dTemp = Number(((Math.random() - 0.48) * 0.6).toFixed(1))
      const dHum = Math.round((Math.random() - 0.48) * 4)
      const newTemp = Number((prev.farmTemperature + dTemp).toFixed(1))
      const newHum = Math.min(92, Math.max(45, prev.humidity + dHum))
      const newTHI = Number((0.8 * newTemp + (newHum / 100) * (newTemp - 14.4) + 46.4).toFixed(1))
      return {
        ...prev,
        farmTemperature: newTemp,
        humidity: newHum,
        thiIndex: newTHI,
        milkTemperature: Number((38.4 + Math.random() * 0.4).toFixed(1)),
        avgConductivity: Number((5.3 + Math.random() * 0.3).toFixed(1)),
        environmentalRisk: newTHI > 78 ? `Moderate Heat Stress (THI ${newTHI})` : newTHI > 72 ? `Mild Heat Stress (THI ${newTHI})` : `Comfortable (THI ${newTHI})`,
      }
    })

    setAnimals((prev) =>
      prev.map((a) => {
        const jitterEC = Number(((Math.random() - 0.48) * 0.15).toFixed(2))
        const jitterTemp = Number(((Math.random() - 0.48) * 0.08).toFixed(1))
        const jitterSCC = Math.round((Math.random() - 0.48) * 6000)
        const jitterYield = Number(((Math.random() - 0.48) * 0.2).toFixed(1))
        const jitterAct = Math.round((Math.random() - 0.48) * 2)
        const jitterRum = Math.round((Math.random() - 0.48) * 2)

        return {
          ...a,
          conductivity: Math.max(3.5, Number((a.conductivity + jitterEC).toFixed(2))),
          temperature: Math.max(37.5, Number((a.temperature + jitterTemp).toFixed(1))),
          scc: Math.max(85000, a.scc + jitterSCC),
          milkYield: Math.max(8.0, Number((a.milkYield + jitterYield).toFixed(1))),
          activity: a.activity + jitterAct,
          rumination: a.rumination + jitterRum,
        }
      })
    )

    setLastSyncTime('Just now')

    showToast({
      tone: 'ok',
      title: '🔄 Real-Time Telemetry Refreshed',
      message: 'ESP32 Bio-Telemetry tags, in-line milk EC probes, and THI sensors updated live.',
    })
  }, [showToast])

  const lang = useCallback((key) => translate(language, key), [language])

  // Requirement 19: Structured Data Access functions for the AI Chatbot
  const getAnimalsList = useCallback(() => animals, [animals])
  const getAnimalData = useCallback((id) => animals.find((a) => a.id.toLowerCase() === id.toLowerCase()), [animals])
  const getFarmSummary = useCallback(() => {
    const total = animals.length
    const critical = animals.filter((a) => a.riskLevel === 'critical').length
    const high = animals.filter((a) => a.riskLevel === 'high').length
    const moderate = animals.filter((a) => a.riskLevel === 'moderate').length
    const healthy = animals.filter((a) => a.riskLevel === 'none' || a.riskLevel === 'low').length
    return { total, critical, high, moderate, healthy, heatStressTHI: liveEnvironment.thiIndex }
  }, [animals, liveEnvironment])

  const value = useMemo(
    () => ({
      auth,
      userInitials: getInitials(auth.name),
      login,
      loginDemo,
      logout,
      currentFarm,
      farmsList: FARMS_LIST,
      switchFarm,
      liveEnvironment,
      refreshTelemetry,
      animals,
      getAnimal: (id) => animals.find((a) => a.id === id),
      alerts,
      notifications,
      markNotificationsRead,
      vetReviews,
      requestVeterinaryReview,
      advanceVeterinaryStatus,
      networkStatus,
      lastSyncTime,
      pendingRecords,
      toggleNetworkStatus,
      language,
      setLanguage,
      t: lang,
      toasts,
      showToast,
      dismissToast,
      simulationActive,
      simulateMastitisEvent,
      resetSimulation,
      // Chatbot data hooks
      getAnimalsList,
      getAnimalData,
      getFarmSummary,
      getActiveAlerts: () => alerts.filter((a) => a.status === 'active'),
      getSensorHealth: () => DEVICES,
      getEnvironmentalStatus: () => liveEnvironment,
    }),
    [
      auth,
      login,
      loginDemo,
      logout,
      currentFarm,
      switchFarm,
      liveEnvironment,
      refreshTelemetry,
      animals,
      alerts,
      notifications,
      markNotificationsRead,
      vetReviews,
      requestVeterinaryReview,
      advanceVeterinaryStatus,
      networkStatus,
      lastSyncTime,
      pendingRecords,
      toggleNetworkStatus,
      language,
      lang,
      toasts,
      showToast,
      dismissToast,
      simulationActive,
      simulateMastitisEvent,
      resetSimulation,
      getAnimalsList,
      getAnimalData,
      getFarmSummary,
    ]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
