import { useState } from 'react'
import { CalendarDays, ChevronRight, Check, Plus, Lightbulb, BookOpen, Sparkles, Trash2 } from 'lucide-react'
import { Icon } from '../components/Icon'
import { ProgressRing, ProgressBar, SegmentedTabs, ScreenHeader, SectionHeader } from '../components/ui'
import { useStore } from '../store/store'
import { useNav } from '../nav'
import { useToast } from '../components/Toast'
import { FOODS } from '../data/catalog'
import { fmtFluid, pct } from '../lib/format'
import { dayKey, longDate } from '../lib/date'
import { nutritionForDay, todayHabit } from '../store/selectors'
import { dailyTargets } from '../store/training'
import type { MealName } from '../store/types'
import { Wallet } from 'lucide-react'

const TABS = ['Overview', 'Diary', 'Meals', 'Insights', 'Education']

export default function Nutrition() {
  const [tab, setTab] = useState('Overview')
  const nav = useNav()
  return (
    <div className="px-5 pt-2">
      <ScreenHeader
        title="Nutrition"
        trailing={<button onClick={() => nav.open('addFood')} className="grid h-10 w-10 place-items-center rounded-xl text-brand-400 active:bg-white/5"><CalendarDays size={22} /></button>}
      />
      <SegmentedTabs tabs={TABS} active={tab} onChange={setTab} />
      <div className="mt-5">
        {tab === 'Overview' && <OverviewTab />}
        {tab === 'Diary' && <DiaryTab />}
        {tab === 'Meals' && <MealsTab />}
        {tab === 'Insights' && <InsightsTab />}
        {tab === 'Education' && <EducationTab />}
      </div>
    </div>
  )
}

