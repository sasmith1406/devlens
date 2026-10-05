"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  FolderGit2,
  Network,
  MessageSquare,
  BarChart3,
  Settings,
} from "lucide-react";

export default function Sidebar() {
  const [activePage, setActivePage] = useState("Dashboard");

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
          <button
            onClick={() => setActivePage("Dashboard")}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium ${
              activePage === "Dashboard"
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </button>

          {/* Repositories */}
          <button
            onClick={() => setActivePage("Repositories")}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm ${
              activePage === "Repositories"
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
            }`}
          >
            <FolderGit2 className="h-4 w-4" />
            <span>Repositories</span>
          </button>

        </div>

        {/* Intelligence */}
        <p className="mb-3 mt-8 px-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Intelligence
        </p>

        <div className="space-y-1">

          {/* Architecture */}
          <button
            onClick={() => setActivePage("Architecture")}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm ${
              activePage === "Architecture"
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
            }`}
          >
            <Network className="h-4 w-4" />
            <span>Architecture</span>
          </button>

          {/* AI Chat */}
          <button
            onClick={() => setActivePage("AI Chat")}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm ${
              activePage === "AI Chat"
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>AI Chat</span>
          </button>

          {/* Analysis */}
          <button
            onClick={() => setActivePage("Analysis")}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm ${
              activePage === "Analysis"
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Analysis</span>
          </button>

        </div>

      </nav>

      {/* Bottom section */}
      <div className="border-t border-zinc-800 p-4">

        {/* Settings */}
        <button
          onClick={() => setActivePage("Settings")}
          className={`mb-3 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm ${
            activePage === "Settings"
              ? "bg-zinc-800 text-white"
              : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
          }`}
        >
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </button>

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