import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, Plus, Flag, Info, ArrowUp, ArrowDown, ArrowRight, Clock } from 'lucide-react'
import { Sheet } from '../components/Sheet'
import { useStore } from '../store/store'
import { useToast } from '../components/Toast'
import { useNav } from '../nav'
import { todaySession, sessionProgress } from '../store/selectors'
import { nextSetRecommendation, examState, examTrim } from '../store/training'
import { prForSession } from '../store/coach'
import { fmtWeightNum, toKg, weightUnit, fmtVolume, fmtWeight } from '../lib/format'
import type { WorkoutSession } from '../store/types'

export default function ActiveWorkout({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch } = useStore()
  const toast = useToast()
  const nav = useNav()
  const units = state.settings.units
  const session = todaySession(state)

  const [elapsed, setElapsed] = useState(0)
  const [rest, setRest] = useState<number | null>(null)
  const [restTotal, setRestTotal] = useState(90)
  const [restExIdx, setRestExIdx] = useState<number | null>(null)
  const startRef = useRef<number>(Date.now())

  useEffect(() => {
    if (!open) return
    startRef.current = Date.now() - elapsed * 1000
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)), 1000)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    if (rest === null) return
    if (rest <= 0) { setRest(null); return }
    const t = setTimeout(() => setRest((r) => (r === null ? null : r - 1)), 1000)
    return () => clearTimeout(t)
  }, [rest])

  const prog = useMemo(() => sessionProgress(session), [session])
  const exam = examState(state)
  const trim = useMemo(() => (session ? examTrim(session, state) : null), [session, state])

  if (!session) return null

  function patch(next: WorkoutSession) {
    dispatch({ type: 'SAVE_SESSION', session: next })
  }

  function setSet(exIdx: number, setIdx: number, field: 'weightKg' | 'reps', value: number) {
    if (!session) return
    const exercises = session.exercises.map((ex, i) =>
      i !== exIdx ? ex : { ...ex, sets: ex.sets.map((s, j) => (j === setIdx ? { ...s, [field]: value } : s)) },
    )
    patch({ ...session, exercises })
  }

  function toggleSet(exIdx: number, setIdx: number) {
    if (!session) return
    const wasDone = session.exercises[exIdx].sets[setIdx].done
    const exercises = session.exercises.map((ex, i) =>
      i !== exIdx ? ex : { ...ex, sets: ex.sets.map((s, j) => (j === setIdx ? { ...s, done: !s.done } : s)) },
    )
    patch({ ...session, exercises })
    if (!wasDone) { setRestTotal(90); setRest(90); setRestExIdx(exIdx) }
  }

  function addSet(exIdx: number) {
    if (!session) return
    const exercises = session.exercises.map((ex, i) => {
      if (i !== exIdx) return ex
      const last = ex.sets.at(-1)
      return { ...ex, sets: [...ex.sets, { weightKg: last?.weightKg ?? 0, reps: last?.reps ?? 8, done: false }] }
    })
    patch({ ...session, exercises })
  }

  function applySuggestion(exIdx: number, weightKg: number, reps: number) {
    if (!session) return
    const exercises = session.exercises.map((ex, i) =>
      i !== exIdx ? ex : { ...ex, sets: ex.sets.map((s) => (s.done ? s : { ...s, weightKg, reps })) },
    )
    patch({ ...session, exercises })
    toast('Coach weights set. Adjust any time.')
  }

  function finish() {
    if (!session) return
    const pr = prForSession(state, session)
    dispatch({ type: 'COMPLETE_WORKOUT', id: session.id })
    if (pr) {
      nav.open('prCelebration', { lift: pr.name, weight: fmtWeight(pr.weightKg, units, units === 'imperial' ? 0 : 1), reps: pr.reps })
    } else {
      toast('Workout logged. Streak updated.')
      onClose()
    }
  }

  const mins = Math.floor(elapsed / 60)
  const secs = String(elapsed % 60).padStart(2, '0')

  const restEx = restExIdx !== null ? session.exercises[restExIdx] : null
  const restInfo = restEx
    ? {
        name: restEx.name,
        exIndex: restExIdx as number,
        exTotal: session.exercises.length,
        setsDone: restEx.sets.filter((s) => s.done).length,
        setsTotal: restEx.sets.length,
      }
    : null

  const dirIcon = { up: <ArrowUp size={13} />, down: <ArrowDown size={13} />, hold: <ArrowRight size={13} /> }

  return (
    <Sheet open={open} onClose={onClose} title={session.name} full>
      <div className="mb-4 grid grid-cols-3 gap-3 rounded-2xl border border-white/5 bg-ink-800 p-4 text-center">
        <div><p className="text-[11px] text-white/45">Time</p><p className="text-xl font-extrabold tabular-nums">{mins}:{secs}</p></div>
        <div><p className="text-[11px] text-white/45">Volume</p><p className="text-xl font-extrabold">{fmtVolume(session.volumeKg, units)}</p></div>
        <div><p className="text-[11px] text-white/45">Sets done</p><p className="text-xl font-extrabold text-brand-400">{prog.done}/{prog.total}</p></div>
      </div>

      {exam.active && (
        <div className="mb-4 flex items-start gap-2.5 rounded-2xl border border-accent-purple/25 bg-accent-purple/10 p-3.5">
          <Info size={18} className="mt-0.5 shrink-0 text-accent-purple" />
          <p className="text-[13px] leading-snug text-white/70">
            Exam mode is on. Your {trim?.keptCount} key lifts are all you need today. The rest are optional, do them only if you have time and energy.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {session.exercises.map((ex, exIdx) => {
          const isOptional = trim?.optionalIds.has(ex.defId)
          const undone = ex.sets.some((s) => !s.done)
          const rec = nextSetRecommendation(state, ex.defId, ex.targetReps, Math.max(...ex.sets.map((s) => s.weightKg)))
          return (
            <div key={ex.defId} className={`rounded-2xl border border-white/5 bg-ink-800 p-3.5 ${isOptional ? 'opacity-70' : ''}`}>
              <button onClick={() => nav.open('exerciseDetail', { defId: ex.defId })} className="mb-2 flex w-full items-center gap-3 text-left">
                <img src={ex.image} alt="" className="h-11 w-11 rounded-xl object-cover" loading="lazy" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold leading-tight">{ex.name}</p>
                    {isOptional && <span className="rounded-full bg-white/8 px-2 py-0.5 text-[10px] font-semibold text-white/55">Optional today</span>}
                  </div>
                  <p className="text-[12px] text-white/45">{ex.targetSets} sets · {ex.targetReps} reps · how to</p>
                </div>
                <Info size={16} className="text-white/30" />
              </button>

              {undone && rec.hasHistory && (
                <button onClick={() => applySuggestion(exIdx, rec.suggestedWeightKg, rec.suggestedReps)} className="mb-2.5 flex w-full items-center gap-2 rounded-xl border border-brand-400/20 bg-brand-400/5 p-2.5 text-left active:scale-[0.99]">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-400/15 text-brand-400">{dirIcon[rec.direction]}</span>
                  <span className="flex-1 text-[12px] leading-snug text-white/70">{rec.reason}</span>
                  <span className="shrink-0 rounded-full bg-brand-400 px-2.5 py-1 text-[11px] font-bold text-black">Use</span>
                </button>
              )}

              <div className="mb-1.5 grid grid-cols-[28px_1fr_1fr_44px] items-center gap-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-white/35">
                <span>Set</span><span>{weightUnit(units)}</span><span>Reps</span><span className="text-right">Done</span>
              </div>

              {ex.sets.map((set, setIdx) => (
                <div key={setIdx} className="mb-1.5 grid grid-cols-[28px_1fr_1fr_44px] items-center gap-2">
                  <span className="text-sm font-bold text-white/50">{setIdx + 1}</span>
                  <input
                    key={`w-${exIdx}-${setIdx}-${set.weightKg}`}
                    inputMode="decimal"
                    defaultValue={fmtWeightNum(set.weightKg, units, units === 'imperial' ? 0 : 1)}
                    onBlur={(e) => setSet(exIdx, setIdx, 'weightKg', toKg(parseFloat(e.target.value) || 0, units))}
                    className={`rounded-lg border px-2 py-2 text-center text-sm font-semibold focus:outline-none ${set.done ? 'border-brand-400/30 bg-brand-400/10' : 'border-white/8 bg-ink-700'}`}
                  />
                  <input
                    key={`r-${exIdx}-${setIdx}-${set.reps}`}
                    inputMode="numeric"
                    defaultValue={set.reps}
                    onBlur={(e) => setSet(exIdx, setIdx, 'reps', parseInt(e.target.value) || 0)}
                    className={`rounded-lg border px-2 py-2 text-center text-sm font-semibold focus:outline-none ${set.done ? 'border-brand-400/30 bg-brand-400/10' : 'border-white/8 bg-ink-700'}`}
                  />
                  <button onClick={() => toggleSet(exIdx, setIdx)} className={`ml-auto grid h-8 w-8 place-items-center rounded-lg border-2 transition active:scale-90 ${set.done ? 'border-brand-400 bg-brand-400' : 'border-white/20'}`}>
                    {set.done && <Check size={16} strokeWidth={3} className="text-black" />}
                  </button>
                </div>
              ))}

              <button onClick={() => addSet(exIdx)} className="mt-1.5 flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-white/12 py-2 text-[13px] font-semibold text-white/55 active:bg-white/5">
                <Plus size={14} /> Add set
              </button>
            </div>
          )
        })}
      </div>

      <button onClick={finish} className="btn-primary mt-5 w-full"><Flag size={16} /> Finish Workout</button>

      {rest !== null && (
        <RestScreen
          remaining={rest}
          total={restTotal}
          elapsedLabel={`${mins}:${secs}`}
          info={restInfo}
          onSub={() => setRest((r) => Math.max(0, (r ?? 30) - 15))}
          onSkip={() => setRest(null)}
          onAdd={() => { setRestTotal((t) => t + 15); setRest((r) => (r ?? 0) + 15) }}
        />
      )}
    </Sheet>
  )
}

type RestInfo = { name: string; exIndex: number; exTotal: number; setsDone: number; setsTotal: number }

function RestScreen({ remaining, total, elapsedLabel, info, onSub, onSkip, onAdd }: {
  remaining: number
  total: number
  elapsedLabel: string
  info: RestInfo | null
  onSub: () => void
  onSkip: () => void
  onAdd: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-brand-400 text-black" style={{ animation: 'screen-in 0.25s ease-out' }}>
      <div className="space-y-2.5 px-7 pt-12">
        {info && <DotRow label="Exercise" total={info.exTotal} filled={info.exIndex + 1} />}
        {info && <DotRow label="Set" total={info.setsTotal} filled={info.setsDone} />}
      </div>

      <div className="flex flex-1 items-center justify-center px-7">
        <RestRing remaining={remaining} total={total} elapsedLabel={elapsedLabel} />
      </div>

      <div className="px-7 pb-12 text-center">
        {info && <p className="text-lg font-extrabold uppercase tracking-[0.12em]">{info.name}</p>}
        <div className="mt-5 flex items-center gap-3">
          <button onClick={onSub} className="h-12 flex-1 rounded-full bg-black/10 text-sm font-bold active:scale-[0.98] active:bg-black/15">−15s</button>
          <button onClick={onSkip} className="h-12 flex-[1.5] rounded-full bg-black text-sm font-extrabold text-brand-400 active:scale-[0.98]">Skip rest</button>
          <button onClick={onAdd} className="h-12 flex-1 rounded-full bg-black/10 text-sm font-bold active:scale-[0.98] active:bg-black/15">+15s</button>
        </div>
      </div>
    </div>
  )
}

function DotRow({ label, total, filled }: { label: string; total: number; filled: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-16 text-[12px] font-bold uppercase tracking-wide text-black/50">{label}</span>
      <div className="flex flex-wrap items-center gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <span key={i} className={`h-2 w-2 rounded-full ${i < filled ? 'bg-black' : 'bg-black/25'}`} />
        ))}
      </div>
    </div>
  )
}

function RestRing({ remaining, total, elapsedLabel, size = 264, stroke = 12 }: { remaining: number; total: number; elapsedLabel: string; size?: number; stroke?: number }) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const pct = total > 0 ? Math.max(0, Math.min(1, remaining / total)) : 0
  const offset = circumference - pct * circumference
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(0,0,0,0.88)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s linear' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="text-[13px] font-extrabold uppercase tracking-[0.22em] text-black/45">Rest</span>
        <span className="mt-2.5 text-6xl font-extrabold tabular-nums tracking-tight">{Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}</span>
        <span className="mt-2.5 flex items-center gap-1.5 text-[13px] font-bold tabular-nums text-black/45"><Clock size={14} /> {elapsedLabel}</span>
      </div>
    </div>
  )
}
