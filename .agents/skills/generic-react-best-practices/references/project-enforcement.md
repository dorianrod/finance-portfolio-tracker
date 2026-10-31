# Packaged tooling and rule bindings

The [catalog](../SKILL.md) owns contracts, impact, exceptions and incorrect/correct
examples. This skill also owns the executable checks and their generic tests.
Select rules and order their review by impact before choosing tools. A command
may support several rules; collect its output once and assign findings to their
owning rules. Neither tool availability nor output order sets review priority.

## Install in a consuming application

Add `@frontend-engineering/react-best-practices` as a local file dev dependency
pointing to this skill directory. Enable `install-links=true` in the consuming
application's `.npmrc` so npm installs a packed copy whose peer dependencies
resolve from the application. Commit its updated lockfile. The package manifest
declares compatible ESLint, TypeScript and plugin versions; install those peers
in the consuming application. Vitest and Prettier are needed to run the tooling
regression suite. Nothing needs to be installed to read the catalog or run its
zero-dependency documentation compiler.

Import the shared preset in the consuming application's flat ESLint adapter:

```js
import { createReactConfig } from '@frontend-engineering/react-best-practices/eslint'

export default createReactConfig({
  projectRoot: import.meta.dirname,
  catalogFile: 'translations/reference.json',
  ignores: ['dist', 'storybook-static'],
})
```

The adapter supplies project parameters; the skill owns the checks and their
default severities. `catalogFile` is required and resolved from `projectRoot`.
The plugin is also exported as `@frontend-engineering/react-best-practices/plugin`
for applications composing a flat configuration themselves. Register it under
`local`, configure `react-best-practices/catalogFile` with an absolute reference
catalog path, and preserve its suppression processor and warning-budget policy.
The shared preset wires these together already.

After changing the skill's tooling, run `npm ci` in the consuming application to
refresh the installed copy before checks. A clean CI install packages the current
contents of the skill. Keep reusable implementations here and application-specific
integration cases, warning ceilings, roots and catalog paths in the consumer.

## Formatting and sorting

The [formatting rule](../rules/quality-formatting-and-sorting.md) owns the Prettier
baseline, import groups and sorting limits. The package supplies ESLint sorting;
each consumer installs Prettier as a direct, pinned dev dependency and commits
its configuration and ignore file. Keep exact application options and paths in
that application's documentation. The preset does not install a Prettier config.

Expose fix and check scripts from the application root, preserving its existing
normal lint command and warning ceiling:

```json
{
  "format": "prettier --write . && npm run lint -- --fix && prettier --write .",
  "format:check": "prettier --check . && npm run lint"
}
```

The final Prettier pass formats changes made by ESLint autofixes. Use the same
local tools and configuration for editor formatting, import fixes and CI. The
check command validates both formatting and lint; the normal lint command alone
does not check Prettier layout. When formatting files outside the application,
explicitly select the intended configuration with `--config <path>` if it cannot
be discovered from those files. Ignore generated files and output directories in
the consumer's `.prettierignore`; ESLint has its own ignores.

## Choose checks for the selected rules

Commands below are package binaries, run from the consuming application's root
or through its npm script aliases. Follow each linked rule's own impact and
exceptions; the table is an association index, not a sequence of audit passes.

