import { Link } from 'react-router-dom'
import { Card, CardHead, Button, Chip, PageHead, Empty, Avatar } from '../../ui'
import { api } from '../../api'
import { useAsync } from '../../hooks'

export default function Home() {
  const { data: stats, loading } = useAsync(() => api.stats(), [])
  const { data: events } = useAsync(() => api.events(15), [])
  const { data: health } = useAsync(() => api.health(), [])
  const { data: apps } = useAsync(() => api.applications(), [])

  if (loading) return <Empty title="Loading…" />

  const needsReview = (apps || []).filter(a => a.stage === 'Reviewed')
  const live = (apps || []).filter(a => a.stage === 'Interviewing')

  const tiles = [
    { label: 'Open roles', value: stats?.jobs ?? 0 },
    { label: 'Applications', value: stats?.applications ?? 0 },
    { label: 'Interviews complete', value: stats?.interviews_complete ?? 0 },
    { label: 'Shortlisted', value: stats?.shortlisted ?? 0 },
  ]

  return (
    <>
      <PageHead title="Good morning, Kavya" crumb="Acme Technologies" />

      {health && (
        <Card className={`p-3 mb-4 ${health.ai === 'claude' ? 'bg-ok-subtle border-ok/30' : 'bg-warn-subtle border-warn/30'}`}>
          <p className="text-sm">
            <strong>AI mode: {health.ai}</strong> — {health.note}
          </p>
        </Card>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {tiles.map(t => (
          <Card key={t.label} className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-2">{t.label}</p>
            <p className="text-2xl font-semibold mt-1 tabular-nums">{t.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHead title="Needs you" sub={`${needsReview.length + live.length} items`} />
          <div className="border-t border-line">
            {live.map(a => (
              <div key={a.id} className="flex items-center gap-3 px-4 py-3 border-b border-line">
                <Chip tone="live">live</Chip>
                <Avatar name={a.name} size={28} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{a.name}</p>
                  <p className="text-xs text-ink-3 truncate">Interview in progress · {a.job_title}</p>
                </div>
              </div>
            ))}
            {needsReview.map(a => (
              <div key={a.id} className="flex items-center gap-3 px-4 py-3 border-b border-line last:border-0">
                <Chip tone="eval">reviewed</Chip>
                <Avatar name={a.name} size={28} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{a.name}</p>
                  <p className="text-xs text-ink-3 truncate">Scored and awaiting your decision · {a.job_title}</p>
                </div>
                <Link to={`/console/candidate/${a.id}`}><Button size="sm" variant="secondary">Review</Button></Link>
              </div>
            ))}
            {!needsReview.length && !live.length && (
              <Empty title="Nothing needs you right now"
                body="Run a candidate through the apply flow and scored interviews will land here."
                action={<Link to="/apply"><Button variant="secondary">Open candidate flow</Button></Link>} />
            )}
          </div>
        </Card>

        <Card>
          <CardHead title="Activity" sub="Live event log" />
          <div className="border-t border-line max-h-[420px] overflow-y-auto">
            {(events || []).map(e => (
              <div key={e.id} className="px-4 py-2.5 border-b border-line last:border-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <Chip tone={e.actor_type === 'agent' ? 'brand' : e.actor_type === 'candidate' ? 'eval' : 'neutral'}>
                    {e.actor_type}
                  </Chip>
                  <span className="text-xs font-medium truncate">{e.action}</span>
                </div>
                <p className="text-[11px] text-ink-3">{new Date(e.created_at).toLocaleTimeString()}</p>
              </div>
            ))}
            {!events?.length && <Empty title="No activity yet" />}
          </div>
        </Card>
      </div>
    </>
  )
}
