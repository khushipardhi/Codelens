# CodeLens Specification

## Purpose

This document is a strict Antigravity-ready implementation specification for refining the existing CodeLens UI/UX.

CodeLens is already functional. This specification must be implemented incrementally and safely.

This work is only for:

- UI cleanup
- visualization simplification
- About page refinement
- premium UX improvements
- theme contrast polish

This work must not:

- redesign the entire project
- rewrite architecture
- remove working functionality
- replace working systems unnecessarily
- break Monaco Editor integration
- break NVIDIA API integration
- break localhost compatibility
- alter current routing/state structure
- add unnecessary dependencies

---

## Existing Architecture Constraints

### Preserve

- React + Vite setup
- Monaco Editor integration
- NVIDIA API integration
- localhost development flow
- current routing/state structure in `src/App.jsx`
- existing component boundaries
- existing service/provider files
- existing app-level settings and theme flow

### Do Not Modify Unless Explicitly Required

- `package.json`
- `package-lock.json`
- `src/services/aiService.js`
- `src/services/providers/nvidia.js`
- `src/services/providers/offline.js`
- `src/services/providers/futureProviders.js`
- Monaco setup inside `src/components/CodeEditor/CodeEditor.jsx`

### Primary Files In Scope

- `src/components/CodeVisualizer/CodeVisualizer.jsx`
- `src/components/CodeVisualizer/CodeVisualizer.css`
- `src/components/ExplanationPanel/ExplanationPanel.jsx`
- `src/components/ExplanationPanel/ExplanationPanel.css`
- `src/components/AboutCodeLens/AboutCodeLens.jsx`
- `src/components/AboutCodeLens/AboutCodeLens.css`
- `src/App.jsx`
- `src/App.css`
- `src/index.css`

---

## Feature 1: Remove Code Visualization Video System

### GOAL

Replace the current video/tutorial-style Code Visualizer with a simple corrected-code comparison.

The user should instantly understand:

> What mistake did I make and what is the corrected version?

### CURRENT PROBLEM

The Code Visualizer currently behaves like a tutorial playback system and includes:

- step 1 to 14 flow
- play/pause controls
- execution playback
- variable tracker
- active instruction pointer
- STDOUT simulation
- execution timeline
- animation-based tutorial flow

This makes the UI cluttered, confusing, non-professional, and overcomplicated.

### REQUIRED REMOVALS

Remove from the visible UI and component behavior:

- execution player
- play/pause controls
- timeline
- step counter
- active instruction pointer
- variable tracker
- terminal simulation
- tutorial playback system
- execution animation engine
- floating keyword effects
- long step-by-step animation flows

### REQUIRED REPLACEMENT

Implement only:

- left side: original user code
- right side: corrected version of the same code
- Monaco-style corrected code card
- syntax highlighting
- line numbers
- copy button
- red highlighting for wrong lines
- green highlighting for corrected lines
- preserved code structure where possible
- simple visual explanation through code comparison

### FILES TO MODIFY

- `src/components/CodeVisualizer/CodeVisualizer.jsx`
- `src/components/CodeVisualizer/CodeVisualizer.css`
- `src/components/ExplanationPanel/ExplanationPanel.jsx`
- `src/components/ExplanationPanel/ExplanationPanel.css`

### FILES TO CREATE

- None

### COMPONENTS TO REFACTOR

- `CodeVisualizer`
  - Keep the component name and default export.
  - Refactor internals from playback visualization to code comparison.

- `ExplanationPanel`
  - Pass original code and corrected code into `CodeVisualizer`.
  - Keep existing props and analysis flow.

### IMPLEMENTATION STRATEGY

1. Preserve the `CodeVisualizer` file and export name to avoid import breakage.
2. Remove or bypass playback state and playback UI.
3. Keep compatibility with existing props:
   - `code`
   - `language`
   - `autoPlay`
4. Add optional prop:
   - `correctedCode`
5. In `ExplanationPanel.jsx`, pass:
   - `code={code}`
   - `correctedCode={analysis.improvedCode}`
   - `language={analysis.language}`
