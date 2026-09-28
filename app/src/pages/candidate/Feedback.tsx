import { Link, useSearchParams } from 'react-router-dom'
import { Card, Button, Chip, Empty, Score } from '../../ui'
import { api } from '../../api'
import { useAsync } from '../../hooks'

export default function Feedback() {
  const [params] = useSearchParams()
  const interviewId = params.get('interview') || ''
  const { data: iv, loading, error } = useAsync(() => api.interview(interviewId), [interviewId])

  if (!interviewId) return <Empty title="No interview specified" />
  if (loading) return <Empty title="Loading your result…" />
  if (error || !iv) return <Empty title="Not found" body={error || undefined} />
  if (!iv.scorecard) return (
    <Empty title="Still being evaluated"
      body="Your interview has finished and is being scored. Check back shortly."
      action={<Link to="/status"><Button variant="secondary">Back to my application</Button></Link>} />
  )

  const sc = iv.scorecard
  const advanced = sc.recommendation === 'Advance'

  return (
    <div>
      <p className="text-xs text-ink-3 mb-2">Round {iv.round} · {iv.round_name}</p>

      <Card className={`p-6 mb-4 ${advanced ? 'bg-ok-subtle border-ok/30' : ''}`}>
        <Chip tone={advanced ? 'ok' : sc.recommendation === 'Borderline' ? 'warn' : 'neutral'}>
          {sc.recommendation}
        </Chip>
        <h1 className="text-2xl font-semibold mt-3 mb-2">
          {advanced ? "You're through to the next round"
            : sc.recommendation === 'Borderline' ? 'Your interview is under review'
            : "We're not moving forward after this round"}
        </h1>
        <p className="text-ink-2 leading-relaxed">{sc.feedback}</p>
      </Card>

      <Card className="p-6 mb-4">
        <h2 className="font-semibold mb-4">How you were scored</h2>
        <div className="space-y-4">
          {sc.scores.map(s => (
            <div key={s.competency}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium">{s.competency}</span>
                <Score value={s.score} />
              </div>
              {s.score != null && (
                <div className="h-2 rounded-full bg-subtle overflow-hidden mb-2">
                  <div className="h-full rounded-full bg-brand" style={{ width: `${(s.score / 5) * 100}%` }} />
                </div>
              )}
              <p className="text-xs text-ink-2 leading-relaxed">{s.evidence}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-3">What was strong</h3>
          <ul className="space-y-2">
            {sc.strengths.map((s, i) => (
              <li key={i} className="text-sm text-ink-2 leading-relaxed flex gap-2"><span className="text-ok">·</span>{s}</li>
            ))}
          </ul>
        </Card>
        <Card className="p-6">
          <h3 className="font-semibold mb-3">Where the gaps were</h3>
          <ul className="space-y-2">
            {sc.concerns.map((s, i) => (
              <li key={i} className="text-sm text-ink-2 leading-relaxed flex gap-2"><span className="text-warn">·</span>{s}</li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="p-6 mb-6">
        <h3 className="font-semibold mb-3">Your transcript</h3>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {iv.transcript.map((t, i) => (
            <div key={i} className="text-sm">
              <span className="text-xs font-semibold text-ink-3">{t.who === 'ai' ? 'Aria' : 'You'}</span>
              <p className={t.who === 'ai' ? 'text-ink-2' : 'text-ink'}>{t.text}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex flex-wrap gap-2 mb-6">
        <Button variant="secondary">Request a human review</Button>
        <Link to="/status"><Button variant="tertiary">Back to my application</Button></Link>
      </div>

      <p className="text-xs text-ink-3">
        Scored by {sc.model} · {sc.generated_by} · {new Date(sc.created_at).toLocaleString()}
      </p>
    </div>
  )
}
