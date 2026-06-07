import { useState } from 'react'
import {
  Sparkles, Check, ChevronRight, ChevronDown, Wallet, Trophy, Flame,
  GraduationCap, Dumbbell, Lightbulb, ShieldQuestion, Share2, Plus, MapPin,
} from 'lucide-react'
import { Sheet } from '../components/Sheet'
import { Avatar } from '../components/Avatar'
import { Icon } from '../components/Icon'
import { Chip, ProgressBar } from '../components/ui'
import { TechniqueClip } from '../components/TechniqueClip'
import { useStore } from '../store/store'
import { useToast } from '../components/Toast'
import { useNav } from '../nav'
import {
  BUDGET_MEALS, BEGINNER_LESSONS, exerciseDetail, exById, REP_TARGETS, BASE_WEIGHTS,
} from '../data/catalog'
import { nextSetRecommendation } from '../store/training'
import { coachThreadView } from '../store/coach'
import { todaySession } from '../store/selectors'
import { relativeLabel } from '../lib/date'
import type { CoachKind, MealName } from '../store/types'

type Props = { open: boolean; onClose: () => void; params?: Record<string, unknown> }

/* ============================ Your Coach ============================ */
const coachIcon: Record<CoachKind, JSX.Element> = {
  checkin: <Sparkles size={16} className="text-brand-400" />,
  nudge: <Flame size={16} className="text-brand-400" />,
  celebration: <Trophy size={16} className="text-brand-400" />,
  exam: <GraduationCap size={16} className="text-brand-400" />,
  qa: <ShieldQuestion size={16} className="text-brand-400" />,
}

export function CoachSheet({ open, onClose }: Props) {
  const { state } = useStore()
  const nav = useNav()
  const thread = coachThreadView(state)

  return (
    <Sheet open={open} onClose={onClose} title="Your coach">
      <div className="mb-4 flex items-center gap-3 rounded-2xl border border-white/5 bg-ink-800 p-3.5">
        <div className="grid h-11 w-11 place-items-center rounded-full bg-brand-400 text-black"><Sparkles size={20} /></div>
        <div>
          <p className="font-bold leading-tight">Coach</p>
          <p className="text-[12px] text-white/50">Reads your logs. Checks in, not chats.</p>
        </div>
      </div>

      <div className="space-y-3">
        {thread.map((m, i) => (
          <div key={m.id} className={`rounded-2xl border p-4 ${i === 0 ? 'border-brand-400/30 bg-brand-400/5' : 'border-white/5 bg-ink-800'}`}>
            <div className="mb-1 flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-white/5">{coachIcon[m.kind]}</span>
              <p className="font-bold leading-tight">{m.title}</p>
              <span className="ml-auto text-[11px] text-white/35">{i === 0 ? 'Today' : relativeLabel(m.dateKey)}</span>
            </div>
            <p className="text-[14px] leading-snug text-white/70">{m.body}</p>
            {m.cta && (
              <button
                onClick={() => nav.open(m.cta!.overlay as Parameters<typeof nav.open>[0])}
                className="mt-3 inline-flex items-center gap-1 rounded-full bg-brand-400 px-3.5 py-1.5 text-sm font-bold text-black active:scale-95"
              >
                {m.cta.label} <ChevronRight size={15} />
              </button>
            )}
          </div>
        ))}
      </div>
    </Sheet>
  )
}

