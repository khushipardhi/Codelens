# CodeLens Assistant Specific Answer Fix

## Project

CodeLens — React + Vite + AI coding mentor assistant.

## Main Problem

The CodeLens assistant is giving similar or repeated answers for different questions.

Examples:

- User asks about events.
- User asks about loops.
- User asks about while loops.

But the assistant gives the same type of answer.

This is incorrect.

## Goal

Make the assistant answer specifically based on the user’s exact question.

The assistant must:

- detect topic
- detect intent
- detect programming language if mentioned
- answer only what the user asked
- avoid generic repeated responses
- keep fallback answers topic-specific when AI fails

Do not rewrite the app. Preserve React + Vite, current UI, current assistant component behavior, and existing NVIDIA integration.

---

## Section 1: User Query Classification

### Goal

Add deterministic local classification before sending the assistant question to AI.

Classify each user query into:

1. Concept Explanation
   - Example: `What is a while loop?`
2. Error Help
   - Example: `Why is my loop not working?`
3. Code Example
   - Example: `Give me while loop example`
4. Difference Question
   - Example: `Difference between for loop and while loop`
5. Event Handling
   - Example: `What is event in JavaScript?`
6. Syntax Question
   - Example: `Syntax of while loop`
7. Debugging Question
   - Example: `Fix this code`

### Files To Modify

- `src/components/ChatAssistant/ChatAssistant.jsx`
- `src/services/aiService.js`
- `src/services/providers/nvidia.js`

### Files To Create

- `src/services/assistantIntent.js`

### Exact Implementation Steps

1. Create `src/services/assistantIntent.js`.
2. Export `classifyUserQuery(question, context = {})`.
3. Export `detectQuestionType(question)`.
4. Export `detectCodingTopic(question)`.
5. Export `detectQuestionLanguage(question, fallbackLanguage)`.
6. Use lowercase normalized text for rule checks.
7. Keep classification deterministic and fast.
8. Do not call AI for classification.
9. Return a structured object:

```js
{
  intent: 'concept' | 'error-help' | 'code-example' | 'difference' | 'event-handling' | 'syntax' | 'debugging' | 'unknown',
  topic: 'loop' | 'for loop' | 'while loop' | 'do while loop' | 'event' | 'event listener' | 'function' | 'array' | 'object' | 'class' | 'condition' | 'variable' | 'input/output' | 'recursion' | 'unknown',
  language: 'javascript' | 'python' | 'java' | 'cpp' | 'c' | 'html' | 'css' | fallbackLanguage,
  confidence: 'high' | 'medium' | 'low'
}
```

10. Match more specific topics before generic topics:
   - `do while loop` before `while loop`
   - `while loop` before `loop`
   - `for loop` before `loop`
   - `event listener` before `event`
11. Use fallback only when the topic is unclear.

### Antigravity-Ready Prompt

```md
Add deterministic user query classification for the CodeLens assistant.

Do not rewrite the app.
Do not change UI layout.
Do not remove existing AI integration.

Create:
- src/services/assistantIntent.js

Modify:
- src/components/ChatAssistant/ChatAssistant.jsx
- src/services/aiService.js
- src/services/providers/nvidia.js

Implement:
- classifyUserQuery()
- detectCodingTopic()
- detectQuestionType()
- detectQuestionLanguage()

Classify intents:
- concept
- error-help
- code-example
- difference
- event-handling
- syntax
- debugging
- unknown

Detect topics:
- loop
- for loop
- while loop
- do while loop
- event
- event listener
- function
- array
- object
- class
- condition
- variable
- input/output
- recursion

Rules:
- More specific topics must win over generic topics.
- "while loop" must not be treated as generic "loop".
- "event listener" must not be treated as generic "event".
- Classification must be local and fast.
- Do not use AI for classification.
```

### Testing Checklist

- Run `npm run dev`.
- Add temporary console diagnostics only if useful, then remove or keep behind a debug flag.
- Test classification for:
  - `What is loop?`
  - `What is while loop?`
  - `Give example of for loop`
  - `What is event in JavaScript?`
  - `Difference between for and while loop`
  - `Syntax of while loop`
  - `Why my while loop is infinite?`
