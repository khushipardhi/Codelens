# CodeLens Monaco Error Highlighting Fix

Antigravity-ready implementation specification for fixing overlapping Monaco Editor error highlights in CodeLens.

## Scope Guardrails

- Do not redesign the editor.
- Do not redesign the app UI.
- Do not change AI behavior.
- Do not change analysis logic.
- Do not change corrected code comparison.
- Do not change assistant behavior.
- Only fix Monaco error highlight rendering.

## Current Repo Findings

The relevant implementation is in:

- `src/components/CodeEditor/CodeEditor.jsx`
- `src/components/CodeEditor/CodeEditor.css`
- `src/App.jsx`

Current issue found in `CodeEditor.jsx`:

```jsx
editorRef.current.deltaDecorations([], decorations);
```

This adds new decorations without passing the previous decoration ids, so old decorations can remain and stack visually.

Current decoration options also use:

```jsx
isWholeLine: true
className: 'error-line-highlight'
glyphMarginClassName: 'error-glyph-margin'
overviewRuler: {
  color: '#f472b6',
  position: 1,
}
```

This can produce large pink/purple full-line visual blocks when many syntax errors are present.

## Fix 1: Remove Large Pink Overlays

### 1. Root Cause

The current error decoration uses a whole-line class with a pink background and a pink overview ruler color. With many markers, these decorations visually combine into large pink/purple highlight blocks.

### 2. Goal

Make error highlighting precise and calm:

- No full editor tint.
- No large block tint.
- No harsh pink/purple overlays.
- Only a subtle marker on the exact affected line.
- Prefer a subtle underline or border treatment over heavy background fills.

### 3. Files To Modify

- `src/components/CodeEditor/CodeEditor.jsx`
- `src/components/CodeEditor/CodeEditor.css`

### 4. Exact Implementation Steps

1. Keep the editor component structure unchanged.
2. In `CodeEditor.jsx`, replace the existing decoration objects with two subtle decoration types:
   - A low-opacity line decoration for the exact affected line.
   - An inline decoration for the bounded error range.
3. Do not use any decoration that covers more than the intended line.
4. Do not use a strong `overviewRuler` color for these custom decorations because `overviewRulerLanes` is currently `0`.
5. Use a calm class naming scheme:

```jsx
const newDecorations = uniqueErrorLines.map((line) => ({
  range: new monacoRef.current.Range(line, 1, line, model.getLineMaxColumn(line)),
  options: {
    isWholeLine: true,
    className: 'codelens-error-line',
    linesDecorationsClassName: 'codelens-error-line-marker',
    glyphMarginClassName: 'codelens-error-glyph',
  },
}));
```

6. Keep the line background extremely low opacity in CSS.
7. If exact columns are available later, add a second inline decoration for the token/range and avoid using the whole line for token styling:

```jsx
{
  range: new monacoRef.current.Range(startLine, startColumn, endLine, endColumn),
  options: {
    inlineClassName: 'codelens-error-token',
    stickiness: monacoRef.current.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
  },
}
```

8. Do not change how errors are generated. Use only existing error line information unless column data already exists.

### 5. CSS Cleanup Instructions

Replace the current aggressive styles:

```css
.error-line-highlight {
  background: rgba(240,98,146,0.06) !important;
  border-left: 2px solid var(--accent-rose) !important;
}

.error-glyph-margin {
  background: var(--accent-rose);
}
```

With subtle styles:

```css
.monaco-editor .codelens-error-line {
  background: rgba(248, 113, 113, 0.055);
  box-shadow: inset 2px 0 0 rgba(248, 113, 113, 0.72);
  animation: codelens-error-fade 180ms ease-out;
}

.monaco-editor .codelens-error-token {
  text-decoration-line: underline;
  text-decoration-style: wavy;
  text-decoration-thickness: 1px;
  text-decoration-color: rgba(248, 113, 113, 0.95);
  text-underline-offset: 3px;
  text-shadow: 0 0 10px rgba(248, 113, 113, 0.22);
}

.monaco-editor .codelens-error-line-marker {
  border-left: 2px solid rgba(248, 113, 113, 0.78);
}

.monaco-editor .codelens-error-glyph {
  background: rgba(248, 113, 113, 0.9);
  border-radius: 999px;
  width: 6px !important;
  height: 6px !important;
  margin: auto;
  box-shadow: 0 0 8px rgba(248, 113, 113, 0.34);
}

[data-theme="light"] .monaco-editor .codelens-error-line {
  background: rgba(220, 38, 38, 0.045);
  box-shadow: inset 2px 0 0 rgba(220, 38, 38, 0.58);
}

[data-theme="light"] .monaco-editor .codelens-error-token {
  text-decoration-color: rgba(185, 28, 28, 0.84);
  text-shadow: none;
}

[data-theme="light"] .monaco-editor .codelens-error-line-marker {
  border-left-color: rgba(185, 28, 28, 0.62);
}

[data-theme="light"] .monaco-editor .codelens-error-glyph {
  background: rgba(185, 28, 28, 0.76);
  box-shadow: none;
}
```

