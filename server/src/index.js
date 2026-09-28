import express from 'express'
import cors from 'cors'
import { db, id, now, logEvent, J } from './db.js'
import { parseResume, scoreResume, interviewTurn, evaluate, hasKey } from './claude.js'
import { ensureSeed } from './seed.js'

const app = express()
app.use(cors())
app.use(express.json({ limit: '2mb' }))

const TENANT = 'ten_acme'
const ROUNDS = [
  { n: 1, name: 'Technical screen', mins: 45 },
  { n: 2, name: 'Deep dive', mins: 60 },
  { n: 3, name: 'Team fit', mins: 45 },
]

const wrap = fn => (req, res) => Promise.resolve(fn(req, res)).catch(e => {
  console.error(e); res.status(500).json({ error: e.message })
})

const jobOut = j => ({
  ...j,
  must_haves: J(j.must_haves), nice_to_haves: J(j.nice_to_haves), competencies: J(j.competencies),
})

/* ============ health ============ */
app.get('/api/health', (_, res) => res.json({
  ok: true,
  ai: hasKey() ? 'claude' : 'fallback',
  note: hasKey() ? 'Live Claude calls enabled' : 'Set ANTHROPIC_API_KEY for real AI; deterministic fallbacks in use',
}))

/* ============ jobs ============ */
app.get('/api/jobs', wrap((req, res) => {
  const rows = db.prepare('SELECT * FROM jobs WHERE tenant_id=? ORDER BY created_at DESC').all(TENANT)
  res.json(rows.map(j => {
    const c = db.prepare(`SELECT
        COUNT(*) applied,
        SUM(stage NOT IN ('Applied','Declined')) screened,
        SUM(stage IN ('Interviewing','Reviewed','Shortlisted')) interviewed,
        SUM(stage='Shortlisted') shortlisted
      FROM applications WHERE job_id=?`).get(j.id)
    return { ...jobOut(j), counts: { applied: c.applied || 0, screened: c.screened || 0, interviewed: c.interviewed || 0, shortlisted: c.shortlisted || 0 } }
  }))
}))

app.get('/api/jobs/:id', wrap((req, res) => {
  const j = db.prepare('SELECT * FROM jobs WHERE id=?').get(req.params.id)
  if (!j) return res.status(404).json({ error: 'Job not found' })
  res.json(jobOut(j))
}))

