import React, { useState } from 'react';
import { Copy, Check, RotateCcw } from 'lucide-react';
import MarkdownView from './MarkdownView.jsx';
import OrbitLogo from './OrbitLogo.jsx';

export default function MessageItem({
  message,
  isStreaming,
  isLast,
  onRegenerate,
}) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  if (isUser) {
    return (
      <div className="flex justify-end my-4 px-2">
        <div className="max-w-[85%] sm:max-w-[75%] rounded-3xl px-5 py-3 bg-input text-text-main shadow-xs border border-border-subtle/50 text-[15px] leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </div>
      </div>
    );
  }

  // Orbit / Assistant Message
  const isThinking = isStreaming && !message.content;

  return (
    <div className="group relative flex gap-3.5 my-4 px-2 text-text-main">
      {/* Abstract Black Hole Orbit Avatar */}
      <div className="flex-shrink-0 mt-0.5 select-none">
        <OrbitLogo size={28} />
      </div>

      {/* Content Area */}
      <div className="flex-1 min-w-0">
        {isThinking ? (
          <div className="flex items-center gap-1.5 py-2">
            <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce"></span>
          </div>
        ) : (
          <MarkdownView content={message.content} />
        )}

        {/* Message actions under Orbit reply (Copy, Regenerate) */}
        {!isThinking && message.content && (
          <div className="flex items-center gap-1 mt-2 text-text-muted opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              aria-label="Copy reply"
              title="Copy"
              className="flex items-center gap-1 p-1.5 rounded-md hover:bg-hover hover:text-text-main transition-colors text-xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[11px] text-emerald-500">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Copy</span>
                </>
              )}
            </button>

            {onRegenerate && isLast && (
              <button
                onClick={onRegenerate}
                aria-label="Regenerate reply"
                title="Regenerate"
                className="flex items-center gap-1 p-1.5 rounded-md hover:bg-hover hover:text-text-main transition-colors text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="text-[11px]">Regenerate</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
