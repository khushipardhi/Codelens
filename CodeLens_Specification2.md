# CodeLens Specification 2

## Project Overview

This document defines the professional UI/UX refinement upgrade for the existing CodeLens project.

This is not a redesign. This is a controlled refinement and enhancement update.

The existing architecture, Monaco Editor integration, AI analysis engine, offline mode, theme system, and responsiveness must remain stable.

The goal is to improve:

- usability
- visual clarity
- beginner confidence
- UI elegance
- interaction quality
- emotional experience

without:

- increasing confusion
- creating heavy animations
- damaging performance
- introducing clutter

## Architecture Rules

Preserve:

- React + Vite setup
- Monaco Editor integration
- NVIDIA API integration
- offline analysis mode
- localhost compatibility
- current routing/state structure
- current theme system
- existing component boundaries where possible

Do not:

- rewrite the app architecture
- replace working systems unnecessarily
- add large animation libraries
- add syntax highlighting dependencies
- modify NVIDIA provider logic for UI-only work
- modify Monaco editor behavior unless explicitly required by a UI regression

Primary files in scope:

- `src/components/ExplanationPanel/ExplanationPanel.jsx`
- `src/components/ExplanationPanel/ExplanationPanel.css`
- `src/components/CodeVisualizer/CodeVisualizer.jsx`
- `src/components/CodeVisualizer/CodeVisualizer.css`
- `src/components/AboutCodeLens/AboutCodeLens.jsx`
- `src/components/AboutCodeLens/AboutCodeLens.css`
- `src/App.jsx`
- `src/App.css`
- `src/index.css`

---

## Core Design Philosophy

CodeLens should feel:

- intelligent
- elegant
- emotionally supportive
- premium
- beginner-friendly
- modern
- visually calm

The UI must never feel:

- childish
- flashy
- overloaded
- over-animated
- intimidating

The platform should visually communicate:

> Learning code should feel encouraging, not intimidating.

---

## Feature 1: AI Mentor Panel Cleanup

### Current Problem

The AI Mentor panel currently contains:

- unnecessary divider lines
- excessive separators
- visual clutter
- too many lower strokes
- crowded layout sections

This reduces clarity and professionalism.

### Goal

Make the AI Mentor panel feel:

- minimal
- clean
- readable
- premium
- breathable

### Files To Modify

- `src/components/ExplanationPanel/ExplanationPanel.jsx`
- `src/components/ExplanationPanel/ExplanationPanel.css`

### Files To Create

- None

### Implementation Strategy

1. Preserve `ExplanationPanel` props and export.
2. Preserve loading and empty states.
3. Preserve Monaco line selection through `onLineSelect`.
4. Preserve analysis field usage.
5. Remove extra horizontal lines, unnecessary empty separators, stacked decorative strokes, and cluttered section boundaries.
6. Replace visual dividers with spacing, padding, softer grouping, and clearer hierarchy.
7. In the populated analysis state, show only:
   - syntax error or error title
   - what happened
   - suggested fix
   - why this happened
   - prevention tip
   - confidence booster
8. Do not render empty blocks.
9. Use clean fallbacks only when required content is missing.
10. Keep styles calm and readable in both themes.

### Antigravity Implementation Prompt

```md
Refine the existing CodeLens AI Mentor panel.

This is not a redesign and not a rewrite.

Modify only:
- src/components/ExplanationPanel/ExplanationPanel.jsx
- src/components/ExplanationPanel/ExplanationPanel.css

Preserve:
- ExplanationPanel props
- loading state
- empty state
- Monaco line selection behavior through onLineSelect
- current App.jsx state flow
- NVIDIA/API integration
- localhost behavior

Remove:
- extra horizontal lines
- unnecessary empty separators
- stacked decorative strokes
- cluttered section boundaries
- excessive visual containers
- repeated outlines
- over-styled explanation blocks

Replace with:
- spacing
- padding
- softer section grouping
- cleaner hierarchy

After analysis, show only:
- syntax error or error title
- what happened
- suggested fix
- why this happened
- prevention tip
- confidence booster

Do not render corrected code automatically. That behavior is handled by the corrected code feature.

Do not modify service files, provider files, package files, or Monaco editor files.
```

### Localhost Testing Checklist

