import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, Plus, Minus, Timer, X, Flag } from 'lucide-react'
import { Sheet } from '../components/Sheet'
import { useStore } from '../store/store'
import { useToast } from '../components/Toast'
import { todaySession, sessionProgress } from '../store/selectors'
import { fmtWeightNum, toKg, weightUnit, fmtVolume } from '../lib/format'
import type { WorkoutSession } from '../store/types'

export default function ActiveWorkout({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch } = useStore()
  const toast = useToast()
  const units = state.settings.units
  const session = todaySession(state)

  const [elapsed, setElapsed] = useState(0)
  const [rest, setRest] = useState<number | null>(null)
  const startRef = useRef<number>(Date.now())

  // session timer
  useEffect(() => {
    if (!open) return
    startRef.current = Date.now() - elapsed * 1000
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)), 1000)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // rest countdown
  useEffect(() => {
    if (rest === null) return
    if (rest <= 0) {
      setRest(null)
      return
    }
    const t = setTimeout(() => setRest((r) => (r === null ? null : r - 1)), 1000)
    return () => clearTimeout(t)
  }, [rest])

  const prog = useMemo(() => sessionProgress(session), [session])

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
    if (!wasDone) setRest(90) // start rest timer when completing a set
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

  function finish() {
    dispatch({ type: 'COMPLETE_WORKOUT', id: session!.id })
    toast('Workout logged! 💪 +1 to your streak')
    onClose()
  }

  const mins = Math.floor(elapsed / 60)
  const secs = String(elapsed % 60).padStart(2, '0')

  return (
    <Sheet open={open} onClose={onClose} title={session.name} full>
      {/* live stats */}
      <div className="mb-4 grid grid-cols-3 gap-3 rounded-2xl border border-white/5 bg-ink-800 p-4 text-center">
        <div>
          <p className="text-[11px] text-white/45">Time</p>
          <p className="text-xl font-extrabold tabular-nums">
            {mins}:{secs}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-white/45">Volume</p>
          <p className="text-xl font-extrabold">{fmtVolume(session.volumeKg, units)}</p>
        </div>
        <div>
          <p className="text-[11px] text-white/45">Sets done</p>
          <p className="text-xl font-extrabold text-brand-400">
            {prog.done}/{prog.total}
          </p>
        </div>
      </div>

      {/* exercises */}
      <div className="space-y-4">
        {session.exercises.map((ex, exIdx) => (
          <div key={ex.defId} className="rounded-2xl border border-white/5 bg-ink-800 p-3.5">
            <div className="mb-2 flex items-center gap-3">
              <img src={ex.image} alt="" className="h-11 w-11 rounded-xl object-cover" loading="lazy" />
              <div className="flex-1">
                <p className="font-bold leading-tight">{ex.name}</p>
                <p className="text-[12px] text-white/45">
                  {ex.targetSets} sets · {ex.targetReps} reps
                </p>
              </div>
            </div>

            <div className="mb-1.5 grid grid-cols-[28px_1fr_1fr_44px] items-center gap-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-white/35">
              <span>Set</span>
              <span>{weightUnit(units)}</span>
              <span>Reps</span>
              <span className="text-right">Done</span>
            </div>

            {ex.sets.map((set, setIdx) => (
              <div key={setIdx} className="mb-1.5 grid grid-cols-[28px_1fr_1fr_44px] items-center gap-2">
                <span className="text-sm font-bold text-white/50">{setIdx + 1}</span>
                <input
                  inputMode="decimal"
                  defaultValue={fmtWeightNum(set.weightKg, units, units === 'imperial' ? 0 : 1)}
                  onBlur={(e) => setSet(exIdx, setIdx, 'weightKg', toKg(parseFloat(e.target.value) || 0, units))}
                  className={`rounded-lg border px-2 py-2 text-center text-sm font-semibold focus:outline-none ${set.done ? 'border-brand-400/30 bg-brand-400/10' : 'border-white/8 bg-ink-700'}`}
                />
                <input
                  inputMode="numeric"
                  defaultValue={set.reps}
                  onBlur={(e) => setSet(exIdx, setIdx, 'reps', parseInt(e.target.value) || 0)}
                  className={`rounded-lg border px-2 py-2 text-center text-sm font-semibold focus:outline-none ${set.done ? 'border-brand-400/30 bg-brand-400/10' : 'border-white/8 bg-ink-700'}`}
                />
                <button
                  onClick={() => toggleSet(exIdx, setIdx)}
                  className={`ml-auto grid h-8 w-8 place-items-center rounded-lg border-2 transition ${set.done ? 'border-brand-400 bg-brand-400' : 'border-white/20'}`}
                >
                  {set.done && <Check size={16} strokeWidth={3} className="text-black" />}
                </button>
              </div>
            ))}

            <button onClick={() => addSet(exIdx)} className="mt-1.5 flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-white/12 py-2 text-[13px] font-semibold text-white/55 active:bg-white/5">
              <Plus size={14} /> Add set
            </button>
          </div>
        ))}
      </div>

      <button onClick={finish} className="btn-primary mt-5 w-full">
        <Flag size={16} /> Finish Workout
      </button>

      {/* rest timer overlay */}
      {rest !== null && (
        <div className="absolute inset-x-0 bottom-0 z-10 m-3 flex items-center gap-3 rounded-2xl border border-brand-400/30 bg-ink-700/95 p-3.5 shadow-card backdrop-blur" style={{ animation: 'screen-in 0.2s ease-out' }}>
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-400/15">
            <Timer size={22} className="text-brand-400" />
          </div>
          <div className="flex-1">
            <p className="text-[12px] text-white/50">Rest</p>
            <p className="text-2xl font-extrabold tabular-nums leading-none">
              {Math.floor(rest / 60)}:{String(rest % 60).padStart(2, '0')}
            </p>
          </div>
          <button onClick={() => setRest((r) => (r ?? 0) + 15)} className="rounded-full bg-white/8 px-3 py-2 text-xs font-bold active:bg-white/15">
            +15s
          </button>
          <button onClick={() => setRest((r) => Math.max(0, (r ?? 30) - 15))} className="grid h-9 w-9 place-items-center rounded-full bg-white/8 active:bg-white/15">
            <Minus size={16} />
          </button>
          <button onClick={() => setRest(null)} className="grid h-9 w-9 place-items-center rounded-full bg-white/8 active:bg-white/15">
            <X size={16} />
          </button>
        </div>
      )}
    </Sheet>
  )
}
