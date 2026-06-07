import { Menu, Bell, Clock, Play, GraduationCap, ChevronRight, Sparkles, Leaf } from 'lucide-react'
import { Icon } from '../components/Icon'
import { ProgressRing } from '../components/ui'
import { useStore } from '../store/store'
import { useNav } from '../nav'
import { currentWeekKeys, todayKey } from '../lib/date'
import { fmtFluid, fmtWeightNum, weightUnit, pct } from '../lib/format'
import {
  todayHabit, todaySession, weightStats, workoutsThisWeek, workoutsInRange,
  strengthProgress, unreadNotifs,
} from '../store/selectors'
import { coachDaily } from '../store/coach'
import { dailyTargets, examState } from '../store/training'

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
  const sp = strengthProgress(state)
  const strengthAvg = sp.length ? Math.round(sp.reduce((a, s) => a + s.pct, 0) / sp.length) : 0
  const unread = unreadNotifs(state)
  const coach = coachDaily(state)
  const t = dailyTargets(state)
  const exam = examState(state)

  const greeting = 'Good morning'
  const weekKeys = currentWeekKeys()

  const habitRings = [
    { icon: 'footprints', label: 'Steps', value: habit.steps.toLocaleString(), pct: pct(habit.steps, t.steps), color: '#7ED957' },
    { icon: 'bed', label: 'Sleep', value: `${habit.sleepH} hrs`, pct: pct(habit.sleepH, t.sleepH), color: '#7ED957' },
    { icon: 'droplet', label: 'Water', value: fmtFluid(habit.waterL, units), pct: pct(habit.waterL, t.waterL), color: '#7ED957' },
    { icon: 'utensils', label: 'Nutrition', value: `${habit.nutritionScore}/10`, pct: habit.nutritionScore * 10, color: '#7ED957' },
    { icon: 'leaf', label: 'Mindset', value: `${habit.mindsetMin} min`, pct: pct(habit.mindsetMin, 10), color: '#7ED957' },
  ]

  return (
    <div className="px-5 pt-2">
      <div className="mb-4 flex items-center justify-between">
        <button onClick={() => nav.open('profile')} className="grid h-10 w-10 place-items-center rounded-xl text-white/80 active:scale-90 active:bg-white/5"><Menu size={24} /></button>
        <button onClick={() => nav.open('notifications')} className="relative grid h-10 w-10 place-items-center rounded-xl text-white/80 active:scale-90 active:bg-white/5">
          <Bell size={22} />
          {unread > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-ink-900" />}
        </button>
      </div>

      <h1 className="text-[26px] font-extrabold tracking-tight">{greeting}, {state.profile.name}</h1>
      <p className="mt-1 text-[15px] text-white/45">Steady beats perfect. One good day at a time.</p>

      {/* Coach presence — the human touch */}
      <button onClick={() => nav.open('coach')} className="mt-5 w-full overflow-hidden rounded-2xl border border-brand-400/20 bg-brand-400/[0.06] p-4 text-left transition active:scale-[0.99]">
        <div className="flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-400 text-black"><Sparkles size={15} /></span>
          <span className="text-[13px] font-bold text-brand-400">Coach</span>
          <ChevronRight size={16} className="ml-auto text-white/30" />
        </div>
        <p className="mt-2 font-bold leading-snug">{coach.title}</p>
        <p className="mt-0.5 text-[14px] leading-snug text-white/65">{coach.body}</p>
        {coach.cta && (
          <span
            onClick={(e) => { e.stopPropagation(); nav.open(coach.cta!.overlay as Parameters<typeof nav.open>[0]) }}
            className="mt-3 inline-flex items-center gap-1 rounded-full bg-brand-400 px-3.5 py-1.5 text-sm font-bold text-black active:scale-95"
          >
            {coach.cta.label} <ChevronRight size={15} />
          </span>
        )}
      </button>

      {/* Week selector */}
      <div className="no-scrollbar -mx-5 mt-5 flex gap-2.5 overflow-x-auto px-5">
        {weekKeys.map((k, i) => {
          const active = k === todayKey
          const trained = state.sessions.some((s) => s.dateKey === k && s.completed)
          const logged = state.habits.some((h) => h.dateKey === k)
          const date = parseInt(k.slice(-2))
          return (
            <div key={k} className={`flex h-[68px] w-[46px] shrink-0 flex-col items-center justify-center gap-1 rounded-2xl border ${active ? 'border-brand-400 bg-brand-400 text-black' : 'border-white/8 bg-ink-800 text-white/70'}`}>
              <span className="text-[11px] font-semibold opacity-80">{WD[i]}</span>
              <span className="text-lg font-bold">{date}</span>
              {(trained || logged || active) && <span className={`h-1 w-1 rounded-full ${active ? 'bg-black/70' : 'bg-brand-400'}`} />}
            </div>
          )
        })}
      </div>

      {/* Today's Plan */}
      <div className="relative mt-5 overflow-hidden rounded-2xl border border-white/5">
        <img src={session?.image ?? ''} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
        <div className="relative bg-gradient-to-r from-ink-900 via-ink-900/90 to-ink-900/30 p-5">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-brand-400">Today's plan</p>
            {exam.active && <span className="rounded-full bg-accent-purple/20 px-2 py-0.5 text-[10px] font-bold text-accent-purple">Exam mode</span>}
          </div>
          <h3 className="mt-1 text-2xl font-extrabold tracking-tight">{session?.name ?? 'Rest day'}</h3>
          <div className="mt-2 flex items-center gap-1.5 text-sm text-white/60">
            <Clock size={15} /> {session ? `${session.exercises.length} exercises, about ${exam.active ? 30 : 50} min` : 'Recovery and mobility'}
          </div>
          {session && (
            <button onClick={() => nav.open('activeWorkout')} className="btn-primary mt-4">
              <Play size={16} fill="currentColor" /> {session.completed ? 'View workout' : 'Start workout'}
            </button>
          )}
        </div>
      </div>

      {/* New to the gym (beginners only) */}
      {state.profile.newToGym && (
        <button onClick={() => nav.open('beginner')} className="mt-3 flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-ink-800 p-3.5 text-left active:scale-[0.99]">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-400/15"><Leaf size={20} className="text-brand-400" /></div>
          <div className="flex-1"><p className="font-bold leading-tight">New to the gym</p><p className="text-[12px] text-white/50">Your first 90 days, step by step</p></div>
          <ChevronRight size={18} className="text-white/30" />
        </button>
      )}

      {/* Quick workouts */}
      <button onClick={() => nav.open('quick')} className="mt-3 flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-ink-800 p-3.5 text-left active:scale-[0.99]">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-400/15"><Clock size={20} className="text-brand-400" /></div>
        <div className="flex-1"><p className="font-bold leading-tight">Got 15 minutes?</p><p className="text-[12px] text-white/50">Express workouts between lectures</p></div>
        <ChevronRight size={18} className="text-white/30" />
      </button>

      <Section title="Progress overview" action="See all" onAction={() => nav.goTab('progress')} />
      <div className="grid grid-cols-3 gap-3">
        <OverviewCard icon="dumbbell" label="Workouts" value={String(thisWeek)} sub="This week" delta={`${thisWeek >= lastWeek ? '↑' : '↓'} ${Math.abs(thisWeek - lastWeek)}`} />
        <OverviewCard icon="trending" label="Strength" value={`+${strengthAvg}%`} sub="4 weeks" delta="↑" />
        <OverviewCard icon="scale" label="Body weight" value={fmtWeightNum(w.current, units)} unit={weightUnit(units)} sub="" delta={`${w.delta <= 0 ? '↓' : '↑'} ${Math.abs(w.delta).toFixed(1)}`} />
      </div>

      <Section title="Habits today" action="Log" onAction={() => nav.open('logHabit')} />
      {t.adjusted && <p className="-mt-1 mb-3 text-[12px] text-accent-purple">Targets eased for exam season</p>}
      <button onClick={() => nav.open('logHabit')} className="flex w-full justify-between">
        {habitRings.map((h) => (
          <div key={h.label} className="flex flex-col items-center gap-1.5">
            <ProgressRing value={h.pct} size={56} stroke={4} color={h.color}><Icon name={h.icon} size={20} color={h.color} /></ProgressRing>
            <span className="text-[11px] font-semibold text-white/80">{h.label}</span>
            <span className="text-[11px] font-bold">{h.value}</span>
          </div>
        ))}
      </button>

      <button onClick={() => nav.open('examMode')} className="mt-6 flex w-full items-center gap-3 rounded-2xl border border-accent-purple/30 bg-accent-purple/10 p-4 text-left active:scale-[0.99]">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent-purple/20"><GraduationCap size={22} className="text-accent-purple" /></div>
        <div className="flex-1">
          <p className="font-bold text-white">Exam Survival Protocol</p>
          <p className="text-[13px] leading-snug text-white/55">{exam.active ? 'On. Shorter sessions, more recovery.' : 'Add your exam dates and I will adapt your plan.'}</p>
        </div>
        <ChevronRight size={20} className="text-accent-purple" />
      </button>
      <div className="h-2" />
    </div>
  )
}

function Section({ title, action, onAction }: { title: string; action: string; onAction: () => void }) {
  return (
    <div className="mb-3 mt-12 flex items-center justify-between">
      <h2 className="section-title">{title}</h2>
      <button className="see-all" onClick={onAction}>{action}</button>
    </div>
  )
}

function OverviewCard({ icon, label, value, unit, sub, delta }: { icon: string; label: string; value: string; unit?: string; sub: string; delta: string }) {
  return (
    <div className="card p-3.5">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-white/55">
        <Icon name={icon} size={15} color="currentColor" />
        <span className="truncate">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-extrabold tracking-tight">{value}</span>
        {unit && <span className="text-xs text-white/50">{unit}</span>}
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[11px]">
        {sub && <span className="text-white/40">{sub}</span>}
        <span className="font-semibold text-brand-400">{delta}</span>
      </div>
    </div>
  )
}
