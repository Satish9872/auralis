import type { Tone } from './ui'

export type Stage = 'Applied' | 'Screened' | 'Scheduled' | 'Interviewing' | 'Reviewed' | 'Shortlisted' | 'Declined'

export const stageTone: Record<Stage, Tone> = {
  Applied: 'neutral', Screened: 'brand', Scheduled: 'brand', Interviewing: 'live',
  Reviewed: 'eval', Shortlisted: 'ok', Declined: 'neutral',
}

export interface Competency { name: string; score: number | null; evidence: string; ts: string }
export interface Candidate {
  id: string; name: string; title: string; location: string; stage: Stage
  ats: number; r1: number | null; r2: number | null
  applied: string; source: string; flagged?: string
  competencies: Competency[]
  strengths: string[]; concerns: string[]
  recommendation: 'Advance' | 'Borderline' | 'Decline'
}

export const candidates: Candidate[] = [
  {
    id: 'c1', name: 'Priya Sharma', title: 'Senior Backend Engineer, Razorpay', location: 'Mumbai',
    stage: 'Reviewed', ats: 84, r1: 4.2, r2: null, applied: '2d ago', source: 'LinkedIn',
    recommendation: 'Advance',
    competencies: [
      { name: 'System design', score: 4.5, ts: '14:22', evidence: 'Walked through sharding the payments ledger by merchant ID, then caught the hot-partition risk on high-volume merchants unprompted and proposed consistent hashing with virtual nodes.' },
      { name: 'Coding', score: 4.0, ts: '28:10', evidence: 'Wrote the idempotency-key handler test-first. Refactored once when the race condition surfaced, rather than patching around it.' },
      { name: 'Debugging', score: 4.0, ts: '41:55', evidence: 'Isolated the deadlock to lock ordering across two transactions in under four minutes by reasoning about the access pattern, not by guessing.' },
      { name: 'Communication', score: 4.5, ts: '09:30', evidence: 'Asked three clarifying questions about scale and consistency requirements before designing anything.' },
      { name: 'Ownership', score: null, ts: '', evidence: '' },
    ],
    strengths: [
      'Reasons about failure modes before being asked — raised hot partitions and lock ordering unprompted',
      'Test-first by instinct under time pressure',
      'Clarifies scope before designing',
    ],
    concerns: [
      'Ownership was not assessed — the round ran out of time before that question',
      'Production incident experience appears team-supported rather than independently led',
    ],
  },
  {
    id: 'c2', name: 'Arjun Mehta', title: 'Backend Engineer, Swiggy', location: 'Bengaluru',
    stage: 'Interviewing', ats: 78, r1: null, r2: null, applied: '1d ago', source: 'Careers page',
    recommendation: 'Borderline',
    competencies: [], strengths: [], concerns: [],
  },
  {
    id: 'c3', name: 'Neha Iyer', title: 'Staff Engineer, Freshworks', location: 'Chennai',
    stage: 'Shortlisted', ats: 91, r1: 4.6, r2: 4.4, applied: '5d ago', source: 'Referral',
    recommendation: 'Advance',
    competencies: [
      { name: 'System design', score: 4.8, ts: '12:05', evidence: 'Designed for multi-region failover without being prompted, and correctly identified that the write path could not be made fully active-active given the consistency requirement.' },
      { name: 'Coding', score: 4.5, ts: '31:20', evidence: 'Clean, incremental, well-named. Handled the edge case on empty input before it was raised.' },
      { name: 'Debugging', score: 4.2, ts: '44:00', evidence: 'Methodical bisection of the failing case.' },
      { name: 'Communication', score: 4.5, ts: '05:10', evidence: 'Explained tradeoffs in terms of business impact, not just technical merit.' },
      { name: 'Ownership', score: 4.4, ts: '52:30', evidence: 'Described leading an incident response end to end, including the postmortem and the follow-up work.' },
    ],
    strengths: ['Multi-region reasoning without prompting', 'Explains tradeoffs in business terms', 'Has independently led incident response'],
    concerns: ['Compensation expectation is above the posted band'],
  },
  {
    id: 'c4', name: 'Rahul Verma', title: 'SDE II, Flipkart', location: 'Bengaluru',
    stage: 'Scheduled', ats: 72, r1: null, r2: null, applied: '3d ago', source: 'Naukri',
    recommendation: 'Borderline', competencies: [], strengths: [], concerns: [],
  },
  {
    id: 'c5', name: 'Ananya Rao', title: 'Backend Engineer, Zoho', location: 'Chennai',
    stage: 'Reviewed', ats: 69, r1: 2.6, r2: null, applied: '4d ago', source: 'LinkedIn',
    recommendation: 'Decline',
    competencies: [
      { name: 'System design', score: 2.5, ts: '15:40', evidence: 'Proposed a single-database design and did not revisit it when asked what happens at ten times the load.' },
      { name: 'Coding', score: 3.0, ts: '29:15', evidence: 'Correct solution, but did not handle the concurrent case until prompted twice.' },
      { name: 'Debugging', score: 2.5, ts: '42:30', evidence: 'Changed several things at once rather than isolating the variable.' },
      { name: 'Communication', score: 3.2, ts: '07:00', evidence: 'Clear explanations, though assumptions were left unstated.' },
      { name: 'Ownership', score: null, ts: '', evidence: '' },
    ],
    strengths: ['Communicates clearly', 'Solid fundamentals on the straightforward path'],
    concerns: [
      'The role needs someone who scales systems past a single database; that reasoning was not demonstrated',
      'Debugging approach was trial-and-error rather than systematic',
    ],
  },
  {
    id: 'c6', name: 'Vikram Nair', title: 'Senior Engineer, PhonePe', location: 'Pune',
    stage: 'Reviewed', ats: 81, r1: 3.4, r2: null, applied: '2d ago', source: 'LinkedIn',
    flagged: 'Response latency',
    recommendation: 'Borderline',
    competencies: [
      { name: 'System design', score: 3.5, ts: '16:20', evidence: 'Reasonable design, arrived at after a long pause.' },
      { name: 'Coding', score: 3.2, ts: '30:00', evidence: 'Working solution; style differed noticeably from the spoken explanation.' },
      { name: 'Debugging', score: 3.5, ts: '43:10', evidence: 'Found the issue but could not explain how.' },
      { name: 'Communication', score: 3.4, ts: '08:00', evidence: 'Competent but hesitant on follow-ups.' },
      { name: 'Ownership', score: null, ts: '', evidence: '' },
    ],
    strengths: ['Reached correct answers on all three technical questions'],
    concerns: ['Explanations did not consistently match the work produced — flagged for human review'],
  },
]

