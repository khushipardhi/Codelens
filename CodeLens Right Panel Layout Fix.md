# CodeLens Right Panel Layout Fix

## Scope

This Antigravity-ready implementation specification fixes only the right-side analysis panel layout and corrected-code button placement.

Project: CodeLens — React + Vite + Monaco Editor.

Do not:

- rewrite the whole app
- change explanation content
- make explanations longer
- change AI logic
- change Monaco integration
- modify unrelated UI

Only fix:

- right-side analysis panel layout
- error card collapse behavior
- corrected-code CTA placement

---

## Main Problem

The right-side analysis panel currently looks uneven and unprofessional.

Issues:

1. Closed error cards still show partial hidden content underneath.
2. `What Happened` / explanation content is peeking from collapsed cards.
3. Error cards are not properly collapsed.
4. The `View Corrected Code` button is placed inside an awkward small empty box.
5. Layout spacing feels broken and cheap.
6. Right panel does not look systematically arranged.

---

## Goal

Make the right panel clean, systematic, premium, and predictable.

The right panel should be structured like:

1. Analysis header
2. Error cards list
3. Corrected code CTA

No random empty white box.
No cramped bottom section.
No partial visibility.
No hidden content peeking from closed cards.

---

## Files To Modify

- `src/components/ExplanationPanel/ExplanationPanel.jsx`
- `src/components/ExplanationPanel/ExplanationPanel.css`
- `src/App.css`
- `src/components/ChatAssistant/ChatAssistant.css`

---

## Exact Implementation Steps

### Step 1: Preserve Explanation Content

1. Do not change explanation copy.
2. Do not increase explanation length.
3. Do not modify AI prompts.
4. Do not modify service files.
5. Keep existing section labels:
   - `What Happened`
   - `Suggested Fix`
   - `Why This Happens`
   - `How To Avoid This`
   - confidence booster line

### Step 2: Fix Error Card Closed State

Each error card must have two states.

Closed state must show only:

- error number badge
- error title
- line number
- chevron icon

Closed state must not show:

- `What Happened`
- `Suggested Fix`
- `Why This Happens`
- `How To Avoid This`
- confidence line
- any half-visible body content

Implementation:

1. In `ExplanationPanel.jsx`, conditionally render the error body only when the card is open.
2. Prefer conditional rendering over trying to hide content with height animation.
3. Replace always-rendered body wrapper with:

```jsx
{isExpanded && (
  <div className="error-card-body">
    ...
  </div>
)}
```

4. Keep click behavior on the card header.
5. Keep `onLineSelect` behavior.
6. Ensure only selected/open card shows body content.
7. If multiple cards can currently open, either:
   - keep multi-open behavior but ensure closed cards render no body, or
   - change to single-open behavior if this matches current UX better.
8. Do not show body content in closed cards under any circumstance.

### Step 3: Fix Collapse Styling

1. Remove CSS that causes hidden content to peek through.
2. Remove or neutralize problematic grid row collapse if it leaves visible content.
3. Ensure closed cards have:

```css
overflow: hidden;
```

4. If animation is desired, animate only the body mount/unmount with opacity/transform.
5. Do not rely on partial `max-height` values that can reveal content.
6. Add clean spacing between cards.
7. Keep card shadows and borders subtle.

### Step 4: Improve Right Panel Structure

1. Ensure `.panel-content` has a predictable vertical structure:
   - meta/header
   - summary
   - errors list
   - CTA section
2. Remove random empty containers around the corrected-code CTA.
3. Remove tiny awkward empty box styling around the CTA.
4. Ensure bottom padding exists so CTA is fully visible.
5. Ensure panel content scrolls smoothly.

### Step 5: Fix Corrected Code CTA

The `View Corrected Code` / `Generate Corrected Code` button should appear in a clean professional CTA section.

Requirements:

- fully visible
- centered or aligned cleanly
- proper padding
- no clipping
- no half-hidden state
- not inside tiny awkward empty box
- not covered by chat bubble
- enough bottom spacing

CTA section styling:

- glass card
- clean border
- subtle background
- balanced padding
- full-width card or centered button
- theme-aware dark/light styling

Implementation:

1. Create/adjust CTA wrapper class, for example:

