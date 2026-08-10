# Peer Review Response - UI/UX Polish Pass

Two sample usability-review recordings of past onboarding projects (a marine-education site and a seniors'-community site, both FIT5120 projects from a prior cohort) were reviewed before this polish pass, to catch the same criticisms before a reviewer has to point them out on Quiet Compass. This document maps each criticism to what changed in the `dev-joshua` branch.

Not every critique applied - some were specific to those two products (age-inconsistent language for a children's app, an unclear puzzle game, a broken "next" navigation). Only the criticisms that generalise to any web app - and that Quiet Compass was actually at risk of - are listed below.

---

## Criticisms addressed

| # | Criticism (paraphrased from the recordings) | Where it showed up here | What changed |
|---|---|---|---|
| 1 | "Usually the homepage is an executive summary of your entire website" - the reviewer got almost no sense of what the site offered from `/` | Route Planner (`/`) was a bare origin/destination form with no mention of Refuges or Forecast | Homepage rebuilt: hero explaining the app in two sentences, a "why crowd level, not speed" card, a band explainer, and teaser cards linking to Refuges and Forecast. See `RoutePlanner.jsx`, `BandExplainer.jsx`, `FeatureTeaserCards.jsx` |
| 2 | Reviewer noticed the same phrase repeated twice on one screen | Original Route Planner literally repeated "We'll find the quietest, least crowded path for your journey today" in two separate blocks | Rewritten once; the second block now explains *why* crowd level matters instead of repeating the same sentence |
| 3 | "The styling is a bit clunky... this cheapens the look of the website" - different pages used visibly different card, button and spacing styles | Each page had hand-copied `rounded-xl border ...` card markup and slightly different button classes | Extracted `Card`, `Button`, `PageHeader`, `Section`, `Callout` primitives (`src/components/ui/`); all five pages now render through the same components |
| 4 | Small, hard-to-read text throughout | Body text was `text-sm` (14px) in most components | Named type scale added (`display` / `heading` / `body` / `caption` / `micro`) and applied consistently; base body text is now 16px+ everywhere |
| 5 | "Why would I care about this number?" - data (a species count, a percentage) shown with no explanation of its relevance | Route cards showed a crowd count and band with no explanation of what the bands mean before a user had seen one | `BandExplainer` on the homepage spells out what Low/Medium/High mean *before* the user reaches a page that uses them |
| 6 | "What's this map cursor? I don't understand" - a map interaction with no explanation | Route Detail's map legend explained line colours but not that pattern (not just colour) carries meaning, or that the same data exists as text | Added a caption above the map: "Busier sections are thicker and dotted, not just a different colour - also listed as text below" |
| 7 | A dropdown/expandable section with no visible affordance to indicate it opens | The sensor-detail disclosure on each route card was a badge with an invisible click target | `IndicatorDetail` now shows a chevron icon plus "Sensor detail" / "Hide sensor detail" text next to the badge, and the chevron rotates on open |
| 8 | Reviewer spent noticeable time confused by inconsistent naming for the same concept across pages | Not present as badly as in the reviewed sites, but reviewed for | Established one term per concept and used it everywhere: "crowd level" (never "density"/"sensory load" interchangeably in user-facing copy), "walking time", "refuge" for a place, "quiet space" only for that specific category |
| 9 | Unexplained empty/no-results states | "No refuges of the selected types were found nearby" (and the equivalent Forecast state) had no next step for the user | Both empty states now pair the required message with a plain-language suggestion (try a different filter type / try a busier nearby location) inside a proper empty-state card with an icon |
| 10 | Liked: "this number, here, is very attractive" - large, legible stats | - | `Stat.jsx` - one big number + small label, reused for walking time, forecast peak window, and elsewhere. This is the *only* place text gets to be large, to stay inside CLAUDE.md's calm/low-stimulation rule |
| 11 | Liked: an icon row where each icon links to a different function | - | `FeatureTeaserCards` on the homepage: two icon cards linking to Refuges and Forecast |
| 12 | Vague or missing filter labels ("what's this filter for?") | Refuge type filter was three bare checkboxes with a small uppercase legend | Restyled as labelled chips with a per-type count, so a user sees both what each type is and how many are nearby before selecting |

---

## Criticisms considered and not applied

| Criticism | Why it doesn't apply here |
|---|---|
| Language pitched at the wrong age group (child-level vocabulary for a general audience, or vice versa) | Quiet Compass's audience (sensory-sensitive adults) and tone (calm, plain, non-alarming) were already defined in `CLAUDE.md`/`docs/ACCESSIBILITY.md` before this pass; copy was written to that brief from the start |
| "Make the buttons bigger, more in your face" for a game's primary action | Not a game; CTAs already use full-width buttons at a deliberate size. Verified touch targets stay at 48px minimum (`Button`'s `md` size, `min-h-[48px]`) rather than making them maximal, since a low-stimulation interface shouldn't over-emphasise buttons either |
| Broken next/previous navigation in a quiz flow | No equivalent multi-step flow exists in Quiet Compass |

---

## What this does not cover

This document is about visual and copy usability. It does not replace:

- The acceptance-criteria click-through in `docs/ACCEPTANCE_CRITERIA.md` (still the authoritative "is this feature done" check - re-run after this pass, all 15 ACs still pass)
- The accessibility checklist and manual browser/screen-reader pass in `docs/ACCESSIBILITY.md` (still outstanding as of this pass - no browser was available in the environment this branch was built in)
