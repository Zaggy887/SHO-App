import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, Plus, Flag, Info, ArrowUp, ArrowDown, ArrowRight, ChevronDown, Bell, BookOpen } from 'lucide-react'
import { Sheet } from '../components/Sheet'
import { TechniqueClip } from '../components/TechniqueClip'
import { useStore } from '../store/store'
import { useToast } from '../components/Toast'
import { useNav } from '../nav'
import { todaySession, sessionProgress } from '../store/selectors'
import { nextSetRecommendation, examState, examTrim } from '../store/training'
import { prForSession } from '../store/coach'
import { exerciseDetail } from '../data/catalog'
import { fmtWeightNum, toKg, weightUnit, fmtVolume, fmtWeight } from '../lib/format'
import type { Units, WorkoutSession } from '../store/types'

/* Compound lifts rest longer than isolation work. No rest field exists in the
 * data model, so derive a sensible default from the exercise id. */
const COMPOUND_LIFTS = ['bench', 'squat', 'deadlift', 'ohp', 'row', 'pulldown', 'legpress', 'rdl', 'incline', 'shoulder']
const ISOLATION_LIFTS = ['cablefly', 'tricep', 'curl', 'lateral']
function restSecondsFor(defId: string): number {
  if (COMPOUND_LIFTS.includes(defId)) return 120
  if (ISOLATION_LIFTS.includes(defId)) return 60
  return 90
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/** Short, asset-free beep via the Web Audio API. Sound is fine even with reduced motion. */
function beep() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.0001, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.16)
    osc.onended = () => ctx.close()
  } catch {
    /* Audio not available — silently ignore. */
  }
}

type UpNext = { name: string; setIdx: number; setsTotal: number; weightKg: number; reps: number }

