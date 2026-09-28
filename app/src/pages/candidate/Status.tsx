import { Link, useSearchParams } from 'react-router-dom'
import { Card, Button, Chip, Empty } from '../../ui'
import { api } from '../../api'
import { useAsync } from '../../hooks'
import { Check, Calendar, Circle, Play } from 'lucide-react'

export default function Status() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const { data: app, loading, error } = useAsync(() => api.track(token), [token])

  if (!token) return <Empty title="No application token" body="Apply first to get a tracking link." action={<Link to="/apply"><Button>Apply</Button></Link>} />
  if (loading) return <Empty title="Loading your application…" />
  if (error || !app) return <Empty title="Application not found" body={error || undefined} />

  const declined = app.stage === 'Declined'
  const next = app.interviews.find(i => i.status === 'Awaiting scheduling')
  const inProgress = app.interviews.find(i => i.status === 'In progress')
  const scheduled = app.interviews.find(i => i.status === 'Scheduled')
  const lastDone = [...app.interviews].reverse().find(i => i.scorecard)

  return (
    <div>
      <p className="text-xs text-ink-3 mb-2">Acme Technologies</p>
      <h1 className="text-2xl font-semibold tracking-tight mb-6">{app.job_title}</h1>

      <Card className={`p-6 mb-4 ${declined ? '' : 'bg-ok-subtle border-ok/30'}`}>
        <Chip tone={declined ? 'neutral' : 'ok'}>{app.stage}</Chip>
        <h2 className="text-xl font-semibold mt-3 mb-2">
          {declined ? 'Not moving forward this time' : 'Your application is progressing'}
        </h2>
        <p className="text-ink-2 leading-relaxed">{app.ats_reasoning}</p>
      </Card>

      <Card className="p-6 mb-4">
        <h3 className="font-semibold mb-3">Screening result</h3>
        <div className="flex items-baseline gap-3 mb-4">
          <span className="text-3xl font-semibold tabular-nums">{app.ats_score}</span>
          <span className="text-sm text-ink-2">out of 100 · 70 meets the bar</span>
        </div>
        {app.ats_matched.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-ink-2 mb-1.5">What matched</p>
            <ul className="space-y-1">
              {app.ats_matched.map(m => (
                <li key={m} className="text-sm text-ink-2 flex gap-2"><span className="text-ok">·</span>{m}</li>
              ))}
            </ul>
          </div>
        )}
        {app.ats_gaps.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-ink-2 mb-1.5">What was missing</p>
            <ul className="space-y-1">
              {app.ats_gaps.map(m => (
                <li key={m} className="text-sm text-ink-2 flex gap-2"><span className="text-warn">·</span>{m}</li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {(next || scheduled || inProgress) && (
        <Card className="p-6 mb-6">
          {inProgress ? (
            <>
              <h3 className="font-semibold mb-1">Your interview is in progress</h3>
              <p className="text-sm text-ink-2 mb-4">Round {inProgress.round} · {inProgress.round_name}</p>
              <Link to={`/room?interview=${inProgress.id}`}>
                <Button size="lg"><Play size={16} /> Rejoin the interview</Button>
              </Link>
            </>
          ) : scheduled ? (
            <>
              <h3 className="font-semibold mb-1">Interview booked</h3>
              <p className="text-sm text-ink-2 mb-4">
                {new Date(scheduled.scheduled_at!).toLocaleString(undefined, {
                  weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
                })} · Round {scheduled.round}, {scheduled.round_name}
              </p>
              <Link to={`/ready?interview=${scheduled.id}`}>
                <Button size="lg">Start the interview now</Button>
              </Link>
              <p className="text-xs text-ink-3 mt-2">
                In production this unlocks at the booked time. Here you can start immediately for testing.
              </p>
            </>
          ) : (
            <>
              <h3 className="font-semibold mb-1">Choose your interview time</h3>
              <p className="text-sm text-ink-2 mb-4">
                Round {next!.round} · {next!.round_name} · assessing {app.competencies.join(', ')}
              </p>
              <Link to={`/schedule?interview=${next!.id}&job=${app.job_id}`}>
                <Button size="lg">Choose your time</Button>
              </Link>
            </>
          )}
        </Card>
      )}

      {lastDone?.scorecard && (
        <Card className="p-6 mb-6">
          <h3 className="font-semibold mb-3">Feedback from Round {lastDone.round}</h3>
          <p className="text-ink-2 leading-relaxed mb-4">{lastDone.scorecard.feedback}</p>
          <Link to={`/feedback?interview=${lastDone.id}`}>
            <Button variant="secondary">See the full feedback</Button>
          </Link>
        </Card>
      )}

      <Card className="p-6 mb-4">
        <h3 className="font-semibold mb-5">Your progress</h3>
        <ol>
          {[
            { name: 'Application received', sub: new Date(app.created_at).toLocaleString(), state: 'done' as const },
            { name: 'Resume review', sub: `Scored ${app.ats_score}/100`, state: 'done' as const },
            ...app.interviews.map(iv => ({
              name: `Round ${iv.round} · ${iv.round_name}`,
              sub: iv.scorecard
                ? `${iv.scorecard.recommendation} · scored ${iv.scorecard.overall}`
                : iv.status,
              state: iv.scorecard ? 'done' as const
                : iv.status === 'In progress' ? 'current' as const
                : iv.status === 'Scheduled' ? 'sched' as const : 'upcoming' as const,
            })),
          ].map((s, i, arr) => {
            const last = i === arr.length - 1
            return (
              <li key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    s.state === 'done' ? 'bg-ok text-white'
                    : s.state === 'current' ? 'ring-2 ring-brand'
                    : s.state === 'sched' ? 'ring-2 ring-brand text-brand'
                    : 'ring-2 ring-line-strong'}`}>
                    {s.state === 'done' ? <Check size={14} />
                      : s.state === 'current' ? <span className="live-dot w-2 h-2 rounded-full bg-brand" />
                      : s.state === 'sched' ? <Calendar size={13} />
                      : <Circle size={7} className="text-ink-3 fill-current" />}
                  </span>
                  {!last && <span className={`w-0.5 flex-1 my-1 ${s.state === 'done' ? 'bg-ok' : 'bg-line'}`} style={{ minHeight: 24 }} />}
                </div>
                <div className={last ? '' : 'pb-6'}>
                  <p className={`text-sm ${s.state === 'upcoming' ? 'text-ink-3' : 'font-medium'}`}>{s.name}</p>
                  <p className="text-xs text-ink-3 mt-0.5">{s.sub}</p>
                </div>
              </li>
            )
          })}
        </ol>
      </Card>

      <p className="text-xs text-ink-3">Application {app.id} · token {app.token}</p>
    </div>
  )
}
