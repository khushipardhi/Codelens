/**
 * AI Analysis Orchestration Service for CodeLens
 * ================================================
 * Coordinates providers (Nvidia NIM, offline patterns).
 * Handles timeouts, retries, normalization, and graceful fallbacks.
 */

import {
  analyzeWithNvidia,
  generateStepByStepWithNvidia,
  chatAboutCodeWithNvidia,
  getApiUrl,
  requestAiExplainError,
  requestAiTranslateBilingual,
  requestAiGenerateCorrectedCode,
  requestAiConfidenceMessage,
} from './providers/nvidia';

import {
  analyzeWithPatterns,
  getRandomConfidenceMessage,
  getBeginnerTip,
} from './providers/offline';

// ---- Configured Models ----
export const AI_MODELS = [
  {
    id: 'meta/llama-3.1-8b-instruct',
    label: 'Llama 3.1 8B Instruct (Fast)',
    speed: 'Ultra-Fast',
    description: 'Primary beginner-friendly model for rapid code feedback.',
  },
  {
    id: 'nvidia/llama-3.1-nemotron-nano-8b-v1',
    label: 'Nemotron Nano 8B (Nvidia)',
    speed: 'Very Fast',
    description: 'Ultra-compact model with low latency.',
  },
  {
    id: 'meta/llama-3.3-70b-instruct',
    label: 'Meta Llama 3.3 70B (Deeper Analysis)',
    speed: 'Balanced',
    description: 'Larger model for complex debugging and detailed analysis.',
  },
  {
    id: 'mistralai/mixtral-8x7b-instruct',
    label: 'Mixtral 8x7B (Alternative)',
    speed: 'Fast',
    description: 'High-quality mixture-of-experts model.',
  },
];

export const DEFAULT_AI_CONFIG = {
  provider: 'nvidia',
  baseUrl: import.meta.env.VITE_NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1',
  model: import.meta.env.VITE_NVIDIA_MODEL || AI_MODELS[0].id,
  apiKey: import.meta.env.VITE_NVIDIA_API_KEY || '',
};

// ---- Tone configurations ----
const TONE_CONFIGS = {
  professional: {
    label: 'Professional',
    icon: '💼',
    style: 'formal',
    encouragement: false,
  },
  friendly: {
    label: 'Friendly Mentor',
    icon: '🤝',
    style: 'warm',
    encouragement: true,
  },
  teacher: {
    label: 'Teacher',
    icon: '📚',
    style: 'educational',
    encouragement: true,
  },
  beginner: {
    label: 'Beginner Comfort',
    icon: '🌱',
    style: 'simplified',
    encouragement: true,
  },
};

export function getToneConfigs() {
  return TONE_CONFIGS;
}

function getToneInstruction(toneConfig) {
  switch (toneConfig.style) {
    case 'formal':
      return 'Be formal, concise, and professional. Use technical terminology appropriately.';
    case 'warm':
      return 'Be warm, supportive, and calm. Use encouraging language.';
    case 'educational':
      return 'Be detailed and educational. Explain concepts thoroughly with examples.';
    case 'simplified':
      return 'Use very simple language. Explain as if teaching a complete beginner. Add emotional encouragement.';
    default:
      return 'Be warm and supportive.';
  }
}

function getSkillInstruction(skillLevel) {
  switch (skillLevel) {
    case 'advanced':
      return 'The user is an advanced developer. Be concise. Skip basic concept explanations. Focus on the specific issue.';
    case 'intermediate':
      return 'The user has moderate experience. Provide balanced explanations without over-explaining basics.';
    case 'beginner':
    default:
      return 'The user is a beginner. Use extra simple language. Explain underlying concepts. Add emotional reassurance.';
  }
}

/**
 * Merges local pattern-matched errors with AI-discovered errors.
 * Prevents duplicates while ensuring all issues are surfaced.
 */
