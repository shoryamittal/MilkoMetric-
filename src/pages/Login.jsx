import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Activity, CalendarClock, ScanSearch, Sparkles, ClipboardCheck } from 'lucide-react'
import Logo from '../components/common/Logo.jsx'
import { useApp } from '../context/AppContext.jsx'

const FEATURES = [
  { icon: CalendarClock, text: 'Predict mastitis risk 7–14 days early' },
  { icon: ScanSearch, text: 'Monitor every animal, individually' },
  { icon: Activity, text: 'Detect risk patterns from sensor trends' },
  { icon: ClipboardCheck, text: 'Get actionable, prioritised recommendations' },
]

export default function Login() {
  const { login, loginDemo, auth } = useApp()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (auth.isLoggedIn) {
    navigate('/dashboard', { replace: true })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError('Enter both fields to continue — this is a prototype, any values work.')
      return
    }
    login(email.split('@')[0] || 'Farmer')
    navigate('/dashboard')
  }

  const handleDemo = () => {
    loginDemo()
    navigate('/dashboard')
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-ink px-12 py-10 text-white lg:flex xl:px-16">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full opacity-[0.12]"
          style={{ background: 'radial-gradient(circle, #3E7C52 0%, transparent 70%)' }}
        />
        <div
          className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full opacity-[0.10]"
          style={{ background: 'radial-gradient(circle, #2B5FA8 0%, transparent 70%)' }}
        />
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Logo tone="light" size={32} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative max-w-md"
        >
          <span className="inline-flex items-center gap-1.5 rounded-sm border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white/70">
            <Sparkles size={12} /> Smart India Hackathon 2026 · SIH26109
          </span>
          <h1 className="mt-5 font-display text-[34px] font-semibold leading-[1.15] tracking-tight xl:text-[40px]">
            Predict. Prevent. Protect.
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-white/65">
            AI-powered early mastitis forecasting for Indian dairy farms — detecting risk 7–14 days before clinical
            symptoms appear.
          </p>
          <ul className="mt-8 space-y-3.5">
            {FEATURES.map((f, i) => (
              <li key={i} className="flex items-center gap-3 text-[14px] text-white/80">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-white/[0.07]">
                  <f.icon size={15} className="text-pasture-300" />
                </span>
                {f.text}
              </li>
            ))}
          </ul>
        </motion.div>

        <p className="relative text-xs text-white/35">Prototype dataset · Not a certified veterinary diagnostic tool</p>
      </div>

      <div className="flex flex-col justify-center px-6 py-12 sm:px-10 md:px-16 lg:px-14 xl:px-20">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h2 className="font-display text-2xl font-semibold text-ink">Welcome back</h2>
          <p className="mt-1 text-sm text-ink-soft">Sign in to view your herd's health overview.</p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-[13px] font-medium text-ink">
                Email / Mobile Number
              </label>
              <input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@shivdairyfarm.in"
                className="w-full rounded-sm border border-line bg-canvas-raised px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-pasture-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-[13px] font-medium text-ink">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-sm border border-line bg-canvas-raised px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-pasture-500"
              />
            </div>
            {error && <p className="text-xs text-signal-red">{error}</p>}
            <button
              type="submit"
              className="w-full rounded-sm bg-pasture-700 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-pasture-600"
            >
              Sign In
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs text-ink-faint">
            <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
          </div>

          <button
            onClick={handleDemo}
            className="w-full rounded-sm border border-line bg-canvas-raised py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-canvas-sunken"
          >
            Continue as Demo User
          </button>
          <p className="mt-6 text-center text-xs text-ink-faint">
            Prototype build for SIH 2026 evaluation. Any credentials will sign you in.
          </p>
        </div>
      </div>
    </div>
  )
}
