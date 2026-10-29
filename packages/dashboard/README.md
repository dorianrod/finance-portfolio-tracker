# finance-dashboard

React/Vite dashboard for visualising the CSVs produced by
[finance-pipeline](../pipeline).

Portfolio analysis lives in `src/domains/portfolio/`. The application shell in
`src/app/` composes these capabilities:

| Capability      | User outcome                                             | Ownership                                                                    |
| --------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Scope selection | Choose accounts, positions and reporting periods         | `features/scope-selection`; common filter state in portfolio shared stores   |
| Overview        | Compare portfolio value and its main change drivers      | `features/overview`                                                          |
| Wealth          | Understand wealth, contributions, cash flow and savings  | `features/wealth`                                                            |
| Performance     | Evaluate returns, passive income and asset contributions | `features/performance`                                                       |
| Diversification | Inspect allocations and concentration                    | Peer `allocation` and `concentration` children of `features/diversification` |
| Holdings        | Inspect held positions and underlying fund exposures     | Peer `positions` and `fund-look-through` children of `features/holdings`     |
| Data quality    | Assess reliability and inspect source anomalies          | Peer `assessment` and `errors` children of `features/data-quality`           |

Common source queries, schemas and portfolio contracts live in portfolio `shared/`
and feed several capabilities through the shell. Fund holdings, composition history
and statuses are common sources; coverage reports, snapshot manifests and unresolved
source diagnostics belong to `features/data-quality/features/assessment`.

## Frontend conventions

The conventions and audit method are defined in
[`generic-react-best-practices`](../../.agents/skills/generic-react-best-practices/SKILL.md).
The dashboard implements its ESLint checks in [eslint.config.js](eslint.config.js)
and [eslint-rules/](eslint-rules/). Commands and the warning ceiling are defined in
[package.json](package.json).
For audits, select and prioritize the skill's applicable rules first, then use
the [rule-to-tool bindings](#rule-to-tool-bindings) below to gather evidence.

## Development

From `packages/dashboard`:

```bash
npm install
npm run dev
```

Reads CSVs from `../../data/output` (override with `FINANCE_DATA_DIR`,
same convention as finance-pipeline).

`make dashboard` from the repository root starts both Vite and the local
Python API used to recalculate portfolio IRR for the selected accounts. The
API delegates to finance-pipeline's TRI domain code; the browser does not
implement XIRR itself.

### Checks

```bash
npm run format:check
npm run typecheck
npm test
npm run build
npm run build-storybook
```

`npm run format:check` checks formatting and runs ESLint. Lint results are cached
with a [project fingerprint](scripts/eslint-project-fingerprint.mjs) that includes
imported types, rules and translation catalogs. Use `npm run lint -- --no-cache`
for an uncached run, or `npm run lint:profile` to inspect expensive rules and slow
files.

[Vitest](vitest.config.ts) limits concurrency to four workers because the typed
ESLint suites each load a TypeScript project.

## Storybook and design system

Run `npm run storybook` from `packages/dashboard` and open
`http://localhost:6006`. `npm run build-storybook` writes the static catalog to
`storybook-static/`.

Stories, configuration and fictional fixtures live in
[`src/shared/ui/storybook/`](src/shared/ui/storybook/). The catalog supports dark
and light themes, controls and interaction examples. Its Vite configuration
excludes the dashboard's CSV middleware, API proxy and public data directory.
`npm run typecheck` includes Storybook, and `npm test` checks component and slot
examples in the catalog.

UI primitives and their internal services live in [`src/shared/ui/`](src/shared/ui/).
Theme tokens are defined in [`src/index.css`](src/index.css) and
[`src/shared/theme/`](src/shared/theme/). Update the catalog examples when changing
a primitive.

## Run locally via pipx

The static build is bundled into a small Python launcher so end users only
need to run `finance-dashboard`, no Node-based dev server. `dist/` (its
build output) is gitignored, so a fresh checkout doesn't have it — the
`hatch_build.py` build hook runs `npm ci && npm run build` automatically
during packaging, both for a local install and for the GitHub git-URL
install below (Node.js/npm must be on `PATH` at install time; an existing
`dist/`, e.g. from `npm run build` during development, is left as-is and
not rebuilt):

```bash
pipx install .
# or, directly from GitHub:
pipx install "git+https://github.com/dorianrod/finance-portfolio-tracker.git#subdirectory=packages/dashboard"

finance-dashboard --data-dir ~/Finance/data
```

Serves the bundled static assets plus the CSVs under `<data-dir>/output/`,
then opens a browser. Same `--data-dir` / `FINANCE_DATA_DIR` / `./data`
resolution as finance-pipeline. Use `--port` to change the port or
`--no-browser` to skip auto-opening one.

The standalone `finance-tool dashboard` executable bundles the pipeline and
supports filtered IRR out of the box. A separately installed
`finance-dashboard` still serves all static data, but its filtered-IRR API
returns an unavailable response unless `finance-pipeline` is importable in the
same Python environment.

## Public demo (GitHub Pages)

`.github/workflows/deploy-pages.yml` builds and publishes a public,
read-only copy of this dashboard on every push to `main`, backed
**only** by `finance-init`'s synthetic example portfolio (generated fresh
in the runner, never the real `data/`). Data fetches go through
[endpoint registry](src/domains/portfolio/shared/apis/endpoints.ts) so they keep resolving correctly
under the `/<repo>/` base path GitHub Pages project sites are served
from.

