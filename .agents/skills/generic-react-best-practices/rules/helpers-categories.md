---
title: Sort Every Helper Into One of a Fixed Set of Categories
impact: MEDIUM-HIGH
impactDescription: explicit contracts, predictable dependencies and no duplicated helpers
tags: helpers, categories, transformers, formatters, presenters, contracts
---

## Sort Every Helper Into One of a Fixed Set of Categories

**Impact: MEDIUM-HIGH (explicit contracts, predictable dependencies and no duplicated helpers)**

Every helper lives in exactly one of `helpers/transformers/`, `helpers/formatters/` or `helpers/presenters/`. The exposed result's responsibility determines its category. Filtering, grouping, calculating and testing describe operations, not separate categories. Keep one public helper per file, name the file after that export and keep support functions private. Never use a flat helpers folder, `utils.ts` or `*.logic.ts`.

### Transformers: validated data to derived data

A transformer receives explicit, typed, already validated inputs and derives values independent of their presentation. This includes selection, sorting, indexing, grouping, calculations, classifications, predicates and business diagnostics. A result may be a boolean, number, identifier, closed union, collection or structured summary. Returning a string does not make it a formatter.

Transformers are pure functions; a helper hook may memoize their composition with `useMemo` or `useCallback`. Obtain business data and context in API hooks or services and pass them in. Do not acquire data, subscribe to stores or context, translate, format display text or depend on UI contracts here. Preserve input collections and keep diagnostic codes separate from user-facing messages.

Raw API parsing, coercion and adaptation stay at the owning API boundary: textual dates/numbers, wire-field renames and external-code normalization belong in response schemas. Request validation, payload serialization and transport shapes stay in API schemas and modules. Reusable API schemas live in `apis/schemas/`; generic schemas live in their owning `schemas/`; translated form schemas remain with their form. A helper must not perform another validation/coercion pass downstream. Constructing a Date from a computed timestamp or rounding a domain calculation is not itself wire coercion.

### Formatters: values to display text

A unit formatter is a `useFormatXxx` hook returning a memoized function whose value parameter accepts `null | undefined`, whose options expose a configurable fallback and whose result is always `string`. It owns labels, descriptions, dates, numbers, units and locale-dependent display conventions. See `helpers-formatter-hooks` for the complete fallback contract.

Presentation context such as language or display preferences may be read inside the hook. Data acquisition, business state, effects and writable local state are outside its contract. A formatter may compose a pure domain classification. A grouping used only to select display wording may stay inside it; a classification used independently in filtering, eligibility or statistics belongs in a transformer and can be reused by the formatter.

A formatter never returns a color, tone, icon, CSS class, geometry, JSX or UI configuration. A technical string such as an API payload, identifier or control value is not display text. Bundles only compose existing formatter functions; constants and private numeric utilities are not unit formatters. No filename or primitive return type can establish that a string is intended for people.

### Presenters: explicit data to a visual contract

A presenter adapts supplied data to semantic tones/variants, geometry, positioning or component/chart-library contracts. It may be a pure function or a read-only hook composing transformers and formatters. Independently useful business operations stay implemented in transformers. Return data or configuration, never JSX or React elements.

Keep domain presenters at the owning component or page. Generic visual infrastructure follows shared UI ownership. A presenter returns a semantic tone or variant; concrete colors and appearance remain in the design system. It does not acquire data, read business state, mutate, navigate, notify, measure the DOM or read browser globals. Supply measurements as explicit inputs and apply results at the UI boundary.

For `{ label, tone }`, a presenter composes a formatter for the label and visual mapping for the tone. Pass already formatted text to a pure presenter, or compose the formatter hook inside a presenter hook; never inject `t` or a formatter function.

### Boundary examples

