
"use client";

import { useEffect, useState } from "react";
import {
  FolderGit2,
  Plus,
  ExternalLink,
  X,
} from "lucide-react";

type Repository = {
  id: number;
  owner: string;
  name: string;
  url: string;
  createdAt: string;
};

export default function RepositoriesPage() {
  
const [isOpen, setIsOpen] = useState(false);
const [repositoryUrl, setRepositoryUrl] = useState("");
const [repositories, setRepositories] = useState<Repository[]>([]);
const [error, setError] = useState("");
const [isLoading, setIsLoading] = useState(false);
const [isFetching, setIsFetching] = useState(true);

async function fetchRepositories() {
  setIsFetching(true);
  setError("");

  try {
    const response = await fetch(
      "http://localhost:5000/api/repositories"
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Unable to load repositories."
      );
    }

    setRepositories(data.repositories);
  } catch {
    setError(
      "Could not load repositories. Make sure the backend is running."
    );
  } finally {
    setIsFetching(false);
  }
}

useEffect(() => {
  void fetchRepositories();
}, []);



  
async function handleConnect() {
  setError("");

  if (!repositoryUrl.trim()) {
    setError("Please enter a GitHub repository URL.");
    return;
  }

  setIsLoading(true);

  try {
    const response = await fetch(
      "http://localhost:5000/api/repositories",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: repositoryUrl.trim(),
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Unable to connect repository.");
      return;
    }

    setRepositories((current) => [
      data.repository,
      ...current,
    ]);

    setRepositoryUrl("");
    setIsOpen(false);
  } catch {
    setError(
      "Could not reach the backend. Make sure the server is running."
    );
  } finally {
    setIsLoading(false);
  }
}


  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-blue-400">
            Developer Workspace
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            Repositories
          </h1>

          <p className="mt-2 text-zinc-400">
            Connect and analyze your GitHub repositories.
          </p>
        </div>

        <button
          onClick={() => {
            setError("");
            setIsOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-zinc-200"
        >
          <Plus className="h-4 w-4" />
          Connect Repository
        </button>
      </div>

      {/* Existing repository */}
      
{/* Repository list */}
<section className="mt-8">
  {isFetching ? (
    <p className="text-sm text-zinc-400">
      Loading repositories...
    </p>
  ) : repositories.length === 0 ? (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center">
      <FolderGit2 className="mx-auto h-8 w-8 text-zinc-500" />

      <h2 className="mt-3 font-semibold">
        No repositories yet
      </h2>

      <p className="mt-2 text-sm text-zinc-400">
        Connect a GitHub repository to get started.
      </p>
    </div>
  ) : (
    <div className="space-y-4">
      {repositories.map((repo) => (
        <div
          key={repo.id}
          className="rounded-xl border border-zinc-800 bg-zinc-900"
        >
          <div className="flex items-center justify-between gap-4 p-6">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
                <FolderGit2 className="h-5 w-5 text-zinc-300" />
              </div>

              <div className="min-w-0">
                <h2 className="font-semibold">
                  {repo.owner}/{repo.name}
                </h2>

                <p className="mt-1 break-all text-sm text-zinc-500">
                  {repo.url}
                </p>

                <p className="mt-2 text-xs text-zinc-500">
                  Added{" "}
                  {new Date(repo.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <a
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex shrink-0 items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
            >
              View
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      ))}
    </div>
  )}
</section>


      {/* Newly accepted repository */}

      {/* Error message */}
      {error && (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-red-800 bg-red-950/30 p-4 text-sm text-red-300"
        >
          {error}
        </div>
      )}

      {/* Connect Repository Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  Connect Repository
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Add a GitHub repository to DevLens.
                </p>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close modal"
                className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6">
              <label
                htmlFor="repositoryUrl"
                className="text-sm font-medium text-zinc-300"
              >
                GitHub Repository URL
              </label>

              <input
                id="repositoryUrl"
                type="url"
                value={repositoryUrl}
                onChange={(event) =>
                  setRepositoryUrl(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !isLoading) {
                    void handleConnect();
                  }
                }}
                placeholder="https://github.com/user/repository"
                className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-zinc-500"
              />
            </div>

            {error && (
              <p role="alert" className="mt-3 text-sm text-red-400">
                {error}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setError("");
                }}
                disabled={isLoading}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={() => void handleConnect()}
                disabled={isLoading}
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? "Connecting..." : "Connect"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
