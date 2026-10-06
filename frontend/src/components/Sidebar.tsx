"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderGit2,
  Network,
  MessageSquare,
  BarChart3,
  Settings,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-zinc-800 bg-zinc-950 text-white">

      {/* Logo */}
      <div className="border-b border-zinc-800 px-6 py-5">
        <h1 className="text-xl font-bold">DevLens</h1>

        <p className="mt-1 text-xs text-zinc-500">
          AI Code Intelligence
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">

        {/* Overview */}
        <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Overview
        </p>

        <div className="space-y-1">

          {/* Dashboard */}
          <Link
            href="/"
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
              pathname === "/"
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>

          {/* Repositories */}
          <Link
            href="/repositories"
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm ${
              pathname === "/repositories"
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
            }`}
          >
            <FolderGit2 className="h-4 w-4" />
            <span>Repositories</span>
          </Link>

        </div>

        {/* Intelligence */}
        <p className="mb-3 mt-8 px-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Intelligence
        </p>

        <div className="space-y-1">

          {/* Architecture */}
          <Link
            href="/architecture"
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm ${
              pathname === "/architecture"
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
            }`}
          >
            <Network className="h-4 w-4" />
            <span>Architecture</span>
          </Link>

          {/* AI Chat */}
          <Link
            href="/ai-chat"
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm ${
              pathname === "/ai-chat"
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>AI Chat</span>
          </Link>

          {/* Analysis */}
          <Link
            href="/analysis"
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm ${
              pathname === "/analysis"
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Analysis</span>
          </Link>

        </div>

      </nav>

      {/* Bottom section */}
      <div className="border-t border-zinc-800 p-4">

        {/* Settings */}
        <Link
          href="/settings"
          className={`mb-3 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm ${
            pathname === "/settings"
              ? "bg-zinc-800 text-white"
              : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
          }`}
        >
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </Link>

        {/* User */}
        <div className="rounded-lg bg-zinc-900 p-3">
          <p className="text-sm font-medium">S sasmith</p>

          <p className="mt-1 text-xs text-zinc-500">
            Developer
          </p>
        </div>

      </div>

    </aside>
  );
}