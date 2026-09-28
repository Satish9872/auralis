import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card, Button, Chip, Empty } from '../../ui'
import { api } from '../../api'
import { useAsync } from '../../hooks'
import { Sparkles, AlertTriangle } from 'lucide-react'

const SAMPLE = `Priya Sharma
priya.sharma@email.com | +91 98204 41027 | Mumbai, India

Senior Backend Engineer with 7 years building production payment systems.

Razorpay — Senior Backend Engineer, 2021-present
Owned the payments ledger service handling 40k transactions per second at peak.
Designed the sharding strategy by merchant ID using consistent hashing with virtual
nodes to avoid hot partitions on high-volume merchants. Led three production
incidents end to end, including the postmortems and follow-up work.

Freecharge — Backend Engineer, 2019-2021
Built reconciliation pipelines in Go over PostgreSQL and Kafka. Reduced settlement
lag from 6 hours to 20 minutes.

Skills: Go, PostgreSQL, Kafka, Kubernetes, Redis, Docker, AWS`

export default function Apply() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const { data: jobs, loading, error } = useAsync(() => api.jobs(), [])

  const [jobId, setJobId] = useState(params.get('job') || '')
  const [resume, setResume] = useState('')
  const [consent, setConsent] = useState(false)
  const [privacy, setPrivacy] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const job = jobs?.find(j => j.id === jobId) || jobs?.[0]
  const activeId = jobId || job?.id || ''

  async function submit() {
    setBusy(true); setErr(null)
    try {
      const r = await api.apply({ job_id: activeId, resume_text: resume })
      nav(`/status?token=${r.token}`)
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <Empty title="Loading roles…" />
  if (error) return (
    <Card className="p-6">
      <div className="flex gap-3">
        <AlertTriangle size={18} className="text-bad shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold mb-1">Can't reach the API</p>
          <p className="text-sm text-ink-2 mb-2">{error}</p>
          <p className="text-xs text-ink-3">Start the backend with <code className="bg-subtle px-1 rounded">npm run dev</code> from the repo root.</p>
        </div>
      </div>
    </Card>
  )

  return (
    <div>
      <p className="text-xs text-ink-3 mb-2">Acme Technologies</p>
      <h1 className="text-3xl font-semibold tracking-tight mb-2">Apply</h1>
      <p className="text-ink-2 mb-8">
        Your resume is parsed and scored against the role in real time. You'll see the result immediately.
      </p>

      <Card className="p-6 mb-4">
        <h2 className="font-semibold mb-3">Which role?</h2>
        <div className="space-y-2">
          {jobs!.map(j => (
            <label key={j.id}
              className={`flex gap-3 p-3 rounded border cursor-pointer transition-colors ${
                activeId === j.id ? 'border-brand bg-brand-subtle' : 'border-line hover:border-line-strong'}`}>
              <input type="radio" name="job" className="mt-1 shrink-0"
                checked={activeId === j.id} onChange={() => setJobId(j.id)} />
              <div className="min-w-0">
                <p className="font-semibold text-sm">{j.title}</p>
                <p className="text-xs text-ink-3">{j.dept} · {j.location}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {j.must_haves.slice(0, 3).map(m => <Chip key={m} tone="neutral">{m}</Chip>)}
                </div>
              </div>
            </label>
          ))}
        </div>
      </Card>

      <Card className="p-6 mb-4">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-semibold">Your resume</h2>
          <button onClick={() => setResume(SAMPLE)} className="text-xs text-brand font-semibold">
            Use a sample resume
          </button>
        </div>
        <p className="text-sm text-ink-2 mb-3">
          Paste the text. It gets parsed and scored server-side — no file upload needed for this build.
        </p>
        <textarea
          value={resume} onChange={e => setResume(e.target.value)}
          rows={12} placeholder="Paste your resume text here…"
          className="w-full p-3 text-sm font-mono bg-surface text-ink rounded border border-line-strong
                     placeholder:text-ink-3 focus:border-brand focus:outline-none resize-y leading-relaxed"
        />
        <p className="text-xs text-ink-3 mt-1">{resume.trim().length} characters · at least 40 required</p>
      </Card>

      <Card className="p-6 mb-6 space-y-3">
        <label className="flex gap-3 text-sm cursor-pointer">
          <input type="checkbox" className="mt-0.5 shrink-0" checked={consent} onChange={e => setConsent(e.target.checked)} />
          <span>I understand an AI system will evaluate this application and conduct my interview.</span>
        </label>
        <label className="flex gap-3 text-sm cursor-pointer">
          <input type="checkbox" className="mt-0.5 shrink-0" checked={privacy} onChange={e => setPrivacy(e.target.checked)} />
          <span>I agree to the privacy policy and data processing.</span>
        </label>
      </Card>

      {err && (
        <div className="flex gap-2 p-3 rounded bg-bad-subtle text-sm mb-4">
          <AlertTriangle size={16} className="text-bad shrink-0 mt-0.5" />
          <span>{err}</span>
        </div>
      )}

      <Button size="xl" className="w-full"
        disabled={!consent || !privacy || resume.trim().length < 40 || busy || !activeId}
        onClick={submit}>
        {busy ? <><Sparkles size={16} className="animate-pulse" /> Parsing and scoring…</> : 'Submit application'}
      </Button>
      {!busy && (!consent || !privacy) && (
        <p className="text-xs text-ink-3 text-center mt-2">Both boxes above are required.</p>
      )}
    </div>
  )
}
