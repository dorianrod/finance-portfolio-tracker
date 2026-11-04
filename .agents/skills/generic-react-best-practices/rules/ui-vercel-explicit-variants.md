---
title: Prefer Explicit Component Variants Over Mode Flags
impact: MEDIUM
impactDescription: makes distinct workflows explicit and avoids impossible mode combinations
tags: ui, composition, variants, boolean-props, vercel
---

## Prefer Explicit Component Variants Over Mode Flags

**Impact: MEDIUM (makes distinct workflows explicit and avoids impossible mode combinations)**

When a component combines distinct workflows through flags such as `isCreating`, `isEditing` and `isCancelling`, give those workflows explicit components that compose shared pieces. Callers can then see the fields and actions of each variant without reasoning about conflicting flag combinations.

**Incorrect (one component permits incompatible workflows):**

```tsx
<OrderComposer isCreating isEditing={false} isCancelling showCancellationReason />
```

**Correct (each workflow composes its own fields and actions):**

```tsx
// CreateOrderComposer.feature.tsx
export function CreateOrderComposer() {
  return (
    <OrderComposer>
      <OrderComposer.Fields>
        <OrderFields />
      </OrderComposer.Fields>
      <OrderComposer.Actions>
        <SaveDraftButton />
        <CreateOrderButton />
      </OrderComposer.Actions>
    </OrderComposer>
  )
}

// CancelOrderComposer.feature.tsx
export function CancelOrderComposer() {
  return (
    <OrderComposer>
      <OrderComposer.Fields>
        <CancellationReasonFields />
      </OrderComposer.Fields>
      <OrderComposer.Actions>
        <KeepOrderButton />
        <CancelOrderButton />
      </OrderComposer.Actions>
    </OrderComposer>
  )
}
```

Use nested children according to `ui-required-children` and keep direct slots where `ui-compound-slots-direct-children` requires them. Shared client state stays in scoped Jotai atoms (`arch-no-prop-drilling`); composition does not prescribe a Context provider.

### Exceptions

- Booleans expressing actual state or capabilities remain valid: `open`, `disabled`, `checked`, `selected` and feature flags. Their presence alone does not justify a variant component.
- Small visual differences belong in closed semantic variants such as `tone` or `size`. Avoid wrappers that merely rename a label or mirror every prop without an independent contract (`arch-component-roles`).
- A small component with one mutually exclusive mode may use a literal union or discriminated union. Extract variants when their structure, actions or responsibilities differ substantially.

### ESLint Enforcement

Use JSX-condition and complexity diagnostics as review signals. Counting boolean props cannot establish whether they encode incompatible workflows; review their meaning and callers before extracting components. Do not ban legitimate boolean state props through a blanket ESLint restriction.

### Sources

Adapted from Vercel's [boolean prop guidance](https://github.com/vercel-labs/agent-skills/blob/main/skills/composition-patterns/rules/architecture-avoid-boolean-props.md) and [explicit variants](https://github.com/vercel-labs/agent-skills/blob/main/skills/composition-patterns/rules/patterns-explicit-variants.md), using this catalog's composition and Jotai conventions.
