import { useState } from 'react'
import { ChevronRight, ChevronLeft, Dumbbell, Check } from 'lucide-react'
import { useDispatch } from '../store/store'
import type { Equipment, Experience, Goal } from '../store/types'
import { todayKey } from '../lib/date'

const goals: { id: Goal; label: string; desc: string }[] = [
  { id: 'build-muscle', label: 'Build muscle', desc: 'Add size and strength' },
  { id: 'lose-fat', label: 'Lose fat', desc: 'Lean down, keep strength' },
  { id: 'gain-strength', label: 'Get stronger', desc: 'Focus on the big lifts' },
  { id: 'stay-healthy', label: 'Stay healthy', desc: 'Move, feel good, balance' },
]

const experiences: { id: Experience; label: string; desc: string }[] = [
  { id: 'beginner', label: 'Beginner', desc: 'New to training (0–1 yr)' },
  { id: 'intermediate', label: 'Intermediate', desc: 'Consistent (1–3 yrs)' },
  { id: 'advanced', label: 'Advanced', desc: 'Experienced (3+ yrs)' },
]

const equipments: { id: Equipment; label: string; desc: string }[] = [
  { id: 'full-gym', label: 'Full Gym', desc: 'Campus or commercial gym' },
  { id: 'home-basic', label: 'Home Basics', desc: 'Dumbbells & bands' },
  { id: 'dorm-bodyweight', label: 'Dorm / Bodyweight', desc: 'No equipment needed' },
]

const targetsFor = (goal: Goal) => {
  switch (goal) {
    case 'build-muscle':
      return { calorieTarget: 2600, proteinTarget: 170, carbTarget: 300, fatTarget: 75 }
    case 'lose-fat':
      return { calorieTarget: 1900, proteinTarget: 165, carbTarget: 180, fatTarget: 60 }
    case 'gain-strength':
      return { calorieTarget: 2500, proteinTarget: 160, carbTarget: 280, fatTarget: 80 }
    default:
      return { calorieTarget: 2200, proteinTarget: 140, carbTarget: 240, fatTarget: 70 }
  }
}