6. If `correctedCode` is missing, show a compact fallback message.
7. Implement a simple line-level comparison.
8. Highlight removed/problem lines in the original panel using red/rose styling.
9. Highlight added/corrected lines in the corrected panel using green styling.
10. Keep syntax highlighting lightweight and local.
11. Do not add syntax highlighting dependencies.
12. Add a copy button for corrected code.
13. Add line numbers in both code panels.
14. Use desktop two-column layout.
15. Use stacked mobile layout.

### CSS STRATEGY

This project uses plain CSS, not Tailwind. Do not introduce Tailwind.

Use existing CSS variables from `src/index.css`.

Required classes:

- `.code-compare`
- `.code-compare-panel`
- `.code-compare-panel--original`
- `.code-compare-panel--corrected`
- `.code-compare-header`
- `.code-compare-copy`
- `.code-compare-body`
- `.code-compare-line`
- `.code-compare-line-number`
- `.code-compare-line-content`
- `.code-compare-line--mistake`
- `.code-compare-line--corrected`
- `.code-token-keyword`
- `.code-token-string`
- `.code-token-number`
- `.code-token-comment`

Dark theme:

- original mistake lines: subtle rose background and rose border
- corrected lines: subtle green background and green border
- code card background: deep glass surface

Light theme:

- original mistake lines: readable soft red background
- corrected lines: readable soft green background
- code card background: white/glass surface with strong enough text contrast

### ANTIGRAVITY IMPLEMENTATION PROMPT

```md
You are simplifying the existing CodeLens Code Visualizer.

This is not a redesign of the app.
This is not a rewrite of the architecture.

Modify only:
- src/components/CodeVisualizer/CodeVisualizer.jsx
- src/components/CodeVisualizer/CodeVisualizer.css
- src/components/ExplanationPanel/ExplanationPanel.jsx
- src/components/ExplanationPanel/ExplanationPanel.css

Preserve:
- React + Vite setup
- Monaco Editor integration
- NVIDIA API integration
- localhost compatibility
- current App.jsx routing/state structure
- CodeVisualizer component name and export
- ExplanationPanel props

Remove all video/tutorial visualization UI:
- execution player
- play/pause controls
- timeline
- step counter
- active instruction pointer
- variable tracker
- terminal simulation
- tutorial playback system
- execution animation engine
- floating keywords
- step-by-step animation flow

Replace it with:
1. Left panel: Original Code
2. Right panel: Corrected Code
3. Line numbers in both panels
4. Copy button for corrected code
5. Lightweight syntax highlighting
6. Red highlighted mistake lines in the original panel
7. Green highlighted corrected lines in the corrected panel
8. Responsive layout: side-by-side desktop, stacked mobile

Implementation details:
- Keep CodeVisualizer export intact.
- Add optional correctedCode prop.
- Pass analysis.improvedCode from ExplanationPanel into CodeVisualizer as correctedCode.
- Do not add dependencies.
- Do not modify service/provider files.
- Do not modify Monaco editor implementation.
- If correctedCode is missing, render a small fallback message.

Acceptance criteria:
- No playback UI remains.
- No tutorial/video behavior remains.
- Original code and corrected code are visible at the same time.
- Mistake lines and corrected lines are highlighted clearly.
- Corrected code copy button works.
- Dark and light themes are readable.
```

### LOCALHOST TESTING CHECKLIST

- Run `npm run lint`.
- Run `npm run build`.
- Run `npm run dev`.
- Open localhost.
- Load sample code.
- Analyze code.
- Open code comparison/visualizer area.
- Confirm no play/pause controls exist.
- Confirm no timeline exists.
- Confirm no variable tracker exists.
- Confirm no terminal simulation exists.
- Confirm original code appears on the left.
- Confirm corrected code appears on the right.
- Confirm line numbers appear.
- Confirm wrong lines are highlighted red.
- Confirm corrected lines are highlighted green.
- Confirm copy button works.
- Test dark theme.
- Test light theme.
- Test mobile width.

### ROLLBACK SAFETY

- Revert only:
  - `src/components/CodeVisualizer/CodeVisualizer.jsx`
  - `src/components/CodeVisualizer/CodeVisualizer.css`
  - `src/components/ExplanationPanel/ExplanationPanel.jsx`
  - `src/components/ExplanationPanel/ExplanationPanel.css`
