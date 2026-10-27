# finance-dashboard

React/Vite dashboard for visualising the CSVs produced by
[finance-pipeline](../pipeline).

[ARCHITECTURE.md](ARCHITECTURE.md) documents business capabilities, feature
ownership and the import boundaries enforced by ESLint.

## Development

```bash
npm install
npm run dev
```

`npm run lint` caches results and invalidates the entire cache when a lint input
changes, including imported types and translation catalogs. Use
`npx eslint .` for a full check or `npm run lint:profile` to inspect
parsing time, expensive rules and slow files. See the
[ESLint performance audit](ESLINT_PERFORMANCE_AUDIT.md) for measurements and scope.

The lint also follows dependent component calculations and boolean formatter
guards, rejects context dependencies passed to helpers, checks numeric conditions,
public class ordering, collection pipelines, translated text assembly and DOM
colors. Module-level translated labels are deferred until access; chart axes use
the existing percentage formatter with `decimals: 'auto'` when no rounding was
previously applied. All checks run at error level, and CI runs the complete test
suite, including every custom rule.

The [historical ESLint audit](ESLINT_HISTORY_AUDIT.md) measures these checks against
the four audit commits and documents the remaining manual and behavioral checks.
Reproduce it from this directory with a checkout containing those commits:

```bash
npm run audit:eslint-history -- --output /tmp/finance-eslint-history.json
node scripts/summarize-eslint-history.mjs /tmp/finance-eslint-history.json /tmp/finance-eslint-coverage.json
```

Reads CSVs live from `../../data/output` (override with `FINANCE_DATA_DIR`,
same convention as finance-pipeline).

`make dashboard` from the repository root starts both Vite and the local
Python API used to recalculate portfolio IRR for the selected accounts. The
API delegates to finance-pipeline's TRI domain code; the browser does not
implement XIRR itself.

## Storybook

From `packages/dashboard`, run `npm run storybook` and open
`http://localhost:6006`. Run `npm run build-storybook` to produce an independent
static catalog in `storybook-static/`.

Configuration, typed stories and deterministic fictional fixtures live in
`src/shared/ui/storybook/`. The catalog covers every exported shared UI component
and compound slot, grouped by family. Use Controls to explore props and the theme
toolbar to switch between dark and light, including dialogs and other portals.
Interactive examples include selection, inputs, keyboard navigation and panels;
representative stories also run interaction assertions through `play` functions.

Storybook uses a dedicated Vite configuration, without the dashboard's CSV
middleware, API proxy or public data directory. Production code cannot import
catalog files; ESLint enforces this boundary. `npm run typecheck` includes the
catalog, and `npm test` checks that every public component and slot has a JSX
example. When adding a shared UI component, add its story here as well.

## UI design system

Visual styling belongs in `src/shared/ui` primitives. Application and domain
code may use layout classes/styles only: display, flex/grid, container alignment,
order, margins, **padding**, gap, dimensions, aspect ratio, overflow, positioning
and z-index. Colors, backgrounds, borders, typography, radii, shadows, opacity,
animations and interaction styling belong to the design system. Reuse or extend
a primitive and pass semantic variants such as `tone` instead of applying visual
classes, including imported constants, from a domain.

Tailwind CSS v4 tokens in `src/index.css` and constants in `src/shared/theme`
remain authorized design-system infrastructure. Shared UI should consume semantic
utilities (`bg-canvas`, `bg-surface`, `text-content`, `text-content-muted`,
`border-border`, `text-accent`) instead of raw palette classes. Semantic classes
still count as visual styles and must be applied inside shared UI.

`local/no-domain-styling` reports errors for non-layout classes, inline style
properties, native/SVG styling, Recharts appearance props and local stylesheets
outside the design system. It follows resolvable constants, conditional values,
templates, assembled arrays, JSX spreads and React element factory props. A
separate `unverifiableStyle` diagnostic requests review when static analysis cannot
determine a value; it does not claim that value is a proven visual violation.
Tests and generated files are exempt. The check does not parse CSS contents or
analyze arbitrary imperative DOM mutations, and it has no autofix. Diagnostics reference
[`styling-centralize-in-shared-ui`](../../.agents/skills/dorian-react-best-pratices/rules/styling-centralize-in-shared-ui.md)
to guide subsequent component migrations.

Shared UI public props exclude both `className` and `style`, including inherited
native React and chart-library props. `local/no-shared-ui-classname` checks both
properties on component APIs and callers, including spreads and React element
factories. Callers position primitives through external containers and use their
semantic sizing and appearance options. Internal chart text and swatches apply
their styles within the owning primitive.

Reusable interaction patterns live in `src/shared/ui`. Typography, surfaces,
controls, KPI values, chart series, SVG marks and tooltip appearance are exposed
through semantic variants. Compose custom chart renderers through nested
`SeriesBar.Shape`, `SeriesLine.Markers`, `SeriesPie.Labels` and related slots.
Domain code supplies the data, geometry, labels and business actions.

The styling migration has no remaining `local/no-domain-styling` diagnostics; see
[the audit](STYLING_AUDIT.md) for its scope and validation. Existing global theme
compatibility overrides remain infrastructure; new code should use the shared
primitives and semantic tokens.

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
`src/csvData.ts`'s `dataUrl()` helper so they keep resolving correctly
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
