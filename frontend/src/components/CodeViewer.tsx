"use client";

import { useEffect, useState } from "react";
import { Copy, Check, Sparkles, LoaderCircle, X } from "lucide-react";
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
  const [explanation, setExplanation] = useState("");
const [isExplaining, setIsExplaining] = useState(false);
const [explanationError, setExplanationError] = useState("");
const [showExplanation, setShowExplanation] = useState(false);
const [review, setReview] = useState("");
const [isReviewing, setIsReviewing] = useState(false);
const [reviewError, setReviewError] = useState("");
const [showReview, setShowReview] = useState(false);
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

async function handleExplainCode() {
  setIsExplaining(true);
  setExplanationError("");
  setExplanation("");
  setShowExplanation(true);

  try {
    const response = await fetch(
      "http://localhost:5000/api/ai/explain",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          filename: fileName,
          language: languageLabel,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Failed to explain the code."
      );
    }

    setExplanation(data.explanation);
  } catch (error) {
    setExplanationError(
      error instanceof Error
        ? error.message
        : "Something went wrong. Please try again."
    );
  } finally {
    setIsExplaining(false);
  }
}


async function handleReviewCode() {
  setIsReviewing(true);
  setReviewError("");
  setReview("");
  setShowReview(true);

  try {
    const response = await fetch(
      "http://localhost:5000/api/ai/review",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          filename: fileName,
          language: languageLabel,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Failed to review the code."
      );
    }

    setReview(data.review);
  } catch (error) {
    setReviewError(
      error instanceof Error
        ? error.message
        : "Something went wrong. Please try again."
    );
  } finally {
    setIsReviewing(false);
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
    
<div className="flex flex-wrap justify-end gap-2">
  <button
    type="button"
    onClick={handleExplainCode}
    disabled={isExplaining}
    className="inline-flex items-center gap-2 rounded-md bg-violet-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
  >
    {isExplaining ? (
      <LoaderCircle size={16} className="animate-spin" />
    ) : (
      <Sparkles size={16} />
    )}
    {isExplaining ? "Explaining..." : "Explain Code"}
  </button>

  
<button
  type="button"
  onClick={handleReviewCode}
  disabled={isReviewing}
  className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
>
  {isReviewing ? (
    <LoaderCircle size={16} className="animate-spin" />
  ) : (
    <Sparkles size={16} />
  )}
  {isReviewing ? "Reviewing..." : "Review Code"}
</button>


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
    
{showExplanation && (
  <section className="rounded-xl border border-violet-500/30 bg-zinc-900/70 p-4 sm:p-5">
    <div className="mb-4 flex items-center justify-between gap-3">
      <h3 className="flex items-center gap-2 font-semibold text-zinc-100">
        <Sparkles size={18} className="text-violet-400" />
        AI Code Explanation
      </h3>

      <button
        type="button"
        onClick={() => setShowExplanation(false)}
        aria-label="Close explanation"
        className="rounded-md p-1 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
      >
        <X size={18} />
      </button>
    </div>

    {isExplaining && (
      <p className="flex items-center gap-2 text-sm text-zinc-400">
        <LoaderCircle size={16} className="animate-spin" />
        Gemini is analyzing your code...
      </p>
    )}

    {explanationError && (
      <p className="text-sm text-red-400">
        {explanationError}
      </p>
    )}

    {explanation && (
      <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-7 text-zinc-300">
        {explanation}
      </pre>
    )}
  </section>
)}


{showReview && (
  <section className="rounded-xl border border-emerald-500/30 bg-zinc-900/70 p-4 sm:p-5">
    <div className="mb-4 flex items-center justify-between gap-3">
      <h3 className="flex items-center gap-2 font-semibold text-zinc-100">
        <Sparkles size={18} className="text-emerald-400" />
        AI Code Review
      </h3>

      <button
        type="button"
        onClick={() => setShowReview(false)}
        aria-label="Close code review"
        className="rounded-md p-1 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
      >
        <X size={18} />
      </button>
    </div>

    {isReviewing && (
      <p className="flex items-center gap-2 text-sm text-zinc-400">
        <LoaderCircle size={16} className="animate-spin" />
        Gemini is reviewing your code...
      </p>
    )}

    {reviewError && (
      <p className="text-sm text-red-400">
        {reviewError}
      </p>
    )}

    {review && (
      <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-7 text-zinc-300">
        {review}
      </pre>
    )}
  </section>
)}


  </div>
);
}