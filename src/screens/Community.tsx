import { useState } from 'react'
import {
  Users, Heart, MessageCircle, Bookmark, ChevronRight, MoreHorizontal, CalendarClock,
  HeartHandshake, Award, UserPlus, Swords,
} from 'lucide-react'
import { Icon } from '../components/Icon'
import { Avatar, AvatarStack } from '../components/Avatar'
import { ProgressRing, ProgressBar, SegmentedTabs, ScreenHeader, SectionHeader, Chip } from '../components/ui'
import { useStore } from '../store/store'
import { useNav } from '../nav'
import { img } from '../data/catalog'
import { youRank } from '../store/selectors'
import type { Challenge, CommunityScope, Post } from '../store/types'

const TABS = ['Feed', 'Groups', 'Challenges', 'Events']

export default function Community() {
  const [tab, setTab] = useState('Feed')
  const nav = useNav()
  return (
    <div className="px-5 pt-2">
      <ScreenHeader
        title="Community"
        trailing={<button onClick={() => nav.open('leaderboard')} className="relative grid h-10 w-10 place-items-center rounded-xl text-white/80 active:scale-90 active:bg-white/5"><Users size={22} /><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand-400 ring-2 ring-ink-900" /></button>}
      />
      <SegmentedTabs tabs={TABS} active={tab} onChange={setTab} />
      <div className="mt-5">
        {tab === 'Feed' && <FeedTab />}
        {tab === 'Groups' && <GroupList />}
        {tab === 'Challenges' && <ChallengesTab />}
        {tab === 'Events' && <EventsTab />}
      </div>
    </div>
  )
}

const SCOPES: { id: CommunityScope; label: (p: { university: string; dorm: string; society: string }) => string }[] = [
  { id: 'campus', label: (p) => p.university },
  { id: 'dorm', label: (p) => p.dorm },
  { id: 'society', label: (p) => p.society },
]

function FeedTab() {
  const { state, dispatch } = useStore()
  const nav = useNav()
  const [scope, setScope] = useState<CommunityScope>('campus')
  const featured =
    scope === 'dorm'
      ? state.challenges.find((c) => c.scope === 'dorm')
      : scope === 'society'
        ? state.challenges.find((c) => c.scope === 'society')
        : state.challenges.find((c) => c.joined && c.scope === 'campus')

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border border-brand-400/20">
        <img src={img.community} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
        <div className="relative bg-gradient-to-r from-ink-900/95 via-ink-900/90 to-ink-900/40 p-5">
          <Users size={26} className="text-brand-400" />
          <h3 className="mt-2 text-xl font-extrabold leading-tight tracking-tight">Your campus,<br /><span className="text-brand-400">your people.</span></h3>
          <p className="mt-2 max-w-[230px] text-[13px] leading-snug text-white/65">Train alongside students in your halls and societies, not strangers across the world.</p>
          <div className="mt-4 flex gap-2">
            <button onClick={() => nav.open('createPost')} className="btn-primary px-4 py-2.5 text-sm">Share something</button>
            <button onClick={() => nav.open('partnerMatch')} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2.5 text-sm font-semibold text-white active:scale-95"><UserPlus size={15} /> Find a partner</button>
          </div>
        </div>
      </div>

      {/* scope selector */}
      <div className="mt-4 flex gap-2">
        {SCOPES.map((s) => (
          <button key={s.id} onClick={() => setScope(s.id)} className={`flex-1 rounded-full py-2 text-[13px] font-semibold transition ${scope === s.id ? 'bg-brand-400 text-black' : 'bg-ink-700 text-white/60'}`}>
            {s.label(state.profile)}
          </button>
        ))}
      </div>

      <SectionHeader title="What's happening" />
      <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 pb-1">
        {state.posts.map((p) => <FeedCard key={p.id} post={p} onLike={() => dispatch({ type: 'TOGGLE_LIKE', postId: p.id })} onKudos={() => dispatch({ type: 'GIVE_KUDOS', postId: p.id })} onBookmark={() => dispatch({ type: 'TOGGLE_BOOKMARK', postId: p.id })} onComment={() => nav.open('postDetail', { postId: p.id })} />)}
      </div>

      {featured && (
        <>
          <SectionHeader title={scope === 'campus' ? 'Active challenge' : 'Belonging challenge'} />
          <ChallengeCard c={featured} onJoin={() => dispatch({ type: 'JOIN_CHALLENGE', id: featured.id })} />
        </>
      )}

      <button onClick={() => nav.open('leaderboard')} className="mt-4 flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-ink-800 p-4 text-left active:scale-[0.99]">
        <Award size={24} className="shrink-0 text-brand-400" />
        <div className="flex-1"><p className="font-bold">Campus leaderboard</p><p className="text-[13px] text-white/50">You're #{youRank(state)} at {state.profile.university}</p></div>
        <ChevronRight size={18} className="text-white/30" />
      </button>

      <SectionHeader title="Your societies" />
      <GroupList />
      <div className="h-2" />
    </>
  )
}

