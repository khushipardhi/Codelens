# CodeLens Specification 4

## Scope

This file is an Antigravity-ready implementation specification for two remaining CodeLens UI issues.

Do not rewrite the whole project. Only fix these two issues safely and incrementally.

Project: CodeLens, a React + Vite + Monaco Editor app.

Preserve:

- React + Vite setup
- Monaco Editor integration
- NVIDIA API integration
- current routing/state structure
- existing analysis behavior
- existing theme system
- localhost compatibility

---

## Issue 1: About Page Hero Section Is Not Premium Enough

### Goal

Make the first About page section feel elegant, premium, visually complete, and modern.

The hero should create a stronger first impression without becoming flashy, childish, or theory-heavy.

The result should feel like a modern AI SaaS landing page for beginner-friendly code learning.

### Files To Modify

- `src/components/AboutCodeLens/AboutCodeLens.jsx`
- `src/components/AboutCodeLens/AboutCodeLens.css`
- `src/index.css`

### Exact Implementation Steps

1. Preserve the existing `AboutCodeLens` component and `onStartCoding` prop.
2. Do not modify `src/App.jsx` routing/state behavior.
3. Refine the hero copy to be professional, simple, and beginner-friendly.
4. Use a stronger title, clear subtitle, short meaningful description, CTA buttons, and premium demo preview card.
5. Suggested copy direction:
   - Title: `Understand errors. Fix code with confidence.`
   - Subtitle: `CodeLens helps learners turn confusing syntax errors into clear, calm next steps.`
   - Description: `See what went wrong, why it happened, and how to improve without feeling overwhelmed.`
6. Improve hero layout:
   - stronger vertical rhythm
   - balanced spacing between badge, heading, copy, CTA, and preview card
   - centered composition or balanced split only if it fits existing structure
   - no empty-looking large gaps
7. Improve typography hierarchy:
   - high-contrast heading in both themes
   - readable subtitle width
   - polished line height
   - no oversized text inside compact cards
8. Add or strengthen a premium hero visual container:
   - glassmorphism preview card
   - subtle border
   - soft inset highlight
   - layered shadow
   - clear readable demo content
9. Add subtle glowing gradient background:
   - dark mode: blue/purple glow
   - light mode: soft blue/lavender glow
   - keep opacity low and premium
10. Add cursor glow support on hero surfaces:
   - ensure `.about-hero`, `.hero-mockup-wrapper`, `.glow-card`, and hero CTA buttons can receive `--mouse-x` and `--mouse-y`
   - use existing cursor glow system if present
   - do not add canvas or dependencies
11. Replace plain theory in the hero with visual storytelling:
   - small demo states
   - compact learning cues
   - icon-supported benefit points
12. Keep motion subtle:
   - fade
   - soft hover lift
   - gentle glow transition
13. Ensure both dark and light mode look polished.
14. Ensure mobile responsiveness is preserved.

### Antigravity-Ready Prompt

```md
Fix the CodeLens About page hero section so it feels premium, elegant, and visually complete.

This is a scoped UI refinement.
Do not rewrite the app.
Do not modify service/provider files.
Do not modify Monaco Editor code.
Do not modify App.jsx unless absolutely necessary.

Modify only:
- src/components/AboutCodeLens/AboutCodeLens.jsx
- src/components/AboutCodeLens/AboutCodeLens.css
- src/index.css

Requirements:
1. Make the About hero section elegant and premium.
2. Improve spacing and vertical rhythm.
3. Improve typography hierarchy.
4. Add a stronger glassmorphism hero container or demo preview card.
5. Add subtle glowing gradient background.
6. Add professional but beginner-friendly wording.
7. Add interactive cursor glow support in both light and dark mode.
8. Add visual storytelling instead of plain theory.
9. Make the hero feel like a modern AI SaaS landing page.

Hero must include:
- strong title
- clear subtitle
- short meaningful description
- CTA buttons
- premium demo preview card
- soft glow accents
- glassmorphism depth

Tone:
- professional
- simple
- supportive
- beginner-friendly

Avoid:
- childish wording
- too much theory
- empty-looking layout
- weak visual spacing
- flashy animations

Cursor glow:
- must work on About hero in dark mode
- must work on About hero in light mode
- use CSS variables, radial-gradient, pointer-events: none
- use existing requestAnimationFrame tracker if already present
- do not add dependencies

Acceptance criteria:
- About hero looks premium in dark mode.
- About hero looks premium in light mode.
- Hero no longer feels empty or basic.
- Cursor glow works on the hero in both themes.
- Mobile layout remains clean.
```

