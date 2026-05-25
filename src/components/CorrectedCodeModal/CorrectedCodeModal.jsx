import { X } from 'lucide-react';
import CodeVisualizer from '../CodeVisualizer/CodeVisualizer';
import './CorrectedCodeModal.css';

export default function CorrectedCodeModal({ code, correctedCode, language, onClose }) {
  return (
    <div className="corrected-code-overlay" onClick={onClose}>
      <div className="corrected-code-modal glass-card-heavy glow-card animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="corrected-code-header">
          <div className="corrected-code-title">
            <h3>Corrected Code Comparison</h3>
          </div>
          <button className="corrected-code-close" onClick={onClose} aria-label="Close Corrected Code Modal">
            <X size={20} />
          </button>
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
