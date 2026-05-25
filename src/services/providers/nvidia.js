/**
 * Nvidia AI Provider for CodeLens
 * Handles query construction, API proxying (via Vite dev proxy), AbortController timeouts, and retry logic.
 * In development, all requests are proxied through /api/nvidia to avoid CORS issues.
 */

import { buildTopicSpecificPrompt } from '../assistantIntent.js';

// Default Nvidia endpoint
const DEFAULT_NVIDIA_BASE = 'https://integrate.api.nvidia.com/v1';

// Normalizes API Base URL
function normalizeBaseUrl(baseUrl) {
  return (baseUrl || DEFAULT_NVIDIA_BASE).replace(/\/+$/, '');
}

/** Returns true when the configured baseUrl matches the default Nvidia cloud endpoint */
function isDefaultNvidiaUrl(baseUrl) {
  const normalized = normalizeBaseUrl(baseUrl);
  return normalized === DEFAULT_NVIDIA_BASE || normalized === DEFAULT_NVIDIA_BASE.replace(/\/+$/, '');
}

/**
 * Returns the effective fetch URL for the NVIDIA API.
 * In dev mode, routes via Vite proxy (/api/nvidia) ONLY when the configured
 * baseUrl is the default Nvidia cloud endpoint. Custom URLs (e.g. local NIM)
 * are used directly to avoid proxy-induced CORS failures.
 */
export function getApiUrl(baseUrl) {
  // If the URL is NOT default, we always bypass the proxy and use the custom URL directly
  if (!isDefaultNvidiaUrl(baseUrl)) {
    return `${normalizeBaseUrl(baseUrl)}/chat/completions`;
  }

  const proxyUrl = import.meta.env.VITE_API_PROXY_URL;
  if (proxyUrl) return proxyUrl;

  // In dev mode, use Vite proxy only for the default Nvidia endpoint
  if (import.meta.env.DEV) {
    return '/api/nvidia/chat/completions';
  }

  return `${normalizeBaseUrl(baseUrl)}/chat/completions`;
}

/**
 * Returns the URL used for API key validation.
 * Same dev-proxy logic as getApiUrl.
 */
export function getValidateUrl(baseUrl) {
  if (!isDefaultNvidiaUrl(baseUrl)) {
    return `${normalizeBaseUrl(baseUrl)}/models`;
  }
  if (import.meta.env.DEV) {
    return '/api/nvidia/models';
  }
  return `${normalizeBaseUrl(baseUrl)}/models`;
}

// Helper to fetch with timeout and retries
async function fetchWithRetryAndTimeout(url, options, timeoutMs = 18000, maxRetries = 2) {
  let attempt = 0;

  while (attempt <= maxRetries) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(id);

      if (response.ok) {
        return response;
      }

      // Transient errors — retry
      if (response.status === 429 || (response.status >= 500 && response.status < 600)) {
        attempt++;
        if (attempt <= maxRetries) {
          await new Promise(resolve => setTimeout(resolve, attempt * 1200));
          continue;
        }
      }

      // Non-retryable
      const errorData = await response.json().catch(() => ({}));
      const msg = errorData.error?.message || `API responded with status ${response.status}.`;

      if (response.status === 401) {
        throw new Error('Your API key appears to be invalid. Please check it in Settings and try again.');
      }
      if (response.status === 403) {
        throw new Error('Your API key does not have permission for this model. Try a different model in Settings.');
      }
      if (response.status === 429) {
        throw new Error('Rate limit reached. You\'re sending requests too quickly — please wait a moment and try again.');
      }

      throw new Error(msg);

    } catch (err) {
      clearTimeout(id);

      if (err.name === 'AbortError') {
        attempt++;
        if (attempt <= maxRetries) {
          await new Promise(resolve => setTimeout(resolve, attempt * 1200));
          continue;
        }
        throw new Error('The AI is taking longer than expected. Please try again — your code analysis is still queued.', { cause: err });
      }

      // Network error (no internet, CORS, etc.)
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError') || err.message.includes('Network request failed')) {
        throw new Error('Cannot reach the AI server. Check your internet connection or switch to Offline Mode in Settings.', { cause: err });
      }

      attempt++;
      if (attempt <= maxRetries) {
        await new Promise(resolve => setTimeout(resolve, attempt * 1200));
        continue;
      }
      throw err;
    }
  }

  throw new Error('Request failed after multiple attempts. Please try again in a moment.');
}

