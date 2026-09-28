import { useNavigate } from 'react-router-dom'
import { Card, Button, Chip, PageHead, Table, Tr, Td, Avatar, Empty } from '../../ui'
import { api } from '../../api'
import { useAsync } from '../../hooks'
import type { Tone } from '../../ui'

const statusTone: Record<string, Tone> = { Open: 'ok', Paused: 'warn', Draft: 'neutral', Closed: 'neutral' }

export default function Jobs() {
  const nav = useNavigate()
  const { data: jobs, loading, error } = useAsync(() => api.jobs(), [])

  if (loading) return <Empty title="Loading jobs…" />
  if (error) return <Empty title="Couldn't load jobs" body={error} />

  return (
    <>
      <PageHead crumb="Acme Technologies" title="Jobs" count={jobs!.length}
        actions={<Button onClick={() => nav('/console/pipeline')}>View pipeline</Button>} />

      <Card>
        <Table head={['Job', 'Status', 'Pipeline', 'Applied', 'Screened', 'Interviewed', 'Shortlisted', 'Owner']}>
          {jobs!.map(j => {
            const c = j.counts!
            const total = c.applied || 1
            return (
              <Tr key={j.id} onClick={() => nav(`/console/pipeline?job=${j.id}`)}>
                <Td>
                  <p className="font-semibold">{j.title}</p>
                  <p className="text-xs text-ink-3">{j.dept} · {j.location}</p>
                </Td>
                <Td><Chip tone={statusTone[j.status] || 'neutral'}>{j.status}</Chip></Td>
                <Td>
                  <div className="flex h-2 w-32 rounded-full overflow-hidden bg-subtle">
                    {[
                      { n: c.applied - c.screened, c: 'var(--color-line-strong)' },
                      { n: c.screened - c.interviewed, c: 'var(--color-brand)' },
                      { n: c.interviewed - c.shortlisted, c: '#7A5AF8' },
                      { n: c.shortlisted, c: 'var(--color-ok)' },
                    ].map((s, i) => (
                      <span key={i} style={{ width: `${Math.max(0, (s.n / total) * 100)}%`, background: s.c }} />
                    ))}
                  </div>
                </Td>
                <Td className="tabular-nums">{c.applied}</Td>
                <Td className="tabular-nums">{c.screened}</Td>
                <Td className="tabular-nums">{c.interviewed}</Td>
                <Td className="tabular-nums">
                  {c.shortlisted > 0 ? <span className="font-semibold text-ok">{c.shortlisted}</span> : '—'}
                </Td>
                <Td><div className="flex items-center gap-2"><Avatar name={j.owner} size={24} /><span className="text-xs">{j.owner}</span></div></Td>
              </Tr>
            )
          })}
        </Table>
      </Card>

      <p className="text-xs text-ink-3 mt-4">
        Counts are computed live from the applications table — apply through the candidate flow and they move.
      </p>
    </>
  )
}
