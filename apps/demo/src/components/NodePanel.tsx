"use client";

import { useSelectedNode, useSceneEditor } from "@r3f-rag-viz/react";

export function NodePanel() {
  const node = useSelectedNode();
  const { isSimulating, setSimulating } = useSceneEditor();

  return (
    <aside className="flex h-full w-80 shrink-0 flex-col border-l border-white/10 bg-zinc-950/90 backdrop-blur-md">
      <div className="border-b border-white/10 px-4 py-3">
        <h2 className="text-sm font-semibold text-zinc-100">Node Inspector</h2>
        <p className="mt-0.5 text-xs text-zinc-500">
          Click a node in the 3D scene
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {node ? (
          <div className="space-y-4">
            <div>
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Label
              </span>
              <p className="mt-1 text-base font-medium text-zinc-100">
                {node.label}
              </p>
            </div>

            {node.score != null && (
              <div>
                <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Relevance Score
                </span>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-indigo-500"
                      style={{ width: `${node.score * 100}%` }}
                    />
                  </div>
                  <span className="text-sm tabular-nums text-indigo-300">
                    {(node.score * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            )}

            {node.content && (
              <div>
                <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Chunk Content
                </span>
                <p className="mt-1 text-sm leading-relaxed text-zinc-400">
                  {node.content}
                </p>
              </div>
            )}

            {node.metadata && (
              <div>
                <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Metadata
                </span>
                <pre className="mt-1 overflow-x-auto rounded-md bg-zinc-900 p-2 text-xs text-zinc-400">
                  {JSON.stringify(node.metadata, null, 2)}
                </pre>
              </div>
            )}

            <div>
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Position
              </span>
              <p className="mt-1 font-mono text-xs text-zinc-500">
                x: {node.x.toFixed(2)} · y: {node.y.toFixed(2)} · z:{" "}
                {node.z.toFixed(2)}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-center">
            <p className="text-sm text-zinc-600">
              No node selected.
              <br />
              Click any sphere to view its chunk.
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-white/10 p-4">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-400">
          <input
            type="checkbox"
            checked={isSimulating}
            onChange={(e) => setSimulating(e.target.checked)}
            className="rounded border-zinc-700 bg-zinc-900 text-indigo-500 focus:ring-indigo-500"
          />
          Force simulation active
        </label>
      </div>
    </aside>
  );
}