// Orchestrator for Chat Completions
async function requestNvidiaCompletion({
  apiKey,
  baseUrl,
  model,
  messages,
  temperature = 0.3,
  maxTokens = 4096,
  timeoutMs = 15000,
  maxRetries = 1,
}) {
  const proxyUrl = import.meta.env.VITE_API_PROXY_URL;

  let fetchUrl;
  const headers = {
    'Content-Type': 'application/json',
  };

  if (proxyUrl && isDefaultNvidiaUrl(baseUrl)) {
    fetchUrl = proxyUrl;
    const proxyKey = import.meta.env.VITE_API_PROXY_KEY;
    if (proxyKey) {
      headers['X-Proxy-Key'] = proxyKey;
    } else if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }
  } else {
    const key = apiKey || import.meta.env.VITE_NVIDIA_API_KEY || '';
    if (!key) {
      throw new Error('No API key found. Please add your Nvidia API key in Settings or the .env file.');
    }
    fetchUrl = getApiUrl(baseUrl);
    headers['Authorization'] = `Bearer ${key}`;
  }

  const payload = {
    model: model || 'meta/llama-3.1-8b-instruct',
    messages,
    temperature,
    max_tokens: maxTokens,
    top_p: 0.9,
  };

  const response = await fetchWithRetryAndTimeout(fetchUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  }, timeoutMs, maxRetries);

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('The AI returned an empty response. Please try again.');
  return text;
}

/**
 * Normalizes text to extract clean JSON, falls back to text safely
 */
export function parseAiJsonOrText(text) {
  if (!text || typeof text !== 'string') return { fallbackText: '' };
  
  try { return JSON.parse(text.trim()); } catch { /* ignore */ }
  
  const blockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
  const match = text.match(blockRegex);
  if (match && match[1]) {
    try { return JSON.parse(match[1].trim()); } catch { /* ignore */ }
  }
  
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start >= 0 && end > start) {
    try { return JSON.parse(text.slice(start, end + 1)); } catch { /* ignore */ }
  }
  
  console.warn('[AI Service] Failed to parse structured JSON. Using raw text fallback.');
  return { fallbackText: text.trim() };
}

/**
 * Normalizes text to extract clean JSON
 */
function extractJson(text) {
  if (!text || typeof text !== 'string') throw new Error('No response from AI');
  
  try {
    return JSON.parse(text.trim());
  } catch {
    // Ignore, try next fallback
  }

  const blockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
  const match = text.match(blockRegex);
  if (match && match[1]) {
    try {
      return JSON.parse(match[1].trim());
    } catch {
      // Ignore, try next fallback
    }
  }

  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(text.slice(start, end + 1));
    } catch (innerErr) {
      throw new Error('AI returned a response that could not be parsed. Please try again.', { cause: innerErr });
    }
  }
  
  throw new Error('AI response format was unexpected. Please try again.');
}

function extractJsonArray(text) {
  if (!text || typeof text !== 'string') throw new Error('No response from AI');
  
  try {
    return JSON.parse(text.trim());
  } catch {
    // Ignore, try next fallback
  }

  const blockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
  const match = text.match(blockRegex);
  if (match && match[1]) {
    try {
      return JSON.parse(match[1].trim());
    } catch {
      // Ignore, try next fallback
    }
  }

  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(text.slice(start, end + 1));
    } catch (innerErr) {
      throw new Error('AI returned a response that could not be parsed.', { cause: innerErr });
    }
  }
  
  throw new Error('AI response format was unexpected.');
}

/**
 * Nvidia Code Analysis
 */
