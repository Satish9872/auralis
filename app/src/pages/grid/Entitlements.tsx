import { useState } from 'react'
import { Card, CardHead, Button, Chip, PageHead, Table, Tr, Td, cx } from '../../ui'

const tiers = ['Starter', 'Growth', 'Scale', 'Enterprise']

const meters: Record<string, { m: string; inc: string; over: string; policy: string }[]> = {
  Starter: [
    { m: 'Interviews', inc: '25', over: '$18.00', policy: 'Block' },
    { m: 'Interview minutes', inc: '1,125', over: '$0.40', policy: 'Soft warn then stop' },
    { m: 'Resumes screened', inc: '1,000', over: '$0.06', policy: 'Queue' },
    { m: 'Concurrent interviews', inc: '3', over: '—', policy: 'Queue' },
    { m: 'Seats', inc: '3', over: '—', policy: 'Block' },
  ],
  Growth: [
    { m: 'Interviews', inc: '100', over: '$14.00', policy: 'Bill overage' },
    { m: 'Interview minutes', inc: '4,500', over: '$0.34', policy: 'Bill overage' },
    { m: 'Resumes screened', inc: '5,000', over: '$0.05', policy: 'Queue' },
    { m: 'Concurrent interviews', inc: '8', over: '—', policy: 'Queue' },
    { m: 'Seats', inc: '8', over: '—', policy: 'Block' },
  ],
  Scale: [
    { m: 'Interviews', inc: '500', over: '$12.00', policy: 'Bill overage' },
    { m: 'Interview minutes', inc: '22,500', over: '$0.30', policy: 'Bill overage' },
    { m: 'Resumes screened', inc: '25,000', over: '$0.04', policy: 'Queue' },
    { m: 'Concurrent interviews', inc: '15', over: '—', policy: 'Queue with estimate' },
    { m: 'Seats', inc: '15', over: '—', policy: 'Block' },
  ],
  Enterprise: [
    { m: 'Interviews', inc: 'Custom', over: 'Negotiated', policy: 'Bill overage' },
    { m: 'Interview minutes', inc: 'Custom', over: 'Negotiated', policy: 'Bill overage' },
    { m: 'Resumes screened', inc: 'Unlimited', over: '—', policy: 'Unlimited' },
    { m: 'Concurrent interviews', inc: '100+', over: '—', policy: 'Unlimited' },
    { m: 'Seats', inc: 'Unlimited', over: '—', policy: 'Unlimited' },
  ],
}

const features = [
  { f: 'AI interview rounds', s: [true, true, true, true] },
  { f: 'Custom rubrics', s: [false, true, true, true] },
  { f: 'Canvas — code & whiteboard', s: [false, true, true, true] },
  { f: 'Advanced proctoring', s: [false, false, true, true] },
  { f: 'Fairness dashboard', s: [false, false, true, true] },
  { f: 'ATS integrations', s: [false, true, true, true] },
  { f: 'SSO / SCIM', s: [false, false, true, true] },
  { f: 'White-label', s: [false, false, false, true] },
  { f: 'Data residency choice', s: [false, false, false, true] },
  { f: 'BYOK encryption', s: [false, false, false, true] },
]

export default function Entitlements() {
  const [tier, setTier] = useState('Scale')
  return (
    <>
      <PageHead crumb="Control" title="Tier builder"
        actions={<><Button variant="tertiary">Preview impact</Button><Button>Publish</Button></>} />

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {tiers.map(t => (
          <button key={t} onClick={() => setTier(t)}
            className={cx('shrink-0 px-4 h-9 rounded-full text-sm font-semibold border transition-colors',
              tier === t ? 'bg-brand text-white border-brand' : 'bg-surface border-line hover:border-line-strong')}>
            {t}
          </button>
        ))}
      </div>

      <Card className="mb-4">
        <CardHead title={`${tier} — meters`} sub="Included allowance, overage rate, and enforcement policy" />
        <Table head={['Meter', 'Included', 'Overage rate', 'Policy']}>
          {meters[tier].map(m => (
            <Tr key={m.m}>
              <Td className="font-medium">{m.m}</Td>
              <Td className="tabular-nums">{m.inc}</Td>
              <Td className="tabular-nums font-mono text-xs">{m.over}</Td>
              <Td><Chip tone={m.policy === 'Block' ? 'bad' : m.policy.startsWith('Bill') ? 'ok' : 'warn'}>{m.policy}</Chip></Td>
            </Tr>
          ))}
        </Table>
      </Card>

      <Card>
        <CardHead title="Feature matrix" sub="Changing a row affects every tenant on that tier" />
        <Table head={['Feature', ...tiers]}>
          {features.map(f => (
            <Tr key={f.f}>
              <Td className="font-medium">{f.f}</Td>
              {f.s.map((on, i) => (
                <Td key={i}>
                  <span className={cx('inline-flex w-5 h-5 rounded items-center justify-center text-xs font-bold',
                    on ? 'bg-ok-subtle text-ok' : 'bg-subtle text-ink-3')}>
                    {on ? '✓' : '—'}
                  </span>
                </Td>
              ))}
            </Tr>
          ))}
        </Table>
        <div className="border-t border-line p-4 bg-warn-subtle text-sm">
          <strong>Impact preview:</strong> enabling <em>Advanced proctoring</em> on Growth would affect
          <strong> 90 tenants</strong>. 12 are currently on trial extensions that assume it is off.
        </div>
      </Card>
    </>
  )
}
