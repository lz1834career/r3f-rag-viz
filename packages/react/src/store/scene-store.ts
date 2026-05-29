import { create } from "zustand";
import type { RAGGraph, SceneChangeEvent, SceneNode } from "r3f-rag-viz-core";

type SceneStore = {
  graph: RAGGraph | null;
  nodes: SceneNode[];
  selectedNodeId: string | null;
  isSimulating: boolean;
  isDraggingNode: boolean;
  onSceneChange?: (event: SceneChangeEvent) => void;

  initGraph: (graph: RAGGraph, nodes: SceneNode[]) => void;
  setDraggingNode: (value: boolean) => void;
  syncNodeCoords: (node: SceneNode) => void;
  updateNodePosition: (id: string, x: number, y: number, z: number) => void;
  selectNode: (id: string | null) => void;
  setSimulating: (value: boolean) => void;
  setOnSceneChange: (handler?: (event: SceneChangeEvent) => void) => void;
};

export const useSceneStore = create<SceneStore>((set, get) => ({
  graph: null,
  nodes: [],
  selectedNodeId: null,
  isSimulating: true,
  isDraggingNode: false,
  onSceneChange: undefined,

  initGraph: (graph, nodes) => set({ graph, nodes }),

  setDraggingNode: (value) => set({ isDraggingNode: value }),

  syncNodeCoords: (node) => {
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === node.id ? { ...n, x: node.x, y: node.y, z: node.z } : n
      ),
    }));
  },

  updateNodePosition: (id, x, y, z) => {
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === id ? { ...n, x, y, z } : n
      ),
    }));
    get().onSceneChange?.({
      type: "node-move",
      nodeId: id,
      position: { x, y, z },
    });
  },

  selectNode: (id) => {
    set({ selectedNodeId: id });
    if (id) {
      get().onSceneChange?.({ type: "node-select", nodeId: id });
    }
  },

  setSimulating: (value) => set({ isSimulating: value }),

  setOnSceneChange: (handler) => set({ onSceneChange: handler }),
}));

export function useRAGNodes() {
  return useSceneStore((s) => s.nodes);
}

export function useSelectedNode() {
  const nodes = useSceneStore((s) => s.nodes);
  const selectedNodeId = useSceneStore((s) => s.selectedNodeId);
  return nodes.find((n) => n.id === selectedNodeId) ?? null;
}

export function useSceneEditor() {
  const selectNode = useSceneStore((s) => s.selectNode);
  const updateNodePosition = useSceneStore((s) => s.updateNodePosition);
  const setSimulating = useSceneStore((s) => s.setSimulating);
  const isSimulating = useSceneStore((s) => s.isSimulating);
  const selectedNodeId = useSceneStore((s) => s.selectedNodeId);

  return {
    selectedNodeId,
    selectNode,
    updateNodePosition,
    setSimulating,
    isSimulating,
  };
}
