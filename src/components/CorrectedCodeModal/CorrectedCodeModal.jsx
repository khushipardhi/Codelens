import { useCallback, useEffect, useState } from 'react';
import { Maximize2, Minimize2, X } from 'lucide-react';
import CodeVisualizer from '../CodeVisualizer/CodeVisualizer';
import './CorrectedCodeModal.css';

export default function CorrectedCodeModal({ code, correctedCode, language, onClose }) {
  const [isMaximized, setIsMaximized] = useState(false);

  const toggleMaximize = useCallback(() => {
    setIsMaximized(current => !current);
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        toggleMaximize();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, toggleMaximize]);
  return (
    <div className="corrected-code-overlay" onClick={onClose}>
      <div
        className={`corrected-code-modal glass-card-heavy glow-card animate-fade-in-up ${isMaximized ? 'corrected-code-modal--maximized' : ''}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="corrected-code-header">
          <div className="corrected-code-title">
            <h3>Corrected Code Comparison</h3>
          </div>
          <div className="corrected-code-actions">
            <button
              type="button"
              className="corrected-code-icon-button"
              onClick={toggleMaximize}
              aria-label={isMaximized ? 'Restore Corrected Code Modal' : 'Maximize Corrected Code Modal'}
              title={isMaximized ? 'Restore' : 'Maximize'}
            >
              {isMaximized ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
            <button
              type="button"
              className="corrected-code-icon-button"
              onClick={onClose}
              aria-label="Close Corrected Code Modal"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="corrected-code-body">
          <CodeVisualizer 
            code={code} 
            correctedCode={correctedCode} 
            language={language} 
          />
        </div>
      </div>
    </div>
  );
}
