---
title: Defer Offscreen Rendering in Shared UI
impact: MEDIUM-HIGH
impactDescription: reduces layout and paint work for long surfaces
tags: ui, lists, content-visibility, performance, vercel
---

## Defer Offscreen Rendering in Shared UI

**Impact: MEDIUM-HIGH (reduces layout and paint work for long surfaces)**

When a long page spends substantial time laying out and painting offscreen content, consider `content-visibility: auto` inside the owning shared UI primitive. Supply a suitable intrinsic-size estimate to limit layout jumps. Feature code continues to compose primitives without adding local appearance or containment styles.

**Incorrect (a long collection eagerly lays out every heavy row):**

```tsx
// shared/ui/DeferredRow.view.tsx
export function DeferredRow({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}
```

**Correct (the shared primitive may skip offscreen rendering work):**

```tsx
// shared/ui/DeferredRow.view.tsx
export function DeferredRow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 80px' }}>
      {children}
    </div>
  )
}
```

The size above is illustrative; the primitive owns the appropriate estimate for its content. Preserve valid list/table structure and test scrolling, dynamic heights, focus and accessible content before adopting containment.

### Exceptions

- This targets browser layout and paint. It does not avoid mounting every React item or remove its DOM nodes. Use pagination or a suitable shared virtualized primitive when the measured cost comes from creating too many items.
- Avoid adding containment to small surfaces without evidence of a benefit, and verify support in the application's browser targets.
- Keep styling and accessibility implementation in shared UI (`ui-no-adhoc-styling`, `ui-centralize-accessibility`).

### Sources

Adapted from Vercel's [offscreen rendering guidance](https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/rules/rendering-content-visibility.md). See [content-visibility](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/content-visibility) for containment and accessibility behavior.
