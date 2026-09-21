import { Card, CardHead, Button, Chip, PageHead, Table, Tr, Td } from '../../ui'
import { TrendingDown, AlertTriangle } from 'lucide-react'

const routing = [
  { task: 'Live interview reasoning', model: 'claude-sonnet-5', effort: 'low', fb: 'claude-haiku-4-5', cache: 'Aggressive' },
  { task: 'Follow-up generation', model: 'claude-sonnet-5', effort: 'low', fb: '—', cache: 'Aggressive' },
  { task: 'Final evaluation', model: 'claude-opus-5', effort: 'high', fb: 'claude-sonnet-5', cache: 'Standard' },
  { task: 'Resume parsing', model: 'claude-haiku-4-5', effort: '—', fb: '—', cache: 'Aggressive' },
  { task: 'ATS scoring', model: 'claude-sonnet-5', effort: 'medium', fb: 'claude-haiku-4-5', cache: 'Aggressive' },
  { task: 'Feedback writing', model: 'claude-sonnet-5', effort: 'medium', fb: '—', cache: 'Standard' },
  { task: 'Calibration (batch)', model: 'claude-opus-5', effort: 'high', fb: '—', cache: 'Standard' },
]

const spend = [
  { k: 'Reasoning', v: 48200, pct: 46 }, { k: 'Media egress', v: 21400, pct: 20 },
  { k: 'STT', v: 12800, pct: 12 }, { k: 'Compute', v: 11200, pct: 11 },
  { k: 'TTS', v: 7400, pct: 7 }, { k: 'Storage', v: 4100, pct: 4 },
]

export default function ModelOps() {
  return (
    <>
      <PageHead crumb="Control" title="Model operations"
        actions={<><Button variant="tertiary">Run eval</Button><Button>Save policy</Button></>} />

      <Card className="mb-4">
        <CardHead title="Routing policy" sub="Task type + tenant tier selects the model. Config, not code." />
        <Table head={['Task', 'Model', 'Effort', 'Fallback', 'Cache']}>
          {routing.map(r => (
            <Tr key={r.task}>
              <Td className="font-medium">{r.task}</Td>
              <Td><code className="text-xs bg-subtle px-1.5 py-0.5 rounded">{r.model}</code></Td>
              <Td><Chip tone={r.effort === 'high' ? 'warn' : 'neutral'}>{r.effort}</Chip></Td>
              <Td className="text-xs text-ink-3 font-mono">{r.fb}</Td>
              <Td><Chip tone={r.cache === 'Aggressive' ? 'ok' : 'neutral'}>{r.cache}</Chip></Td>
            </Tr>
          ))}
        </Table>
      </Card>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHead title="Spend this month" sub="$105,100 against a $120,000 budget" />
          <div className="border-t border-line p-4">
            <div className="flex h-8 rounded overflow-hidden mb-4">
              {spend.map((s, i) => (
                <div key={s.k} title={s.k} style={{
                  width: `${s.pct}%`,
                  background: ['#0A66C2', '#1E4D8C', '#7A5AF8', '#01754F', '#915907', '#5E5E5E'][i],
                }} />
              ))}
            </div>
            {spend.map((s, i) => (
              <div key={s.k} className="flex items-center gap-2 text-sm py-1.5 border-b border-line last:border-0">
                <span className="w-2.5 h-2.5 rounded-sm shrink-0"
                  style={{ background: ['#0A66C2', '#1E4D8C', '#7A5AF8', '#01754F', '#915907', '#5E5E5E'][i] }} />
                <span className="flex-1 text-ink-2">{s.k}</span>
                <span className="font-mono">${s.v.toLocaleString()}</span>
                <span className="text-xs text-ink-3 w-10 text-right">{s.pct}%</span>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="border-warn/40">
            <CardHead title="Anomaly" />
            <div className="border-t border-line p-4">
              <div className="flex gap-2">
                <AlertTriangle size={15} className="text-warn shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold mb-1">Cache hit rate fell 73% → 41%</p>
                  <p className="text-ink-2 text-xs leading-relaxed">
                    Started 18 Sep, 14:02 — coincides with prompt <code>eval-v14</code> rollout.
                    A timestamp was added above the cache breakpoint, invalidating the prefix.
                  </p>
                  <p className="text-xs mt-2"><strong>Impact: +$11,400/month</strong></p>
                  <Button size="sm" variant="secondary" className="mt-3">Investigate</Button>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <CardHead title="Optimization" />
            <div className="border-t border-line p-4">
              <div className="flex gap-2">
                <TrendingDown size={15} className="text-ok shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-ink-2 leading-relaxed">
                    Moving <strong>feedback writing</strong> from Sonnet to Haiku saves
                    <strong> $4,100/month</strong>, with a projected 2-point drop in feedback
                    quality scores.
                  </p>
                  <Button size="sm" variant="secondary" className="mt-3">Review change</Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
