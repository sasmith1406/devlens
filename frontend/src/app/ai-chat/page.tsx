
"use client";

import { useEffect, useState } from "react";
import {
  Bot,
  Send,
  Sparkles,
  Code2,
  Bug,
  GitBranch,
  MessageSquare,
} from "lucide-react";

type Repository = {
  id: number;
  owner: string;
  name: string;
  url: string;
  createdAt: string;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
};

const suggestions = [
  {
    icon: Code2,
    title: "Explain this codebase",
    prompt: "Give me an overview of this repository and its main components.",
  },
  {
    icon: Bug,
    title: "Find potential bugs",
    prompt: "Which areas of this codebase might contain bugs or edge cases?",
  },
  {
    icon: GitBranch,
    title: "Understand the architecture",
    prompt: "Explain how the main modules connect and communicate.",
  },
];

export default function AIChatPage() {
  const [question, setQuestion] = useState("");
  const [repositories, setRepositories] = useState<Repository[]>([]);
const [selectedRepoId, setSelectedRepoId] = useState("");
const [messages, setMessages] = useState<ChatMessage[]>([]);
const [isSending, setIsSending] = useState(false);
const [chatError, setChatError] = useState("");

useEffect(() => {
  async function loadRepositories() {
    try {
      const response = await fetch(
        "http://localhost:5000/api/repositories"
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error("Unable to load repositories.");
      }

      setRepositories(data.repositories);
    } catch (error) {
      console.error("Failed to load repositories:", error);
    }
  }

  void loadRepositories();
}, []);

  function handleSuggestion(prompt: string) {
    setQuestion(prompt);
  }

  async function handleSend() {
  const trimmedQuestion = question.trim();

  const selectedRepo = repositories.find(
    (repo) => String(repo.id) === selectedRepoId
  );

  if (!selectedRepo) {
    setChatError("Please select a repository first.");
    return;
  }

  if (!trimmedQuestion || isSending) {
    return;
  }

  setQuestion("");
  setChatError("");
  setIsSending(true);

  setMessages((current) => [
    ...current,
    { role: "user", content: trimmedQuestion },
  ]);

  try {
    // Step 1: Retrieve the repository's file tree.
    const treeResponse = await fetch(
      `http://localhost:5000/api/repositories/${selectedRepo.id}/files`
    );

    const treeData = await treeResponse.json();

    if (!treeResponse.ok || !treeData.success) {
      throw new Error(
        treeData.message || "Unable to load repository files."
      );
    }

    // Step 2: Prioritize readable source and documentation files.
    const candidateFiles = (
      treeData.entries as {
        path: string;
        type: string;
        size?: number;
      }[]
    )
      .filter(
        (file) =>
          file.type === "blob" &&
          (file.size === undefined || file.size <= 100_000) &&
          /\.(tsx?|jsx?|py|java|go|rs|css|html|json|md|sql|prisma|ya?ml)$/i.test(
            file.path
          ) &&
          !/(^|\/)(node_modules|\.next|dist|build|coverage|vendor|\.git)(\/|$)/i.test(
            file.path
          ) &&
          !/(lock|\.min\.)/i.test(file.path)
      )
      .sort((a, b) => {
        const priority = (path: string) => {
          if (/readme\.md$/i.test(path)) return 0;
          if (/(^|\/)package\.json$/i.test(path)) return 1;
          if (/(^|\/)src\//i.test(path)) return 2;
          return 3;
        };

        return priority(a.path) - priority(b.path);
      })
      .slice(0, 10);

    if (candidateFiles.length === 0) {
      throw new Error(
        "No suitable source files were found in this repository."
      );
    }

    // Step 3: Fetch file contents within the 40,000-character limit.
    const files: { path: string; content: string }[] = [];
    let totalCharacters = 0;

    for (const file of candidateFiles) {
      if (totalCharacters >= 40_000) break;

      const fileResponse = await fetch(
        `http://localhost:5000/api/repositories/${selectedRepo.id}/files/content?path=${encodeURIComponent(file.path)}`
      );

      if (!fileResponse.ok) {
        // Skip files that cannot be retrieved.
        continue;
      }

      const fileData = await fileResponse.json();

      if (!fileData.success || typeof fileData.file?.content !== "string") {
        continue;
      }

      const remainingCharacters = 40_000 - totalCharacters;
      const content = fileData.file.content.slice(
        0,
        Math.min(10_000, remainingCharacters)
      );

      if (!content.trim()) continue;

      files.push({
        path: file.path,
        content,
      });

      totalCharacters += content.length;
    }

    if (files.length === 0) {
      throw new Error(
        "Could not retrieve readable source files from this repository."
      );
    }

    // Step 4: Send the question and source code to Gemini.
    const chatResponse = await fetch(
      "http://localhost:5000/api/ai/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: trimmedQuestion,
          repositoryName: `${selectedRepo.owner}/${selectedRepo.name}`,
          files,
        }),
      }
    );

    const chatData = await chatResponse.json();

    if (!chatResponse.ok || !chatData.success) {
      throw new Error(
        chatData.message || "Unable to generate an AI response."
      );
    }

    // Step 5: Display the AI's answer.
    setMessages((current) => [
      ...current,
      {
        role: "assistant",
        content: chatData.answer,
        sources: chatData.sources,
      },
    ]);
  } catch (error) {
    setChatError(
      error instanceof Error
        ? error.message
        : "Something went wrong. Please try again."
    );
  } finally {
    setIsSending(false);
  }
}

  return (
    <div className="min-h-full bg-zinc-950 px-4 py-6 text-zinc-100 sm:px-8 sm:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-5xl flex-col">
        {/* Page heading */}
        <header className="mb-8">
          <div className="mb-3 flex items-center gap-2 text-sm text-violet-400">
            <Sparkles size={16} />
            <span>DEVLENS AI</span>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-400">Repository Chat</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Talk to your <span className="text-violet-400">codebase.</span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
            Explore your repository, understand complex code, and get
            developer-focused answers with AI.
          </p>
        </header>

        {/* Repository context */}
        <section className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-2">
              <GitBranch size={20} className="text-violet-400" />
            </div>

            <div>
              <p className="text-sm font-medium">Repository context</p>
              <p className="mt-1 text-xs text-zinc-500">
                Connect a repository to begin
              </p>
            </div>
          </div>

          <select
  value={selectedRepoId}
  onChange={(event) => {
    setSelectedRepoId(event.target.value);
    setMessages([]);
  }}
  className="min-w-48 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-violet-500"
  aria-label="Select repository"
>
  <option value="">Select a repository</option>
  {repositories.map((repo) => (
    <option key={repo.id} value={String(repo.id)}>
      {repo.owner}/{repo.name}
    </option>
  ))}
</select>
        </section>

        {/* Chat area */}
        <section className="flex flex-1 flex-col rounded-2xl border border-zinc-800 bg-zinc-900/30">
          <div className="flex items-center gap-3 border-b border-zinc-800 px-5 py-4">
            <div className="rounded-lg bg-violet-500/15 p-2">
              <Bot size={20} className="text-violet-400" />
            </div>

            <div>
              <h2 className="text-sm font-semibold">DevLens Assistant</h2>
              <p className="mt-1 text-xs text-zinc-500">
                Your AI software engineering companion
              </p>
            </div>

            <div className="ml-auto flex items-center gap-2 text-xs text-zinc-500">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Ready
            </div>
          </div>

          
<div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
  {messages.length === 0 ? (
    <div className="flex h-full flex-col items-center justify-center py-12 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10">
        <Bot size={30} className="text-violet-400" />
      </div>

      <h2 className="text-xl font-semibold text-zinc-100">
        Your repository, understood.
      </h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-zinc-400">
        Ask questions about your selected repository. DevLens will inspect
        its source files and use them to generate an answer.
      </p>

      <div className="mt-7 grid w-full max-w-2xl gap-3 sm:grid-cols-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.title}
            type="button"
            onClick={() => handleSuggestion(suggestion.prompt)}
            className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-left transition hover:border-violet-500/40 hover:bg-zinc-900"
          >
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-200">
              <Sparkles size={15} className="text-violet-400" />
              {suggestion.title}
            </div>
            <p className="text-xs leading-5 text-zinc-400">
              {suggestion.prompt}
            </p>
          </button>
        ))}
      </div>
    </div>
  ) : (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      {messages.map((message, index) => (
        <div
          key={`${message.role}-${index}`}
          className={`flex gap-3 ${
            message.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          {message.role === "assistant" && (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10">
              <Bot size={18} className="text-violet-400" />
            </div>
          )}

          <div
            className={`max-w-[85%] rounded-2xl px-4 py-3 ${
              message.role === "user"
                ? "bg-violet-600 text-white"
                : "border border-zinc-800 bg-zinc-900 text-zinc-200"
            }`}
          >
            <p className="whitespace-pre-wrap break-words text-sm leading-7">
              {message.content}
            </p>

            {message.role === "assistant" &&
              message.sources &&
              message.sources.length > 0 && (
                <div className="mt-4 border-t border-zinc-700 pt-3">
                  <p className="mb-2 text-xs font-medium text-zinc-400">
                    Source files
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {message.sources.map((source) => (
                      <span
                        key={source}
                        className="rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1 font-mono text-xs text-violet-300"
                      >
                        {source}
                      </span>
                    ))}
                  </div>
                </div>
              )}
          </div>

          {message.role === "user" && (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800">
              <MessageSquare size={17} className="text-zinc-300" />
            </div>
          )}
        </div>
      ))}

      {isSending && (
        <div className="flex items-center gap-3 text-sm text-zinc-400">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10">
            <Bot size={18} className="text-violet-400" />
          </div>
          DevLens is reading your repository and thinking...
        </div>
      )}
    </div>
  )}
</div>
{chatError && (
  <div
    role="alert"
    className="mx-4 mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 sm:mx-6"
  >
    {chatError}
  </div>
)}

          {/* Message composer */}
          <form
  className="border-t border-zinc-800 p-4 sm:p-5"
  onSubmit={(event) => {
    event.preventDefault();
    void handleSend();
  }}
>
            <div className="flex items-end gap-3 rounded-xl border border-zinc-700 bg-zinc-950 p-3 transition focus-within:border-violet-500/70">
              <textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                onKeyDown={(event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    void handleSend();
  }
}}
                placeholder="Ask anything about your repository..."
                rows={2}
                className="max-h-40 min-h-12 flex-1 resize-y bg-transparent px-1 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
              />

              <button
                type="submit"
disabled={!question.trim() || isSending}
                aria-label="Send message"
                className="rounded-lg bg-violet-600 p-3 text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSending ? (
  <span className="text-xs">...</span>
) : (
  <Send size={17} />
)}
              </button>
            </div>

            <p className="mt-3 text-center text-xs text-zinc-600">
              AI responses can be inaccurate. Verify important code changes.
              <span className="hidden sm:inline"> Enter to send · Shift + Enter for a new line</span>
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}
