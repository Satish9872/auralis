import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Waveform, cx } from '../../ui'
import { Check, AlertTriangle, Camera, Mic, Volume2, Wifi, Loader2 } from 'lucide-react'

const checks = [
  { key: 'cam', icon: Camera, label: 'Camera', pass: 'Working · 1280×720' },
  { key: 'mic', icon: Mic, label: 'Microphone', pass: 'Working · Good level' },
  { key: 'spk', icon: Volume2, label: 'Speakers', pass: 'Test sound played' },
  { key: 'net', icon: Wifi, label: 'Connection', pass: 'Strong · 18 Mbps down, 6 up', warn: true },
]

export default function Ready() {
  const nav = useNavigate()
  const [step, setStep] = useState(0)
  const [done, setDone] = useState<string[]>([])

  useEffect(() => {
    if (step !== 0) return
    let i = 0
    const t = setInterval(() => {
      i++
      setDone(checks.slice(0, i).map(c => c.key))
      if (i >= checks.length) clearInterval(t)
    }, 700)
    return () => clearInterval(t)
  }, [step])

  const allDone = done.length === checks.length

  if (step === 1) return (
    <div>
      <div className="flex gap-1 mb-8">
        {[0, 1, 2].map(i => <span key={i} className={cx('h-1 flex-1 rounded-full', i <= 1 ? 'bg-brand' : 'bg-line')} />)}
      </div>
      <h1 className="text-2xl font-semibold tracking-tight mb-6">Before we start</h1>

      <Card className="p-6 mb-4">
        <h2 className="font-semibold mb-3">What happens</h2>
        <p className="text-ink-2 leading-relaxed mb-4">
          This round runs about 45 minutes. Your interviewer is an AI called Aria. It will ask
          follow-up questions based on what you say, and may open a whiteboard or code editor.
          You can ask it to repeat or clarify anything, at any time.
        </p>
        <h3 className="font-semibold text-sm mb-2">What we record</h3>
        <ul className="text-sm text-ink-2 space-y-1.5 mb-4">
          <li>· Video and audio of the interview</li>
          <li>· What you write on the whiteboard or in the editor</li>
          <li>· A transcript of the conversation</li>
        </ul>
        <div className="p-3 rounded bg-brand-subtle text-sm leading-relaxed">
          Your video is used to confirm it's you and that the interview runs fairly.
          It is <strong>never</strong> used to judge your skills — that comes only from what
          you say and what you build.
        </div>
      </Card>

      <Card className="p-6 mb-6">
        <h3 className="font-semibold text-sm mb-3">What we don't do</h3>
        <ul className="text-sm text-ink-2 space-y-1.5">
          <li>· No screen recording</li>
          <li>· No keystroke logging outside the editor</li>
          <li>· No browser lockdown, no software to install</li>
        </ul>
      </Card>

      <Button size="xl" className="w-full mb-3" onClick={() => setStep(2)}>I understand — continue</Button>
      <p className="text-center"><a href="#" className="text-sm text-brand hover:underline">I have questions</a></p>
    </div>
  )

  if (step === 2) return (
    <div className="text-center">
      <div className="flex gap-1 mb-10">
        {[0, 1, 2].map(i => <span key={i} className="h-1 flex-1 rounded-full bg-brand" />)}
      </div>
      <p className="text-sm text-ink-2 mb-6">A quick warm-up before the real thing</p>
      <div className="flex justify-center mb-3"><Waveform state="speaking" /></div>
      <p className="text-xs text-ink-3 mb-8">Speaking</p>
      <Card className="p-6 mb-6 text-left">
        <p className="leading-relaxed">
          "Hi Priya — before we begin properly, one warm-up question.
          Tell me in a sentence what you're hoping to work on next."
        </p>
      </Card>
      <div className="p-3 rounded bg-brand-subtle text-sm mb-8">
        Tip: you can interrupt at any time — just start speaking.
      </div>
      <Button size="xl" className="w-full mb-3" onClick={() => nav('/room')}>I'm ready to start</Button>
      <button className="text-sm text-brand hover:underline">Run that again</button>
    </div>
  )

  return (
    <div>
      <div className="flex gap-1 mb-8">
        {[0, 1, 2].map(i => <span key={i} className={cx('h-1 flex-1 rounded-full', i === 0 ? 'bg-brand' : 'bg-line')} />)}
      </div>
      <h1 className="text-2xl font-semibold tracking-tight mb-1">Let's check your setup</h1>
      <p className="text-ink-2 mb-6">This takes about thirty seconds.</p>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <Card className="p-3">
          <div className="aspect-video rounded bg-subtle flex items-center justify-center text-ink-3 text-sm">
            Camera preview
          </div>
          <div className="flex gap-0.5 mt-3 h-4 items-end">
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className={cx('flex-1 rounded-sm', i < 7 ? 'bg-ok' : 'bg-line')}
                style={{ height: `${30 + Math.abs(Math.sin(i)) * 70}%` }} />
            ))}
          </div>
          <p className="text-xs text-ink-3 mt-2">Say something to test your microphone</p>
        </Card>

        <div className="space-y-2">
          {checks.map(c => {
            const ok = done.includes(c.key)
            return (
              <Card key={c.key} className="p-3 flex items-center gap-3">
                {!ok ? <Loader2 size={18} className="text-ink-3 animate-spin shrink-0" />
                  : c.warn ? <AlertTriangle size={18} className="text-warn shrink-0" />
                  : <Check size={18} className="text-ok shrink-0" />}
                <div className="min-w-0">
                  <p className="text-sm font-medium">{c.label}</p>
                  <p className="text-xs text-ink-3 truncate">{ok ? c.pass : 'Checking…'}</p>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      <Button size="xl" className="w-full" disabled={!allDone} onClick={() => setStep(1)}>
        {allDone ? 'Everything works — continue' : 'Checking your setup…'}
      </Button>
      <p className="text-center mt-3"><a href="#" className="text-sm text-brand hover:underline">Something isn't working</a></p>
    </div>
  )
}
