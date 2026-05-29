import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildGraphFromRetrieval } from "./build-graph";

describe("buildGraphFromRetrieval", () => {
  it("keeps only edges between retrieved nodes", () => {
    const graph = buildGraphFromRetrieval(
      [
        { id: "a", label: "A", content: "alpha", score: 0.9 },
        { id: "b", label: "B", content: "beta", score: 0.8 },
      ],
      [
        { id: "e1", source: "a", target: "b", weight: 0.9 },
        { id: "e2", source: "a", target: "c", weight: 0.5 },
      ]
    );

    assert.equal(graph.nodes.length, 2);
    assert.equal(graph.edges.length, 1);
    assert.equal(graph.edges[0].target, "b");
  });

  it("auto-connects when no edges match", () => {
    const graph = buildGraphFromRetrieval([
      { id: "x", label: "X", content: "one", score: 0.95 },
      { id: "y", label: "Y", content: "two", score: 0.7 },
    ]);

    assert.equal(graph.edges.length, 1);
    assert.equal(graph.edges[0].source, "x");
    assert.equal(graph.edges[0].target, "y");
  });
});
