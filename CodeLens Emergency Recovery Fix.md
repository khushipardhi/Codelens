# CodeLens Emergency Recovery Fix

## Purpose

This is an Antigravity-ready emergency recovery specification for fixing a frontend crash after clicking `Analyze Code`.

Project: CodeLens, a React + Vite + Monaco + NVIDIA AI app.

Primary goal:

- restore stable frontend behavior exactly like the earlier working version.

Do not:

- rewrite the app
- optimize aggressively
- over-engineer
- remove UI improvements
- remove About page work
- remove theme system
- remove corrected-code button
- remove Monaco integration
- remove NVIDIA integration

Stability first.

---

## Emergency Issue: Analyze Code Blanks The Frontend

### Goal

Stop the full React app from blanking after clicking `Analyze Code`.

If AI or parsing fails, the UI must stay visible and show local analysis/fallback messaging.

### Current Behavior

After clicking `Analyze Code`:

- page becomes blank
- analysis UI disappears
- only background gradient remains visible
- React render tree likely crashes

### Likely Root Causes To Inspect

Inspect for:

- undefined state access
- null response handling
- invalid AI response parsing
- `JSON.parse` crash
- async rendering crash
- infinite render loop
- conditional render bug
- missing fallback object
- React component tree crash
- broken `useEffect` dependencies
- invalid response schema
- state mutation issue

### Files To Modify

- `src/App.jsx`
- `src/main.jsx`
- `src/services/aiService.js`
- `src/services/providers/nvidia.js`
- `src/components/ExplanationPanel/ExplanationPanel.jsx`
- `src/components/ExplanationPanel/ExplanationPanel.css`

### Files To Create

- `src/components/ErrorBoundary/ErrorBoundary.jsx`
- `src/components/ErrorBoundary/ErrorBoundary.css`

### Exact Implementation Steps

1. Reproduce the crash locally by running `npm run dev` and clicking `Analyze Code`.
2. Check browser console and terminal logs for the first thrown error.
3. Add a React Error Boundary around the app tree so a render crash does not blank the entire frontend.
4. In `src/main.jsx`, wrap `<App />` with `<ErrorBoundary>`.
5. The Error Boundary fallback must show:
   - clear message
   - recovery button to reload or reset
   - no raw stack trace in beginner-facing UI
6. Add console diagnostics inside Error Boundary:
   - component error
   - component stack
7. Add defensive rendering in `ExplanationPanel.jsx`:
   - if `analysis` is missing, render fallback/empty UI
   - if `analysis.errors` or `analysis.fixes` is not an array, use `[]`
   - if error fields are missing, use safe strings
   - if corrected code is missing, do not render corrected-code body
8. Add safe parser guards in `aiService.js` and `providers/nvidia.js`:
   - wrap all `JSON.parse` calls in `try/catch`
   - safely handle plain text AI responses
   - safely handle malformed AI responses
   - never throw parser errors directly into rendering
9. In `App.jsx`, ensure `handleAnalyze` always sets a valid fallback analysis object if AI fails.
10. If modular AI pipeline code is causing unstable rendering, temporarily simplify the flow:
    - run local/offline analysis
    - set local analysis result
    - attempt AI enhancement separately
    - if AI enhancement fails, keep local result unchanged
11. Add diagnostics with `console.warn` or `console.error` for:
    - AI raw response summary
    - parser errors
    - fallback activation
    - component failures
12. Do not expose raw diagnostics in the visible beginner-facing UI.
13. Preserve Monaco Editor visibility even if analysis fails.
14. Preserve existing layout and UI improvements.

### Antigravity-Ready Prompt

```md
Fix the emergency CodeLens frontend crash after clicking Analyze Code.

The current behavior blanks the whole frontend and leaves only the background gradient.
This is likely a React runtime/render crash.

Do not rewrite the app.
Do not remove Monaco.
Do not remove NVIDIA integration.
Do not remove UI improvements, About page, theme system, or corrected-code button.
Stability first.

Modify:
- src/App.jsx
- src/main.jsx
- src/services/aiService.js
- src/services/providers/nvidia.js
- src/components/ExplanationPanel/ExplanationPanel.jsx
- src/components/ExplanationPanel/ExplanationPanel.css

Create:
- src/components/ErrorBoundary/ErrorBoundary.jsx
- src/components/ErrorBoundary/ErrorBoundary.css

Mandatory fixes:
1. Add React Error Boundary around App in main.jsx.
2. Error Boundary must prevent the whole app from blanking.
3. Add safe fallback rendering in ExplanationPanel.
4. If AI response fails, show local analysis only.
5. Never render blank screen because of AI failure.
6. Verify objects, arrays, and strings before rendering.
7. Wrap all JSON parsing in try/catch.
8. Safely handle malformed AI responses and plain text AI responses.
9. Ensure handleAnalyze always produces a valid fallback analysis object.
10. If modular AI pipeline is unstable, temporarily simplify to local analysis first, AI enhancement second.
11. Add console diagnostics for AI response, parser errors, component failures, and fallback activation.

Required UX if AI fails:
"AI enhancement temporarily unavailable. Local analysis is still active."

User must still see:
- editor
- syntax errors
- line numbers
- suggestions
- analysis panel

Do not expose raw stack traces or provider JSON in the visible UI.
```

