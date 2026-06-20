import { useMemo, useRef, useState } from 'react'
import {
  Bell, Moon, Sun, GraduationCap, Wallet, RotateCcw, Trash2, Camera, Trophy,
  Flame, Search, ScanLine, Plus, Check, Share2, ChevronRight, User, Sparkles, Dumbbell,
  Droplet, Footprints, BedDouble, Leaf, Clock, Play, Award, BellRing, Crown,
  HeartPulse, Activity, Zap,
} from 'lucide-react'
import { Sheet, EmptyState } from '../components/Sheet'
import { Avatar } from '../components/Avatar'
import { LogoMark } from '../components/Logo'
import { Icon } from '../components/Icon'
import { Chip } from '../components/ui'
import { useStore } from '../store/store'
import { useToast } from '../components/Toast'
import { useNav } from '../nav'
import { FOODS, QUICK_WORKOUTS } from '../data/catalog'
import { pick, makeRng } from '../lib/rng'
import { todayKey, relativeLabel, shortDate } from '../lib/date'
import {
  fmtWeight, fmtWeightNum, toKg, weightUnit, fmtFluid, fluidUnit,
  weightVal,
} from '../lib/format'
import {
  weightStats, workoutsThisWeek, totalVolumeRange, streakStats, todayHabit,
  habitConsistencyWeek, leaderboardSorted, strengthProgress,
} from '../store/selectors'
import { examState, dailyTargets, defaultExamWindow } from '../store/training'
import { translator, LANGUAGES, type Language } from '../lib/i18n'
import type { MealName, Units, Theme } from '../store/types'

const INTEGRATIONS: { id: string; name: string; sub: string; icon: JSX.Element }[] = [
  { id: 'appleHealth', name: 'Apple Health', sub: 'Steps, workouts, sleep & heart rate', icon: <HeartPulse size={18} className="text-red-400" /> },
  { id: 'healthConnect', name: 'Health Connect', sub: 'Sync Android health data', icon: <Activity size={18} className="text-brand-400" /> },
  { id: 'strava', name: 'Strava', sub: 'Import runs and rides', icon: <Zap size={18} className="text-accent-orange" /> },
]

type Props = { open: boolean; onClose: () => void; params?: Record<string, unknown> }

// New feature sheets live in a sibling file and are surfaced through here.
export * from './extra'

/* ============================ Notifications ============================ */
export function NotificationsSheet({ open, onClose }: Props) {
  const { state, dispatch } = useStore()
  const iconFor: Record<string, JSX.Element> = {
    workout: <Dumbbell size={18} className="text-brand-400" />,
    nutrition: <Leaf size={18} className="text-brand-400" />,
    streak: <Flame size={18} className="text-brand-400" />,
    social: <User size={18} className="text-brand-400" />,
    challenge: <Trophy size={18} className="text-brand-400" />,
    system: <Award size={18} className="text-brand-400" />,
  }
  return (
    <Sheet open={open} onClose={onClose} title="Notifications">
      <button onClick={() => dispatch({ type: 'MARK_ALL_READ' })} className="mb-3 text-sm font-semibold text-brand-400">
        Mark all as read
      </button>
      <div className="space-y-2.5">
        {state.notifications.map((n) => (
          <button
            key={n.id}
            onClick={() => dispatch({ type: 'MARK_NOTIF_READ', id: n.id })}
            className={`flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left ${n.read ? 'border-white/5 bg-ink-800' : 'border-brand-400/25 bg-brand-400/5'}`}
          >
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/5">{iconFor[n.type]}</div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-bold leading-tight">{n.title}</p>
                {!n.read && <span className="ml-2 h-2 w-2 shrink-0 rounded-full bg-brand-400" />}
              </div>
              <p className="text-[13px] text-white/55">{n.body}</p>
              <p className="mt-1 text-[11px] text-white/35">{n.time}</p>
            </div>
          </button>
        ))}
        {state.notifications.length === 0 && (
          <EmptyState icon={<Bell size={32} />} title="All caught up" body="New activity will show up here." />
        )}
      </div>
    </Sheet>
  )
}