- Keep the `CodeVisualizer` file and export name intact.
- If diff logic fails, fall back to showing original and corrected code without highlights.
- Do not revert services, provider files, package files, or Monaco files.

---

## Feature 2: Clean Front Page Analysis Panel

### GOAL

Remove unnecessary decorative lines and visual separators from the front-page right analysis panel.

The panel must become:

- clean
- minimal
- premium
- elegant
- beginner-friendly
- focused

### CURRENT PROBLEM

The right panel still contains:

- excessive colorful lines
- decorative separators
- unnecessary dividers
- extra UI borders
- cluttered mentor containers
- excessive visual blocks
- repeated section outlines
- over-styled explanation sections

### REQUIRED FINAL PANEL CONTENT

Keep only:

1. Error title
2. What happened
3. Suggested fix
4. Why this happened
5. How to avoid this
6. Small confidence booster line
7. Corrected code preview

Nothing else should appear in the populated analysis result.

### FILES TO MODIFY

- `src/components/ExplanationPanel/ExplanationPanel.jsx`
- `src/components/ExplanationPanel/ExplanationPanel.css`

### FILES TO CREATE

- None

### COMPONENTS TO REFACTOR

- `ExplanationPanel`
  - Simplify populated mentor/analysis result rendering.
  - Preserve loading and empty states.
  - Preserve code comparison/corrected preview.

### IMPLEMENTATION STRATEGY

1. Keep `ExplanationPanel` props unchanged.
2. Preserve loading state.
3. Preserve empty state.
4. Preserve `onLineSelect` behavior for Monaco line focus.
5. Preserve analysis field usage.
6. Remove populated-result rendering for:
   - `DetectionCard`
   - confusion suggestions
   - learning tip card
   - concept links
   - reveal buttons
   - repeated summary sections
   - excessive nested educational cards
   - decorative dividers
   - colorful side bars
   - unnecessary outline wrappers
7. Render one clean analysis card per error.
8. Use short labels only.
9. Do not render empty blocks.
10. Use friendly fallback text for required missing fields.
11. Keep corrected code preview after explanation cards.

### CSS STRATEGY

This project uses plain CSS, not Tailwind. Do not introduce Tailwind.

Use existing design variables:

- `--glass-heavy`
- `--glass-medium`
- `--glass-light`
- `--text-primary`
- `--text-secondary`
- `--text-tertiary`
- `--border-subtle`
- `--border-default`
- `--accent-green`
- `--accent-rose`

Remove or neutralize:

- colored left borders on normal explanation cards
- heavy decorative separators
- multiple nested card backgrounds
- large glows inside the analysis content
- repeated outlines around each small block

Preferred styling:

- one main card per error
- compact inner rows
- soft border
- subtle glass background
- readable typography
- no visual noise

### ANTIGRAVITY IMPLEMENTATION PROMPT

```md
You are cleaning the existing CodeLens front-page right analysis panel.

This is not a redesign.
This is not a rewrite.

Modify only:
- src/components/ExplanationPanel/ExplanationPanel.jsx
- src/components/ExplanationPanel/ExplanationPanel.css

Preserve:
- React + Vite architecture
- Monaco Editor integration
- NVIDIA API integration
- localhost compatibility
- App.jsx routing/state structure
- ExplanationPanel props
- loading state
- empty state
- onLineSelect behavior
- corrected code preview

Final populated panel must show only:
1. Error title
2. What happened
3. Suggested fix
4. Why this happened
5. How to avoid this
6. Small confidence booster line
7. Corrected code preview

Remove:
- excessive colorful lines
- decorative separators
- unnecessary dividers
- extra UI borders
- cluttered mentor containers
- excessive visual blocks
- repeated section outlines
- DetectionCard in populated results
- confusion suggestions
- learning tip card
- concept links
- reveal buttons
- repeated summary cards
- empty wrappers

Implementation details:
- Render one clean card per error.
- Error title: error.errorName || "Syntax Error".
- Line number should appear only when error.lineNumber exists.
- What happened: error.explanation || error.message || analysis.explanation.
- Suggested fix: error.fix || error.suggestedFix.
- Why this happened: error.why.
- How to avoid this: error.avoid.
- Confidence booster: error.comfort || analysis.confidenceMessage || short friendly fallback.
- Do not render empty optional blocks.
- Keep corrected code preview when analysis.improvedCode exists.
- Use clean CSS with fewer borders, fewer backgrounds, and no decorative separators.

Do not modify:
- src/App.jsx
- service files
- provider files
- package files
- Monaco editor files
```

