# CodeLens Corrected Code Comparison Modal Usability Upgrade

Antigravity-ready implementation specification for improving only the corrected code comparison modal in the React + Vite + Monaco Editor CodeLens app.

## Scope Guardrails

- Do not rewrite the whole app.
- Do not change AI API logic.
- Do not change corrected-code generation logic.
- Do not change assistant behavior.
- Do not change explanation behavior or make explanations longer.
- Do not change the main app layout.
- Only improve the corrected code comparison modal layout, scrolling, maximize/restore behavior, and modal usability.

## Feature 1: Scroll Support For Long Code

### 1. Goal

Make long original and corrected code readable inside the modal without page overflow.

The modal must support:

- Independent vertical scrolling in the Original Code panel.
- Independent vertical scrolling in the Corrected Code panel.
- Horizontal scrolling for long code lines.
- Fixed modal header.
- Copy Fix button remaining visible.
- Close button remaining visible.
- No code overflow outside the modal.
- No page background scrolling while the modal is open.
- Professional, visible, theme-aware scrollbars.

### 2. Files To Modify

- `src/components/CorrectedCodeModal/CorrectedCodeModal.jsx`
- `src/components/CorrectedCodeModal/CorrectedCodeModal.css`
- `src/components/CodeVisualizer/CodeVisualizer.css`

### 3. Files To Create If Needed

- None.

### 4. Exact Implementation Steps

1. In `CorrectedCodeModal.jsx`, import `useEffect` from React.
2. Add a `useEffect` inside `CorrectedCodeModal` that locks background page scrolling while the modal is mounted:

```jsx
useEffect(() => {
  const previousOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';

  return () => {
    document.body.style.overflow = previousOverflow;
  };
}, []);
```

3. Keep the existing overlay click-to-close behavior.
4. Keep the existing modal `onClick={e => e.stopPropagation()}` behavior.
5. In `CorrectedCodeModal.css`, ensure `.corrected-code-modal` is a flex column with bounded height and hidden outer overflow:

```css
.corrected-code-modal {
  width: min(100%, 1200px);
  max-height: min(82vh, 760px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
```

6. Keep `.corrected-code-header` outside the scrollable body. The header must remain fixed because only `.corrected-code-body` and the inner code panels should flex/scroll.
7. In `CorrectedCodeModal.css`, ensure `.corrected-code-body` can shrink inside the flex modal:

```css
.corrected-code-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
```

8. In `CodeVisualizer.css`, ensure every flex parent between the modal body and code scroll containers has `min-height: 0`.
9. Update these selectors:

```css
.code-compare,
.code-compare-body,
.code-compare-panel {
  min-height: 0;
}
```

10. Ensure `.code-compare-scroll` owns both vertical and horizontal scrolling:

```css
.code-compare-scroll {
  flex: 1;
  min-height: 0;
  overflow: auto;
  overscroll-behavior: contain;
}
```

11. Ensure code lines do not wrap and can create horizontal scroll:

```css
.code-compare-line {
  width: max-content;
  min-width: 100%;
}

.code-compare-line-content {
  white-space: pre;
}
```

12. Add visible theme-aware scrollbars to `.code-compare-scroll`:

```css
.code-compare-scroll {
  scrollbar-width: thin;
  scrollbar-color: color-mix(in srgb, var(--text-tertiary) 55%, transparent) transparent;
}

.code-compare-scroll::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

.code-compare-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.code-compare-scroll::-webkit-scrollbar-thumb {
  background: color-mix(in srgb, var(--text-tertiary) 42%, transparent);
  border: 2px solid transparent;
  border-radius: 999px;
  background-clip: padding-box;
}

.code-compare-scroll::-webkit-scrollbar-thumb:hover {
  background: color-mix(in srgb, var(--text-secondary) 58%, transparent);
  background-clip: padding-box;
}
```

13. Do not move the Copy Fix button into the scroll area. It must stay inside `.code-compare-header`.

### 5. Antigravity-Ready Prompt

Improve only the corrected code comparison modal scrolling behavior. Modify `CorrectedCodeModal.jsx`, `CorrectedCodeModal.css`, and `CodeVisualizer.css`. Do not change AI logic, corrected-code generation, assistant behavior, explanations, or main layout. Add body scroll locking while the modal is open. Make the modal a bounded flex column with a fixed header and hidden outer overflow. Make `.corrected-code-body`, `.code-compare`, `.code-compare-body`, and `.code-compare-panel` use `min-height: 0` so the inner code panels can scroll correctly. Make `.code-compare-scroll` independently scroll vertically and horizontally with `overflow: auto`, `overscroll-behavior: contain`, and professional theme-aware thin scrollbars. Keep the Copy Fix button visible in the corrected panel header and keep the close button visible in the modal header.

