---
name: dorian-react-best-pratices
description: Apply and maintain Dorian's project-specific React and Next.js rules. Use when writing, reviewing, or refactoring React code against this catalog, or when turning a supplied code pattern into a new Dorian React rule. Do not substitute unrelated conventions.
metadata:
  author: dorian
  version: "0.2.0"
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

## Quick Reference

### Styling Boundaries

- [`styling-semantic-colors`](rules/styling-semantic-colors.md) — Keep raw and palette-specific colors out of business components.

## Add or Change a Rule

Before authoring a rule, read [references/adding-a-rule.md](references/adding-a-rule.md). It explains how to derive a concise rule from supplied code, create one dedicated Markdown file, add minimal examples, and register pattern-based routing.
