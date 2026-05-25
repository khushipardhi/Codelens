# CodeLens Assistant Upgrade

## Goal

Upgrade CodeLens Assistant into a smarter, cleaner, more helpful coding companion.

Do not:

- break existing CodeLens functionality
- rewrite the whole app
- change Monaco Editor behavior
- change the main analysis panel behavior
- remove existing assistant chat behavior

Only improve the assistant safely.

---

## Feature 1: Attachment Support

### Goal

Add support for:

- screenshot upload
- image upload
- code file upload
- drag and drop upload

Supported files:

- `.py`
- `.js`
- `.ts`
- `.html`
- `.css`
- `.java`
- `.c`
- `.cpp`
- `.json`
- `.txt`
- `.md`

Show:

- file preview
- image thumbnail
- remove attachment button

### Files To Modify

- `src/components/ChatAssistant/ChatAssistant.jsx`
- `src/components/ChatAssistant/ChatAssistant.css`
- `src/services/aiService.js`

### Files To Create

- `src/services/attachmentUtils.js`
- `src/services/assistantContext.js`

### Exact Implementation Steps

1. Add attachment state in `ChatAssistant.jsx`:
   - uploaded files
   - uploaded images
   - attachment errors
   - processing/loading state
2. Add hidden file inputs:
   - code file input
   - image/screenshot input
3. Add visible buttons:
   - upload file
   - upload screenshot/image
4. Add drag-and-drop support to chat input area.
5. Use browser FileReader API for text files.
6. Use object URL or data URL for image preview.
7. Validate supported file extensions.
8. Validate image MIME types.
9. Add size limit handling.
10. Show preview:
   - file chip for code/text files
   - image thumbnail for screenshots/images
11. Add remove attachment button.
12. Keep normal typed chat working without attachments.

### Antigravity-Ready Prompt

```md
Add attachment support to CodeLens Assistant.

Do not rewrite the app.
Do not break existing assistant chat.
Use client-side FileReader only.

Modify:
- src/components/ChatAssistant/ChatAssistant.jsx
- src/components/ChatAssistant/ChatAssistant.css
- src/services/aiService.js

Create:
- src/services/attachmentUtils.js
- src/services/assistantContext.js

Support:
- screenshot upload
- image upload
- code file upload
- drag and drop upload

Supported files:
.py, .js, .ts, .html, .css, .java, .c, .cpp, .json, .txt, .md

UI must show:
- file preview
- image thumbnail
- remove attachment button

Keep UI clean, professional, and beginner-friendly.
```

### Testing Checklist

- Run `npm run dev`.
- Open assistant.
- Upload `.py` file.
- Upload `.js` file.
- Upload `.md` file.
- Upload PNG/JPG/WEBP image.
- Drag and drop file.
- Confirm preview appears.
- Remove attachment.
- Send normal typed message.
- Confirm no console errors.

### Rollback Safety

- Revert only:
  - `ChatAssistant` attachment state/UI
  - `attachmentUtils.js`
  - `assistantContext.js`
  - attachment-related service changes
- Preserve existing typed chat behavior.

---

## Feature 2: Context-Aware Assistant

### Goal

Assistant should understand:

- current editor code
- detected language
- current errors
- uploaded file
- user question

If user asks:

`Why is this loop not working?`

Assistant should answer based on current code, not generic theory.

### Files To Modify

- `src/App.jsx`
- `src/components/ChatAssistant/ChatAssistant.jsx`
- `src/services/aiService.js`
- `src/services/providers/nvidia.js`

### Files To Create

- `src/services/assistantContext.js`

### Exact Implementation Steps

1. Pass current analysis/errors into `ChatAssistant` from `App.jsx`.
2. Build context with:
   - user question
   - current editor code
   - detected language
   - current analysis errors
   - uploaded file content
3. Implement:

```js
buildAssistantContext({
  userMessage,
  currentCode,
  detectedLanguage,
  currentErrors,
  uploadedFiles,
  uploadedImages
})
```

4. If uploaded file exists, prioritize uploaded file content.
5. If no upload exists, use current editor code.
6. Include current errors when available.
7. Keep prompt compact.
8. Do not send unnecessary huge context.

### Antigravity-Ready Prompt

```md
Make CodeLens Assistant context-aware.

Modify:
- src/App.jsx
- src/components/ChatAssistant/ChatAssistant.jsx
- src/services/aiService.js
- src/services/providers/nvidia.js

Create:
- src/services/assistantContext.js

Assistant context must include:
- current editor code
- detected language
- current errors
- uploaded file content
- user question

If user asks "Why is this loop not working?", answer based on current code/errors, not generic loop theory.

Keep prompts small.
Do not rewrite app architecture.
```

### Testing Checklist

- Run `npm run dev`.
- Load sample code.
- Open assistant.
- Ask `Why is this loop not working?`
- Confirm answer references current code/error.
- Upload file and ask about it.
- Confirm uploaded file is used.
- Confirm no generic answer when context exists.
- Confirm no console errors.

### Rollback Safety

