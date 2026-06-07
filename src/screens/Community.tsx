import { useState } from 'react'
import {
  Users,
  Heart,
  MessageCircle,
  Bookmark,
  ChevronRight,
  MoreHorizontal,
  CalendarClock,
} from 'lucide-react'
import { Icon } from '../components/Icon'
import { Avatar, AvatarStack } from '../components/Avatar'
import { ProgressRing, ProgressBar, SegmentedTabs, ScreenHeader, SectionHeader, Chip } from '../components/ui'
import {
  communityBanner,
  feedPosts,
  activeChallenge,
  communityGroups,
  challengesList,
  events,
} from '../data/mockData'

const TABS = ['Feed', 'Groups', 'Challenges', 'Events']

export default function Community() {
  const [tab, setTab] = useState('Feed')

  return (
    <div className="px-5 pt-2">
      <ScreenHeader
        title="Community"
        trailing={
          <button className="relative grid h-10 w-10 place-items-center rounded-xl text-white/80 active:bg-white/5">
            <Users size={22} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand-400 ring-2 ring-ink-900" />
          </button>
        }
      />
      <SegmentedTabs tabs={TABS} active={tab} onChange={setTab} />

      <div className="mt-5">
        {tab === 'Feed' && <FeedTab />}
        {tab === 'Groups' && <GroupsTab />}
        {tab === 'Challenges' && <ChallengesTab />}
        {tab === 'Events' && <EventsTab />}
      </div>
    </div>
  )
}

function FeedTab() {
  return (
    <>
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-brand-400/20">
        <img src={communityBanner.image} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
        <div className="relative bg-gradient-to-r from-brand-900/95 via-ink-900/92 to-ink-900/40 p-5">
          <Users size={28} className="text-brand-400" />
          <h3 className="mt-2 text-xl font-extrabold leading-tight">
            Stronger Together.
            <br />
            <span className="text-brand-400">Better Every Day.</span>
          </h3>
          <p className="mt-2 max-w-[220px] text-[13px] leading-snug text-white/65">{communityBanner.body}</p>
          <button className="btn-primary mt-4">Create a Post</button>
        </div>
      </div>

      {/* What's happening */}
      <div className="mt-6">
        <SectionHeader title="What's happening" action="See all" />
        <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 pb-1">
          {feedPosts.map((p) => (
            <div key={p.id} className="w-[260px] shrink-0 overflow-hidden rounded-2xl border border-white/5 bg-ink-800">
              <div className="flex items-center gap-2.5 p-3">
                <Avatar name={p.author} size={36} />
                <div className="flex-1">
                  <p className="text-sm font-bold leading-tight">{p.author}</p>
                  <p className="text-[12px] text-white/45">{p.time}</p>
                </div>
                <MoreHorizontal size={18} className="text-white/40" />
              </div>
              <p className="px-3 pb-3 text-[14px] leading-snug">{p.text}</p>

              {p.image && <img src={p.image} alt="" className="h-36 w-full object-cover" loading="lazy" />}
              {p.ring && (
                <div className="mx-3 mb-3 flex flex-col items-center rounded-xl bg-ink-700 py-5">
                  <ProgressRing value={p.ring} size={92} stroke={8}>
                    <span className="text-xl font-extrabold">{p.ring}%</span>
                  </ProgressRing>
                  <p className="mt-2 text-[10px] font-semibold tracking-wider text-white/45">{p.ringLabel}</p>
                </div>
              )}

              <div className="flex items-center gap-4 p-3">
                <span className="flex items-center gap-1.5 text-sm text-brand-400">
                  <Heart size={18} fill="currentColor" /> {p.likes}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-white/55">
                  <MessageCircle size={18} /> {p.comments}
                </span>
                <Bookmark size={18} className="ml-auto text-white/45" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Challenges */}
      <div className="mt-6">
        <SectionHeader title="Active Challenges" action="See all" />
        <div className="rounded-2xl border border-white/5 bg-ink-800 p-4">
          <div className="flex items-center gap-4">
            <ProgressRing value={activeChallenge.pct} size={62} stroke={5}>
              <span className="text-lg font-extrabold leading-none">{activeChallenge.weeks}</span>
              <span className="text-[8px] font-semibold tracking-wide text-white/50">WEEKS</span>
            </ProgressRing>
            <div className="flex-1">
              <p className="font-bold leading-tight">{activeChallenge.title}</p>
              <div className="mt-1.5 flex items-center gap-2">
                <AvatarStack names={['Alex M', 'Sophie L', 'Jayden K', 'Mia R', 'Dan P']} size={24} />
                <span className="text-[12px] font-semibold text-white/55">+{activeChallenge.extra}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-white/45">Your Rank</p>
              <p className="text-lg font-extrabold text-brand-400">
                {activeChallenge.rank}
                <span className="text-[12px] font-medium text-white/40"> / {activeChallenge.total}</span>
              </p>
            </div>
            <ChevronRight size={20} className="text-white/30" />
          </div>
          <ProgressBar value={activeChallenge.pct} className="mt-4" />
          <div className="mt-2 flex items-center justify-between text-[12px] text-white/50">
            <span>
              Week {activeChallenge.currentWeek} of {activeChallenge.totalWeeks}
            </span>
            <span>{activeChallenge.pct}% Complete</span>
          </div>
        </div>
      </div>

      {/* Community Groups */}
      <div className="mt-6">
        <SectionHeader title="Community Groups" action="See all" />
        <GroupList />
      </div>
      <div className="h-2" />
    </>
  )
}

function GroupList() {
  return (
    <div className="space-y-2.5">
      {communityGroups.map((g) => (
        <button
          key={g.name}
          className="flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-ink-800 p-3 text-left active:scale-[0.99]"
        >
          <div
            className="grid h-12 w-12 shrink-0 place-items-center rounded-xl"
            style={{ backgroundColor: `${g.color}22` }}
          >
            <Icon name={g.icon} size={22} color={g.color} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold leading-tight">{g.name}</p>
            <p className="text-[12px] text-white/45">
              {g.members} members · {g.desc}
            </p>
          </div>
          <Chip color="green">{g.unread} new</Chip>
          <ChevronRight size={18} className="text-white/30" />
        </button>
      ))}
    </div>
  )
}

function GroupsTab() {
  return <GroupList />
}

function ChallengesTab() {
  return (
    <div className="space-y-3">
      {challengesList.map((c) => (
        <div key={c.title} className="rounded-2xl border border-white/5 bg-ink-800 p-4">
          <div className="flex items-center justify-between">
            <p className="font-bold">{c.title}</p>
            {c.joined ? <Chip color="green">Joined</Chip> : <Chip color="gray">{c.weeks}</Chip>}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <AvatarStack names={['Alex M', 'Sophie L', 'Jayden K', 'Mia R']} size={26} />
            <span className="text-[13px] text-white/50">{c.participants} joined</span>
            {!c.joined && <button className="btn-primary px-4 py-1.5 text-sm">Join</button>}
          </div>
        </div>
      ))}
    </div>
  )
}

function EventsTab() {
  return (
    <div className="space-y-3">
      {events.map((e) => (
        <div key={e.title} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-ink-800 p-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-accent-blue/15">
            <CalendarClock size={22} className="text-accent-blue" />
          </div>
          <div className="flex-1">
            <p className="font-bold leading-tight">{e.title}</p>
            <p className="text-[12px] text-white/50">{e.when}</p>
            <p className="text-[12px] text-white/40">Hosted by {e.host}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-brand-400">{e.going}</p>
            <p className="text-[11px] text-white/45">going</p>
          </div>
        </div>
      ))}
    </div>
  )
}