### 6. Monaco API Usage Notes

- Use `monaco.Range(startLine, startCol, endLine, endCol)` for all custom ranges.
- Use `isWholeLine: true` only for the exact affected line, never for a large block.
- Use `inlineClassName` for token/range underlines.
- Use `className` sparingly and keep opacity very low.
- Use `linesDecorationsClassName` for the thin left marker.
- Avoid heavy `overviewRuler` colors for this app because overview ruler lanes are disabled.

### 7. Antigravity-Ready Implementation Prompt

Fix only Monaco error highlight rendering in `src/components/CodeEditor/CodeEditor.jsx` and `src/components/CodeEditor/CodeEditor.css`. Remove the large pink/purple visual effect by replacing the old `error-line-highlight` and `error-glyph-margin` styling with subtle `codelens-error-line`, `codelens-error-token`, `codelens-error-line-marker`, and `codelens-error-glyph` styles. Keep line tint very low opacity, use a thin left marker, and use wavy underline styling for bounded ranges. Do not change AI analysis, corrected code modal, assistant, explanations, syntax themes, or the main layout.

### 8. Testing Checklist

- Paste long Java code with many syntax errors.
- Paste long C code with many syntax errors.
- Paste long Python code with indentation and syntax errors.
- Run analysis.
- Verify no giant pink/purple overlays appear.
- Verify only affected lines have subtle tint.
- Verify dark mode looks elegant.
- Verify light mode looks elegant.
- Verify Monaco syntax colors are unchanged.
- Verify no console errors.

## Fix 2: Prevent Decoration Stacking

### 1. Root Cause

`deltaDecorations([], decorations)` always passes an empty old-decoration array. Monaco cannot remove prior decoration ids, so repeated analysis or code changes can stack old highlights.

### 2. Goal

Make decorations deterministic:

- Clear previous decorations before applying new ones.
- Never stack repeated decorations.
- Clear decorations when `errorLines` becomes empty.
- Keep rendering stable with multiple errors.

### 3. Files To Modify

- `src/components/CodeEditor/CodeEditor.jsx`

### 4. Exact Implementation Steps

1. Add a decoration id ref near the existing refs:

```jsx
const errorDecorationIdsRef = useRef([]);
```

2. Store Monaco in a ref so ranges can use the real Monaco API:

```jsx
const monacoRef = useRef(null);
```

3. Update `handleEditorMount` to receive Monaco:

```jsx
const handleEditorMount = (editor, monaco) => {
  editorRef.current = editor;
  monacoRef.current = monaco;
  editor.focus();
};
```

4. Replace the current decoration effect with a cleanup-safe effect:

```jsx
useEffect(() => {
  const editor = editorRef.current;
  const monaco = monacoRef.current;
  const model = editor?.getModel();

  if (!editor || !monaco || !model) return;

  const lineCount = model.getLineCount();
  const uniqueErrorLines = [...new Set(errorLines)]
    .map(Number)
    .filter((line) => Number.isInteger(line) && line >= 1 && line <= lineCount);

  const newDecorations = uniqueErrorLines.map((line) => ({
    range: new monaco.Range(line, 1, line, model.getLineMaxColumn(line)),
    options: {
      isWholeLine: true,
      className: 'codelens-error-line',
      linesDecorationsClassName: 'codelens-error-line-marker',
      glyphMarginClassName: 'codelens-error-glyph',
    },
  }));

  errorDecorationIdsRef.current = editor.deltaDecorations(
    errorDecorationIdsRef.current,
    newDecorations
  );
}, [errorLines, code]);
```

5. Important: pass `errorDecorationIdsRef.current` as the first argument to `deltaDecorations`.
6. Do not pass `[]` except for initial empty ref value.
7. Include `code` in the dependency array so decorations are recalculated against the current model after paste/edit changes.
8. Deduplicate error lines with `new Set(errorLines)`.
9. Filter invalid line numbers so Monaco never receives out-of-range line ranges.
10. If `errorLines` is empty, the effect should still call `deltaDecorations(previousIds, [])` to clear old highlights. Do not early-return just because `errorLines.length === 0`.

### 5. CSS Cleanup Instructions

