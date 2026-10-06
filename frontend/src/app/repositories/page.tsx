"use client";

import { useState } from "react";
import {
  FolderGit2,
  Plus,
  ExternalLink,
  X,
} from "lucide-react";

export default function RepositoriesPage() {
  const [isOpen, setIsOpen] = useState(false);

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

        {/* Connect Repository Button */}
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-zinc-200"
        >
          <Plus className="h-4 w-4" />
          Connect Repository
        </button>

      </div>

      {/* Repository List */}
      <section className="mt-8">

        <div className="rounded-xl border border-zinc-800 bg-zinc-900">

          <div className="flex items-center justify-between p-6">

            <div className="flex items-start gap-4">

              {/* Repository Icon */}
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800">
                <FolderGit2 className="h-5 w-5 text-zinc-300" />
              </div>

              {/* Repository Info */}
              <div>
                <h2 className="font-semibold">
                  DevLens
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  github.com/sasmith1406/devlens
                </p>

                <div className="mt-3 flex items-center gap-3 text-xs text-zinc-500">
                  <span>TypeScript</span>
                  <span>·</span>
                  <span>Next.js</span>
                  <span>·</span>
                  <span>React</span>
                </div>
              </div>

            </div>

            {/* View Repository */}
            <button className="flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800">
              View Repository
              <ExternalLink className="h-4 w-4" />
            </button>

          </div>

        </div>

      </section>

      {/* Connect Repository Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">

          <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">

            {/* Modal Header */}
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
                className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            {/* Repository URL */}
            <div className="mt-6">

              <label className="text-sm font-medium text-zinc-300">
                GitHub Repository URL
              </label>

              <input
                type="text"
                placeholder="https://github.com/user/repository"
                className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-zinc-500"
              />

            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-3">

              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
              >
                Cancel
              </button>

              <button
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-zinc-200"
              >
                Connect
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}