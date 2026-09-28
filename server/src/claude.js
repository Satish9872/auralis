import Anthropic from '@anthropic-ai/sdk'

const MODEL = {
  parse: 'claude-haiku-4-5',
  score: 'claude-sonnet-5',
  interview: 'claude-sonnet-5',
  evaluate: 'claude-opus-5',
}

export const hasKey = () => Boolean(process.env.ANTHROPIC_API_KEY)
const client = () => new Anthropic()

/** Ask Claude for JSON matching a schema. Falls back to `fake` when no key. */
async function ask({ task, system, prompt, schema, fake, maxTokens = 2000 }) {
  if (!hasKey()) return { data: fake(), source: 'fallback', model: null }
  try {
    const res = await client().messages.create({
      model: MODEL[task],
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: prompt }],
      output_config: { format: { type: 'json_schema', schema } },
    })
    const text = res.content.filter(b => b.type === 'text').map(b => b.text).join('')
    return { data: JSON.parse(text), source: 'claude', model: MODEL[task] }
  } catch (err) {
    console.error('[claude:' + task + ']', err.message)
    return { data: fake(), source: 'fallback-after-error', model: null, error: err.message }
  }
}

/* ---------- 1. Resume parsing ---------- */
export async function parseResume(text) {
  return ask({
    task: 'parse',
    system: 'You extract structured data from resumes. Be accurate; never invent facts not present in the text.',
    prompt: 'Extract structured fields from this resume.\n\n<resume>\n' + text.slice(0, 8000) + '\n</resume>',
    schema: {
      type: 'object', additionalProperties: false,
      required: ['name', 'email', 'phone', 'location', 'current_title', 'skills', 'years_experience'],
      properties: {
        name: { type: 'string' }, email: { type: 'string' }, phone: { type: 'string' },
        location: { type: 'string' }, current_title: { type: 'string' },
        skills: { type: 'array', items: { type: 'string' } },
        years_experience: { type: 'number' },
      },
    },
    fake: () => {
      const pick = (re, d = '') => (text.match(re) || [null, d])[1] || d
      const known = ['Go', 'Python', 'JavaScript', 'TypeScript', 'React', 'PostgreSQL', 'Kafka',
        'Kubernetes', 'Docker', 'AWS', 'Redis', 'GraphQL', 'Java', 'SQL', 'Node']
      const skills = known.filter(s => new RegExp('\\b' + s + '\\b', 'i').test(text))
      return {
        name: pick(/^([A-Z][a-z]+(?: [A-Z][a-z]+)+)/m, 'Candidate'),
        email: pick(/([\w.+-]+@[\w-]+\.[\w.]+)/),
        phone: pick(/(\+?\d[\d\s-]{8,})/),
        location: pick(/\b(Mumbai|Bengaluru|Bangalore|Delhi|Pune|Chennai|Hyderabad|Remote)\b/i),
        current_title: pick(/\b((?:Senior |Staff |Lead )?(?:Software|Backend|Frontend|Data|Platform) Engineer)\b/i, 'Engineer'),
        skills: skills.length ? skills : ['General'],
        years_experience: Number(pick(/(\d+)\+?\s*years?/i, '3')),
      }
    },
  })
}

/* ---------- 2. ATS scoring ---------- */
export async function scoreResume({ job, profile, resumeText }) {
  const system = [
    'You screen candidates against a role. Score only on evidence present in the resume.',
    'Never infer from name, gender, age, school prestige, or employer brand.',
    'Score 0-100 where 70 means the candidate meets the bar.',
  ].join('\n')

  const prompt = [
    '<role>',
    'Title: ' + job.title,
    'Must-haves: ' + job.must_haves.join('; '),
    'Nice-to-haves: ' + job.nice_to_haves.join('; '),
    '</role>',
    '',
    '<candidate>',
    resumeText.slice(0, 6000),
    '</candidate>',
    '',
    'Score this candidate. Cite evidence for each matched and missing requirement.',
  ].join('\n')

  return ask({
    task: 'score', system, prompt,
    schema: {
      type: 'object', additionalProperties: false,
      required: ['score', 'reasoning', 'matched', 'gaps'],
      properties: {
        score: { type: 'integer', minimum: 0, maximum: 100 },
        reasoning: { type: 'string' },
        matched: { type: 'array', items: { type: 'string' } },
        gaps: { type: 'array', items: { type: 'string' } },
      },
    },
    fake: () => {
      const hay = resumeText.toLowerCase()
      const matched = job.must_haves.filter(m =>
        m.toLowerCase().split(/[\s,]+/).filter(w => w.length > 3).some(w => hay.includes(w)))
      const gaps = job.must_haves.filter(m => !matched.includes(m))
      const ratio = job.must_haves.length ? matched.length / job.must_haves.length : 0.5
      const score = Math.round(45 + ratio * 45 + Math.min(10, profile.years_experience || 0))
      return {
        score: Math.min(98, score),
        reasoning: 'Matched ' + matched.length + ' of ' + job.must_haves.length +
          ' must-have requirements by keyword evidence. Deterministic fallback — set ANTHROPIC_API_KEY for real evaluation.',
        matched, gaps,
      }
    },
  })
}

