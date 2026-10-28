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
npm run audit:i18n
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

## Architecture and TypeScript prevention

Run `npm run audit:architecture` before an architecture review. It lists features
with unclear business ownership, mixed local presentation, substantial JSX and
exported object contracts outside canonical entity files. Each entry is a review
candidate, with its observed dependencies; it does not fail lint or certify that
an extraction is necessary. Group comparable candidates before correcting them.

ESLint rejects clearly visual-only features and follows local runtime dependency
paths, including aliases, reexports and dynamic imports. It rejects hidden display
formatting in reusable services and independent exported object shapes hidden in
domain implementation modules. See the skill's owning rules for the boundaries
and valid local support contracts.

Typed ESLint checks cover unhandled/misused promises, propagated `any`, incomplete
union switches, unsafe coercions and redundant assertions. Shared chart axes expose
typed tick values, and CSV schema helpers preserve their validated generic output.
Browser and tooling projects both use `strict`, `noImplicitReturns`,
`noImplicitOverride` and `noPropertyAccessFromIndexSignature`.

`noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` remain migration
candidates. Enable them after reviewing collection completeness and the intended
meaning of absent versus explicitly undefined props. `no-unnecessary-condition`
should follow accurate indexed-access types so it does not encourage removing
useful absence guards. `require-await` adds noise to intentionally async network
mocks; `consistent-type-definitions` conflicts with required dependency interface
merging, which the local entity rule already handles. Do not solve these cases by
adding suppressions or widening every optional property.
