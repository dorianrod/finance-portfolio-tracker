# Dashboard Rule Enforcement

Read this reference when applying the catalog to this repository or changing its lint checks. The rules remain portable; this reference records the dashboard implementations, bounded static analysis and exceptions. Consult the current configuration before changing enforcement.

Source configuration: [ESLint](../../../../packages/dashboard/eslint.config.js), [custom rules](../../../../packages/dashboard/eslint-rules/) and [dashboard development guide](../../../../packages/dashboard/README.md).

Recheck each recorded complexity rationale when its function changes; an earlier keep decision is not a permanent exemption.

## Choose Memo Boundaries by Invalidation

Catalog rule: [quality-usecallback-for-functions](../rules/quality-usecallback-for-functions.md).

`react-hooks/exhaustive-deps` runs at error level and checks dependencies. It does not determine calculation cost, independently useful reference stability or whether a hook's callers need its return wrapper to be stable. There is no local rule imposing a memo count or automatically merging memo callbacks.

Review those decisions using the actual inputs and consumers. In `useDashboardPerformance`, the position summaries, trailing income and passive-income request state can change independently. Combining all calculations into the returned object's memo would recompute summaries and recreate their references on request updates. Its current consumer destructures the result, so stabilizing the outer wrapper alone supplies no benefit to that consumer. Grouping cohesive calculations and dropping an unused wrapper cache are separate decisions; neither justifies merging every cache.

## Review and Date ESLint Exceptions

Catalog rule: [quality-eslint-disable-scoped](../rules/quality-eslint-disable-scoped.md).

The dashboard enables `local/require-reviewed-eslint-suppression` at error level and `local/reviewed-eslint-suppression` at warning level for JS and TS. Invalid scope, unnamed rules, missing rationale or missing/invalid calendar dates are errors. Each conforming directive produces one warning containing its rules, rationale and last review date. The suppression processor preserves these policy diagnostics even under a blanket disable.

`reportUnusedDisableDirectives: 'error'` rejects obsolete suppressions. Neither local rule has an autofix: metadata validation cannot certify a technical rationale or perform a review.

## Extract Compound Component Calculations

Catalog rule: [arch-thin-components](../rules/arch-thin-components.md).

Enable `local/no-complex-component-calculation` at error level. It reports more than two arithmetic operations (`+`, `-`, `*`, `/`, `%`, `**`) or deterministic `Math` calls in one derivation inside a component, including callbacks and JSX. It follows immutable local variable initializers and aliases, counting each operation once. It also checks the returned fields of an inline `map`/`flatMap` object together, and groups computed geometry properties (`x`, `y`, `cx`, `cy`, `width`, `height`, `r`, `rx`, `ry`) of one JSX element. The `maxOperations` option retains a default of two.

Independent small expressions outside those explicit output groups remain independent. The rule does not trace reassigned variables, imported helper implementations or arbitrary interprocedural data flow. `local/no-component-data-pipeline` complements it by reporting inline reductions and compound collection predicates in application/domain components. Existing module-boundary and JSX-condition checks cover different patterns and do not replace these checks.

`local/no-browser-in-pure-helpers` is an error for authored production files in `helpers/presenters/` and `helpers/calculators/`, including component-owned helpers. It resolves browser globals, DOM measurements, known DOM mutation methods and DOM property writes. Pass viewport dimensions and measurements as inputs; apply the returned geometry at the UI boundary. Locally shadowed names, type-only references and reads of supplied `DOMRect` values remain valid. Tests, declaration files and generated files are excluded. This bounded check does not prove purity or follow arbitrary helper implementations and detached DOM methods.

## Justify Feature Hierarchy Through Business Scope

Catalog rule: [arch-feature-hierarchy](../rules/arch-feature-hierarchy.md).

The dashboard enables `local/feature-folder-layout` at error level with `maxFeatureDepth: 2`. It counts feature scopes below each domain, using the same parser as import boundaries and ownership. Exactly two levels are allowed. Files with deeper scopes fail even without imports; a folder named `features` inside a role folder does not create another business scope. Parent/leaf layout is checked independently. ESLint does not decide whether the chosen business parent is appropriate and provides no automatic folder move.

## Keep Display Fallbacks in Existing Formatters

Catalog rule: [helpers-formatter-hooks](../rules/helpers-formatter-hooks.md).

In this dashboard, `useFormatNumber`, `useFormatMoney` and `useFormatPercentage` accept `number | null | undefined`:

```typescript
formatNumber(value); // null or undefined → '—'; zero stays formatted
formatMoney(value, { fallback: 0 }); // missing amount → formatted zero
formatPercentage(value, { fallback: "", zeroAsFallback: true });
```

