import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, cx } from '../../ui'
import { Globe, Check } from 'lucide-react'

const days = [
  { d: 'Mon', n: 22, slots: 0 }, { d: 'Tue', n: 23, slots: 6 }, { d: 'Wed', n: 24, slots: 8 },
  { d: 'Thu', n: 25, slots: 5 }, { d: 'Fri', n: 26, slots: 7 }, { d: 'Sat', n: 27, slots: 0 },
  { d: 'Sun', n: 28, slots: 0 }, { d: 'Mon', n: 29, slots: 9 },
]
const times = ['09:00', '09:45', '10:30', '11:15', '14:00', '14:45', '15:30', '16:15']

export default function Schedule() {
  const nav = useNavigate()
  const [day, setDay] = useState(2)
  const [slot, setSlot] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const sel = days[day]

  if (done) return (
    <div className="text-center py-8">
      <span className="inline-flex w-12 h-12 rounded-full bg-ok-subtle items-center justify-center mb-4">
        <Check size={22} className="text-ok" />
      </span>
      <h1 className="text-2xl font-semibold mb-2">You're booked</h1>
      <p className="text-ink-2 mb-1">Thursday, 24 September 2026</p>
      <p className="text-ink-2 mb-8">{slot} – 15:15 IST · 45 minutes</p>
      <Card className="p-5 text-left mb-6">
        <p className="text-sm font-semibold mb-1">Test your camera and mic now</p>
        <p className="text-sm text-ink-2 mb-4">
          Two minutes today saves a scramble on the day. Most problems are device permissions,
          and they're much easier to fix before the clock is running.
        </p>
        <Button size="lg" onClick={() => nav('/ready')}>Run the device check</Button>
      </Card>
      <div className="flex gap-2 justify-center text-sm">
        <a href="#" className="text-brand hover:underline">Add to calendar</a>
        <span className="text-ink-3">·</span>
        <a href="#" className="text-brand hover:underline">Reschedule</a>
      </div>
      <p className="text-xs text-ink-3 mt-6">Reminders arrive 24 hours and 1 hour before.</p>
    </div>
  )

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-1">Choose your interview time</h1>
      <p className="text-ink-2 mb-6">Round 1 · Technical screen · 45 minutes</p>

      <div className="flex items-center gap-2 p-3 rounded bg-subtle text-sm mb-5">
        <Globe size={15} className="text-ink-2 shrink-0" />
        <span>Times shown in <strong>India Standard Time</strong> (IST, UTC+5:30)</span>
        <button className="ml-auto text-brand font-semibold text-xs">Change</button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {days.map((d, i) => (
          <button key={i} onClick={() => d.slots && setDay(i)} disabled={!d.slots}
            className={cx(
              'shrink-0 w-16 h-[72px] rounded-lg border flex flex-col items-center justify-center gap-0.5 transition-colors',
              !d.slots ? 'opacity-35 cursor-not-allowed border-line'
                : i === day ? 'bg-brand text-white border-brand'
                : 'bg-surface border-line hover:border-line-strong',
            )}>
            <span className="text-[11px] opacity-70">{d.d}</span>
            <span className="text-lg font-semibold leading-none">{d.n}</span>
            {d.slots > 0 && <span className={cx('w-1 h-1 rounded-full', i === day ? 'bg-white' : 'bg-brand')} />}
          </button>
        ))}
      </div>

      <p className="text-sm font-semibold mb-3">{sel.d}, {sel.n} September · {sel.slots} slots</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
        {times.map(t => (
          <button key={t} onClick={() => setSlot(t)}
            className={cx(
              'h-12 rounded-full border text-sm font-semibold transition-colors',
              slot === t ? 'bg-brand text-white border-brand' : 'bg-surface border-line-strong hover:border-brand',
            )}>
            {t}
          </button>
        ))}
      </div>

      {slot && (
        <Card className="p-5 mb-4">
          <p className="font-semibold mb-1">Thursday, 24 September 2026, {slot}–15:15 IST</p>
          <p className="text-xs text-ink-3 mb-4">11:00–11:45 for the hiring team in London</p>
          <Button size="lg" className="w-full" onClick={() => setDone(true)}>Confirm this time</Button>
        </Card>
      )}

      <div className="flex gap-4 text-sm">
        <a href="#" className="text-brand hover:underline">No times work for me</a>
        <a href="#" className="text-brand hover:underline">I need an accommodation</a>
      </div>
    </div>
  )
}
