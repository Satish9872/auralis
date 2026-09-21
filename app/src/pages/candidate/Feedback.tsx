import { useState } from 'react'
import { Card, Button, Chip, cx } from '../../ui'

export default function Feedback() {
  const [tab, setTab] = useState<'advance' | 'decline'>('advance')

  return (
    <div>
      {/* demo toggle — not part of the product */}
      <div className="flex gap-1 p-1 rounded-full bg-subtle mb-8 text-sm w-fit">
        {(['advance', 'decline'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cx('px-4 h-8 rounded-full font-medium capitalize',
              tab === t ? 'bg-surface shadow-sm' : 'text-ink-2')}>
            {t === 'advance' ? 'Passed' : 'Not advancing'}
          </button>
        ))}
      </div>

      {tab === 'advance' ? (
        <>
          <Card className="p-6 mb-4 bg-ok-subtle border-ok/30">
            <Chip tone="ok">Moving forward</Chip>
            <h1 className="text-2xl font-semibold mt-3">You're through to Round 2</h1>
          </Card>

          <Card className="p-6 mb-4">
            <h2 className="font-semibold mb-3">What went well</h2>
            <p className="text-ink-2 leading-relaxed">
              Your walkthrough of the sharding tradeoffs was clear, and you caught the hot-partition
              risk before it was raised. When asked about the cost of consistent hashing, you named
              the cross-shard reporting penalty and explained why it was an acceptable trade — that
              kind of reasoning is exactly what this round looks for.
            </p>
          </Card>

          <Card className="p-6 mb-6">
            <h2 className="font-semibold mb-3">What's next</h2>
            <p className="text-sm text-ink-2 mb-1"><strong className="text-ink">Round 2 · Deep dive</strong> · 60 minutes · AI-conducted</p>
            <p className="text-sm text-ink-2">Covers system design in more depth, debugging, and ownership.</p>
          </Card>

          <Button size="xl" className="w-full">Choose your time for Round 2</Button>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-semibold mb-3">We're not moving forward after this round</h1>
          <p className="text-ink-2 leading-relaxed mb-6">
            We reviewed your interview against what this role needs. Here's what we found — we hope it's useful.
          </p>

          <Card className="p-6 mb-4">
            <h2 className="font-semibold mb-2">What was strong</h2>
            <ul className="text-ink-2 space-y-2 text-sm leading-relaxed mb-6">
              <li>· You reasoned clearly about consistency tradeoffs and asked good clarifying questions before designing anything.</li>
              <li>· Your explanations were easy to follow, and you were honest when you weren't sure.</li>
            </ul>

            <h2 className="font-semibold mb-2">Where the gap was</h2>
            <p className="text-ink-2 text-sm leading-relaxed mb-6">
              The role needs someone who has scaled a system past a single database. When asked what
              happens at ten times the load, the design stayed on one instance and didn't get revisited.
              That's the specific thing this round was testing for.
            </p>

            <h2 className="font-semibold mb-2">What would strengthen a future application</h2>
            <p className="text-ink-2 text-sm leading-relaxed">
              Hands-on experience with partitioning or replication — even on a side project you can
              talk through in detail. Being able to describe a specific scaling decision you made,
              and what it cost you, would change this conversation.
            </p>
          </Card>

          <Card className="p-6 mb-4">
            <h2 className="font-semibold mb-1">Your interview</h2>
            <p className="text-sm text-ink-2 mb-4">You can replay your own recording and download your whiteboard work.</p>
            <div className="flex gap-2">
              <Button variant="secondary">Play recording</Button>
              <Button variant="tertiary">Download my work</Button>
            </div>
          </Card>

          <Card className="p-6 mb-6">
            <h2 className="font-semibold mb-3">Other roles that may fit better</h2>
            <div className="space-y-2">
              {['Backend Engineer II · Mumbai', 'Platform Engineer · Remote'].map(r => (
                <div key={r} className="flex items-center justify-between p-3 rounded border border-line">
                  <span className="text-sm">{r}</span>
                  <Button size="sm" variant="secondary">View</Button>
                </div>
              ))}
            </div>
          </Card>

          <Button variant="secondary" size="lg" className="w-full mb-4">Request a human review of this decision</Button>
          <p className="text-sm text-ink-2">Thank you for the time you put into this.</p>
        </>
      )}
    </div>
  )
}
