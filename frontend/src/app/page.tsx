export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-16">
        
        {/* Header */}
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">DevLens</h1>

          <button className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800">
            Connect Repository
          </button>
        </header>

        {/* Hero */}
        <section className="mt-24 max-w-3xl">
          <p className="text-sm font-medium text-blue-400">
            AI SOFTWARE ENGINEERING INTELLIGENCE
          </p>

          <h2 className="mt-4 text-5xl font-bold tracking-tight">
            Understand any codebase.
            <br />
            <span className="text-zinc-500">Build with confidence.</span>
          </h2>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
            DevLens helps developers understand, analyze, and navigate
            unfamiliar codebases using AI-powered code intelligence.
          </p>
        </section>

        {/* Feature cards */}
        <section className="mt-20 grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <h3 className="text-lg font-semibold">Codebase Q&A</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Ask questions about your repository and understand how the code
              works.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <h3 className="text-lg font-semibold">Architecture</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Visualize how files, services, APIs, and components connect.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <h3 className="text-lg font-semibold">Change Impact</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Understand what could break before you modify important code.
            </p>
          </div>
        </section>

      </div>
    </main>
  );
}
