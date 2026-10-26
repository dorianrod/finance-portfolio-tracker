# Shared UI styling audit

Reference date: 2026-10-26. Status: complete.

## Boundary

`local/no-domain-styling` remains a warning. Application and domain code may
supply layout, including **padding**. Shared UI owns appearance. Global CSS in
`src/index.css` and tokens in `shared/theme` remain permitted infrastructure.
Tests and generated files retain their exemptions. No styling-rule suppression
or broader source exemption was introduced.

## Rule corrections

- Mutated objects, arrays and aliases produce a review diagnostic instead of
  being accepted based on their initial layout values.
- Computed React factory names, const factory aliases and resolvable object
  destructuring are recognized.
- An arbitrary object's `join` method is distinguished from an array of classes.
- Scalar chart labels, label data and React renderer elements are distinguished
  from styling option objects. Absent `null`/`undefined` values are accepted.
- Resolvable template fragments remain checked when another fragment is opaque.
- SVG gradient and related visual properties are covered, including `stopColor`
  and `stopOpacity`.
- CSS-looking values passed through `color`, `accent` and `tone` are reported
  when proven; semantic values and unknown business data are not automatically
  classified as forbidden styling.

Regression coverage distinguishes identified styles from unverifiable values.
The rule does not execute code, parse CSS contents or inspect imperative DOM
mutations. It provides no autofix.

## Migration

The first audit found **1,224 diagnostics in 92 files**. The completed dashboard
lint reports **zero `local/no-domain-styling` diagnostics and zero errors**.
One existing `local/no-prop-drilling` warning remains in `AccountTypeBreakdownChart`;
it is unrelated to the styling boundary.

- Typography, surfaces, controls, KPI values, tables, status indicators and
  swatches now use semantic shared UI primitives and variants.
- Chart axes, grids, series, gradients, labels, reference areas, sectors,
  transaction markers and tooltip appearance live in shared UI. Custom renderer
  composition uses nested slots; domains keep data, geometry and business actions.
- Presenters supply semantic tones instead of CSS classes or resolved colors.
- Indeterminate checkbox behavior moved into an owned shared UI service. The
  component-role rule permits that service while still rejecting business
  services in views; its old suppression was removed.
- `TooltipBox` retains its themed appearance when layout classes are provided.

## Validation

- All **1,007 tests across 118 files pass** with `npm test -- --maxWorkers=4`,
  including **562 ESLint-rule tests**.
- Real Recharts tests verify renderer coordinates and data, labels, gradients,
  tooltip payloads and click behavior. The donut regression test covers filtering
  categories during an animation.
- The production TypeScript/Vite build passes.
- The Dorian skill validator and `git diff --check` pass.

Run `npm run lint -- --format json` for a machine-readable inventory. CI includes
the styling-rule tests and the shared UI suite.