export const jobs = [
  { id: 'j1', title: 'Senior Backend Engineer', dept: 'Engineering', loc: 'Mumbai · Hybrid', status: 'Open', applied: 247, screened: 84, interviewed: 31, shortlisted: 5, days: 12, owner: 'Kavya Reddy' },
  { id: 'j2', title: 'Product Designer', dept: 'Design', loc: 'Remote, India', status: 'Open', applied: 189, screened: 52, interviewed: 18, shortlisted: 3, days: 8, owner: 'Kavya Reddy' },
  { id: 'j3', title: 'Data Engineer', dept: 'Engineering', loc: 'Bengaluru', status: 'Open', applied: 312, screened: 97, interviewed: 24, shortlisted: 2, days: 21, owner: 'Rahul Menon' },
  { id: 'j4', title: 'Engineering Manager', dept: 'Engineering', loc: 'Mumbai', status: 'Paused', applied: 64, screened: 19, interviewed: 6, shortlisted: 1, days: 34, owner: 'Rahul Menon' },
  { id: 'j5', title: 'QA Automation Engineer', dept: 'Engineering', loc: 'Remote, India', status: 'Draft', applied: 0, screened: 0, interviewed: 0, shortlisted: 0, days: 0, owner: 'Kavya Reddy' },
]