/* ============================ Settings ============================ */
export function SettingsSheet({ open, onClose }: Props) {
  const { state, dispatch } = useStore()
  const toast = useToast()
  const { units, theme, notificationsEnabled } = state.settings
  const lang = state.settings.language ?? 'en'
  const t = translator(lang)
  const connections = state.settings.connections ?? {}

  async function toggleNotifs() {
    const next = !notificationsEnabled
    dispatch({ type: 'SET_SETTINGS', patch: { notificationsEnabled: next } })
    if (next && 'Notification' in window && Notification.permission === 'default') {
      try { await Notification.requestPermission() } catch { /* ignore */ }
    }
    toast(next ? t('toast.notifsOn') : t('toast.notifsOff'))
  }

  function setLang(code: Language) {
    dispatch({ type: 'SET_SETTINGS', patch: { language: code } })
    toast(translator(code)('toast.langSet'))
  }

  function toggleConnection(id: string, name: string) {
    const on = !connections[id]
    dispatch({ type: 'SET_SETTINGS', patch: { connections: { ...connections, [id]: on } } })
    toast(`${name} ${on ? t('toast.connected') : t('toast.disconnected')}`)
  }

  return (
    <Sheet open={open} onClose={onClose} title={t('settings.title')}>
      <Group label={t('settings.language')}>
        <div className="grid grid-cols-2 gap-2">
          {LANGUAGES.map((l) => {
            const active = l.code === lang
            return (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`flex items-center justify-between rounded-2xl border p-3 text-left transition active:scale-[0.98] ${active ? 'border-brand-400 bg-brand-400/10' : 'border-white/8 bg-ink-800'}`}
              >
                <div className="min-w-0">
                  <p className="truncate font-bold leading-tight" style={l.rtl ? { direction: 'rtl' } : undefined}>{l.native}</p>
                  <p className="text-[11px] text-white/45">{l.english}</p>
                </div>
                {active && <Check size={16} strokeWidth={3} className="shrink-0 text-brand-400" />}
              </button>
            )
          })}
        </div>
      </Group>

      <Group label={t('settings.units')}>
        <Segmented<Units>
          value={units}
          options={[{ v: 'metric', l: t('settings.metric') }, { v: 'imperial', l: t('settings.imperial') }]}
          onChange={(v) => dispatch({ type: 'SET_SETTINGS', patch: { units: v } })}
        />
      </Group>

      <Group label={t('settings.appearance')}>
        <Segmented<Theme>
          value={theme}
          options={[{ v: 'dark', l: t('settings.dark'), icon: <Moon size={15} /> }, { v: 'light', l: t('settings.light'), icon: <Sun size={15} /> }]}
          onChange={(v) => dispatch({ type: 'SET_SETTINGS', patch: { theme: v } })}
        />
      </Group>

      {/* Connected apps / integrations */}
      <Group label={t('settings.connected')}>
        {INTEGRATIONS.map((it) => {
          const on = !!connections[it.id]
          return (
            <Row key={it.id} icon={it.icon} title={it.name} sub={it.sub}>
              <button
                onClick={() => toggleConnection(it.id, it.name)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-bold transition active:scale-95 ${on ? 'bg-ink-700 text-brand-400' : 'bg-brand-400 text-black'}`}
              >
                {on ? t('settings.connectedLabel') : t('settings.connect')}
              </button>
            </Row>
          )
        })}
      </Group>

      <Group label={t('settings.preferences')}>
        <Row icon={<BellRing size={18} className="text-brand-400" />} title={t('settings.pushNotifs')} sub={t('settings.pushNotifsSub')}>
          <Toggle on={notificationsEnabled} onClick={toggleNotifs} />
        </Row>
        <Row icon={<GraduationCap size={18} className="text-accent-purple" />} title={t('settings.examMode')} sub={t('settings.examModeSub')}>
          <Toggle on={state.profile.examMode} onClick={() => dispatch({ type: 'SET_PROFILE', patch: { examMode: !state.profile.examMode } })} />
        </Row>
        <Row icon={<Wallet size={18} className="text-brand-400" />} title={t('settings.budget')} sub={t('settings.budgetSub')}>
          <Toggle on={state.profile.budgetMode} onClick={() => dispatch({ type: 'SET_PROFILE', patch: { budgetMode: !state.profile.budgetMode } })} />
        </Row>
        <Row icon={<Crown size={18} className="text-brand-400" />} title={t('settings.premium')} sub={t('settings.premiumSub')}>
          <Toggle on={state.profile.premium} onClick={() => dispatch({ type: 'SET_PROFILE', patch: { premium: !state.profile.premium } })} />
        </Row>
      </Group>

      <Group label={t('settings.data')}>
        <button onClick={() => { dispatch({ type: 'RESET_DEMO' }); toast('Demo data restored'); onClose() }} className="flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-ink-800 p-4 text-left active:scale-[0.99]">
          <RotateCcw size={18} className="text-brand-400" />
          <div className="flex-1">
            <p className="font-bold">{t('settings.resetDemo')}</p>
            <p className="text-[12px] text-white/50">{t('settings.resetDemoSub')}</p>
          </div>
        </button>
        <button onClick={() => { if (confirm('Clear all data and start fresh?')) { dispatch({ type: 'RESET_EMPTY' }); onClose() } }} className="flex w-full items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-left active:scale-[0.99]">
          <Trash2 size={18} className="text-red-400" />
          <div className="flex-1">
            <p className="font-bold text-red-300">{t('settings.clear')}</p>
            <p className="text-[12px] text-white/50">{t('settings.clearSub')}</p>
          </div>
        </button>
      </Group>

      <div className="mt-7 flex flex-col items-center gap-2">
        <LogoMark size={34} />
        <p className="text-[12px] text-white/30">StrengthHub Online · v1.0</p>
      </div>
    </Sheet>
  )
}

/* ============================ Profile ============================ */
export function ProfileSheet({ open, onClose }: Props) {
  const { state } = useStore()
  const nav = useNav()
  const units = state.settings.units
  const w = weightStats(state)
  const streak = streakStats(state)
  const totalWorkouts = state.sessions.filter((s) => s.completed).length
  const earned = state.badges.filter((b) => b.earned).length
  const goalLabel: Record<string, string> = { 'build-muscle': 'Build Muscle', 'lose-fat': 'Lose Fat', 'gain-strength': 'Get Stronger', 'stay-healthy': 'Stay Healthy' }

  return (
    <Sheet open={open} onClose={onClose} title="Profile">
      <div className="flex items-center gap-4">
        <Avatar name={`${state.profile.name} M`} size={64} />
        <div>
          <p className="text-xl font-extrabold">{state.profile.name} Morgan</p>
          <p className="text-[13px] text-white/50">{state.profile.age} · {state.profile.university}</p>
          <Chip color="green" className="mt-1">{goalLabel[state.profile.goal]}</Chip>
        </div>
      </div>

      <p className="mt-3 text-[13px] text-white/45">{state.profile.dorm} · {state.profile.cohort}</p>

      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <Stat label="Workouts" value={String(totalWorkouts)} />
        <Stat label="Day streak" value={`${streak.current}`} />
        <Stat label="Weight" value={fmtWeight(w.current, units, 1)} />
      </div>

      <div className="mt-4 space-y-2.5">
        <LinkRow icon={<Sparkles size={18} className="text-brand-400" />} title="Your coach" sub="Daily check ins and milestones" onClick={() => nav.open('coach')} />
        <LinkRow icon={<Bell size={18} className="text-brand-400" />} title="Notifications" sub="Reminders, streaks & social" onClick={() => nav.open('notifications')} />
        <LinkRow icon={<Award size={18} className="text-brand-400" />} title="Badges" sub={`${earned} earned`} onClick={() => nav.open('badges')} />
        <LinkRow icon={<Camera size={18} className="text-brand-400" />} title="Progress photos" sub={`${state.photos.length} photos`} onClick={() => nav.open('photos')} />
        <LinkRow icon={<Trophy size={18} className="text-brand-400" />} title="Campus leaderboard" sub={state.profile.university} onClick={() => nav.open('leaderboard')} />
        <LinkRow icon={<Sparkles size={18} className="text-brand-400" />} title="Weekly recap" sub="Your week in numbers" onClick={() => nav.open('recap')} />
        <LinkRow icon={<GraduationCap size={18} className="text-brand-400" />} title="Exam Survival Protocol" sub={state.profile.examMode ? 'On' : 'Off'} onClick={() => nav.open('examMode')} />
        {state.profile.newToGym && <LinkRow icon={<Leaf size={18} className="text-brand-400" />} title="New to the gym" sub="Your first 90 days" onClick={() => nav.open('beginner')} />}
        <LinkRow icon={<User size={18} className="text-white/70" />} title="Settings" sub="Units, theme and data" onClick={() => nav.open('settings')} />
      </div>
    </Sheet>
  )
}

/* ============================ Add Food ============================ */
export function AddFoodSheet({ open, onClose, params }: Props) {
  const { state, dispatch } = useStore()
  const toast = useToast()
  const [meal, setMeal] = useState<MealName>((params?.meal as MealName) || 'Snack')
  const [q, setQ] = useState('')
  const [budgetOnly, setBudgetOnly] = useState(state.profile.budgetMode)
  const [scanned, setScanned] = useState<string | null>(null)

  const results = useMemo(() => {
    return FOODS.filter((f) => f.name.toLowerCase().includes(q.toLowerCase())).filter((f) => (budgetOnly ? f.budget : true))
  }, [q, budgetOnly])

  function add(foodId: string) {
    const f = FOODS.find((x) => x.id === foodId)!
    dispatch({ type: 'ADD_MEAL', meal: { meal, name: f.name, qty: 1, kcal: f.kcal, p: f.p, c: f.c, f: f.f } })
    toast(`Added to ${meal}`)
    onClose()
  }

  function scan() {
    // simulate a barcode scan resolving to a product
    const f = pick(makeRng(Date.now() % 100000), FOODS.filter((x) => x.barcode))
    setScanned(f.id)
    setQ('')
  }

  return (
    <Sheet open={open} onClose={onClose} title="Add food">
      <div className="no-scrollbar -mx-1 mb-3 flex gap-2 overflow-x-auto px-1">
        {(['Breakfast', 'Lunch', 'Snack', 'Dinner'] as MealName[]).map((m) => (
          <button key={m} onClick={() => setMeal(m)} className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold ${meal === m ? 'bg-brand-400 text-black' : 'bg-ink-700 text-white/60'}`}>
            {m}
          </button>
        ))}
      </div>

      <div className="mb-3 flex gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/8 bg-ink-800 px-3">
          <Search size={18} className="text-white/40" />
          <input value={q} onChange={(e) => { setQ(e.target.value); setScanned(null) }} placeholder="Search foods…" className="w-full bg-transparent py-3 text-sm focus:outline-none" />
        </div>
        <button onClick={scan} className="grid h-[46px] w-[46px] place-items-center rounded-xl bg-brand-400 text-black active:scale-95">
          <ScanLine size={20} />
        </button>
      </div>

      <button onClick={() => setBudgetOnly((b) => !b)} className={`mb-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${budgetOnly ? 'bg-brand-400/20 text-brand-400' : 'bg-ink-700 text-white/55'}`}>
        <Wallet size={13} /> Budget meals {budgetOnly ? 'on' : 'off'}
      </button>

      {scanned && (
        <div className="mb-3 rounded-2xl border border-brand-400/30 bg-brand-400/10 p-3">
          <p className="mb-1 text-[12px] font-semibold text-brand-400">✓ Barcode matched</p>
          <FoodRow id={scanned} onAdd={add} />
        </div>
      )}

      <div className="space-y-2">
        {results.map((f) => (
          <FoodRow key={f.id} id={f.id} onAdd={add} />
        ))}
        {results.length === 0 && <p className="py-6 text-center text-sm text-white/40">No foods found.</p>}
      </div>
    </Sheet>
  )
}

