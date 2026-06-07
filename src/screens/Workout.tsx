import { useMemo, useState } from 'react'
import { CalendarDays, Clock, Play, ChevronRight, Check, CheckSquare, Leaf } from 'lucide-react'
import { Icon } from '../components/Icon'
import { ProgressBar, SegmentedTabs, ScreenHeader, Chip } from '../components/ui'
import { useStore } from '../store/store'
import { useNav } from '../nav'
import { EXERCISES } from '../data/catalog'
import { fmtVolume, fmtWeight } from '../lib/format'
import { relativeLabel } from '../lib/date'
import { todaySession, sessionProgress, completedSessions } from '../store/selectors'

const TABS = ['Today', 'Program', 'Exercises', 'History']

export default function Workout() {
  const [tab, setTab] = useState('Today')
  return (
    <div className="px-5 pt-2">
      <ScreenHeader
        title="Workout"
        trailing={<button className="grid h-10 w-10 place-items-center rounded-xl text-white/80 active:bg-white/5"><CalendarDays size={22} /></button>}
      />
      <SegmentedTabs tabs={TABS} active={tab} onChange={setTab} />
      <div className="mt-5">
        {tab === 'Today' && <TodayTab />}
        {tab === 'Program' && <ProgramTab />}
        {tab === 'Exercises' && <ExercisesTab />}
        {tab === 'History' && <HistoryTab />}
      </div>
    </div>
  )
}

