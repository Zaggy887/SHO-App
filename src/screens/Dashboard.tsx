import { Menu, Bell, Clock, Play, GraduationCap, Trophy, ChevronRight } from 'lucide-react'
import { Icon } from '../components/Icon'
import { ProgressRing } from '../components/ui'
import { useStore } from '../store/store'
import { useNav } from '../nav'
import { currentWeekKeys, todayKey } from '../lib/date'
import { fmtFluid, fmtWeightNum, weightUnit, pct } from '../lib/format'
import {
  todayHabit, todaySession, weightStats, workoutsThisWeek, workoutsInRange,
  strengthProgress, streakStats, unreadNotifs,
} from '../store/selectors'

const WD = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function Dashboard() {
  const { state } = useStore()
  const nav = useNav()
  const units = state.settings.units
  const habit = todayHabit(state)
  const session = todaySession(state)
  const w = weightStats(state)
  const thisWeek = workoutsThisWeek(state)
  const lastWeek = workoutsInRange(state, 14) - thisWeek
  const strengthAvg = (() => {
    const sp = strengthProgress(state)
    return sp.length ? Math.round(sp.reduce((a, s) => a + s.pct, 0) / sp.length) : 0
  })()
  const streak = streakStats(state)
  const unread = unreadNotifs(state)
  const challenge = state.challenges.find((c) => c.joined)

  const hour = 9
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const weekKeys = currentWeekKeys()

  const habitRings = [
    { icon: 'footprints', label: 'Steps', value: habit.steps.toLocaleString(), pct: pct(habit.steps, state.profile.stepTarget), color: '#7ED957' },
    { icon: 'bed', label: 'Sleep', value: `${habit.sleepH} hrs`, pct: pct(habit.sleepH, state.profile.sleepTargetH), color: '#7ED957' },
    { icon: 'droplet', label: 'Water', value: fmtFluid(habit.waterL, units), pct: pct(habit.waterL, state.profile.waterTargetL), color: '#7ED957' },
    { icon: 'utensils', label: 'Nutrition', value: `${habit.nutritionScore}/10`, pct: habit.nutritionScore * 10, color: habit.nutritionScore >= 7 ? '#7ED957' : '#F5A524' },
    { icon: 'leaf', label: 'Mindset', value: `${habit.mindsetMin} min`, pct: pct(habit.mindsetMin, 10), color: '#7ED957' },
  ]

  return (
    <div className="px-5 pt-2">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <button onClick={() => nav.open('profile')} className="grid h-10 w-10 place-items-center rounded-xl text-white/80 active:bg-white/5">
          <Menu size={24} />
        </button>
        <button onClick={() => nav.open('notifications')} className="relative grid h-10 w-10 place-items-center rounded-xl text-white/80 active:bg-white/5">
          <Bell size={22} />
          {unread > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-ink-900" />}
        </button>
      </div>

      <h1 className="text-[26px] font-extrabold tracking-tight">
        {greeting}, {state.profile.name} <span className="align-middle">👋</span>
      </h1>
      <p className="mt-1 text-[15px] text-white/45">Stay consistent, results follow.</p>

      {/* Week selector */}
      <div className="no-scrollbar -mx-5 mt-5 flex gap-2.5 overflow-x-auto px-5">
        {weekKeys.map((k, i) => {
          const active = k === todayKey
          const trained = state.sessions.some((s) => s.dateKey === k && s.completed)
          const date = parseInt(k.slice(-2))
          return (
            <div key={k} className={`flex h-[68px] w-[46px] shrink-0 flex-col items-center justify-center gap-1 rounded-2xl border ${active ? 'border-brand-400 bg-brand-400 text-black' : 'border-white/8 bg-ink-800 text-white/70'}`}>
              <span className="text-[11px] font-semibold opacity-80">{WD[i]}</span>
              <span className="text-lg font-bold">{date}</span>
              {(trained || active) && <span className={`h-1 w-1 rounded-full ${active ? 'bg-black/70' : 'bg-brand-400'}`} />}
            </div>
          )
        })}
      </div>

      {/* Today's Plan */}
      <div className="relative mt-5 overflow-hidden rounded-2xl border border-white/5">
        <img src={session?.image ?? ''} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
        <div className="relative bg-gradient-to-r from-ink-900 via-ink-900/90 to-ink-900/30 p-5">
          <p className="text-sm font-semibold text-brand-400">Today's Plan</p>
          <h3 className="mt-1 text-2xl font-extrabold">{session?.name ?? 'Rest Day'}</h3>
          <div className="mt-2 flex items-center gap-1.5 text-sm text-white/60">
            <Clock size={15} /> {session ? `${session.exercises.length} exercises · ~50 min` : 'Recovery & mobility'}
          </div>
          {session && (
            <button onClick={() => nav.open('activeWorkout')} className="btn-primary mt-4">
              <Play size={16} fill="currentColor" /> {session.completed ? 'View Workout' : 'Start Workout'}
            </button>
          )}
        </div>
      </div>

      {/* Quick workouts */}
      <button onClick={() => nav.open('quick')} className="mt-3 flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-ink-800 p-3.5 text-left active:scale-[0.99]">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-400/15"><Clock size={20} className="text-brand-400" /></div>
        <div className="flex-1">
          <p className="font-bold leading-tight">Got 15 minutes?</p>
          <p className="text-[12px] text-white/50">Express workouts between lectures</p>
        </div>
        <ChevronRight size={18} className="text-white/30" />
      </button>

      {/* Progress Overview */}
      <Section title="Progress Overview" action="See All" onAction={() => nav.goTab('progress')} />
      <div className="grid grid-cols-3 gap-3">
        <OverviewCard icon="dumbbell" color="#7ED957" label="Workouts" value={String(thisWeek)} sub="This week" delta={`${thisWeek >= lastWeek ? '↑' : '↓'} ${Math.abs(thisWeek - lastWeek)}`} />
        <OverviewCard icon="trending" color="#8B5CF6" label="Strength" value={`+${strengthAvg}%`} sub="4 weeks" delta="↑" />
        <OverviewCard icon="scale" color="#3B82F6" label="Body Weight" value={fmtWeightNum(w.current, units)} unit={weightUnit(units)} sub="" delta={`${w.delta <= 0 ? '↓' : '↑'} ${Math.abs(w.delta).toFixed(1)}`} />
      </div>

      {/* Habit Tracker */}
      <Section title="Habit Tracker" action="Log" onAction={() => nav.open('logHabit')} />
      <button onClick={() => nav.open('logHabit')} className="flex w-full justify-between">
        {habitRings.map((h) => (
          <div key={h.label} className="flex flex-col items-center gap-1.5">
            <ProgressRing value={h.pct} size={56} stroke={4} color={h.color}>
              <Icon name={h.icon} size={20} color={h.color} />
            </ProgressRing>
            <span className="text-[11px] font-semibold text-white/80">{h.label}</span>
            <span className="text-[11px] font-bold">{h.value}</span>
            <span className="text-[10px] font-medium text-brand-400">Today</span>
          </div>
        ))}
      </button>

      {/* Exam Survival Protocol */}
      <button onClick={() => nav.open('examMode')} className="mt-6 flex w-full items-center gap-3 rounded-2xl border border-accent-purple/30 bg-accent-purple/15 p-4 text-left active:scale-[0.99]">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent-purple/25"><GraduationCap size={22} className="text-accent-purple" /></div>
        <div className="flex-1">
          <p className="font-bold text-white">Exam Survival Protocol</p>
          <p className="text-[13px] leading-snug text-white/55">Short workouts, better sleep, less stress. You've got this.</p>
        </div>
        <ChevronRight size={20} className="text-accent-purple" />
      </button>

      {/* Community Challenge */}
      {challenge && (
        <button onClick={() => nav.goTab('community')} className="mt-4 flex w-full items-center gap-4 rounded-2xl border border-white/5 bg-ink-800 p-4 text-left active:scale-[0.99]">
          <Trophy size={30} className="shrink-0 text-accent-orange" />
          <div className="flex-1">
            <p className="text-[13px] font-semibold text-white/70">Community Challenge</p>
            <p className="font-bold">{challenge.title}</p>
            <p className="text-[13px] text-white/50">You're ranked <span className="font-semibold text-accent-orange">#{challenge.rank}</span> of {challenge.participants}</p>
          </div>
          <div className="text-center">
            <p className="text-[11px] text-white/45">Streak</p>
            <p className="text-2xl font-extrabold text-brand-400">{streak.current}</p>
          </div>
        </button>
      )}
      <div className="h-2" />
    </div>
  )
}

function Section({ title, action, onAction }: { title: string; action: string; onAction: () => void }) {
  return (
    <div className="mb-3 mt-7 flex items-center justify-between">
      <h2 className="section-title">{title}</h2>
      <button className="see-all" onClick={onAction}>{action}</button>
    </div>
  )
}

function OverviewCard({ icon, color, label, value, unit, sub, delta }: { icon: string; color: string; label: string; value: string; unit?: string; sub: string; delta: string }) {
  return (
    <div className="card p-3.5">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-white/60">
        <Icon name={icon} size={15} color={color} />
        <span className="truncate">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-extrabold">{value}</span>
        {unit && <span className="text-xs text-white/50">{unit}</span>}
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[11px]">
        {sub && <span className="text-white/40">{sub}</span>}
        <span className="font-semibold text-brand-400">{delta}</span>
      </div>
    </div>
  )
}
