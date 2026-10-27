# finance-dashboard

React/Vite dashboard for visualising the CSVs produced by
[finance-pipeline](../pipeline).

The `portfolio` domain owns portfolio analysis. The application shell composes
these capabilities; tabs and display modes do not introduce new domain boundaries.

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
because the shell distributes them to several capabilities. Child calculations and
interaction stores stay with their feature. Global `src/shared/` contains generic
infrastructure and UI without portfolio vocabulary. ESLint enforces these import
directions and the two-level feature limit.

## Development

```bash
npm install
npm run dev
```

`npm run lint` caches results and invalidates the entire cache when a lint input
changes, including imported types and translation catalogs. Use
`npx eslint .` for a full check or `npm run lint:profile` to inspect
parsing time, expensive rules and slow files. The
[profiler](scripts/profile-eslint.mjs) reports the measurements for the current tree.

`npm run lint` also enforces a versioned `--max-warnings` ceiling, currently `155`.
Every reviewed suppression produces one tracking warning, even when it names
several rules. Use a line-scoped directive with named rules and this metadata:

```typescript
// eslint-disable-next-line rule-name -- reviewed: YYYY-MM-DD; concrete technical reason
```

Read the affected code and applicable rule before accepting an exception; the
checks validate the metadata, not the technical reason. Accept only demonstrated
false positives, dependency constraints or exceptions allowed by the rule, rather
than postponing a correction. Record the actual last review date. Increase the
ceiling by one for each newly accepted exception and explain the change; lower it
when an exception is removed. Reviewing the same exception again updates its date
without increasing the ceiling. Native ESLint warnings also count toward the
global ceiling. Unused suppressions and missing or invalid review metadata are
errors; blanket and file/block disables are forbidden. These policy diagnostics
remain visible even under a blanket disable. No autofix dates or approves an
exception, and nothing automatically updates the ceiling.

