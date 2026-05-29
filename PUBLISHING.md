# Publishing to npm

Packages: `r3f-rag-viz-core`, `r3f-rag-viz-react` (v0.1.0).

## Prerequisites

1. [npm](https://www.npmjs.com/) account (logged in as `lzlz94` or your user)
2. Log in: `npm login`

### Why not `@r3f-rag-viz/core`?

`npm publish` fails with **Scope not found** unless you own the `@r3f-rag-viz` org on npm. Packages are published as **unscoped** names:

- `r3f-rag-viz-core`
- `r3f-rag-viz-react`

To use a scope later, create an npm org at https://www.npmjs.com/org/create or publish under `@your-username/...`.

## Pre-flight (local)

```bash
npm install
npm run typecheck
npm test
npm run pack:check
```

`pack:check` builds `dist/` and runs `npm pack --dry-run` for both packages.

## Publish order

**Always publish `core` before `react`.**

```bash
npm run build:packages

npm publish -w r3f-rag-viz-core
npm publish -w r3f-rag-viz-react
```

## After publish

1. Create GitHub Release `v0.1.0` with demo link + GIF
2. Update root README install badges if needed
3. Verify on https://www.npmjs.com/package/r3f-rag-viz-react

## Version bumps

```bash
# patch release example
npm version patch -w r3f-rag-viz-core
npm version patch -w r3f-rag-viz-react
npm run build:packages
npm publish -w r3f-rag-viz-core
npm publish -w r3f-rag-viz-react
```

## Local monorepo dev

Demo resolves packages via `apps/demo/tsconfig.json` paths ???`packages/*/src` (no publish needed for local work).

Vercel build runs `npm run build:packages` before the Next.js app (see `apps/demo/vercel.json`).
