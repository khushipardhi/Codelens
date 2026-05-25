# CodeLens AI Pipeline Optimization

## Purpose

Improve the CodeLens AI workflow, speed, response handling, and fallback system without rewriting the full app or breaking existing functionality.

Project: CodeLens, a React + Vite + Monaco Editor + NVIDIA API app.

Do not:

- rewrite the full app
- break existing CodeLens functionality
- remove Monaco Editor integration
- remove NVIDIA API integration
- remove offline fallback
- block the UI while AI is loading
- generate corrected code automatically

Preserve:

- React + Vite setup
- current UI structure
- current routing/state flow
- Monaco Editor integration
- NVIDIA API provider
- localhost compatibility

---

## Main Problem

When the user changes explanation style to:

- Bilingual
- Friendly
- Professional
- Beginner Friendly

CodeLens becomes slow or says AI is unavailable.

Likely cause:

- the app is trying to generate explanation, corrected code, bilingual translation, prevention tip, and confidence message in one heavy AI request.

Required fix:

- split the AI workflow into a modular pipeline.
- show local/offline analysis instantly.
- load AI enhancements separately.
- generate corrected code only after user clicks `View Corrected Code`.

---

## Required New Flow

### Step 1: Local Analysis First

Run local/offline analysis instantly.

Show immediately:

- detected language
- syntax error
- line number
- what happened
- suggested fix

### Step 2: AI Enhancement Separately

Load AI enhancement after local analysis is visible.

AI should only enhance:

- friendly explanation
- bilingual explanation
- professional tone
- confidence message

### Step 3: Corrected Code On Demand

Load corrected code separately only when user clicks:

- `View Corrected Code`

Do not generate corrected code automatically.

---

## Feature 1: Modular Local-First Analysis Flow

### Goal

Make CodeLens feel fast and reliable by showing local/offline analysis immediately before any AI enhancement request.

### Files To Modify

- `src/App.jsx`
- `src/services/aiService.js`
- `src/services/providers/offline.js`
- `src/services/languageDetector.js`
- `src/components/ExplanationPanel/ExplanationPanel.jsx`
- `src/components/ExplanationPanel/ExplanationPanel.css`

### Exact Implementation Steps

1. Inspect the current `handleAnalyze` flow in `src/App.jsx`.
2. Ensure local/offline analysis runs first and completes quickly.
3. Immediately set panel state with local results:
   - detected language
   - syntax error
   - line number
   - what happened
   - suggested fix
4. Add separate state for AI enhancement loading, such as:
   - `isEnhancingExplanation`
   - `aiEnhancementError`
5. Do not clear local analysis while AI enhancement is running.
6. Show UI message:
   - `Local analysis ready. Enhancing explanation with AI...`
7. If AI enhancement succeeds, merge only enhancement fields into existing analysis.
8. If AI enhancement fails, keep local analysis visible and show:
   - `AI explanation temporarily unavailable. Local explanation is still active.`
9. Do not block the Analyze button flow longer than local analysis.
10. Do not generate corrected code during initial analysis.

### Antigravity-Ready Prompt

```md
Refactor CodeLens analysis flow to be local-first and AI-enhanced.

This is not a rewrite.
Preserve React + Vite + Monaco + current UI.

Modify only:
- src/App.jsx
- src/services/aiService.js
- src/services/providers/offline.js
- src/services/languageDetector.js
- src/components/ExplanationPanel/ExplanationPanel.jsx
- src/components/ExplanationPanel/ExplanationPanel.css

Goal:
Run local/offline analysis instantly, show the result immediately, then load AI enhancement separately.

Requirements:
1. Local/offline analysis must run first.
2. UI must immediately show detected language, syntax error, line number, what happened, and suggested fix.
3. Add separate AI enhancement loading state.
4. While AI enhancement loads, show:
   "Local analysis ready. Enhancing explanation with AI..."
5. If AI enhancement fails, keep local analysis visible and show:
   "AI explanation temporarily unavailable. Local explanation is still active."
6. Do not block the whole analysis while AI runs.
7. Do not generate corrected code automatically.
8. Preserve offline fallback behavior.
9. Preserve Monaco behavior.
10. Preserve NVIDIA provider integration.

Do not modify package files.
Do not add dependencies.
```