| Owning catalog rules                                                                                                                                                                                              | ESLint aids                                                                                                                              | Complementary command and trigger                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Formatting and sorting](../rules/quality-formatting-and-sorting.md)                                                                                                                                              | `simple-import-sort/imports`, `simple-import-sort/exports`; type imports and public declaration order retain their separate owning rules | Run the consuming application's Prettier check when changing supported authored files or formatting policy. Use its combined format/check scripts to cover both layout and lint.                                                                                                                                                                                                                                                                                       |
| [Component roles](../rules/arch-component-roles.md)                                                                                                                                                               | `local/component-role`, `local/state-component-contract`                                                                                 | `react-best-practices-architecture` when reviewing component responsibilities and presentation boundaries. Inspect each candidate and its dependencies before choosing a role or extraction.                                                                                                                                                                                                                                                                           |
| [Domain import boundaries](../rules/arch-transverse-only-imports.md)                                                                                                                                              | `local/import-boundaries`                                                                                                                | `react-best-practices-cycles --project <config.json>` when reviewing dependencies or changing runtime imports. An acyclic forbidden domain import still violates its owning rule.                                                                                                                                                                                                                                                                                      |
| [Component complexity](../rules/arch-component-complexity.md)                                                                                                                                                     | `complexity`, `max-lines-per-function`                                                                                                   | Reuse architecture inventory output for substantial-JSX candidates. Element count measures neither lint threshold and cannot require extraction.                                                                                                                                                                                                                                                                                                                       |
| [Store modules](../rules/arch-stores-no-index.md)                                                                                                                                                                 | `local/atom-contract` for module naming and placement                                                                                    | Use the cycle command for store dependency reviews and runtime import changes. Inspect barrels, direct imports and concern boundaries separately.                                                                                                                                                                                                                                                                                                                      |
| [Entity placement](../rules/types-file-per-entity.md)                                                                                                                                                             | `local/entity-type-files`                                                                                                                | Reuse architecture inventory output when reviewing exported contracts outside canonical type files. Valid local helper/component contracts may be listed.                                                                                                                                                                                                                                                                                                              |
| [Helper categories and naming](../rules/helpers-categories.md)                                                                                                                                                    | `local/helper-module-contract`                                                                                                           | Use the three-category registry (`transformers`, `formatters`, `presenters`). Check API/schema/state/effect boundaries with `local/helper-module-contract`, display dependencies with `local/no-service-presentation`, browser access with `local/no-browser-in-pure-helpers` and text signatures with `local/formatter-contract`. Review semantics and ownership before choosing a category or coordinating a rename; primitive return types do not establish intent. |
| [Static keys](../rules/i18n-static-keys.md), [translated copy](../rules/i18n-no-hardcoded-strings.md), [translation defaults](../rules/i18n-no-default-value.md), [interpolation](../rules/i18n-interpolation.md) | `local/i18n-consistency`, `local/no-hardcoded-ui-strings`, `local/no-ui-string-concat`                                                   | `react-best-practices-i18n --catalog <reference.json>` when reviewing translation calls or changing keys. Inspect unused-key reports before removal and review display sites manually.                                                                                                                                                                                                                                                                                 |
| [Warning budget](../rules/quality-eslint-warning-budget.md), [suppression policy](../rules/quality-eslint-disable-scoped.md), and selected rules with configured checks                                           | The normal configured checks, suppression processor and metadata/tracking rules                                                          | `react-best-practices-lint --max-warnings <reviewed-ceiling>` is the full-project gate. Preserve its warnings; a quiet catalog command or profiling does not replace it.                                                                                                                                                                                                                                                                                               |

Other packaged custom checks are registered by [the plugin](../eslint-rules/index.js)
and configured by [the preset](../eslint.config.mjs); their contracts remain in
their owning rule files. A rule can have several detectors or none. A missing
detector still requires manual review at that rule's catalog priority.

## Output and analysis limits

- **Architecture inventory:** [implementation](../scripts/audit-architecture.mjs).
  Walks `<root>/src`, inspects declared features and production domain `.ts`
  modules outside `types/*.type.ts` for directly exported object aliases. Features
  with no identified business signal, opaque calls, local presentation or at
  least 12 JSX elements become candidates. Output includes file/line and observed
  dependencies. It does not cover every component role or type form, prove a
  violation, require an extraction or add warning-budget entries.
- **Cycles:** [implementation](../scripts/import-cycles.mjs). Uses the selected
  TypeScript configuration and aliases for the local production graph. Synchronous
  value imports and reexports form edges; erased type-only and deferred imports
  do not. Cycles fail the command. An empty result proves neither business
  ownership nor safety of deferred loading.