function FoodRow({ id, onAdd }: { id: string; onAdd: (id: string) => void }) {
  const f = FOODS.find((x) => x.id === id)!
  return (
    <button onClick={() => onAdd(id)} className="flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-ink-800 p-3 text-left active:scale-[0.99]">
      <div className="min-w-0 flex-1">
        <p className="truncate font-bold leading-tight">{f.name}</p>
        <p className="text-[12px] text-white/45">{f.serving} · {f.kcal} kcal · {f.p}P {f.c}C {f.f}F</p>
      </div>
      {f.budget && <Wallet size={14} className="text-brand-400" />}
      <div className="grid h-7 w-7 place-items-center rounded-full bg-brand-400 text-black"><Plus size={16} strokeWidth={3} /></div>
    </button>
  )
}

/* ============================ Log Weight ============================ */
export function LogWeightSheet({ open, onClose }: Props) {
  const { state, dispatch } = useStore()
  const toast = useToast()
  const units = state.settings.units
  const current = weightStats(state).current
  const [val, setVal] = useState(() => fmtWeightNum(current, units, 1))

  function save() {
    const kg = toKg(parseFloat(val) || current, units)
    dispatch({ type: 'LOG_WEIGHT', kg: Math.round(kg * 10) / 10 })
    toast('Weight logged')
    onClose()
  }

  const num = weightVal(current, units)
  return (
    <Sheet open={open} onClose={onClose} title="Log weight">
      <p className="text-[13px] text-white/50">Today · {relativeLabel(todayKey)}</p>
      <div className="mt-6 flex items-end justify-center gap-2">
        <input
          autoFocus
          inputMode="decimal"
          value={val}
          onChange={(e) => setVal(e.target.value.replace(/[^\d.]/g, ''))}
          className="w-40 border-b-2 border-brand-400 bg-transparent pb-2 text-center text-5xl font-extrabold focus:outline-none"
        />
        <span className="pb-3 text-xl font-bold text-white/50">{weightUnit(units)}</span>
      </div>
      <div className="mt-4 flex justify-center gap-2">
        {[-0.5, -0.1, 0.1, 0.5].map((d) => (
          <button key={d} onClick={() => setVal((v) => (Math.round(((parseFloat(v) || num) + d) * 10) / 10).toFixed(1))} className="rounded-full bg-ink-700 px-3 py-1.5 text-sm font-semibold active:bg-ink-600">
            {d > 0 ? `+${d}` : d}
          </button>
        ))}
      </div>
      <button onClick={save} className="btn-primary mt-8 w-full">Save</button>
    </Sheet>
  )
}

