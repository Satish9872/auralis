const BASE = import.meta.env.VITE_API ?? '/api'

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(BASE + path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(body.error || `Request failed (${res.status})`)
  }
  return res.json()
}

const get = <T,>(p: string) => req<T>(p)
const post = <T,>(p: string, body?: unknown) =>
  req<T>(p, { method: 'POST', body: JSON.stringify(body ?? {}) })

/* ---------- types ---------- */
export interface Job {
  id: string; title: string; dept: string; location: string; type: string; status: string
  description: string; must_haves: string[]; nice_to_haves: string[]
  competencies: string[]; threshold: number; owner: string; created_at: string
  counts?: { applied: number; screened: number; interviewed: number; shortlisted: number }
}
export interface Slot { id: string; job_id: string; starts_at: string; duration_min: number }
export interface Turn { who: 'ai' | 'candidate'; text: string; t?: string; competency?: string }
export interface ScoreRow { competency: string; score: number | null; evidence: string }
export interface Scorecard {
  id: string; scores: ScoreRow[]; strengths: string[]; concerns: string[]
  overall: number; recommendation: 'Advance' | 'Borderline' | 'Decline'
  feedback: string; model: string; generated_by: string; created_at: string
}
export interface Interview {
  id: string; round: number; round_name: string; status: string
  scheduled_at?: string; started_at?: string; ended_at?: string
  transcript: Turn[]; covered: string[]; canvas_open: number; canvas_content?: string
  scorecard: Scorecard | null
}
export interface Application {
  id: string; job_id: string; job_title: string; stage: string
  ats_score: number; ats_reasoning: string; ats_matched: string[]; ats_gaps: string[]
  name: string; email: string; phone: string; location: string; current_title: string
  skills: string[]; years_experience: number; resume_text: string
  source: string; token: string; created_at: string
  competencies: string[]; threshold: number
  interviews: Interview[]
}
export interface AppRow {
  id: string; name: string; current_title: string; location: string; skills: string[]
  stage: string; ats_score: number; source: string; created_at: string
  job_id: string; job_title: string
  rounds: { round: number; status: string }[]
  scores: { round: number; overall: number }[]
}
export interface Tenant {
  id: string; name: string; domain: string; tier: string; state: string
  region: string; quota_interviews: number; used_interviews: number; mrr: number
}
export interface EventRow {
  id: number; actor_type: string; actor_id: string; action: string
  entity_type: string; entity_id: string; payload: Record<string, unknown>; created_at: string
}

/* ---------- endpoints ---------- */
export const api = {
  health: () => get<{ ok: boolean; ai: string; note: string }>('/health'),

  jobs: () => get<Job[]>('/jobs'),
  job: (id: string) => get<Job>(`/jobs/${id}`),
  createJob: (b: Partial<Job>) => post<Job>('/jobs', b),

  apply: (b: { job_id: string; resume_text: string; name?: string; email?: string }) =>
    post<{
      application_id: string; token: string; stage: string
      ats: { score: number; reasoning: string; matched: string[]; gaps: string[] }
      profile: { name: string; email: string; phone: string; location: string; current_title: string; skills: string[]; years_experience: number }
      ai: { parse: string; score: string }
    }>('/applications', b),

  applications: (q: { job_id?: string; stage?: string } = {}) => {
    const s = new URLSearchParams(Object.entries(q).filter(([, v]) => v) as [string, string][])
    return get<AppRow[]>(`/applications${s.toString() ? '?' + s : ''}`)
  },
  application: (id: string) => get<Application>(`/applications/${id}`),
  track: (token: string) => get<Application>(`/track/${token}`),
  setStage: (id: string, stage: string, reason?: string) =>
    post<{ ok: boolean; stage: string }>(`/applications/${id}/stage`, { stage, reason }),

  slots: (job_id: string) => get<Slot[]>(`/slots?job_id=${job_id}`),
  schedule: (interviewId: string, slot_id: string) =>
    post<{ ok: boolean; scheduled_at: string }>(`/interviews/${interviewId}/schedule`, { slot_id }),

  interviews: () => get<(Interview & { candidate_name: string; job_title: string })[]>('/interviews'),
  interview: (id: string) => get<Interview & { job: Job; candidate: Record<string, unknown> }>(`/interviews/${id}`),
  startInterview: (id: string) =>
    post<{ message: string; competency: string; open_canvas: boolean; canvas_mode: string; transcript: Turn[]; ai: string }>(`/interviews/${id}/start`),
  turn: (id: string, answer: string, canvas?: string) =>
    post<{ message: string; competency: string; open_canvas: boolean; canvas_mode: string; should_end: boolean; transcript: Turn[]; ai: string }>(`/interviews/${id}/turn`, { answer, canvas }),
  finish: (id: string) =>
    post<Scorecard & { scorecard_id: string; candidate_feedback: string; ai: string; model: string }>(`/interviews/${id}/finish`),

  tenants: () => get<Tenant[]>('/tenants'),
  events: (limit = 50) => get<EventRow[]>(`/events?limit=${limit}`),
  stats: () => get<{
    jobs: number; applications: number; interviews_complete: number; shortlisted: number
    funnel: { stage: string; n: number }[]
  }>('/stats'),
}
