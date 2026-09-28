import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Card, Button, Empty, cx } from '../../ui'
import { api } from '../../api'
import { useAsync } from '../../hooks'
import { Globe, Check, AlertTriangle } from 'lucide-react'

const TZ = Intl.DateTimeFormat().resolvedOptions().timeZone

export default function Schedule() {

  const [params] = useSearchParams()
  const interviewId = params.get('interview') || ''
  const jobId = params.get('job') || ''

  const { data: slots, loading, error, reload } = useAsync(() => api.slots(jobId), [jobId])
  const [sel, setSel] = useState<string | null>(null)
  const [dayKey, setDayKey] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)

  if (loading) return <Empty title="Loading available times…" />
  if (error) return <Empty title="Couldn't load slots" body={error} />
  if (!slots?.length) return <Empty title="No slots available" body="All interview slots for this role are taken." />

  const byDay = slots.reduce<Record<string, typeof slots>>((acc, s) => {
    const k = new Date(s.starts_at).toDateString()
    ;(acc[k] ||= []).push(s)
    return acc
  }, {})
  const days = Object.keys(byDay)
  const activeDay = dayKey && byDay[dayKey] ? dayKey : days[0]

  async function confirm() {
    if (!sel) return
    setBusy(true); setErr(null)
    try {
      const r = await api.schedule(interviewId, sel)
      setDone(r.scheduled_at)
    } catch (e) {
      setErr((e as Error).message)
      setSel(null)
      reload()
    } finally {
      setBusy(false)
    }
  }

  if (done) return (
    <div className="text-center py-8">
      <span className="inline-flex w-12 h-12 rounded-full bg-ok-subtle items-center justify-center mb-4">
        <Check size={22} className="text-ok" />
      </span>
      <h1 className="text-2xl font-semibold mb-2">You're booked</h1>
      <p className="text-ink-2 mb-1">
        {new Date(done).toLocaleString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
      </p>
      <p className="text-ink-2 mb-8">
        {new Date(done).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} · 45 minutes · {TZ}
      </p>
      <Link to={`/ready?interview=${interviewId}`}>
        <Button size="xl" className="w-full mb-3">Run the device check</Button>
      </Link>
      <Link to="/status" className="text-sm text-brand hover:underline">Back to my application</Link>
    </div>
  )

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-1">Choose your interview time</h1>
      <p className="text-ink-2 mb-6">45 minutes · conducted by Aria</p>

      <div className="flex items-center gap-2 p-3 rounded bg-subtle text-sm mb-5">
        <Globe size={15} className="text-ink-2 shrink-0" />
        <span>Times shown in <strong>{TZ}</strong> — your device timezone</span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {days.map(d => {
          const date = new Date(d)
          const on = d === activeDay
          return (
            <button key={d} onClick={() => { setDayKey(d); setSel(null) }}
              className={cx('shrink-0 w-16 h-[72px] rounded-lg border flex flex-col items-center justify-center gap-0.5',
                on ? 'bg-brand text-white border-brand' : 'bg-surface border-line hover:border-line-strong')}>
              <span className="text-[11px] opacity-70">{date.toLocaleDateString(undefined, { weekday: 'short' })}</span>
              <span className="text-lg font-semibold leading-none">{date.getDate()}</span>
              <span className={cx('text-[10px]', on ? 'opacity-80' : 'text-ink-3')}>{byDay[d].length}</span>
            </button>
          )
        })}
      </div>

      <p className="text-sm font-semibold mb-3">
        {new Date(activeDay).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
        <span className="font-normal text-ink-3"> · {byDay[activeDay].length} slots</span>
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
        {byDay[activeDay].map(s => (
          <button key={s.id} onClick={() => setSel(s.id)}
            className={cx('h-12 rounded-full border text-sm font-semibold transition-colors',
              sel === s.id ? 'bg-brand text-white border-brand' : 'bg-surface border-line-strong hover:border-brand')}>
            {new Date(s.starts_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
          </button>
        ))}
      </div>

      {err && (
        <div className="flex gap-2 p-3 rounded bg-bad-subtle text-sm mb-4">
          <AlertTriangle size={16} className="text-bad shrink-0 mt-0.5" />
          <span>{err}</span>
        </div>
      )}

      {sel && (
        <Card className="p-5">
          <p className="font-semibold mb-4">
            {new Date(byDay[activeDay].find(s => s.id === sel)!.starts_at)
              .toLocaleString(undefined, { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
          </p>
          <Button size="lg" className="w-full" disabled={busy} onClick={confirm}>
            {busy ? 'Booking…' : 'Confirm this time'}
          </Button>
        </Card>
      )}
    </div>
  )
}