function FeedCard({ post: p, onLike, onKudos, onBookmark, onComment }: { post: Post; onLike: () => void; onKudos: () => void; onBookmark: () => void; onComment: () => void }) {
  return (
    <div className="w-[268px] shrink-0 overflow-hidden rounded-2xl border border-white/5 bg-ink-800">
      <div className="flex items-center gap-2.5 p-3">
        <Avatar name={p.author} size={36} />
        <div className="flex-1"><p className="text-sm font-bold leading-tight">{p.author}</p><p className="text-[12px] text-white/45">{p.time}</p></div>
        <MoreHorizontal size={18} className="text-white/40" />
      </div>
      {p.pr && (
        <div className="mx-3 mb-2 flex items-center gap-1.5 rounded-full bg-brand-400/15 px-2.5 py-1 text-[11px] font-bold text-brand-300">
          <Award size={13} /> Personal best · {p.pr.lift} {p.pr.weight}
        </div>
      )}
      <p className="px-3 pb-3 text-[14px] leading-snug">{p.text}</p>
      {p.image && <img src={p.image} alt="" className="h-36 w-full object-cover" loading="lazy" />}
      {p.ring && (
        <div className="mx-3 mb-3 flex flex-col items-center rounded-xl bg-ink-700 py-5">
          <ProgressRing value={p.ring} size={92} stroke={8}><span className="text-xl font-extrabold">{p.ring}%</span></ProgressRing>
          <p className="mt-2 text-[10px] font-semibold tracking-wider text-white/45">{p.ringLabel}</p>
        </div>
      )}
      <div className="flex items-center gap-3 p-3">
        <button onClick={onLike} className={`flex items-center gap-1.5 text-sm ${p.liked ? 'text-brand-400' : 'text-white/55'}`}><Heart size={17} fill={p.liked ? 'currentColor' : 'none'} /> {p.likes}</button>
        <button onClick={onKudos} className={`flex items-center gap-1.5 text-sm ${p.gaveKudos ? 'text-brand-400' : 'text-white/55'}`}><HeartHandshake size={17} /> {p.kudos ?? 0}</button>
        <button onClick={onComment} className="flex items-center gap-1.5 text-sm text-white/55 active:text-brand-400"><MessageCircle size={17} /> {p.comments}</button>
        <button onClick={onBookmark} className="ml-auto"><Bookmark size={17} className={p.bookmarked ? 'text-brand-400' : 'text-white/45'} fill={p.bookmarked ? 'currentColor' : 'none'} /></button>
      </div>
    </div>
  )
}

