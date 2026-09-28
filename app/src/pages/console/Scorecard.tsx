import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, CardHead, Button, Chip, Avatar, Score, Empty, cx } from '../../ui'
import { api } from '../../api'
import { useAsync } from '../../hooks'
import { ArrowLeft } from 'lucide-react'

export default function Scorecard() {
  const { id } = useParams()

  const { data: a, loading, error, reload } = useAsync(() => api.application(id!), [id])
  const [busy, setBusy] = useState(false)

  if (loading) return <Empty title="Loading candidate…" />
  if (error || !a) return <Empty title="Candidate not found" body={error || undefined} />

  const scored = a.interviews.filter(i => i.scorecard)
  const latest = scored[scored.length - 1]
  const sc = latest?.scorecard

  async function move(stage: string) {
    setBusy(true)
    try { await api.setStage(a!.id, stage, 'Manual decision from Console'); reload() }
    finally { setBusy(false) }
  }

  return (
    <>
      <Link to="/console/pipeline" className="inline-flex items-center gap-1 text-sm text-ink-2 mb-4 hover:text-ink">
        <ArrowLeft size={14} /> Pipeline
      </Link>

      <div className="flex items-start gap-4 mb-6 flex-wrap">
        <Avatar name={a.name} size={56} />
        <div className="flex-1 min-w-[240px]">
          <h1 className="text-2xl font-semibold">{a.name}</h1>
          <p className="text-sm text-ink-2">{a.current_title} · {a.location || '—'}</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <Chip tone={a.stage === 'Shortlisted' ? 'ok' : a.stage === 'Declined' ? 'neutral' : 'brand'}>{a.stage}</Chip>
            <Chip tone="neutral">ATS {a.ats_score}</Chip>
            <Chip tone="neutral">{a.years_experience} yrs</Chip>
            {sc && <Chip tone={sc.recommendation === 'Advance' ? 'ok' : sc.recommendation === 'Decline' ? 'neutral' : 'warn'}>{sc.recommendation}</Chip>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="danger" disabled={busy} onClick={() => move('Declined')}>Decline</Button>
          <Button disabled={busy} onClick={() => move('Shortlisted')}>Shortlist</Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHead title="Screening" sub={`Scored ${a.ats_score}/100 against ${a.job_title}`} />
            <div className="border-t border-line p-4">
              <p className="text-sm text-ink-2 leading-relaxed mb-4">{a.ats_reasoning}</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-ink-2 mb-1.5">Matched</p>
                  <ul className="space-y-1">
                    {a.ats_matched.map(m => <li key={m} className="text-xs text-ink-2 flex gap-2"><span className="text-ok">·</span>{m}</li>)}
                    {!a.ats_matched.length && <li className="text-xs text-ink-3">None recorded</li>}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-ink-2 mb-1.5">Gaps</p>
                  <ul className="space-y-1">
                    {a.ats_gaps.map(m => <li key={m} className="text-xs text-ink-2 flex gap-2"><span className="text-warn">·</span>{m}</li>)}
                    {!a.ats_gaps.length && <li className="text-xs text-ink-3">None</li>}
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          {sc ? (
            <>
              <Card>
                <CardHead title={`Round ${latest.round} · ${latest.round_name}`}
                  sub={`Overall ${sc.overall} · threshold ${a.threshold}`}
                  action={<Score value={sc.overall} />} />
                <div className="border-t border-line p-4 space-y-4">
                  {sc.scores.map(s => (
                    <div key={s.competency}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium">{s.competency}</span>
                        <Score value={s.score} />
                      </div>
                      {s.score != null && (
                        <div className="relative h-2 rounded-full bg-subtle overflow-hidden mb-2">
                          <div className="h-full rounded-full bg-brand" style={{ width: `${(s.score / 5) * 100}%` }} />
                          <span className="absolute top-0 bottom-0 w-0.5 bg-ink-3" style={{ left: `${(a.threshold / 5) * 100}%` }} />
                        </div>
                      )}
                      <p className="text-xs text-ink-2 leading-relaxed">{s.evidence}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-line p-4 text-xs text-ink-3">
                  Rubric threshold {a.threshold} · scored by {sc.model} · {sc.generated_by} · {new Date(sc.created_at).toLocaleString()}
                </div>
              </Card>

              <Card>
                <CardHead title="Transcript" sub={`${latest.transcript.length} turns`} />
                <div className="border-t border-line p-4 space-y-3 max-h-96 overflow-y-auto">
                  {latest.transcript.map((t, i) => (
                    <div key={i} className="flex gap-3 text-sm">
                      <span className="font-mono text-xs text-ink-3 shrink-0 pt-0.5 w-10">{t.t || '—'}</span>
                      <div>
                        <span className={cx('text-xs font-semibold', t.who === 'ai' ? 'text-ink-3' : 'text-brand')}>
                          {t.who === 'ai' ? 'Aria' : a.name}
                        </span>
                        <p className={t.who === 'ai' ? 'text-ink-2' : 'text-ink'}>{t.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          ) : (
            <Card><Empty title="No interview scored yet"
              body={a.interviews.length ? `Round ${a.interviews[0].round} is ${a.interviews[0].status.toLowerCase()}.` : 'No interview has been created.'} /></Card>
          )}
        </div>

        <div className="space-y-4">
          {sc && (
            <>
              <Card>
                <CardHead title="Strengths" />
                <ul className="border-t border-line p-4 space-y-2.5">
                  {sc.strengths.map((s, i) => <li key={i} className="text-sm text-ink-2 leading-relaxed flex gap-2"><span className="text-ok mt-0.5">·</span>{s}</li>)}
                </ul>
              </Card>
              <Card>
                <CardHead title="Concerns" />
                <ul className="border-t border-line p-4 space-y-2.5">
                  {sc.concerns.map((s, i) => <li key={i} className="text-sm text-ink-2 leading-relaxed flex gap-2"><span className="text-warn mt-0.5">·</span>{s}</li>)}
                </ul>
              </Card>
            </>
          )}

          <Card>
            <CardHead title="Profile" />
            <div className="border-t border-line p-4 text-sm space-y-2">
              {[['Email', a.email], ['Phone', a.phone], ['Location', a.location],
                ['Experience', `${a.years_experience} yrs`], ['Source', a.source]].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <span className="text-ink-2 shrink-0">{k}</span>
                  <span className="font-medium text-right truncate">{v || '—'}</span>
                </div>
              ))}
              <div className="pt-2">
                <p className="text-ink-2 mb-1.5">Skills</p>
                <div className="flex flex-wrap gap-1">
                  {a.skills.map(s => <Chip key={s} tone="brand">{s}</Chip>)}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <CardHead title="Rounds" />
            <div className="border-t border-line p-4 space-y-2">
              {a.interviews.map(iv => (
                <div key={iv.id} className="flex items-center justify-between text-sm">
                  <span className="text-ink-2">R{iv.round} · {iv.round_name}</span>
                  {iv.scorecard ? <Score value={iv.scorecard.overall} /> : <Chip tone="neutral">{iv.status}</Chip>}
                </div>
              ))}
              {!a.interviews.length && <p className="text-sm text-ink-3">None</p>}
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
