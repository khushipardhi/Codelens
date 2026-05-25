import { useState } from 'react';
import {
  X,
  BookOpen,
  Lightbulb,
  AlertTriangle,
  Code2,
  Target,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { getConceptHelp, getAvailableTopics } from '../../services/conceptHelp';
import './ConceptHelp.css';

export default function ConceptHelp({ topic, onClose, onAccepted }) {
  const [activeTab, setActiveTab] = useState('explain');
  const [showAllTopics, setShowAllTopics] = useState(!topic);
  const [selectedTopic, setSelectedTopic] = useState(topic);

  const concept = selectedTopic ? getConceptHelp(selectedTopic) : null;
  const allTopics = getAvailableTopics();

  const handleSelectTopic = (key) => {
    setSelectedTopic(key);
    setShowAllTopics(false);
    setActiveTab('explain');
    if (onAccepted) onAccepted(key);
  };

  return (
    <div className="concept-overlay" onClick={onClose} id="concept-help-modal">
      <div className="concept-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="concept-header">
          <div className="concept-header-left">
            <BookOpen size={18} className="concept-header-icon" />
            <div>
              <h2 className="concept-title">
                {concept ? concept.title : 'Quick Concept Help'}
              </h2>
              {concept && (
                <span className="concept-duration">{concept.duration}</span>
              )}
            </div>
          </div>
          <div className="concept-header-actions">
            {concept && (
              <button
                className="concept-browse-btn"
                onClick={() => { setShowAllTopics(true); setSelectedTopic(null); }}
                title="Browse all topics"
              >
                All Topics
              </button>
            )}
            <button className="concept-close" onClick={onClose} id="close-concept-btn">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Topic Selection Grid */}
        {showAllTopics && (
          <div className="concept-body">
            <p className="topics-intro">Choose a concept you'd like to understand better:</p>
            <div className="topics-grid">
              {allTopics.map((t) => (
                <button
                  key={t.key}
                  className="topic-card"
                  onClick={() => handleSelectTopic(t.key)}
                  id={`topic-${t.key}`}
                >
                  <span className="topic-icon">{t.icon}</span>
                  <span className="topic-title">{t.title}</span>
                  <span className="topic-duration">{t.duration}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Concept Content */}
        {concept && !showAllTopics && (
          <>
            {/* Tabs */}
            <div className="concept-tabs">
              {[
                { key: 'explain', label: 'Explain', icon: <Lightbulb size={14} /> },
                { key: 'visual', label: 'Visual', icon: <Target size={14} /> },
                { key: 'code', label: 'Code', icon: <Code2 size={14} /> },
                { key: 'mistakes', label: 'Mistakes', icon: <AlertTriangle size={14} /> },
              ].map((tab) => (
                <button
                  key={tab.key}
                  className={`concept-tab ${activeTab === tab.key ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="concept-body">
              {/* Explain Tab */}
              {activeTab === 'explain' && (
                <div className="tab-content">
                  <div className="explain-section">
                    <h3 className="section-title">
                      <Sparkles size={16} />
                      What is it?
                    </h3>
                    <p className="explain-text">{concept.explanation}</p>
                  </div>

                  <div className="explain-section analogy-section">
                    <h3 className="section-title">
                      <Lightbulb size={16} />
                      Real-life analogy
                    </h3>
                    <p className="analogy-text">{concept.analogy}</p>
                  </div>

                  {concept.practice && (
                    <div className="explain-section practice-section">
                      <h3 className="section-title">
                        <Target size={16} />
                        Try it yourself
                      </h3>
                      <p className="practice-text">{concept.practice}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Visual Tab */}
              {activeTab === 'visual' && (
                <div className="tab-content">
                  <h3 className="section-title visual-title">
                    <Target size={16} />
                    Step-by-step execution
                  </h3>
                  <div className="visual-steps">
                    {concept.visualSteps.map((step, i) => (
                      <div key={i} className="visual-step" style={{ animationDelay: `${i * 80}ms` }}>
                        <div className="step-connector">
                          <span className="step-dot">{step.icon}</span>
                          {i < concept.visualSteps.length - 1 && (
                            <div className="step-line" />
                          )}
                        </div>
                        <div className="step-content">
                          <span className="step-label">{step.label}</span>
                          <code className="step-detail">{step.detail}</code>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Code Tab */}
              {activeTab === 'code' && (
                <div className="tab-content">
                  <h3 className="section-title">
                    <Code2 size={16} />
                    Code example
                  </h3>
                  <pre className="concept-code">
                    <code>{concept.codeExample}</code>
                  </pre>
                </div>
              )}

              {/* Mistakes Tab */}
              {activeTab === 'mistakes' && (
                <div className="tab-content">
                  <h3 className="section-title">
                    <AlertTriangle size={16} />
                    Common mistakes & tips
                  </h3>
                  <div className="mistakes-list">
                    {concept.commonMistakes.map((item, i) => (
                      <div key={i} className="mistake-card" style={{ animationDelay: `${i * 100}ms` }}>
                        <div className="mistake-header">
                          <span className="mistake-icon">⚠️</span>
                          <span className="mistake-text">{item.mistake}</span>
                        </div>
                        <div className="mistake-tip">
                          <ArrowRight size={12} />
                          <span>{item.tip}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {concept.practice && (
                    <div className="explain-section practice-section" style={{ marginTop: 'var(--space-md)' }}>
                      <h3 className="section-title">
                        <Target size={16} />
                        Try it yourself
                      </h3>
                      <p className="practice-text">{concept.practice}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
