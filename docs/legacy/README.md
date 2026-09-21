# Legacy — the Euron Nexus pass

This folder holds the **first design pass**, produced before the product was renamed to **Auralis**. It is kept for reference and provenance, not as the current specification.

Treat anything here as superseded where it conflicts with the current specification documents.

## What's here

| Path | What it is |
| --- | --- |
| `EURON_NEXUS_PRD_v1.0.docx` | First PRD — market research, feature scope, pricing tiers, cost estimation |
| `EURON_NEXUS_AWS_Architecture_v1.0.docx` | First architecture pass — AWS services, per-unit cost model |
| `EURON_NEXUS_Screen_Design_Document_v1.0.docx` | First screen-by-screen design document |
| `original-brief.txt` | The original product brief, plus the design theme specification |
| `diagrams/` | Five exported architecture diagrams |
| `screens/` | 17 built HTML screens exported from UX Pilot |

## The built screens

Static HTML, openable directly in a browser. They cover all three surfaces:

**Super admin** — dashboard, organizations management, organization detail, quotas & limits, system health

**Client admin** — dashboard, candidate profile, interview scheduling, interview monitor, interview results, analytics

**Candidate portal** — portal home, device & environment check, interview waiting room, interview room, whiteboard & coding, interview completion, portal dashboard

These were built against the original token set in `original-brief.txt`. The current design specification refines several of those values, so the screens will need a token pass before they match.

## Naming

The product was called *Euron Nexus* during this phase. It is now **Auralis**, built by Euron. Filenames here retain the old name deliberately — renaming them would obscure which pass they belong to.
