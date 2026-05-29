"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { SceneControls } from "./SceneControls";
import {
  createForce3dLayout,
  type RAGSceneProps,
} from "@r3f-rag-viz/core";
import { GraphEdges } from "./GraphEdges";
import { GraphNode } from "./GraphNode";
import { NodeRegistry } from "./node-registry";
import {
  SimulationContext,
  useSimulation,
  type SimulationLayout,
} from "./simulation-context";
import { useSceneStore } from "./store/scene-store";
import { WebGLContextGuard } from "./WebGLContextGuard";

function ForceSimulationDriver() {
  const layoutRef = useRef<SimulationLayout | null>(null);
  const isSimulating = useSceneStore((s) => s.isSimulating);
  const { layout, nodeRegistry } = useSimulation();

  useEffect(() => {
    layoutRef.current = layout;
    if (layout) {
      layout.simulation.alpha(1).restart();
    }
    return () => {
      layout?.simulation.stop();
      nodeRegistry.clear();
    };
  }, [layout, nodeRegistry]);

  useFrame(() => {
    const sim = layoutRef.current;
    if (!sim || !isSimulating) return;
    sim.simulation.tick();
    nodeRegistry.syncPositions(sim.nodes);
  });

  return null;
}

function GraphScene() {
  const { layout } = useSimulation();
  if (!layout) return null;

  return (
    <>
      <ForceSimulationDriver />
      <GraphEdges links={layout.links} />
      {layout.nodes.map((node) => (
        <GraphNode key={node.id} node={node} />
      ))}
    </>
  );
}

function SceneContent() {
  return (
    <>
      <WebGLContextGuard />
      <color attach="background" args={["#0a0a0f"]} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <GraphScene />
      <SceneControls />
    </>
  );
}

const SceneCanvas = memo(function SceneCanvas({
  simContext,
}: {
  simContext: {
    layout: SimulationLayout | null;
    pinNode: (id: string, pinned: boolean) => void;
    nodeRegistry: NodeRegistry;
  };
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 25], fov: 50 }}
      dpr={1}
      gl={{
        antialias: false,
        powerPreference: "high-performance",
        failIfMajorPerformanceCaveat: false,
      }}
      onCreated={({ gl }) => {
        gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      }}
    >
      <SimulationContext.Provider value={simContext}>
        <SceneContent />
      </SimulationContext.Provider>
    </Canvas>
  );
});

export function RAGScene({ graph, onSceneChange, className }: RAGSceneProps) {
  const initGraph = useSceneStore((s) => s.initGraph);
  const setOnSceneChange = useSceneStore((s) => s.setOnSceneChange);
  const [layout, setLayout] = useState<SimulationLayout | null>(null);
  const [contextLost, setContextLost] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);
  const nodeRegistry = useMemo(() => new NodeRegistry(), []);

  const pinNode = useMemo(
    () => (id: string, pinned: boolean) => {
      const node = layout?.nodes.find((n) => n.id === id);
      if (!node) return;
      node.fx = pinned ? node.x : null;
      node.fy = pinned ? node.y : null;
      node.fz = pinned ? node.z : null;
    },
    [layout]
  );

  useEffect(() => {
    setOnSceneChange(onSceneChange);
    return () => setOnSceneChange(undefined);
  }, [onSceneChange, setOnSceneChange]);

  useEffect(() => {
    const next = createForce3dLayout(graph);
    setLayout(next);
    setContextLost(false);
    initGraph(graph, next.nodes);
    return () => {
      next.simulation.stop();
      nodeRegistry.clear();
    };
  }, [graph, initGraph, nodeRegistry]);

  const simContext = useMemo(
    () => ({ layout, pinNode, nodeRegistry }),
    [layout, pinNode, nodeRegistry]
  );

  return (
    <div className={className ?? "relative h-full w-full"}>
      <p className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 text-xs text-zinc-600">
        left-drag node · right-drag rotate · scroll zoom · middle pan
      </p>

      {contextLost ? (
        <div className="flex h-full items-center justify-center bg-[#0a0a0f]">
          <button
            type="button"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500"
            onClick={() => {
              setContextLost(false);
              setCanvasKey((k) => k + 1);
              const next = createForce3dLayout(graph);
              setLayout(next);
              initGraph(graph, next.nodes);
            }}
          >
            WebGL context lost — click to restore
          </button>
        </div>
      ) : (
        <SceneCanvas key={canvasKey} simContext={simContext} />
      )}

      <ContextLostBridge onLost={() => setContextLost(true)} />
    </div>
  );
}

function ContextLostBridge({ onLost }: { onLost: () => void }) {
  useEffect(() => {
    const handler = () => onLost();
    window.addEventListener("r3f-rag-viz:webgl-context-lost", handler);
    return () =>
      window.removeEventListener("r3f-rag-viz:webgl-context-lost", handler);
  }, [onLost]);
  return null;
}

export {
  useRAGNodes,
  useSelectedNode,
  useSceneEditor,
} from "./store/scene-store";
