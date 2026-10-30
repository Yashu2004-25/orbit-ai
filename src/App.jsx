import React, { useState, useEffect, useRef, useCallback } from 'react';
import TopBar from './components/TopBar.jsx';
import Sidebar from './components/Sidebar.jsx';
import ChatWindow from './components/ChatWindow.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import { useChats } from './hooks/useChats.js';
import {
  SAFE_DEFAULT_MODELS,
  DEFAULT_MODEL_ID,
  getActiveApiKey,
  fetchAvailableModels,
  streamChatCompletion,
} from './services/groq.js';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

export default function App() {
  const {
    chats,
    activeChat,
    activeChatId,
    createNewChat,
    selectChat,
    renameChat,
    deleteChat,
    clearAllChats,
    addMessage,
    appendMessageContent,
    updateMessageContent,
  } = useChats();

  // Sidebar toggle state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Settings modal state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Theme state: 'system' | 'light' | 'dark'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('orbit_theme') || 'system';
  });

  // Model state
  const [models, setModels] = useState(SAFE_DEFAULT_MODELS);
  const [selectedModel, setSelectedModel] = useState(() => {
    return localStorage.getItem('orbit_selected_model') || DEFAULT_MODEL_ID;
  });

  // Input & Streaming states
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef(null);

  // Toast notifications
  const [toast, setToast] = useState(null); // { type: 'info' | 'error' | 'success', message: string }

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  }, []);

  // Apply Theme
  useEffect(() => {
    localStorage.setItem('orbit_theme', theme);

    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      if (theme === 'dark' || (theme === 'system' && mediaQuery.matches)) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();

    // Listen for system theme changes if set to 'system'
    const listener = () => {
      if (theme === 'system') applyTheme();
    };
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [theme]);

  // Load models & check API key on launch
  const loadModels = useCallback(async (key) => {
    const activeKey = key || getActiveApiKey();
    if (!activeKey) {
      setModels(SAFE_DEFAULT_MODELS);
      return;
    }

    try {
      const fetched = await fetchAvailableModels(activeKey);
      if (fetched && fetched.length > 0) {
        setModels(fetched);

        // If saved model is no longer in the list, switch to default
        setSelectedModel((current) => {
          const exists = fetched.some((m) => m.id === current);
          if (!exists) {
            showToast('Selected model no longer available. Switched to GPT-OSS 120B.', 'info');
            localStorage.setItem('orbit_selected_model', DEFAULT_MODEL_ID);
            return DEFAULT_MODEL_ID;
          }
          return current;
        });
      }
    } catch (err) {
      console.warn('Failed to load models:', err);
    }
  }, [showToast]);

  useEffect(() => {
    const key = getActiveApiKey();
    if (!key) {
      // First launch with no API key: open settings automatically
      setIsSettingsOpen(true);
      showToast('Welcome to Orbit! Please enter your Groq API key to get started.', 'info');
    }
    loadModels(key);
  }, [loadModels, showToast]);

  const handleSelectModel = (modelId) => {
    setSelectedModel(modelId);
    localStorage.setItem('orbit_selected_model', modelId);
  };

  // Stop active generation
  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  };

  // Send message
  const handleSend = async (messageText) => {
    const textToSend = (messageText || input).trim();
    if (!textToSend || isStreaming) return;

    const apiKey = getActiveApiKey();
    if (!apiKey) {
      setIsSettingsOpen(true);
      showToast('Please enter your Groq API key in Settings.', 'error');
      return;
    }

    setInput('');

    // Ensure we have a valid chat
    let chatId = activeChatId;
    if (!chatId) {
      chatId = createNewChat();
    }

    // 1. Append user message
    addMessage(chatId, 'user', textToSend);

    // 2. Append placeholder assistant message
    const assistantMessageId = addMessage(chatId, 'assistant', '');

    setIsStreaming(true);
    abortControllerRef.current = new AbortController();

    // Prepare message history
    const existingMessages = activeChat?.messages || [];
    const conversationHistory = [
      ...existingMessages,
      { role: 'user', content: textToSend },
    ];

    try {
      await streamChatCompletion({
        apiKey,
        model: selectedModel,
        messages: conversationHistory,
        signal: abortControllerRef.current.signal,
        onChunk: (chunk) => {
          appendMessageContent(chatId, assistantMessageId, chunk);
        },
      });
    } catch (err) {
      if (err.message === 'ABORTED') {
        // Stopped by user
      } else if (err.message === 'MODEL_DECOMMISSIONED') {
        showToast('Model decommissioned. Switching to GPT-OSS 120B.', 'error');
        handleSelectModel(DEFAULT_MODEL_ID);
        updateMessageContent(
          chatId,
          assistantMessageId,
          '⚠️ The previously selected model is no longer available on Groq. I have switched you to **GPT-OSS 120B**. Please try asking again.'
        );
      } else if (err.message === 'INVALID_KEY') {
        showToast('Invalid Groq API key. Check Settings.', 'error');
        updateMessageContent(
          chatId,
          assistantMessageId,
          '⚠️ Invalid API key. Please check your Groq API key in Settings.'
        );
      } else if (err.message === 'RATE_LIMITED') {
        showToast('Rate limit reached. Please wait a moment.', 'error');
        updateMessageContent(
          chatId,
          assistantMessageId,
          '⚠️ Groq API rate limit reached. Please wait a short moment and try again.'
        );
      } else {
        updateMessageContent(
          chatId,
          assistantMessageId,
          `⚠️ Unable to reach Orbit: ${err.message || 'Please check your connection.'}`
        );
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  // Regenerate reply
  const handleRegenerate = () => {
    if (isStreaming || !activeChat || activeChat.messages.length < 2) return;

    // Find the last user message
    const messages = activeChat.messages;
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUserMsg) return;

    // Re-send the prompt
    handleSend(lastUserMsg.content);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-main text-text-main font-sans">
      {/* Toast Notification */}
      {toast && (
        <div
          role="alert"
          className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-sm max-w-sm transition-all animate-in fade-in slide-in-from-top-3 ${
            toast.type === 'error'
              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
              : toast.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
              : 'bg-input text-text-main border-border-subtle'
          }`}
        >
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
          <span className="flex-1 text-xs">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="p-1 text-text-muted hover:text-text-main"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={(id) => {
          selectChat(id);
        }}
        onNewChat={() => {
          createNewChat();
        }}
        onRenameChat={renameChat}
        onDeleteChat={deleteChat}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Chat Workspace */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <TopBar
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          models={models}
          selectedModel={selectedModel}
          onSelectModel={handleSelectModel}
          onNewChat={createNewChat}
        />

        <ChatWindow
          chat={activeChat}
          isStreaming={isStreaming}
          input={input}
          setInput={setInput}
          onSend={handleSend}
          onStop={handleStop}
          onRegenerate={handleRegenerate}
        />
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        onSetTheme={setTheme}
        onClearChats={clearAllChats}
        onKeySaved={(newKey) => {
          loadModels(newKey);
          showToast('Settings saved successfully.', 'success');
        }}
      />
    </div>
  );
}

