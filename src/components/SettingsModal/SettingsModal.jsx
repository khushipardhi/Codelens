import { useState, useEffect } from 'react';
import {
  X,
  Key,
  Eye,
  EyeOff,
  Monitor,
  Info,
  Cpu,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  LogOut,
  Sliders,
  Activity,
  Palette,
  BookOpen,
  Zap,
  WifiOff,
  Wifi,
} from 'lucide-react';
import { AI_MODELS, DEFAULT_AI_CONFIG, validateApiKey } from '../../services/aiService';
import './SettingsModal.css';

export default function SettingsModal({ settings, onUpdateSetting, onClose, diagnostics, showToast }) {
  const [showApiKey, setShowApiKey] = useState(false);

  const [localApiKey, setLocalApiKey] = useState(settings.apiKey || '');
  const [localBaseUrl, setLocalBaseUrl] = useState(settings.aiBaseUrl || DEFAULT_AI_CONFIG.baseUrl);
  const [localModel, setLocalModel] = useState(settings.aiModel || DEFAULT_AI_CONFIG.model);
  const [localProvider, setLocalProvider] = useState(settings.aiProvider || 'nvidia');
  const [localAnalysisMode, setLocalAnalysisMode] = useState(settings.analysisMode || 'offline');

  const [connectionStatus, setConnectionStatus] = useState('idle');
  const [connectionError, setConnectionError] = useState('');

  const envKeyAvailable = Boolean(DEFAULT_AI_CONFIG.apiKey);

  // Local state is initialized from settings on mount and updated directly by actions.

  // Auto-validate API Connection on mount if in AI mode and a key is set
  useEffect(() => {
    const autoValidate = async () => {
      const keyToTest = settings.apiKey || DEFAULT_AI_CONFIG.apiKey;
      if (settings.analysisMode === 'ai' && keyToTest) {
        setConnectionStatus('testing');
        setConnectionError('');
        try {
          const result = await validateApiKey(keyToTest, settings.aiBaseUrl || DEFAULT_AI_CONFIG.baseUrl);
          if (result.valid) {
            setConnectionStatus('success');
          } else {
            setConnectionStatus('failed');
            let friendlyError = 'Network issue';
            const errStr = (result.error || '').toLowerCase();
            if (errStr.includes('401') || errStr.includes('key') || errStr.includes('auth')) {
              friendlyError = 'Invalid API Key';
            } else if (errStr.includes('timeout') || errStr.includes('timed out')) {
              friendlyError = 'Timeout issue';
            } else if (errStr.includes('fetch')) {
              friendlyError = 'Failed to fetch';
            } else if (errStr.includes('network') || errStr.includes('cors')) {
              friendlyError = 'Network issue';
            }
            setConnectionError(friendlyError);
          }
        } catch (err) {
          setConnectionStatus('failed');
          let friendlyError = 'Network issue';
          const errStr = (err.message || '').toLowerCase();
          if (errStr.includes('401') || errStr.includes('key') || errStr.includes('auth')) {
            friendlyError = 'Invalid API Key';
          } else if (errStr.includes('timeout') || errStr.includes('timed out')) {
            friendlyError = 'Timeout issue';
          } else if (errStr.includes('fetch')) {
            friendlyError = 'Failed to fetch';
          }
          setConnectionError(friendlyError);
        }
      }
    };
    autoValidate();
  }, [settings.apiKey, settings.analysisMode, settings.aiBaseUrl]);

  const handleTestConnection = async () => {
    setConnectionStatus('testing');
    setConnectionError('');

    const keyToTest = localApiKey.trim() || DEFAULT_AI_CONFIG.apiKey;

    if (!keyToTest) {
      setConnectionStatus('failed');
      setConnectionError('Invalid API Key');
      if (showToast) {
        showToast('Connection failed: Invalid API Key', 'error');
      }
      return;
    }

    try {
      const result = await validateApiKey(keyToTest, localBaseUrl);
      if (result.valid) {
        setConnectionStatus('success');
        onUpdateSetting({
          apiKey: localApiKey,
          aiBaseUrl: localBaseUrl,
          aiModel: localModel,
          aiProvider: localProvider,
          analysisMode: 'ai',
        });
        setLocalAnalysisMode('ai');
        if (showToast) {
          showToast('NVIDIA API Connected', 'success');
        }
      } else {
        setConnectionStatus('failed');
        let friendlyError = 'Network issue';
        const errStr = (result.error || '').toLowerCase();
        if (errStr.includes('401') || errStr.includes('key') || errStr.includes('auth')) {
          friendlyError = 'Invalid API Key';
        } else if (errStr.includes('timeout') || errStr.includes('timed out')) {
          friendlyError = 'Timeout issue';
        } else if (errStr.includes('fetch')) {
          friendlyError = 'Failed to fetch';
        } else if (errStr.includes('network') || errStr.includes('cors')) {
          friendlyError = 'Network issue';
        } else if (errStr.includes('unrecognized') || errStr.includes('format')) {
          friendlyError = 'Invalid AI Response Format';
        } else if (result.error) {
          friendlyError = result.error;
        }
        setConnectionError(friendlyError);
        if (showToast) {
          showToast(`Connection failed: ${friendlyError}`, 'error');
        }
      }
    } catch (err) {
      setConnectionStatus('failed');
      let friendlyError = 'Network issue';
      const errStr = (err.message || '').toLowerCase();
      if (errStr.includes('401') || errStr.includes('key') || errStr.includes('auth')) {
        friendlyError = 'Invalid API Key';
      } else if (errStr.includes('timeout') || errStr.includes('timed out')) {
        friendlyError = 'Timeout issue';
      } else if (errStr.includes('fetch')) {
        friendlyError = 'Failed to fetch';
      }
      setConnectionError(friendlyError);
      if (showToast) {
        showToast(`Connection failed: ${friendlyError}`, 'error');
      }
    }
  };

  const handleSave = () => {
    onUpdateSetting({
      apiKey: localApiKey,
      aiBaseUrl: localBaseUrl,
      aiModel: localModel,
      aiProvider: localProvider,
      analysisMode: localAnalysisMode,
    });
    setConnectionStatus(localAnalysisMode === 'ai' && (localApiKey || DEFAULT_AI_CONFIG.apiKey) ? 'success' : 'saved');
    if (showToast) {
      showToast('Settings saved successfully', 'success');
    }
    setTimeout(() => {
      setConnectionStatus(prev => {
        if (prev === 'saved') return 'idle';
        return prev;
      });
    }, 2200);
  };

  const handleDisconnect = () => {
    setLocalApiKey('');
    onUpdateSetting({
      apiKey: '',
      analysisMode: 'offline',
    });
    setLocalAnalysisMode('offline');
    setConnectionStatus('disconnected');
    if (showToast) {
      showToast('NVIDIA API Disconnected', 'info');
    }
    setTimeout(() => setConnectionStatus('idle'), 2200);
  };

  const handleReset = () => {
    setLocalApiKey('');
    setLocalBaseUrl(DEFAULT_AI_CONFIG.baseUrl);
    setLocalModel(AI_MODELS[0].id);
    setLocalProvider('nvidia');
    setLocalAnalysisMode('offline');
    onUpdateSetting({
      apiKey: '',
      aiBaseUrl: DEFAULT_AI_CONFIG.baseUrl,
      aiModel: AI_MODELS[0].id,
      aiProvider: 'nvidia',
      analysisMode: 'offline',
    });
    setConnectionStatus('reset');
    if (showToast) {
      showToast('Settings reset to defaults', 'info');
    }
    setTimeout(() => setConnectionStatus('idle'), 2200);
  };

  const handleClose = () => {
    onUpdateSetting({
      apiKey: localApiKey,
      aiBaseUrl: localBaseUrl,
      aiModel: localModel,
      aiProvider: localProvider,
      analysisMode: localAnalysisMode,
    });
    onClose();
  };

  const getStatusLabel = () => {
    switch (connectionStatus) {
      case 'testing': return 'Testing Connection...';
      case 'success': return '✓ NVIDIA API Connected';
      case 'failed': return 'Connection Failed';
      case 'saved': return 'Settings Saved';
      case 'disconnected': return 'AI Disconnected';
      case 'reset': return 'Reset to Defaults';
      default:
        return localAnalysisMode === 'offline'
          ? 'Offline Mode — No API needed'
          : 'AI Mode — Requires API Key';
    }
  };

  const getStatusClass = () => {
    if (connectionStatus === 'success') return 'success';
    if (connectionStatus === 'failed') return 'failed';
    if (localAnalysisMode === 'offline') return 'offline';
    return 'ready';
  };

  return (
    <div className="modal-overlay" onClick={handleClose} id="settings-modal">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="modal-header">
          <div className="modal-header-title">
            <Sliders className="header-icon" size={18} />
            <h2 className="modal-title">Settings</h2>
          </div>
          <button
            className="modal-close"
            onClick={handleClose}
            aria-label="Close settings"
            id="close-settings-btn"
          >
            <X size={17} />
          </button>
        </div>

        <div className="modal-body">

          {/* ── Status Banner ── */}
          <div className="settings-status-banner">
            <div className={`status-banner-badge ${getStatusClass()}`}>
              {connectionStatus === 'testing' ? (
                <RefreshCw size={13} className="spin" />
              ) : localAnalysisMode === 'offline' ? (
                <WifiOff size={13} />
              ) : connectionStatus === 'success' ? (
                <CheckCircle size={13} />
              ) : connectionStatus === 'failed' ? (
                <AlertTriangle size={13} />
              ) : (
                <Wifi size={13} />
              )}
              <span>{getStatusLabel()}</span>
            </div>
          </div>

          {/* ──────────────────────────────────────── */}
          {/* SECTION 1: AI Connection                */}
          {/* ──────────────────────────────────────── */}
          <div className="settings-section">
            <div className="settings-section-header">
              <Cpu size={16} />
              <h3>AI Connection</h3>
            </div>
            <p className="section-desc">Connect Nvidia NIM for deep AI-powered code analysis.</p>

            {/* Mode Switcher */}
            <div className="mode-switcher" role="group" aria-label="Analysis mode">
              <button
                className={`mode-option ${localAnalysisMode === 'offline' ? 'active' : ''}`}
                onClick={() => {
                  setLocalAnalysisMode('offline');
                  onUpdateSetting('analysisMode', 'offline');
                }}
              >
                <ShieldCheck size={16} />
                <span>Offline</span>
                <small>Local pattern analysis</small>
              </button>
              <button
                className={`mode-option ${localAnalysisMode === 'ai' ? 'active' : ''}`}
                onClick={() => {
                  setLocalAnalysisMode('ai');
                  onUpdateSetting('analysisMode', 'ai');
                }}
              >
                <Zap size={16} />
                <span>AI-Powered</span>
                <small>Nvidia NIM API</small>
              </button>
            </div>

            {/* AI Settings (only shown when AI mode selected) */}
            {localAnalysisMode === 'ai' && (
              <div className="ai-settings-fields animate-fade-in">
                {/* AI Provider */}
                <div className="settings-field">
                  <label className="field-label" htmlFor="ai-provider-select">AI Provider</label>
                  <select
                    id="ai-provider-select"
                    className="settings-input settings-select"
                    value={localProvider}
                    onChange={(e) => {
                      const val = e.target.value;
                      setLocalProvider(val);
                      onUpdateSetting('aiProvider', val);
                    }}
                  >
                    <option value="nvidia">Nvidia NIM</option>
                  </select>
                </div>

                {/* Model Select */}
                <div className="settings-field">
                  <label className="field-label" htmlFor="ai-model-select">AI Model</label>
                  <select
                    id="ai-model-select"
                    className="settings-input settings-select"
                    value={localModel}
                    onChange={(e) => {
                      const val = e.target.value;
                      setLocalModel(val);
                      onUpdateSetting('aiModel', val);
                    }}
                  >
                    {AI_MODELS.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.label} — {model.speed}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Base URL */}
                <div className="settings-field">
                  <label className="field-label" htmlFor="ai-base-url-input">Nvidia API Base URL</label>
                  <input
                    id="ai-base-url-input"
                    type="text"
                    className="settings-input"
                    value={localBaseUrl}
                    onChange={(e) => {
                      const val = e.target.value;
                      setLocalBaseUrl(val);
                      onUpdateSetting('aiBaseUrl', val);
                    }}
                    placeholder="https://integrate.api.nvidia.com/v1"
                    spellCheck="false"
                  />
                </div>

                {/* API Key */}
                <div className="settings-field">
                  <label className="field-label" htmlFor="api-key-input">
                    <Key size={12} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle' }} />
                    Nvidia API Key
                  </label>
                  <div className="api-key-input-wrapper">
                    <input
                      id="api-key-input"
                      type={showApiKey ? 'text' : 'password'}
                      className="settings-input"
                      value={localApiKey}
                      onChange={(e) => {
                        const val = e.target.value;
                        setLocalApiKey(val);
                        onUpdateSetting('apiKey', val);
                      }}
                      placeholder={envKeyAvailable ? 'Using .env key — override here if needed' : 'nvapi-xxxxxxxxxxxxxxxxxxxx'}
                      spellCheck="false"
                      autoComplete="off"
                    />
                    <button
                      className="toggle-visibility"
                      onClick={() => setShowApiKey(!showApiKey)}
                      title={showApiKey ? 'Hide key' : 'Show key'}
                      type="button"
                    >
                      {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  <div className="field-hint">
                    <Info size={11} />
                    <span>
                      {envKeyAvailable
                        ? 'Environment key detected in .env — already active. '
                        : 'Get a free key at '}
                      <a href="https://build.nvidia.com/" target="_blank" rel="noopener noreferrer">
                        build.nvidia.com
                      </a>
                    </span>
                  </div>
                </div>

                {/* Error */}
                {connectionError && connectionStatus === 'failed' && (
                  <div className="connection-error-box animate-fade-in">
                    <AlertTriangle size={14} className="err-icon" />
                    <span>{connectionError}</span>
                  </div>
                )}

                {/* Success */}
                {connectionStatus === 'success' && (
                  <div className="connection-success-box animate-fade-in">
                    <CheckCircle size={14} className="success-icon" />
                    <span>Connected! AI analysis is now active and ready.</span>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="settings-actions-group">
              {localAnalysisMode === 'ai' && (
                <>
                  {connectionStatus === 'failed' && (
                    <button
                      className="action-btn reconnect-btn animate-fade-in"
                      onClick={handleTestConnection}
                      type="button"
                      id="reconnect-api-btn"
                    >
                      <RefreshCw size={13} />
                      <span>Reconnect API</span>
                    </button>
                  )}
                  <button
                    className="action-btn test-btn"
                    onClick={handleTestConnection}
                    disabled={connectionStatus === 'testing'}
                    type="button"
                    id="test-connection-btn"
                  >
                    {connectionStatus === 'testing' ? (
                      <><RefreshCw size={13} className="spin" /><span>Testing...</span></>
                    ) : (
                      <><RefreshCw size={13} /><span>Test Connection</span></>
                    )}
                  </button>
                  <button
                    className="action-btn connect-btn"
                    onClick={handleSave}
                    type="button"
                    id="connect-api-btn"
                  >
                    <Wifi size={13} />
                    <span>Connect API</span>
                  </button>
                </>
              )}
              {localAnalysisMode === 'offline' && (
                <button className="action-btn save-btn" onClick={handleSave} type="button">
                  Save Changes
                </button>
              )}
              {(settings.apiKey || localApiKey) && (
                <button className="action-btn disconnect-btn" onClick={handleDisconnect} type="button">
                  <LogOut size={13} />
                  <span>Disconnect</span>
                </button>
              )}
              <button className="action-btn reset-btn" onClick={handleReset} type="button">
                Reset Defaults
              </button>
            </div>
          </div>

          {/* ──────────────────────────────────────── */}
          {/* SECTION 2: Editor Preferences           */}
          {/* ──────────────────────────────────────── */}
          <div className="settings-section">
            <div className="settings-section-header">
              <Monitor size={16} />
              <h3>Editor Preferences</h3>
            </div>

            {/* Font Size */}
            <div className="settings-field">
              <label className="field-label" htmlFor="font-size-input">Font Size</label>
              <div className="range-field">
                <input
                  id="font-size-input"
                  type="range"
                  min="10"
                  max="24"
                  value={settings.fontSize}
                  onChange={(e) => onUpdateSetting('fontSize', parseInt(e.target.value))}
                  className="settings-range"
                />
                <span className="range-value">{settings.fontSize}px</span>
              </div>
            </div>

            {/* Toggles */}
            <div className="toggles-grid">
              <div className="toggle-field">
                <div className="toggle-label-group">
                  <label className="field-label" htmlFor="word-wrap-toggle">Word Wrap</label>
                  <span className="toggle-sublabel">Wrap long lines automatically</span>
                </div>
                <button
                  id="word-wrap-toggle"
                  className={`settings-toggle ${settings.wordWrap === 'on' ? 'active' : ''}`}
                  onClick={() => onUpdateSetting('wordWrap', settings.wordWrap === 'on' ? 'off' : 'on')}
                  aria-label="Toggle word wrap"
                  type="button"
                >
                  <span className="toggle-thumb" />
                </button>
              </div>

              <div className="toggle-field">
                <div className="toggle-label-group">
                  <label className="field-label" htmlFor="line-numbers-toggle">Line Numbers</label>
                  <span className="toggle-sublabel">Show line numbers in gutter</span>
                </div>
                <button
                  id="line-numbers-toggle"
                  className={`settings-toggle ${settings.showLineNumbers ? 'active' : ''}`}
                  onClick={() => onUpdateSetting('showLineNumbers', !settings.showLineNumbers)}
                  aria-label="Toggle line numbers"
                  type="button"
                >
                  <span className="toggle-thumb" />
                </button>
              </div>

              <div className="toggle-field">
                <div className="toggle-label-group">
                  <label className="field-label" htmlFor="minimap-toggle">Minimap</label>
                  <span className="toggle-sublabel">Code overview on the right</span>
                </div>
                <button
                  id="minimap-toggle"
                  className={`settings-toggle ${settings.minimap ? 'active' : ''}`}
                  onClick={() => onUpdateSetting('minimap', !settings.minimap)}
                  aria-label="Toggle minimap"
                  type="button"
                >
                  <span className="toggle-thumb" />
                </button>
              </div>
            </div>
          </div>

          {/* ──────────────────────────────────────── */}
          {/* SECTION 3: Theme & Appearance           */}
          {/* ──────────────────────────────────────── */}
          <div className="settings-section">
            <div className="settings-section-header">
              <Palette size={16} />
              <h3>Theme & Appearance</h3>
            </div>

            <div className="toggle-field">
              <div className="toggle-label-group">
                <label className="field-label">Dark Mode</label>
                <span className="toggle-sublabel">
                  {settings.theme === 'dark' ? 'Cinematic dark workspace active' : 'Light mode active'}
                </span>
              </div>
              <button
                className={`settings-toggle ${settings.theme === 'dark' ? 'active' : ''}`}
                onClick={() => onUpdateSetting('theme', settings.theme === 'dark' ? 'light' : 'dark')}
                aria-label="Toggle dark mode"
                type="button"
              >
                <span className="toggle-thumb" />
              </button>
            </div>
          </div>

          {/* ──────────────────────────────────────── */}
          {/* SECTION 4: Learning Experience          */}
          {/* ──────────────────────────────────────── */}
          <div className="settings-section">
            <div className="settings-section-header">
              <BookOpen size={16} />
              <h3>Learning Experience</h3>
            </div>

            <div className="skill-display">
              <span className="skill-label">Detected Skill Level</span>
              <span className="skill-badge">
                {settings.skillLevel || 'Beginner'}
              </span>
            </div>

            <div className="toggle-field">
              <div className="toggle-label-group">
                <label className="field-label" htmlFor="adaptive-toggle">Adaptive Explanations</label>
                <span className="toggle-sublabel">Adjusts depth based on your progress</span>
              </div>
              <button
                id="adaptive-toggle"
                className="settings-toggle active"
                aria-label="Adaptive explanations (always on)"
                type="button"
                disabled
              >
                <span className="toggle-thumb" />
              </button>
            </div>
          </div>

          {/* ──────────────────────────────────────── */}
          {/* SECTION 5: Developer Tools              */}
          {/* ──────────────────────────────────────── */}
          {import.meta.env.DEV && (
            <div className="settings-section developer-section">
              <div className="settings-section-header">
                <Activity size={16} />
                <h3>Developer Tools</h3>
                <span className="dev-tag">DEV</span>
              </div>
              <div className="diagnostics-grid">
                <div className="diagnostic-item">
                  <span className="diag-label">Last Latency</span>
                  <span className="diag-val">
                    {diagnostics?.lastDurationMs ? `${diagnostics.lastDurationMs}ms` : 'N/A'}
                  </span>
                </div>
                <div className="diagnostic-item">
                  <span className="diag-label">Source</span>
                  <span className={`diag-val source-${diagnostics?.lastSource || 'none'}`}>
                    {diagnostics?.lastSource || 'None'}
                  </span>
                </div>
                <div className="diagnostic-item">
                  <span className="diag-label">.env API Key</span>
                  <span className="diag-val" style={{ color: envKeyAvailable ? 'var(--accent-green)' : 'var(--accent-rose)' }}>
                    {envKeyAvailable ? 'Present ✓' : 'Not Set'}
                  </span>
                </div>
                <div className="diagnostic-item">
                  <span className="diag-label">Vite Proxy</span>
                  <span className="diag-val" style={{ color: 'var(--accent-cyan)' }}>
                    /api/nvidia ✓
                  </span>
                </div>
                {diagnostics?.lastError && (
                  <div className="diagnostic-item full-width">
                    <span className="diag-label">Last Error</span>
                    <span className="diag-val diag-error">{diagnostics.lastError}</span>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
        <div className="codelens-credit">
          Developed with love by Khushi Pardhi
        </div>
      </div>
    </div>
  );
}
