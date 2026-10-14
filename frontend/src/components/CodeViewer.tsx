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