### Testing Checklist

- Run `npm run dev`.
- Open localhost.
- Load sample code.
- Click Analyze Code.
- Confirm local analysis appears immediately.
- Confirm AI enhancement loading message appears separately.
- Confirm UI remains usable while AI enhancement loads.
- Disable/break NVIDIA key and confirm local analysis remains visible.
- Confirm fallback message is readable.
- Confirm no corrected code appears automatically.
- Confirm no console errors.

### Rollback Safety

- Revert only:
  - `src/App.jsx`
  - `src/services/aiService.js`
  - `src/services/providers/offline.js`
  - `src/services/languageDetector.js`
  - `src/components/ExplanationPanel/ExplanationPanel.jsx`
  - `src/components/ExplanationPanel/ExplanationPanel.css`
- If the split flow causes regressions, keep local-first display and temporarily disable AI merge until fixed.

---

## Feature 2: Split AI Tasks Into Small Services

### Goal

Avoid slow, fragile, overloaded AI prompts by splitting AI work into smaller service functions.

### Required Modular Services

Implement or refactor into:

1. `localAnalyzer()`
   - fast offline syntax/error detection

2. `aiExplainError()`
   - only explains the detected error

3. `aiTranslateBilingual()`
   - only creates bilingual explanation from existing local explanation

4. `aiGenerateCorrectedCode()`
   - only runs when user clicks `View Corrected Code`

5. `aiConfidenceMessage()`
   - only creates a short supportive line

### Files To Modify

- `src/services/aiService.js`
- `src/services/providers/nvidia.js`
- `src/services/providers/offline.js`
- `src/App.jsx`
- `src/components/ExplanationPanel/ExplanationPanel.jsx`

### Exact Implementation Steps

1. Inspect existing exported functions in `src/services/aiService.js`.
2. Add modular function exports without removing existing exports until call sites are migrated.
3. Implement `localAnalyzer()` as a wrapper over existing offline/pattern analysis.
4. Implement `aiExplainError()` with a small prompt:
   - input: language, error name, line number, local explanation, suggested fix
   - output: concise enhanced explanation
5. Implement `aiTranslateBilingual()`:
   - input: already detected explanation and target bilingual style
   - output: bilingual version only
   - do not rerun full analysis
6. Implement `aiGenerateCorrectedCode()`:
   - input: original code, language, detected error summary
   - output: corrected code only
   - call only after `View Corrected Code`
7. Implement `aiConfidenceMessage()`:
   - input: error summary and tone
   - output: one short supportive line
8. Keep prompts small.
9. Do not request explanation, corrected code, bilingual translation, prevention tip, and confidence message in one request.
10. Keep fallback paths for each modular service.
11. Preserve existing UI fields by merging modular outputs into the current analysis object.

### Antigravity-Ready Prompt

```md
Split CodeLens AI work into modular service functions.

This is not a full rewrite.
Preserve existing exports where needed during migration.

Modify only:
- src/services/aiService.js
- src/services/providers/nvidia.js
- src/services/providers/offline.js
- src/App.jsx
- src/components/ExplanationPanel/ExplanationPanel.jsx

Create or refactor these functions:
1. localAnalyzer()
   - fast offline syntax/error detection
2. aiExplainError()
   - only explains the detected error
3. aiTranslateBilingual()
   - only translates/enhances the existing explanation
4. aiGenerateCorrectedCode()
   - only generates corrected code after View Corrected Code click
5. aiConfidenceMessage()
   - only creates a small supportive line

Rules:
- Do not send huge prompts.
- Do not ask AI for explanation, corrected code, bilingual translation, prevention tip, and confidence message in one request.
- Use smaller requests.
- Keep local analysis visible if any AI task fails.
- Preserve offline fallback.
- Do not add dependencies.
```

### Testing Checklist