function mergeAnalysisResults(localErrors, aiErrors) {
  const merged = [...aiErrors];
  for (const local of localErrors) {
    const isDuplicate = aiErrors.some(
      (ai) =>
        ai.lineNumber === local.lineNumber &&
        (ai.errorName.toLowerCase().includes(local.errorName.toLowerCase()) ||
          local.errorName.toLowerCase().includes(ai.errorName.toLowerCase()))
    );
    if (!isDuplicate) merged.push(local);
  }
  return merged.sort((a, b) => {
    if (a.lineNumber === null) return 1;
    if (b.lineNumber === null) return -1;
    return a.lineNumber - b.lineNumber;
  });
}

/**
 * Validate an API key by making a lightweight test request.
 * @returns {{ valid: boolean, error?: string }}
 */
export async function validateApiKey(apiKey, baseUrl) {
  if (!apiKey || !apiKey.trim()) {
    return { valid: false, error: 'API key is empty.' };
  }
  try {
    const url = getApiUrl(baseUrl);
    const payload = {
      model: import.meta.env.VITE_NVIDIA_MODEL || 'meta/llama-3.1-8b-instruct',
      messages: [{ role: 'user', content: 'test' }],
      max_tokens: 1
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });

    if (res.status === 401) return { valid: false, error: 'Invalid API key — authentication failed (401).' };
    if (res.status === 403) return { valid: false, error: 'API key does not have permission for this model (403).' };
    if (res.status === 429) return { valid: false, error: 'Rate limit reached — please wait a moment before testing again.' };

    if (res.ok || res.status === 200) {
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content;
      if (text !== undefined) {
        return { valid: true };
      } else {
        return { valid: false, error: 'API responded successfully but the response format is unrecognized. Expected choices[0].message.content.' };
      }
    }

    return { valid: false, error: `API returned status ${res.status}.` };
  } catch (err) {
    if (err.name === 'AbortError' || err.name === 'TimeoutError') {
      return { valid: false, error: 'Connection timed out. Please check your network connection.' };
    }
    if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
      return { valid: false, error: 'Network error — cannot reach the server. Ensure npm run dev is running with the Vite proxy active.' };
    }
    return { valid: false, error: err.message || 'Unexpected network error.' };
  }
}

/**
 * Main code analysis orchestration.
 * Runs offline patterns first, then enhances with AI if a key is available.
 */
export async function analyzeCode(
  code,
  language,
  tone = 'friendly',
  apiKey = null,
  skillLevel = 'beginner',
  attemptCount = 0,
  aiConfig = {},
  analysisMode = 'auto'
) {
  // 1. Always run local patterns first (instant, offline-first)
  const localErrors = analyzeWithPatterns(code, language);

  // 2. Resolve the effective API key (settings > env)
  const effectiveKey = (apiKey || '').trim() || (import.meta.env.VITE_NVIDIA_API_KEY || '').trim();
  const canUseAI = !!effectiveKey && analysisMode !== 'offline';

  // 3. AI Enhancement Layer
  if (canUseAI) {
    try {
      const toneConfig = TONE_CONFIGS[tone] || TONE_CONFIGS.friendly;
      const toneInstruction = getToneInstruction(toneConfig);
      const skillInstruction = getSkillInstruction(skillLevel);

      const aiResult = await analyzeWithNvidia(
        code,
        language,
        toneInstruction,
        skillInstruction,
        skillLevel,
        effectiveKey,
        aiConfig
      );

      const mergedFixes = mergeAnalysisResults(localErrors, aiResult.fixes || aiResult.errors || []);
      const explanation = aiResult.explanation || aiResult.overallSummary || 'Here is the analysis of your code.';
      const confidence = aiResult.confidence || aiResult.confidenceMessage || getRandomConfidenceMessage();
      const suggestions = aiResult.suggestions || [getBeginnerTip(language)];

      return {
        source: 'ai',
        model: aiConfig.model || DEFAULT_AI_CONFIG.model,
        language,
        explanation,
        overallSummary: explanation,
        fixes: mergedFixes,
        errors: mergedFixes,
        improvedCode: aiResult.improvedCode || null,
        confidence,
        confidenceMessage: confidence,
        suggestions,
        beginnerTip: Array.isArray(suggestions) ? suggestions[0] : suggestions,
        skillLevel,
        attemptCount,
      };
    } catch (error) {
      // AI failed — fall through to offline with a user-visible note
      console.warn('[CodeLens] AI analysis unavailable:', error.message);
      const offlineResult = buildOfflineResult(code, language, localErrors, skillLevel, attemptCount);
      return {
        ...offlineResult,
        source: 'fallback',
        aiError: error.message.includes('parsed') || error.message.includes('format') || error.message.includes('JSON')
          ? 'AI analysis returned an unreadable response, so CodeLens used offline analysis instead.'
          : `AI Analysis Failed: ${error.message}. CodeLens used offline fallback.`,
      };
    }
  }

  // 4. Pure offline path
  return buildOfflineResult(code, language, localErrors, skillLevel, attemptCount);
}

