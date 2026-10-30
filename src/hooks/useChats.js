import { useState, useEffect, useCallback } from 'react';

const CHATS_STORAGE_KEY = 'orbit_chats';
const ACTIVE_CHAT_KEY = 'orbit_active_chat_id';

function generateId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : 'id_' + Math.random().toString(36).substring(2, 9) + Date.now();
}

function createBlankChat() {
  return {
    id: generateId(),
    title: 'New chat',
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function useChats() {
  // Load saved chats from localStorage
  const [chats, setChats] = useState(() => {
    try {
      const saved = localStorage.getItem(CHATS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading chats from storage', e);
    }
    return [createBlankChat()];
  });

  // Active chat ID
  const [activeChatId, setActiveChatId] = useState(() => {
    try {
      const savedActive = localStorage.getItem(ACTIVE_CHAT_KEY);
      if (savedActive) {
        return savedActive;
      }
    } catch (e) {}
    return null;
  });

  // Sync activeChatId if invalid or null
  useEffect(() => {
    if (!activeChatId || !chats.some((c) => c.id === activeChatId)) {
      if (chats.length > 0) {
        setActiveChatId(chats[0].id);
      } else {
        const blank = createBlankChat();
        setChats([blank]);
        setActiveChatId(blank.id);
      }
    }
  }, [chats, activeChatId]);

  // Persist chats whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(chats));
    } catch (e) {
      console.error('Error saving chats to storage', e);
    }
  }, [chats]);

  // Persist activeChatId
  useEffect(() => {
    if (activeChatId) {
      try {
        localStorage.setItem(ACTIVE_CHAT_KEY, activeChatId);
      } catch (e) {}
    }
  }, [activeChatId]);

  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0];

  /**
   * Create a new chat
   */
  const createNewChat = useCallback(() => {
    // If the active chat is already completely empty, simply reuse it
    if (activeChat && activeChat.messages.length === 0) {
      return activeChat.id;
    }
    const newChat = createBlankChat();
    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    return newChat.id;
  }, [activeChat]);

  /**
   * Select an active chat
   */
  const selectChat = useCallback((id) => {
    setActiveChatId(id);
  }, []);

  /**
   * Rename a chat
   */
  const renameChat = useCallback((id, newTitle) => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    setChats((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: trimmed, updatedAt: Date.now() } : c))
    );
  }, []);

  /**
   * Delete a chat
   */
  const deleteChat = useCallback((id) => {
    setChats((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      if (filtered.length === 0) {
        const blank = createBlankChat();
        setActiveChatId(blank.id);
        return [blank];
      }
      return filtered;
    });
  }, []);

  /**
   * Clear all chats
   */
  const clearAllChats = useCallback(() => {
    const freshChat = createBlankChat();
    setChats([freshChat]);
    setActiveChatId(freshChat.id);
    try {
      localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify([freshChat]));
      localStorage.setItem(ACTIVE_CHAT_KEY, freshChat.id);
    } catch (e) {}
  }, []);

  /**
   * Add a message to a chat (and auto-title if it's the first user message)
   */
  const addMessage = useCallback((chatId, role, content) => {
    const newMessage = {
      id: generateId(),
      role,
      content,
      createdAt: Date.now(),
    };

    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== chatId) return c;

        const updatedMessages = [...c.messages, newMessage];
        let newTitle = c.title;

        // Auto-title on first user message (up to 40 characters)
        if (c.title === 'New chat' && role === 'user') {
          newTitle = content.slice(0, 40).trim();
          if (content.length > 40) {
            newTitle += '...';
          }
        }

        return {
          ...c,
          title: newTitle,
          messages: updatedMessages,
          updatedAt: Date.now(),
        };
      })
    );

    return newMessage.id;
  }, []);

  /**
   * Update or stream into a specific message's content
   */
  const updateMessageContent = useCallback((chatId, messageId, newContent) => {
    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== chatId) return c;
        return {
          ...c,
          updatedAt: Date.now(),
          messages: c.messages.map((m) =>
            m.id === messageId ? { ...m, content: newContent } : m
          ),
        };
      })
    );
  }, []);

  /**
   * Append a token chunk to an existing message (for streaming)
   */
  const appendMessageContent = useCallback((chatId, messageId, chunk) => {
    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== chatId) return c;
        return {
          ...c,
          updatedAt: Date.now(),
          messages: c.messages.map((m) =>
            m.id === messageId ? { ...m, content: m.content + chunk } : m
          ),
        };
      })
    );
  }, []);

  return {
    chats,
    activeChat,
    activeChatId,
    createNewChat,
    selectChat,
    renameChat,
    deleteChat,
    clearAllChats,
    addMessage,
    updateMessageContent,
    appendMessageContent,
  };
}