### 6. Testing Checklist

- Run `npm run dev`.
- Open the corrected code modal.
- Test with 100+ lines of code.
- Test with 200+ lines of code.
- Verify Original Code scrolls vertically inside its own panel.
- Verify Corrected Code scrolls vertically inside its own panel.
- Verify long lines scroll horizontally.
- Verify modal header stays visible.
- Verify Copy Fix button stays visible.
- Verify Close button stays visible.
- Verify no code overflows outside the modal.
- Verify the page behind the modal does not scroll.
- Verify scrollbars are visible in dark mode.
- Verify scrollbars are visible in light mode.

### 7. Rollback Safety

Rollback is limited to modal presentation code only.

To revert Feature 1:

- Remove the body overflow `useEffect` from `CorrectedCodeModal.jsx`.
- Revert the `.corrected-code-body`, `.code-compare`, `.code-compare-body`, `.code-compare-panel`, and `.code-compare-scroll` CSS changes.
- Remove scrollbar-specific CSS.
- Do not touch AI service files or explanation components.

## Feature 2: Maximize / Fullscreen Button

### 1. Goal

Add a maximize/restore control beside the close button so users can expand the comparison modal for long code files.

The button must:

- Sit in the top-right header beside the close X button.
- Show a maximize icon in normal mode.
- Show a minimize/restore icon in expanded mode.
- Toggle the modal between normal and near-fullscreen sizes.
- Use the tooltip `Maximize` in normal mode.
- Use the tooltip `Restore` in expanded mode.
- Work in dark and light mode.

### 2. Files To Modify

- `src/components/CorrectedCodeModal/CorrectedCodeModal.jsx`
- `src/components/CorrectedCodeModal/CorrectedCodeModal.css`

### 3. Files To Create If Needed

- None.

### 4. Exact Implementation Steps

1. In `CorrectedCodeModal.jsx`, update imports:

```jsx
import { useEffect, useState } from 'react';
import { Maximize2, Minimize2, X } from 'lucide-react';
```

2. Add maximize state inside the component:

```jsx
const [isMaximized, setIsMaximized] = useState(false);
```

3. Add a toggle handler:

```jsx
const toggleMaximize = () => {
  setIsMaximized(current => !current);
};
```

4. Add a conditional class to the modal:

```jsx
<div
  className={`corrected-code-modal glass-card-heavy glow-card animate-fade-in-up ${isMaximized ? 'corrected-code-modal--maximized' : ''}`}
  onClick={e => e.stopPropagation()}
>
```

5. Replace the single close button container with an actions container:

```jsx
<div className="corrected-code-actions">
  <button
    type="button"
    className="corrected-code-icon-button"
    onClick={toggleMaximize}
    aria-label={isMaximized ? 'Restore Corrected Code Modal' : 'Maximize Corrected Code Modal'}
    title={isMaximized ? 'Restore' : 'Maximize'}
  >
    {isMaximized ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
  </button>
  <button
    type="button"
    className="corrected-code-icon-button"
    onClick={onClose}
    aria-label="Close Corrected Code Modal"
    title="Close"
  >
    <X size={20} />
  </button>
</div>
```

6. Keep the overlay click-to-close behavior.
7. In `CorrectedCodeModal.css`, add modal resize animation:

```css
.corrected-code-modal {
  transition:
    width 0.22s ease,
    max-width 0.22s ease,
    height 0.22s ease,
    max-height 0.22s ease,
    transform 0.22s ease,
    background-color 0.22s ease;
}
```

8. Add maximized modal sizing:

```css
.corrected-code-modal--maximized {
  width: min(95vw, 1600px);
  max-width: 95vw;
  height: 88vh;
  max-height: 90vh;
}
```

9. Add header actions styling:

```css
.corrected-code-actions {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.corrected-code-icon-button {
  width: 2.25rem;
  height: 2.25rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  border-radius: 999px;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.corrected-code-icon-button:hover {
  background: var(--bg-hover);
  border-color: var(--border-subtle);
  color: var(--text-primary);
}

.corrected-code-icon-button:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}
```

10. Remove or replace old `.corrected-code-close` styles if that class is no longer used.

### 5. Antigravity-Ready Prompt

Add a maximize/restore button to the corrected code comparison modal only. In `CorrectedCodeModal.jsx`, import `useState`, `Maximize2`, and `Minimize2`. Add `isMaximized` state and a `toggleMaximize` handler. Add a maximize/restore icon button beside the existing close button in the modal header. Use `title="Maximize"` in normal mode and `title="Restore"` in maximized mode. Add a `corrected-code-modal--maximized` class when maximized. In `CorrectedCodeModal.css`, style the header actions, shared icon buttons, smooth modal resize transition, and maximized sizing using about 95vw width and 88vh height. Do not modify AI logic, corrected-code generation, assistant behavior, explanations, or the main layout.

