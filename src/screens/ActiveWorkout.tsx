import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Check, Plus, Minus, Flag, Info, Bell, BookOpen, Play, Target,
  ChevronLeft, ChevronDown, Timer, Dumbbell, ListChecks, CircleHelp as HelpCircle, X,
} from 'lucide-react'
import { Sheet } from '../components/Sheet'
import { TechniqueClip } from '../components/TechniqueClip'
import { useStore } from '../store/store'
import { useToast } from '../components/Toast'
import { useNav } from '../nav'
import { todaySession, sessionProgress } from '../store/selectors'
import { nextSetRecommendation, examState, examTrim } from '../store/training'
import { prForSession, type PR } from '../store/coach'
import { exerciseDetail, exerciseWhy, workoutGoalLine, incrementFor } from '../data/catalog'
import { fmtWeightNum, weightUnit, fmtVolume, fmtWeight, toKg } from '../lib/format'
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
    /* Audio not available; silently ignore. */
  }
}

/** A short rising two-note chime for the workout-complete moment. */
function successChime() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    ;[660, 880, 1175].forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const t0 = ctx.currentTime + i * 0.12
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.0001, t0)
      gain.gain.exponentialRampToValueAtTime(0.2, t0 + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.22)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(t0)
      osc.stop(t0 + 0.24)
    })
    setTimeout(() => ctx.close(), 700)
  } catch {
    /* Audio not available; silently ignore. */
  }
}

type Mode = 'overview' | 'work' | 'rest' | 'go'
type Cursor = { exIdx: number; setIdx: number }

/** First not-done set at or after fromExIdx, wrapping back to earlier exercises. */
function nextUndoneCursor(s: WorkoutSession, fromExIdx: number): Cursor | null {
  const order = [
    ...s.exercises.map((_, i) => i).filter((i) => i >= fromExIdx),
    ...s.exercises.map((_, i) => i).filter((i) => i < fromExIdx),
  ]
  for (const i of order) {
    const setIdx = s.exercises[i].sets.findIndex((set) => !set.done)
    if (setIdx >= 0) return { exIdx: i, setIdx }
  }
  return null
}

function mmss(total: number): string {
  const m = Math.floor(total / 60)
  const s = String(Math.max(0, total) % 60).padStart(2, '0')
  return `${m}:${s}`
}

/** Rest ring colour: brand green at full → muted amber → soft red near zero.
 *  Kept at the site's calmer saturation/lightness so it never looks neon. */
function restColor(frac: number): string {
  const f = Math.max(0, Math.min(1, frac))
  return `hsl(${Math.round(96 * f)}, 64%, 60%)`
}

