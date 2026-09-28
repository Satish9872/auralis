import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card, Button, Chip, PageHead, Table, Tr, Td, Avatar, Score, Empty, cx } from '../../ui'
import { api } from '../../api'
import { useAsync } from '../../hooks'
import { LayoutGrid, List, RefreshCw } from 'lucide-react'
import type { Tone } from '../../ui'

const STAGES = ['Applied', 'Screened', 'Scheduled', 'Interviewing', 'Reviewed', 'Shortlisted', 'Declined']
const tone: Record<string, Tone> = {
  Applied: 'neutral', Screened: 'brand', Scheduled: 'brand', Interviewing: 'live',
  Reviewed: 'eval', Shortlisted: 'ok', Declined: 'neutral',
}

export default function Pipeline() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const jobId = params.get('job') || undefined
  const [view, setView] = useState<'board' | 'table'>('board')
  const { data: rows, loading, error, reload } = useAsync(() => api.applications({ job_id: jobId }), [jobId])

  if (loading) return <Empty title="Loading candidates…" />
  if (error) return <Empty title="Couldn't load candidates" body={error} />

  if (!rows!.length) return (
    <>
      <PageHead crumb="Candidates" title="Pipeline" />
      <Card>
        <Empty
          title="No applications yet"
          body="Nothing has come through this job. Submit one through the candidate flow and it appears here immediately — parsed, scored and staged."
          action={<Button onClick={() => nav('/apply')}>Open the candidate flow</Button>}
        />
      </Card>
    </>
  )

  return (
    <>
      <PageHead crumb="Candidates" title="Pipeline" count={rows!.length}
        actions={<>
          <Button variant="tertiary" onClick={reload}><RefreshCw size={14} /> Refresh</Button>
          <div className="flex gap-1 p-1 rounded-full bg-subtle">
            {([['board', LayoutGrid], ['table', List]] as const).map(([v, Icon]) => (
              <button key={v} onClick={() => setView(v)}
                className={cx('w-8 h-8 rounded-full flex items-center justify-center',
                  view === v ? 'bg-surface shadow-sm' : 'text-ink-2')}>
                <Icon size={16} />
              </button>
            ))}
          </div>
        </>} />

      {view === 'board' ? (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {STAGES.map(st => {
            const items = rows!.filter(r => r.stage === st)
            return (
              <div key={st} className="w-[280px] shrink-0">
                <div className="flex items-center gap-2 h-10 px-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-2">{st}</span>
                  <span className="text-xs text-ink-3">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map(r => (
                    <Card key={r.id} className="p-3 relative overflow-hidden hover:border-line-strong"
                      onClick={() => nav(`/console/candidate/${r.id}`)}>
                      <span className="absolute left-0 top-0 bottom-0 w-[3px]" style={{
                        background: st === 'Shortlisted' ? 'var(--color-ok)'
                          : st === 'Interviewing' ? 'var(--color-live)'
                          : st === 'Declined' ? 'var(--color-neutral)' : 'var(--color-brand)',
                      }} />
                      <div className="flex gap-2.5 mb-2">
                        <Avatar name={r.name} />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{r.name}</p>
                          <p className="text-xs text-ink-3 truncate">{r.current_title}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        <Chip tone="neutral">ATS {r.ats_score}</Chip>
                        {r.scores.map(s => <Score key={s.round} value={s.overall} label={`R${s.round}`} />)}
                      </div>
                      <p className="text-[11px] text-ink-3">{r.location || '—'} · {r.job_title}</p>
                    </Card>
                  ))}
                  {!items.length && <p className="text-xs text-ink-3 px-1 py-4">Nothing here yet</p>}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <Card>
          <Table head={['Candidate', 'Job', 'Stage', 'ATS', 'Rounds', 'Source', 'Applied']}>
            {rows!.map(r => (
              <Tr key={r.id} onClick={() => nav(`/console/candidate/${r.id}`)}>
                <Td>
                  <div className="flex items-center gap-2.5">
                    <Avatar name={r.name} size={28} />
                    <div><p className="font-semibold">{r.name}</p><p className="text-xs text-ink-3">{r.current_title}</p></div>
                  </div>
                </Td>
                <Td className="text-xs">{r.job_title}</Td>
                <Td><Chip tone={tone[r.stage] || 'neutral'}>{r.stage}</Chip></Td>
                <Td className="tabular-nums font-semibold">{r.ats_score}</Td>
                <Td><div className="flex gap-1">{r.scores.map(s => <Score key={s.round} value={s.overall} />)}</div></Td>
                <Td className="text-xs text-ink-2">{r.source}</Td>
                <Td className="text-xs text-ink-3">{new Date(r.created_at).toLocaleDateString()}</Td>
              </Tr>
            ))}
          </Table>
        </Card>
      )}
    </>
  )
}
