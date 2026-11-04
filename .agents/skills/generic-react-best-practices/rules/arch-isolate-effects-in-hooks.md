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

**Correct (the effect has a focused, intention-revealing service file):**

```tsx
// OrderPanel/services/useOrderDocumentTitle.ts
export function useOrderDocumentTitle(orderId: string): void {
  useEffect(() => {
    document.title = `Order ${orderId}`
  }, [orderId])
}
```

```tsx
// OrderPanel/OrderPanel.feature.tsx
import { useOrderDocumentTitle } from './services/useOrderDocumentTitle'

function OrderPanel({ orderId }: { orderId: string }) {
  useOrderDocumentTitle(orderId)
  return <OrderDetails orderId={orderId} />
}
```

Keep the hook in the named component directory when it has one consumer, under the page when several components of that page use it, or in the owning feature's `services/` when reused across pages. The hook should expose inputs and outputs for its responsibility rather than component implementation details.

### Reactive Dependencies and Lifecycle

Use the reactive values actually read by synchronization as dependencies. Prefer a specific field such as `order.id` when the effect only needs that field; do not omit a dependency to reduce reruns. Separate independent synchronization responsibilities instead of giving them one combined dependency set. A user-triggered mutation stays in its page action, while a pure derivation is calculated during render or in a derived atom (`state-derived-atoms`). Moving either into a custom effect hook does not make the effect necessary.

When the installed React version provides `useEffectEvent`, use it only for genuinely nonreactive logic invoked by an effect or its subscription. Keep the effect's reactive dependencies; exclude the Effect Event itself from the dependency array and keep it inside its owning hook. Do not use it as a general stable callback, pass it to another component/hook or use it to hide a synchronization dependency.

Pair subscriptions, timers and listeners with cleanup. Share an app-wide subscription through its actual owner rather than installing one listener per unrelated consumer. Use passive touch/wheel listeners only when they never need `preventDefault`. Keep keyboard/focus behavior inside shared UI (`ui-centralize-accessibility`).

Components can remount. Put app-lifetime initialization in the client bootstrap owner and preserve setup/cleanup symmetry for component-lifetime resources. A once-only guard must not prevent a cleaned-up subscription from being re-established. Pure initializers and effects must tolerate development replay.

### ESLint Enforcement

Keep `react-hooks/rules-of-hooks` and `react-hooks/exhaustive-deps` enabled with a version supporting the installed React APIs. Fix the responsibility or dependency mismatch rather than suppressing it. Effect Events supplement dependency tracking; they do not replace it.

Enable `local/no-effects-in-components` to identify React effects by their resolved library binding, including import aliases, immutable aliases and destructured namespace bindings. Recognize aliased React component wrappers and respect lexical shadowing instead of matching local identifier names alone. Keep custom hook ownership valid. Arbitrary wrapper behavior requires manual review. Exercise invalid component effects, valid custom hooks and unrelated or shadowed callbacks through the actual consuming configuration.

See [React Effect Events](https://react.dev/reference/react/useEffectEvent) for their scope and dependency contract.

See also: `arch-component-module-boundaries`, `arch-thin-components`, `arch-decompose-hook-heavy-components`, `state-derived-atoms`
