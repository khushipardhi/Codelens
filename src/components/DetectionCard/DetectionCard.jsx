import { useState } from 'react';
import { ChevronDown, ChevronUp, Cpu, AlertTriangle } from 'lucide-react';
import './DetectionCard.css';

/**
 * DetectionCard
 * ==============
 * A clean, collapsible card that explains WHY CodeLens identified a language.
 *
 * Shows:
 *   - Detected language with icon & confidence bar
 *   - Top detection reasons (what signals triggered the detection)
 *   - Ambiguous state (when two languages score similarly)
 *   - Confidence percentage with a visual bar
 *
 * Props:
 *   detection  — full detection result from detectLanguage()
 *   defaultOpen — whether to start expanded (default: false)
 */
export default function DetectionCard({ detection, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (!detection || detection.language === 'Unknown') return null;

  const { language, icon, confidencePct, reasons, candidates, isAmbiguous } = detection;

  const barColor = confidencePct >= 80
    ? 'var(--accent-green)'
    : confidencePct >= 55
      ? 'var(--accent-cyan)'
      : 'var(--accent-amber)';

  return (
    <div
      className={`detection-card ${isAmbiguous ? 'detection-card--ambiguous' : ''}`}
      id="detection-card"
    >
      {/* ---- Header (always visible) ---- */}
      <button
        className="detection-card-header"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        aria-controls="detection-card-body"
        id="detection-card-toggle"
      >
        <div className="detection-header-left">
          <Cpu size={13} className="detection-cpu-icon" aria-hidden="true" />
          <span className="detection-header-label">
            Detected as
          </span>
          <span className="detection-lang-chip" aria-label={`Detected language: ${language}`}>
            <span aria-hidden="true">{icon}</span>
            {language}
          </span>
          <span
            className="detection-confidence-badge"
            style={{ color: barColor }}
            title={`Detection confidence: ${confidencePct}%`}
          >
            {confidencePct}%
          </span>
          {isAmbiguous && (
            <span className="detection-ambiguous-tag" title="Multiple languages match this code">
              <AlertTriangle size={11} aria-hidden="true" />
              Ambiguous
            </span>
          )}
        </div>
        <span className="detection-toggle-icon" aria-hidden="true">
          {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </span>
      </button>

      {/* ---- Expandable body ---- */}
      {isOpen && (
        <div className="detection-card-body" id="detection-card-body" role="region" aria-label="Detection details">
          {/* Confidence bar */}
          <div className="detection-confidence-row">
            <span className="detection-conf-label">Confidence</span>
            <div className="detection-conf-bar-track" role="progressbar" aria-valuenow={confidencePct} aria-valuemin={0} aria-valuemax={100}>
              <div
                className="detection-conf-bar-fill"
                style={{ width: `${confidencePct}%`, background: barColor }}
              />
            </div>
            <span className="detection-conf-pct" style={{ color: barColor }}>
              {confidencePct}%
            </span>
          </div>

          {/* Detection reasons */}
          {reasons && reasons.length > 0 && (
            <div className="detection-reasons">
              <p className="detection-reasons-label">Why {language}?</p>
              <ul className="detection-reasons-list" aria-label={`Reasons for detecting ${language}`}>
                {reasons.map((r, i) => (
                  <li key={i} className="detection-reason-item">
                    <span className="detection-reason-dot" aria-hidden="true" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Ambiguous candidates */}
          {isAmbiguous && candidates && candidates.length > 1 && (
            <div className="detection-ambiguous-section">
              <p className="detection-ambiguous-label">
                <AlertTriangle size={12} aria-hidden="true" />
                Could also be:
              </p>
              <div className="detection-candidates">
                {candidates.slice(1, 3).map((c) => (
                  <span key={c.language} className="detection-candidate-chip">
                    {c.icon} {c.language}
                    <span className="candidate-pct">{c.confidencePct}%</span>
                  </span>
                ))}
              </div>
              <p className="detection-ambiguous-hint">
                If this is wrong, you can override the syntax highlight in Settings.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