### Local Testing Checklist

- Run `npm run dev`.
- Open localhost.
- Confirm app renders before analysis.
- Click `Analyze Code`.
- Confirm the page no longer blanks.
- Confirm Monaco editor remains visible.
- Confirm analysis panel remains visible.
- Confirm AI failure does not crash UI.
- Confirm fallback mode works.
- Confirm local analysis appears if AI fails.
- Confirm visible message says:
  - `AI enhancement temporarily unavailable. Local analysis is still active.`
- Confirm console diagnostics exist for parser/fallback errors.
- Confirm no infinite render loop.
- Confirm no repeated console spam.

### Rollback Safety

- Keep the Error Boundary even if other recovery work is rolled back.
- If modular AI rendering is unstable, rollback only unstable AI rendering logic.
- Do not rollback:
  - UI improvements
  - About page
  - theme system
  - corrected-code button
  - Monaco integration
- Revert only:
  - `src/App.jsx`
  - `src/main.jsx`
  - `src/services/aiService.js`
  - `src/services/providers/nvidia.js`
  - `src/components/ExplanationPanel/ExplanationPanel.jsx`
  - `src/components/ExplanationPanel/ExplanationPanel.css`
  - `src/components/ErrorBoundary/ErrorBoundary.jsx`
  - `src/components/ErrorBoundary/ErrorBoundary.css`

---

## Issue 2: Add React Error Boundary

### Goal

Prevent a component render crash from blanking the entire frontend.

### Files To Modify

- `src/main.jsx`

### Files To Create

- `src/components/ErrorBoundary/ErrorBoundary.jsx`
- `src/components/ErrorBoundary/ErrorBoundary.css`

### Exact Implementation Steps

1. Create `ErrorBoundary.jsx` as a class component using `componentDidCatch` and `getDerivedStateFromError`.
2. Add a fallback UI that preserves the CodeLens visual frame.
3. Include a recovery button:
   - `Reload CodeLens`
4. Log errors to console:
   - error object
   - component stack
5. Import the Error Boundary in `src/main.jsx`.
6. Wrap `<App />` with `<ErrorBoundary>`.
7. Keep fallback UI accessible and readable in both light and dark themes.

### Antigravity-Ready Prompt

```md
Add a React Error Boundary to CodeLens.

Create:
- src/components/ErrorBoundary/ErrorBoundary.jsx
- src/components/ErrorBoundary/ErrorBoundary.css

Modify:
- src/main.jsx

Requirements:
1. Use React class Error Boundary.
2. Catch render-time component crashes.
3. Prevent full blank screen.
4. Show a calm fallback UI.
5. Include a "Reload CodeLens" button.
6. Log error and component stack to console.
7. Do not expose raw stack trace in visible UI.
8. Wrap App with ErrorBoundary in main.jsx.
9. Preserve current app layout and styling as much as possible.
```

### Local Testing Checklist

- Run `npm run dev`.
- Confirm app still loads.
- Temporarily trigger a render error in a test branch or controlled local test.
- Confirm Error Boundary fallback appears instead of blank page.
- Confirm console logs the component error.
- Confirm reload button works.

### Rollback Safety

- Error Boundary is a safety improvement and should remain.
- If fallback styling breaks layout, adjust CSS rather than removing Error Boundary.
- Revert only:
  - `src/components/ErrorBoundary/ErrorBoundary.jsx`
  - `src/components/ErrorBoundary/ErrorBoundary.css`
  - `src/main.jsx`

---

## Issue 3: Safe Fallback Rendering In Analysis Panel

### Goal

Ensure the analysis panel never crashes when analysis data is missing, malformed, partial, or produced by fallback mode.

### Files To Modify

- `src/components/ExplanationPanel/ExplanationPanel.jsx`
- `src/components/ExplanationPanel/ExplanationPanel.css`

### Files To Create

- None

### Exact Implementation Steps