### Local Testing Checklist

- Run `npm run dev`.
- Open localhost.
- Navigate to the About page.
- Confirm the hero looks premium in dark mode.
- Confirm the hero looks premium in light mode.
- Confirm hero copy is professional, simple, and beginner-friendly.
- Confirm the hero preview/demo card has glassmorphism depth.
- Confirm background glow is subtle and not overpowering.
- Confirm cursor glow works on the About hero in both themes.
- Confirm CTA buttons are visible and aligned.
- Test mobile/narrow viewport.
- Confirm no console errors.

### Rollback Safety

- Revert only:
  - `src/components/AboutCodeLens/AboutCodeLens.jsx`
  - `src/components/AboutCodeLens/AboutCodeLens.css`
  - `src/index.css`
- If the glow token changes affect other pages, revert only the `src/index.css` glow changes and keep the hero layout/copy improvements.
- Do not revert service files, provider files, package files, Monaco files, or unrelated user changes.

---

## Issue 2: View Corrected Code Button Is Half Hidden

### Goal

Fix the right analysis panel layout/overflow bug so the `View Corrected Code` button is fully visible, easy to click, and never covered by the floating chat bubble.

Expected behavior:

- User scrolls the right panel.
- `View Corrected Code` appears fully.
- No clipping.
- No half visibility.
- No overlap with the chat bubble.
- Works in dark and light mode.

### Files To Modify

- `src/components/ExplanationPanel/ExplanationPanel.jsx`
- `src/components/ExplanationPanel/ExplanationPanel.css`
- `src/App.css`
- `src/components/ChatAssistant/ChatAssistant.css`

### Exact Implementation Steps

1. Inspect the right panel layout in `ExplanationPanel.jsx` and `ExplanationPanel.css`.
2. Locate the `View Corrected Code`, `Compare Fix`, or corrected-code CTA button.
3. Ensure the CTA is rendered inside the right panel scroll content and not inside a clipped child wrapper.
4. Fix parent container overflow:
   - outer panel can remain `overflow: hidden`
   - inner content must have `overflow-y: auto`
   - every flex/grid parent in the panel path must support `min-height: 0`
5. Add bottom padding to the right panel scroll area so the CTA is not hidden at the bottom:
   - use a generous value such as `padding-bottom: 96px` or enough to clear the chat bubble
6. If the CTA should remain visible, implement a sticky CTA area inside the panel:
   - `position: sticky`
   - `bottom: 0`
   - theme-aware glass background
   - top border or shadow kept subtle
   - padding that prevents clipping
7. Ensure sticky CTA does not overlap explanation content.
8. If using a normal block instead of sticky behavior:
   - add enough `margin-bottom` after the CTA
   - ensure scroll area reserves space for it
9. Check floating chat bubble positioning:
   - ensure it does not cover the right panel CTA
   - adjust chat bubble offset or right panel bottom padding if needed
10. Ensure the CTA remains readable in light and dark mode.
11. Ensure scrolling remains smooth.
12. Do not change analysis service logic.
13. Do not modify Monaco Editor integration.

### Antigravity-Ready Prompt

