"use client";

import { OrbitControls } from "@react-three/drei";
import { MOUSE, TOUCH } from "three";
import { useSceneStore } from "./store/scene-store";

/**
 * Orbit: right-drag · pan: middle · zoom: scroll
 * Left button is reserved for dragging graph nodes.
 */
export function SceneControls() {
  const isDraggingNode = useSceneStore((s) => s.isDraggingNode);

  return (
    <OrbitControls
      makeDefault
      enabled={!isDraggingNode}
      enableDamping
      dampingFactor={0.05}
      minDistance={5}
      maxDistance={60}
      mouseButtons={{
        LEFT: null as unknown as MOUSE,
        MIDDLE: MOUSE.DOLLY,
        RIGHT: MOUSE.ROTATE,
      }}
      touches={{
        ONE: TOUCH.ROTATE,
        TWO: TOUCH.DOLLY_PAN,
      }}
    />
  );
}