- Run `npm run dev`.
- Analyze sample code in default style.
- Switch to Friendly and analyze.
- Switch to Professional and analyze.
- Switch to Beginner Friendly and analyze.
- Switch to Bilingual and analyze.
- Confirm styles do not freeze the app.
- Confirm bilingual mode does not rerun full analysis unnecessarily.
- Confirm local analysis appears before AI enhancement.
- Confirm no corrected code is generated until requested.

### Rollback Safety

- Revert only:
  - `src/services/aiService.js`
  - `src/services/providers/nvidia.js`
  - `src/services/providers/offline.js`
  - `src/App.jsx`
  - `src/components/ExplanationPanel/ExplanationPanel.jsx`
- Preserve old service exports until all usages are stable.
- If one modular function fails, route it to offline/local fallback without reverting the full pipeline.

---

## Feature 3: Lazy Corrected Code Generation

### Goal

Generate corrected code only when the user clicks `View Corrected Code`.

This reduces initial AI latency and avoids overwhelming beginners.

### Files To Modify

- `src/App.jsx`
- `src/services/aiService.js`
- `src/services/providers/nvidia.js`
- `src/components/ExplanationPanel/ExplanationPanel.jsx`
- `src/components/ExplanationPanel/ExplanationPanel.css`
- `src/components/CodeVisualizer/CodeVisualizer.jsx`
- `src/components/CodeVisualizer/CodeVisualizer.css`

### Exact Implementation Steps

1. Remove corrected-code generation from the initial Analyze Code flow.
2. Store local analysis and AI explanation independently from corrected code.
3. Add callback from `ExplanationPanel` for corrected-code request, such as:
   - `onRequestCorrectedCode`
4. Add state:
   - `correctedCode`
   - `isLoadingCorrectedCode`
   - `correctedCodeError`
5. When user clicks `View Corrected Code`:
   - call `aiGenerateCorrectedCode()`
   - show loading state inside corrected code area
   - parse output safely
   - render corrected code when available
6. If AI corrected-code generation fails:
   - show readable error
   - optionally provide local suggested fix text
   - do not crash UI
7. Keep corrected code hidden until user clicks.
8. Reset corrected code state when a new analysis runs.

### Antigravity-Ready Prompt

```md
Make corrected code generation lazy in CodeLens.

Do not generate corrected code during initial analysis.

Modify only:
- src/App.jsx
- src/services/aiService.js
- src/services/providers/nvidia.js
- src/components/ExplanationPanel/ExplanationPanel.jsx
- src/components/ExplanationPanel/ExplanationPanel.css
- src/components/CodeVisualizer/CodeVisualizer.jsx
- src/components/CodeVisualizer/CodeVisualizer.css

Requirements:
1. Initial analysis must not request corrected code from AI.
2. Show a "View Corrected Code" button after analysis.
3. Only after click, call aiGenerateCorrectedCode().
4. Show corrected-code loading state separately.
5. Parse corrected-code response safely.
6. If corrected-code AI fails, show readable error and keep explanation visible.
7. Reset corrected-code state when new analysis runs.
8. Preserve current UI and Monaco behavior.

Do not add dependencies.
```

### Testing Checklist

- Run `npm run dev`.
- Analyze sample code.
- Confirm corrected code is not generated initially.
- Confirm `View Corrected Code` button appears.
- Click `View Corrected Code`.
- Confirm corrected-code loading state appears.
- Confirm corrected code appears after response.
- Simulate failed corrected-code request.
- Confirm readable error appears.
- Analyze again.
- Confirm corrected code resets.

### Rollback Safety

- Revert only:
  - `src/App.jsx`
  - `src/services/aiService.js`
  - `src/services/providers/nvidia.js`
  - `src/components/ExplanationPanel/ExplanationPanel.jsx`
  - `src/components/ExplanationPanel/ExplanationPanel.css`
  - `src/components/CodeVisualizer/CodeVisualizer.jsx`
  - `src/components/CodeVisualizer/CodeVisualizer.css`
- If lazy request fails, keep corrected-code button hidden temporarily rather than restoring heavy initial generation.

---

## Feature 4: Response Parsing Safety