- Revert context passing and `assistantContext.js`.
- Keep existing assistant chat path intact.

---

## Feature 3: Smart Quick Prompts

### Goal

Add suggestion chips for common assistant actions:

- Explain this error
- Fix this line
- Explain like beginner
- Show corrected code
- Why this happened?
- How to avoid this?

### Files To Modify

- `src/components/ChatAssistant/ChatAssistant.jsx`
- `src/components/ChatAssistant/ChatAssistant.css`

### Files To Create

- None

### Exact Implementation Steps

1. Add quick prompt chip list near chat input or empty assistant state.
2. Each chip should populate/send a helpful prompt.
3. Use current code/error context when chip is clicked.
4. Keep chips compact.
5. Make chips keyboard accessible.
6. Hide or de-emphasize chips after conversation grows if needed.

### Antigravity-Ready Prompt

```md
Add smart quick prompt chips to CodeLens Assistant.

Modify:
- src/components/ChatAssistant/ChatAssistant.jsx
- src/components/ChatAssistant/ChatAssistant.css

Chips:
- Explain this error
- Fix this line
- Explain like beginner
- Show corrected code
- Why this happened?
- How to avoid this?

Rules:
- Chips must use current code/error context.
- Keep them compact and professional.
- Do not clutter the chat UI.
- Preserve normal typed input behavior.
```

### Testing Checklist

- Open assistant.
- Click each quick prompt chip.
- Confirm message sends or populates correctly.
- Confirm context is used.
- Confirm chips look good in dark/light mode.
- Confirm no console errors.

### Rollback Safety

- Revert only quick prompt JSX/CSS.
- Keep assistant chat intact.

---

## Feature 4: Better Chat UI

### Goal

Improve assistant UI while keeping it professional and minimal.

Add:

- glassmorphism panel
- smooth open/close animation
- better spacing
- message bubbles
- typing indicator
- loading state
- clean attachment button
- send button hover glow

### Files To Modify

- `src/components/ChatAssistant/ChatAssistant.jsx`
- `src/components/ChatAssistant/ChatAssistant.css`

### Files To Create

- None

### Exact Implementation Steps

1. Preserve existing chat open/close behavior.
2. Add polished glassmorphism styling.
3. Improve spacing inside message list.
4. Improve user/assistant bubble distinction.
5. Add typing/loading indicator while AI responds.
6. Add clean attachment buttons.
7. Add send button hover glow.
8. Keep UI compact and not distracting.
9. Support light and dark mode.

### Antigravity-Ready Prompt

```md
Improve CodeLens Assistant UI without changing behavior.

Modify:
- src/components/ChatAssistant/ChatAssistant.jsx
- src/components/ChatAssistant/ChatAssistant.css

Add:
- glassmorphism panel
- smooth open/close animation
- better spacing
- message bubbles
- typing indicator
- loading state
- clean attachment button
- send button hover glow

Keep:
- professional
- minimal
- beginner-friendly
- dark/light mode support

Do not rewrite the assistant.
```

### Testing Checklist

- Open/close assistant.
- Send message.
- Confirm loading state appears.
- Confirm message bubbles look clean.
- Confirm dark/light mode works.
- Confirm mobile layout remains usable.
- Confirm no console errors.

### Rollback Safety

- Revert only ChatAssistant UI/CSS changes.

---

## Feature 5: Specific Answers Only

### Goal

Assistant must not give the same answer for all questions.

Detect topic:

- loop
- while loop
- event
- function
- array
- syntax error
- indentation
- brackets

Answer only what the user asked.

### Files To Modify

- `src/components/ChatAssistant/ChatAssistant.jsx`
- `src/services/aiService.js`
- `src/services/providers/nvidia.js`

### Files To Create

- `src/services/assistantIntent.js`

### Exact Implementation Steps

1. Create `assistantIntent.js`.
2. Implement:
   - `detectAssistantTopic(question)`
   - `detectAssistantIntent(question)`
   - `buildSpecificAssistantPrompt()`
3. Detect specific topics before generic topics:
   - `while loop` before `loop`
   - `syntax error` before `syntax`
4. Include detected topic and intent in AI prompt.
5. Instruct AI:
   - answer only the detected topic
   - do not give generic theory
6. Use local fallback when AI fails.

### Antigravity-Ready Prompt

```md
Make CodeLens Assistant answer specifically.

Modify:
- src/components/ChatAssistant/ChatAssistant.jsx
- src/services/aiService.js
- src/services/providers/nvidia.js

Create:
- src/services/assistantIntent.js

Detect topics:
- loop
- while loop
- event
- function
- array
- syntax error
- indentation
- brackets

Rules:
- If user asks about while loop, answer only while loop.
- If user asks about event, answer only event.
- Do not reuse same generic answer.
- Include topic and intent in AI prompt.
```

### Testing Checklist

- Ask `What is loop?`
- Ask `What is while loop?`
- Ask `What is event in JavaScript?`
- Ask `Why indentation error?`
- Confirm answers differ.
- Confirm no generic repeated response.

### Rollback Safety

