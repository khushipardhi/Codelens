/**
 * Adaptive Learning Engine for CodeLens
 *
 * Manages:
 * - User skill level detection (Beginner / Intermediate / Advanced)
 * - Progressive assistance (hints → explanations → deep help)
 * - Confusion pattern tracking (loops, functions, arrays, etc.)
 * - Attempt tracking per error type
 * - Concept help suggestions
 */

const STORAGE_KEY = 'codelens_adaptive';

// ---- Topic categories for confusion detection ----
const TOPIC_KEYWORDS = {
  loops: ['for', 'while', 'loop', 'iteration', 'iterate', 'range', 'foreach', 'do-while'],
  functions: ['def', 'function', 'func', 'return', 'parameter', 'argument', 'call', 'invoke', 'lambda'],
  arrays: ['array', 'list', 'index', 'element', 'push', 'pop', 'slice', 'splice', 'append', 'vector'],
  conditions: ['if', 'else', 'elif', 'switch', 'case', 'ternary', 'condition', 'boolean'],
  classes: ['class', 'object', 'instance', 'self', 'this', 'constructor', 'method', 'inheritance', 'extends'],
  recursion: ['recursion', 'recursive', 'base case', 'stack overflow', 'call stack'],
  pointers: ['pointer', 'reference', 'address', 'dereference', 'null', 'nullptr', 'memory', 'malloc'],
  strings: ['string', 'concat', 'substring', 'charAt', 'split', 'join', 'format', 'template'],
  types: ['type', 'cast', 'convert', 'int', 'float', 'string', 'boolean', 'TypeError'],
  syntax: ['syntax', 'semicolon', 'bracket', 'parenthesis', 'colon', 'indent', 'brace'],
};

// ---- Skill level definitions ----
export const SKILL_LEVELS = {
  beginner: {
    label: 'Beginner',
    icon: '🌱',
    color: '#2dd4a8',
    description: 'Learning fundamentals',
  },
  intermediate: {
    label: 'Intermediate',
    icon: '🌿',
    color: '#4d7cfe',
    description: 'Building confidence',
  },
  advanced: {
    label: 'Advanced',
    icon: '🌳',
    color: '#7c5cfc',
    description: 'Refining skills',
  },
};

// ---- Progressive assistance levels ----
export const ASSISTANCE_LEVELS = {
  hint: {
    label: 'Hint',
    depth: 1,
    description: 'Small nudge in the right direction',
  },
  explain: {
    label: 'Explanation',
    depth: 2,
    description: 'Clear explanation with context',
  },
  deep: {
    label: 'Deep Help',
    depth: 3,
    description: 'Full walkthrough with concept help',
  },
};

// ---- Default adaptive state ----
function getDefaultState() {
  return {
    // Detected skill level
    skillLevel: 'beginner',
    // Total analyses performed
    totalAnalyses: 0,
    // Error type frequencies: { errorName: count }
    errorFrequency: {},
    // Topic confusion counts: { topic: { attempts: n, resolved: n, lastSeen: timestamp } }
    topicConfusion: {},
    // Current session attempts for progressive assistance: { codeHash: attemptCount }
    sessionAttempts: {},
    // Languages used: { language: count }
    languageUsage: {},
    // Average code complexity (line count, nesting depth)
    avgComplexity: 0,
    // Timestamps of recent analyses
    recentTimestamps: [],
    // Concept help offered: { topic: { offered: bool, accepted: bool, timestamp } }
    conceptHelpHistory: {},
  };
}

/**
 * Load adaptive state from localStorage.
 */
export function loadAdaptiveState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...getDefaultState(), ...JSON.parse(saved) };
    }
  } catch { /* ignore */ }
  return getDefaultState();
}

/**
 * Save adaptive state to localStorage.
 */
export function saveAdaptiveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

/**
 * Generate a simple hash of code for tracking retries.
 */
function codeHash(code) {
  // Simple hash: first 100 chars + length
  const trimmed = code.trim().replace(/\s+/g, ' ');
  return `${trimmed.substring(0, 100)}_${trimmed.length}`;
}

/**
 * Estimate code complexity.
 */
