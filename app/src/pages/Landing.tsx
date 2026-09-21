import { Link } from 'react-router-dom'
import { Card, Button } from '../ui'
import { Users, Building2, Shield, ArrowRight } from 'lucide-react'

const surfaces = [
  {
    to: '/apply', icon: Users, name: 'Candidate', tag: 'Room',
    desc: 'Apply, book a slot in your own timezone, run the readiness check, and sit the interview.',
    flow: ['Apply', 'Status', 'Schedule', 'Readiness', 'Interview room', 'Feedback'],
  },
  {
    to: '/console', icon: Building2, name: 'Client', tag: 'Console',
    desc: 'Post jobs, design the interview, review evidence-cited scorecards, act on shortlists.',
    flow: ['Dashboard', 'Jobs', 'Pipeline', 'Scorecard', 'Studio', 'Insights'],
  },
  {
    to: '/grid', icon: Shield, name: 'Euron ops', tag: 'Grid',
    desc: 'Tenant lifecycle, quota and entitlement, model routing, cost governance.',
    flow: ['Overview', 'Tenants', 'Tenant 360', 'Entitlements', 'Model Ops'],
  },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-canvas">
      <header className="h-14 bg-surface border-b border-line flex items-center px-6">
        <span className="flex items-center gap-2 font-semibold">
          <span className="w-7 h-7 rounded-[7px] bg-brand flex items-center justify-center gap-[2px]">
            {[8, 14, 18, 11, 6].map((h, i) => <i key={i} className="block w-[2px] rounded-full bg-white" style={{ height: h }} />)}
          </span>
          Auralis <span className="text-ink-3 font-normal text-sm">by Euron</span>
        </span>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <span className="inline-flex items-center h-6 px-3 rounded-full bg-brand-subtle text-brand text-xs font-semibold mb-5">
          Interactive prototype
        </span>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.1] mb-4">
          The autonomous interview layer
        </h1>
        <p className="text-lg text-ink-2 max-w-2xl mb-12">
          Three surfaces, one system. Pick one to walk through — every screen is built from the
          design specification, running on mock data.
        </p>

        <div className="grid md:grid-cols-3 gap-4">
          {surfaces.map(s => (
            <Card key={s.to} className="p-5 flex flex-col hover:border-line-strong transition-colors">
              <div className="w-9 h-9 rounded-[8px] bg-brand-subtle flex items-center justify-center mb-4">
                <s.icon size={20} className="text-brand" />
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <h2 className="font-semibold">{s.name}</h2>
                <span className="text-xs text-ink-3">{s.tag}</span>
              </div>
              <p className="text-sm text-ink-2 leading-relaxed mb-4 flex-1">{s.desc}</p>
              <ol className="text-xs text-ink-3 space-y-1 mb-5">
                {s.flow.map((f, i) => <li key={f}>{i + 1}. {f}</li>)}
              </ol>
              <Link to={s.to}>
                <Button size="lg" className="w-full">Open <ArrowRight size={16} /></Button>
              </Link>
            </Card>
          ))}
        </div>

        <p className="text-xs text-ink-3 mt-10 max-w-2xl leading-relaxed">
          Prototype scope: interactive UI on mock data. The live interview runs a scripted exchange —
          real-time audio, video and proctoring require the media plane described in the architecture
          document, which cannot run on static hosting.
        </p>
      </div>
    </div>
  )
}
