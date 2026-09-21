import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Input, Field, Chip } from '../../ui'
import { UploadCloud, Check, Sparkles } from 'lucide-react'

export default function Apply() {
  const nav = useNavigate()
  const [parsed, setParsed] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [consent, setConsent] = useState(false)
  const [privacy, setPrivacy] = useState(false)

  const drop = () => {
    setParsing(true)
    setTimeout(() => { setParsing(false); setParsed(true) }, 1400)
  }

  return (
    <div>
      <p className="text-xs text-ink-3 mb-2">Acme Technologies · Mumbai · Hybrid</p>
      <h1 className="text-3xl font-semibold tracking-tight mb-2">Senior Backend Engineer</h1>
      <p className="text-ink-2 mb-8">Typically 12 minutes. You'll hear back within the hour.</p>

      <Card className="p-6 mb-4">
        <h2 className="font-semibold mb-1">Your resume</h2>
        <p className="text-sm text-ink-2 mb-4">We'll read it and fill in the rest for you.</p>

        {!parsed ? (
          <button onClick={drop} disabled={parsing}
            className="w-full border-2 border-dashed border-line-strong rounded-lg py-10 flex flex-col items-center gap-2 hover:border-brand hover:bg-brand-subtle/40 transition-colors disabled:opacity-60">
            {parsing ? (
              <><Sparkles size={22} className="text-brand animate-pulse" />
                <span className="text-sm font-medium">Reading your resume…</span></>
            ) : (
              <><UploadCloud size={22} className="text-ink-3" />
                <span className="text-sm font-medium">Drop a PDF or DOCX, or click to browse</span>
                <span className="text-xs text-ink-3">Up to 10 MB</span></>
            )}
          </button>
        ) : (
          <div className="flex items-center gap-3 p-3 rounded bg-ok-subtle">
            <Check size={16} className="text-ok shrink-0" />
            <span className="text-sm flex-1">priya-sharma-resume.pdf</span>
            <button onClick={() => setParsed(false)} className="text-xs text-brand font-semibold">Replace</button>
          </div>
        )}
      </Card>

      {parsed && (
        <>
          <div className="flex items-start gap-2 p-3 rounded bg-brand-subtle text-sm mb-4">
            <Sparkles size={15} className="text-brand mt-0.5 shrink-0" />
            <span>We filled these in from your resume. Please check them.</span>
          </div>

          <Card className="p-6 mb-4 space-y-4">
            <h2 className="font-semibold">About you</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Full name"><Input defaultValue="Priya Sharma" /></Field>
              <Field label="Email"><Input defaultValue="priya.sharma@email.com" type="email" /></Field>
              <Field label="Phone"><Input defaultValue="+91 98204 41027" /></Field>
              <Field label="Location"><Input defaultValue="Mumbai, India" /></Field>
            </div>
            <div>
              <span className="block text-xs font-semibold text-ink-2 mb-2">Skills we found</span>
              <div className="flex flex-wrap gap-1.5">
                {['Go', 'PostgreSQL', 'Kafka', 'Kubernetes', 'System design', 'Payments'].map(s => (
                  <Chip key={s} tone="brand">{s}</Chip>
                ))}
              </div>
            </div>
          </Card>

          <Card className="p-6 mb-4">
            <h2 className="font-semibold mb-4">A few questions</h2>
            <Field label="What's your notice period?"><Input placeholder="e.g. 60 days" /></Field>
            <div className="h-4" />
            <Field label="Have you worked on payment systems at scale?">
              <Input placeholder="A sentence is fine" />
            </Field>
          </Card>

          <Card className="p-6 mb-6 space-y-3">
            <label className="flex gap-3 text-sm cursor-pointer">
              <input type="checkbox" className="mt-0.5 shrink-0" checked={consent} onChange={e => setConsent(e.target.checked)} />
              <span>I understand an AI system will evaluate this application and conduct my interviews.{' '}
                <a href="#" className="text-brand hover:underline">How this works</a></span>
            </label>
            <label className="flex gap-3 text-sm cursor-pointer">
              <input type="checkbox" className="mt-0.5 shrink-0" checked={privacy} onChange={e => setPrivacy(e.target.checked)} />
              <span>I agree to the <a href="#" className="text-brand hover:underline">privacy policy</a> and data processing.</span>
            </label>
            <div className="pt-1">
              <a href="#" className="text-sm text-brand font-semibold hover:underline">Request an alternative selection process</a>
            </div>
          </Card>

          <Button size="xl" className="w-full" disabled={!consent || !privacy} onClick={() => nav('/status')}>
            Submit application
          </Button>
          {(!consent || !privacy) && (
            <p className="text-xs text-ink-3 text-center mt-2">Both boxes above are required to continue.</p>
          )}
        </>
      )}
    </div>
  )
}
