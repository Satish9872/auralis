import Database from 'better-sqlite3'
import { nanoid } from 'nanoid'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const db = new Database(path.join(__dirname, '..', 'auralis.db'))
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

export const id = (p) => `${p}_${nanoid(10)}`
export const now = () => new Date().toISOString()

db.exec(`
CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, domain TEXT, tier TEXT DEFAULT 'Growth',
  state TEXT DEFAULT 'Active', region TEXT DEFAULT 'ap-south-1',
  quota_interviews INTEGER DEFAULT 100, used_interviews INTEGER DEFAULT 0,
  mrr INTEGER DEFAULT 0, created_at TEXT
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, tenant_id TEXT REFERENCES tenants(id),
  name TEXT, email TEXT UNIQUE, role TEXT DEFAULT 'Recruiter', created_at TEXT
);

CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY, tenant_id TEXT REFERENCES tenants(id),
  title TEXT NOT NULL, dept TEXT, location TEXT, type TEXT DEFAULT 'Full-time',
  status TEXT DEFAULT 'Open', description TEXT,
  must_haves TEXT DEFAULT '[]', nice_to_haves TEXT DEFAULT '[]',
  competencies TEXT DEFAULT '[]', threshold REAL DEFAULT 3.5,
  owner TEXT, created_at TEXT
);

CREATE TABLE IF NOT EXISTS candidates (
  id TEXT PRIMARY KEY, name TEXT, email TEXT, phone TEXT, location TEXT,
  current_title TEXT, resume_text TEXT, skills TEXT DEFAULT '[]',
  years_experience REAL, created_at TEXT
);

CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY, tenant_id TEXT, job_id TEXT REFERENCES jobs(id),
  candidate_id TEXT REFERENCES candidates(id),
  stage TEXT DEFAULT 'Applied', ats_score INTEGER, ats_reasoning TEXT,
  ats_matched TEXT DEFAULT '[]', ats_gaps TEXT DEFAULT '[]',
  source TEXT DEFAULT 'Careers page', token TEXT UNIQUE, created_at TEXT
);

CREATE TABLE IF NOT EXISTS slots (
  id TEXT PRIMARY KEY, job_id TEXT REFERENCES jobs(id),
  starts_at TEXT, duration_min INTEGER DEFAULT 45, taken_by TEXT
);

CREATE TABLE IF NOT EXISTS interviews (
  id TEXT PRIMARY KEY, application_id TEXT REFERENCES applications(id),
  round INTEGER DEFAULT 1, round_name TEXT, status TEXT DEFAULT 'Scheduled',
  slot_id TEXT, scheduled_at TEXT, started_at TEXT, ended_at TEXT,
  transcript TEXT DEFAULT '[]', covered TEXT DEFAULT '[]',
  current_competency TEXT, canvas_open INTEGER DEFAULT 0, canvas_content TEXT,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS scorecards (
  id TEXT PRIMARY KEY, interview_id TEXT REFERENCES interviews(id),
  scores TEXT DEFAULT '[]', strengths TEXT DEFAULT '[]', concerns TEXT DEFAULT '[]',
  overall REAL, recommendation TEXT, feedback TEXT,
  model TEXT, generated_by TEXT DEFAULT 'ai', created_at TEXT
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT, tenant_id TEXT,
  actor_type TEXT, actor_id TEXT, action TEXT,
  entity_type TEXT, entity_id TEXT, payload TEXT, created_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_events_entity ON events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_app_job ON applications(job_id);
`)

export function logEvent(tenantId, actorType, actorId, action, entityType, entityId, payload = {}) {
  db.prepare(`INSERT INTO events (tenant_id, actor_type, actor_id, action, entity_type, entity_id, payload, created_at)
              VALUES (?,?,?,?,?,?,?,?)`)
    .run(tenantId, actorType, actorId, action, entityType, entityId, JSON.stringify(payload), now())
}

export const J = (s, d = []) => { try { return JSON.parse(s ?? '') } catch { return d } }
