import { Card, CardHead, Button, Chip, PageHead, Meter, Field, Input } from '../../ui'

const meters = [
  { label: 'Interviews', used: 284, limit: 500 },
  { label: 'Interview minutes', used: 12800, limit: 22500 },
  { label: 'Resumes screened', used: 3140, limit: 5000 },
  { label: 'Concurrent interviews', used: 11, limit: 15 },
  { label: 'Active jobs', used: 4, limit: 30 },
  { label: 'Seats', used: 9, limit: 15 },
]

export default function SettingsPage() {
  return (
    <>
      <PageHead crumb="Settings" title="Billing & usage" />

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHead title="Usage this period"
            sub="1–30 September · 9 days remaining"
            action={<Chip tone="brand">Scale</Chip>} />
          <div className="border-t border-line p-4 space-y-4">
            {meters.map(m => <Meter key={m.label} {...m} />)}
          </div>
          <div className="border-t border-line p-4 bg-warn-subtle">
            <p className="text-sm leading-relaxed">
              <strong>At your current rate you'll use 620 of 500 interviews.</strong> Estimated
              overage: <strong>$1,440</strong>. Upgrading to Enterprise before the period ends
              would cost less.
            </p>
            <Button size="sm" className="mt-3">Compare plans</Button>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHead title="Current plan" />
            <div className="border-t border-line p-4 text-sm space-y-2">
              <div className="flex justify-between"><span className="text-ink-2">Tier</span><span className="font-semibold">Scale</span></div>
              <div className="flex justify-between"><span className="text-ink-2">Price</span><span className="font-semibold">$4,800/mo</span></div>
              <div className="flex justify-between"><span className="text-ink-2">Renews</span><span className="font-semibold">1 Oct 2026</span></div>
              <div className="flex justify-between"><span className="text-ink-2">Region</span><span className="font-semibold">ap-south-1</span></div>
            </div>
          </Card>

          <Card>
            <CardHead title="Governance" />
            <div className="border-t border-line p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-2">Hiring locations</span>
                <div className="flex gap-1"><Chip tone="neutral">IN</Chip><Chip tone="neutral">EU</Chip></div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-2">Human oversight</span><Chip tone="ok">Required</Chip>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-2">Retention</span><span className="font-medium">3 years</span>
              </div>
              <Button size="sm" variant="secondary" className="w-full mt-1">Download audit log</Button>
            </div>
          </Card>

          <Card>
            <CardHead title="Brand" />
            <div className="border-t border-line p-4 space-y-3">
              <Field label="Careers domain"><Input defaultValue="careers.acme.com" /></Field>
              <Field label="Interviewer name"><Input defaultValue="Aria" /></Field>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
