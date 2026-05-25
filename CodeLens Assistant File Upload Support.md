# CodeLens Assistant File Upload Support

## Goal

Upgrade CodeLens Assistant so users can ask questions using:

- typed messages
- screenshots/images
- uploaded files

Final goal:

CodeLens Assistant should become more useful by supporting screenshots, files, and code context while staying clean, fast, and beginner-friendly.

## Strict Scope

Do not:

- rewrite the whole app
- break existing assistant behavior
- require a backend unless absolutely necessary
- change Monaco Editor integration
- change the main analysis flow
- remove existing chat behavior

Add this as a safe modular feature.

Project requirements:

- React
- Vite
- Antigravity
- localhost
- browser FileReader API for text files

---

## Feature 1: Screenshot / Image Support

### Goal

Allow users to attach screenshots/images to CodeLens Assistant messages.

Users should be able to:

- upload screenshot of code/error
- paste screenshot
- drag and drop image
- preview uploaded image
- remove image before sending

Supported formats:

- PNG
- JPG
- JPEG
- WEBP

### Files To Modify

- `src/components/ChatAssistant/ChatAssistant.jsx`
- `src/components/ChatAssistant/ChatAssistant.css`
- `src/services/aiService.js`
- `src/services/providers/nvidia.js`

### Files To Create

- `src/services/assistantContext.js`
- `src/services/attachmentUtils.js`

### Exact Implementation Steps

1. Add local attachment state in `ChatAssistant.jsx`:
   - `uploadedImages`
   - `uploadedFiles`
   - `attachmentError`
   - `isProcessingAttachment`
2. Add hidden image input:
   - `accept="image/png,image/jpeg,image/jpg,image/webp"`
3. Add `Upload Screenshot` button.
4. Add paste support:
   - listen for paste events on assistant input area
   - detect image clipboard items
   - convert to image attachment
5. Add drag-and-drop support:
   - drag over assistant input area
   - validate dropped files
   - process supported images
6. Preview uploaded images:
   - thumbnail
   - filename/type
   - remove button
7. Validate image size.
8. If image is unsupported, show:
   - `This file type is not supported yet.`
9. If vision is unavailable, do not fail the chat. Show:
   - `Image uploaded. Vision analysis is not active yet.`
10. If AI provider later supports vision, pass image metadata/base64 through assistant context.
11. Keep UI clean and compact.

### UI Behavior

- Image preview appears above or inside the chat input area.
- Image thumbnail should be small and readable.
- Remove button should be visible and keyboard accessible.
- Drag state should show a subtle glassmorphism drop hint.
- Multiple images can be supported if lightweight, but one image is acceptable for first implementation.

### Assistant Behavior

- If image is attached and vision is active:
  - include image context in AI request.
- If image is attached and vision is not active:
  - keep user message flow working.
  - assistant responds with a clear note:
    - `Image uploaded. Vision analysis is not active yet.`
- Do not crash or send blank messages.

### Antigravity-Ready Prompt

```md
Add screenshot/image attachment support to CodeLens Assistant.

Do not rewrite the app.
Do not break existing assistant behavior.
Do not require a backend.

Modify:
- src/components/ChatAssistant/ChatAssistant.jsx
- src/components/ChatAssistant/ChatAssistant.css
- src/services/aiService.js
- src/services/providers/nvidia.js

Create:
- src/services/assistantContext.js
- src/services/attachmentUtils.js

Requirements:
1. Support image upload in Assistant.
2. Support paste screenshot.
3. Support drag and drop image.
4. Preview uploaded image.
5. Allow remove image before sending.
6. Supported formats: PNG, JPG, JPEG, WEBP.
7. Validate image size.
8. If vision is unavailable, show:
   "Image uploaded. Vision analysis is not active yet."
9. Do not break typed-message chat.
10. Keep UI clean, beginner-friendly, premium, and glassmorphism styled.
```

### Local Testing Checklist

- Run `npm run dev`.
- Open localhost.
- Open assistant.
- Upload PNG image.
- Upload JPG/JPEG image.
- Upload WEBP image.
- Paste screenshot into chat input.
- Drag and drop image.
- Confirm thumbnail preview appears.
- Remove image before sending.
- Send message with image.
- Confirm assistant does not crash.
- Confirm vision-unavailable message appears if vision is not active.
- Confirm no console errors.

