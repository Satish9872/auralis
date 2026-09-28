import { db, id, now } from './db.js'

const TENANT = 'ten_acme'

const JOBS = [
  {
    title: 'Senior Backend Engineer', dept: 'Engineering', location: 'Mumbai · Hybrid',
    description: 'Build and scale the payments platform. You will own services end to end, from design through production operation.',
    must_haves: [
      '5+ years building production backend services',
      'Deep experience with a relational database at scale',
      'Has designed a system that handles partitioning or sharding',
      'Has run production incidents independently',
    ],
    nice_to_haves: ['Payments or fintech domain experience', 'Go or Rust', 'Kafka or event streaming'],
    competencies: ['System design', 'Coding', 'Debugging', 'Communication', 'Ownership'],
    threshold: 3.5,
  },
  {
    title: 'Data Engineer', dept: 'Engineering', location: 'Bengaluru',
    description: 'Own the data platform that everything else reports from.',
    must_haves: ['3+ years in data engineering', 'Strong SQL', 'Built and operated production ETL pipelines'],
    nice_to_haves: ['dbt', 'Airflow', 'Streaming pipelines'],
    competencies: ['Data modelling', 'SQL', 'Pipeline design', 'Communication'],
    threshold: 3.4,
  },
  {
    title: 'Product Designer', dept: 'Design', location: 'Remote, India',
    description: 'Design the surfaces our customers live in every day.',
    must_haves: ['4+ years designing software products', 'Portfolio showing shipped work', 'Works fluently in Figma'],
    nice_to_haves: ['Design systems experience', 'B2B SaaS background'],
    competencies: ['Craft', 'Product thinking', 'Communication'],
    threshold: 3.5,
  },
]

const TENANTS = [
  { id: TENANT, name: 'Acme Technologies', domain: 'acme.com', tier: 'Scale', state: 'Active', region: 'ap-south-1', quota: 500, mrr: 4800 },
  { id: 'ten_north', name: 'Northwind Retail', domain: 'northwind.in', tier: 'Growth', state: 'Active', region: 'ap-south-1', quota: 150, mrr: 1900 },
  { id: 'ten_helix', name: 'Helix Health', domain: 'helixhealth.eu', tier: 'Enterprise', state: 'Active', region: 'eu-central-1', quota: 1500, mrr: 12400 },
  { id: 'ten_blue', name: 'Bluepeak Labs', domain: 'bluepeak.io', tier: 'Growth', state: 'Trial', region: 'ap-south-1', quota: 50, mrr: 0 },
  { id: 'ten_orbit', name: 'Orbit Logistics', domain: 'orbitlog.com', tier: 'Starter', state: 'Past due', region: 'us-east-1', quota: 100, mrr: 490 },
]

export function ensureSeed() {
  const n = db.prepare('SELECT COUNT(*) c FROM tenants').get().c
  if (n > 0) return

  const t = db.prepare(`INSERT INTO tenants (id,name,domain,tier,state,region,quota_interviews,used_interviews,mrr,created_at)
    VALUES (?,?,?,?,?,?,?,0,?,?)`)
  for (const x of TENANTS) t.run(x.id, x.name, x.domain, x.tier, x.state, x.region, x.quota, x.mrr, now())

  db.prepare(`INSERT INTO users (id,tenant_id,name,email,role,created_at) VALUES (?,?,?,?,?,?)`)
    .run('u_kavya', TENANT, 'Kavya Reddy', 'kavya@acme.com', 'Admin', now())

  const jStmt = db.prepare(`INSERT INTO jobs (id,tenant_id,title,dept,location,type,status,description,must_haves,nice_to_haves,competencies,threshold,owner,created_at)
    VALUES (?,?,?,?,?,?,'Open',?,?,?,?,?,?,?)`)
  const sStmt = db.prepare('INSERT INTO slots (id,job_id,starts_at,duration_min) VALUES (?,?,?,45)')

  for (const j of JOBS) {
    const jid = id('job')
    jStmt.run(jid, TENANT, j.title, j.dept, j.location, 'Full-time', j.description,
      JSON.stringify(j.must_haves), JSON.stringify(j.nice_to_haves),
      JSON.stringify(j.competencies), j.threshold, 'Kavya Reddy', now())
    for (let d = 1; d <= 14; d++) {
      const day = new Date(Date.now() + d * 864e5)
      if (day.getDay() === 0 || day.getDay() === 6) continue
      for (const h of [9, 10, 11, 14, 15, 16]) {
        const s = new Date(day); s.setHours(h, 0, 0, 0)
        sStmt.run(id('slot'), jid, s.toISOString())
      }
    }
  }
  console.log('  Seeded ' + TENANTS.length + ' tenants and ' + JOBS.length + ' jobs with interview slots.')
}

if (process.argv[1]?.endsWith('seed.js')) ensureSeed()
