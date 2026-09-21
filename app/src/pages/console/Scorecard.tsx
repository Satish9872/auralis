import { useParams, Link } from 'react-router-dom'
import { Card, CardHead, Button, Chip, Avatar, Score, Empty, cx } from '../../ui'
import { candidates, transcript } from '../../data'
import { Play, ArrowLeft, ChevronRight } from 'lucide-react'

export default function Scorecard() {
  const { id } = useParams()
  const c = candidates.find(x => x.id === id)
  if (!c) return <Empty title="Candidate not found" />

  const assessed = c.competencies.filter(k => k.score != null)
  const notAssessed = c.competencies.filter(k => k.score == null)
  const recTone = c.recommendation === 'Advance' ? 'ok' : c.recommendation === 'Decline' ? 'neutral' : 'warn'

  return (
    <>
      <Link to="/console/pipeline" className="inline-flex items-center gap-1 text-sm text-ink-2 mb-4 hover:text-ink">
        <ArrowLeft size={14} /> Pipeline
      </Link>

      {/* header */}
      <div className="flex items-start gap-4 mb-6">
        <Avatar name={c.name} size={56} />
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold">{c.name}</h1>
          <p className="text-sm text-ink-2">{c.title} · {c.location}</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <Chip tone={recTone}>{c.recommendation}</Chip>
            <Chip tone="neutral">ATS {c.ats}</Chip>
            {c.flagged && <Chip tone="bad">{c.flagged}</Chip>}
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="tertiary">Message</Button>
          <Button variant="danger">Decline</Button>
          <Button>Advance to Round 2</Button>
        </div>
      </div>

      {!c.competencies.length ? (
        <Card><Empty title="Interview in progress" body="Scores appear once the round completes and evaluation finishes." /></Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            {/* competencies */}
            <Card>
              <CardHead title="Competency scores" sub="Round 1 · Technical screen · 45 min" />
              <div className="border-t border-line p-4 space-y-4">
                {assessed.map(k => (
                  <div key={k.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium">{k.name}</span>
                      <Score value={k.score} />
                    </div>
                    <div className="relative h-2 rounded-full bg-subtle overflow-hidden mb-2">
                      <div className="h-full rounded-full bg-brand" style={{ width: `${(k.score! / 5) * 100}%` }} />
                      <span className="absolute top-0 bottom-0 w-0.5 bg-ink-3" style={{ left: '70%' }} title="Role bar" />
                    </div>
                    <p className="text-xs text-ink-2 leading-relaxed">{k.evidence}</p>
                    <button className="text-xs text-brand font-semibold mt-1 inline-flex items-center gap-1">
                      <Play size={10} /> Play from {k.ts}
                    </button>
                  </div>
                ))}
                {notAssessed.length > 0 && (
                  <div className="pt-2 border-t border-line">
                    <p className="text-xs text-ink-2">
                      <strong>Not assessed:</strong> {notAssessed.map(k => k.name).join(', ')} — the round ran
                      out of time before these were reached.
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* transcript */}
            <Card>
              <CardHead title="Transcript" sub="Full conversation, timestamped" />
              <div className="border-t border-line p-4 space-y-3 max-h-[380px] overflow-y-auto">
                {transcript.map((t, i) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <span className="font-mono text-xs text-ink-3 shrink-0 pt-0.5 w-10">{t.t}</span>
                    <div>
                      <span className={cx('text-xs font-semibold', t.who === 'Aria' ? 'text-ink-3' : 'text-brand')}>{t.who}</span>
                      <p className={cx('leading-relaxed', t.who === 'Aria' ? 'text-ink-2' : 'text-ink')}>{t.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHead title="Strengths" />
              <ul className="border-t border-line p-4 space-y-2.5">
                {c.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-ink-2 leading-relaxed flex gap-2">
                    <span className="text-ok mt-0.5">·</span>{s}
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <CardHead title="Concerns" />
              <ul className="border-t border-line p-4 space-y-2.5">
                {c.concerns.map((s, i) => (
                  <li key={i} className="text-sm text-ink-2 leading-relaxed flex gap-2">
                    <span className="text-warn mt-0.5">·</span>{s}
                  </li>
                ))}
              </ul>
            </Card>

            {c.flagged && (
              <Card className="border-warn/40">
                <CardHead title="Integrity notes" />
                <div className="border-t border-line p-4">
                  <Chip tone="warn">{c.flagged}</Chip>
                  <p className="text-xs text-ink-2 leading-relaxed mt-3">
                    These signals are informational. <strong>They did not affect the competency
                    scores above.</strong> A human should review before any decision.
                  </p>
                </div>
              </Card>
            )}

            <Card>
              <div className="p-4 text-xs text-ink-3 space-y-1">
                <p>Rubric <code>v2.1</code> · Model <code>claude-opus-5</code></p>
                <p>Prompt <code>eval-v14</code> · Scored 21 Sep, 15:07 IST</p>
                <button className="text-brand font-semibold mt-2 inline-flex items-center gap-1">
                  Report an issue with this evaluation <ChevronRight size={12} />
                </button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </>
  )
}