The example covers all account categories and includes long fictional PEE and
private-equity histories so both the trailing three-year IRR and the
shorter-period fallback are visible. Publicly traded instruments are used only
to demonstrate market-price fetching; the names, amounts and valuations of
the example accounts are fictional. It also includes fictional dated fund
compositions so the Held positions / Look-through concentration history,
partial coverage and unresolved exposure are all visible in the static demo.

Because GitHub Pages has no Python runtime, its filtered-IRR example is a
pre-generated "exclude private equity" API response. The deployment workflow
creates that fixture with the same Python TRI engine used by the local API.

To generate and test that exact static demo locally (including its synthetic
portfolio and pre-generated filtered-IRR response), run from the repository
root:

```bash
make dashboard-demo
```

This builds the site with a root base path and serves it at
`http://127.0.0.1:4173`. Use `DEMO_PORT=...` or `DEMO_HOST=...` to override the
preview address. `make dashboard-demo-build DEMO_BASE=/some/subpath/` performs
only the shared build used by the deployment workflow.

One-time setup on GitHub, after this repo has a remote: **Settings →
Pages → Build and deployment → Source: "GitHub Actions"**. The workflow
also runs on-demand from the Actions tab (`workflow_dispatch`).

Note this makes the dashboard's UI (with fake numbers) reachable by
anyone with the `https://<user>.github.io/<repo>/` URL, regardless of
whether the source repo itself is public or private.

## Rule-to-tool bindings

The skill owns each rule's contract, impact, exceptions and incorrect/correct
examples. Start with applicable CRITICAL rules, then HIGH, MEDIUM-HIGH, MEDIUM,
LOW-MEDIUM and LOW, using the skill's category priority for ties. Read individual
rule impacts rather than assuming every rule has its category's impact. These
bindings implement that review; scripts do not define a separate audit sequence.
Run commands from `packages/dashboard`. Shared output can be collected once and
reused across selected rules; process its findings at each owning rule's priority.

| Catalog rules (impact) | Configured ESLint aids | Complementary script: when to use it and what it establishes |
| --- | --- | --- |
| [`arch-component-roles`](../../.agents/skills/generic-react-best-practices/rules/arch-component-roles.md) (CRITICAL) | `local/component-role`, `local/state-component-contract` | `npm run audit:architecture` for component-role reviews: lists visual-only or unresolved features, local presentation and substantial JSX, with business evidence and opaque calls. Each entry needs a responsibility decision. |
| [`arch-transverse-only-imports`](../../.agents/skills/generic-react-best-practices/rules/arch-transverse-only-imports.md) (CRITICAL) | `local/import-boundaries` | `npm run audit:cycles` when reviewing dependency boundaries or changing runtime imports: detects synchronous graph cycles. An acyclic forbidden import still violates the catalog; inspect ownership separately. |
| [`arch-component-complexity`](../../.agents/skills/generic-react-best-practices/rules/arch-component-complexity.md) (HIGH) | `complexity`, `max-lines-per-function` | Reuse `npm run audit:architecture` output for substantial-JSX candidates. Its element count does not measure either lint threshold or require extraction. |
| [`arch-stores-no-index`](../../.agents/skills/generic-react-best-practices/rules/arch-stores-no-index.md) (HIGH) | `local/atom-contract` for module placement/naming | `npm run audit:cycles` for store dependency reviews and runtime import changes. It rejects cycles; inspect barrels, direct imports and concern boundaries separately, using the rule's barrel inventory. |
| [`types-file-per-entity`](../../.agents/skills/generic-react-best-practices/rules/types-file-per-entity.md) (MEDIUM) | `local/entity-type-files` | Reuse `npm run audit:architecture` when reviewing entity placement. Exported object aliases outside canonical type files are candidates; valid helper or component contracts can appear. Decide from actual consumers and ownership. |
| [`i18n-static-keys`](../../.agents/skills/generic-react-best-practices/rules/i18n-static-keys.md), [`i18n-no-hardcoded-strings`](../../.agents/skills/generic-react-best-practices/rules/i18n-no-hardcoded-strings.md), [`i18n-no-default-value`](../../.agents/skills/generic-react-best-practices/rules/i18n-no-default-value.md), [`i18n-interpolation`](../../.agents/skills/generic-react-best-practices/rules/i18n-interpolation.md) (MEDIUM) | `local/i18n-consistency` for supported keys, missing entries, defaults and required interpolation options; `local/no-hardcoded-ui-strings`, `local/no-ui-string-concat` for copy | `npm run audit:i18n` when reviewing translation calls or changing keys: runs quiet source lint, then checks unused reference-catalog entries. Inspect reports before removing keys and review display sites manually. |

