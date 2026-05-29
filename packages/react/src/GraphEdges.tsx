"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  BufferAttribute,
  BufferGeometry,
  LineBasicMaterial,
  LineSegments,
} from "three";
import type { SimLink, SceneNode } from "r3f-rag-viz-core";

type GraphEdgesProps = {
  links: SimLink[];
};

export function GraphEdges({ links }: GraphEdgesProps) {
  const linesRef = useRef<LineSegments>(null);
  const linksRef = useRef(links);
  linksRef.current = links;

  const geometry = useMemo(() => {
    const positions = new Float32Array(links.length * 2 * 3);
    const geo = new BufferGeometry();
    geo.setAttribute("position", new BufferAttribute(positions, 3));
    return geo;
  }, [links.length]);

  const material = useMemo(
    () =>
      new LineBasicMaterial({
        color: "#6366f1",
        transparent: true,
        opacity: 0.35,
      }),
    []
  );

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame(() => {
    const lines = linesRef.current;
    const currentLinks = linksRef.current;
    if (!lines) return;

    const attr = lines.geometry.attributes.position as BufferAttribute;
    const arr = attr.array as Float32Array;

    for (let i = 0; i < currentLinks.length; i++) {
      const link = currentLinks[i];
      const source = link.source as SceneNode;
      const target = link.target as SceneNode;
      const o = i * 6;
      arr[o] = source.x;
      arr[o + 1] = source.y;
      arr[o + 2] = source.z;
      arr[o + 3] = target.x;
      arr[o + 4] = target.y;
      arr[o + 5] = target.z;
    }

    attr.needsUpdate = true;
  });

  return <lineSegments ref={linesRef} geometry={geometry} material={material} />;
}