export async function analyzeWithNvidia(
  code,
  language,
  toneInstruction,
  skillInstruction,
  skillLevel,
  apiKey,
  aiConfig
) {
  const systemPrompt = `You are CodeLens, an adaptive intelligent coding companion designed to help users understand coding errors without fear or confusion. ${toneInstruction}

USER SKILL LEVEL: ${skillLevel.toUpperCase()}
${skillInstruction}

CRITICAL RULES:
- NEVER use harsh language like "invalid", "failed badly", "wrong code", "bad syntax", "incorrect logic"
- Instead use supportive language like "small issue detected", "quick adjustment needed", "almost there", "tiny syntax issue", "this is a common beginner pattern"
- Be technically accurate while remaining encouraging
- Support emotional learning psychology
- Feel like a patient mentor HELPING users understand, NOT an AI correcting users
- Adapt explanation depth to the user's skill level

EMOTIONAL UX EXAMPLES:
- Instead of "Syntax Error" → "You were very close here — Python expected a colon at the end of this line."
- Instead of "Compilation failed" → "The logic is mostly correct. A small syntax issue is preventing execution."
- Instead of "Undefined variable" → "Almost there! This variable needs to be created before it can be used here."

Respond ONLY with valid JSON in this exact format (no markdown, no code fences):
{
  "explanation": "Brief overall assessment of the code and explanation of the issues",
  "fixes": [
    {
      "errorName": "Technical error name",
      "lineNumber": <line number or null>,
      "simple": "Simple human-friendly explanation",
      "why": "Why this happens (adjust depth for ${skillLevel} level)",
      "fix": "How to fix it with code example",
      "avoid": "How to avoid it next time",
      "comfort": "Encouraging message for the learner",
      "relatedConcept": "The programming concept this relates to (e.g., loops, functions, arrays, conditions, classes, recursion, pointers, strings, types, syntax) or null"
    }
  ],
  "improvedCode": "The corrected version of the entire code",
  "confidence": "An encouraging closing message",
  "suggestions": [
    "A helpful tip 1 related to the detected language",
    "A helpful tip 2 related to the detected language"
  ]
}

If the code has NO errors, still return the JSON with an empty fixes array and a positive explanation praising the user's code.`;

  const userPrompt = `Analyze this ${language} code for errors and issues:\n\n\`\`\`${language.toLowerCase()}\n${code}\n\`\`\``;

  const text = await requestNvidiaCompletion({
    apiKey,
    baseUrl: aiConfig.baseUrl,
    model: aiConfig.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.25,
    maxTokens: 4096,
  });

  return extractJson(text);
}

/**
 * Generate Step-by-Step with Nvidia
 */
export async function generateStepByStepWithNvidia(code, language, apiKey, aiConfig) {
  const prompt = `You are CodeLens, an educational AI coding assistant. Explain this ${language} code step by step, line by line.

Return a JSON array where EVERY important line is explained. Do not skip lines with:
- Variable assignments
- Function declarations
- Loops (for, while)
- Conditions (if, elif, else)
- Return statements
- Print/output statements
- Import statements
- Lines with errors or syntax issues

For each line, provide a detailed, beginner-friendly breakdown.

EMOTIONAL TONE: Use supportive, calm language. Example: "You were very close here — Python expected a colon at the end of this line." NOT "Syntax Error".

Respond ONLY with a valid JSON array (no markdown, no text outside JSON):
[
  {
    "line": 3,
    "code": "for num in numbers",
    "description": "This loop goes through every item inside the numbers list one-by-one.",
    "why": "To iterate through a collection and perform operations on each element.",
    "mistake": "You were very close! Python expected a colon (:) at the end of this line to open the loop block.",
    "whyMistake": "Python uses colons to signal the start of a new code block, like opening a door for the code inside.",
    "fix": "Add a colon (:) to the end of the line, like: for num in numbers:",
    "corrected": "for num in numbers:",
    "avoid": "Try to remember that in Python, loops, conditionals, and function definitions always end with a colon.",
    "simple": "Think of the colon like opening a door for the block of code underneath.",
    "analogy": "Like a teacher checking the attendance list, looking at each student one-by-one.",
    "variables": "num (holds current number), numbers (the list being read)"
  }
]

If no mistake on a line, set "mistake", "whyMistake", "fix", "corrected", "avoid" to null.
If no analogy is useful, set "analogy" to null.
If no variables, set "variables" to null.

Code:
\`\`\`${language.toLowerCase()}
${code}
\`\`\``;

  const text = await requestNvidiaCompletion({
    apiKey,
    baseUrl: aiConfig.baseUrl,
    model: aiConfig.model,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2,
    maxTokens: 4096,
  });

  return extractJsonArray(text);
}

/**
 * Chat about code with Nvidia
 */