function generateImprovedCodeLocally(code, language, localErrors) {
  const lines = code.split('\n');
  const errorMap = {};
  localErrors.forEach(err => {
    if (err.lineNumber) {
      if (!errorMap[err.lineNumber]) {
        errorMap[err.lineNumber] = [];
      }
      errorMap[err.lineNumber].push(err);
    }
  });

  const improvedLines = lines.map((line, idx) => {
    const lineNum = idx + 1;
    const errors = errorMap[lineNum];
    if (!errors) return line;

    let correctedLine = line;
    for (const err of errors) {
      const name = (err.errorName || '').toLowerCase();
      if (name.includes('colon')) {
        if (!correctedLine.trim().endsWith(':')) {
          correctedLine = correctedLine + ':';
        }
      } else if (name.includes('parentheses') || name.includes('print')) {
        const match = correctedLine.match(/(\s*print\s+)(.+)$/);
        if (match) {
          const indentAndPrint = match[1];
          let expr = match[2];
          const hasTrailingColon = expr.trim().endsWith(':');
          if (hasTrailingColon) {
            expr = expr.trim().slice(0, -1);
          }
          correctedLine = `${indentAndPrint}(${expr})${hasTrailingColon ? ':' : ''}`;
        }
      } else if (name.includes('assignment')) {
        correctedLine = correctedLine.replace(/(\bif\s+[^=!<>\s]+)\s*=\s*([^=!<>\s]+)/, '$1 == $2');
      } else if (name.includes('string')) {
        let inSingle = false;
        let inDouble = false;
        for (let j = 0; j < correctedLine.length; j++) {
          const ch = correctedLine[j];
          const prev = j > 0 ? correctedLine[j - 1] : '';
          if (prev === '\\') continue;
          if (ch === '"' && !inSingle) inDouble = !inDouble;
          if (ch === "'" && !inDouble) inSingle = !inSingle;
        }
        if (inDouble) correctedLine += '"';
        if (inSingle) correctedLine += "'";
      } else if (name.includes('semicolon')) {
        if (!correctedLine.trim().endsWith(';')) {
          correctedLine += ';';
        }
      } else if (name.includes('main')) {
        correctedLine = correctedLine.replace(/\bMain\b/, 'main');
      }
    }
    return correctedLine;
  });

  return improvedLines.join('\n');
}

export async function runOfflineAnalysis(code, language) {
  const errors = analyzeWithPatterns(code, language);

  if (errors.length === 0) {
    return {
      explanation: 'No syntax issues detected by pattern analysis. Your code structure looks correct! 🎉',
      fixes: [],
      improvedCode: null,
      confidence: "Your code is looking clean and well-structured. Great job! 👍",
      suggestions: [getBeginnerTip(language)],
    };
  }

  const explanation = errors.length === 1
    ? `Found 1 syntax issue — here's what happened and how to fix it.`
    : `Found ${errors.length} syntax issues — let's walk through each one.`;

  const improvedCode = generateImprovedCodeLocally(code, language, errors);

  return {
    explanation,
    fixes: errors,
    improvedCode,
    confidence: getRandomConfidenceMessage(),
    suggestions: [getBeginnerTip(language)],
  };
}

