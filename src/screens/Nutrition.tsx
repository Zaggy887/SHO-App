import { useMemo, useState } from 'react'
import {
  Sparkles, Send, Check, ArrowRight, ChevronDown,
  Wallet, Search, Lightbulb, HelpCircle, Salad,
} from 'lucide-react'
import { Icon } from '../components/Icon'
import { ProgressRing, SegmentedTabs, ScreenHeader } from '../components/ui'
import { useStore } from '../store/store'
import {
  PLATE_GUIDE, FOOD_TIERS, GOAL_GUIDES, NUTRITION_LESSONS,
} from '../data/nutrition'
import { BUDGET_MEALS } from '../data/catalog'
import { foodReviewForDay } from '../store/selectors'
import {
  reviewDay, answerQuestion, answerForQuestion, STARTER_QUESTIONS,
  type DayReview, type QAResult,
} from '../lib/nutritionCoach'
import type { Goal } from '../store/types'

const TABS = ['Coach', 'Learn', 'Budget Eats']

export default function Nutrition() {
  const [tab, setTab] = useState('Coach')
  return (
    <div className="px-5 pt-2">
      <ScreenHeader title="Nutrition" />
      <SegmentedTabs tabs={TABS} active={tab} onChange={setTab} />
      <div className="mt-5">
        {tab === 'Coach' && <CoachTab />}
        {tab === 'Learn' && <LearnTab />}
        {tab === 'Budget Eats' && <BudgetTab />}
      </div>
    </div>
  )
}

/* ============================ Coach tab ============================ */
function CoachTab() {
  const { state, dispatch } = useStore()
  const goal = state.profile.goal
  const saved = foodReviewForDay(state)
  const guide = GOAL_GUIDES[goal]

  const [text, setText] = useState(saved?.text ?? '')
  const [review, setReview] = useState<DayReview | null>(() => (saved?.text ? reviewDay(saved.text, goal) : null))

  function runReview() {
    const r = reviewDay(text, goal)
    setReview(r)
    if (!r.empty) dispatch({ type: 'SAVE_FOOD_REVIEW', text: text.trim(), score: r.score })
  }

  return (
    <>
      {/* Goal banner */}
      <div className="overflow-hidden rounded-2xl border border-brand-400/20 bg-brand-400/[0.06] p-4">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-400 text-black"><Sparkles size={15} /></span>
          <p className="text-[13px] font-bold text-brand-400">{guide.headline}</p>
        </div>
        <p className="mt-2 text-[14px] leading-snug text-white/70">
          Tell me what you ate today and I'll give you honest, friendly feedback for your goal — no calorie counting needed.
        </p>
      </div>

      {/* Free-text food log */}
      <div className="mt-4">
        <label className="mb-2 block text-[12px] font-bold uppercase tracking-[0.14em] text-white/40">What did you eat today?</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          placeholder={'e.g. Porridge with banana, chicken wrap and salad, pasta bolognese, a chocolate bar and lots of water…'}
          className="w-full resize-none rounded-2xl border border-white/8 bg-ink-800 p-4 text-[15px] leading-relaxed placeholder:text-white/30 focus:border-brand-400/60 focus:outline-none"
        />
        <button
          onClick={runReview}
          disabled={!text.trim()}
          className="btn-primary mt-3 w-full disabled:opacity-40"
        >
          <Sparkles size={16} /> Review my day
        </button>
      </div>

      {review && !review.empty && <ReviewCard review={review} />}

      {/* Ask anything */}
      <AskBox />
      <div className="h-2" />
    </>
  )
}

