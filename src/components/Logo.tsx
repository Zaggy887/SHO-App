/* ------------------------------------------------------------------ */
/*  Brand marks for StrengthHub Online                                 */
/*  LogoMark  — compact squircle monogram (SH) for tight spots         */
/*  Wordmark  — the StrengthHub lockup, echoing the full logo          */
/* ------------------------------------------------------------------ */

export function LogoMark({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <div
      className={`grid shrink-0 place-items-center rounded-[28%] bg-brand-400 ${className}`}
      style={{ width: size, height: size }}
      aria-label="StrengthHub Online"
      role="img"
    >
      <span className="font-extrabold leading-none tracking-tight text-black" style={{ fontSize: size * 0.42 }}>
        S<span className="italic">H</span>
      </span>
    </div>
  )
}

const sizeMap = { sm: 'text-[15px]', md: 'text-xl', lg: 'text-[28px]' } as const

export function Wordmark({
  size = 'md',
  online = true,
  className = '',
}: {
  size?: keyof typeof sizeMap
  online?: boolean
  className?: string
}) {
  return (
    <span className={`inline-flex items-start font-extrabold leading-none tracking-tight ${sizeMap[size]} ${className}`}>
      <span className="text-white">Strength</span>
      <span className="italic text-brand-400">Hub</span>
      {online && (
        <sup className="ml-[0.15em] mt-[0.1em] text-[0.4em] font-bold uppercase tracking-[0.22em] text-white/40">Online</sup>
      )}
    </span>
  )
}