- Run `npm run lint`.
- Run `npm run build`.
- Run `npm run dev`.
- Open localhost.
- Load sample code.
- Analyze code.
- Confirm the AI Mentor panel has no extra decorative lines.
- Confirm content is breathable and readable.
- Confirm no empty blocks render.
- Confirm line click behavior still focuses Monaco.
- Test dark theme.
- Test light theme.

### Rollback Safety

- Revert only:
  - `src/components/ExplanationPanel/ExplanationPanel.jsx`
  - `src/components/ExplanationPanel/ExplanationPanel.css`
- Do not revert app state, service files, provider files, package files, or Monaco files.

---

## Feature 2: Corrected Code Controlled Reveal

### Current Problem

The corrected code appears automatically.

This creates:

- unnecessary visual overload
- cognitive pressure
- distraction for beginners

### Required Behavior

After analysis, only show:

- syntax error
- what happened
- suggested fix
- why this happened
- prevention tip
- confidence booster

Do not automatically display:

- corrected code
- original vs corrected comparison

### New Interaction

Add one controlled action button:

- `View Corrected Code`
- `Compare Fix`
- `Show Improved Version`

Only when clicked should the comparison section render.

### UX Goal

Keep the interface:

- focused
- educational
- professional
- less overwhelming

### Files To Modify

- `src/components/ExplanationPanel/ExplanationPanel.jsx`
- `src/components/ExplanationPanel/ExplanationPanel.css`
- `src/components/CodeVisualizer/CodeVisualizer.jsx`
- `src/components/CodeVisualizer/CodeVisualizer.css`

### Files To Create

- None

### Implementation Strategy

1. Add local UI state in `ExplanationPanel.jsx`, such as `showCorrectedCode`.
2. Reset `showCorrectedCode` to `false` when new analysis arrives.
3. If `analysis.improvedCode` exists, show a single controlled action button.
4. Do not render the corrected code comparison until the button is clicked.
5. The button label should be concise and beginner-friendly.
6. Keep the comparison below the explanation content.
7. Do not auto-scroll to the comparison unless explicitly required later.
8. Ensure keyboard accessibility for the reveal button.

### Antigravity Implementation Prompt

```md
Implement controlled reveal behavior for corrected code in CodeLens.

Modify only:
- src/components/ExplanationPanel/ExplanationPanel.jsx
- src/components/ExplanationPanel/ExplanationPanel.css
- src/components/CodeVisualizer/CodeVisualizer.jsx
- src/components/CodeVisualizer/CodeVisualizer.css

Preserve:
- existing analysis flow
- ExplanationPanel props
- Monaco integration
- NVIDIA/API integration
- localhost behavior

Required behavior:
- After analysis, do not automatically show corrected code.
- Show only the educational explanation sections first.
- If analysis.improvedCode exists, show a single button labeled "View Corrected Code", "Compare Fix", or "Show Improved Version".
- Render the corrected comparison only after the button is clicked.
- Reset the reveal state when a new analysis arrives.

Do not add dependencies.
Do not modify service/provider files.
Do not modify App.jsx unless absolutely necessary.
```

### Localhost Testing Checklist

- Run `npm run lint`.
- Run `npm run build`.
- Run `npm run dev`.
- Analyze sample code.
- Confirm corrected code does not appear automatically.
- Confirm the reveal button appears when improved code exists.
- Click the reveal button.
- Confirm comparison renders only after click.
- Analyze again.
- Confirm corrected code is hidden again for the new result.
- Test keyboard focus on the reveal button.

### Rollback Safety

- Revert only:
  - `src/components/ExplanationPanel/ExplanationPanel.jsx`
  - `src/components/ExplanationPanel/ExplanationPanel.css`
  - `src/components/CodeVisualizer/CodeVisualizer.jsx`
  - `src/components/CodeVisualizer/CodeVisualizer.css`

---

## Feature 3: Remove Broken Token Text

### Current Problem

Corrected code contains raw internal strings such as:

- `code-token-keyword`
- parser metadata
- internal syntax labels
- debug syntax output

This confuses users and makes CodeLens appear broken.

### Required Fix

Completely remove:

- parser labels
- raw token names
- metadata strings
- debug syntax output

### Correct Code Rendering Rules

Corrected code must:

