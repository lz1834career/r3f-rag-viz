"use client";

type SearchBarProps = {
  query: string;
  onQueryChange: (q: string) => void;
  onSearch: (q?: string) => void;
  isLoading?: boolean;
};

const SUGGESTIONS = [
  "vector database embeddings",
  "GraphRAG knowledge graph",
  "React Three Fiber visualization",
  "document chunking reranker",
];

export function SearchBar({
  query,
  onQueryChange,
  onSearch,
  isLoading,
}: SearchBarProps) {
  return (
    <div className="flex flex-col gap-2">
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          onSearch(query);
        }}
      >
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search knowledge base… e.g. vector embeddings"
          className="min-w-0 flex-1 rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Searching…" : "Visualize"}
        </button>
      </form>
      <div className="flex flex-wrap gap-1.5">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              onQueryChange(s);
              onSearch(s);
            }}
            className="rounded-full border border-white/10 bg-zinc-900/80 px-2.5 py-0.5 text-xs text-zinc-500 hover:border-indigo-500/50 hover:text-zinc-300"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