/* ====================== New to the Gym track ====================== */
export function BeginnerSheet({ open, onClose }: Props) {
  const { state, dispatch } = useStore()
  const toast = useToast()
  const [openId, setOpenId] = useState<string | null>(BEGINNER_LESSONS[0]?.id ?? null)
  const done = state.beginnerProgress
  const total = BEGINNER_LESSONS.length

  return (
    <Sheet open={open} onClose={onClose} title="New to the gym">
      <div className="rounded-3xl border border-white/8 bg-ink-800 p-5">
        <p className="text-[13px] font-semibold text-brand-400">Your first 90 days</p>
        <h3 className="mt-1 text-xl font-extrabold tracking-tight">No experience needed</h3>
        <p className="mt-1 text-[14px] leading-snug text-white/60">A calm, step by step path into the gym. Read one when you have a spare minute. Nothing here assumes you know anything yet.</p>
        <div className="mt-4 flex items-center gap-3">
          <ProgressBar value={(done.length / total) * 100} />
          <span className="shrink-0 text-[12px] font-semibold text-white/50">{done.length}/{total}</span>
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        {BEGINNER_LESSONS.map((l) => {
          const isOpen = openId === l.id
          const isDone = done.includes(l.id)
          return (
            <div key={l.id} className="overflow-hidden rounded-2xl border border-white/5 bg-ink-800">
              <button onClick={() => setOpenId(isOpen ? null : l.id)} className="flex w-full items-center gap-3 p-4 text-left">
                <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${isDone ? 'bg-brand-400 text-black' : 'bg-brand-400/15 text-brand-400'}`}>
                  {isDone ? <Check size={18} strokeWidth={3} /> : <Icon name={l.icon} size={20} color="currentColor" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold leading-tight">{l.title}</p>
                  <p className="truncate text-[12px] text-white/50">{l.summary} · {l.minutes} min</p>
                </div>
                <ChevronDown size={18} className={`text-white/30 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOpen && (
                <div className="px-4 pb-4">
                  <div className="space-y-2 border-t border-white/5 pt-3 text-[14px] leading-relaxed text-white/70">
                    {l.body.map((para, i) => <p key={i}>{para}</p>)}
                  </div>
                  {!isDone && (
                    <button onClick={() => { dispatch({ type: 'COMPLETE_LESSON', id: l.id }); toast('Lesson done. Nice.') }} className="btn-primary mt-3 w-full py-2.5 text-sm">
                      Mark as read
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Sheet>
  )
}

/* ======================== Budget eats ============================= */
export function BudgetEatsSheet({ open, onClose }: Props) {
  const { dispatch } = useStore()
  const toast = useToast()
  const [openId, setOpenId] = useState<string | null>(null)
  const [showList, setShowList] = useState(false)

  const grocery = (() => {
    const map = new Map<string, number>()
    for (const m of BUDGET_MEALS) for (const ing of m.ingredients) map.set(ing.item, (map.get(ing.item) ?? 0) + ing.cost)
    return [...map.entries()]
  })()
  const weekTotal = grocery.reduce((a, [, c]) => a + c, 0)

  function logMeal(id: string) {
    const m = BUDGET_MEALS.find((x) => x.id === id)!
    dispatch({ type: 'ADD_MEAL', meal: { meal: 'Lunch' as MealName, name: m.name, qty: 1, kcal: m.kcal, p: m.p, c: m.c, f: m.f } })
    toast('Logged to lunch')
  }

  return (
    <Sheet open={open} onClose={onClose} title="Eat well for less">
      <div className="rounded-3xl border border-white/8 bg-ink-800 p-5">
        <Wallet size={26} className="text-brand-400" />
        <h3 className="mt-2 text-xl font-extrabold tracking-tight">Cheap, high protein, fast</h3>
        <p className="mt-1 text-[14px] leading-snug text-white/60">Real meals for a student budget, with rough costs. Cook once, eat across a couple of days.</p>
      </div>

      <button onClick={() => setShowList((v) => !v)} className="mt-4 flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-ink-800 p-4 text-left">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-400/15 text-brand-400 font-bold text-sm">${weekTotal.toFixed(0)}</div>
        <div className="flex-1">
          <p className="font-bold leading-tight">This week's grocery list</p>
          <p className="text-[12px] text-white/50">Everything for all meals below</p>
        </div>
        <ChevronDown size={18} className={`text-white/30 transition-transform ${showList ? 'rotate-180' : ''}`} />
      </button>
      {showList && (
        <div className="mt-2 rounded-2xl border border-white/5 bg-ink-800 p-4">
          {grocery.map(([item, cost]) => (
            <div key={item} className="flex items-center justify-between border-b border-white/5 py-2 text-[13px] last:border-0">
              <span className="text-white/70">{item}</span>
              <span className="font-semibold text-white/50">${cost.toFixed(2)}</span>
            </div>
          ))}
          <div className="mt-2 flex items-center justify-between text-[14px] font-bold">
            <span>Estimated total</span><span className="text-brand-400">${weekTotal.toFixed(2)}</span>
          </div>
        </div>
      )}

      <div className="mt-4 space-y-2.5">
        {BUDGET_MEALS.map((m) => {
          const isOpen = openId === m.id
          return (
            <div key={m.id} className="overflow-hidden rounded-2xl border border-white/5 bg-ink-800">
              <button onClick={() => setOpenId(isOpen ? null : m.id)} className="flex w-full items-center gap-3 p-3 text-left">
                <img src={m.image} alt="" className="h-14 w-14 rounded-xl object-cover" loading="lazy" />
                <div className="min-w-0 flex-1">
                  <p className="font-bold leading-tight">{m.name}</p>
                  <p className="text-[12px] text-white/50">{m.kcal} kcal · {m.p}g protein</p>
                  <div className="mt-1 flex flex-wrap gap-1">{m.tags.slice(0, 2).map((t) => <Chip key={t} color="green">{t}</Chip>)}</div>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-brand-400">${m.cost.toFixed(2)}</p>
                  <p className="text-[10px] text-white/40">per serve</p>
                </div>
              </button>
              {isOpen && (
                <div className="space-y-3 border-t border-white/5 px-4 py-3 text-[14px]">
                  <div>
                    <p className="mb-1 text-[12px] font-bold uppercase tracking-wide text-white/40">Ingredients</p>
                    {m.ingredients.map((ing) => (
                      <div key={ing.item} className="flex justify-between py-0.5 text-white/70"><span>{ing.item}</span><span className="text-white/45">${ing.cost.toFixed(2)}</span></div>
                    ))}
                  </div>
                  <div>
                    <p className="mb-1 text-[12px] font-bold uppercase tracking-wide text-white/40">Method</p>
                    <ol className="list-decimal space-y-1 pl-4 text-white/70">{m.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
                  </div>
                  {m.cookOnce && (
                    <div className="flex gap-2 rounded-xl bg-brand-400/10 p-3 text-[13px] text-white/70">
                      <Lightbulb size={16} className="shrink-0 text-brand-400" /> {m.cookOnce}
                    </div>
                  )}
                  <button onClick={() => logMeal(m.id)} className="btn-primary w-full py-2.5 text-sm"><Plus size={15} /> Log to today</button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Sheet>
  )
}

/* ===================== Exercise technique ========================= */
export function ExerciseDetailSheet({ open, onClose, params }: Props) {
  const { state } = useStore()
  const defId = (params?.defId as string) ?? 'bench'
  const def = exById(defId)
  const detail = exerciseDetail(defId)
  const target = REP_TARGETS[defId] ?? '8–12'
  const sessionEx = todaySession(state)?.exercises.find((e) => e.defId === defId)
  const fallback = sessionEx ? Math.max(...sessionEx.sets.map((s) => s.weightKg)) : BASE_WEIGHTS[defId] ?? 20
  const rec = nextSetRecommendation(state, defId, sessionEx?.targetReps ?? target, fallback)

  if (!def) return null
  return (
    <Sheet open={open} onClose={onClose} title={def.name}>
      <TechniqueClip poster={def.image} videoUrl={undefined} label="Form clip coming soon" />

      <div className="mt-3 flex items-center gap-2">
        <Chip color="gray">{def.muscle}</Chip>
        {detail.beginnerFriendly && <Chip color="green">Beginner friendly</Chip>}
      </div>

      <p className="mb-2 mt-5 text-[12px] font-bold uppercase tracking-wide text-white/40">How to do it</p>
      <div className="space-y-2">
        {detail.cues.map((c, i) => (
          <div key={i} className="flex items-start gap-3 rounded-xl border border-white/5 bg-ink-800 p-3 text-[14px]">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-400/15 text-[12px] font-bold text-brand-400">{i + 1}</span>
            <span className="text-white/75">{c}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2.5 rounded-2xl border border-accent-orange/20 bg-accent-orange/10 p-4">
        <Lightbulb size={18} className="shrink-0 text-accent-orange" />
        <div>
          <p className="text-[13px] font-bold text-accent-orange">Most common mistake</p>
          <p className="text-[13px] leading-snug text-white/70">{detail.commonMistake}</p>
        </div>
      </div>

      <div className="mt-3 flex gap-2.5 rounded-2xl border border-white/5 bg-ink-800 p-4">
        <Dumbbell size={18} className="shrink-0 text-brand-400" />
        <div>
          <p className="text-[13px] font-bold">If it's taken</p>
          <p className="text-[13px] leading-snug text-white/70">{detail.ifTaken}</p>
        </div>
      </div>

      {rec.hasHistory && (
        <div className="mt-3 flex gap-2.5 rounded-2xl border border-brand-400/20 bg-brand-400/5 p-4">
          <Sparkles size={18} className="shrink-0 text-brand-400" />
          <div>
            <p className="text-[13px] font-bold text-brand-400">Coach's call next time</p>
            <p className="text-[13px] leading-snug text-white/70">{rec.reason}</p>
          </div>
        </div>
      )}
    </Sheet>
  )
}

/* ===================== Training partner matcher =================== */
const levelLabel: Record<string, string> = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' }

export function PartnerMatchSheet({ open, onClose }: Props) {
  const { state, dispatch } = useStore()
  const toast = useToast()
  const candidates = [...state.partners].sort((a, b) => b.matchPct - a.matchPct)

  return (
    <Sheet open={open} onClose={onClose} title="Find a training partner">
      <div className="rounded-3xl border border-white/8 bg-ink-800 p-5">
        <MapPin size={24} className="text-brand-400" />
        <h3 className="mt-2 text-xl font-extrabold tracking-tight">People on your campus</h3>
        <p className="mt-1 text-[14px] leading-snug text-white/60">Matched by your hall, level and goal. Training with someone at your stage is the easiest way to keep showing up.</p>
      </div>

      <div className="mt-4 space-y-2.5">
        {candidates.map((c) => {
          const sameDorm = c.dorm === state.profile.dorm
          return (
            <div key={c.id} className="rounded-2xl border border-white/5 bg-ink-800 p-3.5">
              <div className="flex items-center gap-3">
                <Avatar name={c.name} size={44} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold leading-tight">{c.name}</p>
                    {sameDorm && <Chip color="green">Your hall</Chip>}
                  </div>
                  <p className="text-[12px] text-white/50">{levelLabel[c.level]} · {c.dorm}</p>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-brand-400">{c.matchPct}%</p>
                  <p className="text-[10px] text-white/40">match</p>
                </div>
              </div>
              <p className="mt-2 text-[13px] leading-snug text-white/65">{c.blurb}</p>
              <p className="mt-1 text-[12px] text-white/40">Free: {c.availability}</p>
              <button
                onClick={() => { dispatch({ type: 'CONNECT_PARTNER', id: c.id }); toast(c.connected ? 'Request cancelled' : `Request sent to ${c.name.split(' ')[0]}`) }}
                className={`mt-3 w-full rounded-full py-2.5 text-sm font-bold transition active:scale-[0.98] ${c.connected ? 'bg-ink-700 text-white/70' : 'bg-brand-400 text-black'}`}
              >
                {c.connected ? 'Request sent' : 'Connect'}
              </button>
            </div>
          )
        })}
      </div>
    </Sheet>
  )
}

/* ====================== PR celebration =========================== */
export function PRCelebrationSheet({ open, onClose, params }: Props) {
  const { dispatch } = useStore()
  const toast = useToast()
  const lift = (params?.lift as string) ?? 'a lift'
  const weight = (params?.weight as string) ?? ''
  const reps = (params?.reps as number) ?? 0

  function share() {
    dispatch({ type: 'ADD_POST', text: `New ${lift} best, ${weight} for ${reps}. Proof that turning up works.` })
    toast('Shared to your campus feed')
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title="Personal best">
      <div className="flex flex-col items-center py-4 text-center">
        <div className="grid h-20 w-20 place-items-center rounded-3xl bg-brand-400 text-black shadow-glow">
          <Trophy size={38} />
        </div>
        <p className="mt-5 text-[13px] font-semibold uppercase tracking-wide text-brand-400">New personal best</p>
        <h3 className="mt-1 text-3xl font-extrabold tracking-tight">{lift}</h3>
        <p className="mt-1 text-lg font-bold text-white/80">{weight} for {reps} reps</p>
        <p className="mt-3 max-w-[260px] text-[14px] leading-snug text-white/55">That is the strongest you have logged on this lift. Quietly huge. Your cohort would love to see it.</p>
      </div>
      <button onClick={share} className="btn-primary w-full"><Share2 size={16} /> Share with your cohort</button>
      <button onClick={onClose} className="mt-2 w-full rounded-full bg-ink-700 py-3 text-sm font-semibold text-white/70 active:scale-[0.98]">Keep it to myself</button>
    </Sheet>
  )
}
