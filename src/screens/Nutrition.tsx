import { useMemo, useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  Sparkles, Send, Check, ArrowRight, ChevronDown, ChevronRight, Clock,
  Droplet, Plus, Trash2, Share2, Search, Lightbulb, Salad, X,
} from 'lucide-react'
import { Icon } from '../components/Icon'
import { ProgressRing, SegmentedTabs, ScreenHeader } from '../components/ui'
import { useStore } from '../store/store'
import { useToast } from '../components/Toast'
import {
  PLATE_GUIDE, FOOD_TIERS, GOAL_GUIDES, NUTRITION_LESSONS, NUTRITION_TAGS, TAG_TONE_VAR,
} from '../data/nutrition'
import { BUDGET_MEALS, FOODS } from '../data/catalog'
import { todayHabit, nutritionTagsForDay } from '../store/selectors'
import { dailyTargets } from '../store/training'
import { fmtFluid, pct } from '../lib/format'
import { coachRespond, STARTER_QUESTIONS, type DayReview } from '../lib/nutritionCoach'
import type { MealName, MealCategory, BudgetMeal } from '../store/types'

const TABS = ['Coach', 'Help', 'Eats', 'My Meal Plan']
const PLAN_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const SLOTS: MealName[] = ['Breakfast', 'Lunch', 'Snack', 'Dinner']

export default function Nutrition() {
  const [tab, setTab] = useState('Coach')
  return (
    <div className="px-5 pt-2">
      <ScreenHeader title="Nutrition" />
      <SegmentedTabs tabs={TABS} active={tab} onChange={setTab} />
      <div className="mt-5">
        {tab === 'Coach' && <CoachTab />}
        {tab === 'Help' && <LearnTab />}
        {tab === 'Eats' && <BudgetTab />}
        {tab === 'My Meal Plan' && <PlanTab />}
      </div>
    </div>
  )
}

/* ============================ Coach tab ============================ */
interface ChatMsg {
  id: string
  role: 'user' | 'coach'
  text?: string
  topic?: string
  review?: DayReview
  status?: 'sending' | 'sent'
}

let msgSeq = 0
const nextId = () => `nc${++msgSeq}`