1. Add defensive defaults:
   - `const safeAnalysis = analysis || null`
   - `const errors = Array.isArray(analysis?.fixes) ? analysis.fixes : Array.isArray(analysis?.errors) ? analysis.errors : []`
2. Ensure all text fields are converted to readable strings before rendering.
3. Use safe fallbacks:
   - error title: `Syntax Error`
   - what happened: `CodeLens found an issue in this code.`
   - suggested fix: `Review the highlighted line and apply the suggested correction.`
   - why: `This usually happens when syntax does not match what the language expects.`
   - avoid: `Check structure, brackets, punctuation, and indentation before running again.`
4. Never call `.map` on unknown values.
5. Never call string methods on undefined values.
6. If no valid errors exist but `analysis` exists, render a compact fallback result instead of crashing.
7. If `analysis` is null, render the existing empty state.
8. Guard corrected-code rendering:
   - only render if corrected code is a non-empty string
9. Guard visualizer props:
   - pass empty strings instead of undefined
10. Add a non-blocking fallback message when AI enhancement fails.

### Antigravity-Ready Prompt

```md
Add defensive rendering to ExplanationPanel so malformed analysis data cannot crash the UI.

Modify:
- src/components/ExplanationPanel/ExplanationPanel.jsx
- src/components/ExplanationPanel/ExplanationPanel.css

Requirements:
1. If !analysis, render the existing empty/fallback UI.
2. Verify errors/fixes are arrays before mapping.
3. Verify strings exist before rendering.
4. Use safe fallback strings for missing fields.
5. Never render blank panel because of malformed AI response.
6. Never call map on undefined.
7. Never call string methods on undefined.
8. Guard corrected code rendering.
9. If AI enhancement fails, show:
   "AI enhancement temporarily unavailable. Local analysis is still active."
10. Keep Monaco and page layout visible.

Do not rewrite component architecture.
```

### Local Testing Checklist

- Run `npm run dev`.
- Analyze code with normal response.
- Analyze code with AI disabled.
- Simulate malformed analysis object.
- Confirm panel does not crash.
- Confirm fallback text appears.
- Confirm no blank screen.
- Confirm corrected-code button does not crash when corrected code is missing.

### Rollback Safety

- Revert only:
  - `src/components/ExplanationPanel/ExplanationPanel.jsx`
  - `src/components/ExplanationPanel/ExplanationPanel.css`
- If a fallback text feels too generic, adjust copy without removing defensive guards.

---

## Issue 4: Safe AI Parser And Fallback Object

### Goal

Prevent AI response parsing failures from crashing the UI or producing invalid analysis state.

### Files To Modify

- `src/services/aiService.js`
- `src/services/providers/nvidia.js`
- `src/App.jsx`

### Files To Create

- None

### Exact Implementation Steps

1. Locate every `JSON.parse` call in AI-related files.
2. Wrap every parse in `try/catch`.
3. Add a safe parser helper if useful:
   - direct JSON parse
   - markdown fenced JSON extraction
   - first JSON object extraction
   - plain text fallback
4. Ensure parser returns a stable object or a structured error, never raw throw into UI flow.
5. In `handleAnalyze`, catch all AI/provider errors.
6. Always set a valid fallback analysis object:
   - `source: 'fallback'`
   - `language`
   - `errors: []` or detected local errors
   - `overallSummary`
   - `confidenceMessage`
   - `aiError`
7. Preserve local/offline analysis if AI parsing fails.
8. Add console diagnostics:
   - raw AI response summary
   - parser error
   - fallback activation
9. Avoid logging full API keys or sensitive headers.

### Antigravity-Ready Prompt

```md
Make AI parsing and fallback state safe in CodeLens.

Modify:
- src/services/aiService.js
- src/services/providers/nvidia.js
- src/App.jsx

Requirements:
1. Wrap all JSON.parse calls in try/catch.
2. Safely extract JSON from markdown blocks if needed.
3. Support plain text fallback.
4. Never throw parser errors into React rendering.
5. If AI parsing fails, preserve or create a valid fallback analysis object.
6. handleAnalyze must always leave the UI with valid state.
7. Add console diagnostics for parser errors and fallback activation.
8. Do not log API keys or sensitive headers.
9. If AI fails, show:
   "AI enhancement temporarily unavailable. Local analysis is still active."

Do not modify Monaco files.
Do not rewrite app architecture.
```

### Local Testing Checklist

- Run `npm run dev`.
- Test valid JSON response.
- Test markdown JSON response.
- Test plain text response.
- Test malformed JSON response.
- Confirm no blank screen.
- Confirm fallback object renders.
- Confirm console logs parser diagnostic.
- Confirm no sensitive API key is logged.

### Rollback Safety

