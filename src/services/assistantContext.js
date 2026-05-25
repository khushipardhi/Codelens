// assistantContext.js

export function buildAssistantContext({
  userMessage,
  currentCode,
  detectedLanguage,
  currentErrors,
  uploadedFiles,
  uploadedImages
}) {
  let context = '';
  
  // 1. Incorporate uploaded files if any (prioritized)
  if (uploadedFiles && uploadedFiles.length > 0) {
    context += `[UPLOADED FILE CONTEXT]\n`;
    for (const file of uploadedFiles) {
      context += `File: ${file.name}\n`;
      context += `\`\`\`\n${file.content}\n\`\`\`\n\n`;
    }
  } else if (currentCode && currentCode.trim().length > 0) {
    // 2. Fallback to current editor code if no file is uploaded
    context += `[CURRENT EDITOR CODE]\n`;
    context += `Language: ${detectedLanguage}\n`;
    context += `\`\`\`${detectedLanguage.toLowerCase()}\n${currentCode}\n\`\`\`\n\n`;
  }
  
  // 3. Current Errors
  if (currentErrors && currentErrors.length > 0) {
    context += `[CURRENT DETECTED ERRORS]\n`;
    for (const err of currentErrors) {
      context += `- Line ${err.lineNumber}: ${err.errorName} (${err.why})\n`;
    }
    context += '\n';
  }

  // 4. Image metadata
  let imageWarning = '';
  if (uploadedImages && uploadedImages.length > 0) {
    context += `[ATTACHED IMAGES]\n`;
    for (const img of uploadedImages) {
      context += `- ${img.name} (${img.type})\n`;
    }
    context += '\n';
    imageWarning = 'Image uploaded. Vision analysis is not active yet.';
  }

  // Combine user message and context
  const fullPrompt = `${context}\n[USER QUESTION]\n${userMessage}`;
  
  return { fullPrompt, imageWarning };
}