export const tenants = [
  { id: 't1', name: 'Acme Technologies', domain: 'acme.com', tier: 'Scale', state: 'Active', health: 82, mrr: 4800, interviews: 284, quota: 500, margin: 71, region: 'ap-south-1', csm: 'Divya S' },
  { id: 't2', name: 'Northwind Retail', domain: 'northwind.in', tier: 'Growth', state: 'Active', health: 64, mrr: 1900, interviews: 142, quota: 150, margin: 58, region: 'ap-south-1', csm: 'Divya S' },
  { id: 't3', name: 'Helix Health', domain: 'helixhealth.eu', tier: 'Enterprise', state: 'Active', health: 91, mrr: 12400, interviews: 610, quota: 1500, margin: 76, region: 'eu-central-1', csm: 'Marcus L' },
  { id: 't4', name: 'Bluepeak Labs', domain: 'bluepeak.io', tier: 'Growth', state: 'Trial', health: 55, mrr: 0, interviews: 22, quota: 50, margin: 12, region: 'ap-south-1', csm: 'Divya S' },
  { id: 't5', name: 'Orbit Logistics', domain: 'orbitlog.com', tier: 'Starter', state: 'Past due', health: 38, mrr: 490, interviews: 96, quota: 100, margin: 31, region: 'us-east-1', csm: 'Marcus L' },
  { id: 't6', name: 'Vertex Analytics', domain: 'vertexa.com', tier: 'Scale', state: 'Active', health: 88, mrr: 5200, interviews: 341, quota: 500, margin: 74, region: 'us-east-1', csm: 'Marcus L' },
]

export const rounds = [
  { n: 1, name: 'Technical screen', mins: 45, format: 'AI', comps: ['System design', 'Coding', 'Communication'], threshold: 3.5, canvas: true },
  { n: 2, name: 'Deep dive', mins: 60, format: 'AI', comps: ['System design', 'Debugging', 'Ownership'], threshold: 3.8, canvas: true },
  { n: 3, name: 'Team fit', mins: 45, format: 'Human', comps: ['Collaboration', 'Ownership'], threshold: 3.5, canvas: false },
]

export const actionQueue = [
  { id: 'a1', type: 'review', text: '14 candidates need your review', sub: 'Senior Backend Engineer · borderline band', tone: 'warn' as Tone, cta: 'Review' },
  { id: 'a2', type: 'shortlist', text: 'Senior Backend Engineer — 5 candidates ready for your decision', sub: 'Shortlist completed 2 hours ago', tone: 'ok' as Tone, cta: 'Open' },
  { id: 'a3', type: 'flag', text: '1 interview flagged for review', sub: 'Vikram Nair · response latency signal', tone: 'bad' as Tone, cta: 'Investigate' },
  { id: 'a4', type: 'incident', text: '1 interview failed and needs rescheduling', sub: 'Connection lost at 31 min · candidate notified', tone: 'bad' as Tone, cta: 'Reschedule' },
  { id: 'a5', type: 'expiry', text: "3 candidates haven't booked — invitations expire tomorrow", sub: 'Data Engineer', tone: 'warn' as Tone, cta: 'Remind' },
]

/* The interview script used by the Room demo */
export const script = [
  { who: 'ai', text: "Hello Priya, thanks for making the time. I'm Aria, and I'll be running this round. It's about 45 minutes, and we'll cover system design, some coding, and how you approach debugging. Interrupt me whenever you like. Ready?" },
  { who: 'you', text: "Yes, ready." },
  { who: 'ai', text: "Great. Let's start with something from your background. You mentioned building the payments ledger at Razorpay. Walk me through how you'd shard it if transaction volume went up ten times." },
  { who: 'you', text: "I'd shard by merchant ID, since almost all our queries are merchant-scoped. That keeps reads on a single shard." },
  { who: 'ai', text: "That makes sense for the common case. What happens to a merchant doing ten times the volume of everyone else?" },
  { who: 'you', text: "That's a hot partition. You'd get a shard doing most of the work while others idle." },
  { who: 'ai', text: "Right — so how would you handle it?", canvas: true },
]

export const transcript = [
  { t: '00:12', who: 'Aria', text: "Let's start with something from your background. You mentioned building the payments ledger at Razorpay. Walk me through how you'd shard it if transaction volume went up ten times." },
  { t: '00:31', who: 'Priya', text: "I'd shard by merchant ID, since almost all our queries are merchant-scoped. That keeps reads on a single shard and avoids scatter-gather." },
  { t: '01:04', who: 'Aria', text: "That makes sense for the common case. What happens to a merchant doing ten times the volume of everyone else?" },
  { t: '01:11', who: 'Priya', text: "That's a hot partition — you'd get one shard doing most of the work while the others idle. You'd want consistent hashing with virtual nodes so a single large merchant spreads across several physical shards." },
  { t: '01:48', who: 'Aria', text: "And what does that cost you?" },
  { t: '01:52', who: 'Priya', text: "Cross-shard queries for that merchant's own reporting. Which is a fair trade, because reporting is asynchronous and the write path isn't." },
]