- look like real Monaco code
- use clean syntax highlighting
- preserve formatting
- preserve indentation
- preserve spacing
- use readable code blocks

### Visual Quality Standard

Corrected code should visually match the quality of:

- VS Code
- Monaco Editor
- professional IDE rendering

### Files To Modify

- `src/components/CodeVisualizer/CodeVisualizer.jsx`
- `src/components/CodeVisualizer/CodeVisualizer.css`
- `src/components/ExplanationPanel/ExplanationPanel.jsx`
- `src/components/ExplanationPanel/ExplanationPanel.css`

### Files To Create

- None

### Implementation Strategy

1. Audit code rendering helpers for raw class names or token labels leaking into rendered text.
2. Ensure syntax highlighting outputs HTML only when safely inserted as markup.
3. Ensure displayed code text never includes internal CSS class names.
4. Escape user code before adding syntax spans.
5. Use span class names only as markup, never as visible text.
6. Keep code output as plain code plus visual spans.
7. Do not add a syntax highlighting dependency.

### Antigravity Implementation Prompt

```md
Fix broken token text in corrected code rendering.

Modify only:
- src/components/CodeVisualizer/CodeVisualizer.jsx
- src/components/CodeVisualizer/CodeVisualizer.css
- src/components/ExplanationPanel/ExplanationPanel.jsx
- src/components/ExplanationPanel/ExplanationPanel.css

Goal:
Corrected code must look like professional Monaco/VS Code code, never like parser/debug output.

Remove from visible output:
- code-token-keyword
- parser metadata
- internal syntax labels
- raw CSS class names
- debug syntax output

Implementation requirements:
- Preserve formatting, indentation, and spacing.
- Escape raw code before injecting syntax markup.
- Use syntax span classes only as HTML markup, never visible text.
- Do not add dependencies.
- Do not modify service/provider files.
- Do not modify Monaco editor implementation.

Acceptance criteria:
- Corrected code displays as clean code only.
- No token class names are visible.
- No parser metadata is visible.
- Syntax highlighting still works.
```

### Localhost Testing Checklist

- Run `npm run lint`.
- Run `npm run build`.
- Run `npm run dev`.
- Analyze Python sample code.
- Reveal corrected code.
- Confirm no `code-token-*` text appears.
- Confirm no parser metadata appears.
- Confirm indentation is preserved.
- Confirm syntax colors are applied.
- Test JavaScript-like code if available.

### Rollback Safety

- Revert only code-rendering changes in:
  - `src/components/CodeVisualizer/CodeVisualizer.jsx`
  - `src/components/ExplanationPanel/ExplanationPanel.jsx`
  - related CSS files if needed

---

## Feature 4: Replace Current Code Visualizer

### Current Problem

The current visualizer behaves like:

- execution playback
- timeline simulation
- step-by-step animation video

Examples:

- Step 1 of 14
- execution timeline
- variable playback

This is not desired.

### Remove Completely

Remove:

- playback UI
- execution simulator
- timeline controls
- video-style progression
- animated execution steps

### Replace With

A professional static comparison UI.

Allowed options:

- Option A: side-by-side comparison
- Option B: inline diff highlighting

Preferred initial implementation:

- Side-by-side comparison because it is clearer for beginners and aligns with the requested left/right model.

### Required Features

Display:

- original code
- corrected code
- highlighted mistakes

Optional:

- highlighted changed lines
- highlighted missing syntax

### Important Rule

Do not overcomplicate this section.

The purpose is:

- clarity
- quick understanding
- beginner confidence

not simulation.

### Files To Modify

- `src/components/CodeVisualizer/CodeVisualizer.jsx`
- `src/components/CodeVisualizer/CodeVisualizer.css`
- `src/components/ExplanationPanel/ExplanationPanel.jsx`

### Files To Create

- None

### Implementation Strategy

1. Keep the `CodeVisualizer` component name and export.
2. Remove playback-related UI and state from the rendered component.
3. Add a static comparison layout.
4. Keep existing prop compatibility.
5. Add optional `correctedCode` prop.
6. Render line numbers.
7. Render original and corrected code in separate panels.
8. Use a simple line-level diff.
9. Highlight mistake lines in original code.
10. Highlight corrected lines in corrected code.
11. Add copy button for corrected code.
12. Keep the UI static, professional, and easy to scan.