No additional CSS is required specifically for stacking. Stacking is fixed by correctly storing and passing decoration ids.

Remove unused old classes after migration:

```css
.error-line-highlight
.error-glyph-margin
```

Only remove them after confirming no JSX still references them.

### 6. Monaco API Usage Notes

- Correct usage:

```jsx
const nextIds = editor.deltaDecorations(previousIds, nextDecorations);
```

- Incorrect usage for repeated updates:

```jsx
editor.deltaDecorations([], nextDecorations);
```

- `deltaDecorations` returns decoration ids. Store them in a `useRef`.
- Passing the previous ids lets Monaco remove old decorations and add the new set atomically.

### 7. Antigravity-Ready Implementation Prompt

Fix decoration stacking in `src/components/CodeEditor/CodeEditor.jsx`. Add `errorDecorationIdsRef` and `monacoRef`. Update `handleEditorMount` to store both `editor` and `monaco`. Replace `editor.deltaDecorations([], decorations)` with `editor.deltaDecorations(errorDecorationIdsRef.current, newDecorations)` and assign the returned ids back to `errorDecorationIdsRef.current`. The effect must run even when `errorLines` is empty so old decorations clear. Deduplicate and validate line numbers before creating Monaco ranges. Do not change AI logic, assistant behavior, corrected code comparison, explanation behavior, or main layout.

### 8. Testing Checklist

- Run analysis once and verify highlights appear.
- Run analysis again and verify highlights do not get darker.
- Edit the code and run analysis again.
- Clear code or run analysis with no errors and verify old highlights disappear.
- Paste code with many repeated errors on the same line and verify only one decoration appears per line.
- Verify no console errors.

## Fix 3: Premium Error Styling

### 1. Root Cause

The current styling is too visually saturated for dense error sets. It uses a pink background and glyph marker that can feel harsh in large files.

### 2. Goal

Make Monaco highlights feel like a modern editor:

Dark mode:

- Subtle red underline.
- Soft glow.
- Low-opacity line tint.
- Thin left gutter marker.

Light mode:

- Elegant soft red border.
- Minimal tint.
- No harsh glow.

### 3. Files To Modify

- `src/components/CodeEditor/CodeEditor.css`

### 4. Exact Implementation Steps

1. Replace old error decoration CSS with the new `codelens-error-*` class names.
2. Use low-opacity red, not pink/purple.
3. Keep dark mode glow subtle.
4. Remove glow or reduce it significantly in light mode.
5. Keep all styles scoped under `.monaco-editor` to avoid affecting other UI.
6. Do not change Monaco token theme colors in `beforeMount`.
7. Do not change editor theme definitions except if a conflicting error background color is discovered.

### 5. CSS Cleanup Instructions

Add a small fade animation:

```css
@keyframes codelens-error-fade {
  from {
    background-color: rgba(248, 113, 113, 0.14);
  }
  to {
    background-color: rgba(248, 113, 113, 0.055);
  }
}

@media (prefers-reduced-motion: reduce) {
  .monaco-editor .codelens-error-line {
    animation: none;
  }
}
```

Keep animation subtle and short. Do not add looping effects.

### 6. Monaco API Usage Notes

- CSS classes from Monaco decorations are injected into Monaco-rendered layers.
- Keep selectors specific enough:

```css
.monaco-editor .codelens-error-line
```

- Avoid global `.error-*` class names that may collide with app error cards or toasts.

### 7. Antigravity-Ready Implementation Prompt

Update only the Monaco error decoration CSS in `src/components/CodeEditor/CodeEditor.css`. Replace aggressive pink full-line styling with subtle premium red styling scoped to `.monaco-editor`. Add `codelens-error-line`, `codelens-error-token`, `codelens-error-line-marker`, and `codelens-error-glyph`. Include dark and light mode variants. Add a short non-looping fade animation and respect `prefers-reduced-motion`. Do not alter Monaco syntax colors, app layout, AI behavior, corrected code comparison, assistant, or explanations.

### 8. Testing Checklist

- Verify dark mode line tint is subtle.
- Verify dark mode underline/glow is readable but not distracting.
- Verify light mode tint is minimal.
- Verify light mode marker is visible but not harsh.
- Verify app error cards and toast styles are unaffected.
- Verify syntax highlighting still works.

## Fix 4: Error Range Control

### 1. Root Cause

The current code creates ranges with `startColumn: 1` and `endColumn: 1` while also using `isWholeLine: true`, so Monaco treats the decoration as line-based rather than token-based. The app currently passes only line numbers from `App.jsx`, so token-level precision is not available yet.

### 2. Goal

Use bounded Monaco ranges safely:

