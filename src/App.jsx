import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Animals from './pages/Animals.jsx'
import AnimalDetail from './pages/AnimalDetail.jsx'
import Forecast from './pages/Forecast.jsx'
import Alerts from './pages/Alerts.jsx'
import Recommendations from './pages/Recommendations.jsx'
import Analytics from './pages/Analytics.jsx'
import IoT from './pages/IoT.jsx'
import MapPage from './pages/MapPage.jsx'
import Settings from './pages/Settings.jsx'
import NotFound from './pages/NotFound.jsx'
import { useApp } from './context/AppContext.jsx'
import { getStoredAuth } from './utils/authStorage.js'

function RootRedirect() {
  const { auth } = useApp()
  const isAuthed = auth.isLoggedIn || !!getStoredAuth()?.isLoggedIn
  return <Navigate to={isAuthed ? '/dashboard' : '/login'} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<RootRedirect />} />
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/animals" element={<Animals />} />
        <Route path="/animals/:id" element={<AnimalDetail />} />
        <Route path="/forecast" element={<Forecast />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/iot" element={<IoT />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
