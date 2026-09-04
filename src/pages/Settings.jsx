import React, { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { LANGUAGES } from '../utils/translations.js'

function SectionCard({ title, children }) {
  return (
    <div className="rounded-lg border border-line bg-canvas-raised p-5 shadow-card">
      <h3 className="font-display text-base font-semibold text-ink">{title}</h3>
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-medium text-ink">{label}</label>
      {children}
    </div>
  )
}

function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 py-1.5">
      <div>
        <p className="text-[13.5px] font-medium text-ink">{label}</p>
        {description && <p className="text-xs text-ink-soft">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-pasture-600' : 'bg-line'}`}
        aria-pressed={checked}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
      </button>
    </label>
  )
}

const inputClass = 'w-full rounded-sm border border-line bg-canvas px-3 py-2 text-sm text-ink focus:border-pasture-500'

export default function Settings() {
  const { language, setLanguage, showToast } = useApp()
  const [farm, setFarm] = useState({ name: 'Shiv Dairy Farm', location: 'Pune, Maharashtra', herdSize: 128, type: 'Crossbred Dairy Farm' })
  const [alertSettings, setAlertSettings] = useState({ highRisk: true, scc: true, temperature: true, milkYield: false })
  const [channels, setChannels] = useState({ app: true, sms: true, vet: false })

  const handleSave = (e) => {
    e.preventDefault()
    showToast({ tone: 'ok', title: 'Settings saved', message: 'Your farm and alert preferences have been updated.' })
  }

  return (
    <form onSubmit={handleSave} className="max-w-3xl space-y-5">
      <SectionCard title="Farm Settings">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Farm Name">
            <input className={inputClass} value={farm.name} onChange={(e) => setFarm({ ...farm, name: e.target.value })} />
          </Field>
          <Field label="Location">
            <input className={inputClass} value={farm.location} onChange={(e) => setFarm({ ...farm, location: e.target.value })} />
          </Field>
          <Field label="Herd Size">
            <input type="number" className={inputClass} value={farm.herdSize} onChange={(e) => setFarm({ ...farm, herdSize: e.target.value })} />
          </Field>
          <Field label="Farm Type">
            <select className={inputClass} value={farm.type} onChange={(e) => setFarm({ ...farm, type: e.target.value })}>
              {['Crossbred Dairy Farm', 'Indigenous Breed Farm', 'Mixed Herd Farm', 'Commercial Dairy'].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Alert Settings">
        <Toggle checked={alertSettings.highRisk} onChange={(v) => setAlertSettings({ ...alertSettings, highRisk: v })} label="High-risk alerts" description="Notify when an animal crosses into high or critical risk." />
        <Toggle checked={alertSettings.scc} onChange={(v) => setAlertSettings({ ...alertSettings, scc: v })} label="SCC alerts" description="Notify on abnormal somatic cell count readings." />
        <Toggle checked={alertSettings.temperature} onChange={(v) => setAlertSettings({ ...alertSettings, temperature: v })} label="Temperature alerts" description="Notify on elevated body temperature." />
        <Toggle checked={alertSettings.milkYield} onChange={(v) => setAlertSettings({ ...alertSettings, milkYield: v })} label="Milk-yield alerts" description="Notify on unexpected drops in milk production." />
      </SectionCard>

      <SectionCard title="Notification Channels">
        <label className="flex items-center gap-2.5 text-sm text-ink">
          <input type="checkbox" checked={channels.app} onChange={(e) => setChannels({ ...channels, app: e.target.checked })} className="h-4 w-4 rounded-sm border-line text-pasture-600" />
          App notification
        </label>
        <label className="flex items-center gap-2.5 text-sm text-ink">
          <input type="checkbox" checked={channels.sms} onChange={(e) => setChannels({ ...channels, sms: e.target.checked })} className="h-4 w-4 rounded-sm border-line text-pasture-600" />
          SMS
        </label>
        <label className="flex items-center gap-2.5 text-sm text-ink">
          <input type="checkbox" checked={channels.vet} onChange={(e) => setChannels({ ...channels, vet: e.target.checked })} className="h-4 w-4 rounded-sm border-line text-pasture-600" />
          Veterinarian notification
        </label>
      </SectionCard>

      <SectionCard title="Language">
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((l) => (
            <button
              type="button"
              key={l.code}
              onClick={() => setLanguage(l.code)}
              className={`rounded-sm border px-4 py-2 text-sm font-medium transition-colors ${
                language === l.code ? 'border-pasture-600 bg-pasture-700 text-white' : 'border-line bg-canvas text-ink hover:bg-canvas-sunken'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <button type="submit" className="rounded-sm bg-pasture-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-pasture-600">
          Save Changes
        </button>
      </div>
    </form>
  )
}
