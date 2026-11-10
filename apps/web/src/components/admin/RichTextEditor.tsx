import React, { useRef, useEffect, useCallback } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (htmlContent: string) => void;
  placeholder?: string;
}

// Convert markdown to clean HTML for visual editing if initial content is markdown
function markdownToHtml(md: string): string {
  if (!md) return "";
  // If it already contains HTML tags, return as-is
  if (/<[a-z][\s\S]*>/i.test(md)) {
    return md;
  }

  const lines = md.split("\n");
  const htmlParts: string[] = [];
  let inList = false;
  let inNumList = false;

  const closeLists = () => {
    if (inList) {
      htmlParts.push("</ul>");
      inList = false;
    }
    if (inNumList) {
      htmlParts.push("</ol>");
      inNumList = false;
    }
  };

  const formatInline = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(
        /\[(.*?)\]\((.*?)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
      )
      .replace(/`([^`]+)`/g, "<code>$1</code>");
  };

  for (let line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      closeLists();
      continue;
    }

    if (trimmed.startsWith("# ")) {
      closeLists();
      htmlParts.push(`<h1>${formatInline(trimmed.slice(2))}</h1>`);
    } else if (trimmed.startsWith("## ")) {
      closeLists();
      htmlParts.push(`<h2>${formatInline(trimmed.slice(3))}</h2>`);
    } else if (trimmed.startsWith("### ")) {
      closeLists();
      htmlParts.push(`<h3>${formatInline(trimmed.slice(4))}</h3>`);
    } else if (trimmed.startsWith("> ")) {
      closeLists();
      htmlParts.push(
        `<blockquote>${formatInline(trimmed.slice(2))}</blockquote>`,
      );
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      if (!inList) {
        closeLists();
        htmlParts.push("<ul>");
        inList = true;
      }
      htmlParts.push(`<li>${formatInline(trimmed.slice(2))}</li>`);
    } else if (/^\d+\.\s/.test(trimmed)) {
      if (!inNumList) {
        closeLists();
        htmlParts.push("<ol>");
        inNumList = true;
      }
      const itemText = trimmed.replace(/^\d+\.\s/, "");
      htmlParts.push(`<li>${formatInline(itemText)}</li>`);
    } else {
      closeLists();
      htmlParts.push(`<p>${formatInline(trimmed)}</p>`);
    }
  }

  closeLists();
  return htmlParts.join("");
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Type your page content here...",
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalUpdate = useRef(false);

  // Initialize and sync content into visual editor
  useEffect(() => {
    const converted = markdownToHtml(value);
    if (editorRef.current && !isInternalUpdate.current) {
      if (editorRef.current.innerHTML !== converted) {
        editorRef.current.innerHTML = converted;
      }
    }
    isInternalUpdate.current = false;
  }, [value]);

  const handleInput = useCallback(() => {
    if (!editorRef.current) return;
    isInternalUpdate.current = true;
    const html = editorRef.current.innerHTML;
    onChange(html);
  }, [onChange]);

  const exec = (command: string, arg: string | undefined = undefined) => {
    document.execCommand(command, false, arg);
    if (editorRef.current) {
      editorRef.current.focus();
      handleInput();
    }
  };

  const applyHeading = (tag: string) => {
    if (tag === "p") {
      exec("formatBlock", "<p>");
    } else {
      exec("formatBlock", `<${tag}>`);
    }
  };

  const handleInsertLink = () => {
    const url = prompt("Enter link URL (e.g. https://pinak.com or /stores):");
    if (url) {
      exec("createLink", url);
    }
  };

  const handleInsertCallout = () => {
    const quoteHtml = `<blockquote><strong>Note:</strong> Enter important policy or announcement text here...</blockquote><p></p>`;
    exec("insertHTML", quoteHtml);
  };

  const handleInsertDivider = () => {
    exec("insertHorizontalRule");
  };

  const handleInsertContactBox = () => {
    const boxHtml = `<div style="background: rgba(212, 175, 55, 0.08); border: 1px solid rgba(212, 175, 55, 0.25); border-radius: 16px; padding: 20px; margin: 20px 0;">
      <h3 style="color: #D4AF37; margin: 0 0 8px 0; font-size: 18px;">Need Assistance?</h3>
      <p style="margin: 0; color: #a3a3a3; font-size: 14px;">Email our concierge at <a href="mailto:support@pinak.com" style="color: #D4AF37; text-decoration: underline;">support@pinak.com</a> or message us directly on WhatsApp.</p>
    </div><p></p>`;
    exec("insertHTML", boxHtml);
  };

  return (
    <div className="rounded-2xl border border-primary/20 bg-background-main overflow-hidden shadow-inner flex flex-col">
      {/* Visual Formatting Toolbar */}
      <div className="bg-surface-dark/95 border-b border-primary/10 p-2 flex flex-wrap items-center gap-1 select-none">
        {/* Paragraph / Heading selector */}
        <select
          aria-label="Text format"
          onChange={(e) => {
            applyHeading(e.target.value);
            e.target.value = "";
          }}
          defaultValue=""
          className="bg-background-main border border-primary/20 text-text-main-light text-xs rounded-lg px-2.5 py-1.5 outline-none focus:border-primary hover:border-primary/40 cursor-pointer"
        >
          <option value="" disabled>
            Styles
          </option>
          <option value="p">Normal Text</option>
          <option value="h1">Large Heading (H1)</option>
          <option value="h2">Section Heading (H2)</option>
          <option value="h3">Sub Heading (H3)</option>
        </select>

        <div className="h-5 w-px bg-primary/20 mx-1" />

        {/* Formatting buttons */}
        <button
          type="button"
          onClick={() => exec("bold")}
          title="Bold (Ctrl+B)"
          className="w-8 h-8 rounded-lg text-text-main-light hover:text-primary hover:bg-primary/10 flex items-center justify-center transition-colors font-bold text-sm cursor-pointer"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => exec("italic")}
          title="Italic (Ctrl+I)"
          className="w-8 h-8 rounded-lg text-text-main-light hover:text-primary hover:bg-primary/10 flex items-center justify-center transition-colors italic font-serif text-sm cursor-pointer"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => exec("underline")}
          title="Underline (Ctrl+U)"
          className="w-8 h-8 rounded-lg text-text-main-light hover:text-primary hover:bg-primary/10 flex items-center justify-center transition-colors underline text-sm cursor-pointer"
        >
          U
        </button>
        <button
          type="button"
          onClick={() => exec("strikeThrough")}
          title="Strikethrough"
          className="w-8 h-8 rounded-lg text-text-main-light hover:text-primary hover:bg-primary/10 flex items-center justify-center transition-colors line-through text-sm cursor-pointer"
        >
          S
        </button>

        <div className="h-5 w-px bg-primary/20 mx-1" />

        {/* List buttons */}
        <button
          type="button"
          onClick={() => exec("insertUnorderedList")}
          title="Bullet List"
          className="w-8 h-8 rounded-lg text-text-main-light hover:text-primary hover:bg-primary/10 flex items-center justify-center transition-colors cursor-pointer"
        >
          <span className="material-icons-outlined text-lg">
            format_list_bulleted
          </span>
        </button>
        <button
          type="button"
          onClick={() => exec("insertOrderedList")}
          title="Numbered List"
          className="w-8 h-8 rounded-lg text-text-main-light hover:text-primary hover:bg-primary/10 flex items-center justify-center transition-colors cursor-pointer"
        >
          <span className="material-icons-outlined text-lg">
            format_list_numbered
          </span>
        </button>

        <div className="h-5 w-px bg-primary/20 mx-1" />

        {/* Rich Inserts */}
        <button
          type="button"
          onClick={handleInsertLink}
          title="Insert Link"
          className="w-8 h-8 rounded-lg text-text-main-light hover:text-primary hover:bg-primary/10 flex items-center justify-center transition-colors cursor-pointer"
        >
          <span className="material-icons-outlined text-lg">link</span>
        </button>
        <button
          type="button"
          onClick={handleInsertCallout}
          title="Highlight Notice Box"
          className="w-8 h-8 rounded-lg text-text-main-light hover:text-primary hover:bg-primary/10 flex items-center justify-center transition-colors cursor-pointer"
        >
          <span className="material-icons-outlined text-lg">format_quote</span>
        </button>
        <button
          type="button"
          onClick={handleInsertDivider}
          title="Divider Line"
          className="w-8 h-8 rounded-lg text-text-main-light hover:text-primary hover:bg-primary/10 flex items-center justify-center transition-colors cursor-pointer"
        >
          <span className="material-icons-outlined text-lg">
            horizontal_rule
          </span>
        </button>

        <div className="h-5 w-px bg-primary/20 mx-1" />

        {/* Preset template */}
        <button
          type="button"
          onClick={handleInsertContactBox}
          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 transition-all flex items-center gap-1 cursor-pointer"
          title="Insert Support Contact Box"
        >
          <span className="material-icons-outlined text-sm">support_agent</span>
          <span>+ Contact Card</span>
        </button>

        <button
          type="button"
          onClick={() => exec("removeFormat")}
          title="Clear Formatting"
          className="w-8 h-8 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-colors ml-auto cursor-pointer"
        >
          <span className="material-icons-outlined text-lg">format_clear</span>
        </button>
      </div>

      {/* Visual WYSIWYG Editable Document */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        data-placeholder={placeholder}
        className="p-6 min-h-[320px] max-h-[500px] overflow-y-auto outline-none text-text-main-light text-sm leading-relaxed prose prose-invert max-w-none focus:ring-0 empty:before:content-[attr(data-placeholder)] empty:before:text-text-muted/50 cursor-text"
        style={{
          minHeight: "320px",
        }}
      />

      {/* Tip footer */}
      <div className="px-4 py-2 bg-surface-dark/60 border-t border-primary/10 text-[11px] text-text-muted flex items-center justify-between">
        <span>
          💡 Select any text and click <strong>B</strong>, <em>I</em>, or choose
          a Heading from the <strong>Styles</strong> menu.
        </span>
        <span className="opacity-60 hidden sm:inline">Visual mode only</span>
      </div>
    </div>
  );
};

export default RichTextEditor;
