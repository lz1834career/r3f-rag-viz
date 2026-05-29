"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { useSceneStore } from "./store/scene-store";

export function WebGLContextGuard() {
  const gl = useThree((s) => s.gl);
  const setSimulating = useSceneStore((s) => s.setSimulating);

  useEffect(() => {
    const canvas = gl.domElement;

    const onLost = (event: Event) => {
      event.preventDefault();
      setSimulating(false);
      window.dispatchEvent(new CustomEvent("r3f-rag-viz:webgl-context-lost"));
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "[r3f-rag-viz] WebGL context lost — simulation paused. Use the restore button or refresh."
        );
      }
    };

    const onRestored = () => {
      if (process.env.NODE_ENV === "development") {
        console.info("[r3f-rag-viz] WebGL context restored.");
      }
    };

    canvas.addEventListener("webglcontextlost", onLost, false);
    canvas.addEventListener("webglcontextrestored", onRestored, false);

    return () => {
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
    };
  }, [gl, setSimulating]);

  return null;
}