### LOCALHOST TESTING CHECKLIST

- Run `npm run lint`.
- Run `npm run build`.
- Run `npm run dev`.
- Open localhost.
- Load sample code.
- Analyze code.
- Confirm only the required sections appear.
- Confirm no decorative separators remain.
- Confirm no colorful side lines remain.
- Confirm no empty blocks appear.
- Confirm corrected code preview appears.
- Confirm clicking an error still focuses Monaco line.
- Test dark theme.
- Test light theme.

### ROLLBACK SAFETY

- Revert only:
  - `src/components/ExplanationPanel/ExplanationPanel.jsx`
  - `src/components/ExplanationPanel/ExplanationPanel.css`
- If data rendering fails, restore previous JSX and reapply only CSS cleanup.
- Do not revert service files, provider files, App state, package files, or Monaco files.

---

## Feature 3: Refine About Page Into Visual Premium Experience

### GOAL

Remove theory-heavy and documentation-style About page content. Replace it with a modern, premium, futuristic, interactive visual presentation.

The About page must feel:

- premium
- modern
- elegant
- futuristic
- interactive
- confidence-building

### CURRENT PROBLEM

The About page still contains:

- too much theory
- long paragraphs
- documentation-heavy sections
- unnecessary theory blocks
- boring explanation layouts

### REQUIRED REMOVALS

Remove or heavily reduce:

- long paragraphs
- documentation-heavy sections
- unnecessary theory blocks
- boring explanation layouts
- repetitive philosophy copy
- dense comparison text

### REQUIRED ADDITIONS

Add or emphasize:

- premium feature cards
- visual storytelling
- elegant spacing
- animated hover cards
- modern layouts
- futuristic sections
- developer-style UI visuals
- confidence-building design
- cleaner typography hierarchy

### FILES TO MODIFY

- `src/components/AboutCodeLens/AboutCodeLens.jsx`
- `src/components/AboutCodeLens/AboutCodeLens.css`

### FILES TO CREATE

- None

### COMPONENTS TO REFACTOR

- `AboutCodeLens`
  - Keep the component and prop API.
  - Replace text-heavy sections with visual sections.
  - Preserve the CTA back to workspace.

### REQUIRED PAGE STRUCTURE

1. Hero Section
   - concise headline
   - short supporting line
   - primary CTA
   - premium visual mockup/demo

2. Visual Storytelling Cards
   - Understand the error
   - See the corrected code
   - Learn why it happened
   - Build confidence

3. Developer-Style Feature Showcase
   - Monaco-powered editor
   - Corrected code comparison
   - Beginner-safe explanations
   - NVIDIA-enhanced analysis
   - Offline fallback
   - Localhost-friendly workflow

4. Confidence Timeline
   - Paste code
   - Spot the mistake
   - Compare the fix
   - Try again confidently

5. Interactive/Premium CTA
   - short confidence-focused message
   - button back to workspace

### IMPLEMENTATION STRATEGY

1. Preserve `AboutCodeLens` and `onStartCoding`.
2. Preserve About page routing/state in `src/App.jsx`.
3. Shorten existing hero copy.
4. Keep any useful demo concept, but remove long explanatory paragraphs.
5. Build visual sections with arrays mapped to cards where helpful.
6. Use existing `lucide-react` icons.
7. Do not add dependencies.
8. Add hover interactions in CSS only.
9. Add subtle motion with existing keyframes or small new keyframes.
10. Respect reduced-motion rules.
11. Keep all text concise.
12. Ensure responsive layout.

### CSS STRATEGY

This project uses plain CSS, not Tailwind. Do not introduce Tailwind.

Use:

- glassmorphism
- soft skeuomorphism
- layered cards
- premium shadows
- subtle depth
- smooth transparency
- modern gradients
- clean typography hierarchy

