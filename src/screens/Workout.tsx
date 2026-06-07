import { useMemo, useState } from 'react'
import { CalendarDays, Clock, Play, ArrowUpDown, ChevronRight, Check, CheckSquare } from 'lucide-react'
import { Icon } from '../components/Icon'
import { ProgressBar, SegmentedTabs, ScreenHeader, Chip } from '../components/ui'
import {
  workoutSession,
  workoutStats,
  exercises as exerciseSeed,
  workoutProgram,
  exerciseLibrary,
  workoutHistory,
} from '../data/mockData'

const TABS = ['Today', 'Program', 'Exercises', 'History']

export default function Workout() {
  const [tab, setTab] = useState('Today')
  const [items, setItems] = useState(exerciseSeed)

  const completed = items.filter((e) => e.done).length
  const pct = Math.round((completed / items.length) * 100)

  function toggle(id: number) {
    setItems((prev) => prev.map((e) => (e.id === id ? { ...e, done: !e.done } : e)))
  }

  return (
    <div className="px-5 pt-2">
      <ScreenHeader
        title="Workout"
        trailing={
          <button className="grid h-10 w-10 place-items-center rounded-xl text-white/80 active:bg-white/5">
            <CalendarDays size={22} />
          </button>
        }
      />

      <SegmentedTabs tabs={TABS} active={tab} onChange={setTab} />

      <div className="mt-5">
        {tab === 'Today' && (
          <TodayTab items={items} pct={pct} completed={completed} toggle={toggle} />
        )}
        {tab === 'Program' && <ProgramTab />}
        {tab === 'Exercises' && <ExercisesTab />}
        {tab === 'History' && <HistoryTab />}
      </div>
    </div>
  )
}

