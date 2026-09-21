import { Link } from 'react-router-dom'
import { Card, CardHead, PageHead, Button, cx } from '../../ui'

const services = [
  { n: 'API', p95: '84ms', err: '0.02%', s: 'ok' as const },
  { n: 'Interview Room', p95: '112ms', err: '0.04%', s: 'ok' as const },
  { n: 'Media', p95: '38ms', err: '0.01%', s: 'ok' as const },
  { n: 'Agent Runtime', p95: '640ms', err: '0.31%', s: 'warn' as const },
  { n: 'Data', p95: '12ms', err: '0.00%', s: 'ok' as const },
  { n: 'Integrations', p95: '210ms', err: '2.40%', s: 'bad' as const },
]

const live = [
  { k: 'Interviews in progress', v: '1,284', sub: 'peak today 1,610' },
  { k: 'Queue depth', v: '0', sub: 'no candidate waiting' },
  { k: 'Turn latency p95', v: '612ms', sub: 'target 700ms' },
  { k: 'Cache hit rate', v: '73%', sub: 'the cost canary' },
]

const attention = [
  { t: 'Orbit Logistics — payment failed, 8 days', tone: 'bad' as const, cta: 'Dunning' },
  { t: 'Bluepeak Labs — margin at 12%, below floor', tone: 'warn' as const, cta: 'Review' },
  { t: 'Northwind Retail — quota 95% with 9 days left', tone: 'warn' as const, cta: 'Grant' },
  { t: 'Helix Health — fairness alert, impact ratio 0.74', tone: 'bad' as const, cta: 'Investigate' },
]

export default function Overview() {
  return (
    <>
      <PageHead crumb="Operate" title="Platform overview" />

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-4">
        {services.map(s => (
          <Card key={s.n} className="p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className={cx('w-2 h-2 rounded-full shrink-0',
                s.s === 'ok' ? 'bg-ok' : s.s === 'warn' ? 'bg-warn' : 'bg-bad')} />
              <span className="text-xs font-semibold truncate">{s.n}</span>
            </div>
            <p className="text-sm font-mono">{s.p95}</p>
            <p className={cx('text-[11px]', s.s === 'bad' ? 'text-bad font-semibold' : 'text-ink-3')}>{s.err} err</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {live.map(l => (
          <Card key={l.k} className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-2">{l.k}</p>
            <p className="text-2xl font-semibold mt-1 tabular-nums">{l.v}</p>
            <p className="text-xs text-ink-3 mt-1">{l.sub}</p>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHead title="Needs attention" sub={`${attention.length} items`} />
          <div className="border-t border-line">
            {attention.map((a, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-line last:border-0">
                <span className={cx('w-1 h-8 rounded-full shrink-0', a.tone === 'bad' ? 'bg-bad' : 'bg-warn')} />
                <p className="text-sm flex-1 min-w-0 truncate">{a.t}</p>
                <Button size="sm" variant="secondary">{a.cta}</Button>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHead title="Business pulse" />
            <div className="border-t border-line p-4 text-sm space-y-2.5">
              {[
                ['MRR', '$248,400', '+6.2%'],
                ['New tenants', '14', 'this month'],
                ['Net revenue retention', '118%', ''],
                ['Churn risk', '3 tenants', ''],
              ].map(([k, v, d]) => (
                <div key={k} className="flex justify-between items-baseline">
                  <span className="text-ink-2">{k}</span>
                  <span><span className="font-semibold">{v}</span>{d && <span className="text-xs text-ink-3 ml-1.5">{d}</span>}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHead title="Cost right now" />
            <div className="border-t border-line p-4 text-sm space-y-2.5">
              {[
                ['Today', '$4,120', 'budget $5,000'],
                ['Cost per interview', '$3.87', '↓ $0.22'],
                ['Gross margin', '68%', 'target 70%'],
              ].map(([k, v, d]) => (
                <div key={k} className="flex justify-between items-baseline">
                  <span className="text-ink-2">{k}</span>
                  <span><span className="font-semibold">{v}</span><span className="text-xs text-ink-3 ml-1.5">{d}</span></span>
                </div>
              ))}
              <Link to="/grid/model-ops"><Button size="sm" variant="secondary" className="w-full mt-2">Cost governance</Button></Link>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