/* ============================ Log Habit ============================ */
export function LogHabitSheet({ open, onClose }: Props) {
  const { state, dispatch } = useStore()
  const toast = useToast()
  const units = state.settings.units
  const h = todayHabit(state)
  const [steps, setSteps] = useState(String(h.steps))
  const [sleep, setSleep] = useState(String(h.sleepH))
  const [mindset, setMindset] = useState(String(h.mindsetMin))

  function save() {
    dispatch({ type: 'PATCH_TODAY_HABIT', patch: { steps: parseInt(steps) || 0, sleepH: parseFloat(sleep) || 0, mindsetMin: parseInt(mindset) || 0 } })
    toast('Habits updated')
    onClose()
  }

  const waterStep = units === 'imperial' ? 8 / 33.814 : 0.25
  return (
    <Sheet open={open} onClose={onClose} title="Log habits">
      {/* Water quick logger */}
      <div className="mb-4 rounded-2xl border border-white/5 bg-ink-800 p-4">
        <div className="flex items-center gap-2">
          <Droplet size={18} className="text-brand-400" />
          <p className="flex-1 font-bold">Water</p>
          <p className="font-extrabold">{fmtFluid(h.waterL, units)}</p>
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={() => dispatch({ type: 'ADJUST_WATER', deltaL: -waterStep })} className="flex-1 rounded-xl bg-ink-700 py-2.5 font-bold active:bg-ink-600">−</button>
          <button onClick={() => { dispatch({ type: 'ADJUST_WATER', deltaL: waterStep }); }} className="flex-[2] rounded-xl bg-brand-400/20 py-2.5 font-bold text-brand-400 active:bg-brand-400/30">
            + {units === 'imperial' ? '8 oz' : '250 ml'}
          </button>
        </div>
        <p className="mt-2 text-center text-[12px] text-white/40">Goal: {fmtFluid(state.profile.waterTargetL, units)} / {fluidUnit(units)}</p>
      </div>

      <Field icon={<Footprints size={18} className="text-brand-400" />} label="Steps" value={steps} onChange={setSteps} placeholder="8000" />
      <Field icon={<BedDouble size={18} className="text-brand-400" />} label="Sleep (hours)" value={sleep} onChange={setSleep} placeholder="8" />
      <Field icon={<Leaf size={18} className="text-brand-400" />} label="Mindset / meditation (min)" value={mindset} onChange={setMindset} placeholder="5" />

      <button onClick={save} className="btn-primary mt-6 w-full">Save habits</button>
    </Sheet>
  )
}

