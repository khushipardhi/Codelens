# CodeLens Assistant 2

## Goal

Optimize CodeLens Assistant responses to become shorter, clearer, more professional, and beginner-friendly.

Do not:

- rewrite the assistant
- change existing UI layout
- change AI provider architecture
- change main analysis behavior
- break existing chat behavior

Only improve response behavior and formatting.

---

## Main Problem

Currently the assistant gives:

- long answers
- too much theory
- unnecessary paragraphs
- repetitive explanations
- boring responses

This overwhelms beginners.

CodeLens should feel:

- calm
- modern
- quick
- easy to understand
- confidence-building

---

## Files To Modify

- `src/components/ChatAssistant/ChatAssistant.jsx`
- `src/components/ChatAssistant/ChatAssistant.css`
- `src/services/aiService.js`
- `src/services/providers/nvidia.js`
- `src/services/assistantIntent.js` if it exists

## Files To Create

- None required.

Optional only if cleaner:

- `src/services/assistantResponseFormat.js`

---

## Exact Implementation Steps

### Step 1: Add Short Response Instructions

1. Locate assistant chat prompt construction in `aiService.js` and/or `providers/nvidia.js`.
2. Add a strict response style instruction:
   - short
   - clear
   - direct
   - professional
   - beginner-friendly
   - visually clean
3. Tell AI to avoid:
   - huge paragraphs
   - essay-style explanations
   - unnecessary theory
   - repeated wording
4. Set default maximum response shape:
   - 4 to 8 lines normally
5. Only allow detailed responses if user explicitly asks:
   - `Explain deeply`
   - `Teach me`
   - `Explain step-by-step`

### Step 2: Enforce Default Response Format

Use this default structure:

```md
Problem:
<one short line>

Fix:
<one short line>

Why it happened:
<one simple line>

Tip:
<optional tiny confidence line>
```

Rules:

1. `Problem` must be one short line.
2. `Fix` must be one short line.
3. `Why it happened` must be one simple line.
4. `Tip` is optional and must be short.
5. Do not add long paragraphs below the format.
6. Do not add unrelated theory.

### Step 3: Add Explicit Expansion Detection

1. Detect if the user asks for detail with phrases like:
   - `explain deeply`
   - `explain in detail`
   - `teach me`
   - `step by step`
   - `explain step-by-step`
2. If detailed mode is detected:
   - allow longer answer
   - still keep formatting clean
3. If detailed mode is not detected:
   - force short answer format.

### Step 4: Preserve Context-Specific Answers

Assistant must answer based on:

- current code
- current error
- detected language
- user question

Implementation:

1. Keep or add context to assistant request.
2. Include current code/error context in prompt when available.
3. Instruct AI:
   - answer this specific question only
   - do not give generic coding theory
4. If no context is available, answer the exact asked topic only.

### Step 5: Local Fallback Formatting

1. If AI fails, local fallback must use the same short format.
2. Fallback must not produce generic essays.
3. Use current error/code when available.
4. Show beginner-friendly confidence line.

### Step 6: Visual Response Cleanup

Do not change layout.

Only improve message formatting if already rendered as markdown/plain text:

1. Add spacing between sections.
2. Keep smaller text blocks.
3. Ensure bubbles remain readable.
4. Highlight fix line if existing markdown/code styling supports it.
5. Do not redesign chat UI.

### Step 7: Optional Explain More Feature

Optional feature:

- Add `Explain More` button under short assistant responses.

Behavior:

1. Default response stays short.
2. Clicking `Explain More` sends or expands a detailed explanation.
3. Only implement if it can be done without disrupting existing chat behavior.
4. If implementation risk is high, skip this optional feature.

---

## Response Behavior Rules

### New Response Style

Assistant responses must be:

- short
- clear
- direct
- professional
- beginner-friendly
- visually clean

Avoid:

- huge paragraphs
- essay-style explanations
- unnecessary theory
- repeated wording
- robotic textbook tone

### Required Format

```md
Problem:
Missing colon in the loop.

Fix:
Add ":" after the for loop.

Why it happened:
Python uses colons to start blocks.

Tip:
Small syntax mistakes are normal while learning.
```

### Length Rule

Maximum response length:

- normally 4 to 8 lines
- only expand if user explicitly asks for depth

### Smart Context Rule

Assistant must answer based on:

- current code
- current error
- detected language
- user question

Do not give generic answers when context exists.

### Beginner Experience Rule

Make users feel:

- calm
- confident
- guided
- not overwhelmed

Avoid robotic or textbook tone.

---

## Antigravity-Ready Prompt

```md
Optimize CodeLens Assistant response behavior.

Do not rewrite the assistant.
Do not change existing UI layout.
Do not change AI provider architecture.
Only improve response behavior and formatting.

Modify:
- src/components/ChatAssistant/ChatAssistant.jsx
- src/components/ChatAssistant/ChatAssistant.css
- src/services/aiService.js
- src/services/providers/nvidia.js
- src/services/assistantIntent.js if it exists

Optional create:
- src/services/assistantResponseFormat.js

Main problem:
Assistant responses are too long, too theoretical, repetitive, and overwhelming for beginners.

Required new style:
- short
- clear
- direct
- professional
- beginner-friendly
- visually clean

Avoid:
- huge paragraphs
- essay-style explanations
- unnecessary theory
- repeated wording

Default response format:
Problem:
one short line

Fix:
one short line

Why it happened:
one simple line

Tip:
optional short motivational sentence

Maximum response length:
- 4 to 8 lines normally
- expand only if user explicitly asks:
  - "Explain deeply"
  - "Teach me"
  - "Explain step-by-step"

Smart context:
- answer based on current code
- current error
- detected language
- user question
- do not give generic answers

Fallback:
- if AI fails, local fallback must use the same short format.

Optional:
- add "Explain More" button only if safe and non-disruptive.
```

---

## Testing Checklist

Run:

- `npm run dev`

Verify:

- assistant opens normally.
- no console errors.
- assistant answers stay short.
- responses are specific to current question.
- no essay-style output.
- beginner-friendly tone.
- no repeated theory.
- default response uses Problem/Fix/Why/Tip style.
- current code/error context is used when available.
- detailed answer only appears when user asks for detail.
- fallback answer is also short.
- dark mode works.
- light mode works.
- chat bubbles remain readable.

Test prompts:

- `Why is my loop not working?`
- `What is while loop?`
- `Fix this error`
- `Explain this like beginner`
- `Explain deeply why this happens`
- `Teach me step-by-step`

Expected:

- first four are concise.
- last two may be longer.

---

## Rollback Safety

Rollback only assistant response behavior changes.

Safe to revert:

- assistant prompt instructions in `aiService.js`
- assistant prompt instructions in `providers/nvidia.js`
- local fallback formatting
- optional `Explain More` button
- minor chat bubble formatting CSS
- `assistantResponseFormat.js` if created

Do not revert:

- Monaco editor files
- main analysis panel files
- About page files
- upload/attachment features if already implemented separately
- package files

If short-format prompt causes poor AI answers:

1. Keep context-specific prompt.
2. Relax only the line count.
3. Do not return to long essay-style responses.
