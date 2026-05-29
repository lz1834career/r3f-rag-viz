# r3f-rag-viz-react

`<RAGScene />` and hooks for editable 3D RAG knowledge graphs ? [r3f-rag-viz](https://github.com/lz1834career/r3f-rag-viz).

```bash
npm install r3f-rag-viz-react r3f-rag-viz-core
```

Peer deps: `react`, `react-dom`, `three`, `@react-three/fiber`, `@react-three/drei`, `zustand`.

```tsx
"use client";

import { RAGScene } from "r3f-rag-viz-react";

<RAGScene graph={graph} onSceneChange={(e) => console.log(e)} />;
```

See the [main README](https://github.com/lz1834career/r3f-rag-viz#readme) and [live demo](https://r3f-rag-viz-demo.vercel.app/).
