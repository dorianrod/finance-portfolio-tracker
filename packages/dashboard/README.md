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

Filter-option construction also belongs to portfolio `shared/`: scope selection
uses its choices, while `useBuildDashboardSourceData` supplies its account IDs to
`useDashboardHistory` and its account types to position sorting/grouping. The
sharing detector cannot follow these shell data flows, so its review warning is
retained with this ownership evidence rather than moving common data into a leaf.

Common source queries, schemas and portfolio contracts live in portfolio `shared/`
and feed several capabilities through the shell. Fund holdings, composition history
and statuses are common sources; coverage reports, snapshot manifests and unresolved
source diagnostics belong to `features/data-quality/features/assessment`.

## Frontend conventions

The conventions and audit method are defined in
[`generic-react-best-practices`](../../.agents/skills/generic-react-best-practices/SKILL.md).
The dashboard consumes the skill's npm package through the small
[ESLint adapter](eslint.config.js). Commands and the warning ceiling are defined
in [package.json](package.json).
For audits, select and prioritize the skill's applicable rules first, then use
the [rule-to-tool bindings](#rule-to-tool-bindings) below to gather evidence.

### Formatting and sorting

[Prettier configuration](.prettierrc.json) sets `semi: false`, `singleQuote: true`
and `trailingComma: "all"`. The pinned Prettier 3 version supplies the remaining
defaults, including a preferred width of 80, two-space indentation, double quotes
for JSX attributes and LF line endings. The [ignore file](.prettierignore)
excludes generated output, dependencies, generated data, caches and coverage.

The skill's ESLint preset sorts imports and exports with `simple-import-sort`.
It also enforces erased type-only imports and places the public callable API
before implementation details in production source. See the skill's
[formatting rule](../../.agents/skills/generic-react-best-practices/rules/quality-formatting-and-sorting.md)
for exact import groups and ordering scope. Object/schema keys, JSX props and
Tailwind classes have no configured automatic sorter.

Run `npm run format` to apply Prettier, ESLint fixes and a final Prettier pass.
Run `npm run format:check` to check both formatting and lint.

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
with the skill's [project fingerprint](../../.agents/skills/generic-react-best-practices/scripts/eslint-project-fingerprint.mjs) that includes
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

The audit method also uses `audit:colocation` to compare introduced runtime owners
with a frozen source snapshot, and `audit:metrics` to calculate the versioned impact
volumes and score. Run `npm run --silent audit:colocation -- --snapshot` before
implementation and save its JSON in the dossier. After edits, run the same command
with `--baseline <snapshot.json>` and any reviewed provenance file. Run
`npm run --silent audit:metrics -- --input <metrics-input.json>` for baseline and
final findings. The skill's project-enforcement and audit-metrics references define
the input contracts and limits. Presence does not establish test quality, and the
score describes the reviewed scope with its recorded exceptions.

For fixture ownership reviews, run `npm run --silent audit:fixtures` and save its
JSON in the audit dossier. It enumerates complete local sample candidates,
including composed domain types and small/generated records, through
`tsconfig.fixtures.json`. Review the candidates and recorded exclusions against their
actual consumers: typed overrides, raw schema/transport input, expected values
and explicit scenario/action arguments have different responsibilities. A
successful inventory does not establish fixture ownership compliance and does
not replace the ordinary lint gate.

The skill packages the custom ESLint rules, shared configuration, analysis scripts
and generic tests. Follow its [installation and per-rule tool bindings](../../.agents/skills/generic-react-best-practices/references/project-enforcement.md)
and priority order before choosing audit commands. Run dashboard commands from
`packages/dashboard`; their aliases are defined in [package.json](package.json).

The [ESLint adapter](eslint.config.js) supplies this project root and the reference
catalog at `src/i18n/locales/en.json`. `audit:cycles` selects `tsconfig.app.json`;
`audit:i18n` selects the same reference catalog, runs quiet source lint first and
does not replace the normal `lint` warning-budget gate. The other bundled tools
use the calling project as their root. No application-specific implementation is
copied into the skill.

The package is a local file dependency. [.npmrc](.npmrc) enables `install-links`
so npm installs a packed copy with access to the dashboard's peer dependencies.
Run `npm ci` after editing the skill's tooling to refresh that installed copy;
CI installs the current skill contents on every run. Keep the dependency path in
[package.json](package.json) relative to the dashboard.

`npm test` runs application tests and the skill's generic suite (`npm run test:skill`).
Project-specific integration cases live in [tests/eslint/](tests/eslint/) and
exercise the installed preset against actual dashboard paths, dependencies and
catalog values. The cycle integration case checks the actual production graph.
The lint runner also checks the packaged tooling itself with its own zero-warning
gate, preserving coverage after the move out of the dashboard directory.

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

Helper modules use documented categories and match their public callable export;
the shared preset checks both conventions, including local export aliases.
Chart labels use typed selectors over validated chart data and return formatted
text. Their public API exposes neither Recharts' broad formatter nor an untyped
field name, so callers format domain fields without runtime coercion.

Component-role enforcement also checks private JSX components and slots that
forward children, so a feature cannot hide a presentation-only child. Views
cannot import domain aggregators; chart features prepare grouped tooltip data.
Account categories use a closed domain union validated and normalized in Yup; absent
metadata stays explicitly unknown. Source dictionaries use own-property reads,
with an optional result that callers must handle. Fund-status lookups share a
memoized index and preserve source order when identifiers overlap.

`noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` remain migration
candidates. Enable them after reviewing collection completeness and the intended
meaning of absent versus explicitly undefined props. `no-unnecessary-condition`
should follow accurate indexed-access types so it does not encourage removing
useful absence guards. `require-await` adds noise to intentionally async network
mocks; `consistent-type-definitions` conflicts with required dependency interface
merging, which the local entity rule already handles. Do not solve these cases by
adding suppressions or widening every optional property.

Fixture ownership reviews run in CI with `npm run audit:fixtures:check`.
`npm run --silent audit:fixtures` collects candidates and fingerprints without
approving them. The versioned `tests/fixtures/ownership-review.json` records the
reviewed scenario, policy and raw transport cases that intentionally remain
inline. New candidates or changed source, compiler, tooling or lockfile inputs
require review. The source fingerprint includes all analyzed files in `src`, so
adding, editing or removing a test without candidates also requires review.
Canonical domain types omitted from the analysis project fail the inventory;
an outer case, validation or mock call does not exempt a nearer business input.
Inspect the inventory, changed definitions, consumers and owning
mocks before updating its metadata and per-test hashes; correct actual fixture
defaults in their owning mocks. Do not refresh the ledger simply to obtain a pass.
The gate does not replace lint or semantic inspection of opaque builders.