```css
.corrected-code-cta {
  margin-top: 12px;
  margin-bottom: 72px;
  padding: 16px;
  border-radius: var(--radius-lg);
  background: var(--glass-light);
  border: 1px solid var(--border-glass);
}
```

2. Button should be centered or full-width depending on panel width.
3. Add enough bottom space to avoid chat bubble overlap.
4. Do not place the CTA in a clipped nested wrapper.
5. If corrected code opens in modal/drawer elsewhere, keep this CTA as a launcher only.

### Step 6: Theme Support

1. Dark mode:
   - glass card with subtle border
   - readable button
   - soft glow only on hover
2. Light mode:
   - no white text on light backgrounds
   - clean slate text
   - subtle border and shadow
3. Ensure closed/open card states look good in both themes.

---

## Antigravity-Ready Prompt

```md
Fix CodeLens right-side analysis panel layout and corrected-code CTA placement.

Do not rewrite the app.
Do not change explanation content.
Do not make explanations longer.
Do not modify AI prompts or service files.
Do not change Monaco integration.

Modify only:
- src/components/ExplanationPanel/ExplanationPanel.jsx
- src/components/ExplanationPanel/ExplanationPanel.css
- src/App.css
- src/components/ChatAssistant/ChatAssistant.css

Main problems:
1. Closed error cards show partial hidden content underneath.
2. "What Happened" content peeks from collapsed cards.
3. Error cards are not properly collapsed.
4. View Corrected Code button sits inside an awkward small empty box.
5. Right panel spacing feels broken.

Required error card behavior:

CLOSED STATE:
Show only:
- error number badge
- error title
- line number
- chevron icon

Do not show:
- What Happened
- Suggested Fix
- Why This Happens
- How To Avoid This
- confidence line
- any half-visible content

OPEN STATE:
Show:
- What Happened
- Suggested Fix
- Why This Happens
- How To Avoid This
- confidence booster line

Collapse fix:
1. Prefer conditional rendering.
2. Only render card body when card is open.
3. Do not rely on CSS tricks that leave content peeking.
4. Ensure closed cards use overflow: hidden.
5. No half-visible text.
6. Smooth open/close can use simple opacity/transform.

Right panel structure:
1. Analysis header.
2. Error cards list.
3. Corrected code CTA.

Corrected code CTA:
1. Fully visible.
2. Centered or aligned cleanly.
3. Proper padding.
4. No clipping.
5. No half-hidden state.
6. Not inside tiny awkward empty box.
7. Not covered by chat bubble.
8. Enough bottom spacing.
9. Glass card styling with clean border and subtle background.
10. Works in dark and light mode.

Strict UI rules:
- Do not show explanation content inside collapsed cards.
- Do not show half-visible sections.
- Do not create random empty containers.
- Do not place button in clipped scroll area.
- Do not increase explanation text length.
- Do not change unrelated UI.
```

---

## Local Testing Checklist

Run:

- `npm run dev`

Verify:

- localhost opens.
- no console errors.
- Analyze Code works.
- closed card shows only title and line number.
- no `What Happened` visible in closed state.
- no explanation text peeks from collapsed cards.
- opening card shows full content.
- closing card hides all body content.
- only open card body is visible.
- `View Corrected Code` / `Generate Corrected Code` button is fully visible.
- no clipping.
- no awkward empty white box.
- CTA has balanced padding and alignment.
- chat bubble does not overlap the button.
- works in dark mode.
- works in light mode.
- mobile layout remains usable.

---

## Rollback Safety

Rollback only right-panel layout changes.

Safe to revert:

- `src/components/ExplanationPanel/ExplanationPanel.jsx`
- `src/components/ExplanationPanel/ExplanationPanel.css`
- `src/App.css`
- `src/components/ChatAssistant/ChatAssistant.css`

Do not revert:

- `src/services/aiService.js`
- `src/services/providers/nvidia.js`
- `src/components/CodeEditor/CodeEditor.jsx`
- About page files
- package files
- unrelated theme changes

If conditional rendering causes any regression:

1. Keep the body conditional rendering.
2. Remove only animation changes.
3. Do not restore the peeking collapsed-content behavior.
