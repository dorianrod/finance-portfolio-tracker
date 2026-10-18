# finance-pipeline

Reads broker/account exports under a `data/input/` folder, fetches missing
month-end asset prices, and writes normalised CSVs to `data/output/` for
the dashboard.

## Install

No git clone needed — pipx builds straight from the source tree:

```bash
pipx install .
# once this repo is on GitHub:
pipx install "git+https://github.com/dorianrod/finance-portfolio-tracker.git#subdirectory=packages/pipeline"
```

## Usage

```bash
cd ~/Finance               # any folder holding your data/ directory
finance-init                # first time only: scaffold input/ with an example
finance-pipeline
```

The data directory is resolved as, in order of precedence: `--data-dir`,
the `FINANCE_DATA_DIR` environment variable, or `./data` in the current
directory.

```bash
finance-pipeline --data-dir /path/to/data
FINANCE_DATA_DIR=/path/to/data finance-pipeline
```

Expected layout:

```
data/
  input/
    account_groups.csv
    salaries.csv        -- optional annual net income history
    brokers/
      direct/         -- pre-formatted CSVs (cash accounts, stocks/ETFs...)
      valuations/      -- periodic value/invested snapshots (PE, insurance...)
      boursorama/      -- raw Boursorama PEA/CTO exports
      revolut/         -- raw Revolut statement export
    asset_prices/
    allocations/       -- optional *.xlsx for geo/secteur/currency/classe breakdowns
  output/        (generated)
```

## Fund look-through data

Every `finance-pipeline` run also refreshes composite-position constituents.
There is no account or wrapper exclusion: ETFs, UCITS funds, FCPEs and other
PEE/PEI/PERCO or insurance/private vehicles are candidates whenever they can
be identified. Official issuer files are preferred, exact-index physical
proxies are allowed for synthetic ETFs, and Yahoo is only a partial fallback.
Successful downloads are cached for 30 days and kept if a later request fails.

The generated files are:

- `fund_holdings.csv`: normalized underlying securities and issuers;
- `fund_holdings_status.csv`: source tier (A-D), date, coverage, residual and
  validation issues for every fund;
- `fund_holdings_coverage.csv`: portfolio-level coverage and feasibility
  gates consumed by the dashboard;
- `fund_holdings_attempts.csv`: every selected or rejected source attempt;
- `fund_unresolved.csv`: traceable residual branches and monetary impact,
  ordered for deterministic or agent-assisted research;
- `fund_snapshot_manifest.csv`: validation, age, checksum and provenance for
  every manual/agent snapshot.

Which provider feeds which fund is configured per portfolio in
`input/fund_sources.csv` (private, never in code): one row per fund ISIN with
`parent_isin, provider, adapter, url, quality_tier, index_name,
replication_method, proxy_name, proxy_isin`, with optional `priority`,
`source_role` and `enabled`. Supported adapters are `amundi_api`, `dws_api`,
`ishares_csv`, `globalx_csv` and `globalx_hk_html`. Amundi/Lyxor and
DWS/Xtrackers sources are also discovered from the issuer name and ISIN.

When no repeatable source exists, the `fund-source-research` skill can create
a cited snapshot under
`input/fund_holdings/snapshots/YYYY-MM-DD/<fund-key>/`. Snapshots are tier C,
remain a visible Data quality warning, become stale after 90 days, and stop
being used after 180 days. Nested funds are expanded recursively (five levels,
with cycle detection); every unexplained amount remains in
`fund_unresolved.csv` instead of silently disappearing.

Run an explicit provider check, ignoring the monthly cache, with:

```bash
finance-fund-holdings --data-dir /path/to/data --force
```

The complete underlying-assets view is enabled after at least 85% of the
fund sleeve is covered by A/B sources, the seven largest funds each reach
98%, proxies are exact-index matches, and two successful refreshes have been
observed. Partial and unavailable funds remain visible in Data quality with
their monetary impact.

## finance-init

```bash
finance-init [--data-dir DATA_DIR] [--force]
```

Scaffolds `<data-dir>/input/` with a fully synthetic portfolio covering every
supported broker format and all six account categories — brokerage, checking,
employee savings, retirement, savings and private equity. It includes
Boursorama (PEA + CTO), Revolut, `direct/`, `valuations/`, and an
`allocations/*.xlsx` with a geo/sector/currency/asset-class breakdown.
Five public Yahoo-Finance-tracked assets exercise automatic price fetching;
all account names, amounts and valuations are fictional. Longer PEE and
private-equity histories exercise trailing three-year IRR, while newer
products exercise the available-period fallback. Also writes `input/README.md`
explaining what each subfolder is for and when to use `direct/` vs
`valuations/`.

Refuses to run if `input/` already exists, unless `--force` is passed —
useful to try the pipeline/dashboard end-to-end before plugging in your
own broker exports.

Also installs (and re-syncs on every run, regardless of `--force`) the
bundled Claude Code skills into `.claude/skills/` in the current working
directory — the folder you ran `finance-init` from. `allocation-update`
lets Claude research an asset's geo/sector/currency/asset-class
allocation and write it into `allocations/*.xlsx`; `monthly-update`
guides a full periodic refresh; and `fund-source-research` resolves the
largest unexplained fund exposures using deterministic sources or validated
dated snapshots.
See `.claude/skills/*/SKILL.md` once they're installed.