function TodayTab() {
  const { state, dispatch } = useStore()
  const nav = useNav()
  const units = state.settings.units
  const session = todaySession(state)
  const prog = sessionProgress(session)

  if (!session) {
    return (
      <div className="rounded-2xl border border-white/5 bg-ink-800 p-8 text-center">
        <p className="text-2xl">😌</p>
        <p className="mt-2 font-bold">Rest Day</p>
        <p className="mt-1 text-[13px] text-white/50">Recovery is where you grow. Try a mobility flow or a walk.</p>
        <button onClick={() => nav.open('quick')} className="btn-primary mx-auto mt-4">Quick mobility</button>
      </div>
    )
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border border-white/5">
        <img src={session.image} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
        <div className="relative bg-gradient-to-r from-ink-900 via-ink-900/92 to-ink-900/30 p-5">
          <p className="text-sm font-semibold text-brand-400">{session.focus}</p>
          <h3 className="mt-1 text-3xl font-extrabold">{session.name}</h3>
          <div className="mt-2 flex items-center gap-1.5 text-sm text-white/65">
            <Clock size={15} /> {session.exercises.length} exercises • ~{session.durationMin} min
          </div>
          <button onClick={() => nav.open('activeWorkout')} className="btn-primary mt-4">
            {session.completed ? 'Review Workout' : prog.done > 0 ? 'Resume Workout' : 'Start Workout'} <Play size={16} fill="currentColor" />
          </button>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="section-title mb-2">Today's Progress</h2>
        <div className="mb-1.5 flex items-center justify-between text-[13px] text-white/55">
          <span>{prog.done}/{prog.total} exercises completed</span>
          <span className="font-semibold text-white">{prog.pct}%</span>
        </div>
        <ProgressBar value={prog.pct} />
        <div className="mt-4 grid grid-cols-3 gap-3 rounded-2xl border border-white/5 bg-ink-800 p-4">
          <Stat icon="dumbbell" color="#7ED957" label="Volume" value={fmtVolume(session.volumeKg, units)} />
          <Stat icon="clock" color="#9AA0A6" label="Duration" value={`${session.durationMin} min`} />
          <Stat icon="flame" color="#9AA0A6" label="Calories" value={`${session.calories} kcal`} />
        </div>
      </div>

      <div className="mt-6">
        <h2 className="section-title mb-3">Exercises</h2>
        <div className="space-y-3">
          {session.exercises.map((e) => {
            const done = e.sets.length > 0 && e.sets.every((s) => s.done)
            const topWeight = Math.max(...e.sets.map((s) => s.weightKg))
            return (
              <div key={e.defId} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-ink-800 p-3">
                <button onClick={() => dispatch({ type: 'TOGGLE_EXERCISE_DONE', defId: e.defId })} className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition ${done ? 'border-brand-400 bg-brand-400' : 'border-white/25'}`}>
                  {done && <Check size={14} strokeWidth={3} className="text-black" />}
                </button>
                <img src={e.image} alt="" className="h-12 w-12 rounded-xl object-cover" loading="lazy" />
                <button onClick={() => nav.open('exerciseDetail', { defId: e.defId })} className="min-w-0 flex-1 text-left">
                  <p className="truncate font-bold leading-tight">{e.name}</p>
                  <p className="text-[12px] text-white/50">{e.targetSets} sets • {e.targetReps} reps · how to</p>
                </button>
                <Chip color={done ? 'green' : 'gray'}>{fmtWeight(topWeight, units, units === 'imperial' ? 0 : 1)}</Chip>
                <button onClick={() => nav.open('exerciseDetail', { defId: e.defId })}><ChevronRight size={18} className="text-white/30" /></button>
              </div>
            )
          })}
        </div>
      </div>

      <button onClick={() => nav.open('activeWorkout')} className="mt-5 flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-ink-800 p-4 text-left active:scale-[0.99]">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-400/15"><CheckSquare size={20} className="text-brand-400" /></div>
        <div className="flex-1">
          <p className="font-bold">Finish Strong</p>
          <p className="text-[13px] text-white/55">You're one step closer to your goal.</p>
        </div>
        <span className="flex items-center gap-1 text-sm font-semibold text-brand-400">Open <ChevronRight size={16} /></span>
      </button>
      <div className="h-2" />
    </>
  )
}

function ProgramTab() {
  const { state } = useStore()
  return (
    <div className="space-y-3">
      <p className="text-[13px] text-white/50">Your weekly split · {state.profile.daysPerWeek}-day program</p>
      {state.program.map((d) => (
        <div key={d.id} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-ink-800 p-4">
          <div className="w-12 shrink-0"><p className="text-[11px] font-semibold uppercase tracking-wide text-white/40">{d.day}</p></div>
          <div className="flex-1">
            <p className="font-bold">{d.name}</p>
            <p className="text-[12px] text-white/50">{d.focus}</p>
          </div>
          {d.rest ? <Chip color="gray">Rest</Chip> : <Chip color="green">{d.exerciseIds.length} ex</Chip>}
        </div>
      ))}
    </div>
  )
}

function ExercisesTab() {
  const { state } = useStore()
  const nav = useNav()
  const dorm = state.profile.equipment === 'dorm-bodyweight'
  const [q, setQ] = useState('')
  const filtered = useMemo(() => EXERCISES.filter((e) => e.name.toLowerCase().includes(q.toLowerCase()) || e.muscle.toLowerCase().includes(q.toLowerCase())), [q])
  return (
    <div>
      <button onClick={() => nav.open('beginner')} className="mb-4 flex w-full items-center gap-3 rounded-2xl border border-brand-400/20 bg-brand-400/[0.06] p-3.5 text-left active:scale-[0.99]">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-400/15"><Leaf size={18} className="text-brand-400" /></div>
        <div className="flex-1"><p className="text-sm font-bold leading-tight">New here?</p><p className="text-[12px] text-white/50">Start the beginner guide, no experience needed</p></div>
        <ChevronRight size={16} className="text-white/30" />
      </button>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search exercises or muscle…" className="mb-4 w-full rounded-xl border border-white/8 bg-ink-800 px-4 py-3 text-sm placeholder:text-white/35 focus:border-brand-400/50 focus:outline-none" />
      <div className="grid grid-cols-2 gap-3">
        {filtered.map((e) => (
          <button key={e.id} onClick={() => nav.open('exerciseDetail', { defId: e.id })} className="overflow-hidden rounded-2xl border border-white/5 bg-ink-800 text-left active:scale-[0.99]">
            <img src={e.image} alt="" className="h-24 w-full object-cover" loading="lazy" />
            <div className="p-3">
              <p className="truncate text-sm font-bold">{dorm && e.bodyweightAlt ? e.bodyweightAlt : e.name}</p>
              <p className="text-[12px] text-white/45">{e.muscle}</p>
              {dorm && e.bodyweightAlt && <Chip color="gray" className="mt-1.5">Bodyweight</Chip>}
            </div>
          </button>
        ))}
        {filtered.length === 0 && <p className="col-span-2 py-8 text-center text-sm text-white/40">No exercises found.</p>}
      </div>
    </div>
  )
}

function HistoryTab() {
  const { state } = useStore()
  const units = state.settings.units
  const history = completedSessions(state).sort((a, b) => b.dateKey.localeCompare(a.dateKey)).slice(0, 20)
  return (
    <div className="space-y-3">
      {history.map((h) => (
        <div key={h.id} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-ink-800 p-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-400/15"><Icon name="dumbbell" size={20} color="#7ED957" /></div>
          <div className="flex-1">
            <p className="font-bold">{h.name}</p>
            <p className="text-[12px] text-white/45">{relativeLabel(h.dateKey)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold">{fmtVolume(h.volumeKg, units)}</p>
            <p className="text-[12px] text-white/45">{h.durationMin} min</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function Stat({ icon, color, label, value }: { icon: string; color: string; label: string; value: string }) {
  return (
    <div>
      <Icon name={icon} size={18} color={color} />
      <p className="mt-1.5 text-[12px] text-white/55">{label}</p>
      <p className="text-lg font-extrabold leading-tight">{value}</p>
    </div>
  )
}