- Confirm each query gets the correct topic and intent.
- Confirm no console errors.

### Rollback Safety

- Revert only:
  - `src/services/assistantIntent.js`
  - `src/components/ChatAssistant/ChatAssistant.jsx`
  - `src/services/aiService.js`
  - `src/services/providers/nvidia.js`
- If classification causes regressions, keep the file but bypass it temporarily in `ChatAssistant.jsx`.

---

## Section 2: Topic-Specific Prompt Builder

### Goal

Build AI prompts that explicitly constrain the assistant to the detected topic and question type.

The AI prompt must include:

- User asked about: `[detected topic]`
- Question type: `[detected intent]`
- Programming language: `[detected language]`
- Answer style: `[selected style]`

Instruction:

- Answer only this topic.
- Do not provide generic coding explanation.

### Files To Modify

- `src/services/assistantIntent.js`
- `src/services/aiService.js`
- `src/services/providers/nvidia.js`
- `src/components/ChatAssistant/ChatAssistant.jsx`

### Files To Create

- None

### Exact Implementation Steps

1. In `src/services/assistantIntent.js`, export `buildTopicSpecificPrompt({ question, classification, style, codeContext })`.
2. The prompt must explicitly include detected topic, intent, language, and style.
3. Add strict anti-generic instruction:
   - `Answer only about ${topic}. Do not switch to another topic.`
4. Add anti-repetition instruction:
   - `Do not reuse a generic loop/event/function answer. Tailor the answer to the detected topic and intent.`
5. Add format guidance based on intent:
   - concept: simple meaning, syntax, small example, explanation, common beginner mistake
   - syntax: syntax first, then compact example
   - difference: comparison table or clear bullet comparison
   - code-example: example first, then explanation
   - event-handling: browser event meaning, examples, event listener syntax
   - error-help/debugging: likely cause, check list, corrected pattern
6. Use detected language when selecting syntax examples.
7. Pass this prompt to the existing chat AI call.
8. Preserve existing code context support.

### Antigravity-Ready Prompt

```md
Add a topic-specific prompt builder for CodeLens assistant answers.

Modify:
- src/services/assistantIntent.js
- src/services/aiService.js
- src/services/providers/nvidia.js
- src/components/ChatAssistant/ChatAssistant.jsx

Implement:
- buildTopicSpecificPrompt()

Prompt must include:
- User asked about: [detected topic]
- Question type: [detected intent]
- Programming language: [detected language]
- Answer style: [selected style]

Add instruction:
"Answer only this topic. Do not provide generic coding explanation."

Answer structure by intent:
- concept: simple meaning, syntax, small example, explanation, common beginner mistake
- syntax: syntax first, then compact example
- code-example: example first, then explanation
- difference: compare the exact requested topics
- event-handling: explain browser event/event listener specifically
- error-help/debugging: explain likely cause and fix pattern

Rules:
- If user asks about while loop, answer only about while loop.
- If user asks about event, answer only about events.
- If user asks about loop generally, explain general loop concept.
- Do not reuse one generic template for all topics.
```

### Testing Checklist

- Run `npm run dev`.
- Ask assistant:
  - `What is while loop?`
  - `What is event in JavaScript?`
  - `Difference between for and while loop`
- Confirm prompt classification produces different AI instructions.
- Confirm AI answers are not generic duplicates.
- Confirm no console errors.

### Rollback Safety

- Revert only assistant prompt changes.
- Keep existing chat fallback path available.

---

## Section 3: Topic-Specific Local Fallbacks

### Goal

If AI fails, local fallback must still give topic-specific answers.

Do not use one generic fallback for all topics.

### Files To Modify

- `src/services/assistantIntent.js`
- `src/services/aiService.js`
- `src/components/ChatAssistant/ChatAssistant.jsx`

### Files To Create

- None

### Exact Implementation Steps