`fallback` defaults to `'—'`. A string is returned as display text; a numeric fallback goes through the same precision, sign, currency and unit options as a regular value. `zeroAsFallback` defaults to `false`; enable it explicitly when zero needs the same placeholder as a missing value. Preserve each caller's current display policy when migrating it.

Enable `local/no-inline-format-fallback` at error level. It checks production TS and TSX, including domain formatter wrappers, for guards on the same stable value passed to a numeric formatter, plus direct `??` and `||` input defaults with a string or numeric literal. It follows immutable boolean aliases and guards nested in `&&`/`||` conditions. A query-state condition can remain while the numeric formatter owns the missing-value placeholder. Imported numeric hooks are resolved through import/local aliases, relative paths and numeric functions destructured from formatter bundles.

The check is deliberately bounded: it does not follow reassigned aliases, arbitrary providers, helper parameters, structural JSX branches with several children or fallback expressions nested inside calculations. Shared numeric formatter implementations and tests are excluded. There is no automatic fix: preserve the guard's business conditions and the difference between an absent value and zero. `local/no-helper-context-params` separately prevents passing formatter/context dependencies through helper APIs.

## Place the Public API First

Catalog rule: [quality-public-api-first](../rules/quality-public-api-first.md).

In this dashboard, enable `local/public-api-first` at error level for the same production files as `local/single-public-export`. The existing `npm run format` command runs `eslint --fix`, which moves declarations with their attached documentation and preserves overload groups. No Prettier plugin is required.

Automatically move hoisted function declarations, or function-valued initializations across declarations that are erased or hoisted. Preserve the relative order of the remaining code. If a move could change initialization order, cross an ESLint suppression or break an overload group, report the issue without an autofix. Refactor dependencies manually when needed; do not introduce a temporal dead zone to satisfy ordering.

Classes follow the same reporting policy, including named/default exports and export lists. A class is not hoisted: automatically move it only across erased or hoisted declarations. Its base class and static initialization must retain their runtime dependencies.

## Move the Complete Responsibility Into Its Feature

Catalog rule: [arch-shared-no-domain-knowledge](../rules/arch-shared-no-domain-knowledge.md).

The dashboard's `local/shared-feature-usage` checks resolved production import graphs at error level. It reports exclusive one-feature ownership and missing production consumers. A separate `local/review-shared-feature-sharing` warning reports sharing that cannot be established because consumers also exist outside the owning feature tree. An indeterminate graph requests review rather than proving an invalid owner. `local/feature-folder-layout` owns layout diagnostics and `local/import-boundaries` owns forbidden dependencies; the usage rules do not duplicate those violations. The rules share the same business-scope parser and cached analysis.

When common inputs are distributed through application props, static imports may not prove all consumers. Inspect the actual feature inputs and record the evidence. A reviewed line-scoped suppression names `local/review-shared-feature-sharing` and retains its concrete rationale. It does not disable the proven ownership errors. Do not count application files as features, add fake imports or apply a blanket exception to all parent-owned code. No automatic folder move can decide whether a business capability is shared.

## Avoid Deprecated APIs

Catalog rule: [quality-no-deprecated-apis](../rules/quality-no-deprecated-apis.md).

Enable `@typescript-eslint/no-deprecated` at error level with type information for every checked TypeScript file, including TSX, tests, and configuration. In this dashboard, ESLint uses `parserOptions.projectService` and the application and tooling TSConfigs. Do not add an allowlist or suppress the rule to retain a deprecated call.

The rule detects annotated symbols, including aliased imports. Manually review official documentation when a dependency has incomplete types; a clean lint run cannot detect an undocumented or unannotated deprecation.

## Keep Shared UI Agnostic of Business Domains

Catalog rule: [arch-shared-no-domain-knowledge](../rules/arch-shared-no-domain-knowledge.md).

The dashboard's `local/import-boundaries` checks resolved imports, re-exports, dynamic imports and type imports from global shared code into `app` or `domains`. It also prevents production consumers from importing Storybook modules. These checks do not detect business knowledge declared locally or hidden in another shared module. Review public names, literal unions, branches, defaults and transitive dependencies as well as import paths; do not treat a passing lint as proof of domain independence.

## Keep Colors Semantic Behind Shared UI

Catalog rule: [ui-semantic-colors](../rules/ui-semantic-colors.md).

Enable `local/no-hardcoded-colors` at error level. It checks literal appearance values and palette utilities in shared UI as well as application/domain code, and follows immutable local aliases and conditional values. Imperative style assignments, `setProperty`, SVG `setAttribute` and browser `theme-color` metadata follow the same token boundary. Dedicated `shared/theme` and asset files may define concrete values. This bounded check does not parse arbitrary CSS or infer all dynamic DOM targets.

## Review Component Complexity Before Splitting

Catalog rule: [arch-component-complexity](../rules/arch-component-complexity.md).

The dashboard enables these built-in ESLint rules at error level for production `src/**/*.{ts,tsx}`, including components, hooks and helpers:

- `complexity`: maximum **8**, variant **modified** (one decision for an entire `switch`). A score of 8 is allowed; 9 or higher requires manual review. It measures branches per function; callbacks have their own complexity.
- `max-lines-per-function`: maximum **150**, excluding blank lines and comment-only lines. It includes JSX and nested callback bodies in the containing function's span.

Both are necessary: low cyclomatic complexity does not imply a small component. Hook-count, JSX-condition, mapped-JSX and calculation checks remain complementary. An exceedance fails lint until a cohesive extraction or a justified line-scoped keep decision resolves it. The threshold does not determine that decision.

## Keep Caller Layout Outside Shared UI

Catalog rule: [ui-no-classname-on-shared-ui](../rules/ui-no-classname-on-shared-ui.md).

`local/no-shared-ui-internal-layout` reports errors on injected classes and inline layout styles, including statically resolvable extracted components. `local/no-shared-ui-classname` continues to protect the public API. Neither rule supplies an autofix or permits suppressions to complete a migration. Tests and Storybook usages follow the same composition rules.

## Centralize Visual Styling in Shared UI

Catalog rule: [ui-no-adhoc-styling](../rules/ui-no-adhoc-styling.md).

`local/no-domain-styling` runs at error level:

- `nonLayoutClass` and `nonLayoutStyle` identify concrete non-layout choices;
  move them into a primitive without changing the business behavior.
- `unverifiableStyle` means a value could not be analyzed statically; inspect its
  origin before deciding whether to retain layout or extract visual styling.
- `outsideStylesheet` identifies a local stylesheet outside the permitted roots.

Diagnostics aggregate the classes/properties for an individual usage and include
this rule's identifier. There is no autofix: selecting or designing a primitive
requires a composition decision. Do not suppress diagnostics to complete a migration.

## Require Composition Through Nested Children

Catalog rule: [ui-required-children](../rules/ui-required-children.md).

`local/require-children-composition` is an ESLint error in the dashboard. Typed linting checks declared component contracts as well as JSX, `createElement` and `cloneElement` calls, including resolved factory aliases. Named UI props are rejected before a caller exists, including typed functions, classes, `memo`, `forwardRef` and exported compound slots. `children` remains the composition API; factory calls supply it positionally instead of in the props object.

It resolves dependency declarations to distinguish external components from local imports and wrappers; it does not rely on prop names or a blanket chart-library exemption. External inline render functions and render-local component references are rejected. Private dependency renderers may receive inherited external contracts; their locally declared UI props and the inherited props of public project APIs remain checked. Data, event handlers and scalar formatters remain valid. Arbitrary runtime factories and reassigned element aliases are not reconstructed. There is no autofix for changing a component API.

## Centralize Accessibility in Shared UI Primitives

Catalog rule: [ui-centralize-accessibility](../rules/ui-centralize-accessibility.md).

The dashboard enables typed `local/no-domain-accessibility` at error level for authored `src` code. Outside `src/shared/ui`, it checks JSX attributes, explicitly supplied properties in resolvable spreads, direct Radix imports/re-exports/dynamic imports, and resolved DOM focus, keyboard-listener and ARIA APIs. Within shared UI, it checks exported component contracts and compound slots for raw wiring props, including inherited HTML attributes, and rejects bare Radix value re-exports, namespace exports and resolved import aliases. Type-only re-exports and internal primitive wiring remain valid. Tests, generated files and isolated Storybook support are exempt.

The check examines resolved declarations, avoiding false positives from optional attributes inherited from external HTML/SVG types such as Recharts shape props. It does not prove runtime accessibility or reconstruct arbitrary dynamic property names, opaque objects or transitive helper behavior. Test reusable primitives by role and label, and verify keyboard navigation, relationships, dismissal and focus restoration.

## Keep an Explicit ESLint Warning Budget

Catalog rule: [quality-eslint-warning-budget](../rules/quality-eslint-warning-budget.md).

`local/reviewed-eslint-suppression` emits one tracking warning per conforming directive, including its rules, reason and date. ESLint's `--max-warnings` rejects totals above the ceiling, but does not enforce lowering an oversized ceiling: the skill and code review require that adjustment. No exact-count script or per-warning inventory is used.

A global total cannot detect replacing a removed warning with a different warning at the same count. Review new exceptions and budget changes even when lint passes.

## Export One Public Value per File

Catalog rule: [quality-single-public-export](../rules/quality-single-public-export.md).

In this dashboard, enable `local/single-public-export` at error level for production `.ts` and `.tsx` files under `src`, including shared UI. Splitting files and choosing a meaningful themed directory require review and have no ESLint autofix.

`quality-single-public-export` allows at most one public value even when several components share the same role. Private components still follow the ownership and module restrictions in `arch-component-module-boundaries`.