Required About classes:

- `.about-hero`
- `.hero-mockup-wrapper`
- `.visual-story-grid`
- `.visual-story-card`
- `.feature-showcase-grid`
- `.showcase-card`
- `.confidence-timeline`
- `.timeline-card`
- `.about-footer-cta`

Dark theme:

- deep glass surfaces
- soft blue/cyan/violet glow
- high contrast text

Light theme:

- white/glass layered surfaces
- readable dark headings
- no white text on light backgrounds
- no washed-out cards
- consistent accent colors

### ANTIGRAVITY IMPLEMENTATION PROMPT

```md
You are refining the existing CodeLens About page.

This is not a full redesign.
This is not a rewrite.

Modify only:
- src/components/AboutCodeLens/AboutCodeLens.jsx
- src/components/AboutCodeLens/AboutCodeLens.css

Preserve:
- AboutCodeLens component
- onStartCoding prop
- current App.jsx About page state behavior
- React + Vite setup
- current theme system
- existing lucide-react dependency
- localhost compatibility

Goal:
Make the About page premium, modern, futuristic, elegant, interactive, and less theoretical.

Remove or reduce:
- long paragraphs
- documentation-heavy sections
- unnecessary theory blocks
- boring explanation layouts
- repetitive philosophy copy
- dense comparison text

Add:
- premium feature cards
- visual storytelling
- elegant spacing
- animated hover cards
- modern layouts
- futuristic sections
- developer-style UI visuals
- confidence-building design
- cleaner typography hierarchy

Required structure:
1. Concise hero with CTA and visual mockup/demo.
2. Visual story cards:
   - Understand the error
   - See the corrected code
   - Learn why it happened
   - Build confidence
3. Developer-style feature showcase:
   - Monaco-powered editor
   - Corrected code comparison
   - Beginner-safe explanations
   - NVIDIA-enhanced analysis
   - Offline fallback
   - Localhost-friendly workflow
4. Confidence timeline:
   - Paste code
   - Spot the mistake
   - Compare the fix
   - Try again confidently
5. Compact final CTA.

Style requirements:
- glassmorphism
- soft skeuomorphism
- layered cards
- premium shadows
- subtle depth
- smooth transparency
- modern gradients
- clean typography hierarchy
- dark and light theme support

Fix light theme issues:
- no white text on light backgrounds
- no low contrast headings
- no washed-out cards
- no inconsistent color combinations

Do not add dependencies.
Do not modify App.jsx.
Do not modify service/provider files.
Do not modify Monaco editor files.
```

### LOCALHOST TESTING CHECKLIST

- Run `npm run lint`.
- Run `npm run build`.
- Run `npm run dev`.
- Open About page.
- Confirm long paragraphs are removed or shortened.
- Confirm visual story cards render.
- Confirm feature showcase cards render.
- Confirm confidence timeline renders.
- Confirm hover cards animate subtly.
- Confirm final CTA works.
- Confirm light theme headings are readable.
- Confirm light theme cards are not washed out.
- Confirm dark theme remains premium.
- Test desktop width.
- Test tablet width.
- Test mobile width.

### ROLLBACK SAFETY

- Revert only:
  - `src/components/AboutCodeLens/AboutCodeLens.jsx`
  - `src/components/AboutCodeLens/AboutCodeLens.css`
- If one section breaks layout, remove only that section.
- Do not revert App state, service files, package files, or Monaco files.

---

## Feature 4: Fix Interactive Cursor Glow

### GOAL

Make the interactive cursor glow work properly across the premium UI, especially on:

- About page
- hero sections
- important cards
- main interactive sections

The glow must be:

- smooth
- cursor-following
- visible in dark theme
- visible in light theme
- subtle
- premium
- performant
- non-laggy

### CURRENT PROBLEM

The cursor glow still does not work properly. It may disappear, feel weak in light mode, flicker on nested elements, or fail to appear on About page cards.

### FILES TO MODIFY

- `src/App.jsx`
- `src/index.css`
- `src/App.css`
- `src/components/AboutCodeLens/AboutCodeLens.css`
- `src/components/ExplanationPanel/ExplanationPanel.css`

