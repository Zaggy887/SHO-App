import { useState } from 'react'
import { SlidersHorizontal, ChevronDown, ArrowRight, Trophy, Flame, Plus, Camera } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Icon } from '../components/Icon'
import { ProgressRing, ScreenHeader, SectionHeader } from '../components/ui'
import { useStore } from '../store/store'
import { useNav } from '../nav'
import { exById } from '../data/catalog'
import { dayKey, shortDate } from '../lib/date'
import { fmtWeight, fmtWeightNum, weightUnit, weightVal } from '../lib/format'
import {
  weightStats, strengthProgress, habitConsistencyWeek, streakStats,
  workoutsInRange, nutritionForDay, volumeByWeek, bestLiftId, oneRMSeries,
} from '../store/selectors'

export default function Progress() {
  const { state } = useStore()
  const nav = useNav()
  const units = state.settings.units
  const [range, setRange] = useState<'4 Weeks' | '12 Weeks'>('4 Weeks')

  const w = weightStats(state)
  const sp = strengthProgress(state)
  const strengthAvg = sp.length ? Math.round(sp.reduce((a, s) => a + s.pct, 0) / sp.length) : 0
  const hc = habitConsistencyWeek(state)
  const streak = streakStats(state)
  const workouts4w = workoutsInRange(state, 28)

  // avg calories over last 28 days
  const calDays = Array.from({ length: 28 }, (_, d) => nutritionForDay(state, dayKey(d)).kcal).filter((x) => x > 0)
  const avgCals = calDays.length ? Math.round(calDays.reduce((a, b) => a + b, 0) / calDays.length) : 0

  const days = range === '4 Weeks' ? 28 : 84
  const cutoff = dayKey(days)
  const chart = w.series.filter((p) => p.dateKey >= cutoff).map((p) => ({ date: shortDate(p.dateKey), weight: Math.round(weightVal(p.kg, units) * 10) / 10 }))
  const vals = chart.map((c) => c.weight)
  const yMin = Math.floor(Math.min(...vals) - 1)
  const yMax = Math.ceil(Math.max(...vals) + 1)

  const volWeeks = volumeByWeek(state, 8).map((v) => ({ label: v.label, volume: Math.round(weightVal(v.volume, units)) }))
  const liftId = bestLiftId(state)
  const strengthSeries = liftId ? oneRMSeries(state, liftId).map((p) => ({ date: shortDate(p.dateKey), kg: Math.round(weightVal(p.kg, units)) })) : []
  const liftName = liftId ? exById(liftId)?.name ?? 'Strength' : ''

  const cards = [
    { icon: 'scale', label: 'Weight', value: fmtWeightNum(w.current, units), unit: weightUnit(units), delta: `${w.delta <= 0 ? '↓' : '↑'} ${fmtWeight(Math.abs(w.delta), units, 1)}`, color: 'rgb(var(--brand-400))', onClick: () => nav.open('logWeight') },
    { icon: 'trending', label: 'Strength', value: `+${strengthAvg}%`, unit: '', delta: '↑ 4 wks', color: '#9AA0A6' },
    { icon: 'footprints', label: 'Workouts', value: String(workouts4w), unit: '', delta: 'last 4 wks', color: '#9AA0A6' },
    { icon: 'flame', label: 'Calories', value: avgCals.toLocaleString(), unit: '', delta: 'avg / day', color: '#9AA0A6' },
  ]

  const habitRings = [
    { label: 'Workouts', value: `${hc.workouts}/${hc.total}`, sub: 'This week', pct: hc.total ? (hc.workouts / hc.total) * 100 : 0, color: 'rgb(var(--brand-400))' },
    { label: 'Steps', value: `${hc.steps}/${hc.total}`, sub: `Avg ${hc.avgSteps.toLocaleString()}`, pct: hc.total ? (hc.steps / hc.total) * 100 : 0, color: 'rgb(var(--brand-400))' },
    { label: 'Sleep', value: `${hc.sleep}/${hc.total}`, sub: `Avg ${hc.avgSleep.toFixed(1)}h`, pct: hc.total ? (hc.sleep / hc.total) * 100 : 0, color: 'rgb(var(--brand-400))' },
    { label: 'Nutrition', value: `${hc.nutrition}/${hc.total}`, sub: 'On Track', pct: hc.total ? (hc.nutrition / hc.total) * 100 : 0, color: 'rgb(var(--brand-400))' },
  ]

  return (
    <div className="px-5 pt-2">
      <ScreenHeader
        title="Progress"
        trailing={<button onClick={() => nav.open('recap')} className="grid h-10 w-10 place-items-center rounded-xl text-brand-400 active:bg-white/5"><SlidersHorizontal size={22} /></button>}
      />

      <SectionHeader title="Overview" />
      <div className="grid grid-cols-2 gap-3">
        {cards.map((c) => (
          <button key={c.label} onClick={c.onClick} className="card p-4 text-left active:scale-[0.99]">
            <div className="mb-2 flex items-center gap-1.5 text-[13px] font-medium text-white/60"><Icon name={c.icon} size={16} color={c.color} />{c.label}</div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold">{c.value}</span>
              {c.unit && <span className="text-sm text-white/50">{c.unit}</span>}
            </div>
            <p className="mt-1 text-[12px] font-semibold text-brand-400">{c.delta}</p>
          </button>
        ))}
      </div>

      {/* Weight Trend */}
      <div className="mt-6 rounded-2xl border border-white/5 bg-ink-800 p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="section-title">Weight Trend</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => nav.open('logWeight')} className="flex items-center gap-1 rounded-lg bg-brand-400/15 px-2.5 py-1 text-xs font-semibold text-brand-400"><Plus size={13} /> Log</button>
            <button onClick={() => setRange((r) => (r === '4 Weeks' ? '12 Weeks' : '4 Weeks'))} className="flex items-center gap-1 rounded-lg border border-white/10 bg-ink-700 px-2.5 py-1 text-xs font-semibold text-white/70">{range} <ChevronDown size={14} /></button>
          </div>
        </div>
        <div className="h-44 w-full">
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
              <Area type="monotone" dataKey="weight" stroke="rgb(var(--brand-400))" strokeWidth={3} fill="url(#wt)" dot={{ r: 2, fill: 'rgb(var(--brand-400))', strokeWidth: 0 }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Training volume */}
      <div className="mt-4 rounded-2xl border border-white/5 bg-ink-800 p-4">
        <h2 className="section-title mb-2">Training volume</h2>
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

      {/* Strength over time */}
      {strengthSeries.length >= 2 && (
        <div className="mt-4 rounded-2xl border border-white/5 bg-ink-800 p-4">
          <h2 className="section-title mb-2">Strength over time</h2>
          <p className="mb-2 text-[12px] text-white/45">{liftName} · estimated 1RM ({weightUnit(units)})</p>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={strengthSeries} margin={{ top: 6, right: 8, left: -14, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(130,130,130,0.18)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: 'rgba(140,140,140,0.85)', fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={28} />
                <YAxis domain={['dataMin - 5', 'dataMax + 5']} tick={{ fill: 'rgba(140,140,140,0.85)', fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
                <Tooltip contentStyle={{ background: '#1A1B1E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12, color: '#fff' }} formatter={(v: number) => [`${v} ${weightUnit(units)}`, '1RM']} />
                <Line type="monotone" dataKey="kg" stroke="rgb(var(--brand-400))" strokeWidth={3} dot={{ r: 2, fill: 'rgb(var(--brand-400))', strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Strength Progress */}
      <SectionHeader title="Strength Progress" />
      <div className="space-y-3 rounded-2xl border border-white/5 bg-ink-800 p-3">
        {sp.map((s) => (
          <div key={s.id} className="flex items-center gap-3">
            <img src={s.image} alt="" className="h-11 w-11 rounded-xl object-cover" loading="lazy" />
            <div className="min-w-0 flex-1"><p className="truncate font-bold leading-tight">{s.name}</p><p className="text-[12px] text-white/40">est. 1RM</p></div>
            <div className="flex items-center gap-1.5 text-sm">
              <div className="text-right"><p className="text-white/50">{fmtWeightNum(s.from, units, 0)}</p><p className="text-[10px] text-white/35">4 wks ago</p></div>
              <ArrowRight size={14} className="text-white/30" />
              <div className="text-right"><p className="font-bold text-brand-400">{fmtWeightNum(s.to, units, 0)}</p><p className="text-[10px] text-white/35">Today</p></div>
            </div>
            <span className="ml-1 text-sm font-semibold text-brand-400">↑{s.pct}%</span>
          </div>
        ))}
      </div>

      {/* Habit Consistency */}
      <SectionHeader title="Habit Consistency" />
      <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-ink-800 p-4">
        <div className="flex flex-1 justify-between">
          {habitRings.map((h) => (
            <div key={h.label} className="flex flex-col items-center">
              <ProgressRing value={h.pct} size={52} stroke={4} color={h.color}><span className="text-[12px] font-bold">{h.value}</span></ProgressRing>
              <p className="mt-1.5 text-[11px] font-semibold">{h.label}</p>
              <p className="text-[10px] text-white/40">{h.sub}</p>
            </div>
          ))}
        </div>
        <div className="ml-1 border-l border-white/8 pl-4 text-center">
          <p className="text-[11px] text-white/45">Streak</p>
          <p className="flex items-center justify-center gap-1 text-2xl font-extrabold">{streak.current} <Flame size={20} className="text-brand-400" /></p>
          <p className="text-[11px] text-white/40">Best: {streak.best}d</p>
        </div>
      </div>

      {/* Progress photos */}
      <button onClick={() => nav.open('photos')} className="mt-4 flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-ink-800 p-4 text-left active:scale-[0.99]">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-400/15"><Camera size={20} className="text-brand-400" /></div>
        <div className="flex-1"><p className="font-bold">Progress photos</p><p className="text-[13px] text-white/55">{state.photos.length} photos · see your transformation</p></div>
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
