import type { WeeklyIndex } from '../store/selectors'

const BAND_COLOR: Record<WeeklyIndex['band'], string> = {
  off: '#F87171',
  behind: '#F5A524',
  ontrack: '#7ED957',
  ahead: '#7ED957',
  crushing: '#7ED957',
}

/**
 * Compact semicircular performance gauge. Needle sits in the middle when the
 * user is on track, swings right when ahead and left when behind. Renders flat
 * on the page (no card chrome) so it blends with the rest of the dashboard.
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

  const t = Math.PI * (1 - Math.max(0, Math.min(100, index.score)) / 100)
  const rN = r - 16
  const baseW = 7
  const b1 = [cx + baseW * Math.cos(t + Math.PI / 2), cy - baseW * Math.sin(t + Math.PI / 2)]
  const b2 = [cx + baseW * Math.cos(t - Math.PI / 2), cy - baseW * Math.sin(t - Math.PI / 2)]
  const tip = [cx + rN * Math.cos(t), cy - rN * Math.sin(t)]

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
        <polygon
          points={`${b1[0].toFixed(2)},${b1[1].toFixed(2)} ${tip[0].toFixed(2)},${tip[1].toFixed(2)} ${b2[0].toFixed(2)},${b2[1].toFixed(2)}`}
          fill="#ffffff"
          style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}
        />
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
