import React from "react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * A lightweight renderer supporting both HTML strings and Common Markdown features
 * (headings, bold, italic, blockquotes, unordered lists, paragraphs, links).
 */
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = "",
}) => {
  // If the content starts with HTML tags or contains rich HTML elements, render with dangerouslySetInnerHTML
  const isHtml = /<\/?[a-z][\s\S]*>/i.test(content);

  if (isHtml) {
    return (
      <div
        className={`prose prose-invert max-w-none text-text-muted leading-relaxed space-y-4 ${className}`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  // Parse markdown lines
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = (key: string) => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={key} className="list-disc pl-6 space-y-2 text-text-muted my-4">
          {listItems.map((item, idx) => (
            <li
              key={idx}
              dangerouslySetInnerHTML={{ __html: formatInline(item) }}
            />
          ))}
        </ul>,
      );
      listItems = [];
    }
  };

  const formatInline = (text: string): string => {
    return text
      .replace(
        /\*\*(.*?)\*\*/g,
        '<strong class="text-text-main-light font-semibold">$1</strong>',
      )
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(
        /\[(.*?)\]\((.*?)\)/g,
        '<a href="$2" class="text-primary underline hover:text-primary/80 transition-colors" target="_blank" rel="noopener noreferrer">$1</a>',
      )
      .replace(
        /`([^`]+)`/g,
        '<code class="bg-surface-dark px-1.5 py-0.5 rounded text-xs text-primary font-mono">$1</code>',
      );
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Bullet item
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      listItems.push(trimmed.slice(2));
      return;
    }

    // Flush any pending list
    flushList(`list-${index}`);

    if (!trimmed) {
      return;
    }

    // Headings
    if (trimmed.startsWith("# ")) {
      elements.push(
        <h1
          key={index}
          className="text-2xl sm:text-3xl font-display font-bold text-text-main-light mt-8 mb-4 border-b border-primary/20 pb-2"
        >
          {trimmed.slice(2)}
        </h1>,
      );
    } else if (trimmed.startsWith("## ")) {
      elements.push(
        <h2
          key={index}
          className="text-xl sm:text-2xl font-display font-semibold text-text-main-light mt-6 mb-3"
        >
          {trimmed.slice(3)}
        </h2>,
      );
    } else if (trimmed.startsWith("### ")) {
      elements.push(
        <h3
          key={index}
          className="text-lg sm:text-xl font-display font-semibold text-primary mt-5 mb-2"
        >
          {trimmed.slice(4)}
        </h3>,
      );
    } else if (trimmed.startsWith("> ")) {
      elements.push(
        <blockquote
          key={index}
          className="border-l-4 border-primary/40 pl-4 py-1 italic text-text-muted my-4 bg-primary/5 rounded-r"
          dangerouslySetInnerHTML={{ __html: formatInline(trimmed.slice(2)) }}
        />,
      );
    } else {
      elements.push(
        <p
          key={index}
          className="text-text-muted leading-relaxed my-3"
          dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }}
        />,
      );
    }
  });

  flushList(`list-final`);

  return <div className={`space-y-2 ${className}`}>{elements}</div>;
};

export default MarkdownRenderer;