### FILES TO CREATE

- None

### COMPONENTS TO REFACTOR

- No component rewrite required.
- Only refine the existing global mouse tracking and glow CSS.

### IMPLEMENTATION STRATEGY

1. Reuse the existing global mouse tracker in `src/App.jsx`.
2. Do not use React state for cursor coordinates.
3. Keep `requestAnimationFrame`.
4. Store coordinates in CSS variables:
   - `--mouse-x`
   - `--mouse-y`
5. Target glow-enabled elements:
   - `.glow-card`
   - `.glow-btn`
   - `.glow-section`
   - `.about-hero`
   - `.hero-mockup-wrapper`
   - `.visual-story-card`
   - `.showcase-card`
   - `.timeline-card`
   - `.feature-item-card`
   - `.panel-section`
   - `.error-card`
6. Avoid full-page cursor blobs.
7. Avoid canvas.
8. Avoid dependencies.
9. Make light-mode glow visibly stronger but still subtle.
10. Make dark-mode glow visible on dark glass cards.
11. Ensure child elements layer above glow pseudo-elements.
12. Respect reduced-motion rules.

### CSS STRATEGY

This project uses plain CSS, not Tailwind. Do not introduce Tailwind.

Use shared glow variables in `src/index.css`:

- `--glow-spotlight`
- `--glow-border-spotlight`
- `--glow-btn-spotlight`

Use pseudo-elements:

- `::before` for soft inner spotlight
- `::after` for border glow

Layering:

- glow host: `position: relative`
- glow host: `overflow: hidden`
- children: `position: relative; z-index: 2`
- glow pseudo-elements: `pointer-events: none`

Dark theme:

- blue/cyan/violet radial glow
- medium opacity on hover

Light theme:

- blue/violet radial glow with higher alpha than current implementation
- no muddy overlays
- no white text over light backgrounds

### ANTIGRAVITY IMPLEMENTATION PROMPT

```md
You are fixing the existing CodeLens cursor glow system.

This is not a redesign.
This is not a new animation framework.

Modify only:
- src/App.jsx
- src/index.css
- src/App.css
- src/components/AboutCodeLens/AboutCodeLens.css
- src/components/ExplanationPanel/ExplanationPanel.css

Preserve:
- React + Vite setup
- Monaco Editor integration
- NVIDIA API integration
- localhost compatibility
- current routing/state structure
- existing components

Goal:
Make cursor-follow glow smooth, visible in both dark and light themes, subtle, premium, performant, and non-laggy.

Implementation requirements:
1. Reuse the global mouse tracker in App.jsx.
2. Do not use React state for cursor coordinates.
3. Keep requestAnimationFrame.
4. Update --mouse-x and --mouse-y on glow-enabled surfaces.
5. Target:
   - .glow-card
   - .glow-btn
   - .glow-section
   - .about-hero
   - .hero-mockup-wrapper
   - .visual-story-card
   - .showcase-card
   - .timeline-card
   - .feature-item-card
   - .panel-section
   - .error-card
6. In index.css, tune:
   - --glow-spotlight
   - --glow-border-spotlight
   - --glow-btn-spotlight
7. Improve light theme glow so it is visible but not harsh.
8. Improve dark theme glow so it is visible on dark glass.
9. Ensure no flicker on nested elements.
10. Ensure text remains readable.
11. Ensure Monaco typing and scrolling remain responsive.

Do not add dependencies.
Do not add canvas.
Do not modify service/provider files.
Do not modify Monaco editor implementation.
```

### LOCALHOST TESTING CHECKLIST

- Run `npm run lint`.
- Run `npm run build`.
- Run `npm run dev`.
- Open About page.
- Move cursor over hero section.
- Move cursor over story cards.
- Move cursor over feature cards.
- Move cursor over timeline cards.
- Move cursor over CTA buttons.
- Confirm glow appears in dark theme.
- Confirm glow appears in light theme.
- Confirm glow does not flicker.
- Confirm glow does not hide text.
- Confirm workspace typing is responsive.
- Confirm Monaco scrolling is responsive.

### ROLLBACK SAFETY