function buildOfflineResult(code, language, localErrors, skillLevel, attemptCount) {
  const explanation =
    localErrors.length === 0
      ? 'No syntax issues detected by pattern analysis. Your code structure looks correct! 🎉'
      : localErrors.length === 1
      ? "Found 1 syntax issue — here's what happened and how to fix it."
      : `Found ${localErrors.length} syntax issues — let's walk through each one.`;

  const improvedCode = localErrors.length > 0 ? generateImprovedCodeLocally(code, language, localErrors) : null;

  return {
    source: 'builtin',
    language,
    explanation,
    overallSummary: explanation,
    fixes: localErrors,
    errors: localErrors,
    improvedCode,
    confidence: getRandomConfidenceMessage(),
    confidenceMessage: getRandomConfidenceMessage(),
    suggestions: [getBeginnerTip(language)],
    beginnerTip: getBeginnerTip(language),
    skillLevel,
    attemptCount,
  };
}

/**
 * Step-by-Step line-by-line explanation generator
 */
export async function generateStepByStep(code, language, apiKey, aiConfig = {}, analysisMode = 'auto', analysis = null) {
  const effectiveKey = (apiKey || '').trim() || (import.meta.env.VITE_NVIDIA_API_KEY || '').trim();
  let steps;
  if (!effectiveKey || analysisMode === 'offline') {
    steps = generateLocalStepByStep(code, language, analysis);
  } else {
    try {
      steps = await generateStepByStepWithNvidia(code, language, effectiveKey, aiConfig);
      if (!Array.isArray(steps) || steps.length === 0) {
        throw new Error('Nvidia AI returned empty steps list.');
      }
    } catch (error) {
      console.warn('[CodeLens] Step-by-step AI failed:', error.message);
      steps = generateLocalStepByStep(code, language, analysis);
    }
  }

  // Ensure all steps are properly synchronized with detected errors and contain all 5 educational fields
  const errors = analysis && (analysis.fixes || analysis.errors) ? (analysis.fixes || analysis.errors) : [];
  
  return steps.map((step) => {
    const lineError = errors.find((e) => e.lineNumber === step.line);
    if (lineError) {
      let derivedCorrected = step.corrected;
      if (!derivedCorrected && lineError.fix) {
        const match = lineError.fix.match(/`([^`]+)`/);
        if (match) {
          derivedCorrected = match[1];
        }
      }
      return {
        ...step,
        // Step 1 data — intent (uses step.description, already filled)
        description: step.description || 'Executes this line of code as part of your program.',
        // Step 2 data — where issue occurred (uses step.mistake)
        mistake: step.mistake || lineError.simple || lineError.errorName || 'A syntax issue was detected on this line.',
        // Step 3 data — why it happened
        whyMistake: step.whyMistake || lineError.why || "The syntax doesn't follow the language rules.",
        // Step 4 data — how to fix
        fix: step.fix || lineError.fix || 'Review the syntax of this line.',
        // Step 5 data — corrected code
        corrected: derivedCorrected || null,
        // Prevention tip (shown in Step 5 note)
        avoid: step.avoid || lineError.avoid || 'Pay close attention to syntax rules in the future.',
      };
    }
    return step;
  });
}

function generateLocalStepByStep(code, language = 'Python', analysis = null) {
  console.log(`[CodeLens] Generating local step-by-step for ${language}`);
  const lines = code.split('\n');
  const errors = analysis && (analysis.fixes || analysis.errors) ? (analysis.fixes || analysis.errors) : [];
  const improvedCode = analysis?.improvedCode || generateImprovedCodeLocally(code, language, errors);
  const improvedLines = improvedCode ? improvedCode.split('\n') : [];

  return lines
    .map((line, i) => {
      const lineNum = i + 1;
      const trimmed = line.trim();
      
      const step = {
        line: lineNum,
        code: line,
        description: null,
        why: null,
        mistake: null,
        whyMistake: null,
        fix: null,
        corrected: null,
        avoid: null,
        variables: null,
        simple: null,
        analogy: null
      };

      if (!trimmed) {
        return null;
      }

      const lineError = errors.find(e => e.lineNumber === lineNum);

      let matched = false;

      // 1. Comments
      if (trimmed.startsWith('#') || trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
        step.description = 'Comment — for documentation';
        step.why = 'Explains the purpose or logic of the code to human readers without execution.';
        step.simple = 'This line is a comment. It is ignored by the computer and is used only to leave notes for humans.';
        step.analogy = 'Like writing a sticky note in a cookbook to remind yourself of a tip, without changing the actual recipe.';
        matched = true;
      }

      // 2. Variable assignments
      if (!matched) {
        const pyVarMatch = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.*)$/);
        const jsVarMatch = trimmed.match(/^(?:let|const|var|int|float|double|char|String)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.*)$/);
        const varMatch = pyVarMatch || jsVarMatch;
        if (varMatch) {
          const varName = varMatch[1];
          let varVal = varMatch[2];
          if (varVal.endsWith(';')) varVal = varVal.slice(0, -1);
          step.description = `Assigns a value to the variable '${varName}'.`;
          step.why = 'To store data so it can be referenced or modified later in the program.';
          step.variables = `Declares or updates '${varName}' to: ${varVal.trim()}`;
          step.simple = `We are creating a variable (a container) named '${varName}' and putting the value '${varVal.trim()}' inside it.`;
          step.analogy = `Like writing a phone number on a sticky note and labeling it 'JohnsPhone' so you can use it later.`;
          matched = true;
        }
      }

      // 3. Function declarations
      if (!matched) {
        const pyFuncMatch = trimmed.match(/^def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\((.*)\)/);
        const jsFuncMatch = trimmed.match(/^function\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\((.*)\)/);
        const funcMatch = pyFuncMatch || jsFuncMatch;
        if (funcMatch) {
          const funcName = funcMatch[1];
          const params = funcMatch[2];
          step.description = `Defines a function named '${funcName}' taking parameters: ${params || 'none'}.`;
          step.why = 'To group reusable code blocks into a single named block that can be run whenever needed.';
          step.simple = `Creates a custom recipe named '${funcName}'. When we call it with inputs (${params || 'none'}), it runs the steps inside.`;
          step.analogy = `Like a 'Make Coffee' button on a machine. You set up the steps once, and then you just press the button (call the function) to get coffee.`;
          matched = true;
        }
      }

      // 4. Loops
      if (!matched) {
        const forMatch = trimmed.match(/^for\s+(.*)/);
        const whileMatch = trimmed.match(/^while\s+(.*)/);
        if (forMatch) {
          step.description = `Begins a 'for' loop to iterate over elements.`;
          step.why = 'To repeat a block of code a set number of times or for each item in a collection.';
          step.simple = 'This loop goes through a list or sequence of items one-by-one, running the code inside for each item.';
          step.analogy = 'Like a postman delivering letters to a row of houses: they visit each house one-by-one until done.';
          matched = true;
        } else if (whileMatch) {
          step.description = `Begins a 'while' loop that repeats as long as the condition is true.`;
          step.why = 'To repeat code dynamically until a specific condition changes.';
          step.simple = 'This loop keeps repeating a block of code over and over as long as a certain condition remains true.';
          step.analogy = 'Like washing dishes: as long as there is still a dirty dish in the sink, you keep washing.';
          matched = true;
        }
      }

      // 5. Conditions
      if (!matched) {
        const ifMatch = trimmed.match(/^if\s+(.*)/);
        const elifMatch = trimmed.match(/^elif\s+(.*)/) || trimmed.match(/^else\s+if\s+(.*)/);
        const elseMatch = trimmed.match(/^else\s*:/) || trimmed.match(/^else\b/);
        if (ifMatch) {
          step.description = `Checks a condition to decide whether to execute the block below.`;
          step.why = 'To enable decision-making in the program by running different code based on dynamic values.';
          step.simple = 'If this check is true, the computer runs the code inside; otherwise, it skips it.';
          step.analogy = 'Like making a decision: "If it is raining outside, open your umbrella."';
          matched = true;
        } else if (elifMatch) {
          step.description = `Checks an alternative condition if the previous conditions were false.`;
          step.why = 'To handle multiple distinct cases in a conditional branching sequence.';
          step.simple = 'If the first check was false, check this backup condition instead.';
          step.analogy = 'Like a backup plan: "If it is not raining, but it is sunny, wear sunglasses."';
          matched = true;
        } else if (elseMatch) {
          step.description = `Executes this block if all previous conditions were false.`;
          step.why = 'To provide a fallback or default action when no other criteria are met.';
          step.simple = 'If none of the checks above were true, run this default block of code.';
          step.analogy = 'Like the default choice: "If it is neither raining nor sunny, just walk outside normally."';
          matched = true;
        }
      }

      // 6. Return statements
      if (!matched) {
        const returnMatch = trimmed.match(/^return\s*(.*)/);
        if (returnMatch) {
          const retVal = returnMatch[1].replace(/;$/, '').trim();
          step.description = `Exits the current function and returns a value.`;
          step.why = "To output the result of the function's calculations to the code that called it.";
          step.simple = 'Stops running the function and sends the computed result back to where the function was called.';
          step.analogy = 'Like a vending machine: you insert coins (parameters) and it returns a snack (the return value).';
          if (retVal) {
            step.variables = `Returns value/expression: ${retVal}`;
          }
          matched = true;
        }
      }

      // 7. Output/Print statements
      if (!matched) {
        const printMatch = trimmed.match(/^(?:print|console\.log|printf|System\.out\.println)\s*\(?(.*?)\)?;?$/);
        if (printMatch && !trimmed.startsWith('def') && !trimmed.startsWith('function')) {
          step.description = `Outputs information to the screen or console.`;
          step.why = 'To display results, messages, or debug values so they are visible to the user.';
          step.simple = 'This prints text or values to the screen so we can see what the program is doing.';
          step.analogy = 'Like a scoreboard in a stadium showing the current score to the crowd.';
          matched = true;
        }
      }

      // 8. Import statements
      if (!matched) {
        const importMatch = trimmed.match(/^(?:import|require|#include)\s+(.*)/);
        if (importMatch) {
          step.description = `Imports external module or header file.`;
          step.why = 'To bring in pre-written libraries and reuse code modules instead of writing them from scratch.';
          step.simple = 'Loads a library or another code file so we can use its functions in our current program.';
          step.analogy = 'Like borrowing a specialized toolbox from a friend instead of building the tools yourself.';
          matched = true;
        }
      }

      // If we didn't match any pattern, we provide generic explanation (never skip lines!)
      if (!matched) {
        step.description = 'Executes this statement.';
        step.why = 'Performs a step in the program sequence.';
        step.simple = 'Runs this line of code.';
        step.analogy = 'Like taking a step forward in a series of instructions.';
      }

      // Apply line error overrides at the end
      if (lineError) {
        step.mistake = lineError.simple || lineError.errorName || 'A syntax issue was detected on this line.';
        step.fix = lineError.fix || 'Review the syntax of this line.';
        step.whyMistake = lineError.why || "The syntax doesn't follow the language rules.";
        step.avoid = lineError.avoid || 'Review spelling and language rules before writing complex blocks.';
        if (lineError.why) {
          step.why = lineError.why;
        }
        
        // Sync corrected line
        if (improvedLines[i] !== undefined && improvedLines[i] !== line) {
          step.corrected = improvedLines[i];
        } else if (lineError.fix) {
          const match = lineError.fix.match(/`([^`]+)`/);
          if (match) {
            step.corrected = match[1];
          }
        }
        if (!step.corrected && lineError.fix) {
          step.corrected = line;
        }
        
        // Also map simple and analogy if it was an error
        step.simple = step.simple || lineError.simple;
        if (lineError.why && lineError.why.toLowerCase().includes('colon')) {
          step.analogy = 'Think of the colon like opening a door for the block of code underneath.';
        } else if (lineError.why && lineError.why.toLowerCase().includes('parenthes')) {
          step.analogy = 'Like opening a pair of hands to catch a ball, but forgetting to close them. The data falls through!';
        } else if (lineError.why && lineError.why.toLowerCase().includes('bracket')) {
          step.analogy = 'Like putting on only one shoe before walking out the door — you need the matching one to complete the pair.';
        }
      }

      return step;
    })
    .filter(Boolean);
}