### 6. Testing Checklist

- Run `npm run dev`.
- Open the corrected code modal.
- Verify maximize button appears beside the close button.
- Hover maximize button and verify tooltip says `Maximize`.
- Click maximize and verify modal expands to near full screen.
- Verify code panels become taller and easier to read.
- Hover restore button and verify tooltip says `Restore`.
- Click restore and verify normal modal size returns.
- Verify close button still works in normal mode.
- Verify close button still works in maximized mode.
- Verify Copy Fix button remains visible in normal mode.
- Verify Copy Fix button remains visible in maximized mode.
- Verify dark mode visual contrast.
- Verify light mode visual contrast.

### 7. Rollback Safety

To revert Feature 2:

- Remove `isMaximized` state and `toggleMaximize`.
- Remove `Maximize2` and `Minimize2` imports.
- Restore the modal class name to its previous static value.
- Remove the maximize/restore button.
- Keep the close button.
- Remove `.corrected-code-actions`, `.corrected-code-icon-button`, and `.corrected-code-modal--maximized` CSS if unused.
- Do not touch AI service files or corrected-code generation flow.

## Feature 3: Responsive Layout

### 1. Goal

Preserve a readable comparison layout across screen sizes.

Desktop:

- Original Code and Corrected Code should appear side by side.

Small screens:

- Original Code should stack above Corrected Code.
- Each panel should retain clean independent scrolling.

### 2. Files To Modify

- `src/components/CorrectedCodeModal/CorrectedCodeModal.css`
- `src/components/CodeVisualizer/CodeVisualizer.css`

### 3. Files To Create If Needed

- None.

### 4. Exact Implementation Steps

1. Keep the existing desktop `.code-compare-body` row layout:

```css
.code-compare-body {
  display: flex;
  flex-direction: row;
}
```

2. Keep or refine the existing small-screen breakpoint:

```css
@media (max-width: 900px) {
  .code-compare-body {
    flex-direction: column;
  }
}
```

3. Add mobile modal sizing so the modal uses more viewport height on small screens:

```css
@media (max-width: 768px) {
  .corrected-code-overlay {
    padding: 0.75rem;
  }

  .corrected-code-modal {
    max-height: 90vh;
  }

  .corrected-code-modal--maximized {
    width: 96vw;
    max-width: 96vw;
    height: 90vh;
    max-height: 90vh;
  }

  .corrected-code-header {
    padding: 0.85rem 1rem;
  }

  .corrected-code-body {
    padding: 0.75rem;
  }
}
```

4. Ensure `.code-compare-panel` has a practical minimum height on stacked mobile layout:

```css
@media (max-width: 900px) {
  .code-compare-panel {
    min-height: 220px;
  }
}
```

5. Ensure no card, panel, or line content causes horizontal overflow outside the modal. Horizontal overflow should occur only inside `.code-compare-scroll`.

### 5. Antigravity-Ready Prompt

Keep the corrected code comparison layout responsive. Preserve side-by-side Original Code and Corrected Code panels on desktop. Stack the panels vertically below 900px. Ensure the modal uses practical viewport height on small screens, especially in maximized mode. Keep independent vertical and horizontal scrolling inside each `.code-compare-scroll` container. Do not change the app shell, AI logic, corrected-code generation, assistant behavior, or explanations.

### 6. Testing Checklist

- Run `npm run dev`.
- Test desktop width around 1440px.
- Verify panels are side by side.
- Test tablet width around 768px.
- Verify panels stack cleanly.
- Test mobile width around 390px.
- Verify panels stack cleanly.
- Verify each stacked panel scrolls internally.
- Verify long lines scroll horizontally inside the panel.
- Verify close and maximize/restore buttons remain reachable.
- Verify Copy Fix remains reachable.

### 7. Rollback Safety

To revert Feature 3:

- Restore the previous `.code-compare-body` media query.
- Remove the mobile modal sizing additions.
- Remove mobile-specific `.code-compare-panel` minimum height changes.
- Do not touch app-level layout files.

## Feature 4: User Experience Polish

### 1. Goal

Make the modal feel polished and easier to control without adding clutter.

Add:

- Smooth modal resize animation.
- Keyboard shortcut support:
  - `Esc` closes the modal.
  - `Ctrl + Enter` toggles maximize on Windows/Linux.
  - `Cmd + Enter` toggles maximize on macOS.
- Clear tooltips:
  - `Maximize`
  - `Restore`
- Subtle modal depth/glass effect.
- No visual clutter.

### 2. Files To Modify

- `src/components/CorrectedCodeModal/CorrectedCodeModal.jsx`
- `src/components/CorrectedCodeModal/CorrectedCodeModal.css`

