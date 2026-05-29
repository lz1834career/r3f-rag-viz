"use client";

import { createContext, useContext } from "react";
import type { createForce3dLayout } from "r3f-rag-viz-core";
import { NodeRegistry } from "./node-registry";

export type SimulationLayout = ReturnType<typeof createForce3dLayout>;

type SimulationContextValue = {
  layout: SimulationLayout | null;
  pinNode: (id: string, pinned: boolean) => void;
  nodeRegistry: NodeRegistry;
};

export const SimulationContext = createContext<SimulationContextValue>({
  layout: null,
  pinNode: () => {},
  nodeRegistry: new NodeRegistry(),
});

export function useSimulation() {
  return useContext(SimulationContext);
}
