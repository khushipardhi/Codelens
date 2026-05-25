import { useState, useEffect } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  Code2,
  Heart,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertTriangle,
  HelpCircle,
  Shield,
  Zap,
  Eye,
  ArrowRight,
  Terminal,
} from 'lucide-react';

import './ExplanationPanel.css';

const LOADING_STAGES = [
  'Detecting programming language & structural patterns...',
  'Running offline syntax validation tests...',
  'Connecting to AI analysis engine...',
  'Parsing abstract syntax tree & semantic context...',
  'Formulating beginner-friendly adaptive feedback...',
];

function TypewriterText({ text, speed = 28 }) {
  const [displayedText, setDisplayedText] = useState(() => {
    if (!text) return '';
    return text.split(' ')[0] || '';
  });

  useEffect(() => {
    let active = true;
    if (!text) return;
    const words = text.split(' ');
    let currentWordIndex = 0;

    const interval = setInterval(() => {
      currentWordIndex++;
      if (currentWordIndex < words.length) {
        if (active) setDisplayedText((prev) => prev + ' ' + words[currentWordIndex]);
      } else {
        clearInterval(interval);
      }
    }, speed);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [text, speed]);

  return <span>{displayedText}</span>;
}

export default function ExplanationPanel({
  analysis,
  isLoading,
  attemptCount = 0,
  onOpenAbout,
  onLineSelect,
  isEnhancingExplanation,
  aiEnhancementError,
  correctedCode,
  isLoadingCorrectedCode,
  correctedCodeError,
  onRequestCorrectedCode,
  onOpenCorrectedCodeModal,
  enhancingMessage,
}) {
  const [expandedErrors, setExpandedErrors] = useState(new Set([0]));
  const [loadingStage, setLoadingStage] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      const t = setTimeout(() => setLoadingStage(0), 0);
      return () => clearTimeout(t);
    }
    const interval = setInterval(() => {
      setLoadingStage((prev) => (prev < LOADING_STAGES.length - 1 ? prev + 1 : prev));
    }, 900);
    return () => clearInterval(interval);
  }, [isLoading]);



  const toggleError = (index) => {
    setExpandedErrors((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };









  if (isLoading) {
    return (
      <div className="explanation-panel" id="explanation-panel">
        <div className="panel-loading">
          <div className="loading-animation">
            <div className="loading-orb" />
            <div className="loading-ring" />
            <div className="loading-ring-outer" />
          </div>
          <h3 className="loading-title">Analyzing your code...</h3>
          <p className="loading-subtitle">{LOADING_STAGES[loadingStage]}</p>
          <div className="loading-stages-dots">
            {LOADING_STAGES.map((_, i) => (
              <span key={i} className={`stage-dot ${i === loadingStage ? 'active' : i < loadingStage ? 'done' : ''}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="explanation-panel" id="explanation-panel">
        <div className="panel-empty">
          <div className="empty-icon-container">
            <Sparkles size={38} className="empty-icon" />
            <div className="empty-icon-glow" />
          </div>
          <h3 className="empty-title">Ready to Help</h3>
          <p className="empty-subtitle">
            Paste your code on the left and click <strong>Analyze Code</strong> to get calm,
            supportive explanations of any issues — with zero judgment.
          </p>
          <div className="empty-features">
            <div className="empty-feature">
              <Shield size={15} />
              <span>Multi-language support</span>
            </div>
            <div className="empty-feature">
              <Heart size={15} />
              <span>Beginner-safe language</span>
            </div>
            <div className="empty-feature">
              <Zap size={15} />
              <span>Offline-first analysis</span>
            </div>
            <div className="empty-feature">
              <Eye size={15} />
              <span>Line-by-line walkthrough</span>
            </div>
          </div>
          {onOpenAbout && (
            <button className="empty-about-btn" onClick={onOpenAbout}>
              <span>Discover CodeLens Philosophy</span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>
      </div>
    );
  }

  const safeAnalysis = analysis || null;
  const errors = Array.isArray(safeAnalysis?.fixes) 
    ? safeAnalysis.fixes 
    : Array.isArray(safeAnalysis?.errors) 
      ? safeAnalysis.errors 
      : [];
  const hasErrors = errors.length > 0;
  const overallSummary = String(safeAnalysis?.explanation || safeAnalysis?.overallSummary || 'CodeLens found an issue in this code.');
  const confidenceMessage = safeAnalysis?.confidence || safeAnalysis?.confidenceMessage || '';


  return (
    <div className="explanation-panel" id="explanation-panel">
        <div className="panel-content">
          {/* ── Meta Row ── */}
          <div className="panel-meta-header animate-fade-in">
            <span className="meta-lang">{analysis.language} Code</span>
            <span className="meta-separator">•</span>
            {analysis.source === 'ai' ? (
              <span className="meta-source ai">
                <Sparkles size={10} />
                AI Enhanced
              </span>
            ) : (
              <span className="meta-source local">
                <Terminal size={10} />
                Pattern Checker
              </span>
            )}
          </div>



          {isEnhancingExplanation && (
            <div className="ai-fallback-banner" style={{ backgroundColor: 'var(--bg-card-hover)', borderColor: 'var(--brand-primary)', color: 'var(--text-primary)' }}>
              <span className="spinner" style={{ marginRight: '8px', width: '14px', height: '14px', borderWidth: '2px', borderTopColor: 'var(--brand-primary)' }} />
              <span>{enhancingMessage || 'Local analysis ready. Enhancing explanation with AI...'}</span>
            </div>
          )}
          
          {aiEnhancementError && (
            <div className="ai-fallback-banner">
              <AlertTriangle size={14} className="fallback-icon" />
              <span>AI explanation temporarily unavailable. Local explanation is still active.</span>
            </div>
          )}

          {/* ── Overall Summary ── */}
          <div className={`panel-section section-summary animate-fade-in-up delay-1 ${hasErrors ? 'has-issues' : 'all-good'}`}>
            <div className="section-header">
              {hasErrors ? (
                <AlertCircle size={15} className="section-icon icon-warning" />
              ) : (
                <CheckCircle2 size={15} className="section-icon icon-success" />
              )}
              <span className="section-label">
                {hasErrors ? 'Syntax Error' : 'Looking Great!'}
              </span>
            </div>
            {!hasErrors && (
              <p className="summary-text">
                <TypewriterText key={overallSummary} text={overallSummary} speed={28} />
              </p>
            )}
          </div>

          {/* ── Error Cards ── */}
          {hasErrors && (
            <div className="errors-container">
              {errors.map((error, index) => {
                const isExpanded = expandedErrors.has(index);


                return (
                  <div
                    key={index}
                    className={`error-card animate-fade-in-up delay-${Math.min(index + 2, 6)}`}
                    id={`error-card-${index}`}
                  >
                    <button
                      className="error-card-header"
                      onClick={() => {
                        toggleError(index);
                        if (error.lineNumber != null) {
                          onLineSelect?.(error.lineNumber);
                        }
                      }}
                      aria-expanded={isExpanded}
                    >
                      <div className="error-header-left">
                        <span className="error-number">{index + 1}</span>
                        <div className="error-header-text">
                          <h4 className="error-name">{String(error?.errorName || 'Syntax Error')}</h4>
                          {error?.lineNumber && (
                            <span className="error-line">Line {error.lineNumber}</span>
                          )}
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp size={15} className="expand-icon" />
                      ) : (
                        <ChevronDown size={15} className="expand-icon" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="error-card-body-wrapper open animate-fade-in">
                        <div className="error-card-body">
                          {/* What happened */}
                          <div className="explanation-block">
                            <div className="block-header">
                              <HelpCircle size={13} className="block-icon blue" />
                              <span className="block-label">What happened</span>
                            </div>
                            <p className="block-text">{String(error?.explanation || error?.message || error?.simple || 'A syntax issue was found.')}</p>
                          </div>

                          {/* Suggested fix */}
                          <div className="explanation-block fix-block">
                            <div className="block-header">
                              <Code2 size={13} className="block-icon green" />
                              <span className="block-label">Suggested fix</span>
                            </div>
                            <p className="block-text">{String(error?.suggestedFix || error?.fix || 'Update the syntax according to language rules.')}</p>
                          </div>

                          {/* Why this happens */}
                          <div className="explanation-block">
                            <div className="block-header">
                              <Lightbulb size={13} className="block-icon amber" />
                              <span className="block-label">Why this happens</span>
                            </div>
                            <p className="block-text">{String(error?.why || 'This language requires strict adherence to its syntax structure.')}</p>
                          </div>

                          {/* Prevention tip */}
                          <div className="explanation-block">
                            <div className="block-header">
                              <Shield size={13} className="block-icon purple" />
                              <span className="block-label">How to avoid this</span>
                            </div>
                            <p className="block-text">{String(error?.avoid || 'Review standard language documentation for similar patterns.')}</p>
                          </div>

                          {/* Comfort message */}
                          {error?.comfort && (
                            <div className="comfort-message">
                              <Heart size={13} className="comfort-icon" />
                              <p>{String(error.comfort)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Confidence Message ── */}
          {attemptCount >= 1 && confidenceMessage && (
            <div className="panel-section section-confidence animate-fade-in-up delay-6">
              <div className="confidence-card">
                <Sparkles size={16} className="confidence-icon" />
                <p className="confidence-text">{confidenceMessage}</p>
              </div>
            </div>
          )}

          {/* ── Corrected Code Reveal Button ── */}
          {hasErrors && !correctedCode && (
            <div className="corrected-code-cta animate-fade-in-up delay-7">
              {correctedCodeError && (
                <div className="ai-fallback-banner" style={{marginBottom: '8px'}}>
                  <AlertTriangle size={14} className="fallback-icon" />
                  <span>{correctedCodeError}</span>
                </div>
              )}
              <button 
                className="reveal-code-btn glow-btn"
                onClick={onRequestCorrectedCode}
                disabled={isLoadingCorrectedCode}
              >
                {isLoadingCorrectedCode ? <span className="spinner" /> : <Code2 size={16} />}
                <span>{isLoadingCorrectedCode ? 'Generating Corrected Code...' : 'Generate Corrected Code'}</span>
              </button>
            </div>
          )}

          {correctedCode && (
            <div className="corrected-code-cta animate-fade-in-up delay-7">
              <button 
                className="reveal-code-btn glow-btn"
                onClick={onOpenCorrectedCodeModal}
              >
                <Code2 size={16} />
                <span>View Corrected Code</span>
              </button>
            </div>
          )}
        </div>
    </div>
  );
}
