/**
 * CodeLens — Root Application Component
 * ========================================
 * Manages global state and composes the main workspace layout.
 *
 * Architecture:
 * - Offline-first: pattern analysis runs instantly before any AI call
 * - Adaptive engine: auto-adjusts explanation depth based on skill level
 * - Debounced language detection: 300ms delay to avoid excessive re-renders
 * - All sensitive settings (API key, mode) live in the Settings modal
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Sparkles, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import Navbar from './components/Navbar/Navbar';
import CodeEditor from './components/CodeEditor/CodeEditor';
import ExplanationPanel from './components/ExplanationPanel/ExplanationPanel';
import ToneSelector from './components/ToneSelector/ToneSelector';
import SettingsModal from './components/SettingsModal/SettingsModal';
import ChatAssistant from './components/ChatAssistant/ChatAssistant';
import ConceptHelp from './components/ConceptHelp/ConceptHelp';
import AboutCodeLens from './components/AboutCodeLens/AboutCodeLens';
import CorrectedCodeModal from './components/CorrectedCodeModal/CorrectedCodeModal';
import { useSettings, useAnalysisHistory } from './hooks/useSettings';
import { detectLanguage } from './services/languageDetector';
import {
  DEFAULT_AI_CONFIG,
  validateApiKey,
  localAnalyzer,
  aiExplainError,
  aiTranslateBilingual,
  aiGenerateCorrectedCode,
  aiConfidenceMessage,
  generateStepByStep,
} from './services/aiService';
import {
  loadAdaptiveState,
  saveAdaptiveState,
  updateAdaptiveState,
  getConfusionSuggestions,
  markConceptHelpAccepted,
} from './services/adaptiveEngine';
import './App.css';

// Sample code with intentional errors for quick demo
const SAMPLE_CODE = `def calculate_average(numbers):
    total = 0
    for num in numbers
        total += num
    average = total / len(numbers)
    return average

scores = [85, 92, 78, 95, 88]
print(calculate_average(scores))
print "Done calculating"`;

/** How long to wait after the user stops typing before detecting language (ms) */
const LANG_DETECT_DEBOUNCE_MS = 300;

