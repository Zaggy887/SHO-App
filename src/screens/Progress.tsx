import { useState } from 'react'
import { SlidersHorizontal, ChevronDown, ArrowRight, Trophy, Flame, Plus, Camera } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Icon } from '../components/Icon'
import { ProgressRing, ProgressBar, ScreenHeader, SectionHeader } from '../components/ui'
import { useStore } from '../store/store'
import { useNav } from '../nav'
import { dayKey, shortDate, weekday, currentWeekKeys } from '../lib/date'
import { fmtWeight, fmtWeightNum, weightUnit, weightVal } from '../lib/format'
import {
  weightStats, strengthProgress, habitConsistencyWeek, streakStats,
  workoutsInRange, nutritionForDay, volumeByWeek,
} from '../store/selectors'

export default function Progress() {
  const { state } = useStore()
  const nav = useNav()
  const units = state.settings.units
  const p = state.profile
  const [range, setRange] = useState<'4 Weeks' | '12 Weeks'>('4 Weeks')

  const w = weightStats(state)
  const sp = strengthProgress(state)
  const strengthAvg = sp.length ? Math.round(sp.reduce((a, s) => a + s.pct, 0) / sp.length) : 0
  const maxPct = Math.max(1, ...sp.map((s) => s.pct))
  const hc = habitConsistencyWeek(state)
  const streak = streakStats(state)
  const workouts4w = workoutsInRange(state, 28)

  // avg calories over last 28 days
  const calDays = Array.from({ length: 28 }, (_, d) => nutritionForDay(state, dayKey(d)).kcal).filter((x) => x > 0)
  const avgCals = calDays.length ? Math.round(calDays.reduce((a, b) => a + b, 0) / calDays.length) : 0

  // Weight trend chart
  const days = range === '4 Weeks' ? 28 : 84
  const cutoff = dayKey(days)
  const chart = w.series.filter((s) => s.dateKey >= cutoff).map((s) => ({ date: shortDate(s.dateKey), weight: Math.round(weightVal(s.kg, units) * 10) / 10 }))
  const vals = chart.map((c) => c.weight)
  const yMin = Math.floor(Math.min(...vals) - 1)
  const yMax = Math.ceil(Math.max(...vals) + 1)

  // Weight goal bar
  const goalKg = p.goalWeightKg
  const losing = goalKg <= w.start
  const span = Math.abs(w.start - goalKg) || 1
  const moved = losing ? w.start - w.current : w.current - w.start
  const goalPct = Math.max(0, Math.min(100, (moved / span) * 100))
  const reachedGoal = losing ? w.current <= goalKg : w.current >= goalKg
  const toGo = Math.max(0, Math.abs(w.current - goalKg))

  // This-week steps (custom weekly bars)
  const todayK = dayKey(0)
  const week = currentWeekKeys().map((k) => {
    const h = state.habits.find((x) => x.dateKey === k)
    const steps = h?.steps ?? 0
    return { k, label: weekday(k).slice(0, 1), steps, hit: steps >= p.stepTarget, today: k === todayK, future: k > todayK }
  })
  const maxStep = Math.max(p.stepTarget, ...week.map((d) => d.steps), 1)
  const stepGoalPct = (p.stepTarget / maxStep) * 100
  const daysHit = week.filter((d) => d.hit).length
  const pastDays = week.filter((d) => !d.future && d.steps > 0)
  const avgSteps = pastDays.length ? Math.round(pastDays.reduce((a, d) => a + d.steps, 0) / pastDays.length) : 0

  // 8-week training volume
  const volWeeks = volumeByWeek(state, 8).map((v) => ({ label: v.label, volume: Math.round(weightVal(v.volume, units)) }))

  const tiles = [
    { icon: 'trending', label: 'Strength', value: `+${strengthAvg}%`, sub: 'last 4 weeks' },
    { icon: 'footprints', label: 'Workouts', value: String(workouts4w), sub: 'last 4 weeks' },
    { icon: 'flame', label: 'Calories', value: avgCals ? avgCals.toLocaleString() : '--', sub: 'avg / day' },
    { icon: 'bed', label: 'Sleep', value: hc.avgSleep ? `${hc.avgSleep.toFixed(1)}h` : '--', sub: 'avg this week' },
  ]

  const rings = [
    { label: 'Workouts', value: `${hc.workouts}/${hc.total}`, pct: hc.total ? (hc.workouts / hc.total) * 100 : 0 },
    { label: 'Steps', value: `${hc.steps}/${hc.total}`, pct: hc.total ? (hc.steps / hc.total) * 100 : 0 },
    { label: 'Sleep', value: `${hc.sleep}/${hc.total}`, pct: hc.total ? (hc.sleep / hc.total) * 100 : 0 },
    { label: 'Nutrition', value: `${hc.nutrition}/${hc.total}`, pct: hc.total ? (hc.nutrition / hc.total) * 100 : 0 },
  ]

  return (
    <div className="px-5 pt-2">
      <ScreenHeader
        title="Progress"
        trailing={<button onClick={() => nav.open('recap')} className="grid h-10 w-10 place-items-center rounded-xl text-brand-400 active:bg-white/5"><SlidersHorizontal size={22} /></button>}
      />

      {/* ---------------- Weight: trend line + goal bar ---------------- */}
      <div className="card p-4">
        <div className="mb-1 flex items-start justify-between">
          <div>
            <h2 className="section-title">Weight</h2>
            <div className="mt-0.5 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold leading-none">{fmtWeightNum(w.current, units)}<span className="ml-1 text-sm font-semibold text-white/45">{weightUnit(units)}</span></span>
              <span className={`text-[12px] font-semibold ${w.delta <= 0 ? 'text-brand-400' : 'text-white/50'}`}>{w.delta <= 0 ? '↓' : '↑'} {fmtWeight(Math.abs(w.delta), units, 1)}</span>
            </div>
          </div>
          <button onClick={() => setRange((r) => (r === '4 Weeks' ? '12 Weeks' : '4 Weeks'))} className="flex items-center gap-1 rounded-lg border border-white/10 bg-ink-700 px-2.5 py-1 text-xs font-semibold text-white/70">{range} <ChevronDown size={14} /></button>
        </div>

        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chart} margin={{ top: 10, right: 6, left: -22, bottom: 0 }}>
              <defs>
                <linearGradient id="wt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(var(--brand-400))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="rgb(var(--brand-400))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(130,130,130,0.18)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: 'rgba(140,140,140,0.85)', fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={28} />
              <YAxis domain={[yMin, yMax]} tick={{ fill: 'rgba(140,140,140,0.85)', fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
              <Tooltip contentStyle={{ background: '#1A1B1E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12, color: '#fff' }} labelStyle={{ color: '#fff' }} formatter={(v: number) => [`${v} ${weightUnit(units)}`, 'Weight']} />
              <Area type="monotone" dataKey="weight" stroke="rgb(var(--brand-400))" strokeWidth={3} fill="url(#wt)" dot={false} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Goal progress bar */}
        <div className="mt-3 border-t border-white/5 pt-3.5">
          <div className="mb-2 flex items-end justify-between text-[12px]">
            <div><p className="text-white/40">Start</p><p className="font-bold">{fmtWeightNum(w.start, units, 1)}</p></div>
            <div className="text-center"><p className="text-white/40">Current</p><p className="font-bold text-brand-400">{fmtWeightNum(w.current, units, 1)}</p></div>
            <div className="text-right"><p className="text-white/40">Target</p><p className="font-bold">{fmtWeightNum(goalKg, units, 1)}</p></div>
          </div>
          <ProgressBar value={goalPct} height={8} />
          <div className="mt-2.5 flex items-center justify-between">
            <p className="text-[12px] text-white/50">{reachedGoal ? 'Target reached' : `${fmtWeight(toGo, units, 1)} to go`}</p>
            <button onClick={() => nav.open('logWeight')} className="flex items-center gap-1 rounded-lg bg-brand-400/15 px-3 py-1.5 text-xs font-bold text-brand-400 active:bg-brand-400/25"><Plus size={13} /> Add weight</button>
          </div>
        </div>
      </div>

      {/* ---------------- Snapshot tiles ---------------- */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        {tiles.map((t) => (
          <div key={t.label} className="card p-4">
            <div className="mb-2 flex items-center gap-1.5 text-[12.5px] font-medium text-white/60"><Icon name={t.icon} size={15} color="rgb(var(--brand-400))" />{t.label}</div>
            <p className="text-2xl font-extrabold leading-none">{t.value}</p>
            <p className="mt-1.5 text-[11.5px] text-white/40">{t.sub}</p>
          </div>
        ))}
      </div>

      {/* ---------------- This week: steps weekly bars + ring ---------------- */}
      <SectionHeader title="This week" />
      <div className="card p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[13px] font-medium text-white/60">Daily steps</p>
            <p className="text-[12px] text-white/40">Goal {p.stepTarget.toLocaleString()} / day</p>
          </div>
          <ProgressRing value={(daysHit / 7) * 100} size={50} stroke={5}><span className="text-[12px] font-extrabold">{daysHit}/7</span></ProgressRing>
        </div>

        <div className="relative mt-4 flex h-28 items-end justify-between gap-2">
          {/* goal reference line */}
          <div className="pointer-events-none absolute inset-x-0 border-t border-dashed border-white/15" style={{ bottom: `${stepGoalPct}%` }} />
          {week.map((d) => {
            const h = d.steps > 0 ? Math.max(6, (d.steps / maxStep) * 100) : 0
            return (
              <div key={d.k} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                <div className="relative flex w-full max-w-[18px] flex-1 items-end overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="w-full rounded-full transition-[height] duration-700 ease-out"
                    style={{ height: `${h}%`, backgroundColor: d.hit ? 'rgb(var(--brand-400))' : 'rgba(255,255,255,0.28)' }}
                  />
                </div>
                <span className={`text-[10px] ${d.today ? 'font-bold text-brand-400' : 'text-white/40'}`}>{d.label}</span>
              </div>
            )
          })}
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3 text-[12.5px]">
          <span className="text-white/50">Daily average</span>
          <span className="font-bold">{avgSteps.toLocaleString()} steps</span>
        </div>
      </div>

      {/* ---------------- Strength: ranked gain bars ---------------- */}
      {sp.length > 0 && (
        <>
          <SectionHeader title="Strength progress" />
          <div className="card space-y-3.5 p-4">
            {sp.map((s) => (
              <div key={s.id} className="flex items-center gap-3">
                <img src={s.image} alt="" className="h-11 w-11 shrink-0 rounded-xl object-cover" loading="lazy" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-[14px] font-bold leading-tight">{s.name}</p>
                    <span className="shrink-0 text-[13px] font-bold text-brand-400">↑{s.pct}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/8">
                    <div className="h-full rounded-full bg-brand-400 transition-[width] duration-700" style={{ width: `${(s.pct / maxPct) * 100}%` }} />
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-white/45">
                    <span>{fmtWeightNum(s.from, units, 0)}{weightUnit(units)}</span>
                    <ArrowRight size={11} className="text-white/30" />
                    <span className="font-semibold text-white/70">{fmtWeightNum(s.to, units, 0)}{weightUnit(units)}</span>
                    <span className="ml-auto">est. 1RM</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ---------------- Training volume: 8-week bars ---------------- */}
      <SectionHeader title="Training volume" />
      <div className="card p-4">
        <p className="mb-2 text-[12px] text-white/45">Total weight lifted per week ({weightUnit(units)})</p>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={volWeeks} margin={{ top: 6, right: 6, left: -14, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(130,130,130,0.18)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: 'rgba(140,140,140,0.85)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(140,140,140,0.85)', fontSize: 11 }} axisLine={false} tickLine={false} width={44} tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`)} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} contentStyle={{ background: '#1A1B1E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12, color: '#fff' }} formatter={(v: number) => [`${v.toLocaleString()} ${weightUnit(units)}`, 'Volume']} />
              <Bar dataKey="volume" fill="rgb(var(--brand-400))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ---------------- Consistency rings + streak ---------------- */}
      <SectionHeader title="Consistency" />
      <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-ink-800 p-4">
        <div className="flex flex-1 justify-between">
          {rings.map((h) => (
            <div key={h.label} className="flex flex-col items-center">
              <ProgressRing value={h.pct} size={52} stroke={4}><span className="text-[12px] font-bold">{h.value}</span></ProgressRing>
              <p className="mt-1.5 text-[11px] font-semibold">{h.label}</p>
            </div>
          ))}
        </div>
        <div className="ml-1 border-l border-white/8 pl-4 text-center">
          <p className="text-[11px] text-white/45">Streak</p>
          <p className="flex items-center justify-center gap-1 text-2xl font-extrabold">{streak.current} <Flame size={20} className="text-brand-400" /></p>
          <p className="text-[11px] text-white/40">Best: {streak.best}d</p>
        </div>
      </div>

      {/* ---------------- Photos + recap ---------------- */}
      <button onClick={() => nav.open('photos')} className="mt-4 flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-ink-800 p-4 text-left active:scale-[0.99]">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-400/15"><Camera size={20} className="text-brand-400" /></div>
        <div className="flex-1"><p className="font-bold">Progress photos</p><p className="text-[13px] text-white/55">{state.photos.length} photos · see your transformation</p></div>
        <ArrowRight size={18} className="text-white/30" />
      </button>

      <button onClick={() => nav.open('recap')} className="mt-4 flex w-full items-center gap-3 rounded-2xl border border-brand-400/20 bg-brand-400/10 p-4 text-left active:scale-[0.99]">
        <Trophy size={28} className="shrink-0 text-brand-400" />
        <div className="flex-1"><p className="font-bold">You're in the top 20% of users</p><p className="text-[13px] text-white/55">Keep showing up. The results will follow.</p></div>
        <span className="btn-primary px-4 py-2 text-sm">Recap</span>
      </button>
      <div className="h-2" />
    </div>
  )
}
