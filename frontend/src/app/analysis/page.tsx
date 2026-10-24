
"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import MermaidDiagram from "@/components/MermaidDiagram";

type Repository = {
  id: number;
  owner: string;
  name: string;
  url: string;
  createdAt: string;
};

type RepositoryFile = {
  path: string;
  type: string;
  sha: string;
  size?: number;
};

type ArchitectureResult = {
  success: boolean;
  repositoryName: string;
  analysis: string;
  sources: string[];
};

export default function AnalysisPage() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepoId, setSelectedRepoId] = useState("");
  const [isLoadingRepos, setIsLoadingRepos] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ArchitectureResult | null>(null);

  useEffect(() => {
    async function loadRepositories() {
      try {
        const response = await fetch(
          "http://localhost:5000/api/repositories"
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not load repositories.");
        }

        const savedRepos: Repository[] = data.repositories ?? [];
        setRepositories(savedRepos);

        if (savedRepos.length > 0) {
          setSelectedRepoId(String(savedRepos[0].id));
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Could not load repositories. Is the backend running?"
        );
      } finally {
        setIsLoadingRepos(false);
      }
    }

    void loadRepositories();
  }, []);

  async function handleAnalyze() {
    const selectedRepo = repositories.find(
      (repo) => String(repo.id) === selectedRepoId
    );

    if (!selectedRepo) {
      setError("Please select a repository first.");
      return;
    }

    setError("");
    setResult(null);
    setIsAnalyzing(true);

    try {
      // Step 1: Fetch the repository's file tree.
      const treeResponse = await fetch(
        `http://localhost:5000/api/repositories/${selectedRepo.id}/files`
      );
      const treeData = await treeResponse.json();

      if (!treeResponse.ok || !treeData.success) {
        throw new Error(
          treeData.message || "Could not fetch repository files."
        );
      }

      const entries: RepositoryFile[] = treeData.entries ?? [];

      // Step 2: Prefer important project and source files.
      
      
      // Identify useful files dynamically, regardless of repository name.
      const ignoredDirectories = new Set([
        "node_modules",
        ".git",
        ".next",
        "dist",
        "build",
        "coverage",
        "generated",
        "vendor",
        "__pycache__",
        ".venv",
        "venv",
      ]);

      const ignoredExtensions = new Set([
        ".lock",
        ".min.js",
        ".map",
        ".svg",
        ".png",
        ".jpg",
        ".jpeg",
        ".webp",
        ".ico",
        ".woff",
        ".woff2",
        ".ttf",
        ".pdf",
      ]);

      function getFilePriority(path: string): number {
        const normalizedPath = path.toLowerCase();
        const fileName =
          normalizedPath.split("/").pop() ?? normalizedPath;

        // Project manifests and high-value documentation
        if (
          [
            "package.json",
            "pyproject.toml",
            "requirements.txt",
            "pom.xml",
            "build.gradle",
            "build.gradle.kts",
            "cargo.toml",
            "go.mod",
            "composer.json",
            "gemfile",
            "readme.md",
          ].includes(fileName)
        ) {
          return fileName === "readme.md" ? 1 : 0;
        }

        // Common application entry points
        if (
          [
            "server.ts",
            "server.js",
            "app.ts",
            "app.js",
            "main.ts",
            "main.js",
            "main.py",
            "main.java",
            "index.ts",
            "index.js",
            "manage.py",
          ].includes(fileName)
        ) {
          return 2;
        }

        // Routes, controllers, services, and API handlers
        if (
          /(^|\/)(routes?|controllers?|services?|handlers?|api)(\/|$)/.test(
            normalizedPath
          )
        ) {
          return 3;
        }

        // Database models, schemas, and migrations
        if (
          /(^|\/)(models?|schemas?|entities|repositories|migrations|prisma)(\/|$)/.test(
            normalizedPath
          ) ||
          /\.(prisma|sql)$/.test(normalizedPath)
        ) {
          return 4;
        }

        // Application source code
        if (
          /(^|\/)(src|app|pages|lib|components|backend|frontend)(\/|$)/.test(
            normalizedPath
          )
        ) {
          return 5;
        }

        // Configuration files can provide supporting context
        if (
          /(^|\/)(config|configs|configuration)(\/|$)/.test(
            normalizedPath
          ) ||
          /\.(json|ya?ml|toml)$/.test(normalizedPath)
        ) {
          return 6;
        }

        return 7;
      }

      
      const sourceFiles = entries.filter((file) => {
        const pathParts = file.path.split("/");
        const normalizedPath = file.path.toLowerCase();
        const fileName = pathParts[pathParts.length - 1].toLowerCase();

        return (
          file.type === "blob" &&
          !pathParts.some((part) => ignoredDirectories.has(part.toLowerCase())) &&
          ![...ignoredExtensions].some((extension) =>
            normalizedPath.endsWith(extension)
          ) &&
          !fileName.startsWith(".")
        );
      });

      // Choose a representative set of files rather than letting
      // package manifests and documentation crowd out application code.
      const categories = [
        {
          name: "manifest",
          matches: (path: string) =>
            [
              "package.json",
              "pyproject.toml",
              "requirements.txt",
              "pom.xml",
              "build.gradle",
              "build.gradle.kts",
              "cargo.toml",
              "go.mod",
              "composer.json",
              "gemfile",
            ].includes(path.split("/").pop()!.toLowerCase()),
          limit: 2,
        },
        {
          name: "documentation",
          matches: (path: string) =>
            path.split("/").pop()!.toLowerCase() === "readme.md",
          limit: 1,
        },
        {
          name: "entry point",
          matches: (path: string) =>
            /(^|\/)(server|app|main|index|manage)\.(ts|tsx|js|jsx|mjs|cjs|py|java|go)$/.test(
              path.toLowerCase()
            ),
          limit: 2,
        },
        {
          name: "routes and services",
          matches: (path: string) =>
            /(^|\/)(routes?|controllers?|services?|handlers?|api)(\/|$)/.test(
              path.toLowerCase()
            ),
          limit: 6,
        },
        {
          name: "data layer",
          matches: (path: string) =>
            /(^|\/)(models?|schemas?|entities|repositories|migrations|prisma)(\/|$)/.test(
              path.toLowerCase()
            ) ||
            /\.(prisma|sql)$/.test(path.toLowerCase()),
          limit: 2,
        },
      ];

      const selectedPaths = new Set<string>();
      const selectedFiles: typeof sourceFiles = [];

      // Fill each architectural category before adding general source files.
      for (const category of categories) {
        const matches = sourceFiles
          .filter(
            (file) =>
              !selectedPaths.has(file.path) &&
              category.matches(file.path)
          )
          .sort(
            (a, b) =>
              (a.size ?? Number.MAX_SAFE_INTEGER) -
              (b.size ?? Number.MAX_SAFE_INTEGER)
          );

        for (const file of matches.slice(0, category.limit)) {
          selectedFiles.push(file);
          selectedPaths.add(file.path);
        }
      }

      // Use remaining slots for other source files from across the repository.
      const remainingFiles = sourceFiles
        .filter((file) => !selectedPaths.has(file.path))
        .sort((a, b) => {
          const aIsSource = /\.(ts|tsx|js|jsx|mjs|cjs|py|java|go|rs|php|rb|cs|cpp|c|h|vue|svelte)$/.test(
            a.path.toLowerCase()
          );
          const bIsSource = /\.(ts|tsx|js|jsx|mjs|cjs|py|java|go|rs|php|rb|cs|cpp|c|h|vue|svelte)$/.test(
            b.path.toLowerCase()
          );

          if (aIsSource !== bIsSource) {
            return aIsSource ? -1 : 1;
          }

          return (
            (a.size ?? Number.MAX_SAFE_INTEGER) -
            (b.size ?? Number.MAX_SAFE_INTEGER)
          );
        });

      for (const file of remainingFiles) {
        if (selectedFiles.length >= 30) break;
        selectedFiles.push(file);
      }




      if (selectedFiles.length === 0) {
        throw new Error("No suitable source files were found in this repository.");
      }

      // Step 3: Fetch selected files, respecting the backend's size limits.
      const fileContents: { path: string; content: string }[] = [];
      let totalChars = 0;

      for (const file of selectedFiles) {
        if (totalChars >= 40000) {
          break;
        }

        const contentResponse = await fetch(
          `http://localhost:5000/api/repositories/${selectedRepo.id}/files/content?path=${encodeURIComponent(file.path)}`
        );

        const contentData = await contentResponse.json();

        if (!contentResponse.ok || !contentData.success) {
          continue;
        }

        const content: string = contentData.file.content ?? "";

        if (content.length > 20000) {
          continue;
        }

        if (totalChars + content.length > 40000) {
          continue;
        }

        fileContents.push({
          path: file.path,
          content,
        });

        totalChars += content.length;
      }

      if (fileContents.length === 0) {
        throw new Error(
          "Could not read suitable source files. Check repository access and file sizes."
        );
      }

      // Step 4: Ask the backend to analyze the collected files.
      const analysisResponse = await fetch(
        "http://localhost:5000/api/ai/architecture",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            repositoryName: `${selectedRepo.owner}/${selectedRepo.name}`,
            files: fileContents,
          }),
        }
      );

      const analysisData = await analysisResponse.json();

      if (!analysisResponse.ok || !analysisData.success) {
        throw new Error(
          analysisData.message || "Architecture analysis failed."
        );
      }

      setResult(analysisData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong during architecture analysis."
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <div className="p-8">
      <p className="text-sm text-blue-400">Developer Workspace</p>

      <h1 className="mt-1 text-3xl font-bold">
        Architecture Analysis
      </h1>

      <p className="mt-2 text-zinc-400">
        Understand your repository&apos;s components, relationships, and data flow with AI.
      </p>

      <section className="mt-8 max-w-3xl rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <label
          htmlFor="repository"
          className="block text-sm font-medium text-zinc-300"
        >
          Select repository
        </label>

        <select
          id="repository"
          value={selectedRepoId}
          onChange={(event) => {
            setSelectedRepoId(event.target.value);
            setResult(null);
            setError("");
          }}
          disabled={isLoadingRepos || isAnalyzing || repositories.length === 0}
          className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500 disabled:opacity-50"
        >
          {isLoadingRepos ? (
            <option value="">Loading repositories...</option>
          ) : repositories.length === 0 ? (
            <option value="">No repositories connected</option>
          ) : (
            repositories.map((repo) => (
              <option key={repo.id} value={String(repo.id)}>
                {repo.owner}/{repo.name}
              </option>
            ))
          )}
        </select>

        {repositories.length === 0 && !isLoadingRepos && (
          <p className="mt-3 text-sm text-zinc-400">
            Connect a GitHub repository from the Repositories page first.
          </p>
        )}

        <button
          onClick={() => void handleAnalyze()}
          disabled={
            isLoadingRepos ||
            isAnalyzing ||
            repositories.length === 0 ||
            !selectedRepoId
          }
          className="mt-5 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isAnalyzing ? "Analyzing architecture..." : "Analyze Architecture"}
        </button>

        {isAnalyzing && (
          <p className="mt-3 text-sm text-zinc-400">
            Fetching source files and generating your architecture report. This may take a little while.
          </p>
        )}
      </section>

      {error && (
        <div
          role="alert"
          className="mt-6 max-w-3xl rounded-lg border border-red-800 bg-red-950/30 p-4 text-sm text-red-300"
        >
          {error}
        </div>
      )}

      {result && (
        <section className="mt-8 max-w-5xl">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-xl font-semibold">
              Report: {result.repositoryName}
            </h2>

            <p className="mt-2 text-sm text-zinc-400">
              Based on {result.sources.length} source files.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {result.sources.map((path) => (
                <span
                  key={path}
                  className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-300"
                >
                  {path}
                </span>
              ))}
            </div>

            
<div className="mt-6 break-words border-t border-zinc-800 pt-6 text-sm leading-7 text-zinc-200">
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      h1: ({ children }) => (
        <h1 className="mb-4 mt-8 text-2xl font-bold text-white">
          {children}
        </h1>
      ),
      h2: ({ children }) => (
        <h2 className="mb-3 mt-7 text-xl font-semibold text-white">
          {children}
        </h2>
      ),
      h3: ({ children }) => (
        <h3 className="mb-2 mt-5 text-lg font-semibold text-blue-300">
          {children}
        </h3>
      ),
      p: ({ children }) => (
        <p className="mb-4">{children}</p>
      ),
      strong: ({ children }) => (
        <strong className="font-semibold text-white">
          {children}
        </strong>
      ),
      ul: ({ children }) => (
        <ul className="mb-4 list-disc space-y-2 pl-6">
          {children}
        </ul>
      ),
      ol: ({ children }) => (
        <ol className="mb-4 list-decimal space-y-2 pl-6">
          {children}
        </ol>
      ),
      li: ({ children }) => <li className="pl-1">{children}</li>,
      code: ({ children, className }) => {
  const language = /language-(\w+)/.exec(className || "")?.[1];

  if (language === "mermaid") {
    return (
      <MermaidDiagram chart={String(children).replace(/\n$/, "")} />
    );
  }

  if (!className) {
    return (
      <code className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-xs text-blue-200">
        {children}
      </code>
    );
  }

  return (
    <code className={className}>
      {children}
    </code>
  );
},
      pre: ({ children }) => (
        <pre className="my-4 overflow-x-auto rounded-lg border border-zinc-700 bg-zinc-950 p-4 text-xs leading-6">
          {children}
        </pre>
      ),
      blockquote: ({ children }) => (
        <blockquote className="my-4 border-l-2 border-blue-500 pl-4 text-zinc-400">
          {children}
        </blockquote>
      ),
      hr: () => <hr className="my-6 border-zinc-700" />,
      table: ({ children }) => (
        <div className="my-4 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            {children}
          </table>
        </div>
      ),
      th: ({ children }) => (
        <th className="border border-zinc-700 bg-zinc-800 px-3 py-2 font-semibold text-white">
          {children}
        </th>
      ),
      td: ({ children }) => (
        <td className="border border-zinc-700 px-3 py-2">
          {children}
        </td>
      ),
    }}
  >
    {result.analysis}
  </ReactMarkdown>
</div>

          </div>
        </section>
      )}
    </div>
  );
}