- Revert only:
  - `src/App.jsx`
  - `src/index.css`
  - `src/App.css`
  - `src/components/AboutCodeLens/AboutCodeLens.css`
  - `src/components/ExplanationPanel/ExplanationPanel.css`
- If performance drops, reduce targets to:
  - `.glow-card`
  - `.glow-btn`
  - `.about-hero`
  - `.hero-mockup-wrapper`
- Do not revert services, providers, package files, or Monaco files.

---

## Feature 5: Add Premium Glassmorphism, Soft Skeuomorphism, And Theme Contrast Fixes

### GOAL

Make the About page and refined UI feel visually premium while supporting both dark and light themes.

### REQUIRED VISUAL IMPROVEMENTS

Implement:

- glassmorphism
- soft skeuomorphism
- elegant layered cards
- premium shadows
- subtle depth
- smooth transparency
- modern gradients

Support:

- dark theme
- light theme

Fix light theme issues:

- white text on light backgrounds
- low contrast headings
- washed-out cards
- inconsistent colors
- weak borders
- unreadable muted text

### FILES TO MODIFY

- `src/index.css`
- `src/App.css`
- `src/components/AboutCodeLens/AboutCodeLens.css`
- `src/components/ExplanationPanel/ExplanationPanel.css`

### FILES TO CREATE

- None

### COMPONENTS TO REFACTOR

- No component logic refactor required.
- CSS and design token refinement only.

### IMPLEMENTATION STRATEGY

1. Start with shared theme tokens in `src/index.css`.
2. Keep existing variable names.
3. Improve light theme values without changing component APIs.
4. Ensure headings use readable dark colors in light mode.
5. Ensure cards use visible but subtle borders in light mode.
6. Ensure glass cards do not become washed out.
7. Use layered shadows sparingly.
8. Keep dark mode premium and readable.
9. Avoid a one-color palette.
10. Avoid overusing glow.
11. Do not change layout architecture.

### CSS STRATEGY

This project uses plain CSS, not Tailwind. Do not introduce Tailwind.

Token focus in `src/index.css`:

- `--text-primary`
- `--text-secondary`
- `--text-tertiary`
- `--glass-heavy`
- `--glass-medium`
- `--glass-light`
- `--border-subtle`
- `--border-default`
- `--border-glass`
- `--shadow-sm`
- `--shadow-md`
- `--shadow-lg`
- `--gradient-surface`
- `--gradient-glass`

Light theme requirements:

- headings: dark slate or equivalent high contrast
- body text: readable slate
- muted text: not too faint
- card backgrounds: translucent white with visible edges
- borders: visible but soft
- shadows: soft, not muddy

Dark theme requirements:

- text remains readable
- glass surfaces have depth
- gradients stay subtle
- highlights do not overpower content

### ANTIGRAVITY IMPLEMENTATION PROMPT

```md
You are improving CodeLens visual polish and theme contrast.

This is not a redesign.
This is not a rewrite.

Modify only:
- src/index.css
- src/App.css
- src/components/AboutCodeLens/AboutCodeLens.css
- src/components/ExplanationPanel/ExplanationPanel.css

Preserve:
- React + Vite setup
- Monaco Editor integration
- NVIDIA API integration
- localhost compatibility
- existing routing/state structure
- all JSX unless a direct styling hook is already part of another feature

Goal:
Add premium glassmorphism, soft skeuomorphism, layered depth, and fix dark/light theme contrast.

Implement:
- glassmorphism
- soft skeuomorphism
- elegant layered cards
- premium shadows
- subtle depth
- smooth transparency
- modern gradients

Fix light theme:
- no white text on light backgrounds
- no low contrast headings
- no washed-out cards
- no inconsistent colors
- no unreadable muted labels

Implementation details:
1. Keep existing CSS variable names.
2. Improve shared tokens in index.css first.
3. Refine About page cards and hero surfaces.
4. Refine ExplanationPanel cards after cleanup.
5. Keep shadows subtle and performant.
6. Do not add dependencies.
7. Do not modify service/provider files.
8. Do not modify Monaco editor implementation.
```

### LOCALHOST TESTING CHECKLIST