export async function chatAboutCodeWithNvidia(code, language, question, apiKey, aiConfig, classification = null) {
  let systemPrompt = '';
  if (classification) {
    systemPrompt = buildTopicSpecificPrompt({ question, classification, style: 'friendly', codeContext: code });
  } else {
    systemPrompt = `You are CodeLens, a supportive AI coding mentor. The user is working with ${language} code and has a question. 
Be warm, encouraging, and technically accurate. Never make the user feel judged or frustrated.
CRITICAL LENGTH RULE: Keep your response between 4 to 8 lines max. Do not use huge paragraphs, essay-style explanations, unnecessary theory, or repeated wording.
You MUST use this EXACT format:

Problem:
<one short line explaining what is wrong or what it is>

Fix:
<one short line on how to fix it or use it>

Why it happened:
<one simple line on the cause or mechanism>

Tip:
<one short encouraging or motivational sentence>

DO NOT add text outside this format.`; 
  }
  
  const userPrompt = code.trim() ? `Here is my ${language} code:\n\n\`\`\`${language.toLowerCase()}\n${code}\n\`\`\`\n\nMy question: ${question}` : `My question: ${question}`;

  const text = await requestNvidiaCompletion({
    apiKey,
    baseUrl: aiConfig.baseUrl,
    model: aiConfig.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.45,
    maxTokens: 2048,
  });

  return { response: text };
}

// ==========================================
// MODULAR AI SERVICES
// ==========================================

export async function requestAiExplainError(code, language, errorName, lineNumber, localExplanation, suggestedFix, toneInstruction, skillInstruction, apiKey, aiConfig) {
  const systemPrompt = `You are CodeLens, a supportive coding mentor. ${toneInstruction}
USER SKILL LEVEL: ${skillInstruction}
Respond ONLY with valid JSON containing a single field "explanation".
Do NOT use markdown fences. Do NOT include corrected code.`;
  
  const userPrompt = `Language: ${language}
Detected Error: ${errorName} at line ${lineNumber}
Local Explanation: ${localExplanation}
Suggested Fix: ${suggestedFix}

Code:
\`\`\`${language}
${code}
\`\`\`

Provide a highly concise, encouraging explanation of the error.`;

  const text = await requestNvidiaCompletion({
    apiKey,
    baseUrl: aiConfig.baseUrl,
    model: aiConfig.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.25,
    maxTokens: 500,
    timeoutMs: 8000,
    maxRetries: 1,
  });

  const parsed = parseAiJsonOrText(text);
  return parsed.explanation || parsed.fallbackText || localExplanation;
}

export async function requestAiTranslateBilingual(localExplanation, language, toneInstruction, apiKey, aiConfig) {
  const systemPrompt = `You are CodeLens, a supportive coding mentor. ${toneInstruction}
Respond ONLY with valid JSON containing a single field "explanation". Do not use markdown fences.`;

  const userPrompt = `Translate and enhance the following explanation into the requested bilingual style for a ${language} learner.
Original: "${localExplanation}"`;

  const text = await requestNvidiaCompletion({
    apiKey,
    baseUrl: aiConfig.baseUrl,
    model: aiConfig.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.3,
    maxTokens: 500,
    timeoutMs: 8000,
    maxRetries: 1,
  });

  const parsed = parseAiJsonOrText(text);
  return parsed.explanation || parsed.fallbackText || localExplanation;
}

export async function requestAiGenerateCorrectedCode(code, language, errorSummary, apiKey, aiConfig) {
  const systemPrompt = `You are an expert coder. Respond ONLY with the corrected code inside a standard markdown code block. Do NOT provide explanations.`;
  
  const userPrompt = `Fix the following ${language} code.
Issues detected: ${errorSummary}

Code:
\`\`\`${language}
${code}
\`\`\``;

  const text = await requestNvidiaCompletion({
    apiKey,
    baseUrl: aiConfig.baseUrl,
    model: aiConfig.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.1,
    maxTokens: 2000,
    timeoutMs: 15000,
    maxRetries: 1,
  });

  // Extract from markdown block if present
  const blockRegex = /```(?:[a-zA-Z0-9]+)?\s*([\s\S]*?)\s*```/i;
  const match = text.match(blockRegex);
  return match && match[1] ? match[1].trim() : text.trim();
}

export async function requestAiConfidenceMessage(errorSummary, toneInstruction, apiKey, aiConfig) {
  const systemPrompt = `You are CodeLens, a supportive coding mentor. ${toneInstruction}
Respond ONLY with valid JSON containing a single field "confidence". Do not use markdown fences.`;

  const userPrompt = `Provide a single, very short (1 sentence) encouraging closing message for a user who just encountered this issue: ${errorSummary}.`;

  const text = await requestNvidiaCompletion({
    apiKey,
    baseUrl: aiConfig.baseUrl,
    model: aiConfig.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.4,
    maxTokens: 100,
    timeoutMs: 5000,
    maxRetries: 1,
  });

  const parsed = parseAiJsonOrText(text);
  return parsed.confidence || parsed.fallbackText || "Keep practicing, you're getting better!";
}
