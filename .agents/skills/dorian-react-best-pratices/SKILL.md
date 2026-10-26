---
name: dorian-react-best-pratices
description: Apply and maintain Dorian's project-specific React and Next.js rules, including business domain and feature boundaries. Use when writing, reviewing, or refactoring React code or architecture against this catalog, or when turning a supplied code pattern into a new Dorian React rule. Do not substitute unrelated conventions.
metadata:
  author: dorian
  version: "0.11.0"
---

# Dorian React Best Practices

Use the rules in this skill as the only source of Dorian-specific React guidance.

## Apply Rules

1. Read [rules/_routing.md](rules/_routing.md).
2. Match the code or request against the routing signals.
3. Load only the individual rule files selected by those signals.
4. Confirm each rule's applicability and exceptions before applying it.
5. If no route matches, do not invent a Dorian rule or silently import one from another skill.

Files beginning with `_` are maintenance files, not active rules.

For domain and feature architecture reviews, apply this catalog's business boundary, hierarchy and ownership rules alongside the generic React skill's folder and import conventions. The Dorian rules refine the business decisions; the generic rules define their technical layout. Derive the business vocabulary and capability map from the application being reviewed; examples illustrate decisions rather than prescribe a business model. Keep application-specific naming and target structures in that application's architecture documentation.

## Active Rule Categories

Category prefixes and their priority order belong in [rules/_sections.md](rules/_sections.md).

| Priority | Category | Prefix |
| --- | --- | --- |
| 1 | Styling Boundaries | `styling-` |
| 2 | Component Composition | `composition-` |
| 3 | Business Architecture and Component Logic | `architecture-` |
| 4 | Code Quality and API Maintenance | `quality-` |

## Quick Reference

### Styling Boundaries

- [`styling-external-layout-only`](rules/styling-external-layout-only.md) — Keep caller layout outside visual shared UI boundaries; shared UI owns internal spacing and structure.

- [`styling-centralize-in-shared-ui`](rules/styling-centralize-in-shared-ui.md) — Centralize visual styling in shared UI primitives; allow only external layout, including padding, elsewhere.
- [`styling-semantic-colors`](rules/styling-semantic-colors.md) — Use semantic tokens inside shared UI and semantic variants in business components.

### Component Composition

- [`composition-required-children`](rules/composition-required-children.md) — Compose UI through nested children; forbid component/element/render-function props in project APIs and extract renderers required by external APIs.

### Business Architecture and Component Logic

- [`architecture-business-capability-boundaries`](rules/architecture-business-capability-boundaries.md) — Define domains and features by business scope and user outcome before choosing folders.
- [`architecture-feature-hierarchy`](rules/architecture-feature-hierarchy.md) — Justify peer and parent-child relationships through business scope; keep dimensions and modes within their capability.
- [`architecture-feature-ownership`](rules/architecture-feature-ownership.md) — Keep feature-specific UI, business logic, contracts and state with their owner, and require actual reuse across distinct features before placing code in `shared/`.

- [`architecture-component-complexity`](rules/architecture-component-complexity.md) — Review complexity above 8 or function size above 150 lines manually; split only when a cohesive responsibility can be extracted.
- [`architecture-shared-ui-agnostic`](rules/architecture-shared-ui-agnostic.md) — Keep shared UI APIs and dependencies free of business knowledge; domains adapt business meaning to generic UI roles.
- [`architecture-centralize-accessibility`](rules/architecture-centralize-accessibility.md) — Centralize all ARIA wiring, keyboard navigation and focus behavior in shared UI primitives; domains and application code supply semantic data, labels and business actions.
- [`architecture-extract-component-calculations`](rules/architecture-extract-component-calculations.md) — Extract compound numeric and layout calculations into categorized helpers; use presenters for UI geometry.
- [`architecture-formatter-fallbacks`](rules/architecture-formatter-fallbacks.md) — Keep missing-value and zero display fallbacks in existing formatters instead of component guards or wrapper formatters.

### Code Quality and API Maintenance

- [`quality-single-public-export`](rules/quality-single-public-export.md) — Export at most one public value per production file; allow type-only exports and private declarations, and group related extracted files by theme.
- [`quality-public-api-first`](rules/quality-public-api-first.md) — Place exported functions and components after imports and module directives, before types, constants and private declarations.

- [`quality-no-deprecated-apis`](rules/quality-no-deprecated-apis.md) — Replace deprecated APIs with supported alternatives and enforce annotated deprecations with typed ESLint.

## Add or Change a Rule

Before authoring a rule, read [references/adding-a-rule.md](references/adding-a-rule.md). It explains how to derive a concise rule from supplied code, create one dedicated Markdown file, add minimal examples, and register pattern-based routing.