/**
 * Chat panel question answering
 */
export async function chatAboutCode(code, language, question, apiKey, aiConfig = {}, analysisMode = 'auto', classification = null, getLocalFallback = null) {
  const effectiveKey = (apiKey || '').trim() || (import.meta.env.VITE_NVIDIA_API_KEY || '').trim();
  if (!effectiveKey || analysisMode === 'offline') {
    if (getLocalFallback && classification) {
      return { response: getLocalFallback() };
    }
    return {
      response:
        'To use AI chat, add your Nvidia API key in Settings → AI Provider, or set VITE_NVIDIA_API_KEY in your .env file.',
    };
  }
  try {
    return await chatAboutCodeWithNvidia(code, language, question, effectiveKey, aiConfig, classification);
  } catch (error) {
    if (getLocalFallback && classification) {
      return { response: getLocalFallback() };
    }
    return {
      response: `I encountered an issue connecting to AI: ${error.message}. Please check your API key and network, then try again.`,
    };
  }
}

// ==========================================
// MODULAR AI SERVICES
// ==========================================

export function localAnalyzer(code, language, skillLevel = 'beginner', attemptCount = 0) {
  const localErrors = analyzeWithPatterns(code, language);
  return buildOfflineResult(code, language, localErrors, skillLevel, attemptCount);
}

