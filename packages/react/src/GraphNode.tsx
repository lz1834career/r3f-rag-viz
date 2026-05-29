"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useThree, type ThreeEvent } from "@react-three/fiber";
import type { Mesh } from "three";
import { Plane, Vector3 } from "three";
import { scoreToColor, scoreToScale, type SceneNode } from "@r3f-rag-viz/core";
import { useSceneStore } from "./store/scene-store";
import { useSimulation } from "./simulation-context";

type GraphNodeProps = {
  node: SceneNode;
};

export function GraphNode({ node }: GraphNodeProps) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);

  const { camera } = useThree();
  const dragPlane = useMemo(() => new Plane(), []);
  const planeNormal = useMemo(() => new Vector3(), []);
  const hitPoint = useMemo(() => new Vector3(), []);
  const grabOffset = useMemo(() => new Vector3(), []);

  const selectedNodeId = useSceneStore((s) => s.selectedNodeId);
  const selectNode = useSceneStore((s) => s.selectNode);
  const syncNodeCoords = useSceneStore((s) => s.syncNodeCoords);
  const setSimulating = useSceneStore((s) => s.setSimulating);
  const setDraggingNode = useSceneStore((s) => s.setDraggingNode);
  const updateNodePosition = useSceneStore((s) => s.updateNodePosition);
  const { pinNode, nodeRegistry } = useSimulation();

  const isSelected = selectedNodeId === node.id;
  const color = scoreToColor(node.score);
  const radius = scoreToScale(node.score) * (hovered || isSelected ? 1.25 : 1);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    nodeRegistry.register(node.id, mesh);
    mesh.position.set(node.x, node.y, node.z);
    return () => nodeRegistry.unregister(node.id);
  }, [node.id, nodeRegistry]);

  const endDrag = () => {
    if (!dragging) return;
    setDragging(false);
    setDraggingNode(false);
    pinNode(node.id, false);
    setSimulating(true);
    updateNodePosition(node.id, node.x, node.y, node.z);
    document.body.style.cursor = "auto";
  };

  useEffect(() => {
    if (!dragging) return;
    const onWindowPointerUp = () => endDrag();
    window.addEventListener("pointerup", onWindowPointerUp);
    window.addEventListener("pointercancel", onWindowPointerUp);
    return () => {
      window.removeEventListener("pointerup", onWindowPointerUp);
      window.removeEventListener("pointercancel", onWindowPointerUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging]);

  const applyPosition = (x: number, y: number, z: number) => {
    node.x = x;
    node.y = y;
    node.z = z;
    node.fx = x;
    node.fy = y;
    node.fz = z;
    meshRef.current?.position.set(x, y, z);
  };

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);

    setDragging(true);
    setDraggingNode(true);
    setSimulating(false);
    pinNode(node.id, true);
    syncNodeCoords(node);
    selectNode(node.id);

    camera.getWorldDirection(planeNormal);
    dragPlane.setFromNormalAndCoplanarPoint(planeNormal, e.point);
    grabOffset.copy(e.point).sub(meshRef.current!.position);
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    endDrag();
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!dragging) return;
    e.stopPropagation();

    if (!e.ray.intersectPlane(dragPlane, hitPoint)) return;

    applyPosition(
      hitPoint.x - grabOffset.x,
      hitPoint.y - grabOffset.y,
      hitPoint.z - grabOffset.z
    );
  };

  return (
    <mesh
      ref={meshRef}
      scale={radius}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        if (!dragging) document.body.style.cursor = "grab";
      }}
      onPointerOut={() => {
        setHovered(false);
        if (!dragging) document.body.style.cursor = "auto";
      }}
    >
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={isSelected ? color : "#000000"}
        emissiveIntensity={isSelected ? 0.6 : hovered ? 0.25 : 0}
        roughness={0.3}
        metalness={0.4}
      />
    </mesh>
  );
}