### Antigravity Implementation Prompt

```md
Replace the current CodeLens Code Visualizer with a static comparison UI.

Modify only:
- src/components/CodeVisualizer/CodeVisualizer.jsx
- src/components/CodeVisualizer/CodeVisualizer.css
- src/components/ExplanationPanel/ExplanationPanel.jsx

Preserve:
- CodeVisualizer component name and export
- React + Vite setup
- Monaco integration
- NVIDIA/API integration
- current app state flow

Remove completely:
- playback UI
- execution simulator
- timeline controls
- video-style progression
- animated execution steps
- variable playback
- active instruction pointer
- terminal/STDOUT simulation

Replace with:
- original code panel
- corrected code panel
- line numbers
- mistake highlighting
- corrected line highlighting
- copy corrected code button

Do not overcomplicate.
Do not add dependencies.
Do not modify service/provider files.
```

### Localhost Testing Checklist

- Run `npm run lint`.
- Run `npm run build`.
- Run `npm run dev`.
- Confirm no Step 1 of 14 UI remains.
- Confirm no timeline remains.
- Confirm no variable tracker remains.
- Confirm no terminal simulation remains.
- Confirm original/corrected code comparison works.
- Confirm copy button works.
- Test dark and light themes.

### Rollback Safety

- Revert only:
  - `src/components/CodeVisualizer/CodeVisualizer.jsx`
  - `src/components/CodeVisualizer/CodeVisualizer.css`
  - `src/components/ExplanationPanel/ExplanationPanel.jsx`

---

## Feature 5: About Page Refinement

### Current Problem

The About page still contains:

- too much theory
- long paragraphs
- essay-like structure
- low visual engagement

### New Direction

Transform About page into:

- visual storytelling
- modern presentation
- interactive information experience

### Required Reduction

Reduce:

- excessive paragraphs
- repetitive explanation
- long theory sections

### Required Additions

Add:

- visual cards
- interactive sections
- modern layouts
- concise messaging
- emotional design
- elegant spacing

### Tone Requirements

The About page should sound:

- supportive
- modern
- slightly professional
- emotionally intelligent
- easy to understand

Avoid:

- highly technical wording
- overly basic childish wording
- academic-style paragraphs
- robotic descriptions

### Files To Modify

- `src/components/AboutCodeLens/AboutCodeLens.jsx`
- `src/components/AboutCodeLens/AboutCodeLens.css`

### Files To Create

- None

### Implementation Strategy

1. Preserve `AboutCodeLens` and `onStartCoding`.
2. Preserve About page state behavior in `src/App.jsx`.
3. Shorten hero copy.
4. Replace theory-heavy sections with visual cards.
5. Add concise storytelling sections:
   - understand the error
   - see the correction
   - learn the reason
   - try again confidently
6. Add a compact feature showcase:
   - Monaco-powered editor
   - corrected code comparison
   - beginner-safe explanations
   - NVIDIA-enhanced analysis
   - offline fallback
   - theme-aware interface
7. Add confidence-focused CTA.
8. Use existing icons from `lucide-react`.
9. Do not add dependencies.

### Antigravity Implementation Prompt

```md
Refine the existing CodeLens About page.

This is not a redesign and not a rewrite.

Modify only:
- src/components/AboutCodeLens/AboutCodeLens.jsx
- src/components/AboutCodeLens/AboutCodeLens.css

Preserve:
- AboutCodeLens component
- onStartCoding prop
- App.jsx About page state behavior
- theme system
- existing lucide-react dependency

Goal:
Make the About page visual, modern, interactive, elegant, and emotionally supportive.

Reduce:
- excessive paragraphs
- repetitive explanation
- long theory sections
- academic-style copy
- documentation-heavy layouts

Add:
- visual cards
- interactive sections
- modern layouts
- concise messaging
- emotional design
- elegant spacing

Tone:
- supportive
- modern
- slightly professional
- emotionally intelligent
- easy to understand

Do not add dependencies.
Do not modify App.jsx.
Do not modify service/provider files.
```

### Localhost Testing Checklist