/** First not-done set at or after fromExIdx, wrapping back to earlier exercises. */
function findNextUndone(session: WorkoutSession, fromExIdx: number): UpNext | null {
  const order = [
    ...session.exercises.map((_, i) => i).filter((i) => i >= fromExIdx),
    ...session.exercises.map((_, i) => i).filter((i) => i < fromExIdx),
  ]
  for (const i of order) {
    const ex = session.exercises[i]
    const setIdx = ex.sets.findIndex((s) => !s.done)
    if (setIdx >= 0) {
      const set = ex.sets[setIdx]
      return { name: ex.name, setIdx, setsTotal: ex.sets.length, weightKg: set.weightKg, reps: set.reps }
    }
  }
  return null
}

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
  const [go, setGo] = useState(false)
  const [howTo, setHowTo] = useState<Set<string>>(new Set())
  const startRef = useRef<number>(Date.now())

  useEffect(() => {
    if (!open) return
    startRef.current = Date.now() - elapsed * 1000
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)), 1000)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Countdown tick — paused once we reach the GO state.
  useEffect(() => {
    if (rest === null || go || rest <= 0) return
    const t = setTimeout(() => setRest((r) => (r === null ? null : r - 1)), 1000)
    return () => clearTimeout(t)
  }, [rest, go])

  // Rest hit zero: fire the alert and switch to the GO state.
  useEffect(() => {
    if (rest === 0 && !go && restExIdx !== null) {
      if (!prefersReducedMotion()) navigator.vibrate?.([200, 100, 200])
      beep()
      if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification('Rest done — start your next set')
        } catch {
          /* ignore */
        }
      }
      setGo(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rest])

  // GO auto-dismisses back to the logger after a few seconds.
  useEffect(() => {
    if (!go) return
    const t = setTimeout(() => endRest(), 4000)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [go])

  const prog = useMemo(() => sessionProgress(session), [session])
  const exam = examState(state)
  const trim = useMemo(() => (session ? examTrim(session, state) : null), [session, state])

  if (!session) return null

  function patch(next: WorkoutSession) {
    dispatch({ type: 'SAVE_SESSION', session: next })
  }

  function endRest() {
    setRest(null)
    setGo(false)
    setRestExIdx(null)
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
    if (!wasDone) {
      const secs = restSecondsFor(session.exercises[exIdx].defId)
      setRestTotal(secs)
      setRest(secs)
      setRestExIdx(exIdx)
      setGo(false)
    }
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

  function toggleHowTo(defId: string) {
    setHowTo((prev) => {
      const next = new Set(prev)
      if (next.has(defId)) next.delete(defId)
      else next.add(defId)
      return next
    })
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

  const upNext = rest !== null && restExIdx !== null ? findNextUndone(session, restExIdx) : null

  const dirIcon = { up: <ArrowUp size={12} />, down: <ArrowDown size={12} />, hold: <ArrowRight size={12} /> }

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
          const nextSetIdx = ex.sets.findIndex((s) => !s.done)
          const rec = nextSetRecommendation(state, ex.defId, ex.targetReps, Math.max(...ex.sets.map((s) => s.weightKg)))
          const detail = exerciseDetail(ex.defId)
          const howToOpen = howTo.has(ex.defId)
          return (
            <div key={ex.defId} className={`overflow-hidden rounded-2xl border border-white/5 bg-ink-800 ${isOptional ? 'opacity-70' : ''}`}>
              {/* Header — name reads at a glance, target right under it. */}
              <div className="flex items-center gap-3 p-3.5 pb-2.5">
                <img src={ex.image} alt="" className="h-11 w-11 rounded-xl object-cover" loading="lazy" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-bold leading-tight">{ex.name}</p>
                    {isOptional && <span className="shrink-0 rounded-full bg-white/8 px-2 py-0.5 text-[10px] font-semibold text-white/55">Optional today</span>}
                  </div>
                  <p className="text-[12px] text-white/45">{ex.targetSets} sets · {ex.targetReps} reps</p>
                </div>
              </div>

              {/* Inline actions: expand How to in place, or jump to the full guide. */}
              <div className="flex items-center gap-4 px-3.5 pb-2.5">
                <button onClick={() => toggleHowTo(ex.defId)} className="flex items-center gap-1 text-[12px] font-semibold text-white/55 active:opacity-70">
                  <ChevronDown size={14} className={`transition-transform ${howToOpen ? 'rotate-180' : ''}`} /> How to
                </button>
                <button onClick={() => nav.open('exerciseDetail', { defId: ex.defId })} className="flex items-center gap-1 text-[12px] font-semibold text-white/55 active:opacity-70">
                  <BookOpen size={13} /> Full guide
                </button>
              </div>

              {howToOpen && (
                <div className="px-3.5 pb-3">
                  <TechniqueClip poster={ex.image} videoUrl={undefined} label="Form clip coming soon" />
                  <ol className="mt-3 space-y-2">
                    {detail.cues.map((c, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-[13px]">
                        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-400/15 text-[11px] font-bold text-brand-400">{i + 1}</span>
                        <span className="text-white/75">{c}</span>
                      </li>
                    ))}
                  </ol>
                  <p className="mt-3 rounded-xl border border-white/8 bg-white/[0.03] p-2.5 text-[12px] leading-snug text-white/55">
                    <span className="font-semibold text-white/70">Common mistake · </span>{detail.commonMistake}
                  </p>
                </div>
              )}

              <div className="px-3.5 pb-3.5">
                {/* Quiet coach nudge — a chip, not a banner. */}
                {undone && rec.hasHistory && (
                  <button onClick={() => applySuggestion(exIdx, rec.suggestedWeightKg, rec.suggestedReps)} className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-brand-400/25 bg-brand-400/[0.06] py-1 pl-2 pr-2.5 text-[11px] font-semibold text-brand-400 active:scale-95">
                    {dirIcon[rec.direction]}
                    Use {fmtWeightNum(rec.suggestedWeightKg, units, units === 'imperial' ? 0 : 1)} {weightUnit(units)} × {rec.suggestedReps}
                  </button>
                )}

                <div className="mb-1.5 grid grid-cols-[28px_1fr_1fr_44px] items-center gap-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-white/35">
                  <span>Set</span><span>{weightUnit(units)}</span><span>Reps</span><span className="text-right">Done</span>
                </div>

                {ex.sets.map((set, setIdx) => {
                  const isNext = !set.done && setIdx === nextSetIdx
                  return (
                    <div
                      key={setIdx}
                      className={`mb-1.5 grid grid-cols-[28px_1fr_1fr_44px] items-center gap-2 rounded-xl border-l-2 py-0.5 pl-1 transition ${
                        isNext ? 'border-brand-400 bg-brand-400/[0.06]' : set.done ? 'border-transparent opacity-55' : 'border-transparent'
                      }`}
                    >
                      <span className={`text-sm font-bold ${isNext ? 'text-brand-400' : 'text-white/50'}`}>{setIdx + 1}</span>
                      <input
                        key={`w-${exIdx}-${setIdx}-${set.weightKg}`}
                        inputMode="decimal"
                        defaultValue={fmtWeightNum(set.weightKg, units, units === 'imperial' ? 0 : 1)}
                        onBlur={(e) => setSet(exIdx, setIdx, 'weightKg', toKg(parseFloat(e.target.value) || 0, units))}
                        className={`rounded-lg border px-2 py-2 text-center text-sm font-semibold focus:outline-none ${set.done ? 'border-white/8 bg-ink-700/60' : 'border-white/8 bg-ink-700'}`}
                      />
                      <input
                        key={`r-${exIdx}-${setIdx}-${set.reps}`}
                        inputMode="numeric"
                        defaultValue={set.reps}
                        onBlur={(e) => setSet(exIdx, setIdx, 'reps', parseInt(e.target.value) || 0)}
                        className={`rounded-lg border px-2 py-2 text-center text-sm font-semibold focus:outline-none ${set.done ? 'border-white/8 bg-ink-700/60' : 'border-white/8 bg-ink-700'}`}
                      />
                      <button onClick={() => toggleSet(exIdx, setIdx)} className={`ml-auto grid h-8 w-8 place-items-center rounded-lg border-2 transition active:scale-90 ${set.done ? 'border-brand-400 bg-brand-400' : isNext ? 'border-brand-400' : 'border-white/20'}`}>
                        {set.done && <Check size={16} strokeWidth={3} className="text-black" />}
                      </button>
                    </div>
                  )
                })}

                <button onClick={() => addSet(exIdx)} className="mt-1.5 flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-white/12 py-2 text-[13px] font-semibold text-white/55 active:bg-white/5">
                  <Plus size={14} /> Add set
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <button onClick={finish} className="btn-primary mt-5 w-full"><Flag size={16} /> Finish Workout</button>

      {rest !== null && (
        <RestTimer
          remaining={rest}
          total={restTotal}
          go={go}
          upNext={upNext}
          units={units}
          onSub={() => setRest((r) => Math.max(0, (r ?? 30) - 15))}
          onSkip={endRest}
          onAdd={() => { setRestTotal((t) => t + 15); setRest((r) => (r ?? 0) + 15) }}
          onDismiss={endRest}
        />
      )}
    </Sheet>
  )
}

function fmtClock(d: Date): string {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
}

function RestTimer({ remaining, total, go, upNext, units, onSub, onSkip, onAdd, onDismiss }: {
  remaining: number
  total: number
  go: boolean
  upNext: UpNext | null
  units: Units
  onSub: () => void
  onSkip: () => void
  onAdd: () => void
  onDismiss: () => void
}) {
  // GO state — ring/background fill brand-400 with the next set's target.
  if (go) {
    return (
      <button
        onClick={onDismiss}
        className="fixed inset-0 z-50 flex w-full flex-col items-center justify-center bg-brand-400 text-black"
        style={{ animation: 'screen-in 0.2s ease-out' }}
      >
        <span className="text-8xl font-black tracking-tight" style={{ animation: 'go-pop 0.3s cubic-bezier(0.22,1,0.36,1)' }}>GO</span>
        {upNext && (
          <div className="mt-4 text-center">
            <p className="text-2xl font-extrabold tabular-nums">{fmtWeightNum(upNext.weightKg, units, units === 'imperial' ? 0 : 1)} {weightUnit(units)} × {upNext.reps}</p>
            <p className="mt-1 text-sm font-bold uppercase tracking-[0.12em] text-black/60">{upNext.name}</p>
          </div>
        )}
        <span className="absolute bottom-12 text-[13px] font-semibold text-black/50">Tap to start</span>
      </button>
    )
  }

  const endTime = fmtClock(new Date(Date.now() + remaining * 1000))

  // Near-black background, kept dark regardless of theme for an immersive feel.
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-ink-900 text-white" style={{ animation: 'screen-in 0.25s ease-out', backgroundColor: '#0a0a0b' }}>
      <div className="flex flex-1 items-center justify-center px-7">
        <RestRing remaining={remaining} total={total} endTime={endTime} />
      </div>

      <div className="px-7 text-center">
        {upNext && (
          <p className="text-[15px] font-semibold text-white/45">
            Up next · Set {upNext.setIdx + 1} of {upNext.setsTotal}
            <span className="block text-white/70">{upNext.name}</span>
          </p>
        )}
      </div>

      <div className="px-7 pb-14 pt-8">
        <div className="flex items-center justify-center gap-7">
          <button onClick={onSub} className="grid h-[68px] w-[68px] place-items-center rounded-full bg-white/[0.08] text-sm font-bold active:scale-95 active:bg-white/[0.14]">−15s</button>
          <button onClick={onSkip} className="grid h-[68px] w-[68px] place-items-center rounded-full bg-brand-400/15 text-sm font-bold text-brand-400 active:scale-95 active:bg-brand-400/25">Skip</button>
          <button onClick={onAdd} className="grid h-[68px] w-[68px] place-items-center rounded-full bg-white/[0.08] text-sm font-bold active:scale-95 active:bg-white/[0.14]">+15s</button>
        </div>
      </div>
    </div>
  )
}

/** iOS Clock-style countdown ring. Resolution-independent via a 100×100 viewBox. */
function RestRing({ remaining, total, endTime }: { remaining: number; total: number; endTime: string }) {
  const stroke = 2.4 // viewBox units → ~7px on a ~300px ring
  const radius = (100 - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const pct = total > 0 ? Math.max(0, Math.min(1, remaining / total)) : 0
  const offset = circumference - pct * circumference
  // Swap to '#F5A524' (accent-orange) here to match the orange reference.
  const arcColor = '#7ED957' // brand-400
  return (
    <div className="relative" style={{ width: 'min(78vw, 360px)', aspectRatio: '1 / 1' }}>
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth={stroke} />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={arcColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s linear' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="flex items-center gap-1.5 text-[15px] font-medium tabular-nums text-white/40">
          <Bell size={14} /> {endTime}
        </span>
        <span className="mt-3 text-8xl tabular-nums tracking-tight text-white" style={{ fontWeight: 200 }}>
          {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}
        </span>
      </div>
    </div>
  )
}