- Always create valid `monaco.Range` objects.
- Never highlight outside the current model.
- Use exact line ranges now.
- Support exact token ranges later if column data becomes available.

### 3. Files To Modify

- `src/components/CodeEditor/CodeEditor.jsx`
- Optional only if already useful: `src/App.jsx`

### 4. Exact Implementation Steps

1. Keep `errorLines` as the current prop to avoid changing app behavior.
2. Use the model to bound each line:

```jsx
const endColumn = model.getLineMaxColumn(line);
const range = new monaco.Range(line, 1, line, endColumn);
```

3. Do not create ranges for invalid lines.
4. If later adding precise token data, add a new optional prop such as `errorMarkers`, but do not require it for this fix.
5. If `errorMarkers` is added, derive it from existing `analysis.errors` only and do not modify AI output:

```jsx
const errorMarkers = useMemo(() => {
  if (!analysis?.errors) return [];
  return analysis.errors
    .filter((error) => error.lineNumber != null)
    .map((error) => ({
      lineNumber: error.lineNumber,
      startColumn: error.startColumn,
      endColumn: error.endColumn,
    }));
}, [analysis]);
```

6. In `CodeEditor.jsx`, prefer exact columns only when both columns exist and are valid:

```jsx
const hasColumns = Number.isInteger(startColumn) && Number.isInteger(endColumn) && endColumn > startColumn;
```

7. If columns are missing, use the exact affected line with subtle line styling only.
8. Never create a range spanning multiple unrelated lines.

### 5. CSS Cleanup Instructions

Token styling should be separate from line styling:

- Line class: subtle background and left marker.
- Token class: underline only.
- Do not put large background fills on `.codelens-error-token`.

### 6. Monaco API Usage Notes

- Use:

```jsx
new monaco.Range(startLine, startColumn, endLine, endColumn)
```

- Line-only fallback:

```jsx
new monaco.Range(line, 1, line, model.getLineMaxColumn(line))
```

- Exact token when columns exist:

```jsx
new monaco.Range(line, startColumn, line, endColumn)
```

- Clamp columns between `1` and `model.getLineMaxColumn(line)`.

### 7. Antigravity-Ready Implementation Prompt

Improve Monaco error range handling without changing analysis behavior. In `CodeEditor.jsx`, use `new monaco.Range(...)` and `model.getLineMaxColumn(line)` to create valid bounded ranges. Filter invalid line numbers. Keep current `errorLines` support. If exact column fields already exist in current error data, optionally support them through a non-breaking `errorMarkers` prop, but do not change AI prompts or analysis logic. Use token underline styling only for valid exact token ranges. Do not create large multi-line highlight ranges.

### 8. Testing Checklist

- Test errors on first line.
- Test errors on last line.
- Test errors after deleting lines.
- Test pasted code where previous error lines no longer exist.
- Verify no Monaco range errors appear in the console.
- Verify highlights stay on intended lines only.

## Fix 5: Decoration Cleanup

### 1. Root Cause

Old decoration classes and options can keep aggressive visuals alive if any references remain. Monaco also has several decoration fields that can create visible effects in different editor layers.

### 2. Goal

Clean up decoration fields so only intentional visuals remain:

- Minimal line tint.
- Thin left marker.
- Small glyph marker.
- Optional token underline.
- No large overlay.
- No repeated old classes.

### 3. Files To Modify

- `src/components/CodeEditor/CodeEditor.jsx`
- `src/components/CodeEditor/CodeEditor.css`

### 4. Exact Implementation Steps

1. Search for old classes:

```bash
rg -n "error-line-highlight|error-glyph-margin|overviewRuler|inlineClassName|isWholeLine|deltaDecorations" src
```

2. Remove old JSX references:

```jsx
className: 'error-line-highlight'
glyphMarginClassName: 'error-glyph-margin'
```

3. Remove old CSS classes after no references remain.
4. Avoid `overviewRuler` for these custom decorations unless `overviewRulerLanes` is intentionally enabled later.
5. Keep `isWholeLine: true` only on exact single-line decorations.
6. Use `inlineClassName` only for exact token ranges.
7. Confirm there are no app-wide `.error-*` overrides affecting Monaco highlight classes.

### 5. CSS Cleanup Instructions

Remove or replace:

```css
.error-line-highlight
.error-glyph-margin
```

Do not modify these unrelated app styles:

- `.error-card`
- `.toast.toast-error`
- `.attachment-error`
- `.error-boundary-*`
- `.connection-error-box`

### 6. Monaco API Usage Notes

Review these options carefully:

