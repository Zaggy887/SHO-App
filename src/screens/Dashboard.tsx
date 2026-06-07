import { useState } from 'react'
import { Menu, Bell, Clock, Play, GraduationCap, Trophy, ChevronRight } from 'lucide-react'
import { Icon } from '../components/Icon'
import { ProgressRing, SectionHeader } from '../components/ui'
import {
  user,
  weekDays,
  todaysPlan,
  progressOverview,
  habits,
  examProtocol,
  dashboardChallenge,
} from '../data/mockData'

export default function Dashboard() {
  const [selectedDay, setSelectedDay] = useState(0)

  return (
    <div className="px-5 pt-2">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <button className="grid h-10 w-10 place-items-center rounded-xl text-white/80 active:bg-white/5">
          <Menu size={24} />
        </button>
        <button className="relative grid h-10 w-10 place-items-center rounded-xl text-white/80 active:bg-white/5">
          <Bell size={22} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-ink-900" />
        </button>
      </div>

      <h1 className="text-[26px] font-extrabold tracking-tight">
        {user.greeting}, {user.name} <span className="align-middle">👋</span>
      </h1>
      <p className="mt-1 text-[15px] text-white/45">{user.subtitle}</p>

      {/* Week selector */}
      <div className="no-scrollbar -mx-5 mt-5 flex gap-2.5 overflow-x-auto px-5">
        {weekDays.map((d, i) => {
          const active = i === selectedDay
          return (
            <button
              key={d.day}
              onClick={() => setSelectedDay(i)}
              className={`flex h-[68px] w-[46px] shrink-0 flex-col items-center justify-center gap-1 rounded-2xl border transition ${
                active
                  ? 'border-brand-400 bg-brand-400 text-black'
                  : 'border-white/8 bg-ink-800 text-white/70'
              }`}
            >
              <span className="text-[11px] font-semibold opacity-80">{d.day}</span>
              <span className="text-lg font-bold">{d.date}</span>
              {(d.dot || active) && (
                <span className={`h-1 w-1 rounded-full ${active ? 'bg-black/70' : 'bg-brand-400'}`} />
              )}
            </button>
          )
        })}
      </div>

      {/* Today's Plan */}
      <div className="relative mt-5 overflow-hidden rounded-2xl border border-white/5">
        <img
          src={todaysPlan.image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
        <div className="relative bg-gradient-to-r from-ink-900 via-ink-900/90 to-ink-900/30 p-5">
          <p className="text-sm font-semibold text-brand-400">{todaysPlan.tag}</p>
          <h3 className="mt-1 text-2xl font-extrabold">{todaysPlan.title}</h3>
          <div className="mt-2 flex items-center gap-1.5 text-sm text-white/60">
            <Clock size={15} /> {todaysPlan.duration}
          </div>
          <button className="btn-primary mt-4">
            <Play size={16} fill="currentColor" /> Start Workout
          </button>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="mt-7">
        <SectionHeader title="Progress Overview" action="See All" />
        <div className="grid grid-cols-3 gap-3">
          {progressOverview.map((p) => (
            <div key={p.label} className="card p-3.5">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-white/60">
                <Icon name={p.icon} size={15} color={p.color} />
                <span className="truncate">{p.label}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold">{p.value}</span>
                {p.unit && <span className="text-xs text-white/50">{p.unit}</span>}
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[11px]">
                {p.sub && <span className="text-white/40">{p.sub}</span>}
                <span className="font-semibold text-brand-400">{p.delta}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Habit Tracker */}
      <div className="mt-7">
        <SectionHeader title="Habit Tracker" action="See All" />
        <div className="flex justify-between">
          {habits.map((h) => (
            <div key={h.label} className="flex flex-col items-center gap-1.5">
              <ProgressRing value={h.pct} size={56} stroke={4} color={h.color}>
                <Icon name={h.icon} size={20} color={h.color} />
              </ProgressRing>
              <span className="text-[11px] font-semibold text-white/80">{h.label}</span>
              <span className="text-[11px] font-bold">{h.value}</span>
              <span className="text-[10px] font-medium text-brand-400">{h.sub}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Exam Survival Protocol */}
      <button className="mt-6 flex w-full items-center gap-3 rounded-2xl border border-accent-purple/30 bg-accent-purple/15 p-4 text-left active:scale-[0.99]">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent-purple/25">
          <GraduationCap size={22} className="text-accent-purple" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-white">{examProtocol.title}</p>
          <p className="text-[13px] leading-snug text-white/55">{examProtocol.body}</p>
        </div>
        <ChevronRight size={20} className="text-accent-purple" />
      </button>

      {/* Community Challenge */}
      <div className="mt-4 flex items-center gap-4 rounded-2xl border border-white/5 bg-ink-800 p-4">
        <Trophy size={30} className="shrink-0 text-accent-orange" />
        <div className="flex-1">
          <p className="text-[13px] font-semibold text-white/70">{dashboardChallenge.title}</p>
          <p className="font-bold">{dashboardChallenge.name}</p>
          <p className="text-[13px] text-white/50">
            You're ranked{' '}
            <span className="font-semibold text-accent-orange">{dashboardChallenge.rank}</span> out of{' '}
            {dashboardChallenge.total}
          </p>
        </div>
        <div className="text-center">
          <p className="text-[11px] text-white/45">Days Left</p>
          <p className="text-2xl font-extrabold text-brand-400">{dashboardChallenge.daysLeft}</p>
        </div>
      </div>

      <div className="h-2" />
    </div>
  )
}
