import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Waveform, Button, cx } from '../../ui'
import { api, type Turn } from '../../api'
import { Send, PhoneOff, Loader2, PanelRightClose, AlertTriangle } from 'lucide-react'

type AiState = 'idle' | 'listening' | 'thinking' | 'speaking'

export default function Room() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const interviewId = params.get('interview') || ''

  const [transcript, setTranscript] = useState<Turn[]>([])
  const [state, setState] = useState<AiState>('idle')
  const [answer, setAnswer] = useState('')
  const [canvas, setCanvas] = useState(false)
  const [canvasMode, setCanvasMode] = useState('none')
  const [canvasText, setCanvasText] = useState('')
  const [competency, setCompetency] = useState('')
  const [secs, setSecs] = useState(0)
  const [ending, setEnding] = useState(false)
  const [finished, setFinished] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [aiMode, setAiMode] = useState('')
  const started = useRef(false)
  const scroller = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = setInterval(() => setSecs(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (started.current || !interviewId) return
    started.current = true
    setState('thinking')
    api.startInterview(interviewId)
      .then(r => {
        setTranscript(r.transcript)
        setCompetency(r.competency)
        setCanvas(r.open_canvas)
        setCanvasMode(r.canvas_mode)
        setAiMode(r.ai)
        setState('listening')
      })
      .catch(e => { setErr(e.message); setState('idle') })
  }, [interviewId])

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' })
  }, [transcript])

  async function send() {
    const text = answer.trim()
    if (!text || state === 'thinking') return
    setAnswer('')
    setTranscript(t => [...t, { who: 'candidate', text }])
    setState('thinking')
    setErr(null)
    try {
      const r = await api.turn(interviewId, text, canvasText || undefined)
      setTranscript(r.transcript)
      setCompetency(r.competency)
      setCanvas(r.open_canvas)
      setCanvasMode(r.canvas_mode)
      setState('listening')
      if (r.should_end) finish()
    } catch (e) {
      setErr((e as Error).message)
      setState('listening')
    }
  }

  async function finish() {
    setEnding(true)
    setState('thinking')
    try {
      await api.finish(interviewId)
      setFinished(true)
    } catch (e) {
      setErr((e as Error).message)
      setEnding(false)
    }
  }

  const mmss = `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`

  if (!interviewId) return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#12171A', color: '#fff' }}>
      <p>No interview specified. Start from your application status page.</p>
    </div>
  )

  if (finished) return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#12171A', color: 'rgba(255,255,255,.9)' }}>
      <div className="max-w-md text-center">
        <span className="inline-flex w-12 h-12 rounded-full items-center justify-center mb-5" style={{ background: 'rgba(1,117,79,.2)' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#44C98F" strokeWidth="2.5" strokeLinecap="round"><path d="M4 12l6 6L20 6" /></svg>
        </span>
        <h1 className="text-2xl font-semibold mb-3">That's the end of the interview</h1>
        <p className="opacity-70 leading-relaxed mb-8">
          Your answers have been evaluated against the rubric. The scorecard is ready.
        </p>
        <Button size="xl" className="w-full" onClick={() => nav(`/feedback?interview=${interviewId}`)}>
          See my result
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#12171A', color: 'rgba(255,255,255,.9)' }}>
      <div className="h-0.5" style={{ background: 'rgba(255,255,255,.1)' }}>
        <div className="h-full bg-brand transition-all duration-700" style={{ width: state === 'thinking' ? '70%' : '0%' }} />
      </div>

      <div className="h-14 px-4 flex items-center gap-4 border-b" style={{ borderColor: 'rgba(255,255,255,.1)' }}>
        <span className="text-sm font-medium">Technical screen</span>
        {competency && <span className="text-xs px-2 py-0.5 rounded-full bg-brand/20 text-brand">{competency}</span>}
        <div className="flex-1" />
        {aiMode && (
          <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,.1)' }}>
            {aiMode === 'claude' ? 'Claude live' : 'fallback mode'}
          </span>
        )}
        <span className="font-mono text-sm tabular-nums">{mmss}</span>
      </div>

      <div className={cx('flex-1 flex min-h-0', canvas ? 'flex-row' : 'flex-col')}>
        <div className={cx('flex flex-col min-h-0', canvas ? 'w-[46%] shrink-0 border-r' : 'flex-1')}
             style={canvas ? { borderColor: 'rgba(255,255,255,.1)' } : undefined}>
          <div className="flex flex-col items-center pt-6 pb-3 shrink-0">
            <Waveform state={state} size={canvas ? 140 : 220} />
            <p className="text-xs mt-2 capitalize" style={{ color: 'rgba(255,255,255,.45)' }}>
              {state === 'thinking' ? 'Aria is thinking…' : state === 'listening' ? 'Your turn' : state}
            </p>
          </div>

          <div ref={scroller} className="flex-1 overflow-y-auto px-6 pb-4 space-y-4 min-h-0">
            {transcript.map((t, i) => (
              <div key={i} className={cx('max-w-[600px] mx-auto w-full', t.who === 'candidate' && 'text-right')}>
                <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: 'rgba(255,255,255,.35)' }}>
                  {t.who === 'ai' ? 'Aria' : 'You'}
                </p>
                <p className={cx('inline-block text-left leading-relaxed rounded-lg px-4 py-2.5',
                  t.who === 'ai' ? 'text-base' : 'text-sm')}
                  style={t.who === 'candidate'
                    ? { background: 'rgba(10,102,194,.25)' }
                    : { background: 'rgba(255,255,255,.06)' }}>
                  {t.text}
                </p>
              </div>
            ))}
            {state === 'thinking' && (
              <div className="max-w-[600px] mx-auto flex gap-2 items-center text-sm" style={{ color: 'rgba(255,255,255,.45)' }}>
                <Loader2 size={14} className="animate-spin" /> Aria is composing a follow-up…
              </div>
            )}
          </div>

          {err && (
            <div className="mx-6 mb-2 flex gap-2 p-2.5 rounded text-sm" style={{ background: 'rgba(178,64,32,.25)' }}>
              <AlertTriangle size={15} className="shrink-0 mt-0.5" /> <span>{err}</span>
            </div>
          )}

          <div className="p-4 border-t shrink-0" style={{ borderColor: 'rgba(255,255,255,.1)' }}>
            <div className="max-w-[640px] mx-auto flex gap-2">
              <textarea
                value={answer} onChange={e => setAnswer(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                rows={2} placeholder="Type your answer… (Enter to send, Shift+Enter for a new line)"
                disabled={state === 'thinking' || ending}
                className="flex-1 px-3 py-2 text-sm rounded-lg resize-none outline-none disabled:opacity-50"
                style={{ background: 'rgba(255,255,255,.07)', color: 'rgba(255,255,255,.9)' }}
              />
              <button onClick={send} disabled={!answer.trim() || state === 'thinking' || ending}
                className="w-12 h-12 self-end rounded-full bg-brand text-white flex items-center justify-center disabled:opacity-40">
                <Send size={17} />
              </button>
            </div>
            <div className="max-w-[640px] mx-auto flex justify-between items-center mt-2">
              <p className="text-[11px]" style={{ color: 'rgba(255,255,255,.35)' }}>
                {transcript.filter(t => t.who === 'candidate').length} answers given
              </p>
              <button onClick={finish} disabled={ending}
                className="text-xs font-semibold flex items-center gap-1.5 px-3 h-8 rounded-full"
                style={{ color: '#F5836B', boxShadow: 'inset 0 0 0 1.5px #F5836B' }}>
                <PhoneOff size={13} /> {ending ? 'Evaluating…' : 'End & evaluate'}
              </button>
            </div>
          </div>
        </div>

        {canvas && (
          <div className="flex-1 flex flex-col p-4 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs uppercase tracking-wide" style={{ color: 'rgba(255,255,255,.45)' }}>
                {canvasMode.replace('-', ' ')}
              </span>
              <div className="flex-1" />
              <button onClick={() => setCanvas(false)} className="opacity-50 hover:opacity-100"><PanelRightClose size={16} /></button>
            </div>
            <textarea
              value={canvasText} onChange={e => setCanvasText(e.target.value)}
              placeholder={canvasMode === 'code'
                ? '// write your solution here'
                : 'Describe your architecture — components, how they connect, where state lives.\n\nThis is sent with your next answer and evaluated alongside it.'}
              className="flex-1 p-4 rounded-lg font-mono text-sm resize-none outline-none leading-relaxed"
              style={{ background: '#161B1F', color: 'rgba(255,255,255,.85)', border: '1px solid rgba(255,255,255,.1)' }}
            />
            <p className="text-[11px] mt-2" style={{ color: 'rgba(255,255,255,.4)' }}>
              Aria can see this · sent with your next answer
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
