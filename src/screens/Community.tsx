import { useState } from 'react'
import { Users, Heart, MessageCircle, Bookmark, ChevronRight, MoreHorizontal, CalendarClock, Trophy } from 'lucide-react'
import { Icon } from '../components/Icon'
import { Avatar, AvatarStack } from '../components/Avatar'
import { ProgressRing, ProgressBar, SegmentedTabs, ScreenHeader, SectionHeader, Chip } from '../components/ui'
import { useStore } from '../store/store'
import { useNav } from '../nav'
import { img } from '../data/catalog'
import { youRank } from '../store/selectors'

const TABS = ['Feed', 'Groups', 'Challenges', 'Events']

export default function Community() {
  const [tab, setTab] = useState('Feed')
  const nav = useNav()
  return (
    <div className="px-5 pt-2">
      <ScreenHeader
        title="Community"
        trailing={<button onClick={() => nav.open('leaderboard')} className="relative grid h-10 w-10 place-items-center rounded-xl text-white/80 active:bg-white/5"><Users size={22} /><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand-400 ring-2 ring-ink-900" /></button>}
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

function FeedTab() {
  const { state, dispatch } = useStore()
  const nav = useNav()
  const challenge = state.challenges.find((c) => c.joined)

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border border-brand-400/20">
        <img src={img.community} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
        <div className="relative bg-gradient-to-r from-brand-900/95 via-ink-900/92 to-ink-900/40 p-5">
          <Users size={28} className="text-brand-400" />
          <h3 className="mt-2 text-xl font-extrabold leading-tight">Stronger Together.<br /><span className="text-brand-400">Better Every Day.</span></h3>
          <p className="mt-2 max-w-[220px] text-[13px] leading-snug text-white/65">Connect, share, support and grow with like-minded students.</p>
          <button onClick={() => nav.open('createPost')} className="btn-primary mt-4">Create a Post</button>
        </div>
      </div>

      <SectionHeader title="What's happening" />
      <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 pb-1">
        {state.posts.map((p) => (
          <div key={p.id} className="w-[260px] shrink-0 overflow-hidden rounded-2xl border border-white/5 bg-ink-800">
            <div className="flex items-center gap-2.5 p-3">
              <Avatar name={p.author} size={36} />
              <div className="flex-1"><p className="text-sm font-bold leading-tight">{p.author}</p><p className="text-[12px] text-white/45">{p.time}</p></div>
              <MoreHorizontal size={18} className="text-white/40" />
            </div>
            <p className="px-3 pb-3 text-[14px] leading-snug">{p.text}</p>
            {p.image && <img src={p.image} alt="" className="h-36 w-full object-cover" loading="lazy" />}
            {p.ring && (
              <div className="mx-3 mb-3 flex flex-col items-center rounded-xl bg-ink-700 py-5">
                <ProgressRing value={p.ring} size={92} stroke={8}><span className="text-xl font-extrabold">{p.ring}%</span></ProgressRing>
                <p className="mt-2 text-[10px] font-semibold tracking-wider text-white/45">{p.ringLabel}</p>
              </div>
            )}
            <div className="flex items-center gap-4 p-3">
              <button onClick={() => dispatch({ type: 'TOGGLE_LIKE', postId: p.id })} className={`flex items-center gap-1.5 text-sm ${p.liked ? 'text-brand-400' : 'text-white/55'}`}>
                <Heart size={18} fill={p.liked ? 'currentColor' : 'none'} /> {p.likes}
              </button>
              <span className="flex items-center gap-1.5 text-sm text-white/55"><MessageCircle size={18} /> {p.comments}</span>
              <button onClick={() => dispatch({ type: 'TOGGLE_BOOKMARK', postId: p.id })} className="ml-auto"><Bookmark size={18} className={p.bookmarked ? 'text-brand-400' : 'text-white/45'} fill={p.bookmarked ? 'currentColor' : 'none'} /></button>
            </div>
          </div>
        ))}
      </div>

      {challenge && (
        <>
          <SectionHeader title="Active Challenges" />
          <div className="rounded-2xl border border-white/5 bg-ink-800 p-4">
            <div className="flex items-center gap-4">
              <ProgressRing value={challenge.progressPct} size={62} stroke={5}>
                <span className="text-lg font-extrabold leading-none">{challenge.weeks}</span>
                <span className="text-[8px] font-semibold tracking-wide text-white/50">WEEKS</span>
              </ProgressRing>
              <div className="flex-1">
                <p className="font-bold leading-tight">{challenge.title}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <AvatarStack names={['Alex M', 'Sophie L', 'Jayden K', 'Mia R', 'Dan P']} size={24} />
                  <span className="text-[12px] font-semibold text-white/55">+{challenge.participants}</span>
                </div>
              </div>
              <div className="text-right"><p className="text-[11px] text-white/45">Your Rank</p><p className="text-lg font-extrabold text-brand-400">{challenge.rank}<span className="text-[12px] font-medium text-white/40"> / {challenge.participants}</span></p></div>
            </div>
            <ProgressBar value={challenge.progressPct} className="mt-4" />
            <div className="mt-2 flex items-center justify-between text-[12px] text-white/50"><span>Week {challenge.currentWeek} of {challenge.totalWeeks}</span><span>{challenge.progressPct}% Complete</span></div>
          </div>
        </>
      )}

      <button onClick={() => nav.open('leaderboard')} className="mt-4 flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-ink-800 p-4 text-left active:scale-[0.99]">
        <Trophy size={26} className="shrink-0 text-accent-orange" />
        <div className="flex-1"><p className="font-bold">Friends Leaderboard</p><p className="text-[13px] text-white/50">You're #{youRank(state)} among your friends</p></div>
        <ChevronRight size={18} className="text-white/30" />
      </button>

      <SectionHeader title="Community Groups" />
      <GroupList />
      <div className="h-2" />
    </>
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
  return (
    <div className="space-y-3">
      {state.challenges.map((c) => (
        <div key={c.id} className="rounded-2xl border border-white/5 bg-ink-800 p-4">
          <div className="flex items-center justify-between">
            <p className="font-bold">{c.title}</p>
            {c.joined ? <Chip color="green">Joined</Chip> : <Chip color="gray">{c.totalWeeks} wks</Chip>}
          </div>
          {c.joined && <><ProgressBar value={c.progressPct} className="mt-3" /><p className="mt-1.5 text-[12px] text-white/50">Week {c.currentWeek} of {c.totalWeeks} · rank #{c.rank}</p></>}
          <div className="mt-3 flex items-center justify-between">
            <AvatarStack names={['Alex M', 'Sophie L', 'Jayden K', 'Mia R']} size={26} />
            <span className="text-[13px] text-white/50">{c.participants} joined</span>
            <button onClick={() => dispatch({ type: 'JOIN_CHALLENGE', id: c.id })} className={`rounded-full px-4 py-1.5 text-sm font-bold ${c.joined ? 'bg-ink-700 text-white/70' : 'bg-brand-400 text-black'}`}>{c.joined ? 'Leave' : 'Join'}</button>
          </div>
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
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-accent-blue/15"><CalendarClock size={22} className="text-accent-blue" /></div>
          <div className="flex-1"><p className="font-bold leading-tight">{e.title}</p><p className="text-[12px] text-white/50">{e.when}</p><p className="text-[12px] text-white/40">Hosted by {e.host}</p></div>
          <button onClick={() => dispatch({ type: 'RSVP_EVENT', id: e.id })} className={`rounded-full px-3.5 py-1.5 text-sm font-bold ${e.rsvp ? 'bg-brand-400 text-black' : 'bg-ink-700 text-white/70'}`}>{e.rsvp ? 'Going' : 'RSVP'}</button>
        </div>
      ))}
    </div>
  )
}
