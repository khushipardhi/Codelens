/**
 * CodeLens Assistant Intent & Context Service
 * ===========================================
 * Analyzes user questions to provide specific, context-aware answers.
 */

// Detects the specific topic the user is asking about
export function detectAssistantTopic(question) {
  const q = question.toLowerCase();
  
  if (q.includes('while loop')) return 'while loop';
  if (q.includes('loop')) return 'loop';
  if (q.includes('event')) return 'event';
  if (q.includes('function') || q.includes('def ')) return 'function';
  if (q.includes('array') || q.includes('list')) return 'array';
  if (q.includes('syntax error')) return 'syntax error';
  if (q.includes('indentation')) return 'indentation';
  if (q.includes('bracket') || q.includes('brace')) return 'brackets';
  
  return null;
}

// Detects if the user explicitly wants a long, detailed answer
export function wantsDetailedAnswer(question) {
  const q = question.toLowerCase();
  return q.includes('explain deeply') || 
         q.includes('teach me') || 
         q.includes('step by step') || 
         q.includes('step-by-step') ||
         q.includes('explain in detail');
}

// Detects the user's intent
export function detectAssistantIntent(question) {
  const q = question.toLowerCase();
  
  if (wantsDetailedAnswer(question)) {
    return 'detailed_explanation';
  }
  
  if (q.includes('why is') || q.includes('why does') || q.includes('not working') || q.includes('error') || q.includes('bug')) {
    return 'debugging';
  }
  if (q.includes('explain') || q.includes('what is') || q.includes('how does')) {
    return 'explanation';
  }
  if (q.includes('fix') || q.includes('how to solve')) {
    return 'fix';
  }
  
  return 'general';
}

// Classify the query and prepare it for context building
export function classifyUserQuery(question, context = {}) {
  return {
    topic: detectAssistantTopic(question),
    intent: detectAssistantIntent(question),
    isDetailed: wantsDetailedAnswer(question),
    language: context.language || 'unknown'
  };
}

// Builds the system prompt for the AI based on classification
export function buildTopicSpecificPrompt({ classification }) {
  const { topic, intent, isDetailed } = classification;
  
  let prompt = `You are CodeLens, a supportive coding mentor. Answer strictly in a beginner-friendly, clear, and professional tone. Avoid robotic textbook language. Be visually clean.\n`;
  
  if (isDetailed) {
    prompt += `\nThe user asked for a detailed explanation. Provide a thorough, step-by-step breakdown. Keep spacing clean, but you are allowed to write longer paragraphs.\n`;
  } else {
    prompt += `\nCRITICAL LENGTH RULE: Keep your response between 4 to 8 lines max. Do not use huge paragraphs, essay-style explanations, unnecessary theory, or repeated wording.\n`;
    prompt += `\nYou MUST use this EXACT format:

Problem:
<one short line explaining what is wrong or what it is>

Fix:
<one short line on how to fix it or use it>

Why it happened:
<one simple line on the cause or mechanism>

Tip:
<one short encouraging or motivational sentence>

DO NOT add text outside this format.\n`;
  }

  if (topic) {
    prompt += `\n- The user is asking about: ${topic}. Answer ONLY about this topic. Do not give generic theory.\n`;
  }
  
  if (intent === 'debugging') {
    prompt += `- The user is trying to debug an issue. Answer based on their provided code and error context. Do not give generic answers.\n`;
  }
  
  return prompt;
}

// Provides a local fallback answer if AI is offline
export function getLocalAssistantFallback({ classification }) {
  const { topic } = classification;
  
  let problem = "AI is temporarily offline.";
  let fix = "Check your code for obvious typos.";
  let why = "I cannot connect to the server right now.";
  let tip = "Try using the 'Analyze Code' button above to check your syntax locally!";

  if (topic === 'loop' || topic === 'while loop') {
    problem = "You might have an infinite loop or bad indentation.";
    fix = "Check your loop condition and spacing.";
    why = "Loops need a way to stop and proper structure.";
  } else if (topic === 'event') {
    problem = "Event listener syntax might be incorrect.";
    fix = "Check your addEventListener setup.";
    why = "Events require exact spelling to trigger correctly.";
  } else if (topic === 'function') {
    problem = "Function might not be called or returned properly.";
    fix = "Make sure you call it like: myFunction().";
    why = "Functions do nothing until they are called.";
  } else if (topic === 'array') {
    problem = "Array index might be out of bounds.";
    fix = "Remember that arrays start counting at 0.";
    why = "Accessing an item that doesn't exist causes errors.";
  } else if (topic === 'syntax error' || topic === 'indentation' || topic === 'brackets') {
    problem = `A ${topic} issue means there is a typo.`;
    fix = "Check for missing colons, brackets, or spacing.";
    why = "Code needs exact grammar to run.";
  }

  return `Problem:\n${problem}\n\nFix:\n${fix}\n\nWhy it happened:\n${why}\n\nTip:\n${tip}`;
}
