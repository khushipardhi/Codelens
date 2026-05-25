import { useState, useMemo } from 'react';
import { Copy, Check, Terminal, Code2 } from 'lucide-react';
import './CodeVisualizer.css';

// Simple LCS line diff
function computeLineDiff(originalCode, improvedCode) {
  const originalLines = (originalCode || '').split('\n');
  const improvedLines = (improvedCode || '').split('\n');
  
  const dp = Array(originalLines.length + 1).fill(null).map(() => Array(improvedLines.length + 1).fill(0));
  
  for (let i = 1; i <= originalLines.length; i++) {
    for (let j = 1; j <= improvedLines.length; j++) {
      if (originalLines[i - 1] === improvedLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  
  const diff = [];
  let i = originalLines.length;
  let j = improvedLines.length;
  
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && originalLines[i - 1] === improvedLines[j - 1]) {
      diff.unshift({
        type: 'normal',
        value: originalLines[i - 1],
        originalLineNum: i,
        improvedLineNum: j
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      diff.unshift({
        type: 'added',
        value: improvedLines[j - 1],
        originalLineNum: null,
        improvedLineNum: j
      });
      j--;
    } else {
      diff.unshift({
        type: 'removed',
        value: originalLines[i - 1],
        originalLineNum: i,
        improvedLineNum: null
      });
      i--;
    }
  }
  
  return diff;
}

export default function CodeVisualizer({ code, language = 'python', correctedCode }) {
  const [copied, setCopied] = useState(false);

  const diff = useMemo(() => {
    return computeLineDiff(code, correctedCode || '');
  }, [code, correctedCode]);

  // Safe keyword highlighter
  const highlightCode = (lineText) => {
    if (!lineText) return ' ';
    let escaped = lineText
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
      
    const keywords = [
      'def', 'function', 'class', 'for', 'in', 'of', 'while', 'if', 'elif', 
      'else', 'return', 'print', 'import', 'from', 'as', 'try', 'except', 
      'const', 'let', 'var', 'true', 'false', 'None', 'null'
    ];
    
    // Single pass replacement to avoid mutating already inserted HTML tags
    const regex = new RegExp(`(#.*|\\/\\/.*)|((['"]).*?\\3)|(\\b(?:${keywords.join('|')})\\b)|(\\b\\d+\\b)`, 'g');
    
    escaped = escaped.replace(regex, (match, comment, str, quote, keyword, number) => {
      if (comment) return `<span class="code-token-comment">${comment}</span>`;
      if (str) return `<span class="code-token-string">${str}</span>`;
      if (keyword) return `<span class="code-token-keyword">${keyword}</span>`;
      if (number) return `<span class="code-token-number">${number}</span>`;
      return match;
    });
    
    return escaped;
  };

  const handleCopy = () => {
    if (correctedCode) {
      navigator.clipboard.writeText(correctedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!code || !code.trim()) {
    return (
      <div className="visualizer-empty">
        <Terminal size={32} className="visualizer-empty-icon" />
        <h4>No Code Found</h4>
        <p>Please type code on the left to see the comparison.</p>
      </div>
    );
  }

  if (!correctedCode) {
    return (
      <div className="visualizer-empty">
        <Code2 size={32} className="visualizer-empty-icon" />
        <h4>No Correction Available</h4>
        <p>Could not generate a corrected version of this code. It might already be perfect!</p>
      </div>
    );
  }

  const originalLines = diff.filter(d => d.type !== 'added');
  const correctedLines = diff.filter(d => d.type !== 'removed');

  return (
    <div className="code-compare animate-fade-in">
      <div className="code-compare-body">
        
        {/* Original Code Panel */}
        <div className="code-compare-panel code-compare-panel--original">
          <div className="code-compare-header">
            <span className="code-compare-title">Original Code</span>
            <span className="code-compare-lang">{language}</span>
          </div>
          <div className="code-compare-scroll">
            {originalLines.map((line, idx) => (
              <div 
                key={idx} 
                className={`code-compare-line ${line.type === 'removed' ? 'code-compare-line--mistake' : ''}`}
              >
                <span className="code-compare-line-number">{line.originalLineNum}</span>
                <pre 
                  className="code-compare-line-content"
                  dangerouslySetInnerHTML={{ __html: highlightCode(line.value) }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Corrected Code Panel */}
        <div className="code-compare-panel code-compare-panel--corrected">
          <div className="code-compare-header">
            <span className="code-compare-title">Corrected Code</span>
            <button className="code-compare-copy glow-btn" onClick={handleCopy} title="Copy Corrected Code">
              {copied ? <Check size={14} className="icon-success" /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy Fix'}</span>
            </button>
          </div>
          <div className="code-compare-scroll">
            {correctedLines.map((line, idx) => (
              <div 
                key={idx} 
                className={`code-compare-line ${line.type === 'added' ? 'code-compare-line--corrected' : ''}`}
              >
                <span className="code-compare-line-number">{line.improvedLineNum}</span>
                <pre 
                  className="code-compare-line-content"
                  dangerouslySetInnerHTML={{ __html: highlightCode(line.value) }}
                />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