function OverviewTab() {
  const { state } = useStore()
  const nav = useNav()
  const units = state.settings.units
  const n = nutritionForDay(state)
  const habit = todayHabit(state)
  const t = dailyTargets(state)
  const macros = [
    { label: 'Protein', value: Math.round(n.p), goal: t.protein, color: '#7ED957' },
    { label: 'Carbs', value: Math.round(n.c), goal: t.carb, color: '#8C9AAE' },
    { label: 'Fats', value: Math.round(n.f), goal: t.fat, color: '#C9A86A' },
  ]
  const macroPct = Math.round((pct(n.p, t.protein) + pct(n.c, t.carb) + pct(n.f, t.fat)) / 3)
  const onTrack = n.kcal <= t.calorie * 1.02
  const remaining = Math.max(0, t.calorie - n.kcal)

  // calorie-share breakdown
  const pc = n.p * 4, cc = n.c * 4, fc = n.f * 9
  const totalC = Math.max(1, pc + cc + fc)
  const breakdown = [
    { pct: Math.round((pc / totalC) * 100), grams: `${Math.round(n.p)}g`, label: 'Protein', goal: `Goal: ${t.protein}g`, color: '#7ED957' },
    { pct: Math.round((cc / totalC) * 100), grams: `${Math.round(n.c)}g`, label: 'Carbs', goal: `Goal: ${t.carb}g`, color: '#8C9AAE' },
    { pct: Math.round((fc / totalC) * 100), grams: `${Math.round(n.f)}g`, label: 'Fats', goal: `Goal: ${t.fat}g`, color: '#C9A86A' },
  ]

  const slots: MealName[] = ['Breakfast', 'Lunch', 'Snack', 'Dinner']

  return (
    <>
      <div className="card p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Today's summary</h3>
          {t.adjusted && <span className="rounded-full bg-accent-purple/15 px-2.5 py-1 text-[11px] font-semibold text-accent-purple">Exam: maintain</span>}
        </div>
        <p className="mt-0.5 text-[13px] text-white/55">
          You're <span className={`font-semibold ${onTrack ? 'text-brand-400' : 'text-white/70'}`}>{onTrack ? 'on track' : 'over target'}</span> {onTrack ? 'for today' : 'today'}
        </p>
        <div className="mt-4 flex items-center gap-5">
          <ProgressRing value={pct(n.kcal, t.calorie)} size={108} stroke={9}>
            <span className="text-2xl font-extrabold">{n.kcal.toLocaleString()}</span>
            <span className="text-[11px] text-white/55">kcal</span>
            <span className="text-[11px] text-white/40">/ {t.calorie.toLocaleString()}</span>
          </ProgressRing>
          <div className="flex-1 space-y-3">
            {macros.map((m) => (
              <div key={m.label}>
                <div className="mb-1 flex items-center justify-between text-[13px]">
                  <span className="text-white/70">{m.label}</span>
                  <span className="font-semibold">{m.value} <span className="text-white/40">/ {m.goal}g</span></span>
                </div>
                <ProgressBar value={pct(m.value, m.goal)} color={m.color} height={6} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2 rounded-2xl border border-white/5 bg-ink-800 p-4">
        <MiniStat icon="flame" color="#9AA0A6" value={remaining.toLocaleString()} label="kcal" sub="Remaining" subColor="#9AA0A6" />
        <MiniStat icon="target" color="#9AA0A6" value={`${macroPct}%`} label="Macros" sub={macroPct >= 80 ? 'On track' : 'Building'} subColor="#7ED957" />
        <MiniStat icon="droplet" color="#9AA0A6" value={fmtFluid(habit.waterL, units)} label="Water" sub={habit.waterL >= t.waterL * 0.8 ? 'Good' : 'Low'} subColor="#7ED957" />
        <MiniStat icon="utensils" color="#7ED957" value={`${Math.round(n.p)}g`} label="Protein" sub={n.p >= t.protein * 0.9 ? 'On track' : 'Push'} subColor="#7ED957" />
      </div>

      <button onClick={() => nav.open('budgetEats')} className="mt-4 flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-ink-800 p-4 text-left active:scale-[0.99]">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-400/15"><Wallet size={20} className="text-brand-400" /></div>
        <div className="flex-1"><p className="font-bold leading-tight">Eat well for less</p><p className="text-[12px] text-white/50">Cheap high protein meals and a grocery list</p></div>
        <ChevronRight size={18} className="text-white/30" />
      </button>

      <div>
        <SectionHeader title="Today's Meals" right={<button onClick={() => nav.open('addFood')} className="flex items-center gap-1 text-sm font-semibold text-brand-400">Add <Plus size={15} /></button>} />
        <div className="space-y-2.5">
          {slots.map((slot) => {
            const items = n.meals.filter((m) => m.meal === slot)
            const kcal = items.reduce((a, m) => a + m.kcal, 0)
            return (
              <button key={slot} onClick={() => nav.open('addFood', { meal: slot })} className="flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-ink-800 p-3.5 text-left active:scale-[0.99]">
                <div className="min-w-0 flex-1">
                  <p className="font-bold leading-tight">{slot}</p>
                  <p className="truncate text-[12px] text-white/55">{items.length ? items.map((m) => m.name).join(', ') : 'Tap to add food'}</p>
                  {kcal > 0 && <p className="text-[12px] text-white/40">{kcal} kcal</p>}
                </div>
                {items.length > 0 ? (
                  <div className="grid h-6 w-6 place-items-center rounded-full bg-brand-400"><Check size={14} strokeWidth={3} className="text-black" /></div>
                ) : (
                  <div className="grid h-6 w-6 place-items-center rounded-full bg-white/8"><Plus size={14} className="text-white/60" /></div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3 rounded-2xl border border-brand-400/20 bg-brand-400/10 p-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-400/20"><Lightbulb size={22} className="text-brand-400" /></div>
        <div className="flex-1">
          <p className="font-bold text-brand-400">Nutrition Tip</p>
          <p className="text-[13px] leading-snug text-white/65">Prioritise protein and whole foods. Small daily choices = big results.</p>
        </div>
      </div>

      <div>
        <SectionHeader title="Macros Breakdown" />
        <div className="grid grid-cols-3 gap-3 rounded-2xl border border-white/5 bg-ink-800 p-4">
          {breakdown.map((m) => (
            <div key={m.label} className="flex flex-col items-center">
              <ProgressRing value={m.pct} size={72} stroke={7} color={m.color}><span className="text-sm font-extrabold">{m.pct}%</span></ProgressRing>
              <p className="mt-2 text-sm font-bold">{m.grams}</p>
              <p className="text-[12px] font-semibold" style={{ color: m.color }}>{m.label}</p>
              <p className="text-[10px] text-white/40">{m.goal}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="h-2" />
    </>
  )
}

function DiaryTab() {
  const { state, dispatch } = useStore()
  const nav = useNav()
  const n = nutritionForDay(state)
  return (
    <div className="space-y-2.5">
      <p className="text-[13px] text-white/50">{longDate(dayKey(0))} · {n.kcal.toLocaleString()} / {state.profile.calorieTarget.toLocaleString()} kcal</p>
      {n.meals.map((m) => (
        <div key={m.id} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-ink-800 p-3.5">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-white/8 px-2 py-0.5 text-[10px] font-semibold text-white/55">{m.meal}</span>
              <p className="font-bold">{m.name}</p>
            </div>
            <p className="mt-1 text-[12px] text-white/45">{m.kcal} kcal · {m.p}P {m.c}C {m.f}F</p>
          </div>
          <button onClick={() => dispatch({ type: 'REMOVE_MEAL', id: m.id })} className="grid h-8 w-8 place-items-center rounded-full bg-white/5 text-white/40 active:bg-white/10"><Trash2 size={15} /></button>
        </div>
      ))}
      {n.meals.length === 0 && <p className="py-6 text-center text-sm text-white/40">No food logged yet today.</p>}
      <button onClick={() => nav.open('addFood')} className="w-full rounded-2xl border border-dashed border-white/15 py-4 text-sm font-semibold text-white/55 active:bg-white/5">+ Add food</button>
    </div>
  )
}

function MealsTab() {
  const { dispatch } = useStore()
  const toast = useToast()
  return (
    <div className="grid grid-cols-2 gap-3">
      {FOODS.map((f) => (
        <button key={f.id} onClick={() => { dispatch({ type: 'ADD_MEAL', meal: { meal: 'Snack', name: f.name, qty: 1, kcal: f.kcal, p: f.p, c: f.c, f: f.f } }); toast('Added to Snack') }} className="overflow-hidden rounded-2xl border border-white/5 bg-ink-800 p-3 text-left active:scale-[0.99]">
          <p className="truncate text-sm font-bold">{f.name}</p>
          <p className="truncate text-[12px] text-white/50">{f.serving}</p>
          <p className="mt-1 text-[12px] font-semibold text-brand-400">{f.kcal} kcal · {f.p}P</p>
        </button>
      ))}
    </div>
  )
}

function InsightsTab() {
  const { state } = useStore()
  const p = state.profile
  // protein goal hit rate over last 7 logged days
  let hit = 0
  for (let d = 0; d < 7; d++) {
    const n = nutritionForDay(state, dayKey(d))
    if (n.p >= p.proteinTarget * 0.9) hit++
  }
  const last7Cals = Array.from({ length: 7 }, (_, d) => nutritionForDay(state, dayKey(d)).kcal).filter((x) => x > 0)
  const avgCals = last7Cals.length ? Math.round(last7Cals.reduce((a, b) => a + b, 0) / last7Cals.length) : 0
  let waterStreak = 0
  for (let d = 1; d < 30; d++) {
    const h = state.habits.find((x) => x.dateKey === dayKey(d))
    if (h && h.waterL >= p.waterTargetL * 0.85) waterStreak++
    else break
  }
  const items = [
    { title: 'Protein consistency', body: `You've hit 90%+ of your protein goal ${hit} of the last 7 days.`, trend: `${hit}/7` },
    { title: 'Average intake', body: 'Your 7-day average is right around your target — nicely dialled in.', trend: `${avgCals.toLocaleString()} kcal` },
    { title: 'Hydration streak', body: `${waterStreak} days in a row hitting your water goal. Keep it up.`, trend: `${waterStreak} days` },
  ]
  return (
    <div className="space-y-3">
      {items.map((i) => (
        <div key={i.title} className="flex items-start gap-3 rounded-2xl border border-white/5 bg-ink-800 p-4">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-400/15"><Sparkles size={20} className="text-brand-400" /></div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="font-bold">{i.title}</p>
              <span className="text-sm font-semibold text-brand-400">{i.trend}</span>
            </div>
            <p className="mt-0.5 text-[13px] text-white/55">{i.body}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function EducationTab() {
  const articles = [
    { title: 'Protein 101', body: 'How much you really need to build muscle.', minutes: '4 min read' },
    { title: 'Eating on a student budget', body: 'High-protein meals for under $5.', minutes: '6 min read' },
    { title: 'Reading food labels', body: 'Spot hidden sugars and marketing tricks.', minutes: '5 min read' },
    { title: 'Meal timing myths', body: 'Does the anabolic window really matter?', minutes: '5 min read' },
  ]
  return (
    <div className="space-y-3">
      {articles.map((e) => (
        <div key={e.title} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-ink-800 p-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent-purple/15"><BookOpen size={20} className="text-accent-purple" /></div>
          <div className="flex-1">
            <p className="font-bold">{e.title}</p>
            <p className="text-[13px] text-white/55">{e.body}</p>
            <p className="mt-1 text-[12px] text-white/40">{e.minutes}</p>
          </div>
          <ChevronRight size={18} className="text-white/30" />
        </div>
      ))}
    </div>
  )
}

function MiniStat({ icon, color, value, label, sub, subColor }: { icon: string; color: string; value: string; label: string; sub: string; subColor: string }) {
  return (
    <div className="text-center">
      <Icon name={icon} size={20} color={color} className="mx-auto" />
      <p className="mt-1.5 text-base font-extrabold leading-tight">{value}</p>
      <p className="text-[11px] text-white/55">{label}</p>
      <p className="text-[10px] font-semibold" style={{ color: subColor }}>{sub}</p>
    </div>
  )
}
