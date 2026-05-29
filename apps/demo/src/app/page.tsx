"use client";

import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { buildGraphFromRetrieval, type RAGGraph, type SceneChangeEvent } from "r3f-rag-viz-core";
import { NodePanel } from "@/components/NodePanel";
import { SearchBar } from "@/components/SearchBar";
import corpus from "@/data/knowledge-corpus.json";

const RAGScene = dynamic(
  () => import("r3f-rag-viz-react").then((m) => m.RAGScene),
  { ssr: false, loading: () => <SceneLoader /> }
);

function SceneLoader() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#0a0a0f]">
      <div className="text-sm text-zinc-500">Loading 3D scene…</div>
    </div>
  );
}

const DEFAULT_GRAPH = buildGraphFromRetrieval(
  corpus.nodes.map((n) => ({
    id: n.id,
    label: n.label,
    content: n.content,
    score: 0.85,
    metadata: n.metadata,
  })),
  corpus.edges
);

type SearchResponse = {
  graph: RAGGraph;
  meta?: { engine?: string; resultCount?: number };
};

async function fetchSearch(query: string): Promise<SearchResponse> {
  const res = await fetch("/api/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, topK: 6, engine: "auto" }),
  });
  if (!res.ok) throw new Error("Search failed");
  return res.json() as Promise<SearchResponse>;
}

export default function HomePage() {
  const [query, setQuery] = useState("vector database embeddings");
  const [searchQuery, setSearchQuery] = useState("vector database embeddings");

  const { data: searchResult, isFetching, isError, error } = useQuery({
    queryKey: ["rag-search", searchQuery],
    queryFn: () => fetchSearch(searchQuery),
    placeholderData: { graph: DEFAULT_GRAPH, meta: { engine: "local-bm25" } },
  });

  const graph = searchResult?.graph ?? DEFAULT_GRAPH;
  const searchEngine = searchResult?.meta?.engine ?? "local-bm25";

  const handleSceneChange = useCallback((event: SceneChangeEvent) => {
    if (process.env.NODE_ENV === "development") {
      console.log("[r3f-rag-viz] scene change:", event);
    }
  }, []);

  return (
    <div className="flex h-screen flex-col">
      <header className="shrink-0 space-y-3 border-b border-white/10 px-4 py-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-zinc-100">
              r3f-rag-viz
            </h1>
            <p className="text-xs text-zinc-500">
              Search → RAG subgraph → editable 3D knowledge graph
            </p>
          </div>
          <div className="text-right text-xs text-zinc-500">
            <div>{graph.nodes.length} nodes · {graph.edges.length} edges</div>
            <div className="mt-0.5 text-zinc-600">engine: {searchEngine}</div>
            {isFetching && (
              <div className="mt-1 text-indigo-400">Updating…</div>
            )}
          </div>
        </div>
        <SearchBar
          query={query}
          onQueryChange={setQuery}
          onSearch={(q) => setSearchQuery((q ?? query).trim())}
          isLoading={isFetching}
        />
        {isError && (
          <p className="text-xs text-red-400">
            Search error: {(error as Error).message}
          </p>
        )}
      </header>

      <main className="flex min-h-0 flex-1">
        <div className="relative min-w-0 flex-1">
          <RAGScene
            key={searchQuery}
            graph={graph}
            onSceneChange={handleSceneChange}
            className="absolute inset-0"
          />
        </div>
        <NodePanel />
      </main>
    </div>
  );
}
