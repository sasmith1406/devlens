"use client";

import { useEffect, useState } from "react";
import { Copy, Check } from "lucide-react";
import { codeToHtml } from "shiki";

type CodeViewerProps = {
  code: string;
  filePath: string;
};

export default function CodeViewer({
  code,
  filePath,
}: CodeViewerProps) {
    const fileName = filePath.split("/").pop() ?? filePath;
const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
const lineCount = code.split("\n").length;
const languageLabels: Record<string, string> = {
  ts: "TypeScript",
  tsx: "TypeScript JSX",
  js: "JavaScript",
  jsx: "JavaScript JSX",
  json: "JSON",
  css: "CSS",
  html: "HTML",
  md: "Markdown",
  py: "Python",
  java: "Java",
  sql: "SQL",
  yml: "YAML",
  yaml: "YAML",
  sh: "Shell",
};

const languageLabel = languageLabels[extension] ?? "Plain text";
  const [highlightedCode, setHighlightedCode] = useState("");
  const [isHighlighting, setIsHighlighting] = useState(true);
  const [highlightError, setHighlightError] = useState(false);
  const [copied, setCopied] = useState(false);
  async function handleCopy() {
  try {
    await navigator.clipboard.writeText(code);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  } catch {
    setCopied(false);
  }
}

  useEffect(() => {
    let cancelled = false;

    async function highlightCode() {
      setIsHighlighting(true);
      setHighlightError(false);

      try {
        const extension = filePath.split(".").pop()?.toLowerCase();

        const languageMap: Record<string, string> = {
          ts: "typescript",
          tsx: "tsx",
          js: "javascript",
          jsx: "jsx",
          json: "json",
          css: "css",
          html: "html",
          md: "markdown",
          py: "python",
          java: "java",
          sql: "sql",
          yml: "yaml",
          yaml: "yaml",
          sh: "bash",
        };

        const language = languageMap[extension ?? ""] ?? "text";

        const html = await codeToHtml(code, {
  lang: language,
  theme: "github-dark",
  transformers: [
    {
      pre(node) {
        node.properties.style =
          "counter-reset: line";
      },
      line(node) {
        node.properties.class = "line";
      },
    },
  ],
});

        if (!cancelled) {
          setHighlightedCode(html);
        }
      } catch {
        if (!cancelled) {
          setHighlightError(true);
        }
      } finally {
        if (!cancelled) {
          setIsHighlighting(false);
        }
      }
    }

    void highlightCode();

    return () => {
      cancelled = true;
    };
  }, [code, filePath]);

  if (isHighlighting) {
    return (
      <p className="text-sm text-zinc-400">
        Highlighting code...
      </p>
    );
  }

  if (highlightError) {
    return (
      <pre className="overflow-x-auto whitespace-pre text-sm leading-6 text-zinc-300">
        <code>{code}</code>
      </pre>
    );
  }

  return (
  <div className="space-y-3">
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-3">
  <div className="min-w-0">
    <p className="truncate text-sm font-medium text-zinc-200">
      {fileName}
    </p>
    <p className="truncate text-xs text-zinc-500">
      {filePath}
    </p>
  </div>

  <div className="flex shrink-0 items-center gap-2">
    <span className="rounded-md bg-zinc-800 px-2 py-1 text-xs text-zinc-300">
      {languageLabel}
    </span>

    <span className="rounded-md bg-zinc-800 px-2 py-1 text-xs text-zinc-300">
      {lineCount} {lineCount === 1 ? "line" : "lines"}
    </span>
  </div>
</div>
    <div className="flex justify-end">
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-2 rounded-md border border-zinc-700 px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800"
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
        {copied ? "Copied!" : "Copy code"}
      </button>
    </div>

    <div
      className="overflow-x-auto text-sm leading-6 [&_pre]:!m-0 [&_pre]:!bg-transparent [&_pre]:!p-0 [&_.line]:before:mr-6 [&_.line]:before:inline-block [&_.line]:before:w-8 [&_.line]:before:text-right [&_.line]:before:text-zinc-500 [&_.line]:before:content-[counter(line)] [&_.line]:before:[counter-increment:line]"
      dangerouslySetInnerHTML={{ __html: highlightedCode }}
    />
  </div>
);
}