### Goal

Make AI response parsing safe and tolerant so unexpected NVIDIA output never crashes the UI or leaves blank content.

### Problem

NVIDIA AI sometimes returns normal text instead of JSON.

### Required Parser Behavior

The parser must:

- try `JSON.parse` safely
- extract JSON from markdown code blocks if needed
- support plain text fallback
- never show blank UI
- never crash if response format is unexpected
- return readable fallback content

### Files To Modify

- `src/services/providers/nvidia.js`
- `src/services/aiService.js`

### Exact Implementation Steps

1. Inspect current NVIDIA response parsing.
2. Ensure OpenAI-compatible content is read from:
   - `choices[0].message.content`
3. Create or refine a safe parser helper:
   - `parseAiJsonOrText(content)`
4. Parser order:
   - if content is object, return it
   - try direct `JSON.parse`
   - try extracting fenced ```json block
   - try extracting generic fenced block
   - try extracting first `{ ... }` object
   - if all fail, return plain text fallback
5. Plain text fallback should map to the expected field for the current task:
   - explanation text for `aiExplainError`
   - bilingual text for `aiTranslateBilingual`
   - corrected code text for `aiGenerateCorrectedCode`
   - confidence text for `aiConfidenceMessage`
6. Avoid throwing parser errors into UI.
7. Return structured diagnostics for logging.
8. Keep user-facing messages readable.

### Antigravity-Ready Prompt

```md
Fix CodeLens AI response parsing safety.

Modify only:
- src/services/providers/nvidia.js
- src/services/aiService.js

Requirements:
1. Read NVIDIA/OpenAI-compatible response from choices[0].message.content.
2. Safely parse JSON with try/catch.
3. Extract JSON from markdown code blocks if needed.
4. Support plain text fallback.
5. Never crash on unexpected response format.
6. Never show blank UI.
7. Return readable fallback content if parsing fails.
8. Keep offline fallback active.

Parser should support:
- direct JSON
- ```json fenced JSON
- generic fenced JSON
- first JSON object inside text
- plain text fallback

Do not add dependencies.
Do not expose raw provider output to beginner-facing UI.
```

### Testing Checklist

- Run `npm run dev`.
- Test direct JSON AI response.
- Test markdown fenced JSON response.
- Test generic fenced JSON response.
- Test plain text response.
- Test malformed response.
- Confirm UI never crashes.
- Confirm UI never goes blank.
- Confirm fallback message is readable.

### Rollback Safety

- Revert only:
  - `src/services/providers/nvidia.js`
  - `src/services/aiService.js`
- If parser helper causes regressions, route parsing failures to plain text fallback first, then refine JSON extraction.

---

## Feature 5: Timeout, Retry, And Fallback Handling

### Goal

Make AI calls reliable and professional by adding timeout, retry, and graceful fallback handling.

### Files To Modify

- `src/services/providers/nvidia.js`
- `src/services/aiService.js`
- `src/App.jsx`
- `src/components/ExplanationPanel/ExplanationPanel.jsx`

### Exact Implementation Steps

1. Add timeout support to NVIDIA fetch calls using `AbortController`.
2. Use reasonable timeouts:
   - explanation: shorter timeout
   - bilingual translation: shorter timeout
   - corrected code: moderate timeout
3. Add retry handling:
   - retry only once for transient failures
   - do not retry parse errors endlessly
4. Classify errors:
   - network timeout
   - unauthorized API key
   - rate limit
   - parse error
   - unknown provider error
5. Ensure UI messages are friendly:
   - `AI explanation temporarily unavailable. Local explanation is still active.`
6. Do not block local analysis while retrying.
7. Keep fallback active for every AI task.

### Antigravity-Ready Prompt

```md
Add timeout, retry, and fallback handling to CodeLens AI calls.

Modify only:
- src/services/providers/nvidia.js
- src/services/aiService.js
- src/App.jsx
- src/components/ExplanationPanel/ExplanationPanel.jsx

Requirements:
1. Use AbortController for request timeouts.
2. Retry transient AI failures once.
3. Do not retry malformed parse errors endlessly.
4. Classify common errors: timeout, unauthorized, rate limit, parse error, unknown.
5. Keep local analysis visible during AI failures.
6. Show:
   "AI explanation temporarily unavailable. Local explanation is still active."
7. Do not block the whole analysis.
8. Preserve offline fallback.

Do not add dependencies.
```

