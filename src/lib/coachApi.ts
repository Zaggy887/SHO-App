import type { AppState } from '../store/types'
import { streakStats } from '../store/selectors'

/**
 * Client for the Claude-backed coach messenger.
 *
 * Posts to a serverless endpoint that holds the Anthropic API key
 * (see /api/coach.ts). The key is NEVER in the browser bundle. If the
 * endpoint is missing, unconfigured, or errors, `askCoach` throws and the
 * caller falls back to the on-device rules engine, so the demo always works.
 */
const ENDPOINT = import.meta.env.VITE_COACH_API || '/api/coach'

/** Build the lightweight profile context the coach uses to personalise replies. */
function coachContext(s: AppState) {
  return {
    name: s.profile.name?.split(' ')[0] || '',
    goal: s.profile.goal,
    experience: s.profile.experience,
    daysPerWeek: s.profile.daysPerWeek,
    premium: s.profile.premium,
    examMode: s.profile.examMode,
    streak: streakStats(s).current,
  }
}

/** Send a message to the Claude coach. Resolves with the reply text. */
export async function askCoach(s: AppState, text: string, signal?: AbortSignal): Promise<string> {
  const history = s.chat.slice(-10).map((m) => ({
    role: m.role === 'user' ? ('user' as const) : ('assistant' as const),
    content: m.text,
  }))

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: text, history, profile: coachContext(s) }),
    signal,
  })

  if (!res.ok) throw new Error(`Coach API responded ${res.status}`)

  const data = (await res.json()) as { reply?: string }
  const reply = (data?.reply ?? '').trim()
  if (!reply) throw new Error('Coach API returned an empty reply')
  return reply
}
