import { useState } from 'react'
import { CalendarDays, ChevronRight, Check, Lightbulb, BookOpen, Sparkles } from 'lucide-react'
import { Icon } from '../components/Icon'
import { ProgressRing, ProgressBar, SegmentedTabs, ScreenHeader, SectionHeader } from '../components/ui'
import {
  nutritionSummary,
  nutritionStats,
  meals,
  nutritionTip,
  macrosBreakdown,
  insights,
  education,
} from '../data/mockData'

const TABS = ['Overview', 'Diary', 'Meals', 'Insights', 'Education']

export default function Nutrition() {
  const [tab, setTab] = useState('Overview')

  return (
    <div className="px-5 pt-2">
      <ScreenHeader
        title="Nutrition"
        trailing={
          <button className="grid h-10 w-10 place-items-center rounded-xl text-brand-400 active:bg-white/5">
            <CalendarDays size={22} />
          </button>
        }
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
  const pct = Math.round((nutritionSummary.consumed / nutritionSummary.goal) * 100)
  return (
    <>
      {/* Today's Summary */}
      <div className="card p-5">
        <h3 className="text-lg font-bold">Today's Summary</h3>
        <p className="mt-0.5 text-[13px] text-white/55">
          You're <span className="font-semibold text-brand-400">on track</span> to hit your goals! 🚀
        </p>
        <div className="mt-4 flex items-center gap-5">
          <ProgressRing value={pct} size={108} stroke={9}>
            <span className="text-2xl font-extrabold">{nutritionSummary.consumed.toLocaleString()}</span>
            <span className="text-[11px] text-white/55">kcal</span>
            <span className="text-[11px] text-white/40">/ {nutritionSummary.goal.toLocaleString()} kcal</span>
          </ProgressRing>
          <div className="flex-1 space-y-3">
            {nutritionSummary.macros.map((m) => (
              <div key={m.label}>
                <div className="mb-1 flex items-center justify-between text-[13px]">
                  <span className="text-white/70">{m.label}</span>
                  <span className="font-semibold">
                    {m.value} <span className="text-white/40">/ {m.goal}g</span>
                  </span>
                </div>
                <ProgressBar value={(m.value / m.goal) * 100} color={m.color} height={6} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stat row */}
      <div className="mt-4 grid grid-cols-4 gap-2 rounded-2xl border border-white/5 bg-ink-800 p-4">
        {nutritionStats.map((s) => (
          <div key={s.label} className="text-center">
            <Icon name={s.icon} size={20} color={s.color} className="mx-auto" />
            <p className="mt-1.5 text-base font-extrabold leading-tight">{s.value}</p>
            <p className="text-[11px] text-white/55">{s.label}</p>
            <p className="text-[10px] font-semibold" style={{ color: s.subColor }}>
              {s.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Today's Meals */}
      <div className="mt-6">
        <SectionHeader
          title="Today's Meals"
          right={
            <button className="flex items-center gap-1 text-sm font-semibold text-brand-400">
              View Diary <ChevronRight size={15} />
            </button>
          }
        />
        <div className="space-y-2.5">
          {meals.map((m) => (
            <div key={m.name} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-ink-800 p-2.5">
              <img src={m.image} alt="" className="h-14 w-14 rounded-xl object-cover" loading="lazy" />
              <div className="min-w-0 flex-1">
                <p className="font-bold leading-tight">{m.name}</p>
                <p className="truncate text-[12px] text-white/55">{m.desc}</p>
                <p className="text-[12px] text-white/40">
                  {m.kcal} kcal • {m.macros}
                </p>
              </div>
              <div className="grid h-6 w-6 place-items-center rounded-full bg-brand-400">
                <Check size={14} strokeWidth={3} className="text-black" />
              </div>
              <ChevronRight size={18} className="text-white/30" />
            </div>
          ))}
        </div>
      </div>

      {/* Nutrition Tip */}
      <div className="mt-5 flex items-center gap-3 overflow-hidden rounded-2xl border border-brand-400/20 bg-brand-400/10 p-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-400/20">
          <Lightbulb size={22} className="text-brand-400" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-brand-400">{nutritionTip.title}</p>
          <p className="text-[13px] leading-snug text-white/65">{nutritionTip.body}</p>
        </div>
      </div>

      {/* Macros Breakdown */}
      <div className="mt-6">
        <SectionHeader title="Macros Breakdown" action="Learn More" />
        <div className="grid grid-cols-3 gap-3 rounded-2xl border border-white/5 bg-ink-800 p-4">
          {macrosBreakdown.map((m) => (
            <div key={m.label} className="flex flex-col items-center">
              <ProgressRing value={m.pct} size={72} stroke={7} color={m.color}>
                <span className="text-sm font-extrabold">{m.pct}%</span>
              </ProgressRing>
              <p className="mt-2 text-sm font-bold">{m.grams}</p>
              <p className="text-[12px] font-semibold" style={{ color: m.color }}>
                {m.label}
              </p>
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
  return (
    <div className="space-y-2.5">
      <p className="text-[13px] text-white/50">Tuesday, May 20</p>
      {meals.map((m) => (
        <div key={m.name} className="rounded-2xl border border-white/5 bg-ink-800 p-4">
          <div className="flex items-center justify-between">
            <p className="font-bold">{m.name}</p>
            <p className="text-sm font-semibold text-brand-400">{m.kcal} kcal</p>
          </div>
          <p className="mt-0.5 text-[13px] text-white/55">{m.desc}</p>
          <p className="mt-1 text-[12px] text-white/40">{m.macros}</p>
        </div>
      ))}
      <button className="w-full rounded-2xl border border-dashed border-white/15 py-4 text-sm font-semibold text-white/55 active:bg-white/5">
        + Add food
      </button>
    </div>
  )
}

function MealsTab() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {meals.map((m) => (
        <div key={m.name} className="overflow-hidden rounded-2xl border border-white/5 bg-ink-800">
          <img src={m.image} alt="" className="h-28 w-full object-cover" loading="lazy" />
          <div className="p-3">
            <p className="text-sm font-bold">{m.name}</p>
            <p className="truncate text-[12px] text-white/50">{m.desc}</p>
            <p className="mt-1 text-[12px] font-semibold text-brand-400">{m.kcal} kcal</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function InsightsTab() {
  return (
    <div className="space-y-3">
      {insights.map((i) => (
        <div key={i.title} className="flex items-start gap-3 rounded-2xl border border-white/5 bg-ink-800 p-4">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-blue/15">
            <Sparkles size={20} className="text-accent-blue" />
          </div>
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
  return (
    <div className="space-y-3">
      {education.map((e) => (
        <div key={e.title} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-ink-800 p-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent-purple/15">
            <BookOpen size={20} className="text-accent-purple" />
          </div>
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
