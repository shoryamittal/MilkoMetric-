import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Activity, ShieldCheck, Sparkles, Cpu, Clock, Users, ArrowRight, Loader2 } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { getStoredAuth } from '../utils/authStorage.js'

const HIGHLIGHTS = [
  { icon: Clock, text: 'Early Subclinical Detection 48–72h before clinical signs' },
  { icon: Cpu, text: '100% Offline Edge Inference at the farm gate via ESP32' },
  { icon: ShieldCheck, text: 'Prevents ₹6,000–₹10,000 economic loss per cow/lactation' },
  { icon: Users, text: '1-Click Tele-Veterinary Escalation & Milking Advisories' },
]

export default function Login() {
  const { login, loginDemo, auth } = useApp()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (auth.isLoggedIn || getStoredAuth()?.isLoggedIn) {
      navigate('/dashboard', { replace: true })
    }
  }, [auth.isLoggedIn, navigate])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    const displayName = name.trim() ? name.trim() : 'Guest'
    login(displayName)
    navigate('/dashboard', { replace: true })
  }

  const handleDemo = () => {
    if (submitting) return
    setSubmitting(true)
    loginDemo()
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-12 bg-canvas">
      {/* Left branding banner with official identity */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-ink via-[#16221A] to-ink p-10 text-white lg:col-span-6 lg:flex xl:col-span-7 xl:p-14">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full opacity-[0.16]"
          style={{ background: 'radial-gradient(circle, #3E7C52 0%, transparent 70%)' }}
        />
        <div
          className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full opacity-[0.14]"
          style={{ background: 'radial-gradient(circle, #2B5FA8 0%, transparent 70%)' }}
        />

        {/* Official Graphic Logo Treatment */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="rounded-xl bg-white/95 p-3.5 backdrop-blur shadow-pop w-fit">
            <img
              src="/agrinex-logo.png"
              alt="AgriNex AI - Smart Farming · Healthier Livestock · Better Tomorrow"
              className="h-16 w-auto object-contain"
            />
          </div>
        </motion.div>

        {/* Pitch content */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative max-w-xl my-auto py-8"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-pasture-400/30 bg-pasture-500/20 px-3 py-0.5 text-xs font-semibold text-pasture-300">
              <Sparkles size={12} /> Smart India Hackathon 2026
            </span>
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-white/80">
              Problem ID: SIH26109 · Hardware Track
            </span>
          </div>

          <h1 className="mt-5 font-display text-3xl font-bold leading-[1.15] tracking-tight text-white xl:text-4xl">
            AI Predictive Modelling for Early Bovine Mastitis Forecasting
          </h1>
          <p className="mt-3.5 text-sm leading-relaxed text-white/75 sm:text-base">
            Empowering Indian dairy farmers, gaushalas, and cooperatives with ultra-low-cost, edge-AI multi-sensor telemetry to predict subclinical mastitis 48–72 hours before acute tissue damage occurs.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {HIGHLIGHTS.map((f, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-pasture-600/30 text-pasture-300">
                  <f.icon size={15} />
                </span>
                <span className="text-xs font-medium text-white/85 leading-snug">{f.text}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Footer disclaimer */}
        <div className="relative flex items-center justify-between border-t border-white/10 pt-4 text-xs text-white/40">
          <span>Prototype Evaluation Build · Indian Dairy Farm Context</span>
          <span>Team AgriNex (AF-HW-10)</span>
        </div>
      </div>

      {/* Right Login Card */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-10 md:px-16 lg:col-span-6 xl:col-span-5 xl:px-14">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile logo view */}
          <div className="mb-6 flex justify-center lg:hidden">
            <img
              src="/agrinex-logo.png"
              alt="AgriNex AI"
              className="h-16 w-auto object-contain rounded-lg bg-white p-2 shadow-sm"
            />
          </div>

          {/* Prototype Caption Pill */}
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-signal-blue/30 bg-signal-blueSoft px-3 py-1 text-xs font-semibold text-signal-blue">
            <Activity size={12} /> Prototype / Demo Access
          </div>

          <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-[26px]">
            Welcome to AgriNex AI
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Enter your name to launch your personalized herd diagnostics console.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink">
                Your Name / Evaluator Tag
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Shorya Mittal, Dr. Sharma, or leave blank"
                className="w-full rounded-md border border-line bg-canvas-raised px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-pasture-500 focus:outline-none focus:ring-1 focus:ring-pasture-500 shadow-sm"
              />
              <span className="mt-1 block text-[11px] text-ink-faint">
                Leaving this blank will automatically log you in as <strong>"Guest"</strong>.
              </span>
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink">
                Password / Demo Passcode
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Any passcode works for SIH evaluation"
                className="w-full rounded-md border border-line bg-canvas-raised px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-pasture-500 focus:outline-none focus:ring-1 focus:ring-pasture-500 shadow-sm"
              />
              <span className="mt-1 block text-[11px] text-ink-faint">
                Prototype authentication: passwords are treated as ephemeral and never persisted.
              </span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-pasture-700 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-pasture-600 active:scale-[0.99] disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Entering Herd Console...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Console</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs text-ink-faint">
            <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
          </div>

          <button
            type="button"
            onClick={handleDemo}
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-line bg-canvas-raised py-2.5 text-sm font-semibold text-ink shadow-sm transition-all hover:bg-canvas-sunken disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin text-pasture-700" />
                <span>Launching SIH Evaluation Demo...</span>
              </>
            ) : (
              <span>Launch as Quick Demo Evaluator</span>
            )}
          </button>

          <div className="mt-6 rounded-lg border border-line/80 bg-canvas-sunken/60 p-3.5 text-xs text-ink-soft">
            <p className="font-semibold text-ink">SIH Evaluator Quick-Start:</p>
            <p className="mt-0.5 leading-relaxed text-ink-faint">
              You will be greeted with a dynamic time-based welcome, real-time ESP32 edge telemetry, 48–72h subclinical forecasting, and the interactive multilingual AI Assistant.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
