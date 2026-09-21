import { useState } from 'react'
import { Card, CardHead, Button, Chip, PageHead, cx } from '../../ui'
import { rounds } from '../../data'
import { Plus, Check } from 'lucide-react'

const anchors = [
  { n: 5, label: 'Exceptional', text: 'Designs for failure unprompted; names the tradeoff and its cost without being asked.' },
  { n: 4, label: 'Strong', text: 'Sound design; identifies the main risk when probed once.' },
  { n: 3, label: 'Meets bar', text: 'Workable design for the stated load; needs prompting to consider scale.' },
  { n: 2, label: 'Below bar', text: 'Design does not survive a change in requirements; does not revisit when challenged.' },
  { n: 1, label: 'Significant gap', text: 'Cannot produce a coherent design for the stated problem.' },
]
const anchorColor = ['#B24020', '#915907', '#0A66C2', '#4B9B6E', '#01754F']

export default function Studio() {
  const [sel, setSel] = useState(0)
  const r = rounds[sel]

  return (
    <>
      <PageHead crumb="Studio" title="Interview design"
        actions={<><Button variant="tertiary">Calibrate</Button><Button>Publish</Button></>} />

      {/* round pipeline */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4">
        {rounds.map((rd, i) => (
          <div key={rd.n} className="flex items-center gap-2 shrink-0">
            <button onClick={() => setSel(i)}
              className={cx('w-[220px] text-left p-3 rounded-[8px] border bg-surface transition-colors',
                sel === i ? 'border-brand ring-1 ring-brand' : 'border-line hover:border-line-strong')}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-ink-3">Round {rd.n}</span>
                <Chip tone={rd.format === 'AI' ? 'brand' : 'neutral'}>{rd.format}</Chip>
              </div>
              <p className="font-semibold text-sm mb-2">{rd.name}</p>
              <div className="flex flex-wrap gap-1">
                {rd.comps.slice(0, 2).map(c => <Chip key={c} tone="neutral">{c}</Chip>)}
                {rd.comps.length > 2 && <Chip tone="neutral">+{rd.comps.length - 2}</Chip>}
              </div>
              <p className="text-xs text-ink-3 mt-2">{rd.mins} min · pass at {rd.threshold}</p>
            </button>
            {i < rounds.length - 1 && <span className="text-ink-3">→</span>}
          </div>
        ))}
        <button className="shrink-0 w-10 h-10 rounded-full border border-dashed border-line-strong flex items-center justify-center text-ink-3 hover:border-brand hover:text-brand">
          <Plus size={16} />
        </button>
        <span className="text-ink-3">→</span>
        <div className="shrink-0 px-4 py-3 rounded-[8px] bg-ok-subtle text-ok font-semibold text-sm">Shortlist</div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHead title={`Round ${r.n} · ${r.name}`} sub="Rubric anchors for System design" />
          <div className="border-t border-line p-4 space-y-2">
            {anchors.map((a, i) => (
              <div key={a.n} className="flex gap-3 p-3 rounded border border-line">
                <span className="w-1 rounded-full shrink-0" style={{ background: anchorColor[4 - i] }} />
                <div>
                  <p className="text-sm font-semibold">{a.n} · {a.label}</p>
                  <p className="text-xs text-ink-2 mt-0.5 leading-relaxed">{a.text}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHead title="Pass threshold" />
            <div className="border-t border-line p-4">
              <div className="flex h-8 rounded overflow-hidden mb-3">
                <div className="bg-subtle flex items-center justify-center text-[10px] font-semibold text-ink-3" style={{ width: '45%' }}>Decline</div>
                <div className="bg-warn-subtle flex items-center justify-center text-[10px] font-semibold text-warn" style={{ width: '15%' }}>Borderline</div>
                <div className="bg-ok-subtle flex items-center justify-center text-[10px] font-semibold text-ok" style={{ width: '40%' }}>Advance</div>
              </div>
              <p className="text-xs text-ink-2 leading-relaxed">
                At {r.threshold}, <strong>31 of your last 200</strong> candidates would have advanced.
                12 would have landed in the borderline band for human review.
              </p>
            </div>
          </Card>

          <Card>
            <CardHead title="Calibration" />
            <div className="border-t border-line p-4">
              <div className="flex items-center gap-2 mb-3">
                <Check size={16} className="text-ok" />
                <span className="text-sm font-semibold">Ready to use</span>
              </div>
              <ul className="text-xs text-ink-2 space-y-1.5">
                <li>· Score distribution discriminates well</li>
                <li>· Impact ratio 0.91 — within range</li>
                <li>· Agreement with human scores: 84%</li>
              </ul>
            </div>
          </Card>

          <Card>
            <CardHead title="Persona" />
            <div className="border-t border-line p-4 text-sm space-y-2">
              <div className="flex justify-between"><span className="text-ink-2">Name</span><span className="font-medium">Aria</span></div>
              <div className="flex justify-between"><span className="text-ink-2">Tone</span><span className="font-medium">Neutral</span></div>
              <div className="flex justify-between"><span className="text-ink-2">Follow-ups</span><span className="font-medium">Probing</span></div>
              <div className="flex justify-between"><span className="text-ink-2">Hints</span><span className="font-medium">Allowed, noted</span></div>
              <Button size="sm" variant="secondary" className="w-full mt-3">Hear this persona</Button>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