export async function aiExplainError(code, language, errorName, lineNumber, localExplanation, suggestedFix, tone, skillLevel, apiKey, aiConfig) {
  const effectiveKey = (apiKey || '').trim() || (import.meta.env.VITE_NVIDIA_API_KEY || '').trim();
  if (!effectiveKey) throw new Error('No API key available');
  
  const toneConfig = TONE_CONFIGS[tone] || TONE_CONFIGS.friendly;
  const toneInstruction = getToneInstruction(toneConfig);
  const skillInstruction = getSkillInstruction(skillLevel);

  return requestAiExplainError(code, language, errorName, lineNumber, localExplanation, suggestedFix, toneInstruction, skillInstruction, effectiveKey, aiConfig);
}

export async function aiTranslateBilingual(localExplanation, language, tone, apiKey, aiConfig) {
  const effectiveKey = (apiKey || '').trim() || (import.meta.env.VITE_NVIDIA_API_KEY || '').trim();
  if (!effectiveKey) throw new Error('No API key available');

  const toneConfig = TONE_CONFIGS[tone] || TONE_CONFIGS.friendly;
  const toneInstruction = getToneInstruction(toneConfig);

  return requestAiTranslateBilingual(localExplanation, language, toneInstruction, effectiveKey, aiConfig);
}

export async function aiGenerateCorrectedCode(code, language, errorSummary, apiKey, aiConfig) {
  const effectiveKey = (apiKey || '').trim() || (import.meta.env.VITE_NVIDIA_API_KEY || '').trim();
  if (!effectiveKey) throw new Error('No API key available');

  return requestAiGenerateCorrectedCode(code, language, errorSummary, effectiveKey, aiConfig);
}

export async function aiConfidenceMessage(errorSummary, tone, apiKey, aiConfig) {
  const effectiveKey = (apiKey || '').trim() || (import.meta.env.VITE_NVIDIA_API_KEY || '').trim();
  if (!effectiveKey) throw new Error('No API key available');

  const toneConfig = TONE_CONFIGS[tone] || TONE_CONFIGS.friendly;
  const toneInstruction = getToneInstruction(toneConfig);

  return requestAiConfidenceMessage(errorSummary, toneInstruction, effectiveKey, aiConfig);
}