1. In `assistantIntent.js`, export `getLocalAssistantFallback({ question, classification, style })`.
2. Add a response template map keyed by topic and intent.
3. Include specific fallback content for at least:
   - loop concept
   - while loop concept
   - for loop example
   - event in JavaScript
   - difference between for and while loop
   - while loop syntax
   - infinite while loop debugging
4. Use selected language where possible.
5. Keep fallback answers concise, beginner-friendly, and specific.
6. Only use generic fallback if topic is `unknown`.
7. In `ChatAssistant.jsx` or `aiService.js`, call local fallback when AI throws.

### Required Fallback Examples

For `What is while loop?`:

```md
A while loop repeats code while a condition is true.

Syntax:
while (condition) {
  // code
}

Example:
let i = 1;
while (i <= 5) {
  console.log(i);
  i++;
}

Explanation:
The loop prints numbers from 1 to 5.

Common beginner mistake:
Forgetting to update i can create an infinite loop.
```

For `What is event in JavaScript?`:

```md
An event is an action that happens in the browser, like:
- button click
- key press
- mouse movement

Example:
button.addEventListener("click", function() {
  console.log("Button clicked");
});
```

### Antigravity-Ready Prompt

```md
Add topic-specific local fallback answers for the CodeLens assistant.

Modify:
- src/services/assistantIntent.js
- src/services/aiService.js
- src/components/ChatAssistant/ChatAssistant.jsx

Implement:
- response template map
- getLocalAssistantFallback()

Fallback must be topic-specific for:
- loop
- while loop
- for loop
- event
- event listener
- difference between for and while loop
- while loop syntax
- infinite while loop debugging

Rules:
- If AI fails, do not return one generic fallback.
- If user asks about while loop, fallback answers while loop only.
- If user asks about event, fallback answers event only.
- Use generic fallback only when topic is unclear.
```

### Testing Checklist

- Run `npm run dev`.
- Disable or break AI temporarily.
- Ask:
  - `What is loop?`
  - `What is while loop?`
  - `Give example of for loop`
  - `What is event in JavaScript?`
  - `Difference between for and while loop`
  - `Syntax of while loop`
  - `Why my while loop is infinite?`
- Confirm all fallback answers are different and topic-specific.
- Confirm no blank assistant response.
- Confirm no console errors.

### Rollback Safety

- Revert only:
  - fallback template map
  - fallback call integration
- Preserve existing AI chat path.

---

## Section 4: Assistant Integration

### Goal

Wire classification, prompt building, AI response, and fallback behavior into the existing assistant without changing the visible UI structure.

### Files To Modify

- `src/components/ChatAssistant/ChatAssistant.jsx`
- `src/services/aiService.js`
- `src/services/providers/nvidia.js`
- `src/services/assistantIntent.js`

### Files To Create

- None beyond `src/services/assistantIntent.js`.

### Exact Implementation Steps

1. In `ChatAssistant.jsx`, before sending the user question:
   - call `classifyUserQuery(question, { language, code })`
2. Pass classification into chat service.
3. In `aiService.js`, update `chatAboutCode()` to accept optional classification/style metadata.
4. In `providers/nvidia.js`, update `chatAboutCodeWithNvidia()` to accept the topic-specific prompt or classification metadata.
5. Ensure AI prompt uses `buildTopicSpecificPrompt()`.
6. If AI succeeds, display the AI answer.
7. If AI fails, call `getLocalAssistantFallback()`.
8. Ensure assistant never returns the same generic fallback for clear topics.
9. Preserve existing chat UI state and message list behavior.
10. Do not change visual layout unless needed for error display.

### Antigravity-Ready Prompt

```md
Integrate topic-specific assistant classification into CodeLens ChatAssistant.

Modify:
- src/components/ChatAssistant/ChatAssistant.jsx
- src/services/aiService.js
- src/services/providers/nvidia.js
- src/services/assistantIntent.js

Flow:
1. User asks question.
2. classifyUserQuery() detects intent, topic, and language.
3. buildTopicSpecificPrompt() creates strict AI prompt.
4. AI answers only the detected topic.
5. If AI fails, getLocalAssistantFallback() returns a topic-specific fallback.

Preserve:
- existing chat UI
- existing message state behavior
- existing NVIDIA provider
- existing Monaco/code context support

Do not rewrite the assistant component.
Do not change app architecture.
```