app.post('/api/jobs', wrap((req, res) => {
  const b = req.body
  const jid = id('job')
  db.prepare(`INSERT INTO jobs (id,tenant_id,title,dept,location,type,status,description,must_haves,nice_to_haves,competencies,threshold,owner,created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
    jid, TENANT, b.title, b.dept || 'Engineering', b.location || 'Remote', b.type || 'Full-time',
    b.status || 'Open', b.description || '',
    JSON.stringify(b.must_haves || []), JSON.stringify(b.nice_to_haves || []),
    JSON.stringify(b.competencies || ['System design', 'Coding', 'Communication']),
    b.threshold ?? 3.5, b.owner || 'Kavya Reddy', now())
  logEvent(TENANT, 'human', 'u_kavya', 'job.created', 'job', jid, { title: b.title })
  // generate slots for the next 14 days
  const stmt = db.prepare('INSERT INTO slots (id,job_id,starts_at,duration_min) VALUES (?,?,?,?)')
  for (let d = 1; d <= 14; d++) {
    const day = new Date(Date.now() + d * 864e5)
    if (day.getDay() === 0 || day.getDay() === 6) continue
    for (const h of [9, 10, 11, 14, 15, 16]) {
      day.setHours(h, 0, 0, 0)
      stmt.run(id('slot'), jid, day.toISOString(), 45)
    }
  }
  res.status(201).json(jobOut(db.prepare('SELECT * FROM jobs WHERE id=?').get(jid)))
}))

/* ============ applications ============ */
app.post('/api/applications', wrap(async (req, res) => {
  const { job_id, resume_text, name, email } = req.body
  const job = db.prepare('SELECT * FROM jobs WHERE id=?').get(job_id)
  if (!job) return res.status(404).json({ error: 'Job not found' })
  if (!resume_text || resume_text.trim().length < 40)
    return res.status(400).json({ error: 'resume_text is required (at least 40 characters)' })

  const parsed = await parseResume(resume_text)
  const p = parsed.data
  if (name) p.name = name
  if (email) p.email = email

  const cid = id('cand')
  db.prepare(`INSERT INTO candidates (id,name,email,phone,location,current_title,resume_text,skills,years_experience,created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?)`).run(
    cid, p.name, p.email, p.phone, p.location, p.current_title,
    resume_text, JSON.stringify(p.skills || []), p.years_experience || 0, now())

  const scored = await scoreResume({ job: jobOut(job), profile: p, resumeText: resume_text })
  const s = scored.data
  const passed = s.score >= 70
  const aid = id('app')
  const token = id('tok')

  db.prepare(`INSERT INTO applications (id,tenant_id,job_id,candidate_id,stage,ats_score,ats_reasoning,ats_matched,ats_gaps,source,token,created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`).run(
    aid, TENANT, job_id, cid, passed ? 'Screened' : 'Declined',
    s.score, s.reasoning, JSON.stringify(s.matched || []), JSON.stringify(s.gaps || []),
    req.body.source || 'Careers page', token, now())

  logEvent(TENANT, 'agent', 'agent.screener', 'application.scored', 'application', aid,
    { score: s.score, passed, source: scored.source })

  if (passed) {
    db.prepare(`INSERT INTO interviews (id,application_id,round,round_name,status,created_at)
      VALUES (?,?,?,?,?,?)`).run(id('int'), aid, 1, ROUNDS[0].name, 'Awaiting scheduling', now())
  }

  res.status(201).json({
    application_id: aid, token, stage: passed ? 'Screened' : 'Declined',
    ats: { score: s.score, reasoning: s.reasoning, matched: s.matched, gaps: s.gaps },
    profile: p,
    ai: { parse: parsed.source, score: scored.source },
  })
}))

const appDetail = (where, arg) => {
  const a = db.prepare(`SELECT a.*, c.name,c.email,c.phone,c.location,c.current_title,c.skills,c.years_experience,c.resume_text,
    j.title job_title, j.competencies, j.threshold
    FROM applications a JOIN candidates c ON c.id=a.candidate_id JOIN jobs j ON j.id=a.job_id
    WHERE ${where}`).get(arg)
  if (!a) return null
  const ivs = db.prepare('SELECT * FROM interviews WHERE application_id=? ORDER BY round').all(a.id)
  return {
    ...a,
    skills: J(a.skills), competencies: J(a.competencies),
    ats_matched: J(a.ats_matched), ats_gaps: J(a.ats_gaps),
    interviews: ivs.map(iv => {
      const sc = db.prepare('SELECT * FROM scorecards WHERE interview_id=?').get(iv.id)
      return {
        ...iv, transcript: J(iv.transcript), covered: J(iv.covered),
        scorecard: sc ? { ...sc, scores: J(sc.scores), strengths: J(sc.strengths), concerns: J(sc.concerns) } : null,
      }
    }),
  }
}

app.get('/api/applications', wrap((req, res) => {
  const { job_id, stage } = req.query
  let sql = `SELECT a.id,a.stage,a.ats_score,a.source,a.created_at,a.job_id,
    c.name,c.current_title,c.location,c.skills, j.title job_title
    FROM applications a JOIN candidates c ON c.id=a.candidate_id JOIN jobs j ON j.id=a.job_id
    WHERE a.tenant_id=?`
  const args = [TENANT]
  if (job_id) { sql += ' AND a.job_id=?'; args.push(job_id) }
  if (stage) { sql += ' AND a.stage=?'; args.push(stage) }
  sql += ' ORDER BY a.created_at DESC'
  const rows = db.prepare(sql).all(...args)
  res.json(rows.map(r => {
    const ivs = db.prepare('SELECT round,status FROM interviews WHERE application_id=?').all(r.id)
    const scores = db.prepare(`SELECT i.round, s.overall FROM interviews i
      JOIN scorecards s ON s.interview_id=i.id WHERE i.application_id=?`).all(r.id)
    return { ...r, skills: J(r.skills), rounds: ivs, scores }
  }))
}))

app.get('/api/applications/:id', wrap((req, res) => {
  const a = appDetail('a.id=?', req.params.id)
  a ? res.json(a) : res.status(404).json({ error: 'Not found' })
}))

app.get('/api/track/:token', wrap((req, res) => {
  const a = appDetail('a.token=?', req.params.token)
  a ? res.json(a) : res.status(404).json({ error: 'Not found' })
}))

app.post('/api/applications/:id/stage', wrap((req, res) => {
  const { stage, reason } = req.body
  db.prepare('UPDATE applications SET stage=? WHERE id=?').run(stage, req.params.id)
  logEvent(TENANT, 'human', 'u_kavya', 'application.stage_changed', 'application', req.params.id, { stage, reason })
  res.json({ ok: true, stage })
}))

/* ============ scheduling ============ */
app.get('/api/slots', wrap((req, res) => {
  const rows = db.prepare(`SELECT * FROM slots WHERE job_id=? AND taken_by IS NULL
    AND starts_at > ? ORDER BY starts_at LIMIT 200`).all(req.query.job_id, now())
  res.json(rows)
}))

app.post('/api/interviews/:id/schedule', wrap((req, res) => {
  const { slot_id } = req.body
  const slot = db.prepare('SELECT * FROM slots WHERE id=? AND taken_by IS NULL').get(slot_id)
  if (!slot) return res.status(409).json({ error: 'That slot has just been taken. Pick another.' })
  const iv = db.prepare('SELECT * FROM interviews WHERE id=?').get(req.params.id)
  db.prepare('UPDATE slots SET taken_by=? WHERE id=?').run(iv.application_id, slot_id)
  db.prepare(`UPDATE interviews SET slot_id=?, scheduled_at=?, status='Scheduled' WHERE id=?`)
    .run(slot_id, slot.starts_at, req.params.id)
  db.prepare(`UPDATE applications SET stage='Scheduled' WHERE id=?`).run(iv.application_id)
  logEvent(TENANT, 'candidate', iv.application_id, 'interview.scheduled', 'interview', req.params.id, { starts_at: slot.starts_at })
  res.json({ ok: true, scheduled_at: slot.starts_at })
}))

/* ============ the interview ============ */
const ctx = ivId => {
  const iv = db.prepare('SELECT * FROM interviews WHERE id=?').get(ivId)
  if (!iv) return null
  const a = db.prepare(`SELECT a.*, c.current_title, c.skills, c.years_experience, c.name
    FROM applications a JOIN candidates c ON c.id=a.candidate_id WHERE a.id=?`).get(iv.application_id)
  const job = jobOut(db.prepare('SELECT * FROM jobs WHERE id=?').get(a.job_id))
  return {
    iv, app: a, job,
    profile: { current_title: a.current_title, skills: J(a.skills), years_experience: a.years_experience, name: a.name },
    transcript: J(iv.transcript), covered: J(iv.covered),
  }
}

app.post('/api/interviews/:id/start', wrap(async (req, res) => {
  const c = ctx(req.params.id)
  if (!c) return res.status(404).json({ error: 'Interview not found' })
  if (c.iv.status === 'In progress') return res.json({ already: true, transcript: c.transcript })

  const turn = await interviewTurn({ ...c, roundName: c.iv.round_name })
  const t = turn.data
  const transcript = [{ who: 'ai', text: t.message, t: '00:00', competency: t.competency }]

  db.prepare(`UPDATE interviews SET status='In progress', started_at=?, transcript=?, current_competency=?, canvas_open=? WHERE id=?`)
    .run(now(), JSON.stringify(transcript), t.competency, t.open_canvas ? 1 : 0, req.params.id)
  db.prepare(`UPDATE applications SET stage='Interviewing' WHERE id=?`).run(c.app.id)
  logEvent(TENANT, 'agent', 'agent.interviewer', 'interview.started', 'interview', req.params.id, { source: turn.source })

  res.json({ message: t.message, competency: t.competency, open_canvas: t.open_canvas, canvas_mode: t.canvas_mode, transcript, ai: turn.source })
}))

app.post('/api/interviews/:id/turn', wrap(async (req, res) => {
  const c = ctx(req.params.id)
  if (!c) return res.status(404).json({ error: 'Interview not found' })
  const { answer, canvas } = req.body
  if (!answer || !answer.trim()) return res.status(400).json({ error: 'answer is required' })

  const elapsed = c.iv.started_at ? Math.floor((Date.now() - new Date(c.iv.started_at)) / 1000) : 0
  const stamp = String(Math.floor(elapsed / 60)).padStart(2, '0') + ':' + String(elapsed % 60).padStart(2, '0')

  const transcript = [...c.transcript, { who: 'candidate', text: answer, t: stamp }]
  const turn = await interviewTurn({ ...c, transcript, roundName: c.iv.round_name })
  const t = turn.data
  transcript.push({ who: 'ai', text: t.message, t: stamp, competency: t.competency })

  const covered = [...new Set([...c.covered, t.competency].filter(Boolean))]
  db.prepare(`UPDATE interviews SET transcript=?, covered=?, current_competency=?, canvas_open=?, canvas_content=COALESCE(?,canvas_content) WHERE id=?`)
    .run(JSON.stringify(transcript), JSON.stringify(covered), t.competency, t.open_canvas ? 1 : 0, canvas || null, req.params.id)

  res.json({
    message: t.message, competency: t.competency, open_canvas: t.open_canvas,
    canvas_mode: t.canvas_mode, should_end: t.should_end, transcript, ai: turn.source,
  })
}))

app.post('/api/interviews/:id/finish', wrap(async (req, res) => {
  const c = ctx(req.params.id)
  if (!c) return res.status(404).json({ error: 'Interview not found' })
  const existing = db.prepare('SELECT * FROM scorecards WHERE interview_id=?').get(req.params.id)
  if (existing) return res.json({ already: true, scorecard_id: existing.id })

  db.prepare(`UPDATE interviews SET status='Evaluating', ended_at=? WHERE id=?`).run(now(), req.params.id)

  const ev = await evaluate({
    job: c.job, profile: c.profile, transcript: c.transcript,
    canvasContent: c.iv.canvas_content, roundName: c.iv.round_name,
  })
  const d = ev.data
  const sid = id('sc')
  db.prepare(`INSERT INTO scorecards (id,interview_id,scores,strengths,concerns,overall,recommendation,feedback,model,generated_by,created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)`).run(
    sid, req.params.id, JSON.stringify(d.scores), JSON.stringify(d.strengths), JSON.stringify(d.concerns),
    d.overall, d.recommendation, d.candidate_feedback, ev.model || 'fallback', ev.source, now())

  db.prepare(`UPDATE interviews SET status='Complete' WHERE id=?`).run(req.params.id)

  const advance = d.recommendation === 'Advance'
  db.prepare('UPDATE applications SET stage=? WHERE id=?')
    .run(advance ? 'Reviewed' : 'Declined', c.app.id)

  if (advance && c.iv.round < ROUNDS.length) {
    const next = ROUNDS[c.iv.round]
    db.prepare(`INSERT INTO interviews (id,application_id,round,round_name,status,created_at)
      VALUES (?,?,?,?,?,?)`).run(id('int'), c.app.id, next.n, next.name, 'Awaiting scheduling', now())
  }

  logEvent(TENANT, 'agent', 'agent.evaluator', 'interview.evaluated', 'interview', req.params.id,
    { overall: d.overall, recommendation: d.recommendation, source: ev.source })

  res.json({ scorecard_id: sid, ...d, ai: ev.source, model: ev.model })
}))

app.get('/api/interviews/:id', wrap((req, res) => {
  const c = ctx(req.params.id)
  if (!c) return res.status(404).json({ error: 'Not found' })
  const sc = db.prepare('SELECT * FROM scorecards WHERE interview_id=?').get(req.params.id)
  res.json({
    ...c.iv, transcript: c.transcript, covered: c.covered, job: c.job, candidate: c.profile,
    scorecard: sc ? { ...sc, scores: J(sc.scores), strengths: J(sc.strengths), concerns: J(sc.concerns) } : null,
  })
}))

app.get('/api/interviews', wrap((req, res) => {
  const rows = db.prepare(`SELECT i.*, c.name candidate_name, j.title job_title
    FROM interviews i JOIN applications a ON a.id=i.application_id
    JOIN candidates c ON c.id=a.candidate_id JOIN jobs j ON j.id=a.job_id
    WHERE a.tenant_id=? ORDER BY i.created_at DESC`).all(TENANT)
  res.json(rows.map(r => ({ ...r, transcript: J(r.transcript) })))
}))

/* ============ grid ============ */
app.get('/api/tenants', wrap((_, res) => {
  res.json(db.prepare('SELECT * FROM tenants').all().map(t => {
    const n = db.prepare(`SELECT COUNT(*) c FROM interviews i JOIN applications a ON a.id=i.application_id
      WHERE a.tenant_id=? AND i.status='Complete'`).get(t.id).c
    return { ...t, used_interviews: t.id === TENANT ? n : t.used_interviews }
  }))
}))

app.get('/api/events', wrap((req, res) => {
  const rows = db.prepare('SELECT * FROM events WHERE tenant_id=? ORDER BY id DESC LIMIT ?')
    .all(TENANT, Number(req.query.limit) || 100)
  res.json(rows.map(e => ({ ...e, payload: J(e.payload, {}) })))
}))

app.get('/api/stats', wrap((_, res) => {
  const g = sql => db.prepare(sql).get(TENANT)
  res.json({
    jobs: g(`SELECT COUNT(*) c FROM jobs WHERE tenant_id=? AND status='Open'`).c,
    applications: g('SELECT COUNT(*) c FROM applications WHERE tenant_id=?').c,
    interviews_complete: g(`SELECT COUNT(*) c FROM interviews i JOIN applications a ON a.id=i.application_id
      WHERE a.tenant_id=? AND i.status='Complete'`).c,
    shortlisted: g(`SELECT COUNT(*) c FROM applications WHERE tenant_id=? AND stage='Shortlisted'`).c,
    funnel: db.prepare(`SELECT stage, COUNT(*) n FROM applications WHERE tenant_id=? GROUP BY stage`).all(TENANT),
  })
}))

ensureSeed()
const PORT = process.env.PORT || 8787
app.listen(PORT, () => {
  console.log('\n  Auralis API  http://localhost:' + PORT)
  console.log('  AI mode:     ' + (hasKey() ? 'Claude (live)' : 'deterministic fallback — set ANTHROPIC_API_KEY for real AI'))
  console.log('')
})
