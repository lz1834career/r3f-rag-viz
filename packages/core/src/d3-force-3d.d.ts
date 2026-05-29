declare module "d3-force-3d" {
  export interface SimulationNodeDatum {
    index?: number;
    x?: number;
    y?: number;
    z?: number;
    vx?: number;
    vy?: number;
    vz?: number;
    fx?: number | null;
    fy?: number | null;
    fz?: number | null;
  }

  export interface SimulationLinkDatum<NodeDatum extends SimulationNodeDatum> {
    source: NodeDatum | string | number;
    target: NodeDatum | string | number;
    index?: number;
  }

  export interface Simulation<
    NodeDatum extends SimulationNodeDatum,
    LinkDatum extends SimulationLinkDatum<NodeDatum>,
  > {
    restart(): this;
    stop(): this;
    tick(): this;
    alpha(value: number): this;
    alphaDecay(value: number): this;
    velocityDecay(value: number): this;
    force(name: string, force?: unknown): this;
    on(
      typenames: string,
      listener: (...args: unknown[]) => void
    ): this;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type ForceFn = (...args: any[]) => any;

  export function forceSimulation<
    NodeDatum extends SimulationNodeDatum,
    LinkDatum extends SimulationLinkDatum<NodeDatum>,
  >(
    nodes?: NodeDatum[],
    numDimensions?: number
  ): Simulation<NodeDatum, LinkDatum>;

  export const forceLink: ForceFn;
  export const forceManyBody: ForceFn;
  export const forceCenter: ForceFn;
}