- Revert only assistant intent detection and prompt changes.
- Preserve baseline assistant chat.

---

## Feature 6: Beginner-Friendly Tone

### Goal

Use short, clear answers.

Avoid long theory.

Answer format:

1. Simple meaning
2. What is wrong
3. How to fix
4. Small example if needed

### Files To Modify

- `src/services/assistantIntent.js`
- `src/services/aiService.js`
- `src/services/providers/nvidia.js`

### Files To Create

- None

### Exact Implementation Steps

1. Add answer style instruction to assistant prompt.
2. Keep answers short.
3. Avoid long paragraphs.
4. Prefer bullets and small code snippets.
5. Only include example if useful.
6. Preserve selected style if existing assistant supports tone.

### Antigravity-Ready Prompt

```md
Make CodeLens Assistant answers short and beginner-friendly.

Answer format:
1. Simple meaning
2. What is wrong
3. How to fix
4. Small example if needed

Rules:
- Avoid long theory.
- Keep answers concise.
- Use calm language.
- Use code examples only when helpful.
```

### Testing Checklist

- Ask concept question.
- Ask debugging question.
- Confirm answer is short.
- Confirm no long theory blocks.
- Confirm beginner-friendly tone.

### Rollback Safety

- Revert only assistant prompt tone changes.

---

## Feature 7: Local Fallback

### Goal

If AI fails, assistant should still answer using local context.

Show:

`AI is temporarily unavailable, but I can still help using local analysis.`

### Files To Modify

- `src/services/aiService.js`
- `src/components/ChatAssistant/ChatAssistant.jsx`
- `src/services/assistantIntent.js`

### Files To Create

- None

### Exact Implementation Steps

1. Add local fallback answer builder.
2. Use current code/errors/uploaded file context.
3. Use detected topic when possible.
4. Show AI unavailable message.
5. Do not show blank assistant response.
6. Keep UI stable.

### Antigravity-Ready Prompt

```md
Add local fallback for CodeLens Assistant.

If AI fails, show:
"AI is temporarily unavailable, but I can still help using local analysis."

Then provide a local context-based answer using:
- current code
- detected language
- current errors
- uploaded file content
- detected topic

Do not return blank responses.
Do not crash chat UI.
```

### Testing Checklist

- Disable AI or simulate failure.
- Ask assistant question.
- Confirm fallback message appears.
- Confirm local answer appears.
- Confirm no blank response.
- Confirm no console errors.

### Rollback Safety

- Revert local fallback builder only.

---

## Feature 8: Performance

### Goal

Do not make assistant slow.

Use:

- lazy loading
- small prompts
- safe parsing
- loading states
- error boundary

### Files To Modify

- `src/components/ChatAssistant/ChatAssistant.jsx`
- `src/services/aiService.js`
- `src/services/providers/nvidia.js`

### Files To Create

- None

### Exact Implementation Steps

1. Keep prompts compact.
2. Do not send unnecessary full app state.
3. Truncate huge uploaded files safely.
4. Show loading states.
5. Wrap parsing in safe try/catch where needed.
6. Avoid unnecessary re-renders.
7. Use memoization for derived attachment context if useful.
8. Preserve existing ErrorBoundary.

### Antigravity-Ready Prompt

```md
Keep CodeLens Assistant performant.

Use:
- lazy loading where useful
- small prompts
- safe parsing
- loading states
- existing error boundary

Rules:
- Do not send huge prompts.
- Truncate large file content.
- Avoid unnecessary re-renders.
- Do not add heavy libraries.
```

### Testing Checklist

- Send normal question.
- Send question with file.
- Send question with image.
- Confirm assistant remains responsive.
- Confirm no console errors.
- Confirm UI does not freeze.

### Rollback Safety

- Revert performance optimizations only if they break behavior.

---

## Final Local Testing

Run:

- `npm run dev`

Verify:

- chat opens properly.
- assistant sees current code.
- file upload works.
- image upload preview works.
- quick prompts work.
- assistant gives specific answers.
- AI fallback works.
- no console errors.
- dark mode works.
- light mode works.
- mobile layout remains usable.

---

## Global Rollback Safety

Rollback feature-by-feature.

Attachment support:

- `src/components/ChatAssistant/ChatAssistant.jsx`
- `src/components/ChatAssistant/ChatAssistant.css`
- `src/services/attachmentUtils.js`
- `src/services/assistantContext.js`

Context-aware assistant:

- `src/App.jsx`
- `src/components/ChatAssistant/ChatAssistant.jsx`
- `src/services/assistantContext.js`
- `src/services/aiService.js`
- `src/services/providers/nvidia.js`

Quick prompts:

- `src/components/ChatAssistant/ChatAssistant.jsx`
- `src/components/ChatAssistant/ChatAssistant.css`

Specific answers:

- `src/services/assistantIntent.js`
- `src/services/aiService.js`
- `src/services/providers/nvidia.js`
- `src/components/ChatAssistant/ChatAssistant.jsx`

Do not revert:

- Monaco editor files
- main analysis panel files
- About page files
- package files
