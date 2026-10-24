
"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

interface MermaidDiagramProps {
  chart: string;
}

export default function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function renderDiagram() {
      if (!containerRef.current) return;

      try {
        setError(false);

        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          securityLevel: "strict",
        });

        const id = `devlens-diagram-${crypto.randomUUID()}`;
        const { svg } = await mermaid.render(id, chart);

        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (err) {
        console.error("Mermaid rendering failed:", err);

        if (!cancelled) {
          setError(true);
        }
      }
    }

    renderDiagram();

    return () => {
      cancelled = true;
    };
  }, [chart]);

  if (error) {
    return (
      <pre className="my-4 overflow-x-auto rounded-lg border border-zinc-700 bg-zinc-950 p-4 text-xs text-zinc-300">
        {chart}
      </pre>
    );
  }

  return (
    <div
      ref={containerRef}
      className="my-6 overflow-x-auto rounded-xl border border-zinc-700 bg-zinc-950 p-4 [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full"
    />
  );
}
