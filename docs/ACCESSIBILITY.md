# Accessibility - Quiet Compass Frontend

Our users are neurodivergent and sensory-sensitive adults. Accessibility is the product, not a compliance checkbox. An inaccessible sensory-navigation app is a contradiction.

Target: **WCAG 2.1 Level AA**.

---

## The three rules that are never negotiable

### 1. Never colour alone

Every sensory band is conveyed by **text label + icon shape + colour**. Remove the colour and it must still be readable.

```js
export const BAND_LABELS = {
  LOW:     { text: 'Low',            icon: 'circle'   },
  MEDIUM:  { text: 'Medium',         icon: 'triangle' },
  HIGH:    { text: 'High',           icon: 'square'   },
  NO_DATA: { text: 'No sensor data', icon: 'dash'     }
};
```

This applies to map segments too, not just badges. A congested section is distinguished by a different line pattern as well as colour.

**Test:** screenshot the page, convert to greyscale, and check every band is still identifiable.

### 2. Contrast 4.5:1 minimum

All text, including inside badges and on map overlays. Non-text UI components need 3:1.

Check with browser devtools or WebAIM Contrast Checker. Map labels over imagery are the usual failure.

### 3. Keyboard reachable

Every interactive element: inputs, buttons, route cards, map markers, filter controls, the check-in modal.

Visible focus ring on all of them. Never `outline: none` without a replacement.

---

## The check-in modal

Highest-risk component in the app, because modals break keyboard users more than anything else.

- Focus moves into the modal when it opens
- Focus is trapped inside while it is open
- Escape closes it and keeps the default tolerance
- Focus returns to the element that opened it
- Visible close button, not just Escape
- `role="dialog"` and `aria-modal="true"`
- `aria-labelledby` pointing at the heading

The Skip option must be as prominent as the sensitivity options. Someone overwhelmed right now should not have to hunt for the way out.

---

## Warnings and alerts

Crowd warning, tolerance warning, predictive alert:

- `role="alert"` so screen readers announce them
- Never colour alone: include an icon and explicit wording
- Say what and where, not just that something is wrong
- Avoid alarming language. "Busier than your usual limit" reads better than "DANGER"

Our persona is anxious about unpredictability. Warnings should reduce anxiety, not add to it.

---

## Maps

The weakest area for accessibility in any navigation app. Minimum:

- Every marker has an accessible name, e.g. "State Library Victoria, library, 240 metres"
- Markers are keyboard focusable and activate with Enter
- A legend explains every visual distinction on the map
- Route segments and refuge markers are visually distinct in shape, not only colour
- The route information is also available as text outside the map, so the map is never the only way to get it

---

## Motion and visual load

For a sensory-sensitive audience, this matters more than usual.

- Respect `prefers-reduced-motion` and disable transitions when set
- No auto-playing animation
- No flashing or rapid updates. Freddy's persona names flashing signage as a trigger
- Keep the interface calm: whitespace, few competing elements, no more than one accent colour per screen

---

## Forms and inputs

- Every input has a visible `<label>`, not just placeholder text
- Errors are announced and linked to the field with `aria-describedby`
- Error messages are plain language: "Origin and destination must be within Melbourne CBD.", not an error code
- Never rely on colour to mark an invalid field

---

## Content

- Plain language throughout. No jargon, no unexplained abbreviations
- Spell out what a band means the first time: "Low, under 50 people per minute"
- Predictions always labelled as estimates. Overstating confidence loses trust after one bad prediction, and trust is the whole thing for this user

---

## Before a UI card moves to Done

- [ ] Band shown by text and shape, not colour alone
- [ ] Greyscale screenshot still readable
- [ ] Contrast 4.5:1 on all text
- [ ] Every control reachable by Tab, visible focus ring
- [ ] Modal traps focus and closes on Escape
- [ ] Warnings use `role="alert"`
- [ ] Map markers have accessible names
- [ ] Tested once with a screen reader
- [ ] `prefers-reduced-motion` respected

Paste this into the pull request description and tick it off. The reviewer checks it, not just the code.

