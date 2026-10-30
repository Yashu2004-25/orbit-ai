import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Check, AlertCircle, Trash2, ExternalLink } from 'lucide-react';
import { testApiKey } from '../services/groq.js';

export default function SettingsModal({
  isOpen,
  onClose,
  theme,
  onSetTheme,
  onClearChats,
  onKeySaved,
}) {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null); // { success: boolean, message: string }
  const [confirmClear, setConfirmClear] = useState(false);

  // Load key when opening modal
  useEffect(() => {
    if (isOpen) {
      const storedKey = localStorage.getItem('orbit_api_key') || '';
      setApiKey(storedKey);
      setTestResult(null);
      setConfirmClear(false);
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSaveKey = () => {
    localStorage.setItem('orbit_api_key', apiKey.trim());
    if (onKeySaved) {
      onKeySaved(apiKey.trim());
    }
    onClose();
  };

  const handleTestKey = async () => {
    setTesting(true);
    setTestResult(null);
    const result = await testApiKey(apiKey.trim());
    setTesting(false);
    setTestResult(result);
    if (result.success) {
      localStorage.setItem('orbit_api_key', apiKey.trim());
      if (onKeySaved) {
        onKeySaved(apiKey.trim());
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-main rounded-3xl border border-border-subtle shadow-2xl p-6 text-text-main animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
          <h2 className="text-lg font-semibold">Settings</h2>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="p-1.5 rounded-full text-text-muted hover:text-text-main hover:bg-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-5 space-y-6">
          {/* Groq API Key Section */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-main">
              Groq API Key
            </label>
            <div className="relative flex items-center">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="gsk_..."
                className="w-full px-4 py-2.5 pr-11 rounded-xl bg-input border border-border-subtle text-sm text-text-main placeholder:text-text-muted focus:outline-hidden focus:ring-2 focus:ring-cyan-500/30"
              />
              <button
                type="button"
                onClick={() => setShowKey((prev) => !prev)}
                className="absolute right-3 p-1 text-text-muted hover:text-text-main transition-colors"
                aria-label={showKey ? 'Hide API key' : 'Show API key'}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Test button & Helper link */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleTestKey}
                disabled={testing || !apiKey.trim()}
                className="text-xs px-3 py-1.5 rounded-lg bg-input hover:bg-hover border border-border-subtle font-medium text-text-main disabled:opacity-50 transition-colors"
              >
                {testing ? 'Testing...' : 'Test key'}
              </button>

              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400"
              >
                <span>Get a free key at console.groq.com</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Test Result Message */}
            {testResult && (
              <div
                className={`flex items-center gap-2 p-3 rounded-xl text-xs ${
                  testResult.success
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                }`}
              >
                {testResult.success ? (
                  <Check className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>

          {/* Theme Section */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-main">Theme</label>
            <div className="grid grid-cols-3 gap-2">
              {['system', 'light', 'dark'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => onSetTheme(t)}
                  className={`py-2 px-3 text-xs capitalize rounded-xl border transition-all ${
                    theme === t
                      ? 'bg-hover border-text-muted/60 font-semibold text-text-main shadow-xs'
                      : 'border-border-subtle bg-input text-text-muted hover:text-text-main'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Clear All Chats Section */}
          <div className="pt-2 border-t border-border-subtle">
            {confirmClear ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                  Delete all chat history?
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onClearChats();
                      setConfirmClear(false);
                      onClose();
                    }}
                    className="px-2.5 py-1 text-xs rounded-lg bg-rose-600 text-white font-medium hover:bg-rose-700"
                  >
                    Yes, delete
                  </button>
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="px-2.5 py-1 text-xs rounded-lg bg-input text-text-muted hover:text-text-main"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="flex items-center gap-2 text-xs text-rose-500 hover:text-rose-600 transition-colors py-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear all chats</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer buttons */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-border-subtle">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-text-muted hover:text-text-main hover:bg-hover transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveKey}
            className="px-5 py-2 rounded-xl text-sm font-medium bg-text-main text-main hover:opacity-90 transition-opacity"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

