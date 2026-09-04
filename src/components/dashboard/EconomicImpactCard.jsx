import React from 'react'
import { TrendingUp, Sparkles, ShieldCheck, Droplet } from 'lucide-react'

export default function EconomicImpactCard({ totalAnimals = 128, highRiskCount = 12 }) {
  const estimatedSavingsMonth = Math.round((totalAnimals * 2850 * 0.82) / 1000) * 1000
  const milkAvertedLiters = Math.round(highRiskCount * 145)
  const antibioticReductionPct = 89

  return (
    <div className="relative overflow-hidden rounded-lg border border-pasture-300/60 bg-gradient-to-br from-white via-pasture-50/40 to-white p-5 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-pasture-600 text-white shadow-sm">
            <TrendingUp size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base font-semibold text-ink">Economic Safeguard & Projected ROI</h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-pasture-100 px-2 py-0.5 text-[10.5px] font-semibold text-pasture-700">
                <Sparkles size={11} /> Prescriptive AI
              </span>
            </div>
            <p className="text-xs text-ink-soft">Quantified savings via 7–10 day pre-symptomatic detection & targeted herd protocols</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-line bg-white/80 px-3 py-1.5 text-xs text-ink-soft">
          <span className="h-2 w-2 rounded-full bg-pasture-600 animate-pulseDot" />
          Live Model Projected Savings
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-md border border-line/80 bg-white p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-ink-soft">
            <span>Projected Monthly Savings</span>
            <span className="rounded bg-pasture-100 px-1.5 py-0.5 text-[10px] font-bold text-pasture-700">+34% vs reactive</span>
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-pasture-700 tabular">
            ₹{estimatedSavingsMonth.toLocaleString('en-IN')}
          </p>
          <p className="mt-1 text-[11px] text-ink-faint">≈ ${(estimatedSavingsMonth / 84).toFixed(0)} USD saved across {totalAnimals} cattle</p>
        </div>

        <div className="rounded-md border border-line/80 bg-white p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-ink-soft">
            <span>Milk Discard Averted</span>
            <Droplet size={14} className="text-signal-blue" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-signal-blue tabular">
            {milkAvertedLiters.toLocaleString()} L
          </p>
          <p className="mt-1 text-[11px] text-ink-faint">High-SCC penalty & dump losses prevented</p>
        </div>

        <div className="rounded-md border border-line/80 bg-white p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-ink-soft">
            <span>Antibiotic Dependency</span>
            <ShieldCheck size={14} className="text-pasture-600" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-ink tabular">
            -{antibioticReductionPct}%
          </p>
          <p className="mt-1 text-[11px] text-ink-faint">Preventing clinical flare-ups via herbal & teat protocols</p>
        </div>
      </div>
    </div>
  )
}