import { useParams, Link } from 'react-router-dom'
import { Card, CardHead, Button, Chip, Meter, Empty } from '../../ui'
import { tenants } from '../../data'
import { ArrowLeft, AlertTriangle } from 'lucide-react'

const cogs = [
  { k: 'Reasoning', v: 1.42 }, { k: 'STT', v: 0.31 }, { k: 'TTS', v: 0.28 },
  { k: 'Media', v: 0.54 }, { k: 'Compute', v: 0.39 }, { k: 'Storage', v: 0.08 },
]
const colors = ['#0A66C2', '#1E4D8C', '#7A5AF8', '#01754F', '#915907', '#5E5E5E']

export default function Tenant360() {
  const { id } = useParams()
  const t = tenants.find(x => x.id === id)
  if (!t) return <Empty title="Tenant not found" />

  const total = cogs.reduce((a, c) => a + c.v, 0)
  const lowMargin = t.margin < 45

  return (
    <>
      <Link to="/grid/tenants" className="inline-flex items-center gap-1 text-sm text-ink-2 mb-4 hover:text-ink">
        <ArrowLeft size={14} /> Tenants
      </Link>

      <div className="flex items-start gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">{t.name}</h1>
          <p className="text-sm text-ink-2 font-mono">{t.domain} · {t.id}</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <Chip tone="brand">{t.tier}</Chip>
            <Chip tone={t.state === 'Active' ? 'ok' : t.state === 'Trial' ? 'brand' : 'bad'}>{t.state}</Chip>
            <Chip tone="neutral">{t.region}</Chip>
            <Chip tone={t.health >= 75 ? 'ok' : t.health >= 50 ? 'warn' : 'bad'}>Health {t.health}</Chip>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="tertiary">Announce</Button>
          <Button variant="secondary">Enter tenant console</Button>
          <Button>Grant quota</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-4">
        {[
          ['MRR', t.mrr ? `$${t.mrr.toLocaleString()}` : '—'],
          ['Interviews', String(t.interviews)],
          ['Quota used', `${Math.round((t.interviews / t.quota) * 100)}%`],
          ['Margin', `${t.margin}%`],
          ['Active users', '9'],
          ['Days live', '148'],
        ].map(([k, v]) => (
          <Card key={k} className="p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-2">{k}</p>
            <p className="text-lg font-semibold mt-0.5 tabular-nums">{v}</p>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHead title="Unit economics" sub="Cost to serve, per interview" />
          <div className="border-t border-line p-4">
            <div className="flex h-8 rounded overflow-hidden mb-4">
              {cogs.map((c, i) => (
                <div key={c.k} title={`${c.k} $${c.v}`} style={{ width: `${(c.v / total) * 100}%`, background: colors[i] }} />
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs mb-4">
              {cogs.map((c, i) => (
                <div key={c.k} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: colors[i] }} />
                  <span className="text-ink-2 flex-1">{c.k}</span>
                  <span className="font-mono">${c.v.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm pt-3 border-t border-line">
              <span className="text-ink-2">Total COGS per interview</span>
              <span className="font-semibold font-mono">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-ink-2">Platform median</span>
              <span className="font-mono text-ink-3">$3.87</span>
            </div>
          </div>

          {lowMargin && (
            <div className="border-t border-line p-4 bg-warn-subtle">
              <div className="flex gap-2">
                <AlertTriangle size={16} className="text-warn shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold mb-1">Margin {t.margin}% — below the 45% floor</p>
                  <p className="text-ink-2 leading-relaxed">
                    Their interviews average <strong>71 minutes</strong> against a 42-minute median,
                    because the rubric carries 11 competencies. Cache hit rate is 41%, well under the
                    73% platform average.
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="secondary">Adjust routing</Button>
                    <Button size="sm" variant="tertiary">Flag for CSM</Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHead title="Quota" />
            <div className="border-t border-line p-4 space-y-3">
              <Meter used={t.interviews} limit={t.quota} label="Interviews" />
              <Meter used={9} limit={15} label="Seats" />
              <Meter used={4} limit={30} label="Active jobs" />
            </div>
          </Card>

          <Card>
            <CardHead title="Configuration" />
            <div className="border-t border-line p-4 text-sm space-y-2">
              {[
                ['Region', t.region], ['Residency', 'Enforced'],
                ['Isolation', t.tier === 'Enterprise' ? 'Dedicated RDS' : 'Shared + RLS'],
                ['Encryption', t.tier === 'Enterprise' ? 'BYOK' : 'Platform CMK'],
                ['SSO', 'Okta'], ['Retention', '3 years'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-ink-2">{k}</span><span className="font-medium">{v}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHead title="Risk signals" />
            <div className="border-t border-line p-4">
              {t.state === 'Past due' ? (
                <Chip tone="bad">Payment failed · 8 days</Chip>
              ) : lowMargin ? (
                <Chip tone="warn">Margin below floor</Chip>
              ) : (
                <p className="text-sm text-ink-2">None open.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
