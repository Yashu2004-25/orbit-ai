import React, { useRef, useEffect } from 'react';
import { ArrowUp, Square } from 'lucide-react';

export default function ChatInput({
  input,
  setInput,
  onSend,
  onStop,
  isStreaming,
  disabled,
}) {
  const textareaRef = useRef(null);

  // Auto-grow textarea up to 8 lines (~200px)
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    const nextHeight = Math.min(textarea.scrollHeight, 200);
    textarea.style.height = `${nextHeight}px`;
  }, [input]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isStreaming && input.trim()) {
        onSend();
      }
    }
  };

  const isSendDisabled = disabled || !input.trim();

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-3 sm:pb-5 safe-bottom">
      <div className="relative flex flex-col bg-input rounded-3xl border border-border-subtle shadow-md focus-within:border-text-muted/40 transition-all duration-150">
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message Orbit"
          className="w-full resize-none bg-transparent pt-3.5 pb-3.5 pl-5 pr-14 text-[15px] leading-relaxed text-text-main placeholder:text-text-muted focus:outline-hidden max-h-[200px] overflow-y-auto"
        />

        {/* Send / Stop Button */}
        <div className="absolute right-2.5 bottom-2.5">
          {isStreaming ? (
            <button
              onClick={onStop}
              aria-label="Stop generation"
              title="Stop generating"
              className="w-8 h-8 rounded-full bg-text-main text-main flex items-center justify-center hover:opacity-85 transition-opacity active:scale-95 shadow-xs"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>
          ) : (
            <button
              onClick={() => {
                if (!isSendDisabled) onSend();
              }}
              disabled={isSendDisabled}
              aria-label="Send message"
              title="Send message"
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 active:scale-95 shadow-xs ${
                isSendDisabled
                  ? 'bg-border-subtle text-text-muted cursor-not-allowed opacity-40'
                  : 'bg-text-main text-main hover:opacity-90'
              }`}
            >
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>

      {/* Faded disclaimer note */}
      <p className="text-center text-[11px] text-text-muted mt-2 select-none tracking-normal">
        Orbit can make mistakes. Check important info.
      </p>
    </div>
  );
}