function Field({ icon, label, value, onChange, placeholder }: { icon: JSX.Element; label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="mb-3">
      <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-white/70">{icon} {label}</label>
      <input inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value.replace(/[^\d.]/g, ''))} placeholder={placeholder} className="w-full rounded-xl border border-white/8 bg-ink-800 px-4 py-3 text-white placeholder:text-white/30 focus:border-brand-400/60 focus:outline-none" />
    </div>
  )
}

/* ============================ Create Post ============================ */
export function CreatePostSheet({ open, onClose }: Props) {
  const { dispatch } = useStore()
  const toast = useToast()
  const [text, setText] = useState('')
  const [image, setImage] = useState<string | undefined>()
  const fileRef = useRef<HTMLInputElement>(null)

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImage(reader.result as string)
    reader.readAsDataURL(file)
  }

  function post() {
    if (!text.trim()) return
    dispatch({ type: 'ADD_POST', text: text.trim(), image })
    toast('Posted to your campus feed')
    setText(''); setImage(undefined)
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title="Create a post">
      <textarea
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder="Share a win, a PR, a meal, or some motivation…"
        className="w-full resize-none rounded-2xl border border-white/8 bg-ink-800 p-4 text-[15px] placeholder:text-white/35 focus:border-brand-400/60 focus:outline-none"
      />
      {image && <img src={image} alt="" className="mt-3 max-h-48 w-full rounded-2xl object-cover" />}
      <div className="mt-3 flex items-center gap-2">
        <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
        <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 rounded-full bg-ink-700 px-4 py-2 text-sm font-semibold active:bg-ink-600">
          <Camera size={16} /> {image ? 'Change photo' : 'Add photo'}
        </button>
      </div>
      <button onClick={post} disabled={!text.trim()} className="btn-primary mt-6 w-full disabled:opacity-40">Post</button>
    </Sheet>
  )
}

