import { useState } from 'react'
import { SlidersHorizontal, ChevronDown, ArrowRight, Trophy, Flame } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { Icon } from '../components/Icon'
import { ProgressRing, ScreenHeader, SectionHeader } from '../components/ui'
import {
  progressQuote,
  progressOverviewCards,
  weightTrend,
  strengthProgress,
  habitConsistency,
  streak,
} from '../data/mockData'

export default function Progress() {
  const [range, setRange] = useState('4 Weeks')

  return (
    <div className="px-5 pt-2">
      <ScreenHeader
        title="Progress"
        trailing={
          <button className="grid h-10 w-10 place-items-center rounded-xl text-brand-400 active:bg-white/5">
            <SlidersHorizontal size={22} />
          </button>
        }
      />

      {/* Quote card */}
      <div className="relative overflow-hidden rounded-2xl border border-white/5">
        <img src={progressQuote.image} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
        <div className="relative bg-gradient-to-r from-ink-900 via-ink-900/90 to-ink-900/20 p-5">
          <h3 className="max-w-[260px] text-xl font-extrabold leading-tight">
            Discipline today, <span className="text-brand-400">freedom</span> tomorrow.
          </h3>
          <p className="mt-2 max-w-[230px] text-[13px] leading-snug text-white/60">{progressQuote.body}</p>
          <div className="mt-3 h-0.5 w-10 rounded-full bg-brand-400" />
        </div>
      </div>

      {/* Overview */}
      <div className="mt-6">
        <SectionHeader title="Overview" />
        <div className="grid grid-cols-2 gap-3">
          {progressOverviewCards.map((c) => (
            <div key={c.label} className="card p-4">
              <div className="mb-2 flex items-center gap-1.5 text-[13px] font-medium text-white/60">
                <Icon name={c.icon} size={16} color={c.color} />
                {c.label}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold">{c.value}</span>
                {c.unit && <span className="text-sm text-white/50">{c.unit}</span>}
              </div>
              <p className="mt-1 text-[12px] font-semibold text-brand-400">{c.delta}</p>
              <p className="text-[11px] text-white/40">{c.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Weight Trend */}
      <div className="mt-6 rounded-2xl border border-white/5 bg-ink-800 p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="section-title">Weight Trend</h2>
          <div className="flex items-center gap-3">
            <button className="text-sm font-semibold text-brand-400">See All</button>
            <button
              onClick={() => setRange((r) => (r === '4 Weeks' ? '12 Weeks' : '4 Weeks'))}
              className="flex items-center gap-1 rounded-lg border border-white/10 bg-ink-700 px-2.5 py-1 text-xs font-semibold text-white/70"
            >
              {range} <ChevronDown size={14} />
            </button>
          </div>
        </div>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weightTrend} margin={{ top: 10, right: 6, left: -22, bottom: 0 }}>
              <defs>
                <linearGradient id="wt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7ED957" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#7ED957" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={24}
              />
              <YAxis
                domain={[70, 74]}
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip
                contentStyle={{
                  background: '#1A1B1E',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  fontSize: 12,
                }}
                labelStyle={{ color: '#fff' }}
                formatter={(v: number) => [`${v} kg`, 'Weight']}
              />
              <Area
                type="monotone"
                dataKey="weight"
                stroke="#7ED957"
                strokeWidth={3}
                fill="url(#wt)"
                dot={{ r: 3, fill: '#7ED957', strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Strength Progress */}
      <div className="mt-6">
        <SectionHeader title="Strength Progress" action="See All" />
        <div className="space-y-3 rounded-2xl border border-white/5 bg-ink-800 p-3">
          {strengthProgress.map((s) => (
            <div key={s.name} className="flex items-center gap-3">
              <img src={s.image} alt="" className="h-11 w-11 rounded-xl object-cover" loading="lazy" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold leading-tight">{s.name}</p>
                <p className="text-[12px] text-white/40">1RM</p>
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                <div className="text-right">
                  <p className="text-white/50">{s.from}</p>
                  <p className="text-[10px] text-white/35">4 weeks ago</p>
                </div>
                <ArrowRight size={14} className="text-white/30" />
                <div className="text-right">
                  <p className="font-bold text-brand-400">{s.to}</p>
                  <p className="text-[10px] text-white/35">Today</p>
                </div>
              </div>
              <span className="ml-1 text-sm font-semibold text-brand-400">{s.delta}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Habit Consistency */}
      <div className="mt-6">
        <SectionHeader title="Habit Consistency" action="See All" />
        <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-ink-800 p-4">
          <div className="flex flex-1 justify-between">
            {habitConsistency.map((h) => (
              <div key={h.label} className="flex flex-col items-center">
                <ProgressRing value={h.pct} size={54} stroke={4} color={h.color}>
                  <span className="text-[13px] font-bold">{h.value}</span>
                </ProgressRing>
                <p className="mt-1.5 text-[11px] font-semibold">{h.label}</p>
                <p className="text-[10px] text-white/40">{h.sub}</p>
              </div>
            ))}
          </div>
          <div className="ml-1 border-l border-white/8 pl-4 text-center">
            <p className="text-[11px] text-white/45">Current Streak</p>
            <p className="flex items-center justify-center gap-1 text-2xl font-extrabold">
              {streak.current} <Flame size={20} className="text-accent-orange" />
            </p>
            <p className="text-[11px] text-white/40">Best: {streak.best} days</p>
          </div>
        </div>
      </div>

      {/* Top users banner */}
      <div className="mt-5 flex items-center gap-3 rounded-2xl border border-brand-400/20 bg-brand-400/10 p-4">
        <Trophy size={28} className="shrink-0 text-brand-400" />
        <div className="flex-1">
          <p className="font-bold">You're in the top 20% of users</p>
          <p className="text-[13px] text-white/55">Keep showing up. The results will follow.</p>
        </div>
        <button className="btn-primary px-4 py-2 text-sm">View Insights</button>
      </div>
      <div className="h-2" />
    </div>
  )
}
