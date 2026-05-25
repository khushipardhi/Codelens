# CodeLens Specification 5

## Purpose

Fix CodeLens AI response parsing, fallback behavior, and the clipped corrected-code button.

Do not rewrite the app. Preserve:

- React + Vite setup
- Monaco Editor integration
- current UI structure
- current routing/state flow
- NVIDIA API integration
- offline fallback behavior
- localhost compatibility

---

## Issue 1: AI Connected But Analysis Fails

### Goal

Fix the NVIDIA AI response parsing path so CodeLens can correctly read OpenAI-compatible chat completion responses.

The app should not show `AI Connected` unless the API test confirms both connectivity and a valid response format.

When parsing fails, the user should see a readable message and CodeLens should safely continue with offline fallback mode.

### Files To Modify

- `src/services/providers/nvidia.js`
- `src/services/aiService.js`
- `src/components/SettingsModal/SettingsModal.jsx`
- `src/App.jsx`

### Exact Implementation Steps

1. Inspect the NVIDIA provider implementation in `src/services/providers/nvidia.js`.
2. Confirm requests use:
   - Base URL: `https://integrate.api.nvidia.com/v1`
   - Chat endpoint: `/chat/completions`
   - Header: `Authorization: Bearer API_KEY`
3. Ensure the provider reads OpenAI-compatible responses from:
   - `response.choices[0].message.content`
4. Add defensive checks for:
   - missing `choices`
   - empty `choices`
   - missing `message`
   - missing `content`
   - non-string content
   - API error payloads
5. If content is plain JSON, parse it directly.
6. If content is markdown-wrapped JSON, extract JSON safely from:
   - fenced code blocks like ```json ... ```
   - fenced code blocks like ``` ... ```
   - the first valid `{ ... }` object in the text
7. If parsing still fails:
   - return a structured provider error
   - preserve the raw short parse error for diagnostics
   - do not crash the UI
8. In `src/services/aiService.js`, keep offline fallback behavior.
9. Make fallback messages user-readable:
   - `AI analysis returned an unreadable response, so CodeLens used offline analysis instead.`
10. Do not expose raw provider JSON to beginner-facing UI.
11. Update API validation so `AI Connected` only appears when:
   - the endpoint responds successfully
   - `choices[0].message.content` exists
   - the validation response format can be parsed or recognized as valid
12. If validation cannot confirm response format, show a warning state instead of `AI Connected`.
13. Preserve existing settings and diagnostics behavior.

### Antigravity-Ready Prompt

```md
Fix CodeLens NVIDIA AI response parsing and fallback behavior.

This is not a rewrite.
Preserve React + Vite + Monaco + current UI.

Modify only:
- src/services/providers/nvidia.js
- src/services/aiService.js
- src/components/SettingsModal/SettingsModal.jsx
- src/App.jsx

Problem:
The UI shows "AI Connected", but Analyze Code fails with:
"AI analysis failed: AI returned a response that could not be parsed. Using offline fallback mode."

Requirements:
1. Inspect NVIDIA provider response parsing.
2. Support OpenAI-compatible chat completion response format.
3. Read assistant content from choices[0].message.content.
4. Use base URL https://integrate.api.nvidia.com/v1.
5. Use endpoint /chat/completions.
6. Use Authorization: Bearer API_KEY.
7. If AI returns markdown/json text, safely extract JSON.
8. Support fenced json blocks, generic fenced code blocks, and first JSON object extraction.
9. If JSON parsing fails, return a readable structured error and keep offline fallback.
10. Do not crash UI on malformed AI response.
11. Do not show "AI Connected" unless API test and response format are valid.
12. Preserve offline fallback mode.
13. Do not expose raw provider output to beginner-facing UI.

Acceptance criteria:
- Valid NVIDIA chat completion responses parse from choices[0].message.content.
- Markdown-wrapped JSON parses correctly.
- Invalid AI output falls back offline with a clear readable message.
- "AI Connected" is shown only after a valid API and response-format check.
```

### Testing Checklist

- Run `npm run dev`.
- Open localhost.
- Open Settings.
- Test NVIDIA API connection with a valid key.
- Confirm `AI Connected` appears only after valid response format is confirmed.
- Analyze sample code in AI mode.
- Confirm valid AI responses parse successfully.
- Test a markdown-wrapped JSON response if mockable.
- Confirm malformed AI output shows a readable fallback message.
- Confirm offline fallback still works.
- Confirm no console errors.
- Confirm no raw provider JSON appears in beginner-facing UI.

### Rollback Safety

- Revert only:
  - `src/services/providers/nvidia.js`
  - `src/services/aiService.js`
  - `src/components/SettingsModal/SettingsModal.jsx`
  - `src/App.jsx`
