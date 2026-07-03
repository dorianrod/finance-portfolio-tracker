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
    brokers/
      direct/         -- pre-formatted CSVs (cash accounts, stocks/ETFs...)
      valuations/      -- periodic value/invested snapshots (PE, insurance...)
      boursorama/      -- raw Boursorama PEA/CTO exports
      revolut/         -- raw Revolut statement export
    asset_prices/
    allocations/       -- optional *.xlsx for geo/secteur/currency/classe breakdowns
  output/        (generated)
```

## finance-init

```bash
finance-init [--data-dir DATA_DIR] [--force]
```

Scaffolds `<data-dir>/input/` with an example portfolio covering every
supported broker format and account type — Boursorama (PEA + CTO),
Revolut, `direct/` (flat file + a nested subfolder example), `valuations/`
(two files), and an `allocations/*.xlsx` with a geo/secteur/currency/classe
breakdown. Five real, Yahoo-Finance-tracked assets (AAPL, MSFT, LVMH, an
Amundi CAC 40 ETF, an iShares S&P 500 ETF). Also writes
`input/README.md` explaining what each subfolder is for and when to use
`direct/` vs `valuations/`.

Refuses to run if `input/` already exists, unless `--force` is passed —
useful to try the pipeline/dashboard end-to-end before plugging in your
own broker exports.

Also installs (and re-syncs on every run, regardless of `--force`) the
bundled Claude Code skills into `.claude/skills/` in the current working
directory — the folder you ran `finance-init` from. `allocation-update`
lets Claude research an asset's geo/sector/currency/asset-class
allocation and write it into `allocations/*.xlsx`; `monthly-update`
guides a full periodic refresh and checks pipeline errors after the run.
See `.claude/skills/*/SKILL.md` once they're installed.
