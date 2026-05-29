import {
  buildGraphFromRetrieval,
  cosineSimilarity,
  type RAGGraph,
  type RetrievalChunk,
} from "r3f-rag-viz-core";
import corpus from "@/data/knowledge-corpus.json";
import { getCorpusEdges } from "./local-search";

type CorpusNode = {
  id: string;
  label: string;
  content: string;
  metadata?: Record<string, unknown>;
  embedding?: number[];
};

const nodes = corpus.nodes as CorpusNode[];

/** Pre-computed-ish sparse vectors from token hashes (demo fallback vectors). */
function pseudoEmbed(text: string, dims = 64): number[] {
  const vec = new Array(dims).fill(0);
  for (const token of text.toLowerCase().split(/\W+/).filter(Boolean)) {
    let h = 0;
    for (let i = 0; i < token.length; i++) {
      h = (h * 31 + token.charCodeAt(i)) % dims;
    }
    vec[h] += 1;
  }
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  return vec.map((v) => v / norm);
}

async function embedWithOpenAI(text: string, apiKey: string): Promise<number[]> {
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: text,
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI embeddings failed: ${res.status}`);
  }

  const json = (await res.json()) as {
    data: Array<{ embedding: number[] }>;
  };
  return json.data[0].embedding;
}

export async function searchWithOpenAI(
  query: string,
  topK: number
): Promise<{ graph: RAGGraph; engine: string }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY not set");
  }

  const queryVec = await embedWithOpenAI(query, apiKey);

  const scored: RetrievalChunk[] = [];

  for (const node of nodes) {
    const text = `${node.label}\n${node.content}`;
    const docVec = node.embedding ?? pseudoEmbed(text);
    const sim = cosineSimilarity(queryVec, docVec);
    if (sim > 0) {
      scored.push({
        id: node.id,
        label: node.label,
        content: node.content,
        metadata: node.metadata,
        score: sim,
      });
    }
  }

  scored.sort((a, b) => b.score - a.score);

  const results = scored.slice(0, topK).map((r) => ({
    ...r,
    score: Math.min(0.99, 0.55 + r.score * 0.44),
  }));

  return {
    graph: buildGraphFromRetrieval(results, getCorpusEdges()),
    engine: "openai-embeddings",
  };
}