### Testing Checklist

- Run `npm run dev`.
- Simulate slow AI response.
- Confirm timeout occurs gracefully.
- Simulate invalid API key.
- Confirm readable auth error.
- Simulate provider failure.
- Confirm local analysis remains visible.
- Confirm no repeated infinite retries.
- Confirm no console error spam.

### Rollback Safety

- Revert only:
  - `src/services/providers/nvidia.js`
  - `src/services/aiService.js`
  - `src/App.jsx`
  - `src/components/ExplanationPanel/ExplanationPanel.jsx`
- If retry handling causes issues, keep timeout and fallback but disable retry.

---

## Feature 6: Bilingual Mode Optimization

### Goal

Make bilingual mode fast by translating/enhancing already detected explanation instead of rerunning full analysis.

### Files To Modify

- `src/App.jsx`
- `src/services/aiService.js`
- `src/components/ToneSelector/ToneSelector.jsx`
- `src/components/ExplanationPanel/ExplanationPanel.jsx`

### Exact Implementation Steps

1. Identify how tone/style changes are handled.
2. Ensure selecting Bilingual does not force a full AI analysis if local analysis already exists.
3. Use existing local explanation as input to `aiTranslateBilingual()`.
4. Keep bilingual request small.
5. Show bilingual loading state:
   - `Enhancing explanation with bilingual support...`
6. If bilingual AI fails, keep original local explanation visible.
7. Do not clear analysis while bilingual translation loads.
8. Cache bilingual result for the current analysis if practical.

### Antigravity-Ready Prompt

```md
Optimize Bilingual mode in CodeLens.

Modify only:
- src/App.jsx
- src/services/aiService.js
- src/components/ToneSelector/ToneSelector.jsx
- src/components/ExplanationPanel/ExplanationPanel.jsx

Goal:
Bilingual mode should not rerun full analysis.

Requirements:
1. Use already detected local explanation as input.
2. Call aiTranslateBilingual() only.
3. Keep request small.
4. Do not request corrected code.
5. Do not clear existing analysis while translation loads.
6. If bilingual AI fails, keep local explanation visible.
7. Show:
   "Enhancing explanation with bilingual support..."
8. Avoid freezing UI.

Do not add dependencies.
Do not modify Monaco or provider config beyond existing AI service calls.
```

### Testing Checklist

- Run `npm run dev`.
- Analyze sample code.
- Switch to Bilingual.
- Confirm full analysis does not rerun unnecessarily.
- Confirm UI does not freeze.
- Confirm local explanation remains visible.
- Confirm bilingual enhancement appears when ready.
- Simulate bilingual AI failure.
- Confirm local explanation remains active.

### Rollback Safety

- Revert only:
  - `src/App.jsx`
  - `src/services/aiService.js`
  - `src/components/ToneSelector/ToneSelector.jsx`
  - `src/components/ExplanationPanel/ExplanationPanel.jsx`
- If tone-change optimization regresses behavior, keep local-first flow and let Bilingual apply only on next Analyze click.

---

## Feature 7: AI Loading UI States

### Goal

Make AI loading and fallback states clear without blocking the user.

### Required UI Messages

When AI is loading:

- `Local analysis ready. Enhancing explanation with AI...`

If AI fails:

- `AI explanation temporarily unavailable. Local explanation is still active.`

### Files To Modify

- `src/components/ExplanationPanel/ExplanationPanel.jsx`
- `src/components/ExplanationPanel/ExplanationPanel.css`
- `src/App.jsx`

### Exact Implementation Steps

1. Add props or derived state for AI enhancement loading and errors.
2. Show the AI loading message inside the AI Mentor panel without replacing local analysis.
3. Show the AI failure message as a small non-blocking notice.
4. Keep local explanation visible at all times.
5. Use calm styling.
6. Avoid large banners that make the UI feel broken.

