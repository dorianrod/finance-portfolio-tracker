# finance-dashboard

React/Vite dashboard for visualising the CSVs produced by
[finance-pipeline](../pipeline).

## Development

```bash
npm install
npm run dev
```

Reads CSVs live from `../../data/output` (override with `FINANCE_DATA_DIR`,
same convention as finance-pipeline).

`make dashboard` from the repository root starts both Vite and the local
Python API used to recalculate portfolio IRR for the selected accounts. The
API delegates to finance-pipeline's TRI domain code; the browser does not
implement XIRR itself.

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
