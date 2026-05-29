import { buildGraphFromRetrieval } from "@r3f-rag-viz/core";
import { NextResponse } from "next/server";
import { getCorpusEdges, searchCorpus } from "@/lib/rag/local-search";
import { searchWithOpenAI } from "@/lib/rag/openai-search";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      query?: string;
      topK?: number;
      engine?: "local" | "openai" | "auto";
    };
    const query = body.query?.trim() ?? "";
    const topK = Math.min(Math.max(body.topK ?? 6, 1), 10);
    const enginePref = body.engine ?? "auto";

    if (!query) {
      return NextResponse.json(
        { error: "query is required" },
        { status: 400 }
      );
    }

    const useOpenAI =
      enginePref === "openai" ||
      (enginePref === "auto" && Boolean(process.env.OPENAI_API_KEY));

    if (useOpenAI && process.env.OPENAI_API_KEY) {
      try {
        const { graph, engine } = await searchWithOpenAI(query, topK);
        return NextResponse.json({
          query,
          graph,
          meta: { resultCount: graph.nodes.length, engine },
        });
      } catch (err) {
        console.warn("[api/search] OpenAI failed, falling back to local:", err);
      }
    }

    const results = searchCorpus(query, topK);
    const graph = buildGraphFromRetrieval(results, getCorpusEdges());

    return NextResponse.json({
      query,
      graph,
      meta: { resultCount: results.length, engine: "local-bm25" },
    });
  } catch (err) {
    console.error("[api/search]", err);
    return NextResponse.json({ error: "search failed" }, { status: 500 });
  }
}