- Run `npm run lint`.
- Run `npm run build`.
- Run `npm run dev`.
- Open About page.
- Confirm long paragraphs are reduced.
- Confirm visual cards exist.
- Confirm hover interactions work.
- Confirm CTA returns to workspace.
- Test mobile layout.
- Test dark theme.
- Test light theme.

### Rollback Safety

- Revert only:
  - `src/components/AboutCodeLens/AboutCodeLens.jsx`
  - `src/components/AboutCodeLens/AboutCodeLens.css`

---

## Feature 6: Interactive Cursor Glow

### Critical Requirement

Interactive cursor glow must work in both:

- dark theme
- light theme

Current behavior is inconsistent, missing, or partially broken.

### Glow Behavior

The glow should:

- softly follow cursor movement
- create elegant lighting interaction
- feel premium
- feel subtle
- feel responsive

### Apply To

Apply glow effect to:

- About hero section
- feature cards
- CTA sections
- glass containers
- premium panels

### Dark Theme Glow

Use:

- neon blue
- soft purple
- subtle bloom
- low opacity

### Light Theme Glow

Use:

- soft lavender
- soft blue
- low opacity diffusion
- subtle white glow blending

### Performance Rules

Glow implementation must:

- use `requestAnimationFrame`
- use GPU-friendly CSS
- avoid re-render spam
- avoid layout thrashing
- remain smooth on lower-end devices

### Files To Modify

- `src/App.jsx`
- `src/index.css`
- `src/App.css`
- `src/components/AboutCodeLens/AboutCodeLens.css`
- `src/components/ExplanationPanel/ExplanationPanel.css`

### Files To Create

- None

### Implementation Strategy

1. Reuse the existing global mouse tracker in `src/App.jsx`.
2. Do not store cursor position in React state.
3. Use `requestAnimationFrame`.
4. Update CSS variables:
   - `--mouse-x`
   - `--mouse-y`
5. Apply glow only to selected premium surfaces:
   - `.glow-card`
   - `.glow-btn`
   - `.glow-section`
   - `.about-hero`
   - `.hero-mockup-wrapper`
   - `.feature-item-card`
   - `.visual-story-card`
   - `.showcase-card`
   - `.timeline-card`
   - `.panel-section`
6. Use pseudo-elements for glow.
7. Keep children layered above glow.
8. Tune light/dark theme variables separately.

### Antigravity Implementation Prompt

```md
Fix the existing CodeLens interactive cursor glow.

Modify only:
- src/App.jsx
- src/index.css
- src/App.css
- src/components/AboutCodeLens/AboutCodeLens.css
- src/components/ExplanationPanel/ExplanationPanel.css

Preserve:
- React + Vite setup
- Monaco integration
- NVIDIA/API integration
- current routing/state structure

Requirements:
- Glow must work in dark theme.
- Glow must work in light theme.
- Glow must softly follow cursor movement.
- Glow must feel subtle, premium, and responsive.
- Glow must use requestAnimationFrame.
- Glow must avoid React re-render spam.
- Glow must avoid layout thrashing.

Apply to:
- About hero section
- feature cards
- CTA sections
- glass containers
- premium panels

Do not add dependencies.
Do not add canvas effects.
Do not modify service/provider files.
```

### Localhost Testing Checklist

- Run `npm run lint`.
- Run `npm run build`.
- Run `npm run dev`.
- Open About page.
- Test glow on hero section.
- Test glow on feature cards.
- Test glow on CTA.
- Test glow in dark theme.
- Test glow in light theme.
- Confirm no flicker.
- Confirm no lag while moving cursor.
- Confirm Monaco typing remains responsive.

### Rollback Safety

- Revert only:
  - `src/App.jsx`
  - `src/index.css`
  - `src/App.css`
  - `src/components/AboutCodeLens/AboutCodeLens.css`
  - `src/components/ExplanationPanel/ExplanationPanel.css`

---

## Feature 7: Glassmorphism

### Required Style

Use modern glassmorphism styling.

### Required Elements

Add:

- backdrop blur
- translucent panels
- soft borders
- layered transparency
- floating card depth

### Important

Glass effect should remain:

- readable
- accessible
- elegant
- subtle

Do not overuse blur.

### Files To Modify

- `src/index.css`
- `src/App.css`
- `src/components/AboutCodeLens/AboutCodeLens.css`
- `src/components/ExplanationPanel/ExplanationPanel.css`