function TodayTab({
  items,
  pct,
  completed,
  toggle,
}: {
  items: typeof exerciseSeed
  pct: number
  completed: number
  toggle: (id: number) => void
}) {
  return (
    <>
      {/* Session hero */}
      <div className="relative overflow-hidden rounded-2xl border border-white/5">
        <img src={workoutSession.image} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
        <div className="relative bg-gradient-to-r from-ink-900 via-ink-900/92 to-ink-900/30 p-5">
          <p className="text-sm font-semibold text-brand-400">{workoutSession.tag}</p>
          <h3 className="mt-1 text-3xl font-extrabold">{workoutSession.title}</h3>
          <div className="mt-2 flex items-center gap-1.5 text-sm text-white/65">
            <Clock size={15} /> {workoutSession.exercises} exercises • {workoutSession.duration}
          </div>
          <p className="mt-3 max-w-[230px] text-[13px] leading-snug text-white/55">
            {workoutSession.description}
          </p>
          <button className="btn-primary mt-4 w-full sm:w-auto">
            Start Workout <Play size={16} fill="currentColor" />
          </button>
        </div>
      </div>

      {/* Today's Progress */}
      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="section-title">Today's Progress</h2>
        </div>
        <div className="mb-1.5 flex items-center justify-between text-[13px] text-white/55">
          <span>
            {completed}/{items.length} exercises completed
          </span>
          <span className="font-semibold text-white">{pct}%</span>
        </div>
        <ProgressBar value={pct} />

        <div className="mt-4 grid grid-cols-3 gap-3 rounded-2xl border border-white/5 bg-ink-800 p-4">
          {workoutStats.map((s) => (
            <div key={s.label}>
              <Icon name={s.icon} size={18} color={s.color} />
              <p className="mt-1.5 text-[12px] text-white/55">{s.label}</p>
              <p className="text-lg font-extrabold leading-tight">
                {s.value}
                <span className="ml-0.5 text-xs font-medium text-white/50">{s.unit}</span>
              </p>
              <p className="text-[10px] font-medium" style={{ color: s.color }}>
                {s.delta}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Exercises list */}
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="section-title">Exercises</h2>
          <button className="flex items-center gap-1.5 rounded-full bg-ink-700 px-3 py-1.5 text-xs font-semibold text-white/70 active:bg-ink-600">
            <ArrowUpDown size={14} /> Reorder
          </button>
        </div>
        <div className="space-y-3">
          {items.map((e) => (
            <div
              key={e.id}
              className="flex items-center gap-3 rounded-2xl border border-white/5 bg-ink-800 p-3"
            >
              <button
                onClick={() => toggle(e.id)}
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition ${
                  e.done ? 'border-brand-400 bg-brand-400' : 'border-white/25'
                }`}
              >
                {e.done && <Check size={14} strokeWidth={3} className="text-black" />}
              </button>
              <img src={e.image} alt="" className="h-12 w-12 rounded-xl object-cover" loading="lazy" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold leading-tight">{e.name}</p>
                <p className="text-[12px] text-white/50">
                  {e.sets} sets • {e.reps} reps
                </p>
                <p className="text-[12px] text-white/40">Last: {e.last}</p>
              </div>
              <Chip color={e.done ? 'green' : 'gray'}>{e.weight}</Chip>
              <ChevronRight size={18} className="text-white/30" />
            </div>
          ))}
        </div>
      </div>

      {/* Finish Strong */}
      <div className="mt-5 flex items-center gap-3 rounded-2xl border border-white/5 bg-ink-800 p-4">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-400/15">
          <CheckSquare size={20} className="text-brand-400" />
        </div>
        <div className="flex-1">
          <p className="font-bold">Finish Strong</p>
          <p className="text-[13px] text-white/55">You're one step closer to your goal.</p>
        </div>
        <button className="flex items-center gap-1 text-sm font-semibold text-brand-400">
          View Program <ChevronRight size={16} />
        </button>
      </div>
      <div className="h-2" />
    </>
  )
}

function ProgramTab() {
  return (
    <div className="space-y-3">
      <p className="text-[13px] text-white/50">Your weekly split · 6-day Push/Pull/Legs</p>
      {workoutProgram.map((d) => (
        <div key={d.day} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-ink-800 p-4">
          <div className="w-16 shrink-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-white/40">{d.day}</p>
          </div>
          <div className="flex-1">
            <p className="font-bold">{d.name}</p>
            <p className="text-[12px] text-white/50">{d.focus}</p>
          </div>
          {d.exercises > 0 ? (
            <Chip color={d.done ? 'green' : 'gray'}>{d.exercises} ex</Chip>
          ) : (
            <Chip color="gray">Rest</Chip>
          )}
        </div>
      ))}
    </div>
  )
}

function ExercisesTab() {
  const [q, setQ] = useState('')
  const filtered = useMemo(
    () => exerciseLibrary.filter((e) => e.name.toLowerCase().includes(q.toLowerCase())),
    [q],
  )
  return (
    <div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search exercises…"
        className="mb-4 w-full rounded-xl border border-white/8 bg-ink-800 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-brand-400/50 focus:outline-none"
      />
      <div className="grid grid-cols-2 gap-3">
        {filtered.map((e) => (
          <div key={e.name} className="overflow-hidden rounded-2xl border border-white/5 bg-ink-800">
            <img src={e.image} alt="" className="h-24 w-full object-cover" loading="lazy" />
            <div className="p-3">
              <p className="truncate text-sm font-bold">{e.name}</p>
              <p className="text-[12px] text-white/45">{e.muscle}</p>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-2 py-8 text-center text-sm text-white/40">No exercises found.</p>
        )}
      </div>
    </div>
  )
}

function HistoryTab() {
  return (
    <div className="space-y-3">
      {workoutHistory.map((h) => (
        <div key={h.date + h.name} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-ink-800 p-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-400/15">
            <Icon name="dumbbell" size={20} color="#7ED957" />
          </div>
          <div className="flex-1">
            <p className="font-bold">{h.name}</p>
            <p className="text-[12px] text-white/45">{h.date}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold">{h.volume}</p>
            <p className="text-[12px] text-white/45">{h.duration}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