```md
Fix the CodeLens "View Corrected Code" button being partially hidden at the bottom of the right analysis panel.

This is a layout and overflow bug fix only.
Do not rewrite the app.
Do not modify service/provider files.
Do not modify Monaco Editor code.

Modify only:
- src/components/ExplanationPanel/ExplanationPanel.jsx
- src/components/ExplanationPanel/ExplanationPanel.css
- src/App.css
- src/components/ChatAssistant/ChatAssistant.css

Problem:
The "View Corrected Code" button is partially hidden/cut off at the bottom of the right analysis panel.

Requirements:
1. Ensure the button is fully visible.
2. Add proper bottom padding inside the right analysis panel.
3. Fix overflow clipping.
4. Ensure sticky footer/CTA does not overlap content.
5. Ensure right panel scroll area reserves space for bottom buttons.
6. Avoid placing the button under the floating chat bubble.
7. Add margin-bottom large enough for CTA visibility.
8. Button should remain accessible and visually clean.
9. Works in dark and light mode.

Suggested layout:
- Right panel content scrolls independently.
- CTA area can be sticky at bottom OR placed as a normal block with enough bottom padding.
- Floating chat button should not cover the CTA.

Implementation details:
- Ensure panel scroll container uses overflow-y: auto.
- Ensure relevant flex/grid parents use min-height: 0.
- Add bottom padding around 96px or enough to clear floating UI.
- If using sticky CTA, use position: sticky; bottom: 0; with subtle theme-aware glass background.
- Keep styling minimal and professional.

Acceptance criteria:
- User can scroll the right panel smoothly.
- "View Corrected Code" appears fully.
- No clipping.
- No half visibility.
- No overlap with chat bubble.
- Button remains clickable and keyboard accessible.
```

### Local Testing Checklist

- Run `npm run dev`.
- Open localhost.
- Load sample code.
- Run analysis.
- Scroll the right analysis panel.
- Confirm `View Corrected Code` is fully visible.
- Confirm the button is not clipped.
- Confirm the button is clickable.
- Confirm the button is keyboard focusable.
- Confirm the chat bubble does not cover the button.
- Confirm right panel scrolling remains smooth.
- Click the button and confirm corrected code renders.
- Test dark mode.
- Test light mode.
- Test mobile/narrow viewport.
- Confirm no console errors.

### Rollback Safety

- Revert only:
  - `src/components/ExplanationPanel/ExplanationPanel.jsx`
  - `src/components/ExplanationPanel/ExplanationPanel.css`
  - `src/App.css`
  - `src/components/ChatAssistant/ChatAssistant.css`
- If sticky footer behavior causes layout issues, remove sticky behavior and keep normal CTA placement with larger bottom padding.
- Do not revert service files, provider files, package files, Monaco files, or unrelated user changes.

---

## Final Local Testing

After both fixes, verify:

- `npm run dev` works.
- Localhost opens successfully.
- No console errors.
- About hero looks premium in dark mode.
- About hero looks premium in light mode.
- Cursor glow works on About page in both themes.
- `View Corrected Code` button is fully visible.
- Chat bubble does not cover the button.
- Right panel scrolling remains smooth.
- Light mode and dark mode both look polished.
- Mobile responsiveness is not broken.

## Global Rollback Safety

Rollback feature-by-feature, not the full app.

About hero rollback:

- `src/components/AboutCodeLens/AboutCodeLens.jsx`
- `src/components/AboutCodeLens/AboutCodeLens.css`
- `src/index.css`

Corrected code button rollback:

- `src/components/ExplanationPanel/ExplanationPanel.jsx`
- `src/components/ExplanationPanel/ExplanationPanel.css`
- `src/App.css`
- `src/components/ChatAssistant/ChatAssistant.css`

Never revert unless intentionally modified:

- `src/services/aiService.js`
- `src/services/providers/nvidia.js`
- `src/components/CodeEditor/CodeEditor.jsx`
- `package.json`
- `package-lock.json`
