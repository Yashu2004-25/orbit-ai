import React, { useState, useMemo } from 'react';
import { Check, Copy } from 'lucide-react';
import hljs from 'highlight.js';

export default function CodeBlock({ language, code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code: ', err);
    }
  };

  const displayLanguage = language || 'code';

  // Use highlight.js directly for syntax highlighting
  const highlightedHtml = useMemo(() => {
    if (!code) return '';
    try {
      if (language && hljs.getLanguage(language)) {
        return hljs.highlight(code, { language }).value;
      }
      return hljs.highlightAuto(code).value;
    } catch {
      // Fallback to plain text if highlighting fails
      return code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }
  }, [code, language]);

  return (
    <div className="relative my-4 rounded-xl overflow-hidden border border-border-subtle bg-[#1e1e1e] text-[#abb2bf] text-sm font-mono shadow-sm">
      {/* Code block header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] text-xs text-neutral-400 select-none">
        <span className="font-sans font-medium uppercase tracking-wide">
          {displayLanguage}
        </span>
        <button
          onClick={handleCopy}
          aria-label="Copy code"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-sans text-neutral-300 hover:text-white hover:bg-neutral-700/60 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>

      {/* Code content with syntax highlighting */}
      <pre className="p-4 overflow-x-auto text-[13px] leading-relaxed m-0">
        <code
          className={`hljs language-${language || ''}`}
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
        />
      </pre>
    </div>
  );
}
