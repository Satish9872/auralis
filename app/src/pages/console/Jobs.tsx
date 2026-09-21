import { Card, Button, Chip, PageHead, Table, Tr, Td, Avatar } from '../../ui'
import { jobs } from '../../data'
import type { Tone } from '../../ui'

const statusTone: Record<string, Tone> = { Open: 'ok', Paused: 'warn', Draft: 'neutral', Closed: 'neutral' }

export default function Jobs() {
  return (
    <>
      <PageHead crumb="Acme Technologies" title="Jobs" count={jobs.length}
        actions={<>
          <Button variant="tertiary">Import from ATS</Button>
          <Button>New job</Button>
        </>} />

      <Card>
        <Table head={['Job', 'Status', 'Pipeline', 'Applied', 'Interviewed', 'Shortlisted', 'Open', 'Owner']}>
          {jobs.map(j => {
            const total = j.applied || 1
            return (
              <Tr key={j.id} onClick={() => {}}>
                <Td>
                  <p className="font-semibold">{j.title}</p>
                  <p className="text-xs text-ink-3">{j.dept} · {j.loc}</p>
                </Td>
                <Td><Chip tone={statusTone[j.status]}>{j.status}</Chip></Td>
                <Td>
                  <div className="flex h-2 w-32 rounded-full overflow-hidden bg-subtle">
                    {[
                      { n: j.applied - j.screened, c: 'var(--color-line-strong)' },
                      { n: j.screened - j.interviewed, c: 'var(--color-brand)' },
                      { n: j.interviewed - j.shortlisted, c: '#7A5AF8' },
                      { n: j.shortlisted, c: 'var(--color-ok)' },
                    ].map((s, i) => (
                      <span key={i} style={{ width: `${(s.n / total) * 100}%`, background: s.c }} />
                    ))}
                  </div>
                </Td>
                <Td className="tabular-nums">{j.applied}</Td>
                <Td className="tabular-nums">{j.interviewed}</Td>
                <Td className="tabular-nums">
                  {j.shortlisted > 0 ? <span className="font-semibold text-ok">{j.shortlisted}</span> : '—'}
                </Td>
                <Td className="tabular-nums">
                  <span className={j.days > 30 ? 'text-warn font-semibold' : ''}>{j.days > 0 ? `${j.days}d` : '—'}</span>
                </Td>
                <Td><div className="flex items-center gap-2"><Avatar name={j.owner} size={24} /><span className="text-xs">{j.owner}</span></div></Td>
              </Tr>
            )
          })}
        </Table>
      </Card>
    </>
  )
}