The 2026-10-27 audit reviewed all 162 existing directives against the affected code,
rules and consumers, and confirmed that each still suppressed a diagnostic.
Centralizing date fallbacks subsequently removed one obsolete complexity directive.
Separating assessment-only fund diagnostics from common holdings sources and
centralizing CSV boolean validation removed six more ownership exceptions.
The current ceiling accounts for 56 cohesive-function complexity exceptions (one also covers
function length), 63 shared-input ownership exceptions, 35 controlled-component or
presentation-adapter exceptions and one TanStack Table v8 dependency constraint.
It leaves no spare capacity. Each directive records its technical reason and actual
review date. The table exception follows React's
[incompatible-library guidance](https://react.dev/reference/eslint-plugin-react-hooks/lints/incompatible-library):
the stable table instance uses interior mutability, so its row model is read on
every render without memoizing that API; React Compiler is not enabled.

The [React audit](REACT_AUDIT.md) records the corrections and validation from the
2026-10-27 follow-up. The [shared ownership evidence](SHARED_OWNERSHIP_AUDIT.md)
identifies the common-source consumers behind the remaining ownership exceptions.

Endpoint query hooks follow `useGet<Entity>[Aspect]Query`. Filter-dependent queries
retain their previous result with `keepPreviousData`; the shell announces when
previous-scope results remain visible. Account IRR and asset IRR treat placeholder
results as loading, so an earlier selection's return is never presented as the
current selection's return. Navigation and filters stay mounted through loading
and errors. Filter actions update the latest Jotai value rather than a captured
render snapshot.

ESLint also enforces API hook placement/naming and explicit
query transition policies, functional state updates, formatter input/fallback
contracts, independent entity files, safe boolean transforms, shared hook state
ownership, caller callback/ref preservation, extremum selection and redundant
numeric coercions. These checks run at error level in the regular lint command
and CI, and their regression tests run with `npm test`.

Fund compositions, composition history and statuses remain common portfolio
sources. Coverage reports, snapshot manifests and unresolved-source diagnostics
are owned by `features/data-quality/features/assessment`, with their own validated
query and types. The application combines these results; shared portfolio code
does not depend on assessment contracts. CSV boolean schemas accept recognized
boolean representations and reject malformed values instead of treating them as
`false`.

Future reviews follow
[`generic-react-best-practices`](../../.agents/skills/generic-react-best-practices/SKILL.md), its
[exception review rule](../../.agents/skills/generic-react-best-practices/rules/quality-eslint-disable-scoped.md)
and [warning budget rule](../../.agents/skills/generic-react-best-practices/rules/quality-eslint-warning-budget.md).

`npm test` limits concurrency to four workers because the typed ESLint suites
each load a TypeScript project. This bounds memory use and avoids startup
timeouts caused by running too many of those projects simultaneously.

Application code, tests and Storybook are checked with TypeScript's strict mode.

The lint also follows dependent component calculations and boolean formatter
guards, rejects context dependencies passed to helpers, checks numeric conditions,
public class ordering, collection pipelines, translated text assembly and DOM
colors. Module-level translated labels are deferred until access; chart axes use
the existing percentage formatter with `decimals: 'auto'` when no rounding was
previously applied. Rule violations run at error level; reviewed exceptions and
uncertain feature sharing produce warnings. CI runs the complete test suite,
including every custom rule.

`local/no-inline-format-fallback` checks dates and domain labels as well as
numeric formatters. It follows formatter imports and aliases, both ternary
branches, null/undefined/truthiness checks, return-only guards and `&&`/`||`
short-circuits. For example, replace `date == null ? '' : formatDate(date)`
with `formatDate(date, { fallback: '' })`. The date formatter uses the same
fallback for missing and invalid dates. Loading, permissions and structural
conditions remain outside the formatter. The rule reports errors without an
autofix; see the [formatter enforcement reference](../../.agents/skills/generic-react-best-practices/references/project-enforcement.md)
for its detection boundaries.

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
It also checks resolved DOM style writes, class-list changes and static style
attribute text. Opaque styling receives an explicit diagnostic. Tests and generated
files are exempt. The check does not parse stylesheet contents or reconstruct all
dynamic DOM mutations, and it has no autofix. Diagnostics reference
[`ui-no-adhoc-styling`](../../.agents/skills/generic-react-best-practices/rules/ui-no-adhoc-styling.md)
to guide subsequent component migrations.

Shared UI public props exclude both `className` and `style`, including inherited
native React and chart-library props. `local/no-shared-ui-classname` checks both
properties on component APIs and callers, including spreads and React element
factories. `local/no-domain-accessibility` also rejects raw accessibility props in
public primitive and compound-slot contracts, including inherited HTML props,
and bare Radix value re-exports. Use `ControlProps<NativeProps>` and semantic labels,
states and actions. Callers position primitives through external containers and use their
semantic sizing and appearance options. Internal chart text and swatches apply
their styles within the owning primitive.

`local/no-shared-ui-internal-layout` also follows resolvable business wrappers
that forward their `children` into a visual primitive. Such wrappers preserve
the primitive's internal-layout boundary; an external container or a provider
without a visual box does not introduce that boundary.

Reusable interaction patterns live in `src/shared/ui`. Typography, surfaces,
controls, KPI values, chart series, SVG marks and tooltip appearance are exposed
through semantic variants. Compose custom chart renderers through nested
`SeriesBar.Shape`, `SeriesLine.Markers`, `SeriesPie.Labels` and related slots.
Domain code supplies the data, geometry, labels and business actions.

`local/require-children-composition` checks declared component APIs, JSX and React
element factories, including public compound slots. Numeric and label formatters
return scalar values; caller-supplied UI uses children. Feature trees have at most
two feature levels below a domain. Pure presenters and calculators receive browser
measurements as inputs: `local/no-browser-in-pure-helpers` rejects browser context,
DOM measurements and effects in those folders.

`local/shared-feature-usage` reports exclusive ownership and unused shared code as
errors. `local/review-shared-feature-sharing` separately requests review when static
imports cannot prove sharing through application props. Reviewed line-scoped
exceptions record their actual capability consumers in the dated directives.

The styling migration has no remaining `local/no-domain-styling` diagnostics.
Existing global theme
compatibility overrides remain infrastructure; new code should use the shared
primitives and semantic tokens.

Compound UI shares visual inputs through module-level Jotai atoms scoped to each
instance with [`jotai-scope`](https://jotai.org/docs/extensions/scope). Controlled
inputs initialize a fresh scope when they change, preserving child identity and
focus without mutating the committed store during render or synchronizing copied
state in an effect. Other atoms inherit the parent store, so nested overlays retain
the caller's filters. `local/no-react-context` rejects authored React Contexts,
including in shared UI. Shared UI views may import their own visual services and
stores; business stores and server-state dependencies remain forbidden.

Contribution horizons, concentration playback and position previews have
feature-owned atoms with instance lifetimes. Playback timers and reduced-motion
subscriptions have dedicated hooks. Value-to-text formatters accept `null` and
`undefined`, expose a configurable fallback and retain the established display
for present values, including zero.

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
