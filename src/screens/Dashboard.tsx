import type { ReactNode } from 'react'
import { Menu, Bell, Clock, Play, GraduationCap, ChevronRight, Sparkles, Leaf, Check, Flame } from 'lucide-react'
import { Icon } from '../components/Icon'
import { ProgressRing } from '../components/ui'
import { useStore } from '../store/store'
import { useNav } from '../nav'
import { currentWeekKeys, todayKey, longDate, TODAY } from '../lib/date'
import { fmtFluid, fmtWeightNum, weightUnit, pct } from '../lib/format'
import {
  todayHabit, todaySession, weightStats, workoutsThisWeek, workoutsInRange,
  strengthProgress, unreadNotifs, streakStats, nutritionForDay,
} from '../store/selectors'
import { coachDaily } from '../store/coach'
import { dailyTargets, examState } from '../store/training'
import { Wordmark } from '../components/Logo'

const WD = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function greetingFor(hour: number): string {
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

type Task = {
  id: string
  icon: string
  label: string
  hint: string
  done: boolean
  onClick: () => void
}

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
  const streak = streakStats(state)
  const nut = nutritionForDay(state)
  const weightLoggedToday = state.weights.some((x) => x.dateKey === todayKey)

  const greeting = greetingFor(TODAY.getHours())
  const weekKeys = currentWeekKeys()

  const habitRings = [
    { icon: 'footprints', label: 'Steps', value: habit.steps.toLocaleString(), pct: pct(habit.steps, t.steps), color: '#7ED957' },
    { icon: 'bed', label: 'Sleep', value: `${habit.sleepH} hrs`, pct: pct(habit.sleepH, t.sleepH), color: '#7ED957' },
    { icon: 'droplet', label: 'Water', value: fmtFluid(habit.waterL, units), pct: pct(habit.waterL, t.waterL), color: '#7ED957' },
    { icon: 'utensils', label: 'Nutrition', value: `${habit.nutritionScore}/10`, pct: habit.nutritionScore * 10, color: '#7ED957' },
    { icon: 'leaf', label: 'Mindset', value: `${habit.mindsetMin} min`, pct: pct(habit.mindsetMin, 10), color: '#7ED957' },
  ]
  const ringsOnTrack = habitRings.filter((h) => h.pct >= 100).length

  // The day's actionable to-dos, computed from real targets vs what's logged.
  const tasks: Task[] = []
  if (session) {
    tasks.push({
      id: 'workout', icon: 'dumbbell',
      label: session.completed ? 'Workout complete' : "Today's workout",
      hint: session.name, done: session.completed,
      onClick: () => nav.open('activeWorkout'),
    })
  }
  tasks.push({
    id: 'water', icon: 'droplet',
    label: `Drink ${fmtFluid(t.waterL, units)} of water`,
    hint: `${fmtFluid(habit.waterL, units)} so far`,
    done: habit.waterL >= t.waterL,
    onClick: () => nav.open('logHabit'),
  })
  tasks.push({
    id: 'weight', icon: 'scale',
    label: 'Weigh yourself',
    hint: weightLoggedToday ? 'Logged today' : 'Keep your trend honest',
    done: weightLoggedToday,
    onClick: () => nav.open('logWeight'),
  })
  tasks.push({
    id: 'meals', icon: 'utensils',
    label: 'Log your meals',
    hint: nut.meals.length ? `${nut.meals.length} logged · ${nut.kcal} kcal` : `Target ${t.calorie} kcal`,
    done: nut.meals.length >= 3,
    onClick: () => nav.goTab('nutrition'),
  })
  tasks.push({
    id: 'steps', icon: 'footprints',
    label: `Reach ${t.steps.toLocaleString()} steps`,
    hint: `${habit.steps.toLocaleString()} today`,
    done: habit.steps >= t.steps,
    onClick: () => nav.open('logHabit'),
  })
  const sortedTasks = [...tasks].sort((a, b) => Number(a.done) - Number(b.done))
  const remaining = tasks.filter((x) => !x.done).length

  return (
    <div className="px-5 pt-2">
      <div className="mb-4 flex items-center justify-between">
        <button onClick={() => nav.open('profile')} className="grid h-10 w-10 place-items-center rounded-xl text-white/80 active:scale-90 active:bg-white/5"><Menu size={24} /></button>
        <Wordmark size="sm" />
        <button onClick={() => nav.open('notifications')} className="relative grid h-10 w-10 place-items-center rounded-xl text-white/80 active:scale-90 active:bg-white/5">
          <Bell size={22} />
          {unread > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-ink-900" />}
        </button>
      </div>

      {/* Greeting + date + streak */}
      <Reveal>
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-[26px] font-extrabold leading-tight tracking-tight">{greeting}, {state.profile.name}</h1>
            <p className="mt-1 text-[14px] text-white/45">{longDate(todayKey)}</p>
          </div>
          {streak.current > 0 && (
            <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-accent-orange/12 px-3 py-1.5 text-[13px] font-bold text-accent-orange">
              <Flame size={15} /> {streak.current} day{streak.current === 1 ? '' : 's'}
            </span>
          )}
        </div>
      </Reveal>

      {/* Week selector */}
      <Reveal delay={60}>
        <div className="-mx-1 mt-5 flex justify-between">
          {weekKeys.map((k, i) => {
            const active = k === todayKey
            const trained = state.sessions.some((s) => s.dateKey === k && s.completed)
            const logged = state.habits.some((h) => h.dateKey === k)
            const date = parseInt(k.slice(-2))
            return (
              <div key={k} className={`flex w-11 flex-col items-center gap-2 rounded-2xl py-2.5 transition ${active ? 'bg-brand-400 text-black' : 'text-white/70'}`}>
                <span className={`text-[11px] font-semibold uppercase tracking-wide ${active ? 'text-black/55' : 'text-white/35'}`}>{WD[i]}</span>
                <span className="text-[17px] font-bold leading-none">{date}</span>
                <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-black/60' : trained || logged ? 'bg-brand-400' : 'bg-transparent'}`} />
              </div>
            )
          })}
        </div>
      </Reveal>

      {/* Today's habits — your data at a glance */}
      <Reveal delay={120}>
        <Section title="Today's habits" action="Log" onAction={() => nav.open('logHabit')} tight />
        {t.adjusted && <p className="-mt-1 mb-3 text-[12px] text-accent-purple">Targets eased for exam season</p>}
        <div className="card p-4">
          <div className="mb-4 flex items-center gap-2 text-[13px]">
            <span className="font-semibold text-white/55">{ringsOnTrack} of {habitRings.length} goals on track</span>
            <span className="ml-auto text-white/30">Tap to update</span>
          </div>
          <button onClick={() => nav.open('logHabit')} className="flex w-full justify-between active:opacity-80">
            {habitRings.map((h) => (
              <div key={h.label} className="flex flex-col items-center gap-1.5">
                <ProgressRing value={h.pct} size={54} stroke={4} color={h.color}><Icon name={h.icon} size={19} color={h.color} /></ProgressRing>
                <span className="text-[11px] font-semibold text-white/80">{h.label}</span>
                <span className="text-[11px] font-bold">{h.value}</span>
              </div>
            ))}
          </button>
        </div>
      </Reveal>

      {/* To-do today — the day's tasks */}
      <Reveal delay={180}>
        <Section
          title="To-do today"
          right={
            <span className={`text-sm font-semibold ${remaining === 0 ? 'text-brand-400' : 'text-white/45'}`}>
              {remaining === 0 ? 'All done 🎉' : `${remaining} left`}
            </span>
          }
        />
        <div className="card divide-y divide-white/[0.06] px-4">
          {sortedTasks.map((task) => <TaskRow key={task.id} task={task} />)}
        </div>
      </Reveal>

      {/* Today's plan */}
      <Reveal delay={240}>
        <Section title="Your plan" action="Workouts" onAction={() => nav.goTab('workout')} />
        <div className="relative overflow-hidden rounded-2xl border border-white/5">
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

        {/* Quick workouts */}
        <button onClick={() => nav.open('quick')} className="mt-3 flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-ink-800 p-3.5 text-left transition active:scale-[0.99]">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-400/15"><Clock size={20} className="text-brand-400" /></div>
          <div className="flex-1"><p className="font-bold leading-tight">Got 15 minutes?</p><p className="text-[12px] text-white/50">Express workouts between lectures</p></div>
          <ChevronRight size={18} className="text-white/30" />
        </button>
      </Reveal>

      {/* Coach presence — the human touch */}
      <Reveal delay={300}>
        <button onClick={() => nav.open('coach')} className="mt-7 w-full overflow-hidden rounded-2xl border border-brand-400/20 bg-brand-400/[0.06] p-4 text-left transition active:scale-[0.99]">
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
      </Reveal>

      {/* Progress overview */}
      <Reveal delay={360}>
        <Section title="Progress overview" action="See all" onAction={() => nav.goTab('progress')} />
        <div className="grid grid-cols-3 gap-3">
          <OverviewCard icon="dumbbell" label="Workouts" value={String(thisWeek)} sub="This week" delta={`${thisWeek >= lastWeek ? '↑' : '↓'} ${Math.abs(thisWeek - lastWeek)}`} />
          <OverviewCard icon="trending" label="Strength" value={`+${strengthAvg}%`} sub="4 weeks" delta="↑" />
          <OverviewCard icon="scale" label="Body weight" value={fmtWeightNum(w.current, units)} unit={weightUnit(units)} sub="" delta={`${w.delta <= 0 ? '↓' : '↑'} ${Math.abs(w.delta).toFixed(1)}`} />
        </div>
      </Reveal>

      {/* More tools */}
      <Reveal delay={420}>
        <Section title="More" tight />
        <div className="space-y-3">
          {state.profile.newToGym && (
            <button onClick={() => nav.open('beginner')} className="flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-ink-800 p-3.5 text-left transition active:scale-[0.99]">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-400/15"><Leaf size={20} className="text-brand-400" /></div>
              <div className="flex-1"><p className="font-bold leading-tight">New to the gym</p><p className="text-[12px] text-white/50">Your first 90 days, step by step</p></div>
              <ChevronRight size={18} className="text-white/30" />
            </button>
          )}
          <button onClick={() => nav.open('examMode')} className="flex w-full items-center gap-3 rounded-2xl border border-accent-purple/30 bg-accent-purple/10 p-4 text-left transition active:scale-[0.99]">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent-purple/20"><GraduationCap size={22} className="text-accent-purple" /></div>
            <div className="flex-1">
              <p className="font-bold text-white">Exam Survival Protocol</p>
              <p className="text-[13px] leading-snug text-white/55">{exam.active ? 'On. Shorter sessions, more recovery.' : 'Add your exam dates and I will adapt your plan.'}</p>
            </div>
            <ChevronRight size={20} className="text-accent-purple" />
          </button>
        </div>
      </Reveal>
      <div className="h-2" />
    </div>
  )
}

/* A staggered fade/slide reveal that respects prefers-reduced-motion via the global CSS guard. */
function Reveal({ delay = 0, children }: { delay?: number; children: ReactNode }) {
  return <div className="animate-rise" style={{ animationDelay: `${delay}ms` }}>{children}</div>
}

function TaskRow({ task }: { task: Task }) {
  return (
    <button onClick={task.onClick} className="flex w-full items-center gap-3 py-3 text-left transition active:scale-[0.99]">
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-colors duration-300 ${task.done ? 'bg-brand-400 text-black' : 'bg-brand-400/12 text-brand-400'}`}>
        {task.done ? <Check size={18} strokeWidth={3} /> : <Icon name={task.icon} size={17} color="currentColor" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className={`truncate text-[14px] font-semibold transition-colors ${task.done ? 'text-white/40 line-through' : 'text-white'}`}>{task.label}</p>
        <p className="truncate text-[12px] text-white/45">{task.hint}</p>
      </div>
      {!task.done && <ChevronRight size={18} className="shrink-0 text-white/25" />}
    </button>
  )
}

function Section({ title, action, onAction, right, tight }: { title: string; action?: string; onAction?: () => void; right?: ReactNode; tight?: boolean }) {
  return (
    <div className={`mb-3 flex items-center justify-between ${tight ? 'mt-7' : 'mt-9'}`}>
      <h2 className="section-title">{title}</h2>
      {right ? right : action && <button className="see-all" onClick={onAction}>{action}</button>}
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
