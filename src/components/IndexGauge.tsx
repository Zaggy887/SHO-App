import { useEffect, useState } from 'react'
import type { WeeklyIndex } from '../store/selectors'

const BAND_COLOR: Record<WeeklyIndex['band'], string> = {
  off: '#F87171',
  behind: '#F5A524',
  ontrack: '#7ED957',
  ahead: '#7ED957',
  crushing: '#7ED957',
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/**
 * Compact semicircular performance gauge. Needle sits in the middle when the
 * user is on track, swings right when ahead and left when behind. The needle
 * animates from the left up to the score on mount. Renders flat on the page.
 */
export function IndexGauge({ index }: { index: WeeklyIndex }) {
  const W = 220, H = 116
  const cx = W / 2, cy = 104, r = 90, stroke = 13
  const color = BAND_COLOR[index.band]

  const segs = 48
  const pt = (t: number) => [cx + r * Math.cos(t), cy - r * Math.sin(t)] as const
  let d = ''
  for (let i = 0; i <= segs; i++) {
    const [x, y] = pt(Math.PI * (1 - i / segs))
    d += `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`
  }

  // Needle is drawn pointing straight up, then rotated by score. Animate from
  // the far left (-90deg) to the target so it "settles" on load.
  const targetDeg = (Math.max(0, Math.min(100, index.score)) - 50) / 50 * 90
  const [deg, setDeg] = useState(prefersReducedMotion() ? targetDeg : -90)
  useEffect(() => {
    if (prefersReducedMotion()) { setDeg(targetDeg); return }
    const id = requestAnimationFrame(() => setDeg(targetDeg))
    return () => cancelAnimationFrame(id)
  }, [targetDeg])

  const rN = r - 16
  const baseW = 7

  return (
    <div className="flex flex-col items-center">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[228px]">
        <defs>
          <linearGradient id="gaugeArc" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#F87171" />
            <stop offset="38%" stopColor="#F5A524" />
            <stop offset="62%" stopColor="#C2EE98" />
            <stop offset="100%" stopColor="#7ED957" />
          </linearGradient>
        </defs>
        <path d={d} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke + 5} strokeLinecap="round" />
        <path d={d} fill="none" stroke="url(#gaugeArc)" strokeWidth={stroke} strokeLinecap="round" />
        <g
          style={{
            transform: `rotate(${deg}deg)`,
            transformOrigin: `${cx}px ${cy}px`,
            transformBox: 'view-box',
            transition: 'transform 0.95s cubic-bezier(0.22,1,0.36,1)',
          }}
        >
          <polygon
            points={`${cx - baseW},${cy} ${cx},${cy - rN} ${cx + baseW},${cy}`}
            fill="#ffffff"
            style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}
          />
        </g>
        <circle cx={cx} cy={cy} r={9} fill="#ffffff" />
        <circle cx={cx} cy={cy} r={4} fill="#0a0a0b" />
      </svg>

      {/* readable anchors under the arc */}
      <div className="-mt-2 flex w-full max-w-[236px] items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wide text-white/45">Behind</span>
        <span className="text-[10px] font-bold uppercase tracking-wide text-white/45">Ahead</span>
      </div>

      <p className="mt-1.5 text-[18px] font-black tracking-tight" style={{ color }}>{index.label}</p>
      <p className="text-[12px] text-white/45"><span className="font-bold" style={{ color }}>{index.score}</span>/100 · last 7 days</p>
    </div>
  )
}
