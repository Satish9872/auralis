import { Card, CardHead, Chip, PageHead } from '../../ui'

const funnel = [
  { s: 'Applied', n: 247, conv: null }, { s: 'Screened', n: 84, conv: 34 },
  { s: 'Scheduled', n: 61, conv: 73 }, { s: 'Interviewed', n: 48, conv: 79 },
  { s: 'Reviewed', n: 48, conv: 100 }, { s: 'Shortlisted', n: 5, conv: 10 },
]

const fairness = [
  { g: 'Group A', app: 1240, sel: 186, rate: 15.0, ratio: 1.00, st: 'ok' as const },
  { g: 'Group B', app: 890, sel: 122, rate: 13.7, ratio: 0.91, st: 'ok' as const },
  { g: 'Group C', app: 410, sel: 49, rate: 12.0, ratio: 0.80, st: 'warn' as const },
  { g: 'Group D', app: 215, sel: 21, rate: 9.8, ratio: 0.65, st: 'bad' as const },
]

export default function Insights() {
  return (
    <>
      <PageHead crumb="Insights" title="Funnel & fairness" />

      <Card className="mb-4">
        <CardHead title="Hiring funnel" sub="Last 90 days · Senior Backend Engineer" />
        <div className="border-t border-line p-4 space-y-3">
          {funnel.map(f => (
            <div key={f.s} className="flex items-center gap-3">
              <span className="w-24 text-sm text-ink-2 shrink-0">{f.s}</span>
              <div className="flex-1 h-7 rounded bg-subtle overflow-hidden">
                <div className="h-full bg-brand flex items-center px-2 text-white text-xs font-semibold"
                  style={{ width: `${(f.n / 247) * 100}%`, opacity: 0.55 + (f.n / 247) * 0.45 }}>
                  {f.n}
                </div>
              </div>
              <span className="w-24 text-xs text-ink-3 text-right shrink-0">
                {f.conv != null && <>{f.conv}% from prev{f.conv < 40 && f.s !== 'Shortlisted' && <span className="text-warn font-semibold"> ⚠</span>}</>}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-line p-4 bg-subtle/50">
          <p className="text-sm text-ink-2 leading-relaxed">
            <strong className="text-ink">Scheduling drop-off is 27%</strong> — candidates pass screening but
            don't book. The interview window may be too narrow for this role.
          </p>
        </div>
      </Card>

      <Card>
        <CardHead title="Fairness monitor"
          sub="Impact ratios against the four-fifths rule"
          action={<div className="flex gap-1.5">
            <Chip tone="neutral">NYC LL144</Chip><Chip tone="neutral">EU AI Act</Chip>
          </div>} />
        <div className="border-t border-line overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-subtle">
                {['Group', 'Applicants', 'Selected', 'Rate', 'Impact ratio', 'Status'].map(h => (
                  <th key={h} className="text-left text-[11px] uppercase tracking-wide font-semibold text-ink-2 px-3 h-10">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fairness.map(f => (
                <tr key={f.g} className="border-b border-line last:border-0">
                  <td className="px-3 py-3 font-medium">{f.g}</td>
                  <td className="px-3 py-3 tabular-nums">{f.app}</td>
                  <td className="px-3 py-3 tabular-nums">{f.sel}</td>
                  <td className="px-3 py-3 tabular-nums">{f.rate}%</td>
                  <td className="px-3 py-3 tabular-nums font-semibold">{f.ratio.toFixed(2)}</td>
                  <td className="px-3 py-3">
                    <Chip tone={f.st}>
                      {f.st === 'ok' ? 'Within range' : f.st === 'warn' ? 'Monitor' : 'Below threshold'}
                    </Chip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-line p-4 bg-bad-subtle">
          <p className="text-sm leading-relaxed">
            <strong>Group D is at 0.65</strong>, below the 0.80 threshold. Stage analysis shows the
            disparity enters at <strong>human override</strong>, not at model scoring — recruiters
            declined 9 candidates the rubric had passed.
          </p>
        </div>
      </Card>
    </>
  )
}