### Rollback Safety

- Revert only:
  - image attachment state/UI in `ChatAssistant.jsx`
  - image attachment CSS
  - image handling helpers in `assistantContext.js` / `attachmentUtils.js`
  - AI context changes related to images
- Do not revert existing chat behavior.

---

## Feature 2: File Upload Support

### Goal

Allow users to upload coding-related text files and use their content as assistant context.

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

### Files To Modify

- `src/components/ChatAssistant/ChatAssistant.jsx`
- `src/components/ChatAssistant/ChatAssistant.css`
- `src/services/aiService.js`

### Files To Create

- `src/services/assistantContext.js`
- `src/services/attachmentUtils.js`

### Exact Implementation Steps

1. Add hidden file input:
   - `accept=".py,.js,.ts,.html,.css,.java,.c,.cpp,.json,.txt,.md"`
2. Add `Upload File` button.
3. Use browser `FileReader` API to read text files.
4. Validate file extension.
5. Validate file size.
6. If file is too large, show:
   - `File is too large. Please upload a smaller file.`
7. If unsupported, show:
   - `This file type is not supported yet.`
8. Detect language from:
   - file extension
   - file content if helpful
9. Show file preview chip:
   - filename
   - detected language
   - size
   - remove button
10. Use uploaded file content as assistant context.
11. Keep file content out of the main editor unless user explicitly asks later.
12. Do not require backend upload.

### UI Behavior

- Uploaded file appears as a compact preview chip.
- User can remove file before sending.
- File processing should show a small loading state.
- Error messages should be concise.
- The input area remains clean and not crowded.

### Assistant Behavior

When user uploads a file and asks a question:

- assistant should answer based on uploaded file content
- assistant should mention the file context only when useful
- assistant should not ignore current editor code if no file is uploaded

Example:

User uploads Python file and asks:

`Why is my loop not working?`

Assistant should answer based on the uploaded Python file.

### Antigravity-Ready Prompt

```md
Add coding file upload support to CodeLens Assistant.

Do not rewrite the app.
Do not require backend upload.
Use browser FileReader API.

Modify:
- src/components/ChatAssistant/ChatAssistant.jsx
- src/components/ChatAssistant/ChatAssistant.css
- src/services/aiService.js

Create:
- src/services/assistantContext.js
- src/services/attachmentUtils.js

Supported files:
- .py
- .js
- .ts
- .html
- .css
- .java
- .c
- .cpp
- .json
- .txt
- .md

Requirements:
1. Add Upload File button.
2. Read file content safely with FileReader.
3. Validate file type.
4. Validate file size.
5. Detect language from extension/content.
6. Show file preview chip.
7. Allow remove file.
8. Use uploaded file content as assistant context.
9. Keep UI clean and premium.
10. Do not break normal typed chat.
```

### Local Testing Checklist

- Run `npm run dev`.
- Upload `.py` file.
- Upload `.js` file.
- Upload `.html` file.
- Upload `.json` file.
- Upload unsupported file type.
- Upload too-large file.
- Confirm preview chip appears.
- Confirm remove button works.
- Ask a question about uploaded file.
- Confirm assistant uses uploaded file context.
- Confirm no console errors.

### Rollback Safety

- Revert only:
  - file attachment UI/state
  - file helper utilities
  - assistant context changes for files
- Preserve normal chat behavior.

---

## Feature 3: Chat Input Attachment UI

### Goal

Add clean attachment controls to the assistant input without cluttering the chat UI.

Required controls:

- Upload File button
- Upload Screenshot button
- Drag & Drop area
- Attached file preview chip
- Image preview thumbnail
- Remove attachment button

### Files To Modify

- `src/components/ChatAssistant/ChatAssistant.jsx`
- `src/components/ChatAssistant/ChatAssistant.css`

### Files To Create

- None beyond helpers already listed.

### Exact Implementation Steps

