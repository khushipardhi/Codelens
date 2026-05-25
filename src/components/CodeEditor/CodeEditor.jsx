import { useRef, useCallback, useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Upload, FileCode, Copy, Trash2, Download } from 'lucide-react';
import './CodeEditor.css';

export default function CodeEditor({
  code,
  onCodeChange,
  detectedLanguage,
  settings,
  errorLines = [],
  selectedLineInfo,
}) {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleEditorMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  // Highlight error lines via decorations
  useEffect(() => {
    if (editorRef.current && errorLines.length > 0) {
      const decorations = errorLines.map((line) => ({
        range: {
          startLineNumber: line,
          startColumn: 1,
          endLineNumber: line,
          endColumn: 1,
        },
        options: {
          isWholeLine: true,
          className: 'error-line-highlight',
          glyphMarginClassName: 'error-glyph-margin',
          overviewRuler: {
            color: '#f472b6',
            position: 1,
          },
        },
      }));
      editorRef.current.deltaDecorations([], decorations);
    }
  }, [errorLines]);

  // Handle programmatic line scrolling and highlighting
  useEffect(() => {
    if (editorRef.current && selectedLineInfo && selectedLineInfo.line != null) {
      const line = selectedLineInfo.line;
      // Scroll Monaco to this line
      editorRef.current.revealLineInCenter(line);
      // Move cursor to this line
      editorRef.current.setPosition({ lineNumber: line, column: 1 });
      // Focus the editor so Monaco highlights the cursor line
      editorRef.current.focus();
    }
  }, [selectedLineInfo]);

  // File upload
  const handleFileUpload = useCallback((file) => {
    if (file && file.size < 500000) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onCodeChange(e.target.result);
      };
      reader.readAsText(file);
    }
  }, [onCodeChange]);

  // Drag & Drop
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
  }, [handleFileUpload]);

  // Copy
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  // Clear
  const handleClear = useCallback(() => {
    onCodeChange('');
    editorRef.current?.focus();
  }, [onCodeChange]);

  // Download
  const handleDownload = useCallback(() => {
    const ext = {
      Python: '.py', JavaScript: '.js', TypeScript: '.ts',
      Java: '.java', 'C++': '.cpp', C: '.c', 'C#': '.cs',
      Go: '.go', Rust: '.rs', PHP: '.php', SQL: '.sql',
      Ruby: '.rb', HTML: '.html', CSS: '.css',
      Swift: '.swift', Kotlin: '.kt', Dart: '.dart',
      Bash: '.sh', R: '.r',
    }[detectedLanguage?.language] || '.txt';

    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [code, detectedLanguage]);

  const monacoTheme = settings.theme === 'dark' ? 'codelens-dark' : 'codelens-light';

  return (
    <div
      className={`code-editor-container ${isDragging ? 'dragging' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      id="code-editor-panel"
    >
      {/* Header */}
      <div className="editor-header">
        <div className="editor-header-left">
          <FileCode size={15} className="editor-icon" />
          <span className="editor-title">Code Editor</span>
          {/* Compact language indicator inside the editor header */}
          {detectedLanguage && !detectedLanguage.unclear && (
            <span
              className="editor-lang-badge"
              id="editor-language-badge"
              title={`${detectedLanguage.language} detected — ${detectedLanguage.confidencePct}% confidence`}
            >
              <span className="editor-lang-icon" aria-hidden="true">{detectedLanguage.icon}</span>
              <span>{detectedLanguage.language}</span>
              {detectedLanguage.confidencePct > 0 && (
                <span className="editor-lang-pct">{detectedLanguage.confidencePct}%</span>
              )}
            </span>
          )}
          {detectedLanguage && detectedLanguage.unclear && code?.trim() && (
            <span className="editor-lang-badge editor-lang-badge--unclear" id="editor-language-badge">
              Language unclear
            </span>
          )}
        </div>
        <div className="editor-header-right">
          <button
            className="editor-action-btn"
            onClick={() => fileInputRef.current?.click()}
            title="Upload file"
            id="upload-file-btn"
          >
            <Upload size={14} />
          </button>
          <button
            className="editor-action-btn"
            onClick={handleCopy}
            title={copied ? 'Copied!' : 'Copy code'}
            id="copy-code-btn"
          >
            <Copy size={14} />
            {copied && <span className="copy-toast">Copied!</span>}
          </button>
          <button
            className="editor-action-btn"
            onClick={handleDownload}
            title="Download"
            disabled={!code}
            id="download-code-btn"
          >
            <Download size={14} />
          </button>
          <button
            className="editor-action-btn danger"
            onClick={handleClear}
            title="Clear"
            disabled={!code}
            id="clear-code-btn"
          >
            <Trash2 size={14} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".py,.js,.ts,.jsx,.tsx,.java,.c,.cpp,.cs,.go,.rs,.php,.sql,.rb,.html,.css,.swift,.kt,.dart,.sh,.bash,.r,.txt"
            onChange={(e) => handleFileUpload(e.target.files[0])}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {/* Drag overlay */}
      {isDragging && (
        <div className="drag-overlay">
          <Upload size={40} />
          <p>Drop your code file here</p>
        </div>
      )}

      {/* Monaco Editor */}
      <div className="editor-wrapper">
        <Editor
          height="100%"
          language={detectedLanguage?.monacoId || 'plaintext'}
          value={code}
          onChange={onCodeChange}
          onMount={handleEditorMount}
          theme={monacoTheme}
          beforeMount={(monaco) => {
            // Define custom themes
            monaco.editor.defineTheme('codelens-dark', {
              base: 'vs-dark',
              inherit: true,
              rules: [
                { token: 'comment', foreground: '6b7a9e', fontStyle: 'italic' },
                { token: 'keyword', foreground: '7c5cfc' },
                { token: 'string', foreground: '2dd4a8' },
                { token: 'number', foreground: 'f0b429' },
                { token: 'type', foreground: '36d6e7' },
                { token: 'function', foreground: '4d7cfe' },
                { token: 'variable', foreground: 'e8ecf4' },
                { token: 'operator', foreground: 'f472b6' },
              ],
              colors: {
                'editor.background': '#0d1230',
                'editor.foreground': '#e8ecf4',
                'editor.lineHighlightBackground': '#151b4a40',
                'editor.selectionBackground': '#4d7cfe30',
                'editor.inactiveSelectionBackground': '#4d7cfe15',
                'editorCursor.foreground': '#4d7cfe',
                'editorLineNumber.foreground': '#4a5580',
                'editorLineNumber.activeForeground': '#9ca8c7',
                'editorIndentGuide.background': '#1a2153',
                'editorIndentGuide.activeBackground': '#2a3170',
                'editor.selectionHighlightBackground': '#4d7cfe20',
                'editorBracketMatch.background': '#4d7cfe25',
                'editorBracketMatch.border': '#4d7cfe50',
                'scrollbar.shadow': '#00000000',
                'scrollbarSlider.background': '#4a558040',
                'scrollbarSlider.hoverBackground': '#6b7a9e60',
                'scrollbarSlider.activeBackground': '#9ca8c780',
              },
            });

            monaco.editor.defineTheme('codelens-light', {
              base: 'vs',
              inherit: true,
              rules: [
                { token: 'comment', foreground: '6b7a9e', fontStyle: 'italic' },
                { token: 'keyword', foreground: '6b3fce' },
                { token: 'string', foreground: '1a9e78' },
                { token: 'number', foreground: 'c8900e' },
                { token: 'type', foreground: '1a8fa0' },
                { token: 'function', foreground: '3a6bd6' },
              ],
              colors: {
                'editor.background': '#f8f9fc',
                'editor.foreground': '#1a1f36',
                'editor.lineHighlightBackground': '#eef1f820',
                'editor.selectionBackground': '#4d7cfe20',
                'editorCursor.foreground': '#4d7cfe',
                'editorLineNumber.foreground': '#9ca8c7',
                'editorLineNumber.activeForeground': '#4a5580',
              },
            });
          }}
          options={{
            fontSize: settings.fontSize,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontLigatures: true,
            lineNumbers: settings.showLineNumbers ? 'on' : 'off',
            wordWrap: settings.wordWrap,
            minimap: { enabled: settings.minimap },
            padding: { top: 16, bottom: 16 },
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            renderLineHighlight: 'all',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            insertSpaces: true,
            bracketPairColorization: { enabled: true },
            guides: { bracketPairs: true, indentation: true },
            suggest: { showIcons: true },
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            scrollbar: {
              verticalScrollbarSize: 6,
              horizontalScrollbarSize: 6,
            },
            placeholder: 'Paste your code here to get started...\n\nSupported: Python, JavaScript, Java, C++, C, Go, Rust, and more!',
          }}
        />
      </div>
    </div>
  );
}
