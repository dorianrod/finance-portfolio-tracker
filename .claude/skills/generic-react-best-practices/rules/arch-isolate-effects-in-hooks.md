---
title: Isolate Effects in Intent-Named Hooks
impact: HIGH
impactDescription: synchronization responsibilities stay explicit and independently testable
tags: arch, components, hooks, effects, synchronization
---

## Isolate Effects in Intent-Named Hooks

**Impact: HIGH (synchronization responsibilities stay explicit and independently testable)**

Do not place `useEffect` or `useLayoutEffect` directly in a component. First remove effects that only derive render state or respond to a user action. When synchronization with an external system is genuinely required, isolate it in a custom hook named after the synchronization intent, not after the React primitive.

**Incorrect (the rendering component owns browser synchronization):**

```tsx
function OrderPanel({ orderId }: { orderId: string }) {
  useEffect(() => {
    document.title = `Order ${orderId}`
  }, [orderId])

  return <OrderDetails orderId={orderId} />
}
```

**Correct (the effect has a focused, intention-revealing boundary):**

```tsx
function useOrderDocumentTitle(orderId: string): void {
  useEffect(() => {
    document.title = `Order ${orderId}`
  }, [orderId])
}

function OrderPanel({ orderId }: { orderId: string }) {
  useOrderDocumentTitle(orderId)
  return <OrderDetails orderId={orderId} />
}
```

Keep the hook close to a single-use component or move it to the owning domain service when reused. The hook should expose inputs and outputs for its responsibility rather than component implementation details.

See also: `arch-thin-components`, `arch-decompose-hook-heavy-components`; `vercel-react-best-practices` → `rerender-derived-state-no-effect`, `rerender-move-effect-to-event`
