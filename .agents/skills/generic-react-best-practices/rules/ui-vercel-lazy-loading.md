---
title: Lazy Load Heavy Optional UI
impact: HIGH
impactDescription: keeps optional features out of the initial loading path
tags: ui, lazy, suspense, imports, bundle, vercel
---

## Lazy Load Heavy Optional UI

**Impact: HIGH (keeps optional features out of the initial loading path)**

Load a heavy editor, report or other infrequently used surface when it is needed. Use React `lazy` at module scope with literal import paths, plus loading and error boundaries. Keep initial-screen essentials eager when deferring them would only introduce a waterfall.

**Incorrect (the optional report is imported eagerly):**

```tsx
import { HeavyReport } from './HeavyReport.feature'

export function ReportPreview({ visible }: { visible: boolean }) {
  return visible ? <HeavyReport /> : null
}
```

**Correct (the report module loads on demand):**

```tsx
import { lazy, Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

export function ReportPreview({ visible }: { visible: boolean }) {
  return (
    <ErrorBoundary fallback={<ReportError />}>
      <Suspense fallback={<ReportSkeleton />}>
        {visible ? <HeavyReport /> : null}
      </Suspense>
    </ErrorBoundary>
  )
}

const HeavyReport = lazy(() =>
  import('./HeavyReport.feature').then(module => ({ default: module.HeavyReport })),
)
```

### Loading Boundaries

- Keep import paths statically analyzable. For a finite module choice, map keys to functions containing literal `import()` calls rather than constructing arbitrary paths.
- Preload on credible user intent when useful. Domain code supplies an `onIntent` callback to shared UI, which owns pointer and focus wiring (`ui-centralize-accessibility`). Handle speculative load failures; a rejected lazy import still needs an error boundary.
- Defer nonessential third-party startup work when appropriate, while preserving any monitoring or initialization required before use.
- Put Suspense outside a compound root or inside its content slot (`ui-compound-slots-direct-children`). Preserve dialog mounting and exit behavior (`ui-dialog-controlled`).

### Verification

Inspect the generated chunks or a bundle report: a dynamic import does not remove a module from the initial graph when another eager import reaches it. Measure startup and first-use latency rather than assuming every split is beneficial.

### Sources

Adapted from Vercel's [dynamic imports](https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/rules/bundle-dynamic-imports.md), [analyzable paths](https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/rules/bundle-analyzable-paths.md) and [intent-based preloading](https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/rules/bundle-preload.md). Uses [React lazy](https://react.dev/reference/react/lazy) rather than a framework-specific loader.