- `className`: Applies to line content. Keep subtle.
- `inlineClassName`: Applies to text range. Use for underline.
- `isWholeLine`: Expands decoration to whole line. Use only for exact intended lines.
- `glyphMarginClassName`: Adds a glyph margin marker. Keep small.
- `linesDecorationsClassName`: Good for left gutter markers.
- `overviewRuler`: Avoid here because it can add extra visual noise and lanes are disabled.

### 7. Antigravity-Ready Implementation Prompt

Clean up Monaco decoration classes and options in the CodeLens editor. Search for `error-line-highlight`, `error-glyph-margin`, `overviewRuler`, `inlineClassName`, `isWholeLine`, and `deltaDecorations`. Replace old aggressive Monaco error decoration classes with the new subtle `codelens-error-*` classes. Remove unused old CSS only after references are gone. Do not touch unrelated app error styles such as error cards, toasts, settings errors, or error boundary styles. Keep the change limited to Monaco highlighting.

### 8. Testing Checklist

- Run the search command and confirm no old Monaco error classes remain.
- Verify app error cards still look the same.
- Verify toast errors still look the same.
- Verify Monaco editor error highlights use only new styles.
- Verify no visual overlap remains.

## Fix 6: Smooth Professional Effects

### 1. Root Cause

Repeatedly adding decorations can produce flicker, and strong backgrounds make changes feel abrupt.

### 2. Goal

Make highlights feel smooth:

- Short fade-in/fade-down effect.
- No looping animation.
- No flicker from stacked decorations.
- Respect reduced-motion preferences.

### 3. Files To Modify

- `src/components/CodeEditor/CodeEditor.css`
- `src/components/CodeEditor/CodeEditor.jsx`

### 4. Exact Implementation Steps

1. Fix stacking first with `deltaDecorations(previousIds, nextDecorations)`.
2. Add the short CSS animation from Fix 3.
3. Keep animation duration under 250ms.
4. Do not animate layout properties.
5. Animate only background color or opacity-like visual properties.
6. Add `prefers-reduced-motion` override.

### 5. CSS Cleanup Instructions

Use:

```css
animation: codelens-error-fade 180ms ease-out;
```

Avoid:

```css
animation-iteration-count: infinite;
transform: ...
filter: ...
```

### 6. Monaco API Usage Notes

Smoothness mainly comes from correct decoration replacement:

```jsx
errorDecorationIdsRef.current = editor.deltaDecorations(
  errorDecorationIdsRef.current,
  newDecorations
);
```

This prevents flicker caused by stale stacked decoration layers.

### 7. Antigravity-Ready Implementation Prompt

Add a subtle professional fade effect to Monaco error line highlights after fixing decoration replacement. Use a short non-looping CSS animation on `.monaco-editor .codelens-error-line`, and add a `prefers-reduced-motion` override. Do not animate layout or use heavy glow. Ensure `deltaDecorations` uses previous decoration ids so repeated analyses do not flicker or stack.

### 8. Testing Checklist

- Run analysis with one error.
- Run analysis with many errors.
- Re-run analysis several times.
- Verify highlights do not flicker heavily.
- Verify highlights do not grow darker.
- Enable reduced motion in the OS/browser and verify animation is disabled.

## Final Local Testing Checklist

- Run `npm run dev`.
- Open the app.
- Paste long Java code with multiple syntax errors.
- Paste long C code with multiple syntax errors.
- Paste long Python code with multiple syntax errors.
- Run analysis.
- Verify no giant pink/purple overlays appear.
- Verify only exact affected lines are subtly highlighted.
- Verify repeated analysis does not stack decorations.
- Verify old decorations clear when errors change.
- Verify old decorations clear when no errors remain.
- Verify dark mode looks professional.
- Verify light mode looks professional.
- Verify Monaco syntax colors still work.
- Verify code comparison still works.
- Verify corrected code modal still works.
- Verify assistant still works.
- Verify no console errors.
- Run `npm run lint` if available.

## Rollback Safety

Safe rollback is limited to:

- `src/components/CodeEditor/CodeEditor.jsx`
- `src/components/CodeEditor/CodeEditor.css`

Do not roll back or edit:

- `src/services/aiService.js`
- `src/services/providers/*`
- `api/ai.js`
- `src/components/CorrectedCodeModal/*`
- `src/components/CodeVisualizer/*`
- `src/components/ChatAssistant/*`
- `src/components/ExplanationPanel/*`

If issues occur:

1. Restore the previous decoration effect in `CodeEditor.jsx`.
2. Restore the previous Monaco error decoration CSS in `CodeEditor.css`.
3. Keep all AI, assistant, explanation, corrected-code, and main layout code unchanged.