export default function App() {
  const { settings, updateSetting, toggleTheme } = useSettings();
  const { addEntry } = useAnalysisHistory();
  const hasAiProxy = Boolean(import.meta.env.VITE_API_PROXY_URL);

  // ---- UI state ----
  const [showAbout, setShowAbout] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showConceptHelp, setShowConceptHelp] = useState(false);
  const [conceptHelpTopic, setConceptHelpTopic] = useState(null);

  // --- STATE ---
  // Core functionality
  const [code, setCode] = useState(SAMPLE_CODE);
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // AI Enhancement state
  const [isEnhancingExplanation, setIsEnhancingExplanation] = useState(false);
  const [aiEnhancementError, setAiEnhancementError] = useState(null);
  const [correctedCode, setCorrectedCode] = useState(null);
  const [isLoadingCorrectedCode, setIsLoadingCorrectedCode] = useState(false);
  const [correctedCodeError, setCorrectedCodeError] = useState(null);
  const [showCorrectedCodeModal, setShowCorrectedCodeModal] = useState(false);

  // Layout / UI State
  const [stepByStepData, setStepByStepData] = useState(null);
  const [isLoadingSteps, setIsLoadingSteps] = useState(false);
  const [selectedLineInfo, setSelectedLineInfo] = useState(null);

  // Diagnostics state
  const [diagnostics, setDiagnostics] = useState({
    lastDurationMs: 0,
    lastSource: null,
    lastError: null,
    proxyActive: !!import.meta.env.VITE_API_PROXY_URL,
  });

  // ---- Toast Notification ----
  const [toast, setToast] = useState(null); // { message, type: 'success'|'error'|'info', action? }
  const toastTimerRef = useRef(null);

  const showToast = useCallback((message, type = 'info', action = null) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type, action, fading: false });
    toastTimerRef.current = setTimeout(() => {
      setToast(prev => prev ? { ...prev, fading: true } : null);
      setTimeout(() => setToast(null), 300);
    }, 4000);
  }, []);

  const dismissToast = useCallback(() => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(prev => prev ? { ...prev, fading: true } : null);
    setTimeout(() => setToast(null), 300);
  }, []);

  const handleReconnect = useCallback(async () => {
    const keyToTest = settings.apiKey || DEFAULT_AI_CONFIG.apiKey;
    if (!keyToTest && !hasAiProxy) {
      showToast('No API key configured. Open Settings to set one.', 'error');
      return;
    }
    showToast('Reconnecting to AI...', 'info');
    try {
      const result = await validateApiKey(keyToTest, settings.aiBaseUrl || DEFAULT_AI_CONFIG.baseUrl);
      if (result.valid) {
        showToast('AI Connected Successfully', 'success');
        updateSetting('analysisMode', 'ai');
      } else {
        showToast('Connection failed. Check your API key or endpoint.', 'error', {
          label: 'Retry',
          onClick: handleReconnect,
        });
      }
    } catch (err) {
      showToast(`Connection failed: ${err.message}`, 'error', {
        label: 'Retry',
        onClick: handleReconnect,
      });
    }
  }, [settings.apiKey, settings.aiBaseUrl, updateSetting, showToast, hasAiProxy]);

  // ---- Startup API Connection Auto-Verification ----
  const hasInitializedRef = useRef(false);
  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    const startupVerify = async () => {
      const keyToTest = settings.apiKey || DEFAULT_AI_CONFIG.apiKey;
      if (settings.analysisMode === 'ai' && (keyToTest || hasAiProxy)) {
        try {
          const result = await validateApiKey(keyToTest, settings.aiBaseUrl || DEFAULT_AI_CONFIG.baseUrl);
          if (!result.valid) {
            setDiagnostics(prev => ({
              ...prev,
              lastError: result.error || 'Connection failed during startup verification',
            }));
            showToast('AI connection offline. Verify your API key or connection.', 'error', {
              label: 'Reconnect',
              onClick: handleReconnect,
            });
          }
        } catch (err) {
          setDiagnostics(prev => ({
            ...prev,
            lastError: err.message || 'Connection error during startup verification',
          }));
          showToast(`AI connection offline: ${err.message || 'Error'}`, 'error', {
            label: 'Reconnect',
            onClick: handleReconnect,
          });
        }
      }
    };
    startupVerify();
  }, [settings.analysisMode, settings.apiKey, settings.aiBaseUrl, handleReconnect, showToast, hasAiProxy]);

  // ---- Debounced language detection ----
  const [detectedLanguage, setDetectedLanguage] = useState(() => detectLanguage(''));
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDetectedLanguage(detectLanguage(code));
    }, LANG_DETECT_DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [code]);

  // ---- Global Mouse Tracker for spotlight glow ----
  useEffect(() => {
    let frameId;

    const handleMouseMove = (e) => {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        let current = e.target;
        const updates = [];
        
        // Phase 1: Reads (avoid layout thrashing)
        while (current && current !== document.body) {
          if (current.classList && (
            current.classList.contains('glow-card') ||
            current.classList.contains('glow-btn') ||
            current.classList.contains('glow-section') ||
            current.classList.contains('panel-section') ||
            current.classList.contains('error-card') ||
            current.classList.contains('feature-item-card') ||
            current.classList.contains('about-hero') ||
            current.classList.contains('hero-mockup-wrapper') ||
            current.classList.contains('visual-story-card') ||
            current.classList.contains('showcase-card') ||
            current.classList.contains('timeline-card') ||
            current.classList.contains('about-footer-cta') ||
            current.classList.contains('settings-modal') ||
            current.classList.contains('chat-panel')
          )) {
            const rect = current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            updates.push({ el: current, x, y });
          }
          current = current.parentElement;
        }
        
        // Phase 2: Writes
        for (const { el, x, y } of updates) {
          el.style.setProperty('--mouse-x', `${x}px`);
          el.style.setProperty('--mouse-y', `${y}px`);
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);



  // ---- Adaptive learning state ----
  const [adaptiveState, setAdaptiveState] = useState(() => {
    const state = loadAdaptiveState();
    // Clear stale confusion data from old sessions
    state.topicConfusion = {};
    saveAdaptiveState(state);
    return state;
  });

  // ---- Derived values ----
  const aiConfig = useMemo(() => ({
    provider: settings.aiProvider || DEFAULT_AI_CONFIG.provider,
    model: settings.aiModel || DEFAULT_AI_CONFIG.model,
    baseUrl: settings.aiBaseUrl || DEFAULT_AI_CONFIG.baseUrl,
  }), [settings.aiProvider, settings.aiModel, settings.aiBaseUrl]);

  const activeApiKey = settings.analysisMode === 'ai'
    ? settings.apiKey || DEFAULT_AI_CONFIG.apiKey || null
    : null;

  // Error lines for Monaco gutter decoration
  const errorLines = useMemo(() => {
    if (!analysis?.errors) return [];
    return analysis.errors
      .filter((e) => e.lineNumber != null)
      .map((e) => e.lineNumber);
  }, [analysis]);

  // Current attempt count for progressive assistance
  const currentAttemptCount = useMemo(() => {
    if (!code.trim()) return 0;
    const hash = code.trim().replace(/\s+/g, ' ');
    const key = `${hash.substring(0, 100)}_${hash.length}`;
    return adaptiveState.sessionAttempts[key] || 0;
  }, [code, adaptiveState.sessionAttempts]);

  // Confusion suggestions (only when analysis exists)
  const confusionSuggestions = useMemo(
    () => getConfusionSuggestions(adaptiveState),
    [adaptiveState]
  );

  // ---- Handlers ----

  /** Run code analysis (offline pattern check + optional AI) */
  const handleAnalyze = useCallback(async () => {
    if (!code.trim()) return;

    setIsAnalyzing(true);
    setAnalysis(null);
    setStepByStepData(null);
    setSelectedLineInfo(null);
    
    // Reset AI state
    setIsEnhancingExplanation(false);
    setAiEnhancementError(null);
    setCorrectedCode(null);
    setCorrectedCodeError(null);

    const startTime = performance.now();
    try {
      const lang = detectedLanguage.language;
      const localResult = localAnalyzer(code, lang, adaptiveState.skillLevel, currentAttemptCount);
      setAnalysis(localResult);
      setIsAnalyzing(false); // Done analyzing locally, show UI immediately

      const endTime = performance.now();
      const durationMs = Math.round(endTime - startTime);

      setDiagnostics(prev => ({
        ...prev,
        lastDurationMs: durationMs,
        lastSource: 'offline',
        lastError: null,
      }));

      // Update adaptive learning profile
      const newState = updateAdaptiveState(adaptiveState, code, lang, localResult.errors || []);
      setAdaptiveState(newState);
      saveAdaptiveState(newState);

      // Record in history
      addEntry({
        language: lang,
        errorCount: localResult.errors?.length || 0,
        source: 'offline',
        skillLevel: newState.skillLevel,
      });

      // --- AUTO-TRIGGER LINE-BY-LINE EXPLANATION ---
      setIsLoadingSteps(true);
      generateStepByStep(code, lang, activeApiKey, aiConfig, settings.analysisMode || 'auto', localResult)
        .then(steps => {
          setStepByStepData(Array.isArray(steps) ? steps : []);
        })
        .catch(err => {
          console.warn('[CodeLens] Auto step-by-step generation failed:', err.message);
          setStepByStepData([]);
        })
        .finally(() => {
          setIsLoadingSteps(false);
        });

      // --- AI ENHANCEMENT ---
      const effectiveKey = (activeApiKey || '').trim() || (import.meta.env.VITE_NVIDIA_API_KEY || '').trim();
      const canUseAI = (Boolean(effectiveKey) || hasAiProxy) && settings.analysisMode !== 'offline';

      if (canUseAI) {
        setIsEnhancingExplanation(true);
        
        if (localResult.errors.length > 0) {
          try {
            const confidencePromise = aiConfidenceMessage(
              localResult.errors.map(e => e.errorName).join(', '),
              settings.tone,
              effectiveKey,
              aiConfig
            );

            const fixesPromises = localResult.errors.map(async (err) => {
              try {
                // If bilingual tone is requested, we use aiTranslateBilingual, else aiExplainError
                let enhancedExplanation;
                if (settings.tone === 'bilingual') {
                  enhancedExplanation = await aiTranslateBilingual(
                    err.why,
                    lang,
                    settings.tone,
                    effectiveKey,
                    aiConfig
                  );
                } else {
                  enhancedExplanation = await aiExplainError(
                    code,
                    lang,
                    err.errorName,
                    err.lineNumber,
                    err.why,
                    err.fix,
                    settings.tone,
                    adaptiveState.skillLevel,
                    effectiveKey,
                    aiConfig
                  );
                }
                return { ...err, why: enhancedExplanation }; 
              } catch {
                return err; 
              }
            });

            const [confidence, enhancedFixes] = await Promise.all([
              confidencePromise.catch(() => localResult.confidenceMessage),
              Promise.all(fixesPromises)
            ]);

            setAnalysis(prev => ({
              ...prev,
              source: 'ai-enhanced',
              fixes: enhancedFixes,
              errors: enhancedFixes,
              confidenceMessage: confidence,
              confidence: confidence
            }));

            setDiagnostics(prev => ({ ...prev, lastSource: 'ai-enhanced' }));
          } catch (enhancementErr) {
            setAiEnhancementError(enhancementErr.message);
          } finally {
            setIsEnhancingExplanation(false);
          }
        } else {
          try {
            const confidence = await aiConfidenceMessage(
              "Code is correct, no errors.",
              settings.tone,
              effectiveKey,
              aiConfig
            );
            setAnalysis(prev => ({
              ...prev,
              source: 'ai-enhanced',
              confidenceMessage: confidence,
              confidence: confidence
            }));
            setDiagnostics(prev => ({ ...prev, lastSource: 'ai-enhanced' }));
          } catch (e) {
            setAiEnhancementError(e.message);
          } finally {
            setIsEnhancingExplanation(false);
          }
        }
      }

    } catch (err) {
      setIsAnalyzing(false);
      setDiagnostics(prev => ({
        ...prev,
        lastSource: 'error',
        lastError: err.message || String(err),
      }));

      showToast(`Analysis failed: ${err.message || 'Unknown error'}`, 'error', {
        label: 'Retry',
        onClick: () => {
          handleAnalyze();
        },
      });

      // Graceful error fallback
      setAnalysis({
        source: 'error',
        language: detectedLanguage.language,
        errors: [],
        overallSummary: 'We encountered a small issue during analysis. Please try again — your code is safe!',
        confidenceMessage: "Technical hiccups happen. Let's try again. 👍",
        beginnerTip: 'If this keeps happening, check your internet connection or switch to Offline mode in Settings.',
      });
    }
  }, [code, detectedLanguage, settings.tone, activeApiKey, aiConfig, addEntry, adaptiveState, currentAttemptCount, settings.analysisMode, showToast, hasAiProxy]);

  const handleRequestCorrectedCode = useCallback(async () => {
    if (!analysis || !analysis.errors || analysis.errors.length === 0) return;
    
    const effectiveKey = (activeApiKey || '').trim() || (import.meta.env.VITE_NVIDIA_API_KEY || '').trim();
    if (!effectiveKey && !hasAiProxy) {
      setCorrectedCodeError('No API key available for AI corrected code.');
      return;
    }
    
    setIsLoadingCorrectedCode(true);
    setCorrectedCodeError(null);
    try {
      const errorSummary = analysis.errors.map(e => e.errorName).join(', ');
      const improved = await aiGenerateCorrectedCode(
        code,
        analysis.language,
        errorSummary,
        effectiveKey,
        aiConfig
      );
      setCorrectedCode(improved);
      setShowCorrectedCodeModal(true);
    } catch (err) {
      setCorrectedCodeError(err.message);
    } finally {
      setIsLoadingCorrectedCode(false);
    }
  }, [analysis, activeApiKey, aiConfig, code, hasAiProxy]);

  /** Load the built-in sample code */
  const handleLoadSample = useCallback(() => {
    setCode(SAMPLE_CODE);
    setAnalysis(null);
    setStepByStepData(null);
    setSelectedLineInfo(null);
    setDiagnostics(prev => ({ ...prev, lastDurationMs: 0, lastSource: null, lastError: null }));
    setIsEnhancingExplanation(false);
    setAiEnhancementError(null);
    setCorrectedCode(null);
    setCorrectedCodeError(null);
  }, []);

  /** Open the concept help panel, optionally focused on a topic */
  const handleOpenConceptHelp = useCallback((topic = null) => {
    setConceptHelpTopic(topic);
    setShowConceptHelp(true);
  }, []);

  /** Mark a concept as accepted in the adaptive engine */
  const handleConceptHelpAccepted = useCallback((topic) => {
    const newState = markConceptHelpAccepted(adaptiveState, topic);
    setAdaptiveState(newState);
    saveAdaptiveState(newState);
  }, [adaptiveState]);

  /** Select a specific line to focus in the editor */
  const handleLineSelect = useCallback((lineNumber) => {
    if (lineNumber != null) {
      setSelectedLineInfo({ line: lineNumber, timestamp: Date.now() });
    }
  }, []);

  /** Generate a step-by-step walkthrough of the code */
  const handleRequestStepByStep = useCallback(async () => {
    if (!code.trim()) return;
    setIsLoadingSteps(true);
    try {
      const steps = await generateStepByStep(
        code,
        detectedLanguage.language,
        activeApiKey,
        aiConfig,
        settings.analysisMode || 'auto',
        analysis
      );
      // Always set data — empty array shows fallback message, never blank
      setStepByStepData(Array.isArray(steps) ? steps : []);
    } catch (err) {
      console.warn('[CodeLens] Step-by-step generation failed:', err.message);
      // Set empty array so ExplanationPanel shows the fallback message
      setStepByStepData([]);
    } finally {
      setIsLoadingSteps(false);
    }
  }, [code, detectedLanguage, activeApiKey, aiConfig, settings.analysisMode, analysis]);

  // ---- Render ----
  if (showAbout) {
    return (
      <div className={`app ${settings.previewLayoutMode ? `preview-${settings.previewLayoutMode}` : ''}`} data-theme={settings.theme}>
        <Navbar
          theme={settings.theme}
          onToggleTheme={toggleTheme}
          onOpenSettings={() => setShowSettings(true)}
        />
        <AboutCodeLens onStartCoding={() => setShowAbout(false)} />
        {showSettings && (
          <SettingsModal
            settings={settings}
            onUpdateSetting={updateSetting}
            onClose={() => setShowSettings(false)}
            diagnostics={diagnostics}
            showToast={showToast}
          />
        )}
        {toast && (
          <div className="toast-container">
            <div className={`toast toast-${toast.type} ${toast.fading ? 'toast-fade-out' : ''}`} role="alert">
              {toast.type === 'success' && <CheckCircle2 size={16} className="toast-icon" />}
              {toast.type === 'error' && <XCircle size={16} className="toast-icon" />}
              {toast.type === 'info' && <Sparkles size={16} className="toast-icon" />}
              <span className="toast-message">{toast.message}</span>
              {toast.action && (
                <button
                  className="toast-action"
                  onClick={() => {
                    toast.action.onClick();
                    dismissToast();
                  }}
                >
                  {toast.action.label}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`app is-workspace ${settings.previewLayoutMode ? `preview-${settings.previewLayoutMode}` : ''}`} data-theme={settings.theme}>
      <Navbar
        theme={settings.theme}
        onToggleTheme={toggleTheme}
        onOpenSettings={() => setShowSettings(true)}
        onOpenAbout={() => setShowAbout(true)}
      />

      <main className="app-main" id="main-content">
        {/* Toolbar */}
        <div className="app-toolbar" id="app-toolbar" role="toolbar" aria-label="Code analysis controls">
          {/* Left section: style selector + live language badge */}
          <div className="toolbar-left">
            <ToneSelector
              activeTone={settings.tone}
              onToneChange={(t) => updateSetting('tone', t)}
            />
            <LanguageBadge lang={detectedLanguage} />
            <AIStatusBadge
              analysisMode={settings.analysisMode}
              apiKey={settings.apiKey}
              hasEnvKey={!!DEFAULT_AI_CONFIG.apiKey || hasAiProxy}
            />
          </div>

          {/* Right section: action buttons */}
          <div className="toolbar-actions">
            <button
              className="sample-btn glow-btn"
              onClick={handleLoadSample}
              id="load-sample-btn"
              title="Load sample code with errors to explore"
            >
              Try Sample
            </button>
            <button
              className="analyze-btn glow-btn"
              onClick={handleAnalyze}
              disabled={!code.trim() || isAnalyzing}
              id="analyze-btn"
              aria-busy={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  Analyzing…
                </>
              ) : (
                <>
                  <Sparkles size={15} aria-hidden="true" />
                  Analyze Code
                </>
              )}
            </button>
          </div>
        </div>

        {analysis?.source === 'fallback' && (
          <div className="ai-fallback-banner" id="ai-fallback-banner" role="alert">
            <AlertTriangle size={14} className="fallback-icon" />
            <span>{analysis.aiError || 'AI explanation temporarily offline. Fallback pattern analysis active.'}</span>
          </div>
        )}

        {/* Main Split Workspace */}
        <div className="app-workspace glow-section" id="workspace">
          {/* Left: Code Editor */}
          <div className="workspace-editor">
            <CodeEditor
              code={code}
              onCodeChange={setCode}
              detectedLanguage={detectedLanguage}
              settings={settings}
              errorLines={errorLines}
              selectedLineInfo={selectedLineInfo}
            />
          </div>

          {/* Right: Analysis Results */}
          <div className="workspace-explanation">
            <ExplanationPanel
              analysis={analysis}
              detection={detectedLanguage}
              isLoading={isAnalyzing}
              skillLevel={adaptiveState.skillLevel}
              attemptCount={currentAttemptCount}
              confusionSuggestions={analysis ? confusionSuggestions : []}
              onOpenConceptHelp={handleOpenConceptHelp}
              onRequestStepByStep={handleRequestStepByStep}
              stepByStepData={stepByStepData}
              isLoadingSteps={isLoadingSteps}
              onOpenAbout={() => setShowAbout(true)}
              onLineSelect={handleLineSelect}
              code={code}
              isEnhancingExplanation={isEnhancingExplanation}
              enhancingMessage={settings.tone === 'bilingual' ? 'Enhancing explanation with bilingual support...' : 'Local analysis ready. Enhancing explanation with AI...'}
              aiEnhancementError={aiEnhancementError}
              correctedCode={correctedCode}
              isLoadingCorrectedCode={isLoadingCorrectedCode}
              correctedCodeError={correctedCodeError}
              onRequestCorrectedCode={handleRequestCorrectedCode}
              onOpenCorrectedCodeModal={() => setShowCorrectedCodeModal(true)}
            />
          </div>
        </div>
        
        <div className="codelens-credit animate-fade-in-up delay-7">
          Developed with love by Khushi Pardhi
        </div>
      </main>

      {/* Floating Chat Assistant */}
      <ChatAssistant
        code={code}
        language={detectedLanguage.language}
        apiKey={activeApiKey}
        aiConfig={aiConfig}
        analysisMode={settings.analysisMode}
        currentErrors={analysis?.errors || []}
      />

      {/* Concept Help Modal */}
      {showConceptHelp && (
        <ConceptHelp
          topic={conceptHelpTopic}
          onClose={() => setShowConceptHelp(false)}
          onAccepted={handleConceptHelpAccepted}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onUpdateSetting={updateSetting}
          onClose={() => setShowSettings(false)}
          diagnostics={diagnostics}
          showToast={showToast}
        />
      )}
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type} ${toast.fading ? 'toast-fade-out' : ''}`} role="alert">
            {toast.type === 'success' && <CheckCircle2 size={16} className="toast-icon" />}
            {toast.type === 'error' && <XCircle size={16} className="toast-icon" />}
            {toast.type === 'info' && <Sparkles size={16} className="toast-icon" />}
            <span className="toast-message">{toast.message}</span>
            {toast.action && (
              <button
                className="toast-action"
                onClick={() => {
                  toast.action.onClick();
                  dismissToast();
                }}
              >
                {toast.action.label}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Corrected Code Modal */}
      {showCorrectedCodeModal && (
        <CorrectedCodeModal
          code={code || ''}
          correctedCode={correctedCode || ''}
          language={analysis?.language || 'python'}
          onClose={() => setShowCorrectedCodeModal(false)}
        />
      )}
    </div>
  );
}

// ---- Sub-components ----

/**
 * LanguageBadge
 * Displays the detected language with icon, confidence %, ambiguity indicator.
 * Shows top detection reason as a native tooltip.
 */
function LanguageBadge({ lang }) {
  if (!lang || lang.language === 'Unknown') return null;

  if (lang.unclear) {
    return (
      <div className="language-badge language-badge--unclear" id="detected-language-badge">
        <span className="language-badge-dot language-badge-dot--dim" />
        <span>Language unclear</span>
      </div>
    );
  }

  // Build a helpful tooltip from the top reasons
  const reasonText = lang.reasons && lang.reasons.length > 0
    ? `Detected as ${lang.language}:\n• ${lang.reasons.slice(0, 3).join('\n• ')}`
    : `Detected: ${lang.language} (${lang.confidencePct}% confidence)`;

  return (
    <div
      className={`language-badge ${lang.isAmbiguous ? 'language-badge--ambiguous' : ''}`}
      id="detected-language-badge"
      title={reasonText}
    >
      <span className="language-badge-dot" aria-hidden="true" />
      <span className="language-badge-icon" aria-hidden="true">{lang.icon}</span>
      <span className="language-badge-name">{lang.language}</span>
      <span className="language-badge-confidence">{lang.confidencePct}%</span>
      {lang.isAmbiguous && (
        <span className="language-badge-ambiguous" title="Multiple languages match" aria-label="Ambiguous detection">
          ?
        </span>
      )}
    </div>
  );
}

/**
 * AIStatusBadge
 * Displays active AI status (Offline, Ready, No Key) with modern glass design.
 */
function AIStatusBadge({ analysisMode, apiKey, hasEnvKey }) {
  const isAI = analysisMode === 'ai';
  const hasKey = !!(apiKey?.trim() || hasEnvKey);

  if (!isAI) {
    return (
      <div className="ai-status-badge ai-status-badge--offline" id="ai-status-badge" title="Offline Mode: Code is analyzed locally using syntax rules.">
        <span className="status-badge-dot" />
        <span className="status-badge-text">Offline Mode</span>
      </div>
    );
  }

  if (hasKey) {
    return (
      <div className="ai-status-badge ai-status-badge--ready" id="ai-status-badge" title="AI Mode Active: Deep explanations provided via Nvidia NIM.">
        <span className="status-badge-dot" />
        <span className="status-badge-text">AI Connected</span>
      </div>
    );
  }

  return (
    <div className="ai-status-badge ai-status-badge--no-key" id="ai-status-badge" title="AI key required: Add Nvidia API Key in Settings to enable deep analysis.">
      <span className="status-badge-dot" />
      <span className="status-badge-text">AI (No Key)</span>
    </div>
  );
}