---

## Tools

| Tool | Use |
|---|---|
| axe DevTools | Browser extension, catches most violations automatically |
| Lighthouse | Built into Chrome, accessibility score |
| WebAIM Contrast Checker | Colour pairs |
| VoiceOver (Mac) / NVDA (Windows) | Screen reader testing, both free |
| Keyboard only | Unplug the mouse and use the app. Fastest real test there is |

Automated tools catch roughly a third of issues. The keyboard-only pass catches most of the rest.

---

## Implementation status

What has actually been verified, and what still needs a human with a browser and a screen reader before a card moves to Done. Automated checks below ran as part of `npm test` / `npm run lint`; nothing here substitutes for the manual pass on the checklist above. Covers both the initial build and the `dev-joshua` UI/UX polish pass that followed it.

| Check | Verified how | Status |
|---|---|---|
| Band shown by text and shape, not colour alone | `bandLabels.test.js` asserts all four bands have distinct text and icon; every `SensoryIndicator` render includes both | Automated |
| Contrast 4.5:1 on all text | Computed numerically (WCAG relative luminance formula) for every band token against both its badge background and the page background before adding to `tailwind.config.js`; MEDIUM was darkened from the first pick (`#8A6A12` → `#7A5C0E`) to clear 4.5:1 | Computed, not browser-measured |
| Every control reachable by Tab, visible focus ring | Global `:focus-visible` ring in `index.css`; `jsx-a11y` lint rules clean on every component | Lint-checked, not keyboard-tested live |
| Modal traps focus and closes on Escape | `CheckInModal.test.jsx`: asserts focus moves in on open, Tab cycles within the dialog, Escape closes and returns focus to the opener | Automated |
| Warnings use `role="alert"` | `CrowdWarning`, `ToleranceWarning`, `NoQualifyingRouteMessage`, `PredictiveAlert` all render through the shared `Callout` primitive with `role="alert"` passed explicitly by the caller; inline form errors too; asserted in their tests | Automated |
| Map markers have accessible names | `RefugeMarker` sets a real `aria-label` + `role="button"` on the Leaflet marker element via `getElement()`, not just the divIcon's `alt` string. jsdom cannot run Leaflet's renderer, so this is code-reviewed, not test-covered; the redundant text list next to every map is the accessibility-guaranteed path, and *that* list is asserted in tests | Code-reviewed + partially automated |
| Filter chips (`RefugeFilter`) keep native checkbox semantics | Checkbox `<input>` is visually hidden with `sr-only`, not removed - it still receives Tab focus and toggles on Space/click; the visible chip gets its focus ring via `has-[:focus-visible]` on the wrapping `<label>` rather than a ring on the hidden input | Code-reviewed |
| Sample-data pages (Refuges, Forecast) marked as non-live | `SampleDataNotice` renders text + icon (`role="note"`) at the top of both pages, never colour alone; `FeatureTeaserCards` labels both links "(sample data)" before navigation | Automated (component render) |
| Tested once with a screen reader | Not done - no browser/screen reader available in the build environment | **Outstanding** |
| `prefers-reduced-motion` respected | Global CSS rule in `index.css` collapses all transition/animation durations; Leaflet's `fitBounds` calls always pass `animate: false`; polish-pass additions (`Button` hover, chip toggle, chevron rotate) use ordinary `transition-*` classes that the same global rule neutralises | Code-reviewed |
| Greyscale screenshot still readable | Not done - no browser available to screenshot | **Outstanding** |
| axe DevTools / Lighthouse | Not run - no browser available in the build environment | **Outstanding** |

**Before this branch is presented or merged:** run the keyboard-only pass, the screen reader pass, axe/Lighthouse, and the greyscale screenshot check in an actual browser (`npm run dev`). Everything above marked Automated or Lint-checked should make that pass fast, not replace it.

---

## For the presentation

Epic 1 and Epic 2 both include "accessibility and usability testing completed" in their Definition of Done. This document plus the completed checklists is the evidence. Keep them in the PGP under `Testing`.
