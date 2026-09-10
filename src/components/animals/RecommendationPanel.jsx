import React, { useState } from 'react'
import {
  AlertOctagon,
  Clock,
  ShieldCheck,
  Stethoscope,
  CheckCircle2,
  UserCheck,
} from 'lucide-react'
import { useApp } from '../../context/AppContext.jsx'

const CHECKLIST_ITEMS = [
  'Clean teat preparation with warm chlorhexidine',
  'Disinfect milking clusters & vacuum cups',
  'Milk healthy cows first; milk this cow strictly last',
  'Provide fresh dry bedding & clean loafing yard',
]

const WORKFLOW_STAGES = [
  { key: 'OPEN', label: '1. Detected', shortLabel: '1. Detect' },
  { key: 'UNDER_REVIEW', label: '2. Under Review', shortLabel: '2. Review' },
  { key: 'VET_CONTACTED', label: '3. Vet Contacted', shortLabel: '3. Vet' },
  { key: 'ACTION_TAKEN', label: '4. Action Taken', shortLabel: '4. Action' },
  { key: 'RESOLVED', label: '5. Resolved', shortLabel: '5. Done' },
]

export default function RecommendationPanel({ animal }) {
  const {
    showToast,
    vetReviews,
    requestVeterinaryReview,
    advanceVeterinaryStatus,
  } = useApp()

  const [inspectionDone, setInspectionDone] = useState(false)
  const [testRecorded, setTestRecorded] = useState(false)
  const [checklist, setChecklist] = useState(() => CHECKLIST_ITEMS.map(() => false))

  const activeReview = vetReviews?.find((r) => r.animalId === animal.id)

  const toggleChecklist = (idx) => {
    setChecklist((prev) => prev.map((v, i) => (i === idx ? !v : v)))
  }

  const handleRequestReview = () => {
    requestVeterinaryReview(
      animal.id,
      `Urgent review triggered from Recommendations. Score: ${animal.riskScore}%, Level: ${animal.riskLevel}`
    )
  }

  const handleAdvance = () => {
    if (!activeReview) return
    const stageMap = {
      OPEN: 'UNDER_REVIEW',
      UNDER_REVIEW: 'VET_CONTACTED',
      VET_CONTACTED: 'ACTION_TAKEN',
      ACTION_TAKEN: 'RESOLVED',
    }
    const next = stageMap[activeReview.status]
    if (next) {
      advanceVeterinaryStatus(activeReview.id, next)
    }
  }

  const currentStageIdx = activeReview
    ? WORKFLOW_STAGES.findIndex((s) => s.key === activeReview.status)
    : -1

  return (
    <div className="space-y-4">
      {/* Interactive Tele-Veterinary Workflow Stepper */}
      <div className="rounded-xl border border-signal-blue/30 bg-canvas-raised p-4 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/70 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal-blueSoft text-signal-blue">
              <Stethoscope size={16} />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-signal-blue">
                Veterinary Escalation Protocol
              </p>
              <p className="font-display text-sm font-semibold text-ink">
                {activeReview ? `Case ID: ${activeReview.id}` : 'No Active Veterinary Escalation'}
              </p>
            </div>
          </div>

          {activeReview ? (
            <span className="rounded-full bg-signal-blue/10 px-2.5 py-0.5 text-xs font-semibold text-signal-blue">
              Status: {activeReview.status.replace('_', ' ')}
            </span>
          ) : (
            <button
              onClick={handleRequestReview}
              className="flex items-center gap-1.5 rounded-sm bg-signal-blue px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
            >
              <Stethoscope size={13} /> Request Vet Review
            </button>
          )}
        </div>

        {/* 5-Step Progress Bar */}
        {activeReview && (
          <div className="mt-3 space-y-3">
            <div className="grid grid-cols-5 gap-1 text-center">
              {WORKFLOW_STAGES.map((stg, i) => {
                const isPassed = i < currentStageIdx
                const isCurrent = i === currentStageIdx
                return (
                  <div key={stg.key} className="space-y-1">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        isPassed
                          ? 'bg-pasture-600'
                          : isCurrent
                          ? 'bg-signal-blue ring-2 ring-signal-blue/30'
                          : 'bg-canvas-sunken'
                      }`}
                    />
                    <p
                      className={`text-[10px] sm:text-[10.5px] font-semibold truncate ${
                        isCurrent
                          ? 'text-signal-blue'
                          : isPassed
                          ? 'text-pasture-700'
                          : 'text-ink-faint'
                      }`}
                    >
                      <span className="sm:hidden">{stg.shortLabel}</span>
                      <span className="hidden sm:inline">{stg.label}</span>
                    </p>
                  </div>
                )
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-canvas-sunken px-3 py-2 text-xs text-ink-soft">
              <span className="flex items-center gap-1.5">
                <UserCheck size={13} className="text-signal-blue" />
                <span>Assigned: <strong>Dr. Patil (SVO Pune)</strong></span>
              </span>

              {activeReview.status !== 'RESOLVED' ? (
                <button
                  onClick={handleAdvance}
                  className="flex items-center gap-1 rounded-sm bg-pasture-700 px-2.5 py-1 text-xs font-semibold text-white hover:bg-pasture-800 transition-colors"
                >
                  {activeReview.status === 'UNDER_REVIEW' && 'Confirm: Vet Contacted →'}
                  {activeReview.status === 'VET_CONTACTED' && 'Record: Action Taken (CMT) →'}
                  {activeReview.status === 'ACTION_TAKEN' && 'Mark Case Resolved ✓'}
                  {activeReview.status === 'OPEN' && 'Advance to Review →'}
                </button>
              ) : (
                <span className="flex items-center gap-1 text-xs font-semibold text-pasture-700">
                  <CheckCircle2 size={13} /> Case Successfully Resolved
                </span>
              )}
            </div>
          </div>
        )}

        {/* Clinical Guardrail Disclaimer */}
        <div className="mt-2.5 rounded-md bg-canvas-sunken/60 p-2 text-[11px] leading-relaxed text-ink-faint border border-line/40">
          ⚠️ <strong>Decision Support Guardrail:</strong> AgriNex AI provides early warning telemetry only. Strictly do not administer unprescribed antibiotics. Confirm diagnosis via physical exam, somatic cell testing, or California Mastitis Test (CMT).
        </div>
      </div>

      {/* Immediate Inspection Card */}
      <div className="rounded-lg border border-signal-red/25 bg-canvas-raised p-4 shadow-card">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-signal-redSoft text-signal-red">
            <AlertOctagon size={17} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-signal-red">Immediate (Step 1)</p>
            <p className="mt-0.5 font-display text-[15px] font-semibold text-ink">Perform physical udder palpation</p>
            <p className="mt-1 text-sm text-ink-soft">
              Check all four quarters for localized warmth, swelling, hardness, or sensitivity before milking.
            </p>
            <button
              onClick={() => {
                setInspectionDone(true)
                showToast({ tone: 'ok', title: 'Inspection logged', message: `${animal.id} marked as physically inspected.` })
              }}
              disabled={inspectionDone}
              className={`mt-3 flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition-colors w-full sm:w-auto text-center ${
                inspectionDone ? 'bg-pasture-100 text-pasture-700' : 'bg-signal-red text-white hover:bg-signal-critical'
              }`}
            >
              {inspectionDone && <CheckCircle2 size={13} />}
              {inspectionDone ? 'Physical Palpation Completed' : 'Log Physical Inspection'}
            </button>
          </div>
        </div>
      </div>

      {/* 24-Hour Diagnostic Card */}
      <div className="rounded-lg border border-signal-amber/25 bg-canvas-raised p-4 shadow-card">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-signal-amberSoft text-signal-amber">
            <Clock size={17} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-signal-amber">Within 24 Hours (Step 2)</p>
            <p className="mt-0.5 font-display text-[15px] font-semibold text-ink">Conduct California Mastitis Test (CMT) / SCC</p>
            <p className="mt-1 text-sm text-ink-soft">
              Verify elevated somatic cell count using California Mastitis reagent paddle to detect gel formation.
            </p>
            <button
              onClick={() => {
                setTestRecorded(true)
                showToast({ tone: 'ok', title: 'CMT Test logged', message: `CMT diagnostic test recorded for ${animal.id}.` })
              }}
              disabled={testRecorded}
              className={`mt-3 flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition-colors w-full sm:w-auto text-center ${
                testRecorded ? 'bg-pasture-100 text-pasture-700' : 'border border-signal-amber text-signal-amber hover:bg-signal-amberSoft'
              }`}
            >
              {testRecorded && <CheckCircle2 size={13} />}
              {testRecorded ? 'CMT Result Calibrated & Saved' : 'Record CMT Test Result'}
            </button>
          </div>
        </div>
      </div>

      {/* Preventive Milking Hygiene Checklist */}
      <div className="rounded-lg border border-line bg-canvas-raised p-4 shadow-card">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-pasture-100 text-pasture-700">
            <ShieldCheck size={17} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-pasture-700">Daily Hygiene Standard (Step 3)</p>
            <p className="mt-0.5 font-display text-[15px] font-semibold text-ink">Milking Protocol & Segregation Checklist</p>
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
    </div>
  )
}