The architecture inventory walks `src`, inspecting `.feature.tsx` components and
production domain `.ts` modules outside `types/*.type.ts` for directly exported
object aliases. Its substantial-JSX signal starts at 12 elements. It does not
inventory all component roles or type forms, and its candidate count and successful
exit do not establish compliance or become ESLint warning-budget entries.

The cycle checker uses `tsconfig.app.json` resolution and aliases for the local
production graph. Synchronous value imports and reexports form edges; erased
type-only and deferred dynamic imports do not. It fails when cycles are found,
and its regression suite also checks the actual application graph in CI. It does
not prove business ownership or safety of deferred loading.

The catalog script scans source `.ts`/`.tsx` calls using
`collect-translation-keys.mjs`, resolves supported translation bindings and
checks unused keys in `src/i18n/locales/en.json`, including `_one`/`_other`
variants. It does not check other locales, all visible copy or arbitrary runtime
key consumers. Missing keys and several call-site contracts are checked by
ESLint. `audit:i18n` uses `--quiet` and runs the catalog step only after lint
succeeds; it does not replace `npm run lint` with its full warnings and budget.

For every selected rule with configured lint detection, use `npm run lint` for
the normal full-project gate, including
[`quality-eslint-warning-budget`](../../.agents/skills/generic-react-best-practices/rules/quality-eslint-warning-budget.md)
and suppression metadata. `scripts/lint.mjs` is its cached runner;
`eslint-project-fingerprint.mjs` is loaded by the lint configuration to invalidate
results after lint inputs change. `npm run lint:profile -- <paths>` profiles
lint cost when needed; its timings and error-based exit do not enforce the warning
ceiling. These helpers, `collect-translation-keys.mjs` and `*.test.mjs` support
the mapped checks rather than adding independent audit passes. Rules without a
script still require their configured checks and manual review at catalog priority.

## Architecture and TypeScript prevention

ESLint rejects clearly visual-only features and follows local runtime dependency
paths, including aliases, reexports and dynamic imports. It rejects hidden display
formatting in reusable services and independent exported object shapes hidden in
domain implementation modules. See the skill's owning rules for the boundaries
and valid local support contracts.

Typed ESLint checks cover unhandled/misused promises, propagated `any`, incomplete
union switches, unchecked narrowing/non-null assertions and unnecessary conversions.
Type-only imports are fully erased, promise rejection callbacks use `unknown`,
and returned promises are awaited where error handling requires it. Shared chart axes expose
typed tick values, and CSV schema helpers preserve their validated generic output.
Browser and tooling projects both use `strict`, `noImplicitReturns`,
`noImplicitOverride` and `noPropertyAccessFromIndexSignature`.

Discarding a promise with `void` still requires rejection handling. Speculative
tab downloads defer failure feedback to the navigation error boundary, while
translation initialization completes before dependent modules render. Numeric
JSX text uses the shared formatter hooks; the configured check also follows
immutable text aliases and native number-to-string conversions, keeping scalar
props and technical attributes valid. Component-role analysis recognizes
translation calls and native boolean coercion so they cannot disguise a purely
presentational component as a feature.
External UI renderers are named module-level components, including renderers
supplied in literal configuration objects to dependency factories such as table
column builders.

`noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` remain migration
candidates. Enable them after reviewing collection completeness and the intended
meaning of absent versus explicitly undefined props. `no-unnecessary-condition`
should follow accurate indexed-access types so it does not encourage removing
useful absence guards. `require-await` adds noise to intentionally async network
mocks; `consistent-type-definitions` conflicts with required dependency interface
merging, which the local entity rule already handles. Do not solve these cases by
adding suppressions or widening every optional property.
