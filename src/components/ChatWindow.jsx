import React, { useRef, useEffect, useState } from 'react';
import { ArrowDown } from 'lucide-react';
import MessageItem from './MessageItem.jsx';
import EmptyState from './EmptyState.jsx';
import ChatInput from './ChatInput.jsx';

export default function ChatWindow({
  chat,
  isStreaming,
  input,
  setInput,
  onSend,
  onStop,
  onRegenerate,
}) {
  const scrollContainerRef = useRef(null);
  const bottomAnchorRef = useRef(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const userHasScrolledUp = useRef(false);

  const messages = chat?.messages || [];
  const hasMessages = messages.length > 0;

  // Track manual scrolling
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    const isUp = distanceFromBottom > 120;
    setShowScrollBottom(isUp);
    userHasScrolledUp.current = isUp;
  };

  // Scroll to bottom smoothly
  const scrollToBottom = (smooth = true) => {
    bottomAnchorRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
    });
    userHasScrolledUp.current = false;
    setShowScrollBottom(false);
  };

  // Auto-scroll when messages update or streaming occurs, unless user scrolled up
  useEffect(() => {
    if (!userHasScrolledUp.current) {
      scrollToBottom(false);
    }
  }, [messages, isStreaming]);

  // When switching chats, scroll to bottom immediately
  useEffect(() => {
    userHasScrolledUp.current = false;
    setShowScrollBottom(false);
    scrollToBottom(false);
  }, [chat?.id]);

  const handleSelectSuggestion = (suggestionPrompt) => {
    setInput(suggestionPrompt);
    // Send immediately
    setTimeout(() => {
      onSend(suggestionPrompt);
    }, 50);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-main">
      {/* Scrollable messages container */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 sm:px-6"
      >
        <div className="max-w-3xl mx-auto min-h-full flex flex-col justify-between py-6">
          {!hasMessages ? (
            <EmptyState onSelectSuggestion={handleSelectSuggestion} />
          ) : (
            <div className="flex-1 flex flex-col">
              {messages.map((message, index) => (
                <MessageItem
                  key={message.id || index}
                  message={message}
                  isStreaming={isStreaming && index === messages.length - 1}
                  isLast={index === messages.length - 1}
                  onRegenerate={onRegenerate}
                />
              ))}
              <div ref={bottomAnchorRef} className="h-4" />
            </div>
          )}
        </div>
      </div>

      {/* Floating Scroll-to-bottom Arrow Button */}
      {showScrollBottom && (
        <button
          onClick={() => scrollToBottom(true)}
          aria-label="Scroll to bottom"
          className="absolute bottom-24 right-6 sm:right-10 z-30 p-2 rounded-full bg-main border border-border-subtle shadow-lg text-text-muted hover:text-text-main transition-all active:scale-95"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}

      {/* Pinned Floating Input Area */}
      <ChatInput
        input={input}
        setInput={setInput}
        onSend={() => onSend(input)}
        onStop={onStop}
        isStreaming={isStreaming}
      />
    </div>
  );
}