### Files To Create

- None

### Implementation Strategy

1. Use existing CSS variables where possible.
2. Improve shared glass tokens in `src/index.css`.
3. Apply glass surfaces to About cards and premium panels.
4. Use backdrop blur carefully.
5. Ensure text remains readable over translucent surfaces.
6. Do not apply blur to too many nested layers.

### Antigravity Implementation Prompt

```md
Add refined glassmorphism to the existing CodeLens UI.

Modify only:
- src/index.css
- src/App.css
- src/components/AboutCodeLens/AboutCodeLens.css
- src/components/ExplanationPanel/ExplanationPanel.css

Requirements:
- backdrop blur
- translucent panels
- soft borders
- layered transparency
- floating card depth
- readable text
- accessible contrast

Do not overuse blur.
Do not add dependencies.
Do not modify service/provider files.
Do not modify Monaco editor code.
```

### Localhost Testing Checklist

- Run `npm run lint`.
- Run `npm run build`.
- Open About page.
- Confirm glass cards are readable.
- Confirm analysis panel is readable.
- Confirm blur is subtle.
- Test dark theme.
- Test light theme.

### Rollback Safety

- Revert only related CSS changes.

---

## Feature 8: Soft Skeuomorphism

### Goal

Add subtle tactile depth while keeping the interface modern.

### Add

- soft inset shadows
- tactile surfaces
- elegant depth
- layered realism

### Apply To

- buttons
- feature cards
- toggles
- important controls

### Avoid

Do not:

- create old-style UI
- create heavy realism
- over-shadow elements

Keep it modern.

### Files To Modify

- `src/index.css`
- `src/App.css`
- `src/components/AboutCodeLens/AboutCodeLens.css`
- `src/components/ExplanationPanel/ExplanationPanel.css`
- `src/components/ToneSelector/ToneSelector.css`
- `src/components/SettingsModal/SettingsModal.css`

### Files To Create

- None

### Implementation Strategy

1. Add or tune existing shadow variables.
2. Use inset shadows sparingly.
3. Apply tactile hover states to important controls.
4. Avoid excessive scale effects.
5. Keep transitions calm.

### Antigravity Implementation Prompt

```md
Add soft modern skeuomorphic depth to CodeLens controls and premium cards.

Modify only CSS files:
- src/index.css
- src/App.css
- src/components/AboutCodeLens/AboutCodeLens.css
- src/components/ExplanationPanel/ExplanationPanel.css
- src/components/ToneSelector/ToneSelector.css
- src/components/SettingsModal/SettingsModal.css

Add:
- soft inset shadows
- tactile surfaces
- elegant depth
- layered realism

Apply to:
- buttons
- feature cards
- toggles
- important controls

Avoid:
- old-style UI
- heavy realism
- over-shadowed elements
- aggressive scaling

Do not modify JSX unless a missing class hook is absolutely necessary.
```

### Localhost Testing Checklist

- Run `npm run lint`.
- Run `npm run build`.
- Test buttons.
- Test feature cards.
- Test toggles/settings.
- Confirm shadows are subtle.
- Confirm light mode remains readable.
- Confirm dark mode remains refined.

### Rollback Safety

- Revert only CSS changes in the listed files.

---

## Feature 9: Theme Consistency

### Current Problem

Some light mode sections still contain:

- white text on light backgrounds
- weak contrast
- inconsistent hierarchy

### Required Fix

Ensure both themes:

- have correct contrast
- remain readable
- maintain elegant hierarchy

### Theme Rules

Light mode:

- softer surfaces
- stronger text contrast
- elegant shadows

Dark mode:

- richer depth
- softer neon accents
- controlled glow

### Files To Modify

- `src/index.css`
- `src/App.css`
- `src/components/AboutCodeLens/AboutCodeLens.css`
- `src/components/ExplanationPanel/ExplanationPanel.css`
- `src/components/Navbar/Navbar.css`
- `src/components/SettingsModal/SettingsModal.css`
- `src/components/ChatAssistant/ChatAssistant.css`
- `src/components/ConceptHelp/ConceptHelp.css`

### Files To Create

- None

### Implementation Strategy

