import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Chip, PageHead, Table, Tr, Td, Avatar, Score, cx } from '../../ui'
import { candidates, stageTone } from '../../data'
import type { Stage } from '../../data'
import { LayoutGrid, List } from 'lucide-react'

const stages: Stage[] = ['Applied', 'Screened', 'Scheduled', 'Interviewing', 'Reviewed', 'Shortlisted']

export default function Pipeline() {
  const nav = useNavigate()
  const [view, setView] = useState<'board' | 'table'>('board')
  const [sel, setSel] = useState<string[]>([])

  const toggle = (id: string) =>
    setSel(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])

  return (
    <>
      <PageHead crumb="Jobs · Senior Backend Engineer" title="Pipeline" count={candidates.length}
        actions={
          <div className="flex gap-1 p-1 rounded-full bg-subtle">
            {([['board', LayoutGrid], ['table', List]] as const).map(([v, Icon]) => (
              <button key={v} onClick={() => setView(v)}
                className={cx('w-8 h-8 rounded-full flex items-center justify-center',
                  view === v ? 'bg-surface shadow-sm' : 'text-ink-2')}>
                <Icon size={16} />
              </button>
            ))}
          </div>
        } />

      {view === 'board' ? (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {stages.map(st => {
            const items = candidates.filter(c => c.stage === st)
            return (
              <div key={st} className="w-[280px] shrink-0">
                <div className="flex items-center gap-2 h-10 px-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-2">{st}</span>
                  <span className="text-xs text-ink-3">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map(c => (
                    <Card key={c.id} className="p-3 cursor-pointer hover:border-line-strong relative overflow-hidden"
                      onClick={() => nav(`/console/candidate/${c.id}`)}>
                      <span className="absolute left-0 top-0 bottom-0 w-[3px]"
                        style={{ background: st === 'Shortlisted' ? 'var(--color-ok)' : st === 'Interviewing' ? 'var(--color-live)' : 'var(--color-brand)' }} />
                      <div className="flex gap-2.5 mb-2">
                        <Avatar name={c.name} />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{c.name}</p>
                          <p className="text-xs text-ink-3 truncate">{c.title}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        <Chip tone="neutral">ATS {c.ats}</Chip>
                        {c.r1 != null && <Score value={c.r1} label="R1" />}
                        {c.flagged && <Chip tone="bad">Flagged</Chip>}
                      </div>
                      <p className="text-[11px] text-ink-3">{c.applied} · {c.location}</p>
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
          <Table head={['', 'Candidate', 'Stage', 'ATS', 'R1', 'R2', 'Integrity', 'Source', 'Applied']}>
            {candidates.map(c => (
              <Tr key={c.id} onClick={() => nav(`/console/candidate/${c.id}`)}>
                <Td className="w-8">
                  <input type="checkbox" checked={sel.includes(c.id)}
                    onClick={e => e.stopPropagation()}
                    onChange={() => toggle(c.id)} />
                </Td>
                <Td>
                  <div className="flex items-center gap-2.5">
                    <Avatar name={c.name} size={28} />
                    <div><p className="font-semibold">{c.name}</p><p className="text-xs text-ink-3">{c.title}</p></div>
                  </div>
                </Td>
                <Td><Chip tone={stageTone[c.stage]}>{c.stage}</Chip></Td>
                <Td className="tabular-nums font-semibold">{c.ats}</Td>
                <Td><Score value={c.r1} /></Td>
                <Td><Score value={c.r2} /></Td>
                <Td>{c.flagged ? <Chip tone="bad">{c.flagged}</Chip> : <span className="text-ink-3 text-xs">Clean</span>}</Td>
                <Td className="text-xs text-ink-2">{c.source}</Td>
                <Td className="text-xs text-ink-3">{c.applied}</Td>
              </Tr>
            ))}
          </Table>
        </Card>
      )}

      {sel.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-surface border border-line rounded-full shadow-lg px-4 h-12 flex items-center gap-3 z-30">
          <span className="text-sm font-semibold">{sel.length} selected</span>
          <Button size="sm" variant="secondary">Advance</Button>
          <Button size="sm" variant="tertiary">Decline with feedback</Button>
          <button onClick={() => setSel([])} className="text-xs text-ink-3 ml-1">Clear</button>
        </div>
      )}
    </>
  )
}