- Revert only:
  - `src/services/aiService.js`
  - `src/services/providers/nvidia.js`
  - `src/App.jsx`
- Keep any fallback-object guard that prevents blank screens.

---

## Issue 5: Temporarily Simplify Unstable Modular AI Flow

### Goal

If the modular AI pipeline introduced render instability, temporarily simplify the runtime flow while preserving UI improvements.

### Files To Modify

- `src/App.jsx`
- `src/services/aiService.js`
- `src/components/ExplanationPanel/ExplanationPanel.jsx`

### Files To Create

- None

### Exact Implementation Steps

1. Inspect recent modular AI state changes.
2. Identify whether async enhancement state can produce invalid `analysis`.
3. Temporarily restore a stable flow:
   - run local/offline analysis first
   - set valid local analysis immediately
   - attempt AI enhancement after local render
   - merge AI fields only if response is valid
   - if AI fails, keep local state unchanged
4. Avoid multiple simultaneous state writes that depend on stale analysis.
5. Avoid render-phase state updates.
6. Ensure no `useEffect` creates an infinite loop.
7. Correct dependency arrays if needed.
8. Add comments only where they clarify safety behavior.

### Antigravity-Ready Prompt

```md
Temporarily simplify unstable modular AI rendering flow if it is causing CodeLens to blank after Analyze Code.

Modify:
- src/App.jsx
- src/services/aiService.js
- src/components/ExplanationPanel/ExplanationPanel.jsx

Requirements:
1. Restore stable local-first flow.
2. Set valid local analysis immediately.
3. Run AI enhancement after local analysis is already visible.
4. Merge AI fields only if the response is valid.
5. If AI fails, keep local analysis unchanged.
6. Avoid render-phase state updates.
7. Avoid infinite useEffect loops.
8. Do not remove UI improvements, About page, theme system, or corrected-code button.

Stability first.
```

### Local Testing Checklist

- Run `npm run dev`.
- Click `Analyze Code`.
- Confirm UI does not blank.
- Confirm local analysis appears.
- Confirm AI failure does not remove local analysis.
- Confirm repeated Analyze clicks do not cause infinite loops.
- Confirm no console error spam.

### Rollback Safety

- Rollback only unstable AI rendering logic.
- Preserve:
  - UI improvements
  - About page
  - theme system
  - corrected-code button
  - Error Boundary

---

## Final Emergency Verification

### Goal

Confirm the app is stable after clicking `Analyze Code`.

### Antigravity-Ready Prompt

```md
Perform emergency recovery verification for CodeLens.

Run:
- npm run dev

Verify:
1. App loads normally.
2. Monaco editor remains visible.
3. Click Analyze Code.
4. Frontend does not blank.
5. Analysis panel remains visible.
6. AI failure does not crash UI.
7. Fallback mode works.
8. Local analysis is still shown.
9. User sees:
   "AI enhancement temporarily unavailable. Local analysis is still active."
10. No infinite render loop.
11. No repeated console spam.
12. Error Boundary catches render crashes if any occur.

Only fix regressions related to the crash.
Do not perform unrelated redesigns.
```

### Local Testing Checklist

- `npm run dev` works.
- Analyze Code no longer blanks page.
- React components render safely.
- AI failure does not crash UI.
- Fallback mode works.
- Monaco editor remains visible.
- Analysis panel remains visible.
- Error Boundary is active.
- Console diagnostics are useful.
- No API keys are logged.

### Global Rollback Safety

If new modular AI architecture is unstable:

- temporarily rollback only unstable AI rendering logic
- preserve UI improvements
- preserve About page
- preserve theme system
- preserve corrected-code button
- preserve Error Boundary

Rollback map:

- Error Boundary:
  - `src/main.jsx`
  - `src/components/ErrorBoundary/ErrorBoundary.jsx`
  - `src/components/ErrorBoundary/ErrorBoundary.css`

- Analysis rendering:
  - `src/components/ExplanationPanel/ExplanationPanel.jsx`
  - `src/components/ExplanationPanel/ExplanationPanel.css`

- AI parser/fallback:
  - `src/services/aiService.js`
  - `src/services/providers/nvidia.js`
  - `src/App.jsx`

- Stable AI flow:
  - `src/App.jsx`
  - `src/services/aiService.js`
  - `src/components/ExplanationPanel/ExplanationPanel.jsx`

Never revert unless intentionally modified:

- `src/components/CodeEditor/CodeEditor.jsx`
- `src/components/AboutCodeLens/AboutCodeLens.jsx`
- `src/components/AboutCodeLens/AboutCodeLens.css`
- `package.json`
- `package-lock.json`
