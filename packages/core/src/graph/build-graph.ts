import type { RAGEdge, RAGGraph, RAGNode, RetrievalChunk } from "../types";

/**
 * Turn retrieval hits into a subgraph, keeping edges whose endpoints are both present.
 */
export function buildGraphFromRetrieval(
  results: RetrievalChunk[],
  sourceEdges: RAGEdge[] = []
): RAGGraph {
  const nodes: RAGNode[] = results.map((r) => ({
    id: r.id,
    label: r.label,
    content: r.content,
    score: r.score,
    metadata: r.metadata,
  }));

  const ids = new Set(nodes.map((n) => n.id));
  let edges = sourceEdges.filter(
    (e) => ids.has(e.source) && ids.has(e.target)
  );

  if (edges.length === 0 && nodes.length > 1) {
    edges = autoConnectByScore(nodes);
  }

  return { nodes, edges };
}

/** Fallback: chain nodes by descending relevance when no edges provided. */
function autoConnectByScore(nodes: RAGNode[]): RAGEdge[] {
  const sorted = [...nodes].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  const edges: RAGEdge[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    edges.push({
      id: `auto-${i}`,
      source: sorted[i].id,
      target: sorted[i + 1].id,
      weight: 0.5,
      type: "retrieval-chain",
    });
  }
  return edges;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}