function CoachTab() {
  const { state, dispatch } = useStore()
  const goal = state.profile.goal
  const [open, setOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  function handleClose() {
    setClosing(true)
    setTimeout(() => { setOpen(false); setClosing(false) }, 240)
  }

  // Keep the newest message in view as the thread grows.
  useEffect(() => {
    if (open) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [open, messages.length, typing])

  // Focus the input once the open transition has settled.
  useEffect(() => {
    if (!open) return
    const t = window.setTimeout(() => inputRef.current?.focus(), 340)
    return () => window.clearTimeout(t)
  }, [open])

  function send(raw?: string) {
    const msg = (raw ?? input).trim()
    if (!msg || typing) return
    setInput('')

    const id = nextId()
    setMessages((m) => [...m, { id, role: 'user', text: msg, status: 'sending' }])
    // A beat later the message reads as sent, the way a tick lands in WhatsApp.
    window.setTimeout(() => {
      setMessages((m) => m.map((x) => (x.id === id ? { ...x, status: 'sent' } : x)))
    }, 480)

    setTyping(true)
    const reply = coachRespond(msg, goal)
    // Keep saving day reviews so the dashboard food check-in stays in sync.
    if (reply.kind === 'review' && !reply.review.empty) {
      dispatch({ type: 'SAVE_FOOD_REVIEW', text: msg, score: reply.review.score })
    }
    const delay = 850 + Math.min(900, msg.length * 11)
    window.setTimeout(() => {
      setTyping(false)
      setMessages((m) => [
        ...m,
        reply.kind === 'review'
          ? { id: nextId(), role: 'coach', review: reply.review }
          : { id: nextId(), role: 'coach', text: reply.answer.answer, topic: reply.answer.matched ? reply.answer.question : undefined },
      ])
    }, delay)
  }

  function openChat(initial?: string) {
    setOpen(true)
    if (initial) send(initial)
  }

  const showSuggestions = messages.length === 0 && !typing

  return (
    <>
      {/* Quick day tags — fast, tap-only "how did your eating today go" */}
      <DayTagsCard />

      {/* Unified nutrition coach: one chat for "what I ate" and "ask anything" */}
      <NutritionCoachCard onOpen={() => openChat()} onAsk={(q) => openChat(q)} />

      {/* Water quick-log */}
      <WaterCard />
      <div className="h-2" />

      {/* Full-screen chat experience, mounted at the frame so it sits above
          the bottom nav and isn't trapped in the scroll area's stacking context. */}
      {open && createPortal(
        <div
          className={`absolute inset-0 z-50 flex flex-col bg-ink-900 text-white ${closing ? 'animate-screen-out' : ''}`}
          style={{ paddingTop: 'env(safe-area-inset-top)', animation: closing ? undefined : 'screen-in 0.3s cubic-bezier(0.22,1,0.36,1)' }}
        >
          {/* Header */}
          <div className="relative flex items-center gap-2.5 px-3 py-2.5">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-400/[0.07] to-transparent" />
            <button onClick={handleClose} className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full text-brand-400 active:bg-white/10"><X size={22} /></button>
            <div className="relative shrink-0">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-brand-300 to-brand-500 text-black shadow-[0_2px_8px_-2px_rgba(126,217,87,0.5)]"><Salad size={18} /></div>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-brand-400 ring-2 ring-ink-900" />
            </div>
            <div className="relative min-w-0 flex-1">
              <p className="truncate text-[15px] font-bold leading-tight">Nutrition coach</p>
              <p className="text-[12px] leading-tight text-white/45">Active now</p>
            </div>
          </div>
          <div className="h-px bg-white/[0.06]" />

          {/* Messages */}
          <div ref={scrollRef} className="no-scrollbar flex-1 overflow-y-auto px-3 pb-3 pt-2">
            {/* Thread intro */}
            <div className="flex flex-col items-center px-6 pb-5 pt-4 text-center">
              <div className="relative">
                <div className="grid h-[68px] w-[68px] place-items-center rounded-full bg-gradient-to-br from-brand-300 to-brand-500 text-black shadow-[0_6px_20px_-6px_rgba(126,217,87,0.6)]"><Salad size={32} /></div>
                <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full bg-brand-400 ring-[3px] ring-ink-900" />
              </div>
              <p className="mt-3 text-[17px] font-bold">Nutrition coach</p>
              <p className="mt-0.5 max-w-[16rem] text-[13px] leading-snug text-white/45">Tell me what you ate today for an honest review, or ask me anything about food. No calorie counting.</p>
            </div>

            {messages.map((m, i) => {
              const isUser = m.role === 'user'
              const isLast = i === messages.length - 1

              if (m.review) {
                return (
                  <div key={m.id} className="mt-2.5 flex items-end gap-1.5 justify-start">
                    <div className="grid h-6 w-6 shrink-0 place-items-center self-end rounded-full bg-gradient-to-br from-brand-300 to-brand-500 text-black"><Salad size={12} /></div>
                    <div className={`max-w-[92%] origin-bottom-left ${isLast ? 'animate-msg-pop' : ''}`}>
                      <ReviewBubble review={m.review} />
                    </div>
                  </div>
                )
              }

              return (
                <div key={m.id}>
                  <div className={`flex items-end gap-1.5 ${isUser ? 'justify-end' : 'justify-start'} mt-2.5`}>
                    {!isUser && <div className="grid h-6 w-6 shrink-0 place-items-center self-end rounded-full bg-gradient-to-br from-brand-300 to-brand-500 text-black"><Salad size={12} /></div>}
                    <div
                      className={`max-w-[82%] px-3.5 py-2.5 text-[14.5px] leading-snug ${isUser ? 'origin-bottom-right' : 'origin-bottom-left'} ${isLast ? 'animate-msg-pop' : ''} ${
                        isUser
                          ? 'rounded-[20px] rounded-br-md bg-brand-400 text-black'
                          : 'rounded-[20px] rounded-bl-md bg-ink-700 text-white'
                      }`}
                    >
                      {!isUser && m.topic && <p className="mb-1 text-[12.5px] font-bold text-brand-400">{m.topic}</p>}
                      {m.text}
                    </div>
                  </div>
                  {isUser && (
                    <div className="mt-1 flex items-center justify-end gap-1 pr-1 text-[10.5px] font-medium text-white/35">
                      {m.status === 'sending'
                        ? <><Clock size={11} /> Sending</>
                        : <><Check size={12} className="text-brand-400" /> Sent</>}
                    </div>
                  )}
                </div>
              )
            })}

            {typing && (
              <div className="mt-2.5 flex items-end gap-1.5 justify-start">
                <div className="grid h-6 w-6 shrink-0 place-items-center self-end rounded-full bg-gradient-to-br from-brand-300 to-brand-500 text-black"><Salad size={12} /></div>
                <div className="flex items-center gap-1 rounded-[20px] rounded-bl-md bg-ink-700 px-4 py-3.5">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}
          </div>

          {/* Quick-start chips */}
          {showSuggestions && (
            <div className="px-3 pb-2">
              <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-white/35">Try asking</p>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => inputRef.current?.focus()}
                  className="flex items-center gap-2.5 rounded-2xl border border-white/8 bg-ink-800 px-3.5 py-2.5 text-left text-[13.5px] font-medium text-white/85 transition active:scale-[0.98] active:bg-ink-700"
                >
                  <Salad size={15} className="shrink-0 text-brand-400" />
                  <span className="flex-1">Tell me what I ate today</span>
                  <ChevronRight size={15} className="shrink-0 text-white/25" />
                </button>
                {STARTER_QUESTIONS.slice(0, 4).map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="flex items-center gap-2.5 rounded-2xl border border-white/8 bg-ink-800 px-3.5 py-2.5 text-left text-[13.5px] font-medium text-white/85 transition active:scale-[0.98] active:bg-ink-700"
                  >
                    <Sparkles size={15} className="shrink-0 text-brand-400" />
                    <span className="flex-1">{s}</span>
                    <ChevronRight size={15} className="shrink-0 text-white/25" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="flex items-end gap-2 px-3 pb-3 pt-1.5" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)' }}>
            <div className="flex flex-1 items-end rounded-[22px] bg-ink-800 px-1 py-1">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                rows={1}
                placeholder="Tell me what you ate, or ask…"
                className="max-h-28 min-h-[40px] flex-1 resize-none bg-transparent px-3.5 py-2 text-[15px] placeholder:text-white/30 focus:outline-none"
              />
            </div>
            <button
              onClick={() => send()}
              disabled={!input.trim() || typing}
              className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-black transition-all active:scale-90 ${input.trim() && !typing ? 'bg-brand-400 opacity-100' : 'scale-90 bg-brand-400/40 opacity-60'}`}
            >
              <Send size={18} />
            </button>
          </div>
        </div>,
        document.getElementById('app-frame') ?? document.body,
      )}
    </>
  )
}

/* Entry point in the Coach tab: a compact DM-style preview that opens the
   full-screen chat when tapped. */
function NutritionCoachCard({ onOpen, onAsk }: { onOpen: () => void; onAsk: (q: string) => void }) {
  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-white/8 bg-ink-800 p-4">
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-brand-300 to-brand-500 text-black shadow-[0_2px_8px_-2px_rgba(126,217,87,0.5)]"><Salad size={20} /></div>
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-brand-400 ring-2 ring-ink-800" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[14.5px] font-semibold leading-snug text-white/90">Tell me what you ate, or ask me anything</p>
        </div>
      </div>

      <button
        onClick={onOpen}
        className="mt-4 flex w-full items-center gap-2 rounded-full border border-white/8 bg-ink-900/60 px-4 py-3 text-left transition active:scale-[0.99]"
      >
        <span className="flex-1 text-[14.5px] text-white/35">Message your coach…</span>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-400 text-black"><Send size={15} /></span>
      </button>

      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={() => onAsk('Are sandwiches healthy?')} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[12.5px] font-medium text-white/70 active:bg-white/[0.1]">
          Are sandwiches healthy?
        </button>
        {STARTER_QUESTIONS.slice(0, 3).map((q) => (
          <button key={q} onClick={() => onAsk(q)} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[12.5px] font-medium text-white/70 active:bg-white/[0.1]">
            {q}
          </button>
        ))}
      </div>
    </div>
  )
}

function DayTagsCard() {
  const { state, dispatch } = useStore()
  const selected = nutritionTagsForDay(state)

  return (
    <div className="rounded-2xl bg-ink-800 p-5">
      <p className="text-center text-[17px] font-bold leading-tight">How did your eating today go?</p>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {NUTRITION_TAGS.map((tag) => {
          const on = selected.includes(tag.id)
          const v = TAG_TONE_VAR[tag.tone]
          return (
            <button
              key={tag.id}
              onClick={() => dispatch({ type: 'TOGGLE_NUTRITION_TAG', tag: tag.id })}
              className="flex flex-col items-center gap-1 rounded-xl py-3 text-[12px] font-semibold transition active:scale-95"
              style={
                on
                  ? { backgroundColor: `rgb(var(${v}) / 0.16)`, color: `rgb(var(${v}))`, border: `1px solid rgb(var(${v}) / 0.35)` }
                  : { backgroundColor: 'rgba(255,255,255,0.05)', color: 'rgb(var(--fg) / 0.65)', border: '1px solid rgba(255,255,255,0.08)' }
              }
            >
              <span className="text-[18px] leading-none">{tag.emoji}</span>
              <span className="leading-tight">{tag.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* Compact day-review rendered as a coach chat bubble. */
function ReviewBubble({ review }: { review: DayReview }) {
  const tierVar: Record<string, string> = { great: '--brand-500', good: '--brand-400', moderate: '--accent-orange', limit: '--danger' }
  return (
    <div className="rounded-[20px] rounded-bl-md bg-ink-700 p-3.5">
      <div className="flex items-center gap-3">
        <ProgressRing value={review.score * 10} size={58} stroke={6} color={review.score >= 5 ? 'rgb(var(--brand-400))' : 'rgb(var(--accent-orange))'}>
          <span className="text-lg font-extrabold leading-none">{review.score}</span>
        </ProgressRing>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-extrabold leading-tight">{review.verdict}</p>
          <p className="mt-0.5 text-[12.5px] leading-snug text-white/60">{review.summary}</p>
        </div>
      </div>

      {review.found.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {review.found.map((f, i) => (
            <span key={i} className="rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ backgroundColor: `rgb(var(${tierVar[f.tier]}) / 0.14)`, color: `rgb(var(${tierVar[f.tier]}))` }}>
              {f.label}
            </span>
          ))}
        </div>
      )}

      {review.highlights.length > 0 && (
        <div className="mt-3">
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-white/40">What went well</p>
          <ul className="space-y-1.5">
            {review.highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-2 text-[12.5px] leading-snug text-white/75">
                <Check size={15} strokeWidth={3} className="mt-0.5 shrink-0 text-brand-400" /> {h}
              </li>
            ))}
          </ul>
        </div>
      )}

      {review.improvements.length > 0 && (
        <div className="mt-3">
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-white/40">Try this next</p>
          <ul className="space-y-1.5">
            {review.improvements.map((h, i) => (
              <li key={i} className="flex items-start gap-2 text-[12.5px] leading-snug text-white/75">
                <ArrowRight size={15} strokeWidth={2.5} className="mt-0.5 shrink-0 text-accent-orange" /> {h}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-3 flex items-start gap-2 rounded-xl bg-brand-400/10 p-2.5">
        <Sparkles size={15} className="mt-0.5 shrink-0 text-brand-400" />
        <p className="text-[12.5px] font-medium leading-snug text-white/80">{review.encouragement}</p>
      </div>
    </div>
  )
}

/* ============================ Learn tab ============================ */
function LearnTab() {
  const { state } = useStore()
  const goal = state.profile.goal
  const guide = GOAL_GUIDES[goal]
  const [openLesson, setOpenLesson] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      {/* Goal guidance */}
      <div>
        <SectionLabel>For your goal</SectionLabel>
        <div className="rounded-2xl border border-brand-400/20 bg-brand-400/[0.06] p-4">
          <p className="font-extrabold text-brand-400">{guide.headline}</p>
          <ul className="mt-2.5 space-y-2">
            {guide.points.map((p, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[13px] leading-snug text-white/75">
                <Check size={16} strokeWidth={3} className="mt-0.5 shrink-0 text-brand-400" /> {p}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Build your plate */}
      <div>
        <SectionLabel>Build your plate</SectionLabel>
        <div className="space-y-2.5">
          {PLATE_GUIDE.map((s) => (
            <div key={s.title} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-ink-800 p-3.5">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/5 text-[11px] font-black uppercase" style={{ color: s.color }}>
                {s.portion.split(' ')[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold leading-tight" style={{ color: s.color }}>{s.title}</p>
                <p className="mt-0.5 text-[12px] leading-snug text-white/55">{s.examples}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Good / moderation / limit */}
      <div>
        <SectionLabel>Good · in moderation · occasional</SectionLabel>
        <div className="space-y-2.5">
          {FOOD_TIERS.map((t) => (
            <div key={t.tier} className="rounded-2xl border border-white/5 bg-ink-800 p-4">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                <p className="font-bold" style={{ color: t.color }}>{t.title}</p>
              </div>
              <p className="mt-1 text-[12px] leading-snug text-white/55">{t.desc}</p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {t.items.map((it) => (
                  <span key={it} className="rounded-full bg-white/[0.05] px-2.5 py-1 text-[11px] font-medium text-white/70">{it}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lessons */}
      <div>
        <SectionLabel>Quick lessons</SectionLabel>
        <div className="space-y-2.5">
          {NUTRITION_LESSONS.map((l) => {
            const open = openLesson === l.id
            return (
              <div key={l.id} className="overflow-hidden rounded-2xl border border-white/5 bg-ink-800">
                <button onClick={() => setOpenLesson(open ? null : l.id)} className="flex w-full items-center gap-3 p-4 text-left">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent-purple/15"><Icon name={l.icon} size={20} color="#8B5CF6" /></div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold leading-tight">{l.title}</p>
                    <p className="truncate text-[12px] text-white/55">{l.summary}</p>
                    <p className="mt-0.5 text-[11px] text-white/35">{l.minutes} min read</p>
                  </div>
                  <ChevronDown size={18} className={`shrink-0 text-white/30 transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>
                {open && (
                  <div className="space-y-2.5 border-t border-white/5 px-4 py-3.5">
                    {l.body.map((para, i) => (
                      <p key={i} className="text-[13px] leading-relaxed text-white/70">{para}</p>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
      <div className="h-2" />
    </div>
  )
}

/* ============================ Eats tab ============================ */
const MEAL_CATEGORIES: (MealCategory | 'All')[] = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snack', 'Sweet']

function BudgetTab() {
  const [cat, setCat] = useState<MealCategory | 'All'>('All')
  const [q, setQ] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)

  const meals = useMemo(() => {
    return BUDGET_MEALS.filter((m) => {
      const catOk = cat === 'All' || m.category === cat
      const qOk = !q || m.name.toLowerCase().includes(q.toLowerCase()) || (m.flavour ?? '').toLowerCase().includes(q.toLowerCase())
      return catOk && qOk
    })
  }, [cat, q])

  const openMeal = BUDGET_MEALS.find((m) => m.id === openId) ?? null

  return (
    <>
      <MyMealsTab />

      <div className="mt-6 rounded-2xl border border-white/8 bg-ink-800 p-4">
        <Salad size={22} className="text-brand-400" />
        <h3 className="mt-2 text-lg font-extrabold tracking-tight">Easy recipes worth cooking</h3>
        <p className="mt-1 text-[13px] leading-snug text-white/60">Simple, tasty meals with every step laid out. Pick one and cook along.</p>
      </div>

      {/* Category filter */}
      <div className="no-scrollbar -mx-5 mt-4 overflow-x-auto px-5">
        <div className="flex gap-2">
          {MEAL_CATEGORIES.map((c) => {
            const active = cat === c
            return (
              <button key={c} onClick={() => setCat(c)} className={`shrink-0 rounded-full px-3.5 py-2 text-[13px] font-semibold transition ${active ? 'bg-brand-400 text-black' : 'border border-white/10 bg-white/[0.04] text-white/70'}`}>
                {c}
              </button>
            )
          })}
        </div>
      </div>

      {/* Search */}
      <div className="mt-3 flex items-center gap-2 rounded-xl border border-white/8 bg-ink-800 px-3">
        <Search size={16} className="text-white/35" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search recipes…" className="w-full bg-transparent py-2.5 text-sm placeholder:text-white/30 focus:outline-none" />
      </div>

      {/* Recipe cards */}
      <p className="mt-4 text-[12px] font-bold uppercase tracking-[0.14em] text-white/35">{meals.length} {meals.length === 1 ? 'recipe' : 'recipes'}</p>
      <div className="mt-2 space-y-2.5">
        {meals.map((m) => (
          <button key={m.id} onClick={() => setOpenId(m.id)} className="flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-ink-800 p-3 text-left transition active:scale-[0.99]">
            <img src={m.image} alt="" className="h-16 w-16 rounded-xl object-cover" loading="lazy" />
            <div className="min-w-0 flex-1">
              <p className="font-bold leading-tight">{m.name}</p>
              {m.flavour && <p className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-white/55">{m.flavour}</p>}
              <p className="mt-1 flex items-center gap-2 text-[12px] font-semibold text-brand-400">
                <span className="inline-flex items-center gap-1"><Clock size={12} /> {m.minutes} min</span>
                <span className="text-white/25">·</span>
                <span>Serves {m.serves}</span>
              </p>
            </div>
            <ChevronRight size={18} className="shrink-0 text-white/30" />
          </button>
        ))}
        {meals.length === 0 && (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-white/12 px-6 py-10 text-center">
            <Salad size={26} className="text-white/30" />
            <p className="mt-2 text-sm font-semibold text-white/60">No recipes match that</p>
            <p className="mt-1 text-[12px] text-white/40">Try another category or clear your search.</p>
          </div>
        )}
      </div>
      <div className="h-2" />

      {openMeal && <RecipeModal meal={openMeal} onClose={() => setOpenId(null)} />}
    </>
  )
}

/* A floating recipe card that pops over the screen, dimming what's behind it. */
function RecipeModal({ meal, onClose }: { meal: BudgetMeal; onClose: () => void }) {
  const toast = useToast()
  const [closing, setClosing] = useState(false)

  function close() {
    setClosing(true)
    window.setTimeout(onClose, 170)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function copyRecipe() {
    const txt = `${meal.name}\n\nIngredients\n${meal.ingredients.map((i) => `- ${i}`).join('\n')}\n\nMethod\n${meal.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`
    navigator.clipboard?.writeText(txt).then(() => toast('Recipe copied')).catch(() => {})
  }

  return createPortal(
    <div
      onClick={close}
      className={`absolute inset-0 z-[60] flex items-center justify-center p-4 ${closing ? 'animate-fade-out' : 'animate-fade-in'}`}
      style={{ background: 'rgba(0,0,0,0.62)', backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative flex max-h-[86vh] w-full max-w-[400px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-ink-800 shadow-2xl ${closing ? 'animate-pop-out' : 'animate-pop-in'}`}
      >
        {/* Hero */}
        <div className="relative h-40 shrink-0">
          <img src={meal.image} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-800 via-ink-800/30 to-transparent" />
          <button onClick={close} className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/45 text-white backdrop-blur-sm active:bg-black/65"><X size={18} /></button>
          <div className="absolute inset-x-4 bottom-3">
            <p className="text-[19px] font-extrabold leading-tight">{meal.name}</p>
            <p className="mt-1 flex items-center gap-2 text-[12.5px] font-semibold text-brand-300">
              <span className="inline-flex items-center gap-1"><Clock size={13} /> {meal.minutes} min</span>
              <span className="opacity-40">·</span>
              <span>Serves {meal.serves}</span>
            </p>
          </div>
        </div>

        {/* Scrollable detail */}
        <div className="no-scrollbar flex-1 space-y-4 overflow-y-auto px-4 py-4 text-[14px]">
          {meal.flavour && <p className="text-[13.5px] leading-snug text-white/65">{meal.flavour}</p>}

          <div className="flex flex-wrap gap-1.5">
            {meal.tags.map((t) => <span key={t} className="rounded-full bg-brand-400/15 px-2.5 py-1 text-[11px] font-semibold text-brand-300">{t}</span>)}
          </div>

          <div>
            <p className="mb-1.5 text-[12px] font-bold uppercase tracking-wide text-white/40">Ingredients</p>
            <ul className="space-y-1">
              {meal.ingredients.map((ing) => (
                <li key={ing} className="flex items-start gap-2 text-white/75">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-400" /> {ing}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-1.5 text-[12px] font-bold uppercase tracking-wide text-white/40">Method</p>
            <ol className="space-y-2.5">
              {meal.steps.map((s, i) => (
                <li key={i} className="flex items-start gap-2.5 text-white/80">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-400/15 text-[12px] font-bold text-brand-400">{i + 1}</span>
                  <span className="leading-snug">{s}</span>
                </li>
              ))}
            </ol>
          </div>

          {meal.cookOnce && (
            <div className="flex gap-2 rounded-xl bg-brand-400/10 p-3 text-[13px] text-white/70">
              <Lightbulb size={16} className="shrink-0 text-brand-400" /> {meal.cookOnce}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-white/8 p-3" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)' }}>
          <button onClick={copyRecipe} className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-400/15 py-3 text-sm font-semibold text-brand-400 active:bg-brand-400/25">
            <Share2 size={15} /> Copy recipe
          </button>
        </div>
      </div>
    </div>,
    document.getElementById('app-frame') ?? document.body,
  )
}

/* ============================ Water quick-log ============================ */
function WaterCard() {
  const { state, dispatch } = useStore()
  const units = state.settings.units
  const h = todayHabit(state)
  const t = dailyTargets(state)
  const step = units === 'imperial' ? 8 / 33.814 : 0.25
  return (
    <div className="mt-4 rounded-2xl border border-white/5 bg-ink-800 p-4">
      <div className="flex items-center gap-2">
        <Droplet size={18} className="text-brand-400" />
        <p className="flex-1 font-bold">Water</p>
        <p className="font-extrabold">{fmtFluid(h.waterL, units)} <span className="text-[12px] font-medium text-white/40">/ {fmtFluid(t.waterL, units)}</span></p>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/8">
        <div className="h-full rounded-full bg-brand-400 transition-[width] duration-500" style={{ width: `${pct(h.waterL, t.waterL)}%` }} />
      </div>
      <div className="mt-3 flex gap-2">
        <button onClick={() => dispatch({ type: 'ADJUST_WATER', deltaL: -step })} className="flex-1 rounded-xl bg-ink-700 py-2.5 font-bold active:bg-ink-600">−</button>
        <button onClick={() => dispatch({ type: 'ADJUST_WATER', deltaL: step })} className="flex-[2] rounded-xl bg-brand-400/20 py-2.5 font-bold text-brand-400 active:bg-brand-400/30">
          + {units === 'imperial' ? '8 oz' : '250 ml'}
        </button>
      </div>
    </div>
  )
}

/* ============================ Meal planner ============================ */
function PlanTab() {
  const { state, dispatch } = useStore()
  const toast = useToast()
  const plan = state.mealPlan ?? []
  const mealNames = useMemo(() => [
    ...BUDGET_MEALS.map((m) => m.name),
    ...FOODS.map((f) => f.name),
    ...(state.myMeals ?? []).map((m) => m.name),
  ], [state.myMeals])
  const [day, setDay] = useState('Mon')
  const [slot, setSlot] = useState<MealName>('Breakfast')
  const [meal, setMeal] = useState(mealNames[0])

  function add() {
    dispatch({ type: 'ADD_PLANNED_MEAL', plan: { day, slot, name: meal } })
    toast(`Added to ${day}`)
  }

  const selectCls = 'rounded-xl border border-white/8 bg-ink-800 px-3 py-2.5 text-sm text-white focus:border-brand-400/60 focus:outline-none'
  return (
    <>
      <div className="rounded-2xl border border-white/8 bg-ink-800 p-4">
        <h3 className="text-lg font-extrabold tracking-tight">Plan your week</h3>
        <p className="mt-1 text-[13px] leading-snug text-white/60">Map meals to days so shopping and cooking are sorted ahead of time.</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <select value={day} onChange={(e) => setDay(e.target.value)} className={selectCls}>
            {PLAN_DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={slot} onChange={(e) => setSlot(e.target.value as MealName)} className={selectCls}>
            {SLOTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <select value={meal} onChange={(e) => setMeal(e.target.value)} className={`${selectCls} mt-2 w-full`}>
          {mealNames.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
        <button onClick={add} className="btn-primary mt-3 w-full"><Plus size={16} /> Add to plan</button>
      </div>

      <div className="mt-4 space-y-2.5">
        {PLAN_DAYS.map((d) => {
          const items = plan.filter((p) => p.day === d)
          return (
            <div key={d} className="rounded-2xl border border-white/5 bg-ink-800 p-3.5">
              <div className="mb-1.5 flex items-center justify-between">
                <p className="font-bold">{d}</p>
                <span className="text-[11px] text-white/35">{items.length ? `${items.length} planned` : '-'}</span>
              </div>
              {items.length === 0 ? (
                <p className="text-[12px] text-white/35">Nothing planned</p>
              ) : (
                <div className="space-y-1.5">
                  {items.map((it) => (
                    <div key={it.id} className="flex items-center gap-2.5">
                      <span className="w-16 shrink-0 text-[11px] font-semibold uppercase tracking-wide text-brand-400">{it.slot}</span>
                      <span className="min-w-0 flex-1 truncate text-[13px] text-white/80">{it.name}</span>
                      <button onClick={() => dispatch({ type: 'REMOVE_PLANNED_MEAL', id: it.id })} className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/5 text-white/40 active:bg-white/10"><Trash2 size={13} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div className="h-2" />
    </>
  )
}

/* ============================ My Meals tab ============================ */
function MyMealsTab() {
  const { state, dispatch } = useStore()
  const toast = useToast()
  const meals = state.myMeals ?? []
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')
  const [kcal, setKcal] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')
  const [ingLine, setIngLine] = useState('')

  function resetForm() {
    setName(''); setNotes(''); setKcal(''); setProtein(''); setCarbs(''); setFat(''); setIngLine('')
    setCreating(false)
  }

  function save() {
    const n = name.trim()
    if (!n) return
    dispatch({
      type: 'ADD_MY_MEAL',
      meal: {
        name: n,
        notes: notes.trim() || undefined,
        kcal: Number(kcal) || 0,
        p: Number(protein) || 0,
        c: Number(carbs) || 0,
        f: Number(fat) || 0,
        ingredients: ingLine.split('\n').map((s) => s.trim()).filter(Boolean),
      },
    })
    toast(`"${n}" saved`)
    resetForm()
  }

  const inputCls = 'rounded-xl border border-white/8 bg-ink-900/60 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-brand-400/60 focus:outline-none'

  return (
    <div className="overflow-hidden rounded-2xl border border-white/8 bg-ink-800">
      {/* Clickable header */}
      <button
        onClick={() => { setOpen((v) => !v); if (open) resetForm() }}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-extrabold tracking-tight">My Meals</h3>
          <p className="mt-0.5 text-[13px] leading-snug text-white/60">
            {meals.length === 0 ? 'Save your own recipes and use them in the meal planner.' : `${meals.length} saved recipe${meals.length === 1 ? '' : 's'} · tap to manage`}
          </p>
        </div>
        <ChevronDown size={18} className={`shrink-0 text-white/30 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="border-t border-white/5">
          {/* Saved meals list */}
          {meals.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-8 text-center">
              <Salad size={26} className="text-white/25" />
              <p className="mt-2 text-[14px] font-semibold text-white/50">No saved meals yet</p>
              <p className="mt-1 text-[12px] leading-snug text-white/35">Add a recipe below — it'll appear in the Plan tab too.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {meals.map((m) => (
                <div key={m.id} className="flex items-start gap-3 px-4 py-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold leading-tight">{m.name}</p>
                    {m.notes && <p className="mt-0.5 text-[12px] leading-snug text-white/50">{m.notes}</p>}
                    {(m.kcal > 0 || m.p > 0) && (
                      <p className="mt-1 text-[12px] font-semibold text-brand-400">
                        {m.kcal > 0 ? `${m.kcal} kcal` : ''}
                        {m.kcal > 0 && m.p > 0 ? ' · ' : ''}
                        {m.p > 0 ? `${m.p}g protein` : ''}
                      </p>
                    )}
                    {m.ingredients.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {m.ingredients.map((ing, i) => (
                          <span key={i} className="rounded-full bg-white/[0.05] px-2.5 py-1 text-[11px] text-white/55">{ing}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button onClick={() => dispatch({ type: 'REMOVE_MY_MEAL', id: m.id })} className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/5 text-white/40 active:bg-white/10">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add meal form */}
          {creating ? (
            <div className="border-t border-white/5 p-4 space-y-2.5">
              <p className="text-[12px] font-bold uppercase tracking-wide text-white/40">New recipe</p>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Meal name *" className={`${inputCls} w-full`} />
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Description (optional)" rows={2} className={`${inputCls} w-full resize-none`} />
              <div className="grid grid-cols-2 gap-2">
                <input value={kcal} onChange={(e) => setKcal(e.target.value)} type="number" min="0" placeholder="Calories" className={inputCls} />
                <input value={protein} onChange={(e) => setProtein(e.target.value)} type="number" min="0" placeholder="Protein (g)" className={inputCls} />
                <input value={carbs} onChange={(e) => setCarbs(e.target.value)} type="number" min="0" placeholder="Carbs (g)" className={inputCls} />
                <input value={fat} onChange={(e) => setFat(e.target.value)} type="number" min="0" placeholder="Fat (g)" className={inputCls} />
              </div>
              <textarea value={ingLine} onChange={(e) => setIngLine(e.target.value)} placeholder={"Ingredients (one per line)\ne.g. 2 eggs\n100g oats"} rows={4} className={`${inputCls} w-full resize-none`} />
              <div className="flex gap-2">
                <button onClick={save} disabled={!name.trim()} className="btn-primary flex-1"><Plus size={15} /> Save meal</button>
                <button onClick={resetForm} className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-white/60 active:bg-white/[0.08]">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="border-t border-white/5 p-3">
              <button onClick={() => setCreating(true)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-400/15 py-2.5 text-[13px] font-semibold text-brand-400 active:bg-brand-400/25">
                <Plus size={15} /> Add a meal
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-2.5 text-[12px] font-bold uppercase tracking-[0.14em] text-white/40">{children}</p>
}
