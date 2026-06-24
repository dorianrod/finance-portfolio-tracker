# Finance

When your investments are spread across several brokers, no single one of them can tell you what you actually own. Finance Portfolio Tracker pulls everything together into one place and gives you a 360° view of your allocations — by sector, geography, currency, asset class — so you can spot concentration risk and rebalance with the full picture, instead of piecing it together broker by broker.

Everything runs locally, on your own machine: there's no account to create and no third-party platform to hand your brokerage data to.

[**Live demo**](https://dorianrod.github.io/finance-portfolio-tracker/) (synthetic example portfolio)

## Installation

No coding experience needed — just follow the steps for your system. It takes about 5 minutes, and you only need to do it once.

Pick (or create) a folder to hold your financial data, e.g. `my-finance`.

### Windows

1. Install Python (≥ 3.12) from [python.org](https://www.python.org/downloads/) — tick **"Add python.exe to PATH"** during setup.
2. Install [Node.js](https://nodejs.org/) (needed once, to build the dashboard).
3. Open PowerShell and run:

   ```powershell
   py -m pip install --user pipx
   py -m pipx ensurepath
   ```

4. Restart PowerShell, then run:

   ```powershell
   pipx install "git+https://github.com/dorianrod/finance-portfolio-tracker.git#subdirectory=packages/pipeline"
   pipx install "git+https://github.com/dorianrod/finance-portfolio-tracker.git#subdirectory=packages/dashboard"
   ```

5. Bootstrap your folder:

   ```powershell
   finance-init
   ```

### Ubuntu / Linux

1. Install Python, pipx and Node.js, then run:

   ```bash
   sudo apt update && sudo apt install python3 pipx nodejs npm
   pipx ensurepath
   ```

2. Restart your terminal, then run:

   ```bash
   pipx install "git+https://github.com/dorianrod/finance-portfolio-tracker.git#subdirectory=packages/pipeline"
   pipx install "git+https://github.com/dorianrod/finance-portfolio-tracker.git#subdirectory=packages/dashboard"
   ```

3. Bootstrap your folder:

   ```bash
   finance-init
   ```

`finance-init` bootstraps the expected `input/` layout (account_groups.csv + broker exports under `brokers/`) with a small example portfolio. Replace those example files with your own broker exports — see [packages/pipeline/README.md](packages/pipeline/README.md) for the exact format.

## Use

Once `data/input/` contains your own exports, re-run these two commands from inside your folder whenever you want an up-to-date view (e.g. every month, after adding a new broker export):

**Windows** — open PowerShell:

```powershell
finance-pipeline      # fetches prices, writes output/
finance-dashboard     # serves the dashboard, opens your browser
```

**Ubuntu / Linux** — open a terminal:

```bash
finance-pipeline      # fetches prices, writes output/
finance-dashboard     # serves the dashboard, opens your browser
```

The allocation breakdowns (sector, geography, currency, asset class) for each ETF/fund can be edited by hand in the allocation files, or kept up to date automatically: opening your data folder in Claude Code and using the `allocation-update` skill researches and fills in the allocation for you.

## Technical details

- Requires Python ≥ 3.12. If your default `python3`/`py` resolves to an older version, point pipx at the right interpreter: `pipx install --python /path/to/python3.12 ...`.
- Installing the dashboard also requires Node.js/npm to be on `PATH`: a hatchling build hook runs `npm ci && npm run build` automatically to compile its frontend before packaging — see [packages/dashboard/hatch_build.py](packages/dashboard/hatch_build.py).
- Optional flags, defaults shown:

  ```bash
  finance-init      [--data-dir .]
  finance-pipeline  [--data-dir .]
  finance-dashboard [--data-dir . --port 8787]
  ```

- `finance-init` also (re-)installs the `allocation-update` Claude Code skill into `.claude/skills/` in the current directory every time it runs, so opening this folder in Claude Code lets you ask it to research and update an asset's allocation breakdown for you.