/* ---------- 3. The interview turn ---------- */
export async function interviewTurn({ job, profile, transcript, covered, roundName }) {
  const comps = job.competencies
  const remaining = comps.filter(c => !covered.includes(c))
  const history = transcript
    .map(t => (t.who === 'ai' ? 'Interviewer: ' : 'Candidate: ') + t.text)
    .join('\n')

  const system = [
    'You are Aria, a technical interviewer. You are rigorous, warm, and concise.',
    '',
    'Rules:',
    '- Ask ONE question at a time. Never stack questions.',
    '- Base every follow-up on what the candidate actually just said. Probe specifics; do not accept vague claims.',
    '- Keep questions under 60 words. Speak naturally, as in conversation.',
    '- When a candidate makes a claim, ask what it cost them or how they know it worked.',
    '- Open the canvas only when the question genuinely needs a diagram or code.',
    '- Assess only these competencies: ' + comps.join(', ') + '.',
    '- Never comment on accent, delivery, confidence, or personality.',
    '- After roughly four exchanges on one competency, move to the next.',
  ].join('\n')

  const prompt = [
    '<role>' + job.title + ' — ' + roundName + '</role>',
    '<candidate>' + (profile.current_title || 'Engineer') + ', ' +
      (profile.years_experience || '?') + ' years. Skills: ' + (profile.skills || []).join(', ') + '</candidate>',
    '<covered>' + (covered.join(', ') || 'none yet') + '</covered>',
    '<remaining>' + (remaining.join(', ') || 'none — wrap up') + '</remaining>',
    '',
    '<transcript>',
    history || '(the interview has not started)',
    '</transcript>',
    '',
    'Produce the next interviewer turn.',
  ].join('\n')

  return ask({
    task: 'interview', maxTokens: 1200, system, prompt,
    schema: {
      type: 'object', additionalProperties: false,
      required: ['message', 'competency', 'open_canvas', 'canvas_mode', 'should_end', 'note'],
      properties: {
        message: { type: 'string' },
        competency: { type: 'string' },
        open_canvas: { type: 'boolean' },
        canvas_mode: { type: 'string', enum: ['none', 'whiteboard', 'code', 'system-design'] },
        should_end: { type: 'boolean' },
        note: { type: 'string' },
      },
    },
    fake: () => {
      const n = transcript.filter(t => t.who === 'candidate').length
      const comp = remaining[0] || comps[comps.length - 1]
      const followups = [
        'What was the hardest constraint you hit there, and how did you work around it?',
        'What did that choice cost you? Every design trades something away.',
        'How did you know it was working? What did you measure?',
        'Suppose traffic went up ten times overnight. What breaks first?',
        'Walk me through how you would debug that if it failed in production at 3am.',
      ]
      if (n === 0) {
        return {
          message: 'Hello, thanks for making the time. I am Aria and I will be running this ' +
            roundName.toLowerCase() + '. We will cover ' + comps.slice(0, 3).join(', ') +
            '. Interrupt me any time. To start, tell me about something you have built that you are proud of.',
          competency: comps[0], open_canvas: false, canvas_mode: 'none', should_end: false, note: '',
        }
      }
      if (n >= 8) {
        return {
          message: 'That is everything I wanted to cover. Thank you for your time — you will hear back within two business days.',
          competency: comp, open_canvas: false, canvas_mode: 'none', should_end: true, note: '',
        }
      }
      const wantsCanvas = n === 3
      return {
        message: wantsCanvas
          ? 'Let me open a board for this. Sketch how you would structure that system — the main components and how they talk to each other.'
          : followups[(n - 1) % followups.length],
        competency: comp,
        open_canvas: wantsCanvas,
        canvas_mode: wantsCanvas ? 'system-design' : 'none',
        should_end: false,
        note: 'fallback mode — no scoring note',
      }
    },
  })
}

