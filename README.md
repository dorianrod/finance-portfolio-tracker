# Finance

When your investments are spread across several brokers, no single one of them can tell you what you actually own. Finance Portfolio Tracker pulls everything together into one place and gives you a 360° view of your allocations — by sector, geography, currency, asset class — so you can spot concentration risk and rebalance with the full picture, instead of piecing it together broker by broker.

Everything runs locally, on your own machine: there's no account to create and no third-party platform to hand your brokerage data to.

[**Live demo**](https://dorianrod.github.io/finance-portfolio-tracker/) (synthetic example portfolio)

## Installation

No coding experience needed — just download one file. It takes about a minute, and you only need to do it once.

Pick (or create) a folder to hold your financial data, e.g. `my-finance`, then go to the [latest release](https://github.com/dorianrod/finance-portfolio-tracker/releases/latest) and download the file for your system into that folder.

### Windows

1. Download `finance-tool-windows.exe`.
2. Open PowerShell in that folder and bootstrap it:

   ```powershell
   .\finance-tool-windows.exe init
   ```

### Ubuntu / Linux

1. Download `finance-tool-linux`.
2. Open a terminal in that folder and bootstrap it:

   ```bash
   chmod +x finance-tool-linux
   ./finance-tool-linux init
   ```

`init` bootstraps the expected `input/` layout (account_groups.csv + broker exports under `brokers/`) with a small example portfolio. Replace those example files with your own broker exports — see [packages/pipeline/README.md](packages/pipeline/README.md) for the exact format.

## Use

Once `data/input/` contains your own exports, re-run these two commands from inside your folder whenever you want an up-to-date view (e.g. every month, after adding a new broker export):

**Windows** — open PowerShell:

```powershell
.\finance-tool-windows.exe pipeline      # fetches prices, writes output/
.\finance-tool-windows.exe dashboard     # serves the dashboard, opens your browser
```

**Ubuntu / Linux** — open a terminal:

```bash
./finance-tool-linux pipeline      # fetches prices, writes output/
./finance-tool-linux dashboard     # serves the dashboard, opens your browser
```

The allocation breakdowns (sector, geography, currency, asset class) for each ETF/fund can be edited by hand in the allocation files, or kept up to date automatically: opening your data folder in Claude Code and using the `allocation-update` skill researches and fills in the allocation for you.

## Technical details

- The standalone executables (`finance-tool-*`) bundle Python, Node-built dashboard assets and every dependency — nothing else needs to be installed. They're built by [.github/workflows/release.yml](.github/workflows/release.yml) (PyInstaller, via [packages/launcher/cli.py](packages/launcher/cli.py)) and published to GitHub Releases whenever a `vX.Y.Z` tag is pushed.
- Optional flags, defaults shown:

  ```bash
  finance-tool init      [--data-dir .]
  finance-tool pipeline  [--data-dir .]
  finance-tool dashboard [--data-dir . --port 8787]
  ```

- `finance-tool init` also (re-)installs the `allocation-update` Claude Code skill into `.claude/skills/` in the current directory every time it runs, so opening this folder in Claude Code lets you ask it to research and update an asset's allocation breakdown for you.
- Building from source (contributing to the codebase rather than just using it) is covered in [packages/pipeline/README.md](packages/pipeline/README.md) and [packages/dashboard/README.md](packages/dashboard/README.md).
