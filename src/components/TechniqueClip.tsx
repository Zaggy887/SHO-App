import { Play } from 'lucide-react'

/**
 * Slot for a looping technique clip. Renders a real <video> when a url is
 * provided, otherwise a clean placeholder that is ready to swap clips into.
 */
export function TechniqueClip({ poster, videoUrl, label }: { poster: string; videoUrl?: string; label: string }) {
  if (videoUrl) {
    return (
      <video
        src={videoUrl}
        poster={poster}
        autoPlay
        loop
        muted
        playsInline
        className="aspect-video w-full rounded-2xl object-cover"
      />
    )
  }
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/8">
      <img src={poster} alt="" className="h-full w-full object-cover opacity-40" loading="lazy" />
      <div className="absolute inset-0 grid place-items-center">
        <div className="flex flex-col items-center gap-2">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-400 text-black shadow-glow">
            <Play size={20} fill="currentColor" />
          </span>
          <span className="text-[12px] font-semibold text-white/70">{label}</span>
        </div>
      </div>
    </div>
  )
}