function estimateComplexity(code) {
  const lines = code.split('\n').filter(l => l.trim()).length;
  const nestingMatches = code.match(/[{(]/g) || [];
  const controlFlow = code.match(/\b(if|else|for|while|switch|try|catch|def|function|class)\b/g) || [];
  return Math.min(10, (lines / 5) + (nestingMatches.length / 3) + (controlFlow.length / 2));
}

/**
 * Detect topics present in ERROR descriptions only.
 * IMPORTANT: We do NOT scan the code itself — only the error messages.
 * This prevents false confusion tracking when code simply contains
 * keywords like 'for', 'if', 'def', etc.
 */
function detectTopics(code, errors = []) {
  // Only scan error descriptions, NOT the source code
  if (errors.length === 0) return [];

  const errorText = errors.map(e => `${e.errorName || ''} ${e.simple || ''} ${e.why || ''}`).join(' ').toLowerCase();
  const detected = [];

  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    for (const keyword of keywords) {
      if (errorText.includes(keyword.toLowerCase())) {
        detected.push(topic);
        break;
      }
    }
  }

  return [...new Set(detected)];
}

/**
 * Detect user skill level based on behavior patterns.
 */
export function detectSkillLevel(state) {
  let score = 0;

  // Factor 1: Number of analyses (experience)
  if (state.totalAnalyses > 50) score += 3;
  else if (state.totalAnalyses > 20) score += 2;
  else if (state.totalAnalyses > 5) score += 1;

  // Factor 2: Code complexity
  if (state.avgComplexity > 6) score += 3;
  else if (state.avgComplexity > 3) score += 2;
  else score += 0;

  // Factor 3: Error frequency (fewer repeated errors = more advanced)
  const totalErrors = Object.values(state.errorFrequency).reduce((s, c) => s + c, 0);
  const uniqueErrors = Object.keys(state.errorFrequency).length;
  const repeatRatio = totalErrors > 0 ? uniqueErrors / totalErrors : 1;
  if (repeatRatio > 0.7) score += 2;
  else if (repeatRatio > 0.4) score += 1;

  // Factor 4: Language diversity
  const langCount = Object.keys(state.languageUsage).length;
  if (langCount >= 4) score += 2;
  else if (langCount >= 2) score += 1;

  // Factor 5: Topic confusion (fewer confused topics = more advanced)
  const confusedTopics = Object.entries(state.topicConfusion)
    .filter(([, data]) => data.attempts > 3 && data.resolved < data.attempts * 0.5);
  if (confusedTopics.length === 0) score += 2;
  else if (confusedTopics.length <= 2) score += 1;

  // Determine level
  if (score >= 9) return 'advanced';
  if (score >= 5) return 'intermediate';
  return 'beginner';
}

/**
 * Get the current assistance level for a piece of code (progressive assistance).
 */
export function getAssistanceLevel(state, code) {
  const hash = codeHash(code);
  const attempts = state.sessionAttempts[hash] || 0;

  if (attempts <= 0) return 'hint';
  if (attempts <= 1) return 'explain';
  return 'deep';
}

/**
 * Get a progressive hint message based on attempt count.
 */
export function getProgressiveMessage(attemptCount) {
  if (attemptCount <= 0) {
    return {
      level: 'hint',
      message: 'Small issue detected. Try looking at the highlighted area.',
      showDetails: false,
      offerConceptHelp: false,
    };
  }
  if (attemptCount === 1) {
    return {
      level: 'explain',
      message: "This area might still need a small adjustment. Let's look at it together.",
      showDetails: true,
      offerConceptHelp: false,
    };
  }
  return {
    level: 'deep',
    message: 'Would you like a deeper explanation of this concept?',
    showDetails: true,
    offerConceptHelp: true,
  };
}

/**
 * Check if concept help should be offered for any confused topics.
 */
export function getConfusionSuggestions(state) {
  const suggestions = [];

  for (const [topic, data] of Object.entries(state.topicConfusion)) {
    const wasOffered = state.conceptHelpHistory[topic]?.offered;
    const wasAccepted = state.conceptHelpHistory[topic]?.accepted;

    // Only offer if: failed 5+ times on this topic, resolution rate < 30%, and not recently offered
    const resolutionRate = data.attempts > 0 ? data.resolved / data.attempts : 1;
    if (data.attempts >= 5 && resolutionRate < 0.3 && (!wasOffered || (!wasAccepted && data.attempts > (state.conceptHelpHistory[topic]?.attemptsAtOffer || 0) + 3))) {
      suggestions.push({
        topic,
        attempts: data.attempts,
        message: `We noticed you've had a few ${topic}-related issues. Would you like a quick concept refresher?`,
      });
    }
  }

  return suggestions;
}

/**
 * Update adaptive state after an analysis.
 */
export function updateAdaptiveState(state, code, language, errors) {
  const newState = { ...state };

  // Increment analysis count
  newState.totalAnalyses = (newState.totalAnalyses || 0) + 1;

  // Track code attempts (progressive assistance)
  const hash = codeHash(code);
  newState.sessionAttempts = { ...newState.sessionAttempts };
  newState.sessionAttempts[hash] = (newState.sessionAttempts[hash] || 0) + 1;

  // Track error frequency
  newState.errorFrequency = { ...newState.errorFrequency };
  for (const error of errors) {
    const key = error.errorName || 'unknown';
    newState.errorFrequency[key] = (newState.errorFrequency[key] || 0) + 1;
  }

  // Track language usage
  newState.languageUsage = { ...newState.languageUsage };
  newState.languageUsage[language] = (newState.languageUsage[language] || 0) + 1;

  // Update complexity average
  const complexity = estimateComplexity(code);
  newState.avgComplexity = newState.totalAnalyses === 1
    ? complexity
    : (newState.avgComplexity * 0.8) + (complexity * 0.2);

  // Track topic confusion
  const topics = detectTopics(code, errors);
  newState.topicConfusion = { ...newState.topicConfusion };
  for (const topic of topics) {
    if (!newState.topicConfusion[topic]) {
      newState.topicConfusion[topic] = { attempts: 0, resolved: 0, lastSeen: null };
    }
    newState.topicConfusion[topic] = {
      ...newState.topicConfusion[topic],
      attempts: newState.topicConfusion[topic].attempts + (errors.length > 0 ? 1 : 0),
      resolved: newState.topicConfusion[topic].resolved + (errors.length === 0 ? 1 : 0),
      lastSeen: Date.now(),
    };
  }

  // Track timestamps
  newState.recentTimestamps = [Date.now(), ...(newState.recentTimestamps || [])].slice(0, 20);

  // Re-detect skill level
  newState.skillLevel = detectSkillLevel(newState);

  return newState;
}

/**
 * Mark concept help as offered for a topic.
 */
export function markConceptHelpOffered(state, topic) {
  const newState = { ...state };
  newState.conceptHelpHistory = { ...newState.conceptHelpHistory };
  newState.conceptHelpHistory[topic] = {
    ...(newState.conceptHelpHistory[topic] || {}),
    offered: true,
    attemptsAtOffer: newState.topicConfusion[topic]?.attempts || 0,
    timestamp: Date.now(),
  };
  return newState;
}

/**
 * Mark concept help as accepted for a topic.
 */
export function markConceptHelpAccepted(state, topic) {
  const newState = { ...state };
  newState.conceptHelpHistory = { ...newState.conceptHelpHistory };
  newState.conceptHelpHistory[topic] = {
    ...(newState.conceptHelpHistory[topic] || {}),
    accepted: true,
    timestamp: Date.now(),
  };
  return newState;
}

/**
 * Reset session attempts (e.g., when user writes completely new code).
 */
export function resetSessionAttempts(state) {
  return { ...state, sessionAttempts: {} };
}

/**
 * Get skill-level-appropriate explanation depth config.
 */
export function getExplanationConfig(skillLevel) {
  switch (skillLevel) {
    case 'advanced':
      return {
        showWhy: false,         // Hide "why" by default (show on demand)
        showAvoid: false,       // Hide "avoid" by default
        showComfort: false,     // Minimal comfort messages
        summaryStyle: 'concise',
        detailOnDemand: true,   // Let user expand for more detail
      };
    case 'intermediate':
      return {
        showWhy: true,
        showAvoid: false,       // Show on demand
        showComfort: true,
        summaryStyle: 'balanced',
        detailOnDemand: true,
      };
    case 'beginner':
    default:
      return {
        showWhy: true,
        showAvoid: true,
        showComfort: true,
        summaryStyle: 'detailed',
        detailOnDemand: false,  // Show everything immediately
      };
  }
}
