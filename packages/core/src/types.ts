export type RAGNode = {
  id: string;
  label: string;
  content?: string;
  embedding?: number[];
  metadata?: Record<string, unknown>;
  score?: number;
};

export type RAGEdge = {
  id: string;
  source: string;
  target: string;
  type?: string;
  weight?: number;
};

export type RAGGraph = {
  nodes: RAGNode[];
  edges: RAGEdge[];
};

export type SceneNode = RAGNode & {
  x: number;
  y: number;
  z: number;
  fx?: number | null;
  fy?: number | null;
  fz?: number | null;
};

export type SceneChangeEvent = {
  type: "node-move" | "node-select";
  nodeId: string;
  position?: { x: number; y: number; z: number };
};

export type RAGSceneProps = {
  graph: RAGGraph;
  onSceneChange?: (event: SceneChangeEvent) => void;
  className?: string;
};

export type RetrievalChunk = {
  id: string;
  label: string;
  content: string;
  score: number;
  metadata?: Record<string, unknown>;
};
