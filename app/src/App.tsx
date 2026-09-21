import { BrowserRouter, Routes, Route, NavLink, Link, useLocation, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import {
  LayoutDashboard, Briefcase, Users, Video, SlidersHorizontal, BarChart3, Settings,
  Building2, Gauge, Cpu, ShieldCheck, Activity, Wallet, ArrowLeft,
} from 'lucide-react'
import { cx, Avatar, Meter } from './ui'

import Landing from './pages/Landing'
import Home from './pages/console/Home'
import Jobs from './pages/console/Jobs'
import Pipeline from './pages/console/Pipeline'
import Scorecard from './pages/console/Scorecard'
import Studio from './pages/console/Studio'
import Insights from './pages/console/Insights'
import ConsoleSettings from './pages/console/SettingsPage'
import Overview from './pages/grid/Overview'
import Tenants from './pages/grid/Tenants'
import Tenant360 from './pages/grid/Tenant360'
import Entitlements from './pages/grid/Entitlements'
import ModelOps from './pages/grid/ModelOps'
import Apply from './pages/candidate/Apply'
import Status from './pages/candidate/Status'
import Schedule from './pages/candidate/Schedule'
import Ready from './pages/candidate/Ready'
import Room from './pages/candidate/Room'
import Feedback from './pages/candidate/Feedback'

/* ---------------- Console shell ---------------- */
const consoleNav = [
  { to: '/console', end: true, icon: LayoutDashboard, label: 'Home' },
  { to: '/console/jobs', icon: Briefcase, label: 'Jobs', count: 5 },
  { to: '/console/pipeline', icon: Users, label: 'Candidates', count: 847 },
  { to: '/console/interviews', icon: Video, label: 'Interviews', live: true },
  { divider: true },
  { to: '/console/studio', icon: SlidersHorizontal, label: 'Studio' },
  { to: '/console/insights', icon: BarChart3, label: 'Insights' },
  { divider: true },
  { to: '/console/settings', icon: Settings, label: 'Settings' },
]

const gridNav = [
  { group: 'Operate' },
  { to: '/grid', end: true, icon: LayoutDashboard, label: 'Overview' },
  { to: '/grid/tenants', icon: Building2, label: 'Tenants', count: 312 },
  { group: 'Control' },
  { to: '/grid/entitlements', icon: Gauge, label: 'Entitlements' },
  { to: '/grid/model-ops', icon: Cpu, label: 'Model Ops' },
  { group: 'Assure' },
  { to: '/grid/governance', icon: ShieldCheck, label: 'Governance', alert: true },
  { to: '/grid/observability', icon: Activity, label: 'Observability' },
  { group: 'Grow' },
  { to: '/grid/revenue', icon: Wallet, label: 'Revenue' },
]

function Shell({ kind, children }: { kind: 'console' | 'grid'; children: ReactNode }) {
  const nav = kind === 'console' ? consoleNav : gridNav
  const dark = kind === 'grid'
  return (
    <div className={cx(dark && 'dark', 'min-h-screen bg-canvas text-ink')}>
      <header className="h-14 bg-surface border-b border-line sticky top-0 z-20 flex items-center px-4 gap-4">
        <Link to="/" className="flex items-center gap-2 font-semibold shrink-0">
          <span className="w-7 h-7 rounded-[7px] bg-brand flex items-center justify-center gap-[2px]">
            {[8, 14, 18, 11, 6].map((h, i) => <i key={i} className="block w-[2px] rounded-full bg-white" style={{ height: h }} />)}
          </span>
          Auralis
          {kind === 'grid' && <span className="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-bad text-white">PROD</span>}
        </Link>
        <div className="flex-1" />
        {kind === 'console' && (
          <div className="hidden sm:block"><Meter used={284} limit={500} label="Interviews" /></div>
        )}
        <Avatar name={kind === 'grid' ? 'Ops Team' : 'Kavya Reddy'} size={28} />
      </header>

      <div className="flex">
        <nav className="hidden md:block w-60 shrink-0 border-r border-line bg-surface min-h-[calc(100vh-56px)] p-2">
          {nav.map((it: any, i) => {
            if (it.divider) return <div key={i} className="h-px bg-line my-2 mx-2" />
            if (it.group) return <p key={i} className="text-[11px] font-semibold uppercase tracking-wide text-ink-3 px-3 mt-4 mb-1">{it.group}</p>
            const Icon = it.icon
            return (
              <NavLink key={it.to} to={it.to} end={it.end}
                className={({ isActive }) => cx(
                  'flex items-center gap-3 h-10 px-3 rounded text-sm relative',
                  isActive ? 'bg-brand-subtle text-brand font-semibold' : 'text-ink-2 hover:bg-black/5',
                )}>
                {({ isActive }: any) => (<>
                  {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-brand" />}
                  <Icon size={18} /> <span className="flex-1">{it.label}</span>
                  {it.count != null && <span className="text-xs text-ink-3">{it.count}</span>}
                  {it.live && <span className="live-dot w-2 h-2 rounded-full bg-live" />}
                  {it.alert && <span className="w-2 h-2 rounded-full bg-warn" />}
                </>)}
              </NavLink>
            )
          })}
        </nav>
        <main className="flex-1 min-w-0 p-6">{children}</main>
      </div>
    </div>
  )
}

/* Candidate shell — no navigation by design */
function CandidateShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  if (pathname.includes('/room')) return <>{children}</>
  return (
    <div className="min-h-screen bg-canvas">
      <header className="h-14 bg-surface border-b border-line flex items-center px-5">
        <span className="font-semibold text-sm">Acme Technologies</span>
        <div className="flex-1" />
        <Link to="/" className="text-xs text-ink-3 flex items-center gap-1"><ArrowLeft size={12} /> Demo home</Link>
      </header>
      <main className="max-w-[720px] mx-auto px-5 py-12">{children}</main>
      <footer className="max-w-[720px] mx-auto px-5 pb-10 text-xs text-ink-3 flex gap-4">
        <a href="#" className="hover:underline">Privacy</a>
        <a href="#" className="hover:underline">My data</a>
        <span className="ml-auto">Powered by Auralis</span>
      </footer>
    </div>
  )
}

const C = (el: ReactNode) => <Shell kind="console">{el}</Shell>
const G = (el: ReactNode) => <Shell kind="grid">{el}</Shell>
const K = (el: ReactNode) => <CandidateShell>{el}</CandidateShell>

const Stub = ({ name }: { name: string }) => (
  <div className="text-center py-20">
    <p className="font-semibold">{name}</p>
    <p className="text-sm text-ink-2 mt-1">Specified in the design document — not yet built in this prototype.</p>
  </div>
)

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route path="/console" element={C(<Home />)} />
        <Route path="/console/jobs" element={C(<Jobs />)} />
        <Route path="/console/pipeline" element={C(<Pipeline />)} />
        <Route path="/console/candidate/:id" element={C(<Scorecard />)} />
        <Route path="/console/interviews" element={C(<Stub name="Live interview monitor" />)} />
        <Route path="/console/studio" element={C(<Studio />)} />
        <Route path="/console/insights" element={C(<Insights />)} />
        <Route path="/console/settings" element={C(<ConsoleSettings />)} />

        <Route path="/grid" element={G(<Overview />)} />
        <Route path="/grid/tenants" element={G(<Tenants />)} />
        <Route path="/grid/tenants/:id" element={G(<Tenant360 />)} />
        <Route path="/grid/entitlements" element={G(<Entitlements />)} />
        <Route path="/grid/model-ops" element={G(<ModelOps />)} />
        <Route path="/grid/governance" element={G(<Stub name="Governance & fairness monitor" />)} />
        <Route path="/grid/observability" element={G(<Stub name="Observability & interview replay" />)} />
        <Route path="/grid/revenue" element={G(<Stub name="Revenue & margin analytics" />)} />

        <Route path="/apply" element={K(<Apply />)} />
        <Route path="/status" element={K(<Status />)} />
        <Route path="/schedule" element={K(<Schedule />)} />
        <Route path="/ready" element={K(<Ready />)} />
        <Route path="/room" element={K(<Room />)} />
        <Route path="/feedback" element={K(<Feedback />)} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