1. Add attachment toolbar near the chat input.
2. Use existing icon library if available.
3. Add hidden file/image inputs.
4. Add accessible labels/titles.
5. Add drag state styling.
6. Add preview area:
   - file chip
   - image thumbnail
   - remove button
7. Ensure previews do not crowd the message input.
8. Keep design:
   - clean
   - beginner-friendly
   - premium
   - glassmorphism styled
9. Ensure keyboard accessibility.
10. Ensure mobile layout remains usable.

### UI Behavior

- Attachment buttons should be easy to find but not visually loud.
- Preview chips should sit above the text input or inside a compact attachment row.
- Remove attachment button should be small but clear.
- Drag-over state should subtly highlight the assistant input area.

### Assistant Behavior

- Sending without attachments behaves exactly as before.
- Sending with attachments builds assistant context before calling AI.
- Empty message with attachment may be allowed if useful:
  - default prompt can be `Please help me understand this attachment.`

### Antigravity-Ready Prompt

```md
Add attachment controls to CodeLens Assistant input.

Modify:
- src/components/ChatAssistant/ChatAssistant.jsx
- src/components/ChatAssistant/ChatAssistant.css

Add:
- Upload File button
- Upload Screenshot button
- Drag & Drop area
- Attached file preview chip
- Image preview thumbnail
- Remove attachment button

Design:
- clean
- beginner-friendly
- premium
- glassmorphism styled

Rules:
- Do not break existing text chat.
- Keep controls accessible.
- Keep mobile layout usable.
- Avoid clutter.
```

### Local Testing Checklist

- Run `npm run dev`.
- Open assistant.
- Verify attachment buttons appear.
- Verify hidden inputs open file picker.
- Verify drag-over styling appears.
- Verify file chip appears.
- Verify image thumbnail appears.
- Verify remove attachment works.
- Verify mobile layout remains usable.
- Confirm no console errors.

### Rollback Safety

- Revert only attachment UI changes in `ChatAssistant`.
- Keep chat message behavior intact.

---

## Feature 4: Assistant Behavior With Attachments

### Goal

Assistant should combine:

- user question
- pasted code
- uploaded file content
- screenshot context if available
- current editor code
- detected language

### Files To Modify

- `src/components/ChatAssistant/ChatAssistant.jsx`
- `src/services/aiService.js`
- `src/services/providers/nvidia.js`

### Files To Create

- `src/services/assistantContext.js`

### Exact Implementation Steps

1. Create helper:

```js
buildAssistantContext({
  userMessage,
  uploadedFiles,
  uploadedImages,
  currentCode,
  detectedLanguage
})
```

2. Context should combine:
   - user message
   - file content
   - current editor code
   - detected language
   - attachment metadata
3. Keep context compact.
4. Include file metadata:
   - filename
   - extension
   - detected language
   - size
5. Include image metadata:
   - filename
   - type
   - size
   - note whether vision is active
6. If uploaded file exists, prioritize it over current editor code for that question.
7. If no upload exists, keep current behavior using editor code.
8. If image exists but vision is inactive, add a note to assistant response.

### Assistant Behavior

Examples:

User uploads Python file and asks:

`Why is my loop not working?`

Assistant should answer based on the uploaded file.

User uploads screenshot and asks:

`What error is this?`

Assistant should analyze screenshot if vision model is available.

If vision is not available:

`Image uploaded. Vision analysis is not active yet.`

### Antigravity-Ready Prompt

```md
Add assistant context building for uploaded files and images.

Modify:
- src/components/ChatAssistant/ChatAssistant.jsx
- src/services/aiService.js
- src/services/providers/nvidia.js

Create:
- src/services/assistantContext.js

Implement:
buildAssistantContext({
  userMessage,
  uploadedFiles,
  uploadedImages,
  currentCode,
  detectedLanguage
})

Context must include:
- user message
- file content
- current editor code
- detected language
- attachment metadata

Rules:
- Uploaded file context should be used when present.
- Current editor code remains fallback context.
- Image metadata should be included.
- If vision is not active, show:
  "Image uploaded. Vision analysis is not active yet."
- Do not break normal chat.
```

### Local Testing Checklist