export default function ActiveWorkout({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch } = useStore()
  const toast = useToast()
  const nav = useNav()
  const units = state.settings.units
  const session = todaySession(state)

  const [mode, setMode] = useState<Mode>('overview')
  const [cursor, setCursor] = useState<Cursor | null>(null)
  const [workElapsed, setWorkElapsed] = useState(0)
  const [rest, setRest] = useState<number | null>(null)
  const [restTotal, setRestTotal] = useState(120)
  const [total, setTotal] = useState(0)
  const [detailIdx, setDetailIdx] = useState<number | null>(null)
  const [finishing, setFinishing] = useState(false)
  const [goalOpen, setGoalOpen] = useState(false)
  const [finishPR, setFinishPR] = useState<PR | null>(null)
  const finishStatsRef = useRef<{ time: number; volume: number; sets: number } | null>(null)
  const finishHandled = useRef(false)
  const startRef = useRef<number>(Date.now())

  // Fresh guided state every time the sheet opens.
  useEffect(() => {
    if (!open) return
    setMode('overview'); setCursor(null); setRest(null); setWorkElapsed(0); setTotal(0)
    setFinishing(false); setFinishPR(null); setDetailIdx(null)
    // Opening the workout counts as starting it for today's dashboard tick.
    if (session) dispatch({ type: 'MARK_WORKOUT_STARTED' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // After the completion tick, hand off to a PR moment or close.
  useEffect(() => {
    if (!finishing) return
    const t = setTimeout(() => afterFinish(), 4500)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finishing])

  // Overall session clock. Runs the whole time the sheet is open.
  useEffect(() => {
    if (!open) return
    startRef.current = Date.now()
    const t = setInterval(() => setTotal(Math.floor((Date.now() - startRef.current) / 1000)), 1000)
    return () => clearInterval(t)
  }, [open])

  // Work clock. Counts up while performing a set.
  useEffect(() => {
    if (!open || mode !== 'work') return
    const t = setInterval(() => setWorkElapsed((e) => e + 1), 1000)
    return () => clearInterval(t)
  }, [open, mode, cursor])

  // Rest clock. Counts down.
  useEffect(() => {
    if (mode !== 'rest' || rest === null || rest <= 0) return
    const t = setTimeout(() => setRest((r) => (r === null ? null : r - 1)), 1000)
    return () => clearTimeout(t)
  }, [mode, rest])

  // Rest reached zero → alert, then the GO cue.
  useEffect(() => {
    if (mode === 'rest' && rest === 0) {
      if (!prefersReducedMotion()) navigator.vibrate?.([200, 100, 200])
      beep()
      if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
        try { new Notification('Rest done. Start your next set') } catch { /* ignore */ }
      }
      setMode('go')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, rest])

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
      i !== exIdx ? ex : { ...ex, sets: ex.sets.map((s, j) => (j === setIdx ? { ...s, [field]: Math.max(0, value) } : s)) },
    )
    patch({ ...session, exercises })
  }

  function adjust(field: 'weightKg' | 'reps', dir: 1 | -1) {
    if (!session || !cursor) return
    const ex = session.exercises[cursor.exIdx]
    const cur = ex.sets[cursor.setIdx][field]
    const step = field === 'weightKg' ? incrementFor(ex.defId) : 1
    setSet(cursor.exIdx, cursor.setIdx, field, cur + dir * step)
  }

  function toggleSet(exIdx: number, setIdx: number) {
    if (!session) return
    const exercises = session.exercises.map((ex, i) =>
      i !== exIdx ? ex : { ...ex, sets: ex.sets.map((s, j) => (j === setIdx ? { ...s, done: !s.done } : s)) },
    )
    patch({ ...session, exercises })
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

  /* ---- guided flow controls ---- */
  function startGuided() {
    if (!session) return
    if (rest !== null) { setMode('rest'); return } // resume an in-progress rest
    const c = nextUndoneCursor(session, 0)
    if (!c) { toast('Every set is done. Finish when ready.'); return }
    setCursor(c); setWorkElapsed(0); setRest(null); setMode('work')
  }

  function startAt(exIdx: number) {
    if (!session) return
    const found = session.exercises[exIdx].sets.findIndex((s) => !s.done)
    setCursor({ exIdx, setIdx: found >= 0 ? found : 0 })
    setWorkElapsed(0); setRest(null); setMode('work')
  }

  // Finish the current set → log it done, then rest before the next set.
  function startRest() {
    if (!session || !cursor) return
    const { exIdx } = cursor
    const exercises = session.exercises.map((ex, i) =>
      i !== exIdx ? ex : { ...ex, sets: ex.sets.map((s, j) => (j === cursor.setIdx ? { ...s, done: true } : s)) },
    )
    const next = { ...session, exercises }
    patch(next)

    const upcoming = nextUndoneCursor(next, exIdx)
    if (!upcoming) { setCursor(null); setRest(null); setMode('overview'); toast('All sets logged. Finish strong.'); return }
    setCursor(upcoming)
    const secs = restSecondsFor(session.exercises[exIdx].defId)
    setRestTotal(secs); setRest(secs); setMode('rest')
  }

  function advance() {
    setRest(null); setWorkElapsed(0); setMode('work')
  }

  function backToList() {
    setMode('overview')
  }

  function finish() {
    if (!session || finishing) return
    finishStatsRef.current = { time: total, volume: session.volumeKg, sets: sessionProgress(session).done }
    setFinishPR(prForSession(state, session))
    dispatch({ type: 'COMPLETE_WORKOUT', id: session.id })
    if (!prefersReducedMotion()) navigator.vibrate?.([0, 55, 45, 120])
    successChime()
    finishHandled.current = false
    setFinishing(true)
  }

  function afterFinish() {
    if (finishHandled.current) return
    finishHandled.current = true
    setFinishing(false)
    if (finishPR) {
      nav.open('prCelebration', { lift: finishPR.name, weight: fmtWeight(finishPR.weightKg, units, units === 'imperial' ? 0 : 1), reps: finishPR.reps })
    } else {
      toast('Workout logged. Streak updated.')
      onClose()
    }
  }

  const cursorEx = cursor ? session.exercises[cursor.exIdx] : null
  const cursorSet = cursor && cursorEx ? cursorEx.sets[cursor.setIdx] : null
  const rec = cursorEx ? nextSetRecommendation(state, cursorEx.defId, cursorEx.targetReps, Math.max(...cursorEx.sets.map((s) => s.weightKg))) : null
  const allDone = prog.total > 0 && prog.done === prog.total
  // The current exercise = first one not yet fully done; only it gets highlighted.
  const activeIdx = session ? session.exercises.findIndex((ex) => !(ex.sets.length > 0 && ex.sets.every((s) => s.done))) : -1

  /* ============================ Guided focus screens ============================ */
  if (finishing) {
    return <FinishScreen name={session.name} stats={finishStatsRef.current} units={units} onDone={afterFinish} />
  }

  if (mode === 'work' && cursor && cursorEx && cursorSet) {
    return (
      <WorkScreen
        ex={cursorEx}
        cursor={cursor}
        set={cursorSet}
        elapsed={workElapsed}
        sessionTotal={total}
        units={units}
        coachHint={rec?.hasHistory ? rec : null}
        exIndex={cursor.exIdx}
        exTotal={session.exercises.length}
        detail={exerciseDetail(cursorEx.defId)}
        onBack={backToList}
        onAdjust={adjust}
        onApplyCoach={() => { if (rec) { setSet(cursor.exIdx, cursor.setIdx, 'weightKg', rec.suggestedWeightKg); setSet(cursor.exIdx, cursor.setIdx, 'reps', rec.suggestedReps) } }}
        onStartRest={startRest}
      />
    )
  }

  if ((mode === 'rest' || mode === 'go') && cursor && cursorEx && cursorSet && rest !== null) {
    return (
      <RestScreen
        go={mode === 'go'}
        remaining={Math.max(0, rest)}
        total={restTotal}
        nextEx={cursorEx}
        nextCursor={cursor}
        nextSet={cursorSet}
        units={units}
        onSub={() => setRest((r) => Math.max(0, (r ?? 30) - 15))}
        onAdd={() => { setRestTotal((t) => t + 15); setRest((r) => (r ?? 0) + 15) }}
        onSkip={advance}
        onGo={advance}
        onBack={backToList}
      />
    )
  }

  /* ================================ Overview ================================ */
  return (
    <Sheet open={open} onClose={onClose} title={session.name} full>
      {/* A clean, single-line CTA to launch the follow-along flow */}
      {!allDone && (
        <button
          onClick={startGuided}
          className="mb-4 flex w-full items-center justify-center gap-2.5 rounded-xl bg-brand-500 px-6 py-6 text-[15px] font-bold text-white transition active:scale-[0.98] hover:bg-brand-500/90"
        >
          <Play size={17} fill="currentColor" />
          {rest !== null ? 'Resume rest' : prog.done > 0 ? 'Resume workout' : 'Start workout'}
        </button>
      )}

      {exam.active && (
        <div className="mb-4 flex items-start gap-2.5 rounded-2xl border border-accent-purple/25 bg-accent-purple/10 p-3.5">
          <Info size={18} className="mt-0.5 shrink-0 text-accent-purple" />
          <p className="text-[13px] leading-snug text-white/70">
            Exam mode is on. Your {trim?.keptCount} key lifts are all you need today. The rest are optional, do them only if you have time and energy.
          </p>
        </div>
      )}

      {/* What today's session is for. Collapsed by default so the list leads. */}
      <div className="mb-4 overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.03]">
        <button onClick={() => setGoalOpen((o) => !o)} className="flex w-full items-center gap-1.5 px-3.5 py-2.5 active:bg-white/[0.03]">
          <Target size={13} className="text-brand-400/80" />
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-400/90">Today's goal</p>
          <ChevronDown size={15} className={`ml-auto text-white/40 transition-transform ${goalOpen ? 'rotate-180' : ''}`} />
        </button>
        {goalOpen && (
          <p className="px-3.5 pb-3 text-[13px] leading-snug text-white/70">
            {workoutGoalLine(session.name, session.focus, state.profile.goal)}
          </p>
        )}
      </div>

      <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.18em] text-white/35">{session.exercises.length} exercises</p>

      <div className="space-y-2.5">
        {session.exercises.map((ex, exIdx) => {
          const isOptional = trim?.optionalIds.has(ex.defId)
          const exDone = ex.sets.length > 0 && ex.sets.every((s) => s.done)
          const isActive = exIdx === activeIdx
          // Compact performance line: shared weight once, then each set's reps.
          const weights = ex.sets.map((s) => s.weightKg)
          const sameWeight = weights.length > 0 && weights.every((w) => w === weights[0])
          const lastLine = ex.sets.length === 0 ? null : sameWeight
            ? `${fmtWeightNum(weights[0], units, units === 'imperial' ? 0 : 1)}${weightUnit(units)} × ${ex.sets.map((s) => s.reps).join(', ')}`
            : ex.sets.map((s) => `${fmtWeightNum(s.weightKg, units, units === 'imperial' ? 0 : 1)}${weightUnit(units)}×${s.reps}`).join(', ')
          return (
            <div key={ex.defId} className={`rounded-2xl border p-3.5 transition ${isActive ? 'border-brand-400/50 bg-brand-400/[0.05] shadow-[0_0_22px_-8px_rgba(126,217,87,0.55)]' : 'border-white/[0.04] bg-ink-800'} ${isOptional ? 'opacity-70' : ''}`}>
              <div className="flex gap-3.5">
                <div className="relative shrink-0 self-start">
                  <img src={ex.image} alt="" className="h-[88px] w-[88px] rounded-xl object-cover brightness-110 ring-1 ring-white/10" loading="lazy" />
                  {exDone && (
                    <div className="absolute inset-0 grid place-items-center rounded-xl bg-black/45 ring-1 ring-brand-400/40">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-400 shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
                        <Check size={14} strokeWidth={3.5} className="text-black" />
                      </span>
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[17px] font-bold leading-tight">{ex.name}</p>
                    {isActive && <span className="shrink-0 rounded-full bg-brand-400/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-300">Now</span>}
                    {isOptional && <span className="shrink-0 rounded-full bg-white/8 px-2 py-0.5 text-[10px] font-semibold text-white/55">Optional</span>}
                  </div>
                  <p className="mt-1 text-[12px] font-medium text-white/45">{ex.targetSets} sets · {ex.targetReps} reps</p>
                  {lastLine && (
                    <p className="mt-2 text-[12px] leading-snug">
                      <span className="text-white/35">Last: </span>
                      <span className="font-semibold tabular-nums text-white/70">{lastLine}</span>
                    </p>
                  )}

                  {/* Actions */}
                  <div className="mt-3.5 flex gap-2">
                    <button onClick={() => setDetailIdx(exIdx)} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white/[0.09] py-2 text-[12px] font-semibold text-white/85 active:bg-white/[0.14]">
                      <BookOpen size={14} /> Form & video
                    </button>
                    <button onClick={() => startAt(exIdx)} className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-[12px] font-bold transition ${isActive ? 'bg-brand-400 text-black active:bg-brand-300' : 'bg-white/[0.09] text-white/85 active:bg-white/[0.14]'}`}>
                      <Play size={13} fill="currentColor" /> {exDone ? 'Redo' : 'Start'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <button onClick={finish} className={`mt-5 flex w-full items-center justify-center gap-2 rounded-full py-3.5 font-bold transition active:scale-[0.98] ${allDone ? 'bg-brand-400 text-black shadow-glow' : 'border border-white/10 bg-green-600 text-white'}`}>
        <Flag size={16} /> Finish workout
      </button>
      <div className="h-2" />

      {/* Form & video. Pops out over the page instead of expanding inline */}
      {detailIdx !== null && session.exercises[detailIdx] && createPortal(
        (() => {
          const ex = session.exercises[detailIdx]
          const detail = exerciseDetail(ex.defId)
          const close = () => setDetailIdx(null)
          return (
            <div className="fixed inset-0 z-[70] flex flex-col justify-end" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
              <button aria-label="Close" onClick={close} className="absolute inset-0 bg-black/65 backdrop-blur-sm animate-fade-in" />
              <div className="animate-sheet-up relative flex max-h-[90%] flex-col rounded-t-3xl border-t border-white/10 bg-ink-900">
                <div className="flex shrink-0 items-center justify-between gap-3 px-5 pb-3 pt-4">
                  <span className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-white/20" />
                  <div className="min-w-0">
                    <p className="truncate text-[17px] font-bold leading-tight">{ex.name}</p>
                    <p className="text-[12px] font-semibold text-brand-400">{ex.targetSets} sets · {ex.targetReps} reps</p>
                  </div>
                  <button onClick={close} className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/8 text-white/70 active:bg-white/15"><X size={18} /></button>
                </div>

                <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pb-8">
                  <TechniqueClip poster={ex.image} videoUrl={detail.video} label="Form clip coming soon" />

                  {/* Why this exercise serves your goal */}
                  <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-brand-400/20 bg-brand-400/[0.06] p-3.5">
                    <Target size={16} className="mt-0.5 shrink-0 text-brand-400" />
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-brand-400">Why you're doing this</p>
                      <p className="mt-1 text-[13.5px] leading-snug text-white/80">{exerciseWhy(ex.defId, state.profile.goal)}</p>
                    </div>
                  </div>

                  <p className="mt-4 text-[14px] leading-snug text-white/75">{detail.desc}</p>

                  <p className="mb-2 mt-5 text-[12px] font-bold uppercase tracking-wide text-white/40">Step by step</p>
                  <ol className="space-y-2.5">
                    {detail.cues.map((c, i) => (
                      <li key={i} className="flex items-start gap-3 text-[14px]">
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-400/15 text-[12px] font-bold text-brand-400">{i + 1}</span>
                        <span className="text-white/80">{c}</span>
                      </li>
                    ))}
                  </ol>

                  <div className="mt-4 flex gap-2.5 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5">
                    <Info size={17} className="mt-0.5 shrink-0 text-accent-orange" />
                    <p className="text-[13px] leading-snug text-white/70"><span className="font-semibold text-white/85">Avoid: </span>{detail.commonMistake}</p>
                  </div>

                  <button onClick={() => { close(); nav.open('exerciseDetail', { defId: ex.defId }) }} className="mt-3 flex items-center gap-1.5 text-[13px] font-semibold text-brand-400 active:opacity-70">
                    <BookOpen size={14} /> Open full guide
                  </button>

                  {/* Manual set editor stays available for tweaks */}
                  <div className="mt-5 space-y-1.5 border-t border-white/8 pt-4">
                    <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-white/35">Log manually</p>
                    {ex.sets.map((set, setIdx) => (
                      <div key={setIdx} className="grid grid-cols-[24px_1fr_1fr_40px] items-center gap-2">
                        <span className="text-[12px] font-bold text-white/45">{setIdx + 1}</span>
                        <input
                          key={`w-${detailIdx}-${setIdx}-${set.weightKg}`}
                          inputMode="decimal"
                          defaultValue={fmtWeightNum(set.weightKg, units, units === 'imperial' ? 0 : 1)}
                          onBlur={(e) => setSet(detailIdx, setIdx, 'weightKg', toKg(parseFloat(e.target.value) || 0, units))}
                          className="rounded-lg border border-white/8 bg-ink-700 px-2 py-1.5 text-center text-[13px] font-semibold focus:outline-none"
                        />
                        <input
                          key={`r-${detailIdx}-${setIdx}-${set.reps}`}
                          inputMode="numeric"
                          defaultValue={set.reps}
                          onBlur={(e) => setSet(detailIdx, setIdx, 'reps', parseInt(e.target.value) || 0)}
                          className="rounded-lg border border-white/8 bg-ink-700 px-2 py-1.5 text-center text-[13px] font-semibold focus:outline-none"
                        />
                        <button onClick={() => toggleSet(detailIdx, setIdx)} className={`ml-auto grid h-7 w-7 place-items-center rounded-lg border-2 transition active:scale-90 ${set.done ? 'border-brand-400 bg-brand-400' : 'border-white/20'}`}>
                          {set.done && <Check size={14} strokeWidth={3} className="text-black" />}
                        </button>
                      </div>
                    ))}
                    <button onClick={() => addSet(detailIdx)} className="mt-1 flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-white/12 py-1.5 text-[12px] font-semibold text-white/55 active:bg-white/5">
                      <Plus size={13} /> Add set
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })(),
        document.body,
      )}
    </Sheet>
  )
}

/* ============================ Work screen ============================ */
function WorkScreen({
  ex, cursor, set, elapsed, sessionTotal, units, coachHint, exIndex, exTotal, detail,
  onBack, onAdjust, onApplyCoach, onStartRest,
}: {
  ex: WorkoutSession['exercises'][number]
  cursor: Cursor
  set: { weightKg: number; reps: number; done: boolean }
  elapsed: number
  sessionTotal: number
  units: Units
  coachHint: { suggestedWeightKg: number; suggestedReps: number } | null
  exIndex: number
  exTotal: number
  detail: { desc: string; cues: string[]; commonMistake: string; video?: string }
  onBack: () => void
  onAdjust: (field: 'weightKg' | 'reps', dir: 1 | -1) => void
  onApplyCoach: () => void
  onStartRest: () => void
}) {
  const [showHow, setShowHow] = useState(false)
  const lastSet = cursor.setIdx + 1 >= ex.sets.length

  return (
    <div className="fixed inset-0 z-50 flex flex-col text-white" style={{ backgroundColor: '#0a0a0b', animation: 'screen-in 0.25s ease-out' }}>
      {/* Faint exercise backdrop for context */}
      <img src={ex.image} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.10]" style={{ filter: 'grayscale(1) contrast(1.1)' }} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink-900/40 via-transparent to-ink-900" />

      <div className="relative flex flex-col" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        {/* Top bar with a clear way back to the full list */}
        <div className="flex items-center justify-between px-5 pb-2 pt-4">
          <button onClick={onBack} className="flex items-center gap-1.5 rounded-full bg-white/[0.06] py-2 pl-2.5 pr-3.5 text-[13px] font-semibold text-white/80 active:bg-white/[0.12]">
            <ListChecks size={15} /> All exercises
          </button>
          <span className="flex items-center gap-1.5 text-[13px] font-semibold tabular-nums text-white/45">
            <Timer size={14} /> {mmss(sessionTotal)}
          </span>
        </div>

        {/* Where am I: exercise position, name, what it is */}
        <div className="px-6 text-center">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-brand-400">
            Exercise {exIndex + 1} of {exTotal} · Set {cursor.setIdx + 1} of {ex.sets.length}
          </p>
          <h2 className="mt-1.5 text-[26px] font-black leading-tight tracking-tight">{ex.name}</h2>


          <SetDots sets={ex.sets} current={cursor.setIdx} />
          <button
            onClick={() => setShowHow(true)}
            className="mx-auto mt-3 flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.05] py-1.5 pl-3 pr-3.5 text-[12px] font-semibold text-white/75 active:bg-white/[0.1]"
          >
            <HelpCircle size={14} /> Not sure how? Show me
          </button>
        </div>
      </div>

      {/* Big count-up timer: plain number, faint static green ring */}
      <div className="relative flex flex-1 items-center justify-center">
        <div className="relative grid place-items-center" style={{ width: 'min(74vw, 320px)', aspectRatio: '1 / 1' }}>
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90">
            <circle cx="50" cy="50" r="47.6" fill="none" stroke="rgba(126,217,87,0.14)" strokeWidth="1.6" />
            <circle cx="50" cy="50" r="47.6" fill="none" stroke="#7ED957" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="2 7" opacity="0.7" />
          </svg>
          <div className="animate-timer-in text-center leading-none">
            <p className="text-[13px] font-black uppercase tracking-[0.3em] text-brand-400">Work</p>
            <p className="mt-2 text-[64px] font-black tabular-nums tracking-tight text-white" style={{ textShadow: '0 0 40px rgba(126,217,87,0.25)' }}>
              {mmss(elapsed)}
            </p>
            <p className="mt-1 text-[13px] font-semibold text-white/40">Aim for {ex.targetReps} reps</p>
          </div>
        </div>
      </div>

      {/* Editable target: weight × reps */}
      <div className="relative px-6">
        <p className="mb-2 text-center text-[11px] font-bold uppercase tracking-[0.16em] text-white/35">Log this set</p>
        <div className="grid grid-cols-2 gap-3">
          <Stepper label={weightUnit(units)} value={fmtWeightNum(set.weightKg, units, units === 'imperial' ? 0 : 1)} onMinus={() => onAdjust('weightKg', -1)} onPlus={() => onAdjust('weightKg', 1)} />
          <Stepper label="reps" value={String(set.reps)} onMinus={() => onAdjust('reps', -1)} onPlus={() => onAdjust('reps', 1)} />
        </div>
        {coachHint && (
          <button onClick={onApplyCoach} className="mx-auto mt-3 flex items-center gap-1.5 rounded-full border border-brand-400/25 bg-brand-400/[0.06] py-1.5 pl-3 pr-3.5 text-[12px] font-semibold text-brand-400 active:scale-95">
            <Dumbbell size={13} /> Coach suggests {fmtWeightNum(coachHint.suggestedWeightKg, units, units === 'imperial' ? 0 : 1)} {weightUnit(units)} × {coachHint.suggestedReps}
          </button>
        )}
      </div>

      {/* Primary action + what's coming */}
      <div className="relative px-6 pb-12 pt-5" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 2.25rem)' }}>
        <button onClick={onStartRest} className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-brand-400 py-5 text-[18px] font-black uppercase tracking-wide text-black shadow-glow transition active:scale-[0.98]">
          <Check size={20} strokeWidth={3} /> {lastSet ? 'Done, finish exercise' : 'Done, start rest'}
        </button>
      </div>

      {/* On-demand "how to do this", keeps the main screen simple */}
      {showHow && (
        <div className="absolute inset-0 z-10 flex flex-col" style={{ backgroundColor: '#0a0a0b', animation: 'screen-in 0.2s ease-out', paddingTop: 'env(safe-area-inset-top)' }}>
          <div className="flex shrink-0 items-center justify-between px-5 pb-3 pt-4">
            <p className="text-[15px] font-bold">How to: {ex.name}</p>
            <button onClick={() => setShowHow(false)} className="grid h-8 w-8 place-items-center rounded-full bg-white/8 text-white/70 active:bg-white/15"><X size={18} /></button>
          </div>
          <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pb-8">
            <TechniqueClip poster={ex.image} videoUrl={detail.video} label="Form clip coming soon" />
            <p className="mt-3 text-[14px] leading-snug text-white/75">{detail.desc}</p>
            <p className="mb-2 mt-5 text-[12px] font-bold uppercase tracking-wide text-white/40">Step by step</p>
            <ol className="space-y-2.5">
              {detail.cues.map((c, i) => (
                <li key={i} className="flex items-start gap-3 text-[14px]">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-400/15 text-[12px] font-bold text-brand-400">{i + 1}</span>
                  <span className="text-white/80">{c}</span>
                </li>
              ))}
            </ol>
            <div className="mt-4 flex gap-2.5 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5">
              <Info size={17} className="mt-0.5 shrink-0 text-accent-orange" />
              <p className="text-[13px] leading-snug text-white/70"><span className="font-semibold text-white/85">Avoid: </span>{detail.commonMistake}</p>
            </div>
            <button onClick={() => setShowHow(false)} className="btn-primary mt-5 w-full">Got it</button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ============================ Finish screen ============================ */
function FinishScreen({ name, stats, units, onDone }: {
  name: string
  stats: { time: number; volume: number; sets: number } | null
  units: Units
  onDone: () => void
}) {
  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center px-8 text-center text-white" style={{ backgroundColor: '#0a0a0b', animation: 'screen-in 0.3s ease-out' }}>
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 38%, rgba(126,217,87,0.16), transparent 60%)' }} />

      {/* The satisfying green tick */}
      <div className="relative grid place-items-center">
        <span className="burst-ring absolute h-44 w-44 rounded-full border-2 border-brand-400/50" />
        <span className="burst-ring absolute h-44 w-44 rounded-full bg-brand-400/10" style={{ animationDelay: '0.45s' }} />
        <div className="tick-pop relative grid h-36 w-36 place-items-center rounded-full bg-brand-400 shadow-glow">
          <svg viewBox="0 0 56 56" className="h-[5.5rem] w-[5.5rem]">
            <circle cx="28" cy="28" r="26" fill="none" stroke="rgba(0,0,0,0.16)" strokeWidth="3" className="tick-ring-circle" />
            <path d="M16 29 l8 8 l16 -18" fill="none" stroke="#0a0a0b" strokeWidth="4.6" strokeLinecap="round" strokeLinejoin="round" className="tick-ring-check" />
          </svg>
        </div>
      </div>

      <h2 className="animate-fade-up relative mt-9 text-[28px] font-black tracking-tight" style={{ animationDelay: '0.5s' }}>Workout complete</h2>
      <p className="animate-fade-up relative mt-1 text-[15px] text-white/55" style={{ animationDelay: '0.58s' }}>{name} · that's another one in the bank</p>

      {stats && (
        <div className="animate-fade-up relative mt-8 flex items-center gap-7" style={{ animationDelay: '0.66s' }}>
          <FinishStat label="Time" value={mmss(stats.time)} />
          <span className="h-8 w-px bg-white/10" />
          <FinishStat label="Volume" value={fmtVolume(stats.volume, units)} />
          <span className="h-8 w-px bg-white/10" />
          <FinishStat label="Sets" value={String(stats.sets)} />
        </div>
      )}

      <button onClick={onDone} className="animate-fade-up btn-primary relative mt-10 w-full max-w-xs" style={{ animationDelay: '0.82s' }}>Done</button>
    </div>
  )
}

function FinishStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[20px] font-black tabular-nums leading-none">{value}</p>
      <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-white/40">{label}</p>
    </div>
  )
}

/* ============================ Rest screen ============================ */
function fmtClock(d: Date): string {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
}

function RestScreen({
  go, remaining, total, nextEx, nextCursor, nextSet, units, onSub, onAdd, onSkip, onGo, onBack,
}: {
  go: boolean
  remaining: number
  total: number
  nextEx: WorkoutSession['exercises'][number]
  nextCursor: Cursor
  nextSet: { weightKg: number; reps: number }
  units: Units
  onSub: () => void
  onAdd: () => void
  onSkip: () => void
  onGo: () => void
  onBack: () => void
}) {
  // GO flash when rest hits zero.
  if (go) {
    return (
      <button onClick={onGo} className="fixed inset-0 z-50 flex w-full flex-col items-center justify-center bg-brand-400 text-black" style={{ animation: 'screen-in 0.2s ease-out' }}>
        <span className="text-8xl font-black tracking-tight" style={{ animation: 'go-pop 0.3s cubic-bezier(0.22,1,0.36,1)' }}>GO</span>
        <div className="mt-4 text-center">
          <p className="text-2xl font-extrabold tabular-nums">{fmtWeightNum(nextSet.weightKg, units, units === 'imperial' ? 0 : 1)} {weightUnit(units)} × {nextSet.reps}</p>
          <p className="mt-1 text-sm font-black uppercase tracking-[0.14em] text-black/60">{nextEx.name} · Set {nextCursor.setIdx + 1}</p>
        </div>
        <span className="absolute bottom-12 text-[13px] font-semibold text-black/50">Tap to begin</span>
      </button>
    )
  }

  const frac = total > 0 ? Math.max(0, Math.min(1, remaining / total)) : 0
  const color = restColor(frac)
  const endTime = fmtClock(new Date(Date.now() + remaining * 1000))
  const stroke = 3.4
  const radius = (100 - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - frac * circumference

  return (
    <div className="fixed inset-0 z-50 flex flex-col text-white" style={{ backgroundColor: '#0a0a0b', animation: 'screen-in 0.25s ease-out' }}>
      <div className="flex flex-col" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="flex items-center justify-between px-5 pb-2 pt-4">
          <button onClick={onBack} className="flex items-center gap-1 rounded-full bg-white/[0.06] py-2 pl-2 pr-3.5 text-[13px] font-semibold text-white/80 active:bg-white/[0.12]">
            <ChevronLeft size={16} /> List
          </button>
          <span className="text-[11px] font-black uppercase tracking-[0.28em]" style={{ color }}>Rest</span>
          <button onClick={onSkip} className="rounded-full bg-white/[0.06] px-3.5 py-2 text-[13px] font-semibold text-white/80 active:bg-white/[0.12]">Skip</button>
        </div>
      </div>

      {/* Countdown ring, green → red */}
      <div className="flex flex-1 items-center justify-center px-7">
        <div className="relative" style={{ width: 'min(80vw, 360px)', aspectRatio: '1 / 1' }}>
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
            <circle
              cx="50" cy="50" r={radius} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 1s linear, stroke 1s linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
            <span className="flex items-center gap-1.5 text-[14px] font-medium tabular-nums text-white/40"><Bell size={13} /> {endTime}</span>
            <span className="mt-3 text-[72px] font-black tabular-nums tracking-tight" style={{ color }}>{mmss(remaining)}</span>
            <span className="mt-2 text-[12px] font-bold uppercase tracking-[0.2em] text-white/35">until next set</span>
          </div>
        </div>
      </div>

      {/* Up next */}
      <div className="px-7 text-center">
        <div className="mx-auto inline-flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3">
          <img src={nextEx.image} alt="" className="h-10 w-10 rounded-lg object-cover" loading="lazy" />
          <div className="text-left">
            <p className="text-[11px] font-bold uppercase tracking-wide text-white/40">Up next · Set {nextCursor.setIdx + 1} of {nextEx.sets.length}</p>
            <p className="text-[15px] font-extrabold leading-tight">{nextEx.name}</p>
            <p className="text-[12px] font-semibold text-brand-400">{fmtWeightNum(nextSet.weightKg, units, units === 'imperial' ? 0 : 1)} {weightUnit(units)} × {nextSet.reps}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="px-7 pt-7" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 3rem)' }}>
        <div className="flex items-center justify-center gap-5">
          <button onClick={onSub} className="grid h-16 w-16 place-items-center rounded-full bg-white/[0.08] text-sm font-bold active:scale-95 active:bg-white/[0.14]">−15s</button>
          <button onClick={onSkip} className="grid h-20 w-20 place-items-center rounded-full bg-brand-400 text-[15px] font-black uppercase text-black shadow-glow active:scale-95">
            <span className="flex flex-col items-center leading-none"><Play size={20} fill="currentColor" /></span>
          </button>
          <button onClick={onAdd} className="grid h-16 w-16 place-items-center rounded-full bg-white/[0.08] text-sm font-bold active:scale-95 active:bg-white/[0.14]">+15s</button>
        </div>
        <p className="mt-3 text-center text-[12px] font-semibold text-white/35">Tap the centre to start now</p>
      </div>
    </div>
  )
}

/* Small set-progress segments. */
function SetDots({ sets, current }: { sets: { done: boolean }[]; current: number }) {
  return (
    <div className="mt-3 flex items-center justify-center gap-1.5">
      {sets.map((s, i) => (
        <span
          key={i}
          className="h-1.5 rounded-full transition-all"
          style={{
            width: i === current ? 26 : 14,
            backgroundColor: s.done ? '#7ED957' : i === current ? 'rgba(126,217,87,0.55)' : 'rgba(255,255,255,0.16)',
          }}
        />
      ))}
    </div>
  )
}

function Stepper({ label, value, onMinus, onPlus }: { label: string; value: string; onMinus: () => void; onPlus: () => void }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-2">
      <div className="flex items-center justify-between gap-1">
        <button onClick={onMinus} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/[0.06] active:scale-90 active:bg-white/[0.12]"><Minus size={18} /></button>
        <div className="min-w-0 text-center">
          <p className="truncate text-[22px] font-black leading-none tabular-nums">{value}</p>
          <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-white/40">{label}</p>
        </div>
        <button onClick={onPlus} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/[0.06] active:scale-90 active:bg-white/[0.12]"><Plus size={18} /></button>
      </div>
    </div>
  )
}