- If validation changes cause connection-status regressions, revert only the status validation change and keep safer parsing.
- Do not revert Monaco files, package files, or unrelated UI work.

---

## Issue 2: Corrected Code Button Half Hidden

### Goal

Fix the layout/overflow bug that clips the `View Corrected Code` button at the bottom of the right analysis panel.

The button must be fully visible, clickable, keyboard-accessible, and not overlapped by the floating chat button.

### Files To Modify

- `src/components/ExplanationPanel/ExplanationPanel.jsx`
- `src/components/ExplanationPanel/ExplanationPanel.css`
- `src/App.css`
- `src/components/ChatAssistant/ChatAssistant.css`

### Exact Implementation Steps

1. Locate the corrected-code CTA in `ExplanationPanel.jsx`.
2. Ensure the CTA is rendered inside the right panel’s normal content flow or inside a safe sticky footer.
3. Fix panel overflow:
   - scrollable content should use `overflow-y: auto`
   - parent flex/grid containers should use `min-height: 0`
   - avoid clipping CTA inside nested wrappers
4. Add generous bottom padding to the analysis scroll container:
   - enough to fully reveal the CTA
   - enough to avoid the floating chat button
5. If using a sticky CTA footer:
   - use `position: sticky`
   - use `bottom: 0`
   - add theme-aware glass background
   - add internal padding
   - ensure it does not overlap content
6. If using normal content flow:
   - add `margin-bottom` after the CTA
   - reserve bottom space in the scroll container
7. Check `ChatAssistant` placement.
8. Adjust chat bubble offset or panel bottom padding so the bubble never covers the CTA.
9. Ensure button styling works in dark and light mode.
10. Do not change analysis logic.

### Antigravity-Ready Prompt

```md
Fix the clipped "View Corrected Code" button in the CodeLens right analysis panel.

This is a layout/overflow bug fix only.
Do not rewrite the app.
Do not modify AI service logic for this issue.
Do not modify Monaco Editor code.

Modify only:
- src/components/ExplanationPanel/ExplanationPanel.jsx
- src/components/ExplanationPanel/ExplanationPanel.css
- src/App.css
- src/components/ChatAssistant/ChatAssistant.css

Requirements:
1. Add proper bottom padding to the analysis scroll container.
2. Ensure floating chat button does not overlap the CTA.
3. Move corrected-code CTA inside normal content flow OR create sticky footer with safe spacing.
4. Button must be fully visible in dark mode and light mode.
5. Right panel content should scroll independently.
6. Parent containers must not clip bottom CTA.
7. Use min-height: 0 where needed in flex/grid parents.
8. Keep the button accessible and visually clean.

Acceptance criteria:
- "View Corrected Code" is fully visible.
- No clipping.
- No half-hidden button.
- No overlap with floating chat button.
- Right panel scrolling remains smooth.
```

### Testing Checklist

- Run `npm run dev`.
- Open localhost.
- Load sample code.
- Run analysis.
- Scroll the right analysis panel.
- Confirm `View Corrected Code` is fully visible.
- Confirm the button is clickable.
- Confirm the button is keyboard focusable.
- Confirm the floating chat button does not overlap the CTA.
- Test dark mode.
- Test light mode.
- Test narrow/mobile viewport.
- Confirm no console errors.

### Rollback Safety

- Revert only:
  - `src/components/ExplanationPanel/ExplanationPanel.jsx`
  - `src/components/ExplanationPanel/ExplanationPanel.css`
  - `src/App.css`
  - `src/components/ChatAssistant/ChatAssistant.css`
- If sticky footer behavior causes layout issues, remove sticky behavior and keep normal content flow with larger bottom padding.
- Do not revert AI service files for this issue.

---

## Issue 3: Corrected Code Should Be Optional

### Goal

Do not auto-show corrected code after analysis.

Show a button labeled:

- `View Corrected Code`

Only after the user clicks the button should corrected code or comparison content render.

### Files To Modify

- `src/components/ExplanationPanel/ExplanationPanel.jsx`
- `src/components/ExplanationPanel/ExplanationPanel.css`
- `src/components/CodeVisualizer/CodeVisualizer.jsx`
- `src/components/CodeVisualizer/CodeVisualizer.css`

### Exact Implementation Steps

1. Add local state in `ExplanationPanel.jsx`, such as `showCorrectedCode`.
2. Default `showCorrectedCode` to `false`.
3. Reset `showCorrectedCode` to `false` whenever a new analysis result arrives.
4. If `analysis.improvedCode` exists, render only the `View Corrected Code` button initially.
5. Render corrected code only after the button is clicked.
6. Keep the button in the fixed layout from Issue 2 so it is never clipped.
7. Ensure corrected code rendering preserves existing copy behavior if present.
8. Ensure fallback behavior if `analysis.improvedCode` is missing:
   - do not show button, or show a disabled explanatory state only if needed
