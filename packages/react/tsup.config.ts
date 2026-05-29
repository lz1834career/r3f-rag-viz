import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: false,
  external: [
    "react",
    "react-dom",
    "react/jsx-runtime",
    "three",
    "@react-three/fiber",
    "@react-three/drei",
    "zustand",
    "@r3f-rag-viz/core",
    "d3-force-3d",
  ],
  banner: {
    js: '"use client";',
  },
});