- **Catalog usage:** [implementation](../scripts/check-i18n-catalog.mjs) and
  [collector](../scripts/collect-translation-keys.mjs). Scans `<root>/src` `.ts`/`.tsx`
  calls using supported translation bindings and checks unused entries in the
  supplied flat reference catalog, including `_one`/`_other` variants. Unused
  entries fail the command. Other locales, unsupported runtime consumers and
  whether all visible copy is translated require separate review. Missing keys,
  defaults and required interpolation options are checked by the configured lint
  rules, within their own analysis limits.

Architecture, cycles and catalog commands accept `--root <application-directory>`;
the calling directory is the default. Cycles default to `tsconfig.app.json` and
accept `--project`; the catalog command requires `--catalog` and accepts `--source`
(default `src`). Relative options resolve from the selected root. Scripts analyze
that application, never a source tree relative to the installed skill.

## Runners, cache and regression checks

[The lint runner](../scripts/lint.mjs) preserves ESLint flags such as `--fix` and
`--no-cache` and the consuming application's explicit warning ceiling. It also
lints the packaged tooling with its own zero-warning gate. The
[fingerprint](../scripts/eslint-project-fingerprint.mjs) includes project source,
integration tests, configuration, the configured reference catalog and packaged
tooling inputs, so changes outside a linted file invalidate cached results.

Use `react-best-practices-profile [paths...]` to investigate expensive lint rules
or files. Its timings and error-based exit do not enforce the warning ceiling.
Runners, profiling and regression suites support the mapped checks; they do not
create additional catalog rules or independent audit priorities.

Run the generic suite through the consuming application's Vitest installation:

```sh
vitest run --config node_modules/@frontend-engineering/react-best-practices/vitest.config.mjs
```

This suite uses its own root and no application setup files. Keep integration
tests that require actual application paths or dependencies with that application
and run both suites in CI. Passing either suite, lint or scripts does not replace
the catalog's required semantic review.

## Fixture ownership inventory

The [fixture rule](../rules/test-mock-data.md) binds ownership review to
`react-best-practices-fixtures --project <config.json>`, alongside the existing
`local/test-fixture-contract` check. The CLI accepts `--root`, `--source` and
`--project`, using the consuming application's TypeScript aliases and canonical
domain contracts under `<source>/domains/**/types/*.type.ts`.

Save its JSON in the application dossier and disposition every candidate and
relevant excluded/opaque pattern. Object/intersection/union contracts, small
records, variables and generated rows are included without a field-count floor.
Resolved assertion, mock-override, case-table and validation contexts have
explicit exclusion reasons. Other raw transport or action/configuration values
can remain review candidates. A successful command reports inventory availability,
not compliance; candidates do not add lint warnings or declare ownership errors.
Unavailable/invalid inputs exit 2. Analysis limits and remaining semantic
obligations belong to the owning rule. Keep application aliases and actual
results in the consuming project, not this reusable package.

## Audit colocation and metrics

`test-colocated-tests` binds to `react-best-practices-test-colocation`. Capture
`--root <application> --source src --snapshot` as an audit baseline before edits.
Then run the same root/source with `--baseline <snapshot.json>` and optional
`--provenance <reviews.json>`. Output is JSON; exit 1 means missing siblings or
pending classifications; exit 2 means invalid/unavailable input. This checks
presence for introduced contracts, not meaningful behavior coverage.

Provenance is `{ "moves": [], "roles": [] }`. Each move names `from`, `to`,
`previousSha256`, `sha256` and a review `reason`; changed bodies also need an
explicit `sameContract: true` review. Leave a new/extracted contract out of the
move map so it receives introduced-owner checks. Role reviews name an unresolved
`file`, its current `sha256`, a reason and one supported role: component, hook,
helper, service, store, type-only, fixture, story, support or asset. Stale, duplicate
or unproven mappings fail validation. Reviews are semantic evidence, not arbitrary
exemptions. Baseline and current snapshots must describe the same source root.

The [audit metrics contract](audit-metrics.md) binds reporting to
`react-best-practices-audit-metrics --input <metrics-input.json>`. It emits the
fixed formula/version, all impact volumes, score and scope/coverage limits as
JSON; invalid input exits 2. Keep application finding/rule inputs and snapshot
outputs in its dossier. These report/check commands do not add catalog rules
or replace the existing full-project lint warning gate.