/* ============================ Weekly Recap ============================ */
export function WeeklyRecapSheet({ open, onClose }: Props) {
  const { state } = useStore()
  const toast = useToast()
  const units = state.settings.units
  const workouts = workoutsThisWeek(state)
  const vol = totalVolumeRange(state, 7)
  const streak = streakStats(state)
  const hc = habitConsistencyWeek(state)
  const w = weightStats(state)
  const top = strengthProgress(state)[0]

  async function share() {
    const txt = `My StrengthHub week. ${workouts} workouts, ${Math.round(vol).toLocaleString()} kg lifted, a ${streak.current} day streak.`
    try {
      if (navigator.share) await navigator.share({ text: txt })
      else toast('Recap copied to share!')
    } catch { /* cancelled */ }
  }

  return (
    <Sheet open={open} onClose={onClose} title="Your week">
      <div className="rounded-3xl bg-gradient-to-br from-brand-600 to-brand-400 p-5 text-black">
        <p className="text-sm font-bold opacity-80">THIS WEEK</p>
        <p className="mt-1 text-4xl font-extrabold">{workouts} workouts</p>
        <p className="font-semibold opacity-80">{streak.current}-day streak · top 20% of users</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <RecapStat label="Volume lifted" value={`${Math.round(weightVal(vol, units)).toLocaleString()} ${weightUnit(units)}`} />
          <RecapStat label="Avg sleep" value={`${hc.avgSleep.toFixed(1)} h`} />
          <RecapStat label="Avg steps" value={hc.avgSteps.toLocaleString()} />
          <RecapStat label="Weight change" value={fmtWeight(Math.abs(w.delta), units, 1)} />
        </div>
      </div>

      {top && (
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/5 bg-ink-800 p-4">
          <Sparkles size={22} className="text-brand-400" />
          <p className="text-[14px]">
            Biggest gain: <span className="font-bold">{top.name}</span> up{' '}
            <span className="font-bold text-brand-400">{top.pct}%</span> in 4 weeks.
          </p>
        </div>
      )}

      <button onClick={share} className="btn-primary mt-5 w-full"><Share2 size={16} /> Share recap</button>
    </Sheet>
  )
}

function RecapStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-black/10 p-3">
      <p className="text-[12px] font-semibold opacity-70">{label}</p>
      <p className="text-lg font-extrabold">{value}</p>
    </div>
  )
}

/* ============================ Leaderboard ============================ */
export function LeaderboardSheet({ open, onClose }: Props) {
  const { state } = useStore()
  const toast = useToast()
  const rows = leaderboardSorted(state)
  return (
    <Sheet open={open} onClose={onClose} title="Friends leaderboard">
      <p className="mb-3 text-[13px] text-white/50">This month · {state.profile.university}</p>
      <div className="space-y-2">
        {rows.map((u, i) => (
          <div key={u.id} className={`flex items-center gap-3 rounded-2xl border p-3 ${u.isYou ? 'border-brand-400/40 bg-brand-400/10' : 'border-white/5 bg-ink-800'}`}>
            <span className={`w-6 text-center text-sm font-extrabold ${i < 3 ? 'text-brand-400' : 'text-white/40'}`}>{i + 1}</span>
            <Avatar name={u.name} size={38} />
            <div className="flex-1">
              <p className="font-bold leading-tight">{u.name}</p>
              <p className="text-[12px] text-white/45">{u.workouts} workouts · {u.streak} day streak</p>
            </div>
            <span className="font-extrabold text-brand-400">{u.points.toLocaleString()}</span>
          </div>
        ))}
      </div>
      <button onClick={() => toast('Invite link copied!')} className="btn-primary mt-5 w-full"><Plus size={16} /> Invite friends</button>
    </Sheet>
  )
}