| Exposed responsibility                                               | Owner                    |
| -------------------------------------------------------------------- | ------------------------ |
| Raw API date/code to a validated domain value                        | API response schema      |
| Domain statuses to a stable group used for eligibility or statistics | Transformer              |
| Total amount, chronological series, predicate or diagnostic codes    | Transformer              |
| Localized amount, status label or diagnostic message                 | Formatter                |
| Semantic tone, chart-library rows or geometry                        | Presenter                |
| Date adapted to a UI control's technical value                       | Presenter                |
| Domain input to an API request body                                  | Owning API schema/module |
| Fetching, mutation, navigation, notification or other effect         | API hook or service      |

**Incorrect (wire coercion and display configuration hidden in a transformer):**

```typescript
// helpers/transformers/buildOrder.ts
export function buildOrder(raw: { amount: string; status: string }) {
  return { amount: Number(raw.amount), label: raw.status, tone: 'positive' }
}
```

**Correct (the public contract and ownership are explicit):**

```text
features/detail/
├── apis/queries/useGetOrderQuery.ts       # validates wire values into Order
├── helpers/transformers/getOrderTotal.ts  # OrderLine[] -> number
├── helpers/transformers/canCancelOrder.ts # Order -> boolean
├── helpers/transformers/getOrderGroup.ts  # OrderStatus -> OrderGroup
├── helpers/formatters/useFormatOrderStatus.ts
└── components/OrderPanel/
    ├── OrderPanel.feature.tsx
    └── helpers/presenters/getOrderTone.ts
```

Choose the narrowest actual owner: component, page, feature or the nearest shared ancestor of consumers. Only business-agnostic helpers belong in application-wide shared code. All three categories preserve input collections and exclude effects, rendering and data acquisition. The former categories (`businessRules`, `selectors`, `aggregators`, `calculators`, `mappers`, `quality`, `validators`, `filters`, `payloads`, `forms`, `schemas`, `links`) are rejected; there are no aliases or compatibility mode. Classify their contents by contract rather than mechanically moving every file into transformers.

See also: `arch-component-module-boundaries`, `arch-helpers-vs-services`, `helpers-formatter-hooks`, `helpers-business-rules-pure`, `yup-last-coercion-barrier`

### ESLint Enforcement

Enable `local/helper-module-contract` at error level. The shared helper-category registry is the source for naming, component roles, presenter placement, presentation dependencies, formatter provenance and browser boundaries. Resolve business ownership before role folders, including domains/features named `helpers`. Reject flat/retired categories and `*.logic.*`; match the filename to the callable public export, including aliases, overloads and immutable callable aliases. Type-only exports, constants and private support functions do not establish a naming violation. Tests, stories, mocks and declarations are excluded.

For canonical helpers, the same check rejects runtime dependencies on Yup, API/schema/service roles, known HTTP/query libraries and domain stores. Dedicated named error exports (`ValidationError` from Yup and Axios error classes/guards) are allowed for pure error classification, including aliases and reexports; they do not construct schemas or issue requests. Mixed schema/client imports and namespace/default imports remain outside helpers. Transformers also reject store dependencies and Jotai/router subscriptions, and calls to React context/subscription APIs. Follow resolvable local dependencies, aliases, reexports and literal dynamic imports; ignore erased type edges and terminate on cycles. Generic presentation preferences may be read from presentation context, but they must not conceal business state.

Formatters also reject presenter and known UI-library runtime dependencies; pure transformer composition remains valid.

Reject resolved React effect/writable-state hooks, Jotai writers, navigation hooks, JSX and React element creation. Resolve aliases/namespaces and preserve shadowing. Use `local/no-service-presentation` to reject translation, formatter, presenter and known UI-library dependencies in transformers. Reusable domain services retain their separate presentation boundary. Use `local/no-browser-in-pure-helpers` for all canonical helper categories and `local/formatter-contract` for unit formatter signatures.

These are bounded checks, not a proof of purity or an automatic semantic classifier. Injected callbacks, arbitrary external libraries, computed module paths, custom wrappers and values with indistinguishable primitive types require review. In particular, inspect display-only versus business grouping, technical versus human-readable strings, and UI-shaped data hidden in transformers. Do not infer category from a method named `transform`, function prefixes, or boolean/string return types alone. Do not autofix category or ownership; coordinate moves with callers and verify the affected checks.
