import type { WeeklyIndex } from '../store/selectors'

/* Map the band to a status colour. On-track or better reads green, behind
 * amber, off red — instantly legible. */
const BAND_COLOR: Record<WeeklyIndex['band'], string> = {
  off: '#F87171',
  behind: '#F5A524',
  ontrack: '#7ED957',
  ahead: '#7ED957',
  crushing: '#7ED957',
}

/**
 * Semicircular performance gauge. Needle sits in the middle when the user is
 * "on track" (≈ meeting their weekly targets), swings right when ahead and
 * left when behind.
 */
export function IndexGauge({ index }: { index: WeeklyIndex }) {
  const W = 260, H = 156
  const cx = W / 2, cy = 140, r = 104, stroke = 16
  const color = BAND_COLOR[index.band]

  // Sample the top semicircle so the gradient runs cleanly left→right.
  const segs = 48
  const pt = (t: number) => [cx + r * Math.cos(t), cy - r * Math.sin(t)] as const
  let d = ''
  for (let i = 0; i <= segs; i++) {
    const t = Math.PI * (1 - i / segs)
    const [x, y] = pt(t)
    d += `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`
  }

  // Needle angle from the score (0 → left, 50 → top, 100 → right).
  const t = Math.PI * (1 - Math.max(0, Math.min(100, index.score)) / 100)
  const rN = r - 18
  const baseW = 8
  const b1 = [cx + baseW * Math.cos(t + Math.PI / 2), cy - baseW * Math.sin(t + Math.PI / 2)]
  const b2 = [cx + baseW * Math.cos(t - Math.PI / 2), cy - baseW * Math.sin(t - Math.PI / 2)]
  const tip = [cx + rN * Math.cos(t), cy - rN * Math.sin(t)]

  return (
    <div className="flex flex-col items-center">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[300px]">
        <defs>
          <linearGradient id="gaugeArc" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#F87171" />
            <stop offset="38%" stopColor="#F5A524" />
            <stop offset="62%" stopColor="#C2EE98" />
            <stop offset="100%" stopColor="#7ED957" />
          </linearGradient>
        </defs>

        {/* track */}
        <path d={d} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke + 6} strokeLinecap="round" />
        {/* gradient scale */}
        <path d={d} fill="none" stroke="url(#gaugeArc)" strokeWidth={stroke} strokeLinecap="round" />

        {/* anchor labels */}
        <text x={cx - r + 2} y={cy - 2} fill="rgba(255,255,255,0.4)" fontSize="9" fontWeight="700" textAnchor="start" style={{ letterSpacing: 0.5 }}>BEHIND</text>
        <text x={cx} y={20} fill="rgba(255,255,255,0.55)" fontSize="9" fontWeight="700" textAnchor="middle" style={{ letterSpacing: 0.5 }}>ON TRACK</text>
        <text x={cx + r - 2} y={cy - 2} fill="rgba(255,255,255,0.4)" fontSize="9" fontWeight="700" textAnchor="end" style={{ letterSpacing: 0.5 }}>AHEAD</text>

        {/* needle */}
        <polygon
          points={`${b1[0].toFixed(2)},${b1[1].toFixed(2)} ${tip[0].toFixed(2)},${tip[1].toFixed(2)} ${b2[0].toFixed(2)},${b2[1].toFixed(2)}`}
          fill="#ffffff"
          style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.5))' }}
        />
        <circle cx={cx} cy={cy} r={11} fill="#ffffff" />
        <circle cx={cx} cy={cy} r={5} fill="#0a0a0b" />
      </svg>

      <p className="-mt-1 text-[22px] font-black tracking-tight" style={{ color }}>{index.label}</p>
      <div className="mt-1 flex items-center gap-1.5 text-[12px] text-white/45">
        <span className="font-bold" style={{ color }}>{index.score}</span>
        <span>/ 100 · based on your last 7 days</span>
      </div>
    </div>
  )
}