- Run `npm run dev`.
- Ask normal typed question without attachments.
- Confirm existing behavior works.
- Upload file and ask question.
- Confirm assistant uses file content.
- Upload image and ask question.
- Confirm vision inactive message appears if vision is unavailable.
- Confirm no blank responses.
- Confirm no console errors.

### Rollback Safety

- Revert only context builder and attachment integration.
- Restore previous chat request body if needed.

---

## Feature 5: Safety And Limits

### Goal

Add safe limits and clear errors for uploads.

### Files To Modify

- `src/services/attachmentUtils.js`
- `src/components/ChatAssistant/ChatAssistant.jsx`
- `src/components/ChatAssistant/ChatAssistant.css`

### Files To Create

- `src/services/attachmentUtils.js`

### Exact Implementation Steps

1. Define file size limit.
2. Define image size limit.
3. Validate file extension.
4. Validate MIME type for images.
5. Validate readable text content.
6. Add loading state while reading files.
7. Add error handling.
8. Show messages:
   - too large: `File is too large. Please upload a smaller file.`
   - unsupported: `This file type is not supported yet.`
9. Clear errors when user removes attachment or uploads a valid one.
10. Do not crash on FileReader errors.

### Antigravity-Ready Prompt

```md
Add safety limits and validation for CodeLens Assistant uploads.

Create/modify:
- src/services/attachmentUtils.js
- src/components/ChatAssistant/ChatAssistant.jsx
- src/components/ChatAssistant/ChatAssistant.css

Add:
- file size limit
- unsupported file warning
- image size validation
- loading state
- error handling

Messages:
- "File is too large. Please upload a smaller file."
- "This file type is not supported yet."

Rules:
- Do not crash on bad file.
- Do not send unsupported content.
- Keep UI beginner-friendly.
```

### Local Testing Checklist

- Upload too-large file.
- Upload unsupported file.
- Upload valid file.
- Upload valid image.
- Trigger FileReader failure if possible.
- Confirm readable error messages.
- Confirm no console errors.

### Rollback Safety

- Revert only validation helper and validation UI changes.

---

## Localhost Support

### Goal

Everything must work locally through:

- React
- Vite
- Antigravity
- localhost

No backend should be required for text files.

### Exact Implementation Steps

1. Use browser FileReader API for text files.
2. Use object URLs or data URLs only for local image preview.
3. Avoid server uploads.
4. Avoid backend requirements.
5. Keep all processing client-side.

### Antigravity-Ready Prompt

```md
Ensure CodeLens Assistant uploads work locally with React + Vite.

Requirements:
- no backend required for text files
- use browser FileReader API
- run through localhost
- work in Antigravity
- no server upload needed
```

### Local Testing Checklist

- Run `npm run dev`.
- Test uploads on localhost.
- Refresh page and confirm no broken state.
- Confirm no backend calls are required for file reading.

### Rollback Safety

- Revert client-side upload helpers only.

---

## Final Local Testing Checklist

Run:

- `npm run dev`

Verify:

- localhost opens.
- no console errors.
- assistant still works with typed messages.
- upload file button works.
- upload screenshot button works.
- drag and drop works.
- paste screenshot works.
- uploaded image preview works.
- uploaded file preview works.
- remove attachment works.
- supported files are accepted.
- unsupported files show warning.
- too-large files show warning.
- assistant uses uploaded file content.
- image upload shows vision unavailable message if vision is not active.
- normal chat still works without attachments.
- dark mode works.
- light mode works.
- mobile layout remains usable.

---

## Global Rollback Safety

Rollback feature-by-feature.

New helper files:

- `src/services/assistantContext.js`
- `src/services/attachmentUtils.js`

Assistant UI changes:

- `src/components/ChatAssistant/ChatAssistant.jsx`
- `src/components/ChatAssistant/ChatAssistant.css`

AI context integration:

- `src/services/aiService.js`
- `src/services/providers/nvidia.js`

If upload feature causes regressions:

1. Disable attachment buttons.
2. Keep normal text chat unchanged.
3. Revert helper integration.
4. Do not revert unrelated assistant behavior.

Never revert unrelated:

- Monaco editor files
- main analysis panel files
- About page files
- package files
