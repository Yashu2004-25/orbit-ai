import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import CodeBlock from './CodeBlock.jsx';

export default function MarkdownView({ content }) {
  // Gracefully complete unclosed code blocks if currently streaming
  const processedContent = useMemo(() => {
    if (!content) return '';
    const codeBlockCount = (content.match(/```/g) || []).length;
    // If odd number of backtick fences, close it so markdown renders without raw backticks
    if (codeBlockCount % 2 !== 0) {
      return content + '\n```';
    }
    return content;
  }, [content]);

  const components = useMemo(() => ({
    // Custom Code & Code block renderer
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const codeString = String(children).replace(/\n$/, '');

      if (!inline && (match || String(children).includes('\n'))) {
        return (
          <CodeBlock
            language={match ? match[1] : ''}
            code={codeString}
          />
        );
      }

      // Inline code
      return (
        <code
          className="bg-input text-text-main px-1.5 py-0.5 rounded text-[13px] font-mono border border-border-subtle"
          {...props}
        >
          {children}
        </code>
      );
    },

    // Links open in new tab securely
    a({ node, children, href, ...props }) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-2 transition-colors"
          {...props}
        >
          {children}
        </a>
      );
    },

    // Responsive tables with borders
    table({ node, children, ...props }) {
      return (
        <div className="my-4 w-full overflow-x-auto rounded-lg border border-border-subtle">
          <table className="w-full text-left text-sm divide-y divide-border-subtle" {...props}>
            {children}
          </table>
        </div>
      );
    },
    thead({ node, children, ...props }) {
      return (
        <thead className="bg-input font-semibold text-text-main" {...props}>
          {children}
        </thead>
      );
    },
    th({ node, children, ...props }) {
      return (
        <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider" {...props}>
          {children}
        </th>
      );
    },
    td({ node, children, ...props }) {
      return (
        <td className="px-4 py-2.5 text-sm border-t border-border-subtle" {...props}>
          {children}
        </td>
      );
    },
    blockquote({ node, children, ...props }) {
      return (
        <blockquote className="border-l-4 border-text-muted/40 pl-4 py-1 italic my-3 text-text-muted" {...props}>
          {children}
        </blockquote>
      );
    },
    ul({ node, children, ...props }) {
      return <ul className="list-disc pl-5 my-2.5 space-y-1.5" {...props}>{children}</ul>;
    },
    ol({ node, children, ...props }) {
      return <ol className="list-decimal pl-5 my-2.5 space-y-1.5" {...props}>{children}</ol>;
    },
    p({ node, children, ...props }) {
      return <p className="my-2.5 leading-relaxed first:mt-0 last:mb-0" {...props}>{children}</p>;
    },
    h1({ node, children, ...props }) {
      return <h1 className="text-xl font-bold mt-6 mb-3 text-text-main" {...props}>{children}</h1>;
    },
    h2({ node, children, ...props }) {
      return <h2 className="text-lg font-bold mt-5 mb-2.5 text-text-main" {...props}>{children}</h2>;
    },
    h3({ node, children, ...props }) {
      return <h3 className="text-base font-semibold mt-4 mb-2 text-text-main" {...props}>{children}</h3>;
    },
  }), []);

  return (
    <div className="prose dark:prose-invert max-w-none text-text-main text-[15px] leading-relaxed break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={components}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}