/* ---------- 4. Evaluation ---------- */
export async function evaluate({ job, profile, transcript, canvasContent, roundName }) {
  const history = transcript
    .map(t => '[' + (t.t || '-') + '] ' + (t.who === 'ai' ? 'Interviewer: ' : 'Candidate: ') + t.text)
    .join('\n')

  const system = [
    'You evaluate an interview against a rubric. You are fair, specific, and evidence-bound.',
    '',
    'Rules:',
    '- Score ONLY on what the candidate said or built. Quote the exact moment justifying each score.',
    '- If a competency was not genuinely assessed, score it null. Do not guess.',
    '- Never reference accent, delivery style, confidence, personality, or background.',
    '- Scores are 1-5. A 3 means the candidate meets the bar for this role.',
    '- Candidate-facing feedback is second person, specific, and actionable.',
  ].join('\n')

  const prompt = [
    '<role>' + job.title + ' — ' + roundName,
    'Competencies: ' + job.competencies.join(', '),
    'Pass threshold: ' + job.threshold,
    'Must-haves: ' + job.must_haves.join('; '),
    '</role>',
    '',
    '<transcript>',
    history,
    '</transcript>',
    canvasContent ? '\n<canvas_work>\n' + canvasContent + '\n</canvas_work>' : '',
    '',
    'Evaluate this interview.',
  ].join('\n')

  return ask({
    task: 'evaluate', maxTokens: 4000, system, prompt,
    schema: {
      type: 'object', additionalProperties: false,
      required: ['scores', 'strengths', 'concerns', 'overall', 'recommendation', 'candidate_feedback'],
      properties: {
        scores: {
          type: 'array',
          items: {
            type: 'object', additionalProperties: false,
            required: ['competency', 'score', 'evidence'],
            properties: {
              competency: { type: 'string' },
              score: { type: ['number', 'null'] },
              evidence: { type: 'string' },
            },
          },
        },
        strengths: { type: 'array', items: { type: 'string' } },
        concerns: { type: 'array', items: { type: 'string' } },
        overall: { type: 'number' },
        recommendation: { type: 'string', enum: ['Advance', 'Borderline', 'Decline'] },
        candidate_feedback: { type: 'string' },
      },
    },
    fake: () => {
      const answers = transcript.filter(t => t.who === 'candidate')
      const words = answers.reduce((a, t) => a + t.text.split(/\s+/).length, 0)
      const depth = words / Math.max(1, answers.length)
      const base = Math.max(1.5, Math.min(4.6, 1.8 + depth / 28))
      const reached = Math.max(1, answers.length - 1)
      const scores = job.competencies.map((c, i) => ({
        competency: c,
        score: i < reached ? Number((base + ((i % 3) - 1) * 0.3).toFixed(1)) : null,
        evidence: i < reached
          ? (answers[Math.min(i, answers.length - 1)] || {}).text?.slice(0, 200) || 'No response recorded.'
          : 'Not reached in this round.',
      }))
      const rated = scores.filter(s => s.score != null)
      const overall = rated.length
        ? Number((rated.reduce((a, s) => a + s.score, 0) / rated.length).toFixed(2)) : 0
      return {
        scores, overall,
        strengths: depth > 30
          ? ['Engaged with every question', 'Gave detailed, substantive answers']
          : ['Answered every question directly'],
        concerns: depth < 25
          ? ['Answers were brief, limiting the evidence available to assess depth']
          : ['Fallback scoring active — set ANTHROPIC_API_KEY for a real evaluation'],
        recommendation: overall >= job.threshold ? 'Advance'
          : overall >= job.threshold - 0.5 ? 'Borderline' : 'Decline',
        candidate_feedback: 'Thank you for your time. This evaluation ran without an AI model, so the feedback is limited. Overall score ' +
          overall + ' against a threshold of ' + job.threshold + '.',
      }
    },
  })
}
