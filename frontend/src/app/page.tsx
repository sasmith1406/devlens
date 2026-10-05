import Sidebar from "@/components/Sidebar";
import MetricCard from "@/components/MetricCard";

export default function Home() {
  return (
    <div className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <main className="flex-1 p-8">

        {/* Header */}
        <div>
          <p className="text-sm text-blue-400">
            Developer Workspace
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            Dashboard
          </h1>

          <p className="mt-2 text-zinc-400">
            Understand your repositories and codebase health.
          </p>
        </div>

        {/* Metrics */}
        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <MetricCard
            title="Repositories"
            value="3"
            description="Connected repositories"
          />

          <MetricCard
            title="Code Issues"
            value="12"
            description="Detected during analysis"
          />

          <MetricCard
            title="Risk Level"
            value="Medium"
            description="Based on current analysis"
          />
        </section>

        {/* Repository section */}
        <section className="mt-8">
          <h2 className="text-lg font-semibold">
            Recent repositories
          </h2>

          <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="font-medium">
              DevLens
            </p>

            <p className="mt-1 text-sm text-zinc-500">
              TypeScript · Next.js · React
            </p>

            <p className="mt-4 text-sm text-zinc-400">
              Repository analysis will appear here once GitHub
              integration is connected.
            </p>
          </div>
        </section>

      </main>
    </div>
  );
}
