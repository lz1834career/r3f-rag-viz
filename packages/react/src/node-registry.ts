import type { Mesh } from "three";

export class NodeRegistry {
  private meshes = new Map<string, Mesh>();

  register(id: string, mesh: Mesh) {
    this.meshes.set(id, mesh);
  }

  unregister(id: string) {
    this.meshes.delete(id);
  }

  syncPositions(
    nodes: Array<{ id: string; x: number; y: number; z: number }>
  ) {
    for (const node of nodes) {
      const mesh = this.meshes.get(node.id);
      mesh?.position.set(node.x, node.y, node.z);
    }
  }

  clear() {
    this.meshes.clear();
  }
}
