import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, Button, Chip } from '../../ui'
import { Check, Calendar, Circle } from 'lucide-react'

type Step = { name: string; sub: string; state: 'done' | 'current' | 'next' | 'upcoming' }

export default function Status() {
  const [screened, setScreened] = useState(false)
  useEffect(() => { const t = setTimeout(() => setScreened(true), 2600); return () => clearTimeout(t) }, [])

  const steps: Step[] = [
    { name: 'Application received', sub: 'Today, 14:20', state: 'done' },
    { name: 'Resume review', sub: screened ? 'Passed · Today, 14:23' : 'In progress', state: screened ? 'done' : 'current' },
    { name: 'Round 1 · Technical screen', sub: screened ? '45 min · Book your slot' : 'Not started', state: screened ? 'next' : 'upcoming' },
    { name: 'Round 2 · Deep dive', sub: '60 min', state: 'upcoming' },
    { name: 'Round 3 · Team fit', sub: '45 min · with the hiring team', state: 'upcoming' },
  ]

  return (
    <div>
      <p className="text-xs text-ink-3 mb-2">Acme Technologies · Mumbai</p>
      <h1 className="text-2xl font-semibold tracking-tight mb-6">Senior Backend Engineer</h1>

      <Card className={`p-6 mb-4 ${screened ? 'bg-ok-subtle border-ok/30' : ''}`}>
        {screened ? (
          <>
            <Chip tone="ok">Moving forward</Chip>
            <h2 className="text-xl font-semibold mt-3 mb-2">You're through to the first interview</h2>
            <p className="text-ink-2 leading-relaxed">
              Your experience building payment systems at scale is a strong match for what this team needs.
            </p>
          </>
        ) : (
          <>
            <Chip tone="brand">In review</Chip>
            <h2 className="text-xl font-semibold mt-3 mb-2">We're reading your application</h2>
            <p className="text-ink-2">In review since 14:20 · We typically respond within the hour.</p>
          </>
        )}
      </Card>

      {screened && (
        <Card className="p-6 mb-6">
          <h3 className="font-semibold mb-1">Choose your interview time</h3>
          <p className="text-sm text-ink-2 mb-4">45 minutes · Video and audio · Includes a coding exercise</p>
          <Link to="/schedule"><Button size="lg">Choose your interview time</Button></Link>
        </Card>
      )}

      <Card className="p-6 mb-4">
        <h3 className="font-semibold mb-5">Your progress</h3>
        <ol className="space-y-0">
          {steps.map((s, i) => {
            const last = i === steps.length - 1
            return (
              <li key={s.name} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    s.state === 'done' ? 'bg-ok text-white'
                    : s.state === 'current' ? 'ring-2 ring-brand'
                    : s.state === 'next' ? 'ring-2 ring-brand text-brand'
                    : 'ring-2 ring-line-strong'}`}>
                    {s.state === 'done' ? <Check size={14} />
                      : s.state === 'current' ? <span className="live-dot w-2 h-2 rounded-full bg-brand" />
                      : s.state === 'next' ? <Calendar size={13} />
                      : <Circle size={7} className="text-ink-3 fill-current" />}
                  </span>
                  {!last && <span className={`w-0.5 flex-1 my-1 ${s.state === 'done' ? 'bg-ok' : 'bg-line'}`} style={{ minHeight: 24 }} />}
                </div>
                <div className={`pb-6 ${last ? 'pb-0' : ''}`}>
                  <p className={`text-sm ${s.state === 'upcoming' ? 'text-ink-3' : 'font-medium'}`}>{s.name}</p>
                  <p className="text-xs text-ink-3 mt-0.5">{s.sub}</p>
                </div>
              </li>
            )
          })}
        </ol>
      </Card>

      <div className="flex flex-wrap gap-4 text-sm">
        <a href="#" className="text-brand hover:underline">Download my data</a>
        <a href="#" className="text-brand hover:underline">Delete my application</a>
        <a href="#" className="text-brand hover:underline">Contact a human</a>
      </div>
    </div>
  )
}
