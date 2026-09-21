# Auralis

**The autonomous interview layer.** A multi-tenant SaaS platform that runs the hiring funnel end to end — job posting, resume screening, timezone-aware scheduling, live AI-conducted interviews with proctoring and a shared canvas, multimodal scoring, and candidate feedback — with no recruiter in the room.

Built by Euron.

> Formerly drafted as *Euron Nexus*. The product name is now **Auralis**; the `docs/legacy/` material predates the rename.

---

## The three surfaces

| Surface | Audience | Purpose |
| --- | --- | --- |
| **Console** | Client admins, recruiters, hiring managers | Post jobs, design interviews, review candidates, act on shortlists |
| **Room** | Candidates | Apply, schedule, interview, receive feedback |
| **Grid** | Euron operators | Tenant lifecycle, quota & entitlement, model ops, cost governance, compliance |

## Repository layout

```
auralis-site/                    Landing page (Netlify)
  index.html                     Self-contained, no build step
  netlify.toml                   Security headers

product_developement_zip_17tG/   Earlier design pass (pre-rename)
  product developement/
    EURON_NEXUS_*.docx           Prior PRD, architecture, screen design
    uxpilot-export-*/            17 built HTML screens
    product.txt                  Original brief + design theme spec
```

## Specification documents

The current specification lives in three living documents:

| Document | Covers |
| --- | --- |
| **PRD** | Market research, TAM/SAM/SOM, competitive landscape, ROI model, personas, full feature spec across all three surfaces, the agent mesh, compliance, tech stack, cost estimation at 100/1k/10k concurrent, pricing & unit economics, roadmap |
| **System Architecture** | C4 context and container diagrams, component inventory, edge/compute/data/media/AI layers, multi-tenancy enforcement, security, observability, deployment topology, AWS vs Hostinger cost analysis |
| **UI/UX Design Specification** | Design tokens, component library, 76 screens specified across Candidate (19), Console (38) and Grid (31), accessibility, motion, handoff |

## Design system

LinkedIn-inspired professional SaaS language — calm, dense, enterprise-grade.

| Token | Value |
| --- | --- |
| Brand primary | `#0A66C2` |
| Brand hover | `#004182` |
| Surface | `#FFFFFF` |
| Card radius | 8px |
| Button radius | full (pill) |
| Elevation | 1px border, no drop shadow |

Full token set — including the dark theme, semantic colours, score scale, type scale and spacing — is in the design specification.

## Deploying the landing page

Manual deploy to Netlify:

```bash
# Drag the auralis-site/ folder onto app.netlify.com → Add new site → Deploy manually
```

Then rename the site under **Site configuration → Domain management** to claim the subdomain.

The early-access form uses Netlify Forms — no backend required. Submissions appear under the **Forms** tab.

## Status

Pre-development. Specification and design phase.
