import { useNavigate } from 'react-router-dom'
import { Card, Button, Chip, PageHead, Table, Tr, Td, Empty } from '../../ui'
import { api } from '../../api'
import { useAsync } from '../../hooks'
import type { Tone } from '../../ui'

const stateTone: Record<string, Tone> = {
  Active: 'ok', Trial: 'brand', 'Past due': 'bad', Suspended: 'bad', Churned: 'neutral',
}

export default function Tenants() {
  const nav = useNavigate()
  const { data: tenants, loading, error } = useAsync(() => api.tenants(), [])

  if (loading) return <Empty title="Loading tenants…" />
  if (error) return <Empty title="Couldn't load tenants" body={error} />

  return (
    <>
      <PageHead crumb="Operate" title="Tenants" count={tenants!.length}
        actions={<Button variant="tertiary">Export</Button>} />

      <Card>
        <Table head={['Tenant', 'Tier', 'State', 'MRR', 'Interviews', 'Quota', 'Region']}>
          {tenants!.map(t => {
            const pct = (t.used_interviews / t.quota_interviews) * 100
            return (
              <Tr key={t.id} onClick={() => nav(`/grid/tenants/${t.id}`)}>
                <Td>
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-xs text-ink-3">{t.domain}</p>
                </Td>
                <Td><Chip tone={t.tier === 'Enterprise' ? 'eval' : t.tier === 'Starter' ? 'neutral' : 'brand'}>{t.tier}</Chip></Td>
                <Td><Chip tone={stateTone[t.state] || 'neutral'}>{t.state}</Chip></Td>
                <Td className="tabular-nums">{t.mrr ? `$${t.mrr.toLocaleString()}` : '—'}</Td>
                <Td className="tabular-nums">{t.used_interviews}</Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 rounded-full bg-subtle overflow-hidden">
                      <div className="h-full rounded-full" style={{
                        width: `${Math.min(100, pct)}%`,
                        background: pct >= 95 ? 'var(--color-bad)' : pct >= 80 ? 'var(--color-warn)' : 'var(--color-brand)',
                      }} />
                    </div>
                    <span className="text-xs text-ink-3 tabular-nums">{t.quota_interviews}</span>
                  </div>
                </Td>
                <Td className="text-xs font-mono text-ink-2">{t.region}</Td>
              </Tr>
            )
          })}
        </Table>
      </Card>

      <p className="text-xs text-ink-3 mt-4">
        Acme's interview count is computed live from completed interviews in the database.
      </p>
    </>
  )
}
