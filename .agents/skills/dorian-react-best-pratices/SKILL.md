---
name: dorian-react-best-pratices
description: Apply and maintain Dorian's project-specific React and Next.js rules. Use when writing, reviewing, or refactoring React code against this catalog, or when turning a supplied code pattern into a new Dorian React rule. Do not substitute unrelated conventions.
metadata:
  author: dorian
  version: "0.4.0"
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

## Active Rule Categories

Category prefixes and their priority order belong in [rules/_sections.md](rules/_sections.md).

| Priority | Category | Prefix |
| --- | --- | --- |
| 1 | Styling Boundaries | `styling-` |
| 2 | Component Composition | `composition-` |
| 3 | Component Logic | `architecture-` |
| 4 | API Maintenance | `quality-` |

## Quick Reference

### Styling Boundaries

- [`styling-semantic-colors`](rules/styling-semantic-colors.md) — Keep raw and palette-specific colors out of business components.

### Component Composition

- [`composition-required-children`](rules/composition-required-children.md) — Compose UI through nested children and compound components; never pass content through named props or `children={...}`.

### Component Logic

- [`architecture-extract-component-calculations`](rules/architecture-extract-component-calculations.md) — Extract compound numeric and layout calculations into categorized helpers; use presenters for UI geometry.

### API Maintenance

- [`quality-no-deprecated-apis`](rules/quality-no-deprecated-apis.md) — Replace deprecated APIs with supported alternatives and enforce annotated deprecations with typed ESLint.

## Add or Change a Rule

Before authoring a rule, read [references/adding-a-rule.md](references/adding-a-rule.md). It explains how to derive a concise rule from supplied code, create one dedicated Markdown file, add minimal examples, and register pattern-based routing.
