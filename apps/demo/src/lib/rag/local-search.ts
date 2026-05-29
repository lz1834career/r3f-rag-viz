import type { RetrievalChunk } from "r3f-rag-viz-core";
import corpus from "@/data/knowledge-corpus.json";

type CorpusDoc = {
  id: string;
  label: string;
  content: string;
  metadata?: Record<string, unknown>;
};

const documents = corpus.nodes as CorpusDoc[];

const STOP_WORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could",
  "should", "may", "might", "must", "shall", "can", "need", "dare",
  "ought", "used", "to", "of", "in", "for", "on", "with", "at", "by",
  "from", "as", "into", "through", "during", "before", "after", "above",
  "below", "between", "under", "again", "further", "then", "once", "and",
  "but", "or", "nor", "not", "so", "yet", "both", "each", "few", "more",
  "most", "other", "some", "such", "no", "only", "own", "same", "than",
  "too", "very", "just", "also", "what", "how", "when", "where", "why",
  "which", "who", "whom", "this", "that", "these", "those", "it", "its",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));
}

function termFrequency(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const t of tokens) {
    tf.set(t, (tf.get(t) ?? 0) + 1);
  }
  return tf;
}

const docTokens = documents.map((d) =>
  tokenize(`${d.label} ${d.content} ${JSON.stringify(d.metadata ?? {})}`)
);
const docTfs = docTokens.map(termFrequency);
const N = documents.length;

const df = new Map<string, number>();
for (const tokens of docTokens) {
  const seen = new Set(tokens);
  for (const t of seen) {
    df.set(t, (df.get(t) ?? 0) + 1);
  }
}

function scoreDocument(queryTokens: string[], docIndex: number): number {
  const tf = docTfs[docIndex];
  let score = 0;
  for (const term of queryTokens) {
    const freq = tf.get(term) ?? 0;
    if (freq === 0) continue;
    const idf = Math.log((N + 1) / ((df.get(term) ?? 0) + 1)) + 1;
    score += (freq / docTokens[docIndex].length) * idf;
  }
  const labelBoost = documents[docIndex].label
    .toLowerCase()
    .split(/\s+/)
    .some((w) => queryTokens.includes(w.toLowerCase()))
    ? 0.15
    : 0;
  return score + labelBoost;
}

/**
 * Local BM25-style retrieval — no API key required for the demo.
 */
export function searchCorpus(query: string, topK = 6): RetrievalChunk[] {
  const q = query.trim();
  if (!q) return [];

  const queryTokens = tokenize(q);
  if (queryTokens.length === 0) return [];

  const scored = documents
    .map((doc, i) => ({
      doc,
      score: scoreDocument(queryTokens, i),
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  const maxScore = scored[0]?.score ?? 1;

  return scored.map(({ doc, score }) => ({
    id: doc.id,
    label: doc.label,
    content: doc.content,
    metadata: doc.metadata,
    score: Math.min(0.99, 0.5 + (score / maxScore) * 0.49),
  }));
}

export function getCorpusEdges() {
  return corpus.edges;
}