9. Keep keyboard accessibility:
   - real `<button>`
   - visible focus state
   - clear label
10. Do not modify AI response generation for this issue.

### Antigravity-Ready Prompt

```md
Make corrected code optional in the CodeLens analysis panel.

Do not auto-show corrected code after analysis.

Modify only:
- src/components/ExplanationPanel/ExplanationPanel.jsx
- src/components/ExplanationPanel/ExplanationPanel.css
- src/components/CodeVisualizer/CodeVisualizer.jsx
- src/components/CodeVisualizer/CodeVisualizer.css

Requirements:
1. Add local reveal state for corrected code.
2. Default reveal state to false.
3. Reset reveal state when new analysis arrives.
4. Show a button labeled "View Corrected Code" when analysis.improvedCode exists.
5. Only render corrected code after the button is clicked.
6. Keep the button fully visible and not clipped.
7. Keep the button keyboard accessible.
8. Preserve current analysis and Monaco behavior.

Do not modify:
- service files
- provider files
- App routing/state structure unless absolutely necessary
- Monaco Editor files
```

### Testing Checklist

- Run `npm run dev`.
- Analyze sample code.
- Confirm corrected code does not appear automatically.
- Confirm `View Corrected Code` button appears.
- Click `View Corrected Code`.
- Confirm corrected code appears after click.
- Run a second analysis.
- Confirm corrected code is hidden again until clicked.
- Confirm button remains fully visible.
- Confirm no console errors.

### Rollback Safety

- Revert only:
  - `src/components/ExplanationPanel/ExplanationPanel.jsx`
  - `src/components/ExplanationPanel/ExplanationPanel.css`
  - `src/components/CodeVisualizer/CodeVisualizer.jsx`
  - `src/components/CodeVisualizer/CodeVisualizer.css`
- If reveal-state reset causes issues, keep the optional rendering but simplify reset logic.

---

## Issue 4: Local Testing And Verification

### Goal

Verify AI parsing, fallback behavior, corrected-code optional reveal, and button visibility.

### Files To Modify

- None unless a regression is found.

### Exact Implementation Steps

1. Run local development server.
2. Verify app loads without console errors.
3. Verify AI connection test behavior.
4. Verify malformed AI response fallback behavior.
5. Verify offline fallback still works.
6. Verify corrected-code button is fully visible.
7. Verify corrected-code content renders only after click.

### Antigravity-Ready Prompt

```md
Perform final verification for CodeLens Specification 5.

Run:
- npm run dev

Verify:
1. App loads on localhost.
2. No console errors during normal use.
3. AI test connection works with valid NVIDIA API settings.
4. "AI Connected" appears only after valid API and response-format check.
5. Failed AI response shows a clear readable message.
6. Offline fallback still works.
7. Analyze Code works in fallback mode.
8. Corrected-code button is fully visible.
9. Corrected code is not auto-shown.
10. Corrected code appears only after clicking "View Corrected Code".
11. Floating chat button does not cover CTA.
12. Dark and light modes remain readable.

Only fix regressions caused by these scoped changes.
Do not perform unrelated refactors.
```

### Testing Checklist

- `npm run dev` works.
- No console errors.
- AI test connection works.
- Valid NVIDIA response parses.
- Failed AI response shows clear message.
- Offline fallback still works.
- Corrected-code button is fully visible.
- Corrected-code button is not covered by chat bubble.
- Corrected code is optional and click-revealed.
- Dark mode works.
- Light mode works.

### Rollback Safety

- Roll back feature-by-feature.
- AI parsing rollback:
  - `src/services/providers/nvidia.js`
  - `src/services/aiService.js`
  - `src/components/SettingsModal/SettingsModal.jsx`
  - `src/App.jsx`
- Button visibility rollback:
  - `src/components/ExplanationPanel/ExplanationPanel.jsx`
  - `src/components/ExplanationPanel/ExplanationPanel.css`
  - `src/App.css`
  - `src/components/ChatAssistant/ChatAssistant.css`
- Optional corrected code rollback:
  - `src/components/ExplanationPanel/ExplanationPanel.jsx`
  - `src/components/ExplanationPanel/ExplanationPanel.css`
  - `src/components/CodeVisualizer/CodeVisualizer.jsx`
  - `src/components/CodeVisualizer/CodeVisualizer.css`
- Never revert unless intentionally modified:
  - `src/components/CodeEditor/CodeEditor.jsx`
  - `package.json`
  - `package-lock.json`