function ChallengeCard({ c, onJoin }: { c: Challenge; onJoin: () => void }) {
  const nav = useNav()
  return (
    <div className="rounded-2xl border border-white/5 bg-ink-800 p-4">
      <div className="flex items-center gap-4">
        <ProgressRing value={c.progressPct || 1} size={62} stroke={5}>
          <span className="text-lg font-extrabold leading-none">{c.weeks}</span>
          <span className="text-[8px] font-semibold tracking-wide text-white/50">WEEKS</span>
        </ProgressRing>
        <div className="flex-1">
          <p className="font-bold leading-tight">{c.title}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <AvatarStack names={['Alex M', 'Sophie L', 'Jayden K', 'Mia R', 'Dan P']} size={24} />
            <span className="text-[12px] font-semibold text-white/55">+{c.participants}</span>
          </div>
        </div>
        {c.rank != null && <div className="text-right"><p className="text-[11px] text-white/45">Your rank</p><p className="text-lg font-extrabold text-brand-400">#{c.rank}</p></div>}
      </div>

      {c.vsLabel && c.yourSide ? (
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-[12px] font-semibold">
            <span className="flex items-center gap-1 text-brand-400"><Swords size={13} /> {c.yourSide}</span>
            <span className="text-white/45">{c.rivalSide}</span>
          </div>
          <div className="flex h-3 overflow-hidden rounded-full bg-ink-700">
            <div className="h-full rounded-l-full bg-brand-400" style={{ width: `${c.yourSidePct ?? 50}%` }} />
          </div>
          <div className="mt-1 flex items-center justify-between text-[12px] text-white/50"><span>{c.yourSidePct}%</span><span>{c.rivalSidePct}%</span></div>
        </div>
      ) : (
        <>
          <ProgressBar value={c.progressPct} className="mt-4" />
          <div className="mt-2 flex items-center justify-between text-[12px] text-white/50"><span>Week {c.currentWeek} of {c.totalWeeks}</span><span>{c.progressPct}% complete</span></div>
        </>
      )}

      <div className="mt-4 flex gap-2">
        <button onClick={() => nav.open('challengeDetail', { id: c.id })} className="flex-1 rounded-full border border-white/10 bg-white/[0.04] py-2.5 text-sm font-semibold text-white/80 active:bg-white/[0.1]">View standings</button>
        {!c.joined && <button onClick={onJoin} className="btn-primary flex-1 py-2.5 text-sm">Join</button>}
      </div>
    </div>
  )
}

function GroupList() {
  const { state, dispatch } = useStore()
  return (
    <div className="space-y-2.5">
      {state.groups.map((g) => (
        <div key={g.id} className="flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-ink-800 p-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl" style={{ backgroundColor: `${g.color}22` }}><Icon name={g.icon} size={22} color={g.color} /></div>
          <div className="min-w-0 flex-1"><p className="font-bold leading-tight">{g.name}</p><p className="text-[12px] text-white/45">{g.members} members · {g.desc}</p></div>
          {g.unread > 0 && g.joined && <Chip color="green">{g.unread} new</Chip>}
          <button onClick={() => dispatch({ type: 'JOIN_GROUP', id: g.id })} className={`rounded-full px-3.5 py-1.5 text-sm font-bold ${g.joined ? 'bg-ink-700 text-white/70' : 'bg-brand-400 text-black'}`}>{g.joined ? 'Joined' : 'Join'}</button>
        </div>
      ))}
    </div>
  )
}

function ChallengesTab() {
  const { state, dispatch } = useStore()
  const scopeLabel: Record<string, string> = { campus: 'Campus', dorm: 'Hall vs hall', society: 'Society vs society', global: 'Open to all' }
  return (
    <div className="space-y-3">
      {state.challenges.map((c) => (
        <div key={c.id}>
          {c.scope && <p className="mb-1 ml-1 text-[11px] font-semibold uppercase tracking-wide text-white/35">{scopeLabel[c.scope]}</p>}
          <ChallengeCard c={c} onJoin={() => dispatch({ type: 'JOIN_CHALLENGE', id: c.id })} />
        </div>
      ))}
    </div>
  )
}

function EventsTab() {
  const { state, dispatch } = useStore()
  return (
    <div className="space-y-3">
      {state.events.map((e) => (
        <div key={e.id} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-ink-800 p-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-400/15"><CalendarClock size={22} className="text-brand-400" /></div>
          <div className="flex-1"><p className="font-bold leading-tight">{e.title}</p><p className="text-[12px] text-white/50">{e.when}</p><p className="text-[12px] text-white/40">Hosted by {e.host}</p></div>
          <button onClick={() => dispatch({ type: 'RSVP_EVENT', id: e.id })} className={`rounded-full px-3.5 py-1.5 text-sm font-bold ${e.rsvp ? 'bg-brand-400 text-black' : 'bg-ink-700 text-white/70'}`}>{e.rsvp ? 'Going' : 'RSVP'}</button>
        </div>
      ))}
    </div>
  )
}