function ReviewCard({ review }: { review: DayReview }) {
  const tierColor: Record<string, string> = { great: '#7ED957', good: '#9FE264', moderate: '#F5A524', limit: '#F87171' }
  return (
    <div className="mt-4 animate-screen-in rounded-2xl border border-white/8 bg-ink-800 p-5">
      <div className="flex items-center gap-4">
        <ProgressRing value={review.score * 10} size={84} stroke={8} color={review.score >= 5 ? '#7ED957' : '#F5A524'}>
          <span className="text-2xl font-extrabold leading-none">{review.score}</span>
          <span className="text-[10px] text-white/45">/ 10</span>
        </ProgressRing>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-extrabold leading-tight">{review.verdict}</p>
          <p className="mt-1 text-[13px] leading-snug text-white/60">{review.summary}</p>
        </div>
      </div>

      {review.found.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {review.found.map((f, i) => (
            <span key={i} className="rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ backgroundColor: `${tierColor[f.tier]}1f`, color: tierColor[f.tier] }}>
              {f.label}
            </span>
          ))}
        </div>
      )}

      {review.highlights.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-white/40">What went well</p>
          <ul className="space-y-2">
            {review.highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[13px] leading-snug text-white/75">
                <Check size={16} strokeWidth={3} className="mt-0.5 shrink-0 text-brand-400" /> {h}
              </li>
            ))}
          </ul>
        </div>
      )}

      {review.improvements.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-white/40">Try this next</p>
          <ul className="space-y-2">
            {review.improvements.map((h, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[13px] leading-snug text-white/75">
                <ArrowRight size={16} strokeWidth={2.5} className="mt-0.5 shrink-0 text-accent-orange" /> {h}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-brand-400/10 p-3">
        <Sparkles size={16} className="mt-0.5 shrink-0 text-brand-400" />
        <p className="text-[13px] font-medium leading-snug text-white/80">{review.encouragement}</p>
      </div>
    </div>
  )
}

function AskBox() {
  const [q, setQ] = useState('')
  const [result, setResult] = useState<QAResult | null>(null)

  function ask(question?: string) {
    const text = question ?? q
    if (!text.trim()) return
    setResult(question ? answerForQuestion(question) : answerQuestion(text))
    if (question) setQ(question)
  }

  return (
    <div className="mt-7">
      <div className="mb-2 flex items-center gap-2">
        <HelpCircle size={16} className="text-brand-400" />
        <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-white/40">Ask anything about food</p>
      </div>
      <div className="flex items-center gap-2 rounded-2xl border border-white/8 bg-ink-800 p-1.5">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && ask()}
          placeholder="How much protein do I need?"
          className="min-w-0 flex-1 bg-transparent px-3 py-2 text-[15px] placeholder:text-white/30 focus:outline-none"
        />
        <button onClick={() => ask()} disabled={!q.trim()} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-400 text-black transition active:scale-90 disabled:opacity-40">
          <Send size={17} />
        </button>
      </div>

      {result && (
        <div className="mt-3 animate-screen-in rounded-2xl border border-white/8 bg-ink-800 p-4">
          {result.question && <p className="mb-1.5 text-[13px] font-bold text-brand-400">{result.question}</p>}
          <p className="text-[14px] leading-relaxed text-white/80">{result.answer}</p>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {STARTER_QUESTIONS.map((sq) => (
          <button key={sq} onClick={() => ask(sq)} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[12px] font-medium text-white/70 active:bg-white/[0.1]">
            {sq}
          </button>
        ))}
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
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-[11px] font-black uppercase" style={{ backgroundColor: `${s.color}1f`, color: s.color }}>
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

/* ============================ Budget tab ============================ */
const GOAL_FILTERS: { label: string; goal: Goal | 'all' }[] = [
  { label: 'All', goal: 'all' },
  { label: 'Build muscle', goal: 'build-muscle' },
  { label: 'Lose fat', goal: 'lose-fat' },
  { label: 'Strength', goal: 'gain-strength' },
  { label: 'Healthy', goal: 'stay-healthy' },
]

function BudgetTab() {
  const { state } = useStore()
  const [filter, setFilter] = useState<Goal | 'all'>(state.profile.goal)
  const [q, setQ] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)

  const meals = useMemo(() => {
    return BUDGET_MEALS.filter((m) => {
      const goalOk = filter === 'all' || (m.goals?.includes(filter) ?? false)
      const qOk = !q || m.name.toLowerCase().includes(q.toLowerCase()) || (m.flavour ?? '').toLowerCase().includes(q.toLowerCase())
      return goalOk && qOk
    })
  }, [filter, q])

  const grocery = useMemo(() => {
    const map = new Map<string, number>()
    for (const m of meals) for (const ing of m.ingredients) map.set(ing.item, (map.get(ing.item) ?? 0) + ing.cost)
    return [...map.entries()]
  }, [meals])
  const [showList, setShowList] = useState(false)
  const weekTotal = grocery.reduce((a, [, c]) => a + c, 0)

  return (
    <>
      <div className="rounded-2xl border border-white/8 bg-ink-800 p-4">
        <Wallet size={22} className="text-brand-400" />
        <h3 className="mt-2 text-lg font-extrabold tracking-tight">Cheap food that tastes great</h3>
        <p className="mt-1 text-[13px] leading-snug text-white/60">Real meals on a student budget, matched to your goal. Cook once, eat for days.</p>
      </div>

      {/* Goal filter */}
      <div className="no-scrollbar -mx-5 mt-4 overflow-x-auto px-5">
        <div className="flex gap-2">
          {GOAL_FILTERS.map((g) => {
            const active = filter === g.goal
            return (
              <button key={g.label} onClick={() => setFilter(g.goal)} className={`shrink-0 rounded-full px-3.5 py-2 text-[13px] font-semibold transition ${active ? 'bg-brand-400 text-black' : 'border border-white/10 bg-white/[0.04] text-white/70'}`}>
                {g.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Search */}
      <div className="mt-3 flex items-center gap-2 rounded-xl border border-white/8 bg-ink-800 px-3">
        <Search size={16} className="text-white/35" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search meals…" className="w-full bg-transparent py-2.5 text-sm placeholder:text-white/30 focus:outline-none" />
      </div>

      {/* Grocery list */}
      {meals.length > 0 && (
        <>
          <button onClick={() => setShowList((v) => !v)} className="mt-3 flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-ink-800 p-3.5 text-left">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-400/15 text-sm font-bold text-brand-400">${weekTotal.toFixed(0)}</div>
            <div className="flex-1"><p className="text-sm font-bold leading-tight">Shopping list for these meals</p><p className="text-[12px] text-white/50">Rough total for everything below</p></div>
            <ChevronDown size={18} className={`text-white/30 transition-transform ${showList ? 'rotate-180' : ''}`} />
          </button>
          {showList && (
            <div className="mt-2 rounded-2xl border border-white/5 bg-ink-800 p-4">
              {grocery.map(([item, cost]) => (
                <div key={item} className="flex items-center justify-between border-b border-white/5 py-2 text-[13px] last:border-0">
                  <span className="text-white/70">{item}</span><span className="font-semibold text-white/50">${cost.toFixed(2)}</span>
                </div>
              ))}
              <div className="mt-2 flex items-center justify-between text-[14px] font-bold"><span>Estimated total</span><span className="text-brand-400">${weekTotal.toFixed(2)}</span></div>
            </div>
          )}
        </>
      )}

      {/* Meal cards */}
      <p className="mt-4 text-[12px] font-bold uppercase tracking-[0.14em] text-white/35">{meals.length} {meals.length === 1 ? 'meal' : 'meals'}</p>
      <div className="mt-2 space-y-2.5">
        {meals.map((m) => {
          const open = openId === m.id
          return (
            <div key={m.id} className="overflow-hidden rounded-2xl border border-white/5 bg-ink-800">
              <button onClick={() => setOpenId(open ? null : m.id)} className="flex w-full items-center gap-3 p-3 text-left">
                <img src={m.image} alt="" className="h-16 w-16 rounded-xl object-cover" loading="lazy" />
                <div className="min-w-0 flex-1">
                  <p className="font-bold leading-tight">{m.name}</p>
                  {m.flavour && <p className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-white/55">{m.flavour}</p>}
                  <p className="mt-1 text-[12px] font-semibold text-brand-400">{m.kcal} kcal · {m.p}g protein</p>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-brand-400">${m.cost.toFixed(2)}</p>
                  <p className="text-[10px] text-white/40">per serve</p>
                </div>
              </button>
              {open && (
                <div className="space-y-3 border-t border-white/5 px-4 py-3.5 text-[14px]">
                  <div className="flex flex-wrap gap-1.5">
                    {m.tags.map((t) => <span key={t} className="rounded-full bg-brand-400/15 px-2.5 py-1 text-[11px] font-semibold text-brand-300">{t}</span>)}
                  </div>
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
                </div>
              )}
            </div>
          )
        })}
        {meals.length === 0 && (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-white/12 px-6 py-10 text-center">
            <Salad size={26} className="text-white/30" />
            <p className="mt-2 text-sm font-semibold text-white/60">No meals match that</p>
            <p className="mt-1 text-[12px] text-white/40">Try another goal filter or clear your search.</p>
          </div>
        )}
      </div>
      <div className="h-2" />
    </>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-2.5 text-[12px] font-bold uppercase tracking-[0.14em] text-white/40">{children}</p>
}