### 3. Files To Create If Needed

- None.

### 4. Exact Implementation Steps

1. In `CorrectedCodeModal.jsx`, add keyboard handling with `useEffect`:

```jsx
useEffect(() => {
  const handleKeyDown = event => {
    if (event.key === 'Escape') {
      onClose();
      return;
    }

    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      toggleMaximize();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [onClose]);
```

2. If ESLint warns about `toggleMaximize` dependency, wrap `toggleMaximize` in `useCallback`:

```jsx
const toggleMaximize = useCallback(() => {
  setIsMaximized(current => !current);
}, []);
```

Then update imports:

```jsx
import { useCallback, useEffect, useState } from 'react';
```

And update the keyboard effect dependency array:

```jsx
}, [onClose, toggleMaximize]);
```

3. Keep tooltip text on the maximize/restore button via `title`.
4. Keep accessible labels via `aria-label`.
5. Add subtle modal depth in `CorrectedCodeModal.css` without changing the whole app theme:

```css
.corrected-code-overlay {
  background: color-mix(in srgb, #000 42%, transparent);
  backdrop-filter: blur(8px);
}

.corrected-code-modal {
  border: 1px solid var(--border-subtle);
  box-shadow:
    0 24px 70px rgba(0, 0, 0, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}
```

6. Keep button styling quiet and consistent with the existing theme variables.
7. Do not add visible instructional text for the keyboard shortcuts.
8. Do not add extra panels, banners, helper text, or visualizations.

### 5. Antigravity-Ready Prompt

Polish only the corrected code comparison modal. Add keyboard support so `Esc` closes the modal and `Ctrl/Cmd + Enter` toggles maximize while the modal is open. Use `useEffect` for the keydown listener and clean it up on unmount. If needed for linting, use `useCallback` for `toggleMaximize`. Keep maximize/restore tooltips as `Maximize` and `Restore`. Add subtle glass/depth styling to the overlay and modal using existing CSS variables. Do not add visible keyboard shortcut instructions, extra text, video-style visualization, AI logic changes, corrected-code generation changes, assistant changes, explanation changes, or main layout changes.

### 6. Testing Checklist

- Run `npm run dev`.
- Open corrected code modal.
- Press `Esc` and verify the modal closes.
- Reopen the modal.
- Press `Ctrl + Enter` and verify maximize toggles.
- Press `Ctrl + Enter` again and verify restore toggles.
- On macOS, press `Cmd + Enter` and verify maximize/restore toggles.
- Verify the keyboard shortcut does not trigger when modal is closed.
- Verify resize animation is smooth.
- Verify modal depth looks professional in dark mode.
- Verify modal depth looks professional in light mode.
- Verify there is no extra instructional UI text.
- Verify browser console has no errors.

### 7. Rollback Safety

To revert Feature 4:

- Remove the keyboard shortcut `useEffect`.
- Remove `useCallback` if it was only added for `toggleMaximize`.
- Revert the overlay and modal depth CSS changes.
- Keep the original modal behavior intact.
- Do not touch AI, assistant, explanation, or main layout code.

## Final Local Testing Checklist

- Run `npm run dev`.
- Open the app in the browser.
- Generate or load a case where corrected code is available.
- Open the corrected code modal.
- Use code with 100+ lines.
- Use code with 200+ lines.
- Verify Original Code scrolls inside its own panel.
- Verify Corrected Code scrolls inside its own panel.
- Verify horizontal scrolling works for long lines.
- Verify page background does not scroll while modal is open.
- Verify maximize button works.
- Verify restore button works.
- Verify close button works.
- Verify overlay click closes the modal.
- Verify `Esc` closes the modal.
- Verify `Ctrl/Cmd + Enter` toggles maximize.
- Verify Copy Fix button remains visible.
- Verify Copy Fix copies corrected code.
- Verify modal works in dark mode.
- Verify modal works in light mode.
- Verify modal works on smaller screens.
- Verify no console errors.
- Verify `npm run lint` passes if linting is configured for the project.

## Global Rollback Safety

All changes are limited to the corrected code comparison modal and its comparison panel styling.

Safe rollback files:

- `src/components/CorrectedCodeModal/CorrectedCodeModal.jsx`
- `src/components/CorrectedCodeModal/CorrectedCodeModal.css`
- `src/components/CodeVisualizer/CodeVisualizer.css`

Do not modify or roll back these files for this task:

- `src/services/aiService.js`
- `api/ai.js`
- `src/services/providers/*`
- `src/components/ExplanationPanel/*`, unless an existing import path is broken
- `src/components/ChatAssistant/*`
- `src/App.jsx`, unless the modal mount point is already broken before this task

If a regression occurs, revert only the modal/component CSS changes listed above and keep all AI behavior untouched.