### Antigravity-Ready Prompt

```md
Add non-blocking AI loading and fallback UI states to CodeLens.

Modify only:
- src/components/ExplanationPanel/ExplanationPanel.jsx
- src/components/ExplanationPanel/ExplanationPanel.css
- src/App.jsx

Requirements:
1. When AI enhancement is loading, show:
   "Local analysis ready. Enhancing explanation with AI..."
2. If AI enhancement fails, show:
   "AI explanation temporarily unavailable. Local explanation is still active."
3. Do not hide local analysis while AI loads.
4. Do not block the whole panel.
5. Keep styling calm, small, and professional.
6. Preserve existing analysis layout.
```

### Testing Checklist

- Run `npm run dev`.
- Analyze with working AI.
- Confirm loading message appears briefly.
- Analyze with failing AI.
- Confirm fallback message appears.
- Confirm local analysis remains visible.
- Confirm no blank UI.

### Rollback Safety

- Revert only:
  - `src/components/ExplanationPanel/ExplanationPanel.jsx`
  - `src/components/ExplanationPanel/ExplanationPanel.css`
  - `src/App.jsx`

---

## Final Localhost Verification

### Goal

Verify the modular AI pipeline is faster, safer, and more reliable.

### Antigravity-Ready Prompt

```md
Perform final verification for CodeLens AI Pipeline Optimization.

Run:
- npm run dev

Verify:
1. App loads on localhost.
2. No console errors.
3. Local analysis appears instantly.
4. AI explanation loads separately.
5. Friendly mode does not freeze.
6. Professional mode does not freeze.
7. Beginner Friendly mode does not freeze.
8. Bilingual mode does not rerun full analysis unnecessarily.
9. Corrected code only loads after clicking View Corrected Code.
10. Fallback works if NVIDIA fails.
11. NVIDIA malformed/plain-text responses do not crash UI.
12. Offline fallback remains active.
13. Monaco typing remains responsive.

Only fix regressions caused by these scoped changes.
Do not perform unrelated refactors.
```

### Testing Checklist

- `npm run dev` works.
- No console errors.
- Local analysis appears instantly.
- AI explanation loads separately.
- Bilingual mode does not freeze.
- Corrected code only loads after button click.
- Fallback works if NVIDIA fails.
- Response parser handles JSON.
- Response parser handles markdown JSON.
- Response parser handles plain text.
- Response parser handles malformed text.
- Offline fallback still works.
- Monaco remains responsive.

### Global Rollback Safety

Rollback feature-by-feature.

Local-first flow rollback:

- `src/App.jsx`
- `src/services/aiService.js`
- `src/services/providers/offline.js`
- `src/services/languageDetector.js`
- `src/components/ExplanationPanel/ExplanationPanel.jsx`
- `src/components/ExplanationPanel/ExplanationPanel.css`

Modular service rollback:

- `src/services/aiService.js`
- `src/services/providers/nvidia.js`
- `src/services/providers/offline.js`
- `src/App.jsx`
- `src/components/ExplanationPanel/ExplanationPanel.jsx`

Lazy corrected-code rollback:

- `src/App.jsx`
- `src/services/aiService.js`
- `src/services/providers/nvidia.js`
- `src/components/ExplanationPanel/ExplanationPanel.jsx`
- `src/components/ExplanationPanel/ExplanationPanel.css`
- `src/components/CodeVisualizer/CodeVisualizer.jsx`
- `src/components/CodeVisualizer/CodeVisualizer.css`

Parser and timeout rollback:

- `src/services/providers/nvidia.js`
- `src/services/aiService.js`

Bilingual optimization rollback:

- `src/App.jsx`
- `src/services/aiService.js`
- `src/components/ToneSelector/ToneSelector.jsx`
- `src/components/ExplanationPanel/ExplanationPanel.jsx`

Never revert unless intentionally modified:

- `src/components/CodeEditor/CodeEditor.jsx`
- `package.json`
- `package-lock.json`
