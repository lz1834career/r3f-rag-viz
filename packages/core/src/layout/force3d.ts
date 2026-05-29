/// <reference path="../d3-force-3d.d.ts" />
import {
  forceCenter,
  forceLink,
  forceManyBody,
  forceSimulation,
  type Simulation,
} from "d3-force-3d";
import type { SimulationLinkDatum } from "d3-force-3d";
import type { RAGGraph, SceneNode } from "../types";

export type SimNode = SceneNode & {
  index?: number;
  vx?: number;
  vy?: number;
  vz?: number;
};

export type SimLink = SimulationLinkDatum<SimNode> & {
  id?: string;
  weight?: number;
  type?: string;
};

export function createForce3dLayout(graph: RAGGraph): {
  nodes: SimNode[];
  links: SimLink[];
  simulation: Simulation<SimNode, SimLink>;
} {
  const nodes: SimNode[] = graph.nodes.map((node) => ({
    ...node,
    x: (Math.random() - 0.5) * 20,
    y: (Math.random() - 0.5) * 20,
    z: (Math.random() - 0.5) * 20,
  }));

  const nodeById = new Map(nodes.map((n) => [n.id, n]));

  const links: SimLink[] = graph.edges
    .filter((e) => nodeById.has(e.source) && nodeById.has(e.target))
    .map((e) => ({
      ...e,
      source: e.source,
      target: e.target,
    }));

  const simulation = forceSimulation(nodes, 3)
    .force(
      "link",
      forceLink(links)
        .id((d: SimNode) => d.id)
        .distance((l: SimLink) => 8 - (l.weight ?? 0.5) * 3)
        .strength((l: SimLink) => (l.weight ?? 0.5) * 0.6)
    )
    .force("charge", forceManyBody().strength(-120))
    .force("center", forceCenter(0, 0, 0))
    .alphaDecay(0.02)
    .velocityDecay(0.3);

  return { nodes, links, simulation };
}

export function scoreToColor(score: number | undefined): string {
  if (score == null) return "#64748b";
  const t = Math.max(0, Math.min(1, score));
  const r = Math.round(99 + (56 - 99) * t);
  const g = Math.round(102 + (189 - 102) * t);
  const b = Math.round(241 + (248 - 241) * t);
  return `rgb(${r},${g},${b})`;
}

export function scoreToScale(score: number | undefined): number {
  if (score == null) return 0.35;
  return 0.25 + score * 0.35;
}
