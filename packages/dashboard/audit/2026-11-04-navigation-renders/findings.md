# Audit findings

The application does **not** re-execute every retained page tree on each sampled tab change. Across two identical seven-transition cycles, inactive page roots have zero body invocations; the newly visible root has two development invocations. `StrictMode` doubles/replays development work, so these are not production commit counts.

Retained pages are not a zero-render guarantee: shell components run again, Jotai/query subscriptions reconnect, and Recharts invokes some shape/tooltip renderers. On return to Wealth, the `WealthTab` body runs twice while the owning chart view roots remain at zero; pie/bar shape callbacks still run many times. Body invocation is not a DOM replacement, component mount or committed Fiber update.

All measured runs preserve the cached issuer aggregate, overview comparison, canonical historical index, account-type history and performance-contribution builders: zero calls to those selected builders. `buildPositionRows` is the exception documented in F-002. See [exact counts](evidence/render-review.json) and [all observed invocations (ignored local supplementary evidence)](evidence/render-invocations.json).

## F-001 — Navigation still rerenders the common shell and all panel wrappers

- Kind: suggestion; no proven catalog violation.
- Related rule: ui-vercel-responsive-rendering, MEDIUM.
- Affected owners: `src/app/App.feature.tsx:24`, `DashboardContent.feature.tsx:10`, `DashboardPanel.feature.tsx:13`; consumers include header, filters and section navigation.
- Proposed action: defer; P-001. Preserve `visited-dashboard-panels`.

### Requirement and evidence

The selected rule calls for measured, appropriate memo boundaries; it does not forbid all rerenders. `App` subscribes to both navigation atoms and recreates shell JSX. Its body and `DashboardHeader` each run twice per transition in development. The six primary `DashboardPanel` instances total 12 invocations for a primary switch and 16 when both holdings subpanels are also reconciled. Stable page elements prevent that work from cascading into every page. This proves remaining shell work, not an incorrect financial result or a measured latency violation.

### Why this matters

Retaining DOM does not eliminate component-function work. The shared shell is a remaining optimization surface, although this audit does not measure its independent time cost.

### Alternatives considered

Keep the current stable page elements: correct and bounded. Memoize stable panel/header boundaries and stabilize shell inputs if profiling shows a useful saving. Narrow the top-level navigation subscriptions through existing consumer ownership if necessary. A comparator that ignores actual filter/source changes could display stale results and is unsuitable.

### Proposed corrective plan

Optional P-001: profile the common shell independently, then add only useful boundaries. Preserve real store/query updates, first-load behavior and error recovery. No current source change is proposed as a proven rule fix.

### Decision or clarification required

None for this verification. Implementation was not requested.

### Acceptance and prevention

Repeat the same invocation matrix with unchanged filters, then assert actual filter/source changes remain visible. The current retention tests already cover state freshness. No generic lint rule can infer expensive work or require zero renders.

## F-002 — The conditional reliability banner recreates a position-model consumer

- Kind: suggestion; no proven catalog violation.
- Related rule: ui-vercel-responsive-rendering, MEDIUM.
- Affected owners: `src/app/DashboardReliability.feature.tsx:36`, `DashboardCombinedReliability.feature.tsx:9`; traced through `useQualityAssessmentModel`, `usePortfolioPositionScope` and `usePortfolioPositions`.
- Proposed action: defer; P-002. Preserve `dashboard-models-at-consumers`.

### Requirement and evidence

Returning to Overview or Diversification remounts `DashboardCombinedReliability`, which owns another quality/position-scope hook instance. Its local memo is therefore new. Each such transition calls `buildPositionRows` four times in this development setup; the other sampled transitions call it zero times. Both repeated cycles agree. No entire history or issuer aggregate rebuild was observed.

### Why this matters

A retained page can coexist with remounting shell branches. This is a concrete remaining recomputation path; invocation counts alone do not establish its latency contribution.

### Alternatives considered

Keep the conditional branch if its small cost is acceptable. Remove the duplicate quality-model consumer by composing the combined presentation from the existing reliability owner's result, following its actual component contract. Retain the banner's own memo owner across branches if lifecycle/effect costs justify it. A global unbounded business-data cache is unnecessary for this finding.

### Proposed corrective plan

Optional P-002: profile this branch and consolidate its duplicate consumer or preserve its memo lifetime if worthwhile. Keep capability-owned cache reads, correct tab-specific quality presentation and filter invalidation. A settled implementation would record a decision beside the selected owner.

### Decision or clarification required

None for the requested check; no implementation choice needs to be made now.

### Acceptance and prevention

Verify that unchanged-source navigation no longer reconstructs this model, while changed account/date/source inputs still update the quality summary. Reuse narrow behavior/invalidation tests and repeat runtime counting. A wall-clock unit-test threshold or arbitrary syntax rule would be unreliable.

## Implementation outcome

Both optional suggestions were implemented under the subsequent request. Unchanged panel wrappers and the header skip navigation renders; the existing reliability model now feeds the combined presentation without a duplicate consumer. Fourteen final transitions show header 0, panel bodies 4, and position builder 0. Page-root counts match baseline. See evidence/implementation-review.md and verification.md for exact checks and limitations. These remain performance improvements, not retrospectively proven catalog violations.