- Run `npm run lint`.
- Run `npm run build`.
- Run `npm run dev`.
- Open About page in dark theme.
- Open About page in light theme.
- Confirm cards feel layered and premium.
- Confirm light theme headings are readable.
- Confirm no white text appears on light backgrounds.
- Confirm cards are not washed out.
- Confirm analysis panel remains clean.
- Confirm workspace remains readable.
- Confirm no layout shift or overflow.

### ROLLBACK SAFETY

- Revert only:
  - `src/index.css`
  - `src/App.css`
  - `src/components/AboutCodeLens/AboutCodeLens.css`
  - `src/components/ExplanationPanel/ExplanationPanel.css`
- If token changes cause broad regressions, restore `src/index.css` first.
- Do not revert service files, provider files, package files, or Monaco files.

---

## Final Verification Pass

### GOAL

Confirm all refinements remain scalable, architecture-safe, Antigravity-compatible, performant, beginner-friendly, and visually premium.

### FILES TO MODIFY

- None unless a regression is found.

### FILES TO CREATE

- None

### ANTIGRAVITY IMPLEMENTATION PROMPT

```md
Perform final verification for the CodeLens UI/UX refinement.

Do not redesign.
Do not rewrite.
Do not add dependencies.
Do not perform unrelated refactors.

Run:
- npm run lint
- npm run build
- npm run dev

Manual checks:
1. Open localhost.
2. Confirm Monaco Editor renders.
3. Type in Monaco.
4. Load sample code.
5. Analyze code.
6. Confirm right analysis panel only shows:
   - Error title
   - What happened
   - Suggested fix
   - Why this happened
   - How to avoid this
   - Small confidence booster line
   - Corrected code preview
7. Confirm no excessive decorative lines remain.
8. Confirm no video/tutorial visualizer remains.
9. Confirm original-vs-corrected code comparison works.
10. Confirm corrected code copy button works.
11. Confirm About page is visual, concise, and premium.
12. Confirm cursor glow works on About page, hero sections, and important cards.
13. Confirm dark theme is readable.
14. Confirm light theme is readable.
15. Confirm no white text appears on light cards.
16. Confirm mobile layout does not overflow.
17. Confirm no console errors during normal use.

Only fix regressions caused by the scoped work.
```

### LOCALHOST TESTING CHECKLIST

- `npm run lint` passes.
- `npm run build` passes.
- `npm run dev` starts successfully.
- Localhost opens.
- Monaco editor works.
- NVIDIA/API integration remains untouched.
- Analysis flow works.
- Corrected code preview works.
- No video-style visualization remains.
- Front-page right panel is clean.
- About page is less theoretical.
- About page feels premium.
- Cursor glow works in both themes.
- Glassmorphism works in both themes.
- Light theme has proper contrast.
- Mobile layout is stable.

### GLOBAL ROLLBACK SAFETY

- Roll back feature-by-feature, not the entire app.
- Do not revert unrelated user changes.
- Never use destructive git commands.
- Never revert service/provider files unless they were intentionally edited.
- Preserve package files unless explicitly changed.

Rollback map:

- Visualization rollback:
  - `src/components/CodeVisualizer/CodeVisualizer.jsx`
  - `src/components/CodeVisualizer/CodeVisualizer.css`
  - `src/components/ExplanationPanel/ExplanationPanel.jsx`
  - `src/components/ExplanationPanel/ExplanationPanel.css`

- Analysis panel rollback:
  - `src/components/ExplanationPanel/ExplanationPanel.jsx`
  - `src/components/ExplanationPanel/ExplanationPanel.css`

- About page rollback:
  - `src/components/AboutCodeLens/AboutCodeLens.jsx`
  - `src/components/AboutCodeLens/AboutCodeLens.css`

- Cursor glow rollback:
  - `src/App.jsx`
  - `src/index.css`
  - `src/App.css`
  - `src/components/AboutCodeLens/AboutCodeLens.css`
  - `src/components/ExplanationPanel/ExplanationPanel.css`

- Theme polish rollback:
  - `src/index.css`
  - `src/App.css`
  - `src/components/AboutCodeLens/AboutCodeLens.css`
  - `src/components/ExplanationPanel/ExplanationPanel.css`
