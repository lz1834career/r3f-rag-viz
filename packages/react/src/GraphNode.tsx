"use client";

import { useEffect, useRef, useState } from "react";
import { type ThreeEvent } from "@react-three/fiber";
import type { Mesh } from "three";
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

  const selectedNodeId = useSceneStore((s) => s.selectedNodeId);
  const selectNode = useSceneStore((s) => s.selectNode);
  const syncNodeCoords = useSceneStore((s) => s.syncNodeCoords);
  const setSimulating = useSceneStore((s) => s.setSimulating);
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

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setDragging(true);
    setSimulating(false);
    pinNode(node.id, true);
    syncNodeCoords(node);
    selectNode(node.id);
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (dragging) {
      updateNodePosition(node.id, node.x, node.y, node.z);
    }
    setDragging(false);
    pinNode(node.id, false);
    setSimulating(true);
    document.body.style.cursor = "auto";
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!dragging) return;
    e.stopPropagation();
    const { x, y, z } = e.point;
    node.x = x;
    node.y = y;
    node.z = z;
    node.fx = x;
    node.fy = y;
    node.fz = z;
    meshRef.current?.position.set(x, y, z);
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
        document.body.style.cursor = dragging ? "grabbing" : "grab";
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
