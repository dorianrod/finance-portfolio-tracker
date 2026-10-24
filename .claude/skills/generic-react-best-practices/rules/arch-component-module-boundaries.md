---
title: Keep Component Modules Focused on Components
impact: HIGH
impactDescription: component files stay readable while logic gains explicit ownership
tags: arch, components, hooks, helpers, services, eslint
---

## Keep Component Modules Focused on Components

**Impact: HIGH (component files stay readable while logic gains explicit ownership)**

A `.view.tsx`, `.state.tsx` or `.feature.tsx` module declares components, component-local prop or view types, and inert configuration constants; it does not declare module-level custom hooks or lowercase helper functions. Local callbacks and event handlers may stay inside the component only when they adapt an event and delegate to an imported action or service. Extract business orchestration and every module-level callable into a file whose path states its responsibility.

When a component needs supporting files, give it a named directory. Put an effectful or orchestrating hook in `services/`, and put a pure or read-only helper in `helpers/<category>/`. Use one public helper export per file, name the file after that export, and keep supporting functions private. Do not create `*.logic.ts`: the suffix hides whether the module selects, aggregates, calculates, presents or performs effects.

**Incorrect (a component module mixes rendering, synchronization and visual derivation):**

```tsx
function useOrderDocumentTitle(orderId: string) {
  useEffect(() => {
    document.title = `Order ${orderId}`
  }, [orderId])
}

function getOrderTone(total: number) {
  return total >= 0 ? 'positive' : 'negative'
}

export function OrderPanel({ order }: { order: Order }) {
  useOrderDocumentTitle(order.id)
  return <OrderTotal tone={getOrderTone(order.total)} />
}
```

**Correct (the component owns rendering and imports explicitly placed logic):**

```text
OrderPanel/
├── OrderPanel.feature.tsx
├── services/useOrderDocumentTitle.ts
└── helpers/presenters/getOrderTone.ts
```

```tsx
import { getOrderTone } from './helpers/presenters/getOrderTone'
import { useOrderDocumentTitle } from './services/useOrderDocumentTitle'

export function OrderPanel({ order }: { order: Order }) {
  useOrderDocumentTitle(order.id)
  return <OrderTotal tone={getOrderTone(order.total)} />
}
```

Place logic at the narrowest scope that owns it: component-only logic stays in the component directory, page-shared logic goes under that page, and domain-shared logic goes under the domain. Only helpers without business vocabulary belong in application-wide shared code. Presenter helpers stay at component or page scope because their output is coupled to the UI.

PascalCase components may share a component module when they all have the module's declared view, state-renderer or feature role; otherwise split the mixed roles according to `arch-component-roles`. The ESLint rule treats a PascalCase callable as a component candidate, not as proof that it renders React UI, so review its actual role when auditing the module. Inline callbacks and local UI event handlers are allowed, but they must not hide mutations, navigation, notifications or multi-source orchestration that belongs in a service according to `arch-thin-components`.

See also: `arch-helpers-vs-services`, `arch-isolate-effects-in-hooks`, `arch-thin-components`, `helpers-categories`
