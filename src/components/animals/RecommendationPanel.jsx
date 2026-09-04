import React, { useState } from 'react'
import { AlertOctagon, Clock, ShieldCheck, Stethoscope, CheckCircle2 } from 'lucide-react'
import { useApp } from '../../context/AppContext.jsx'

const CHECKLIST_ITEMS = [
  'Clean teat preparation',
  'Disinfect milking equipment',
  'Check milking procedure',
  'Maintain clean bedding',
]

export default function RecommendationPanel({ animal }) {
  const { showToast } = useApp()
  const [inspectionDone, setInspectionDone] = useState(false)
  const [testRecorded, setTestRecorded] = useState(false)
  const [vetNotified, setVetNotified] = useState(false)
  const [checklist, setChecklist] = useState(() => CHECKLIST_ITEMS.map(() => false))

  const toggleChecklist = (idx) => {
    setChecklist((prev) => prev.map((v, i) => (i === idx ? !v : v)))
  }

  return (
    <div className="space-y-3.5">
      <div className="rounded-lg border border-signal-red/25 bg-canvas-raised p-4 shadow-card">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-signal-redSoft text-signal-red">
            <AlertOctagon size={17} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-signal-red">Immediate</p>
            <p className="mt-0.5 font-display text-[15px] font-semibold text-ink">Perform udder inspection</p>
            <p className="mt-1 text-sm text-ink-soft">Check for swelling, heat, pain, and abnormal milk consistency.</p>
            <button
              onClick={() => { setInspectionDone(true); showToast({ tone: 'ok', title: 'Inspection logged', message: `${animal.id} marked as inspected.` }) }}
              disabled={inspectionDone}
              className={`mt-3 flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-semibold transition-colors ${
                inspectionDone ? 'bg-pasture-100 text-pasture-700' : 'bg-signal-red text-white hover:bg-signal-critical'
              }`}
            >
              {inspectionDone && <CheckCircle2 size={13} />}
              {inspectionDone ? 'Inspection Complete' : 'Mark Inspection Complete'}
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-signal-amber/25 bg-canvas-raised p-4 shadow-card">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-signal-amberSoft text-signal-amber">
            <Clock size={17} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-signal-amber">Within 24 Hours</p>
            <p className="mt-0.5 font-display text-[15px] font-semibold text-ink">Check milk quality / SCC</p>
            <p className="mt-1 text-sm text-ink-soft">Run a somatic cell count test to confirm current sensor readings.</p>
            <button
              onClick={() => { setTestRecorded(true); showToast({ tone: 'ok', title: 'Test result recorded', message: `SCC test logged for ${animal.id}.` }) }}
              disabled={testRecorded}
              className={`mt-3 flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-semibold transition-colors ${
                testRecorded ? 'bg-pasture-100 text-pasture-700' : 'border border-signal-amber text-signal-amber hover:bg-signal-amberSoft'
              }`}
            >
              {testRecorded && <CheckCircle2 size={13} />}
              {testRecorded ? 'Result Recorded' : 'Record Test Result'}
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-line bg-canvas-raised p-4 shadow-card">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-pasture-100 text-pasture-700">
            <ShieldCheck size={17} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-pasture-700">Preventive</p>
            <p className="mt-0.5 font-display text-[15px] font-semibold text-ink">Review milking hygiene</p>
            <div className="mt-2.5 space-y-2">
              {CHECKLIST_ITEMS.map((item, idx) => (
                <label key={item} className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-soft">
                  <input
                    type="checkbox"
                    checked={checklist[idx]}
                    onChange={() => toggleChecklist(idx)}
                    className="h-4 w-4 rounded-sm border-line text-pasture-600 focus:ring-pasture-500"
                  />
                  <span className={checklist[idx] ? 'text-ink line-through decoration-ink-faint' : ''}>{item}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-signal-blue/20 bg-canvas-raised p-4 shadow-card">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-signal-blueSoft text-signal-blue">
            <Stethoscope size={17} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-signal-blue">Veterinary</p>
            <p className="mt-0.5 font-display text-[15px] font-semibold text-ink">Veterinary examination recommended</p>
            <p className="mt-1 text-sm text-ink-soft">A clinical exam can confirm or rule out early mastitis before symptoms progress.</p>
            <button
              onClick={() => { setVetNotified(true); showToast({ tone: 'info', title: 'Veterinarian notified', message: `Examination request sent for ${animal.id}.` }) }}
              disabled={vetNotified}
              className={`mt-3 flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-semibold transition-colors ${
                vetNotified ? 'bg-pasture-100 text-pasture-700' : 'bg-signal-blue text-white hover:opacity-90'
              }`}
            >
              {vetNotified && <CheckCircle2 size={13} />}
              {vetNotified ? 'Veterinarian Notified' : 'Notify Veterinarian'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
