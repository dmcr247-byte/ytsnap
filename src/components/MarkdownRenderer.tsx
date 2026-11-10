import React from "react";

interface MarkdownRendererProps {
  content: string;
}

function parseInline(text: string): React.ReactNode[] {
  // Regex to split by markdown links [text](url), bold **text**, inline `code`, italic *text*
  const tokens: React.ReactNode[] = [];
  const regex = /(\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|`([^`]+)`|\*([^*]+)\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(text.slice(lastIndex, match.index));
    }

    if (match[2] && match[3]) {
      // Link [text](url)
      const linkText = match[2];
      const linkUrl = match[3];
      const isInternal = linkUrl.startsWith("/") || linkUrl.startsWith("#");
      tokens.push(
        <a
          key={match.index}
          href={linkUrl}
          target={isInternal ? undefined : "_blank"}
          rel={isInternal ? undefined : "noopener noreferrer"}
          className="text-primary font-semibold hover:underline"
        >
          {linkText}
        </a>
      );
    } else if (match[4]) {
      // Bold **text**
      tokens.push(
        <strong key={match.index} className="font-bold text-slate-900 dark:text-white">
          {match[4]}
        </strong>
      );
    } else if (match[5]) {
      // Code `code`
      tokens.push(
        <code
          key={match.index}
          className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-primary font-mono text-xs"
        >
          {match[5]}
        </code>
      );
    } else if (match[6]) {
      // Italic *text*
      tokens.push(<em key={match.index}>{match[6]}</em>);
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push(text.slice(lastIndex));
  }

  return tokens.length > 0 ? tokens : [text];
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null;

  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. Empty lines
    if (!trimmed) {
      i++;
      continue;
    }

    // 2. Heading 1 (#)
    if (line.startsWith("# ")) {
      elements.push(
        <h1 key={i} className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-10 mb-4">
          {parseInline(line.slice(2))}
        </h1>
      );
      i++;
      continue;
    }

    // 3. Heading 2 (##)
    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-8 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
          {parseInline(line.slice(3))}
        </h2>
      );
      i++;
      continue;
    }

    // 4. Heading 3 (###)
    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="text-xl font-bold text-slate-900 dark:text-white mt-6 mb-3">
          {parseInline(line.slice(4))}
        </h3>
      );
      i++;
      continue;
    }

    // 5. Blockquote (> ...)
    if (line.startsWith("> ")) {
      elements.push(
        <blockquote
          key={i}
          className="border-l-4 border-primary bg-primary/5 dark:bg-primary/10 pl-4 py-2 my-4 rounded-r-xl text-slate-700 dark:text-slate-300 italic"
        >
          {parseInline(line.slice(2))}
        </blockquote>
      );
      i++;
      continue;
    }

    // 6. Horizontal rule (---)
    if (trimmed === "---" || trimmed === "***") {
      elements.push(<hr key={i} className="my-8 border-slate-200 dark:border-slate-800" />);
      i++;
      continue;
    }

    // 7. Table detection (| ... |)
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) {
        tableLines.push(lines[i].trim());
        i++;
      }

      if (tableLines.length >= 2) {
        const headerRow = tableLines[0]
          .split("|")
          .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
          .map((c) => c.trim());

        const bodyRows = tableLines.slice(2).map((rowLine) =>
          rowLine
            .split("|")
            .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
            .map((c) => c.trim())
        );

        elements.push(
          <div key={`table-${i}`} className="my-6 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-100 dark:bg-slate-800/80 font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800">
                <tr>
                  {headerRow.map((h, colIdx) => (
                    <th key={colIdx} className="p-3.5 whitespace-nowrap">
                      {parseInline(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {bodyRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-3.5 align-top text-slate-700 dark:text-slate-300">
                        {parseInline(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
    }

    // 8. Unordered list item (- ... or * ...)
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const listItems: string[] = [];
      while (i < lines.length && (lines[i].trim().startsWith("- ") || lines[i].trim().startsWith("* "))) {
        listItems.push(lines[i].trim().slice(2));
        i++;
      }

      elements.push(
        <ul key={`ul-${i}`} className="list-disc list-inside my-4 space-y-1.5 text-slate-700 dark:text-slate-300 pl-2">
          {listItems.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {parseInline(item)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // 9. Ordered list item (1. ...)
    if (/^\d+\.\s/.test(trimmed)) {
      const listItems: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        const itemText = lines[i].trim().replace(/^\d+\.\s/, "");
        listItems.push(itemText);
        i++;
      }

      elements.push(
        <ol key={`ol-${i}`} className="list-decimal list-inside my-4 space-y-1.5 text-slate-700 dark:text-slate-300 pl-2">
          {listItems.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {parseInline(item)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // 10. Normal Paragraph
    elements.push(
      <p key={i} className="my-3 text-slate-700 dark:text-slate-300 leading-relaxed">
        {parseInline(line)}
      </p>
    );
    i++;
  }

  return <div className="space-y-1">{elements}</div>;
}
