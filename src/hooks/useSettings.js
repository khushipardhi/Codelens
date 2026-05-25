import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'codelens_settings';

const DEFAULT_SETTINGS = {
  theme: 'dark',
  tone: 'friendly',
  apiKey: '',
  analysisMode: 'offline',
  aiProvider: 'nvidia',
  aiModel: 'meta/llama-3.1-8b-instruct',
  aiBaseUrl: 'https://integrate.api.nvidia.com/v1',
  fontSize: 14,
  showLineNumbers: true,
  wordWrap: 'on',
  minimap: false,
};

export function useSettings() {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch { /* ignore */ }
  }, [settings]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  const updateSetting = useCallback((keyOrObject, value) => {
    setSettings(prev => {
      if (typeof keyOrObject === 'object' && keyOrObject !== null) {
        return { ...prev, ...keyOrObject };
      }
      return { ...prev, [keyOrObject]: value };
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  }, []);

  return { settings, updateSetting, toggleTheme };
}

const HISTORY_KEY = 'codelens_history';

export function useAnalysisHistory() {
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
    } catch { /* ignore */ }
  }, [history]);

  const addEntry = useCallback((entry) => {
    setHistory(prev => [{
      ...entry,
      id: Date.now(),
      timestamp: new Date().toISOString(),
    }, ...prev]);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  // Calculate stats
  const stats = {
    totalAnalyses: history.length,
    totalErrors: history.reduce((sum, e) => sum + (e.errorCount || 0), 0),
    languageBreakdown: history.reduce((acc, e) => {
      acc[e.language] = (acc[e.language] || 0) + 1;
      return acc;
    }, {}),
    recentLanguages: [...new Set(history.slice(0, 10).map(e => e.language))],
  };

  return { history, addEntry, clearHistory, stats };
}
