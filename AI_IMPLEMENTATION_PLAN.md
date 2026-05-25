# CodeLens AI Implementation Plan

## Prime Directive

You are working on an existing, partially working CodeLens project. Your job is to write code, fix bugs, and improve the current app incrementally.

Do not rewrite the project. Do not redesign the architecture. Do not remove existing features. Do not replace the current UI direction.

## Strict Rules For The AI Implementer

- Focus on code implementation, not long explanations.
- Read the existing files before editing.
- Preserve the current Vite + React structure.
- Preserve existing components unless a small extraction is clearly safer.
- Make one feature change at a time.
- Modify only the files needed for the current feature.
- Do not invent missing files, APIs, or packages without checking the repo.
- Do not add new dependencies unless absolutely required.
- Do not remove working functionality.
- Do not break localhost development.
- Do not expose or log NVIDIA API keys.
- After each feature, run:

```bash
npm run build
```

If tests/lint are available, also run:

```bash
npm test
npm run lint
```

## Environment Setup

Create `.env` in the project root:

```txt
C:\PROJECT\Codelens\.env
```

Required structure:

```env
VITE_NVIDIA_API_KEY=your_key_here
VITE_NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
VITE_NVIDIA_MODEL=meta/llama-3.1-8b-instruct
```

Vite reads `.env` only when the dev server starts. Restart after changes:

```bash
npm run dev
```

Settings entered in the app must persist in localStorage and must not reset on refresh.

## Exact Implementation Order

### 1. Stability First

1. Fix independent left/right panel scrolling.
2. Fix missing step-by-step explanation rendering.
3. Fix corrected code rendering.
4. Fix NVIDIA API key/base URL/model persistence.
5. Fix failed-to-fetch and API fallback handling.
6. Improve result rendering performance with safe memoization.

### 2. UI/UX Polish

1. Improve light-mode color accessibility.
2. Add real glassmorphism in both light and dark mode.
3. Add subtle skeuomorphism-inspired card styling.
4. Improve cursor glow in both themes.
5. Fix Settings modal spacing and toggle alignment.
6. Add smooth transitions and micro-interactions.
7. Improve About page visuals without turning it into a new landing page.

### 3. Educational Features

1. Strengthen the step-by-step explanation engine.
2. Add corrected full-code visualization panel.
3. Add copy corrected code button.
4. Add lightweight syntax-highlighted corrected code block.
5. Add beginner-friendly expandable explanation layers.

### 4. Advanced Features

1. Add one-click code visualization using existing visualizer files.
2. Add variable flow visualization.
3. Add execution flow explanation.
4. Add confidence-safe beginner guidance.

## Safe Coding Strategy

For every feature:

1. Inspect the current related files.
2. Identify the smallest safe change.
3. Implement the change.
4. Keep existing class names and props where possible.
5. Add fallback behavior for missing/invalid data.
6. Test on localhost.
7. Check light mode and dark mode.
8. Check browser console errors.
9. Do not continue to the next feature until the current one works.

## NVIDIA API Rules

- Resolve config in this order:
  1. User settings from localStorage
  2. `.env` values from `import.meta.env`
  3. safe hardcoded defaults
- Never log API keys.
- If NVIDIA fails, fall back to offline analysis.
- Handle:
  - missing key
  - invalid key
  - rate limit
  - failed fetch
  - timeout
  - malformed response
- Always show a friendly user message instead of crashing.

## Localhost Testing Checklist

Run after each feature:

```bash
npm run dev
```

Then verify:

- App loads on localhost.
- Editor works.
- Sample code loads.
- Analyze Code works.
- Offline mode works.
- AI failure falls back safely.
- Step-by-step results render.
- Corrected code renders.
- Settings persist after refresh.
- Light mode is readable.
- Dark mode is readable.
- Mobile layout does not break.
- Browser console has no uncaught errors.

## Output Rule For AI Implementer

After implementing each feature, report only:

- Files changed
- What was fixed
- Commands run
- Any remaining issue

Do not provide generic architecture theory.
