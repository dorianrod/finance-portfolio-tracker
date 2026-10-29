---
title: Format with Prettier and Sort Imports with ESLint
impact: LOW
impactDescription: consistent formatting and ordering without competing fixers
tags: quality, prettier, formatting, imports, sorting
---

## Format with Prettier and Sort Imports with ESLint

**Impact: LOW (consistent formatting and ordering without competing fixers)**

Use Prettier for layout and the shared ESLint preset for import/export ordering.
Keep one committed formatting policy per application and use its locally installed,
lockfile-pinned tools in the editor, fix command and CI. Preserve the consuming
application's existing options; punctuation choices are project conventions rather
than React correctness requirements.

### Prettier policy

Read the effective configuration for the file being changed, including any
overrides and EditorConfig settings. For a new application without a formatting
policy, use this minimal baseline:

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all"
}
```

This baseline omits optional statement semicolons, prefers single quotes in
JavaScript/TypeScript and adds trailing commas wherever the parser supports them.
Prettier still inserts semicolons required to avoid automatic-semicolon-insertion
hazards and may choose the quote style that needs fewer escapes.

The relevant inherited Prettier 3 defaults are:

| Option | Default | Meaning |
| --- | --- | --- |
| `printWidth` | `80` | Preferred wrapping width; some output can exceed it. |
| `tabWidth`, `useTabs` | `2`, `false` | Two-space indentation. |
| `jsxSingleQuote` | `false` | Double quotes in JSX attributes. |
| `bracketSpacing` | `true` | Spaces inside object braces. |
| `arrowParens` | `"always"` | Parentheses around a single arrow parameter. |
| `endOfLine` | `"lf"` | LF line endings. |

Keep application-specific values and overrides in its configuration and
documentation. Defaults need no duplicate configuration entries unless an explicit
project requirement justifies them. Prettier discovers configuration from each
target file's directory upwards: running it from an application directory does
not apply that application's configuration to sibling tooling or skill files.
When those files intentionally share the policy, supply the configuration with
`--config <path>`.

### Import and export sorting

The shared preset enables `simple-import-sort/imports` and
`simple-import-sort/exports` as errors for authored JS/MJS/CJS/TS/TSX files,
including tests, stories and tooling, subject to configured ignores. Use their
autofix instead of hand-maintaining a parallel order.

The import rule uses the plugin's default groups, separated by a blank line:

1. Side-effect imports, preserving their relative order.
2. Node built-ins using the `node:` prefix.
3. External packages, including scoped packages.
4. Absolute imports and aliases such as `@/`.
5. Relative imports.

Within groups, the plugin sorts by module path and sorts named specifiers. It
handles type imports within their module groups; there is no separate global
type-import block. `simple-import-sort/exports` sorts named export specifiers
and supported groups of reexports; it does not alphabetize function, constant
or type declarations. Preserve intentional side-effect dependencies when reviewing
any import move.

**Incorrect (unsorted imports and formatting inconsistent with the baseline):**

```typescript
import { orderStatusAtom } from './orderStatus.atoms';
import { useAtomValue } from "jotai";

export function useOrderStatus(){return useAtomValue(orderStatusAtom);}
```

**Correct (package imports first, group separation and Prettier layout):**

```typescript
import { useAtomValue } from 'jotai'

import { orderStatusAtom } from './orderStatus.atoms'

export function useOrderStatus() {
  return useAtomValue(orderStatusAtom)
}
```

### Related ordering contracts

TypeScript files also enable `@typescript-eslint/consistent-type-imports` and
`@typescript-eslint/no-import-type-side-effects`. Use `import type` for type-only
dependencies so they are erased; follow [type import guidance](types-no-any-or-wide.md)
for mixed imports.

For production module declarations, apply [public API first](quality-public-api-first.md)
and [one public value export](quality-single-public-export.md), including their
scope exclusions and initialization-order safeguards. Follow the
[domain layout](arch-domain-first-layout.md) for alias and relative-path choices.
These are separate contracts from sorting module paths.

Object keys, schema fields, JSX props, declarations and Tailwind classes have no
alphabetical sorting requirement in this preset. Preserve useful business grouping
and order-sensitive spreads. An additional project sorter needs an explicit scope
and compatibility review; it must not compete with the existing import fixer.

### Analysis aids and limits

Run Prettier's check on the application's authored, supported files and the normal
ESLint gate with its reviewed warning ceiling. The preset enables import/export
sorting but does not run Prettier. Prettier's default formatter does not sort
imports, props, object keys or Tailwind classes. Separate Prettier and ESLint
commands cover these responsibilities without requiring `eslint-plugin-prettier`
or another import-order plugin. If a project adds ESLint layout rules, review
conflicts with Prettier before enabling them.

Keep generated output, dependency folders, caches, coverage and generated data
outside formatting via the consuming application's ignore configuration. Confirm
the effective config, file coverage and a rejected/accepted sorting example when
wiring the tools; passing formatting establishes neither ownership nor safe
runtime initialization. See [formatting integration](../references/project-enforcement.md#formatting-and-sorting)
for fix and check commands.