export default function Onboarding() {
  const dispatch = useDispatch()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [goal, setGoal] = useState<Goal>('build-muscle')
  const [exp, setExp] = useState<Experience>('beginner')
  const [days, setDays] = useState(4)
  const [equipment, setEquipment] = useState<Equipment>('full-gym')

  const steps = ['Welcome', 'About you', 'Your goal', 'Experience', 'Schedule', 'Equipment']
  const total = steps.length
  const canNext = step === 1 ? name.trim().length > 0 : true

  function finish() {
    dispatch({
      type: 'COMPLETE_ONBOARDING',
      profile: {
        name: name.trim() || 'Athlete',
        age: parseInt(age) || 20,
        goal,
        experience: exp,
        daysPerWeek: days,
        equipment,
        newToGym: exp === 'beginner',
        createdAtKey: todayKey,
        ...targetsFor(goal),
      },
    })
  }

  return (
    <div className="flex h-full flex-col px-6 pb-10 pt-8">
      {/* progress dots */}
      <div className="mb-8 flex items-center gap-1.5">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? 'bg-brand-400' : 'bg-white/10'}`}
          />
        ))}
      </div>

      <div className="flex-1">
        {step === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-6 grid h-20 w-20 place-items-center rounded-3xl bg-brand-400 shadow-glow">
              <Dumbbell size={40} className="text-black" />
            </div>
            <h1 className="text-3xl font-extrabold leading-tight">
              Welcome to
              <br />
              <span className="text-brand-400">StrengthHub Online</span>
            </h1>
            <p className="mt-3 max-w-[280px] text-[15px] text-white/55">
              Built for students. Train smarter, eat better, and stay consistent — even during exam season.
            </p>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="text-2xl font-extrabold">First, the basics</h2>
            <p className="mt-1 text-[14px] text-white/50">We'll personalise everything around you.</p>
            <label className="mt-6 block text-sm font-semibold text-white/70">What should we call you?</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="mt-2 w-full rounded-xl border border-white/8 bg-ink-800 px-4 py-3.5 text-white placeholder:text-white/35 focus:border-brand-400/60 focus:outline-none"
            />
            <label className="mt-5 block text-sm font-semibold text-white/70">Age</label>
            <input
              value={age}
              onChange={(e) => setAge(e.target.value.replace(/\D/g, '').slice(0, 2))}
              inputMode="numeric"
              placeholder="21"
              className="mt-2 w-full rounded-xl border border-white/8 bg-ink-800 px-4 py-3.5 text-white placeholder:text-white/35 focus:border-brand-400/60 focus:outline-none"
            />
          </div>
        )}

        {step === 2 && (
          <Picker title="What's your main goal?" sub="You can change this anytime.">
            {goals.map((g) => (
              <OptionCard key={g.id} selected={goal === g.id} onClick={() => setGoal(g.id)} title={g.label} desc={g.desc} />
            ))}
          </Picker>
        )}

        {step === 3 && (
          <Picker title="How experienced are you?" sub="So we set the right starting weights.">
            {experiences.map((e) => (
              <OptionCard key={e.id} selected={exp === e.id} onClick={() => setExp(e.id)} title={e.label} desc={e.desc} />
            ))}
          </Picker>
        )}

        {step === 4 && (
          <div>
            <h2 className="text-2xl font-extrabold">Days per week?</h2>
            <p className="mt-1 text-[14px] text-white/50">Around lectures and life. Be realistic.</p>
            <div className="mt-8 text-center">
              <div className="text-6xl font-extrabold text-brand-400">{days}</div>
              <p className="mt-1 text-sm text-white/50">days / week</p>
              <input
                type="range"
                min={2}
                max={6}
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value))}
                className="mt-6 w-full accent-brand-400"
              />
              <div className="mt-2 flex justify-between px-1 text-xs text-white/40">
                {[2, 3, 4, 5, 6].map((n) => (
                  <span key={n}>{n}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <Picker title="What can you train with?" sub="We'll swap exercises to match.">
            {equipments.map((e) => (
              <OptionCard key={e.id} selected={equipment === e.id} onClick={() => setEquipment(e.id)} title={e.label} desc={e.desc} />
            ))}
          </Picker>
        )}
      </div>

      {/* nav buttons */}
      <div className="mt-6 flex items-center gap-3">
        {step > 0 && (
          <button onClick={() => setStep((s) => s - 1)} className="grid h-12 w-12 place-items-center rounded-full bg-ink-700 text-white/70 active:scale-95">
            <ChevronLeft size={22} />
          </button>
        )}
        {step < total - 1 ? (
          <button disabled={!canNext} onClick={() => setStep((s) => s + 1)} className="btn-primary flex-1 disabled:opacity-40">
            Continue <ChevronRight size={18} />
          </button>
        ) : (
          <button onClick={finish} className="btn-primary flex-1">
            Start training <Check size={18} />
          </button>
        )}
      </div>
    </div>
  )
}

function Picker({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-2xl font-extrabold">{title}</h2>
      <p className="mt-1 text-[14px] text-white/50">{sub}</p>
      <div className="mt-6 space-y-3">{children}</div>
    </div>
  )
}

function OptionCard({ selected, onClick, title, desc }: { selected: boolean; onClick: () => void; title: string; desc: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition active:scale-[0.99] ${
        selected ? 'border-brand-400 bg-brand-400/10' : 'border-white/8 bg-ink-800'
      }`}
    >
      <div>
        <p className="font-bold">{title}</p>
        <p className="text-[13px] text-white/50">{desc}</p>
      </div>
      <div className={`grid h-6 w-6 place-items-center rounded-full border-2 ${selected ? 'border-brand-400 bg-brand-400' : 'border-white/25'}`}>
        {selected && <Check size={14} strokeWidth={3} className="text-black" />}
      </div>
    </button>
  )
}