1. Start with design tokens in `src/index.css`.
2. Keep variable names stable.
3. Fix light theme text colors first.
4. Fix light theme card backgrounds.
5. Fix washed-out borders.
6. Review key panels in both themes.
7. Avoid broad layout changes.

### Antigravity Implementation Prompt

```md
Fix CodeLens theme consistency and contrast.

Modify only CSS files:
- src/index.css
- src/App.css
- src/components/AboutCodeLens/AboutCodeLens.css
- src/components/ExplanationPanel/ExplanationPanel.css
- src/components/Navbar/Navbar.css
- src/components/SettingsModal/SettingsModal.css
- src/components/ChatAssistant/ChatAssistant.css
- src/components/ConceptHelp/ConceptHelp.css

Fix:
- white text on light backgrounds
- weak contrast
- inconsistent hierarchy
- washed-out cards
- low contrast headings

Light mode:
- softer surfaces
- stronger text contrast
- elegant shadows

Dark mode:
- richer depth
- softer neon accents
- controlled glow

Do not modify app logic.
Do not modify services.
Do not add dependencies.
```

### Localhost Testing Checklist

- Run `npm run lint`.
- Run `npm run build`.
- Test workspace light mode.
- Test workspace dark mode.
- Test About page light mode.
- Test About page dark mode.
- Test Settings modal.
- Test ChatAssistant.
- Confirm no white text on light cards.
- Confirm muted text is still readable.

### Rollback Safety

- Revert CSS file-by-file.
- Restore `src/index.css` first if token changes cause broad regressions.

---

## Feature 10: Motion And Animation

### Animation Style

Animations should feel:

- calm
- intelligent
- premium
- smooth

### Avoid

Do not use:

- excessive bouncing
- aggressive scaling
- flashy transitions
- gaming-style effects

### Recommended Motion

Use:

- soft fade
- gentle hover lift
- subtle glow transitions
- smooth opacity changes

### Files To Modify

- `src/index.css`
- `src/App.css`
- `src/components/AboutCodeLens/AboutCodeLens.css`
- `src/components/ExplanationPanel/ExplanationPanel.css`

### Files To Create

- None

### Implementation Strategy

1. Use CSS transitions only.
2. Keep transitions short and calm.
3. Use transform and opacity.
4. Avoid layout-changing animations.
5. Respect `prefers-reduced-motion`.

### Antigravity Implementation Prompt

```md
Refine CodeLens motion behavior.

Modify only CSS files:
- src/index.css
- src/App.css
- src/components/AboutCodeLens/AboutCodeLens.css
- src/components/ExplanationPanel/ExplanationPanel.css

Use:
- soft fade
- gentle hover lift
- subtle glow transitions
- smooth opacity changes

Avoid:
- excessive bouncing
- aggressive scaling
- flashy transitions
- gaming-style effects

Respect prefers-reduced-motion.
Do not add dependencies.
```

### Localhost Testing Checklist

- Run `npm run lint`.
- Run `npm run build`.
- Hover cards and buttons.
- Confirm motion is calm.
- Confirm no layout shifts.
- Test reduced motion if available.

### Rollback Safety

- Revert only motion-related CSS changes.

---

## Feature 11: Performance Optimization

### Critical Rules

Do not:

- create unnecessary re-renders
- add large animation libraries
- use expensive blur layers everywhere
- create layout instability

### Required Techniques

Use:

- GPU acceleration
- CSS transforms
- memoization where useful
- `requestAnimationFrame`
- lazy rendering where needed

### Files To Modify

- `src/App.jsx`
- `src/components/ExplanationPanel/ExplanationPanel.jsx`
- `src/components/CodeVisualizer/CodeVisualizer.jsx`
- CSS files touched by visual effects

### Files To Create

- None

### Implementation Strategy

1. Use React state only for real UI state, not cursor tracking.
2. Use CSS variables for glow position.
3. Use conditional rendering for corrected code comparison.
4. Avoid rendering comparison before user requests it.
5. Keep visual effects CSS-based.
6. Avoid expensive blur on deeply nested elements.

### Antigravity Implementation Prompt

