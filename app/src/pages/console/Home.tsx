import { Link } from 'react-router-dom'
import { Card, CardHead, Button, Chip, Avatar, PageHead, Waveform } from '../../ui'
import { actionQueue, candidates } from '../../data'

const tiles = [
  { label: 'Open roles', value: '4', delta: '+2 this week' },
  { label: 'In pipeline', value: '847', delta: '132 active' },
  { label: 'Interviews this week', value: '31', delta: '23 completed' },
  { label: 'Median time to hire', value: '19d', delta: '↓ 23 days vs. baseline' },
]

export default function Home() {
  const live = candidates.filter(c => c.stage === 'Interviewing')
  return (
    <>
      <PageHead title="Good morning, Kavya" crumb="Acme Technologies" />

      <Card className="mb-4">
        <CardHead title="Needs you" sub={`${actionQueue.length} items`} />
        <div className="border-t border-line">
          {actionQueue.map(a => (
            <div key={a.id} className="flex items-center gap-3 px-4 py-3 border-b border-line last:border-0 hover:bg-black/[.02]">
              <Chip tone={a.tone}>{a.type}</Chip>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{a.text}</p>
                <p className="text-xs text-ink-3 truncate">{a.sub}</p>
              </div>
              <Link to="/console/pipeline"><Button size="sm" variant="secondary">{a.cta}</Button></Link>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {tiles.map(t => (
          <Card key={t.label} className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-2">{t.label}</p>
            <p className="text-2xl font-semibold mt-1">{t.value}</p>
            <p className="text-xs text-ink-3 mt-1">{t.delta}</p>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHead title="Live now" sub={`${live.length} interview in progress`} />
          <div className="border-t border-line">
            {live.map(c => (
              <div key={c.id} className="flex items-center gap-3 px-4 py-3">
                <Avatar name={c.name} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-ink-3">Senior Backend Engineer · Round 1 · 18:42 elapsed</p>
                </div>
                <div className="hidden sm:block"><Waveform state="listening" size={100} /></div>
                <Button size="sm" variant="secondary">Observe</Button>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHead title="Pipeline health" />
          <div className="px-4 pb-4 border-t border-line pt-4">
            {[
              { s: 'Applied', n: 247, w: 100 }, { s: 'Screened', n: 84, w: 34 },
              { s: 'Interviewed', n: 31, w: 13 }, { s: 'Shortlisted', n: 5, w: 2 },
            ].map(r => (
              <div key={r.s} className="mb-3 last:mb-0">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-ink-2">{r.s}</span><span className="font-semibold">{r.n}</span>
                </div>
                <div className="h-2 rounded-full bg-subtle overflow-hidden">
                  <div className="h-full bg-brand rounded-full" style={{ width: `${r.w}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  )
}
