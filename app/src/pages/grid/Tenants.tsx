import { useNavigate } from 'react-router-dom'
import { Card, Button, Chip, PageHead, Table, Tr, Td, cx } from '../../ui'
import { tenants } from '../../data'
import type { Tone } from '../../ui'

const stateTone: Record<string, Tone> = {
  Active: 'ok', Trial: 'brand', 'Past due': 'bad', Suspended: 'bad', Churned: 'neutral',
}

export default function Tenants() {
  const nav = useNavigate()
  return (
    <>
      <PageHead crumb="Operate" title="Tenants" count={tenants.length}
        actions={<><Button variant="tertiary">Export</Button><Button>New tenant</Button></>} />

      <Card>
        <Table head={['Tenant', 'Tier', 'State', 'Health', 'MRR', 'Interviews', 'Quota', 'Margin', 'Region', 'CSM']}>
          {tenants.map(t => {
            const pct = (t.interviews / t.quota) * 100
            return (
              <Tr key={t.id} onClick={() => nav(`/grid/tenants/${t.id}`)}>
                <Td>
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-xs text-ink-3">{t.domain}</p>
                </Td>
                <Td><Chip tone={t.tier === 'Enterprise' ? 'eval' : t.tier === 'Starter' ? 'neutral' : 'brand'}>{t.tier}</Chip></Td>
                <Td><Chip tone={stateTone[t.state]}>{t.state}</Chip></Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <span className={cx('w-2 h-2 rounded-full',
                      t.health >= 75 ? 'bg-ok' : t.health >= 50 ? 'bg-warn' : 'bg-bad')} />
                    <span className="tabular-nums font-semibold">{t.health}</span>
                  </div>
                </Td>
                <Td className="tabular-nums">{t.mrr ? `$${t.mrr.toLocaleString()}` : '—'}</Td>
                <Td className="tabular-nums">{t.interviews}</Td>
                <Td>
                  <div className="w-20 h-1.5 rounded-full bg-subtle overflow-hidden">
                    <div className="h-full rounded-full" style={{
                      width: `${Math.min(100, pct)}%`,
                      background: pct >= 95 ? 'var(--color-bad)' : pct >= 80 ? 'var(--color-warn)' : 'var(--color-brand)',
                    }} />
                  </div>
                </Td>
                <Td>
                  <span className={cx('tabular-nums font-semibold',
                    t.margin >= 65 ? 'text-ok' : t.margin >= 45 ? 'text-warn' : 'text-bad')}>
                    {t.margin}%
                  </span>
                </Td>
                <Td className="text-xs font-mono text-ink-2">{t.region}</Td>
                <Td className="text-xs">{t.csm}</Td>
              </Tr>
            )
          })}
        </Table>
      </Card>
    </>
  )
}