```md
Ensure CodeLens UI refinements remain performant.

Focus on:
- avoiding unnecessary re-renders
- using requestAnimationFrame for cursor glow
- rendering corrected comparison only after user action
- using transform/opacity for animation
- avoiding expensive blur layers everywhere

Do not add dependencies.
Do not change service/provider behavior.
Do not modify Monaco integration.
```

### Localhost Testing Checklist

- Run `npm run lint`.
- Run `npm run build`.
- Type in Monaco while UI effects are active.
- Move cursor over About page cards.
- Confirm no lag.
- Confirm comparison renders only after click.

### Rollback Safety

- Revert performance-related UI changes feature-by-feature.

---

## Feature 12: Accessibility

### Required Accessibility Standards

Maintain:

- keyboard accessibility
- readable font sizing
- proper contrast ratio
- responsive scaling
- semantic hierarchy

### Files To Modify

- `src/components/ExplanationPanel/ExplanationPanel.jsx`
- `src/components/CodeVisualizer/CodeVisualizer.jsx`
- `src/components/AboutCodeLens/AboutCodeLens.jsx`
- related CSS files

### Files To Create

- None

### Implementation Strategy

1. Use real buttons for actions.
2. Keep focus-visible states.
3. Ensure reveal/copy buttons are keyboard accessible.
4. Use semantic headings where appropriate.
5. Ensure code panels have readable labels.
6. Maintain sufficient color contrast in both themes.

### Antigravity Implementation Prompt

```md
Preserve and improve accessibility during CodeLens UI refinement.

Ensure:
- real buttons are used for actions
- keyboard focus is visible
- reveal corrected code button is keyboard accessible
- copy corrected code button is keyboard accessible
- headings follow semantic hierarchy
- code panels are labeled clearly
- contrast is readable in both themes

Do not add dependencies.
Do not modify service/provider files.
```

### Localhost Testing Checklist

- Tab through main actions.
- Tab to corrected code reveal button.
- Tab to copy button.
- Confirm focus outlines are visible.
- Confirm headings are readable.
- Test light and dark themes.

### Rollback Safety

- Revert only accessibility-related JSX/CSS changes if they introduce regressions.

---

## Final Expected Result

After implementation, CodeLens should feel:

- modern
- emotionally supportive
- visually premium
- beginner-friendly
- professional
- elegant
- calm
- confidence-building

The final experience should improve learning confidence without overwhelming beginners.

---

## Final Verification Checklist

Run:

- `npm run lint`
- `npm run build`
- `npm run dev`

Manual verification:

- Localhost loads.
- Monaco Editor renders.
- Monaco typing remains responsive.
- Sample code analysis works.
- NVIDIA/API integration remains untouched.
- Offline mode remains available.
- AI Mentor panel is cleaner.
- Corrected code does not appear automatically.
- Corrected code appears only after clicking the reveal button.
- No broken token text appears in code output.
- Code Visualizer no longer behaves like a video/tutorial.
- Static comparison UI works.
- About page is more visual and less theoretical.
- Cursor glow works in dark theme.
- Cursor glow works in light theme.
- Glassmorphism is readable.
- Skeuomorphic depth is subtle.
- Light mode contrast is fixed.
- Motion feels calm.
- Keyboard accessibility remains intact.
- Mobile layout does not overflow.

## Global Rollback Map

AI Mentor panel:

- `src/components/ExplanationPanel/ExplanationPanel.jsx`
- `src/components/ExplanationPanel/ExplanationPanel.css`

Corrected code and visualizer:

- `src/components/ExplanationPanel/ExplanationPanel.jsx`
- `src/components/ExplanationPanel/ExplanationPanel.css`
- `src/components/CodeVisualizer/CodeVisualizer.jsx`
- `src/components/CodeVisualizer/CodeVisualizer.css`

About page:

- `src/components/AboutCodeLens/AboutCodeLens.jsx`
- `src/components/AboutCodeLens/AboutCodeLens.css`

Cursor glow:

- `src/App.jsx`
- `src/index.css`
- `src/App.css`
- `src/components/AboutCodeLens/AboutCodeLens.css`
- `src/components/ExplanationPanel/ExplanationPanel.css`

Theme and visual polish:

- `src/index.css`
- `src/App.css`
- component CSS files touched during refinement

Never revert:

- service/provider files unless intentionally changed
- package files unless intentionally changed
- Monaco integration files unless intentionally changed
