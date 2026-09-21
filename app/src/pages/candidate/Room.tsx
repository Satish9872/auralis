import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Waveform, Button, cx } from '../../ui'
import { script } from '../../data'
import {
  Mic, MicOff, VideoIcon, VideoOff, Captions, RotateCcw, Coffee, HelpCircle, PhoneOff, Wifi,
} from 'lucide-react'

type AiState = 'idle' | 'listening' | 'thinking' | 'speaking'

export default function Room() {
  const nav = useNavigate()
  const [i, setI] = useState(0)
  const [state, setState] = useState<AiState>('speaking')
  const [muted, setMuted] = useState(false)
  const [cam, setCam] = useState(true)
  const [caps, setCaps] = useState(true)
  const [canvas, setCanvas] = useState(false)
  const [secs, setSecs] = useState(0)
  const [ended, setEnded] = useState(false)
  const timer = useRef<number>(0)

  useEffect(() => {
    timer.current = window.setInterval(() => setSecs(s => s + 1), 1000)
    return () => clearInterval(timer.current)
  }, [])

  // Drive the scripted exchange
  useEffect(() => {
    if (ended) return
    const line = script[i]
    if (!line) return
    if (line.canvas) setCanvas(true)
    if (line.who === 'ai') {
      setState('speaking')
      const t = setTimeout(() => {
        setState('listening')
        if (i + 1 < script.length) setTimeout(() => setI(i + 1), 1800)
      }, 2600 + line.text.length * 18)
      return () => clearTimeout(t)
    } else {
      setState('listening')
      const t = setTimeout(() => {
        setState('thinking')
        setTimeout(() => setI(i + 1), 1400)
      }, 2200)
      return () => clearTimeout(t)
    }
  }, [i, ended])

  const mmss = `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`
  const lastAi = [...script.slice(0, i + 1)].reverse().find(l => l.who === 'ai')

  if (ended) return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <span className="inline-flex w-12 h-12 rounded-full bg-ok-subtle items-center justify-center mb-5">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-ok)" strokeWidth="2.5" strokeLinecap="round"><path d="M4 12l6 6L20 6" /></svg>
        </span>
        <h1 className="text-2xl font-semibold mb-3">That's the end of the interview</h1>
        <p className="text-ink-2 leading-relaxed mb-8">
          Thank you for your time. Your interview has been recorded and will be reviewed.
          You'll hear from us within 2 business days.
        </p>
        <Button size="xl" className="w-full" onClick={() => nav('/feedback')}>Back to my application</Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#12171A', color: 'rgba(255,255,255,.9)' }}>
      {/* progress line */}
      <div className="h-0.5 bg-white/10">
        <div className="h-full bg-brand transition-all duration-500"
          style={{ width: state === 'speaking' ? '100%' : '0%' }} />
      </div>

      {/* top bar */}
      <div className="h-14 px-4 flex items-center gap-4 border-b border-white/10">
        <span className="text-sm font-medium">Round 1 · Technical screen</span>
        <div className="hidden sm:flex gap-1">
          {['System design', 'Coding', 'Debugging', 'Communication'].map((c, n) => (
            <span key={c} title={c} className={cx('w-8 h-1 rounded-full', n === 0 ? 'bg-brand' : 'bg-white/20')} />
          ))}
        </div>
        <div className="flex-1" />
        <span className="font-mono text-sm tabular-nums">{mmss} / 45:00</span>
        <Wifi size={16} className="text-ok" />
      </div>

      <div className={cx('flex-1 flex', canvas ? 'flex-row' : 'flex-col')}>
        {/* stage */}
        <div className={cx('flex flex-col items-center justify-center p-6', canvas ? 'w-[280px] shrink-0 border-r border-white/10' : 'flex-1')}>
          <Waveform state={state} size={canvas ? 120 : 240} />
          <p className="text-xs mt-3 capitalize" style={{ color: 'rgba(255,255,255,.5)' }}>{state}</p>

          {caps && lastAi && (
            <div className={cx('mt-8 text-center', canvas ? 'text-sm' : 'text-lg max-w-[640px]')}>
              <p className="leading-relaxed">{lastAi.text}</p>
            </div>
          )}

          {!canvas && (
            <div className="fixed bottom-24 right-6 w-[200px] rounded-lg overflow-hidden border border-white/15"
                 style={{ background: '#1D2226' }}>
              <div className="aspect-[4/3] flex items-center justify-center text-xs" style={{ color: 'rgba(255,255,255,.4)' }}>
                {cam ? 'You' : 'Camera off'}
              </div>
              <div className="absolute top-2 left-2 flex items-center gap-1.5 text-[10px] font-semibold">
                <span className="live-dot w-1.5 h-1.5 rounded-full bg-live" /> Recording
              </div>
            </div>
          )}
        </div>

        {/* canvas */}
        {canvas && (
          <div className="flex-1 flex flex-col p-4 min-w-0">
            <div className="rounded-lg p-4 mb-3 text-sm" style={{ background: '#1D2226' }}>
              <span className="text-[11px] uppercase tracking-wide" style={{ color: 'rgba(255,255,255,.45)' }}>Current question</span>
              <p className="mt-1">How would you handle the hot partition?</p>
            </div>
            <div className="flex-1 rounded-lg border border-white/10 flex items-center justify-center"
                 style={{ background: '#161B1F', backgroundImage: 'radial-gradient(rgba(255,255,255,.07) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,.35)' }}>
                Whiteboard — draw your approach
              </p>
            </div>
            <p className="text-[11px] mt-2" style={{ color: 'rgba(255,255,255,.4)' }}>Interviewer can see this</p>
          </div>
        )}
      </div>

      {/* controls */}
      <div className="h-[72px] border-t border-white/10 flex items-center justify-center gap-2 px-4" style={{ background: '#1D2226' }}>
        <Ctrl on={!muted} onClick={() => setMuted(m => !m)} icon={muted ? MicOff : Mic} label="Mic" danger={muted} />
        <Ctrl on={cam} onClick={() => setCam(c => !c)} icon={cam ? VideoIcon : VideoOff} label="Camera" />
        <Ctrl on={caps} onClick={() => setCaps(c => !c)} icon={Captions} label="Captions" />
        <Ctrl on onClick={() => {}} icon={RotateCcw} label="Repeat that" />
        <Ctrl on onClick={() => {}} icon={Coffee} label="I need a moment" />
        <Ctrl on onClick={() => {}} icon={HelpCircle} label="Help" />
        <div className="w-4" />
        <button onClick={() => setEnded(true)}
          className="h-12 px-5 rounded-full text-sm font-semibold flex items-center gap-2 text-bad ring-[1.5px] ring-inset ring-bad hover:bg-bad/10">
          <PhoneOff size={16} /> End
        </button>
      </div>

      {muted && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-sm font-medium"
             style={{ background: 'var(--color-bad)', color: '#fff' }}>
          You're muted — the interviewer can't hear you
        </div>
      )}
    </div>
  )
}

function Ctrl({ icon: Icon, label, on, onClick, danger }: any) {
  return (
    <button onClick={onClick} title={label} aria-label={label}
      className={cx('w-12 h-12 rounded-full flex items-center justify-center transition-colors',
        danger ? 'bg-bad text-white' : on ? 'bg-white/10 hover:bg-white/20' : 'bg-white/5 hover:bg-white/10')}>
      <Icon size={18} />
    </button>
  )
}