/* ============================ Progress Photos ============================ */
export function PhotosSheet({ open, onClose }: Props) {
  const { state, dispatch } = useStore()
  const toast = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const photos = [...state.photos].sort((a, b) => b.dateKey.localeCompare(a.dateKey))

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => { dispatch({ type: 'ADD_PHOTO', dataUrl: reader.result as string }); toast('Photo added') }
    reader.readAsDataURL(file)
  }

  return (
    <Sheet open={open} onClose={onClose} title="Progress photos">
      <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
      <button onClick={() => fileRef.current?.click()} className="btn-primary mb-4 w-full"><Camera size={16} /> Add today's photo</button>
      {photos.length === 0 ? (
        <EmptyState icon={<Camera size={32} />} title="No photos yet" body="Snap a photo to track your visual progress over time." />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {photos.map((p) => (
            <div key={p.id} className="overflow-hidden rounded-2xl border border-white/5 bg-ink-800">
              <img src={p.dataUrl} alt="" className="aspect-[3/4] w-full object-cover" />
              <div className="p-2.5">
                <p className="text-[12px] font-bold">{shortDate(p.dateKey)}</p>
                {p.note && <p className="text-[11px] text-white/45">{p.note}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </Sheet>
  )
}

/* ============================ Quick Workouts ============================ */
export function QuickWorkoutsSheet({ open, onClose }: Props) {
  const toast = useToast()
  return (
    <Sheet open={open} onClose={onClose} title="Got 15 minutes?">
      <p className="mb-3 text-[13px] text-white/50">Express sessions for between lectures — no gym needed.</p>
      <div className="space-y-3">
        {QUICK_WORKOUTS.map((q) => (
          <div key={q.id} className="rounded-2xl border border-white/5 bg-ink-800 p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-400/15"><Clock size={20} className="text-brand-400" /></div>
              <div className="flex-1">
                <p className="font-bold leading-tight">{q.name}</p>
                <p className="text-[12px] text-white/45">{q.minutes} min · {q.focus}</p>
              </div>
              <button onClick={() => { toast(`Started: ${q.name}`); onClose() }} className="flex items-center gap-1 rounded-full bg-brand-400 px-3.5 py-1.5 text-sm font-bold text-black active:scale-95">
                <Play size={14} fill="currentColor" /> Start
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {q.exercises.map((e) => (
                <span key={e} className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-white/55">{e}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Sheet>
  )
}

/* ============================ Badges ============================ */
export function BadgesSheet({ open, onClose }: Props) {
  const { state } = useStore()
  const earned = state.badges.filter((b) => b.earned).length
  return (
    <Sheet open={open} onClose={onClose} title={`Badges · ${earned}/${state.badges.length}`}>
      <div className="grid grid-cols-3 gap-3">
        {state.badges.map((b) => (
          <div key={b.id} className={`flex flex-col items-center rounded-2xl border p-3 text-center ${b.earned ? 'border-brand-400/30 bg-brand-400/8' : 'border-white/5 bg-ink-800 opacity-50'}`}>
            <div className={`grid h-12 w-12 place-items-center rounded-full ${b.earned ? 'bg-brand-400/20' : 'bg-white/5'}`}>
              <Icon name={b.icon} size={22} color={b.earned ? '#7ED957' : '#888'} />
            </div>
            <p className="mt-2 text-[12px] font-bold leading-tight">{b.name}</p>
            <p className="mt-0.5 text-[10px] text-white/45">{b.desc}</p>
            {b.earned && b.earnedDateKey && <p className="mt-1 text-[9px] font-semibold text-brand-400">{shortDate(b.earnedDateKey)}</p>}
          </div>
        ))}
      </div>
    </Sheet>
  )
}

/* ============================ Exam Mode ============================ */
export function ExamModeSheet({ open, onClose }: Props) {
  const { state, dispatch } = useStore()
  const toast = useToast()
  const on = state.profile.examMode
  const ex = examState(state)
  const fallback = defaultExamWindow()
  const [start, setStart] = useState(state.profile.examStartKey ?? fallback.startKey)
  const [end, setEnd] = useState(state.profile.examEndKey ?? fallback.endKey)
  const t = dailyTargets(state)
  const p = state.profile

  function save() {
    if (end < start) { toast('End date is before the start'); return }
    dispatch({ type: 'SET_EXAM_DATES', startKey: start, endKey: end })
    toast('Exam plan set. I have your back.')
    onClose()
  }
  function turnOff() {
    dispatch({ type: 'SET_PROFILE', patch: { examMode: false } })
    toast('Exam mode off')
    onClose()
  }

  const phaseLabel: Record<string, string> = {
    none: 'Not in your exam window yet',
    approaching: ex.daysUntil ? `Exams start in ${ex.daysUntil} days` : 'Exams approaching',
    during: ex.daysLeft != null ? `${ex.daysLeft} days of exams left` : 'In your exam window',
    recovering: 'Exams done, ramping back up',
  }

  return (
    <Sheet open={open} onClose={onClose} title="Exam Survival Protocol">
      <div className="rounded-3xl border border-accent-purple/25 bg-accent-purple/10 p-5">
        <GraduationCap size={30} className="text-accent-purple" />
        <h3 className="mt-2 text-xl font-extrabold tracking-tight">Train through exam season</h3>
        <p className="mt-1 text-[14px] leading-snug text-white/60">Tell me when your exams are. I will quietly adjust your plan so training supports your studying instead of competing with it.</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="rounded-2xl border border-white/8 bg-ink-800 p-3">
          <span className="text-[12px] font-semibold text-white/50">Exams start</span>
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="mt-1 w-full bg-transparent text-[15px] font-semibold focus:outline-none" />
        </label>
        <label className="rounded-2xl border border-white/8 bg-ink-800 p-3">
          <span className="text-[12px] font-semibold text-white/50">Exams end</span>
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="mt-1 w-full bg-transparent text-[15px] font-semibold focus:outline-none" />
        </label>
      </div>

      {on && (
        <p className="mt-3 text-center text-[13px] font-semibold text-accent-purple">{phaseLabel[ex.phase]}</p>
      )}

      <p className="mt-5 mb-2 text-[12px] font-bold uppercase tracking-wide text-white/40">While exams are on</p>
      <div className="space-y-2.5">
        <AdaptRow label="Sessions" value="Trimmed to your 3 key lifts" />
        <AdaptRow label="Calories" value={`${t.adjusted ? t.calorie.toLocaleString() : (p.calorieTarget + (p.goal === 'build-muscle' ? -250 : 0)).toLocaleString()} kcal, toward maintenance`} />
        <AdaptRow label="Sleep target" value={`${Math.min(9, p.sleepTargetH + 0.5)} hours, prioritised`} />
        <AdaptRow label="Step target" value={`${Math.round(p.stepTarget * 0.7).toLocaleString()}, eased off`} />
      </div>

      <button onClick={save} className="btn-primary mt-6 w-full">{on ? 'Update exam plan' : 'Turn on exam mode'}</button>
      {on && <button onClick={turnOff} className="mt-2 w-full rounded-full bg-ink-700 py-3 text-sm font-semibold text-white/70 active:scale-[0.98]">Turn off</button>}
    </Sheet>
  )
}

function AdaptRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-ink-800 p-3 text-[14px]">
      <Check size={16} className="shrink-0 text-brand-400" />
      <span className="text-white/55">{label}</span>
      <span className="ml-auto text-right font-semibold">{value}</span>
    </div>
  )
}

/* ============================ shared bits ============================ */
function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-white/40">{label}</p>
      <div className="space-y-2.5">{children}</div>
    </div>
  )
}

function Row({ icon, title, sub, children }: { icon: JSX.Element; title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-ink-800 p-4">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/5">{icon}</div>
      <div className="flex-1">
        <p className="font-bold leading-tight">{title}</p>
        <p className="text-[12px] text-white/50">{sub}</p>
      </div>
      {children}
    </div>
  )
}

function LinkRow({ icon, title, sub, onClick }: { icon: JSX.Element; title: string; sub: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-ink-800 p-4 text-left active:scale-[0.99]">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/5">{icon}</div>
      <div className="flex-1">
        <p className="font-bold leading-tight">{title}</p>
        <p className="text-[12px] text-white/50">{sub}</p>
      </div>
      <ChevronRight size={18} className="text-white/30" />
    </button>
  )
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`relative h-7 w-12 rounded-full transition-colors ${on ? 'bg-brand-400' : 'bg-white/15'}`}>
      <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white transition-transform ${on ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
    </button>
  )
}

function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { v: T; l: string; icon?: JSX.Element }[]; onChange: (v: T) => void }) {
  return (
    <div className="flex gap-1 rounded-xl bg-ink-700 p-1">
      {options.map((o) => (
        <button key={o.v} onClick={() => onChange(o.v)} className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-semibold transition ${value === o.v ? 'bg-brand-400 text-black' : 'text-white/60'}`}>
          {o.icon} {o.l}
        </button>
      ))}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-ink-800 p-3">
      <p className="text-lg font-extrabold">{value}</p>
      <p className="text-[11px] text-white/45">{label}</p>
    </div>
  )
}
