# Quiet Compass - Frontend

Sensory-aware navigation for Melbourne CBD, for neurodivergent
and sensory-sensitive adults. University project, FIT5120 TA39.

## Stack
React 18 + Vite, React Router, Leaflet, plain fetch.
React context for session state. No Redux.

## Hard rules
- NO login, NO user accounts, NO localStorage. Session memory only.
  This is a deliberate privacy decision for a vulnerable user group.
- Sensory bands are NEVER conveyed by colour alone. Always text + shape.
- WCAG AA: 4.5:1 contrast, keyboard reachable, visible focus.
- Band values come from the API. Never recalculate them client-side.
- No API keys in this repo.

## Bands
LOW under 50 · MEDIUM 50-149 · HIGH 150+ counts per minute
NO_DATA when a route section has no sensor within 200m.
Never render NO_DATA as LOW.

## Working method
Build ONE acceptance criterion at a time.
Read docs/ACCEPTANCE_CRITERIA.md and confirm which AC before writing code.
Match docs/API_CONTRACT.md exactly - do not invent field names.

## Files
docs/ACCEPTANCE_CRITERIA.md - what to build
docs/API_CONTRACT.md - endpoint shapes, authoritative
docs/ACCESSIBILITY.md - checks before any UI card is Done