### Testing Checklist

- Run `npm run dev`.
- Open assistant.
- Ask all required test cases.
- Confirm each answer is topic-specific.
- Confirm assistant message history still works.
- Confirm loading state still works.
- Confirm AI failure fallback still works.
- Confirm no console errors.

### Rollback Safety

- Revert assistant integration while keeping `assistantIntent.js` available.
- Restore previous `chatAboutCode()` call signature if needed.

---

## Section 5: Response Structure Rules

### Goal

Ensure the assistant uses a helpful structure for concept questions and adapts structure by intent.

### Files To Modify

- `src/services/assistantIntent.js`
- `src/services/providers/nvidia.js`
- `src/services/aiService.js`

### Files To Create

- None

### Exact Implementation Steps

1. Define format instructions per intent in `assistantIntent.js`.
2. For concept questions, enforce:
   - simple meaning
   - syntax
   - small example
   - explanation of example
   - common beginner mistake
3. For event handling questions, enforce event-specific browser examples.
4. For difference questions, compare only the requested topics.
5. For debugging questions, focus on the likely bug and fix.
6. For syntax questions, put syntax first.
7. Keep answers concise.

### Antigravity-Ready Prompt

```md
Add intent-specific answer structure rules for CodeLens assistant responses.

Modify:
- src/services/assistantIntent.js
- src/services/providers/nvidia.js
- src/services/aiService.js

Concept response structure:
1. Simple meaning
2. Syntax
3. Small example
4. Explanation of example
5. Common beginner mistake

Rules:
- Structure changes based on intent.
- Do not blindly reuse the same template for all topics.
- Keep answers concise and beginner-friendly.
- Respect selected answer style where possible.
```

### Testing Checklist

- Ask `What is while loop?`
- Confirm answer includes meaning, syntax, example, explanation, mistake.
- Ask `What is event in JavaScript?`
- Confirm answer focuses on browser events.
- Ask `Difference between for and while loop`.
- Confirm answer compares those two topics only.

### Rollback Safety

- Revert only prompt format instructions and fallback templates.

---

## Final Test Cases

### Goal

Verify all required assistant answers are different and topic-specific.

### Files To Modify

- None unless a regression is found.

### Exact Implementation Steps

Test these queries:

1. `What is loop?`
2. `What is while loop?`
3. `Give example of for loop`
4. `What is event in JavaScript?`
5. `Difference between for and while loop`
6. `Syntax of while loop`
7. `Why my while loop is infinite?`

Expected behavior:

- all answers are different
- all answers are topic-specific
- while loop answer only discusses while loops
- event answer only discusses events
- general loop answer explains loops broadly
- difference answer compares for vs while only
- fallback answers are also topic-specific

### Antigravity-Ready Prompt

```md
Run final verification for CodeLens assistant specificity.

Run:
- npm run dev

Test:
1. "What is loop?"
2. "What is while loop?"
3. "Give example of for loop"
4. "What is event in JavaScript?"
5. "Difference between for and while loop"
6. "Syntax of while loop"
7. "Why my while loop is infinite?"

Verify:
- no console errors
- assistant answers are topic-specific
- fallback answers are topic-specific
- AI answers are not repetitive
- while loop and event answers are clearly different
- general loop and while loop answers are clearly different
```

### Testing Checklist

- `npm run dev` works.
- No console errors.
- Assistant opens.
- Each test query returns a specific answer.
- AI answers are not repetitive.
- Fallback answers are not repetitive.
- Existing chat UI remains stable.

### Rollback Safety

- Roll back feature-by-feature.
- Main rollback files:
  - `src/services/assistantIntent.js`
  - `src/components/ChatAssistant/ChatAssistant.jsx`
  - `src/services/aiService.js`
  - `src/services/providers/nvidia.js`
- Do not revert unrelated UI, Monaco, analysis, or theme files.
