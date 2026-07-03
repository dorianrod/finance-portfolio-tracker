---
name: allocation-update
description: >-
  This skill should be used when the user asks to research or update the
  allocation breakdown of a financial asset (ETF, fund, UCITS, money-market
  fund, stock, euro fund) across geography, sector, currency, or asset
  class — e.g. "update the allocation for Amundi MSCI World", "find the
  sector breakdown of this ETF", "research the currency exposure of BNP
  Paribas", "check the KIID/DICI allocation for this fund". It is also
  used to build or refresh the dated allocation workbook
  (data/input/allocations/YYYY-MM-DD.xlsx) from previously generated
  allocation sheets and report what changed — e.g. "build today's
  allocation file from the sheets", "commit today's allocation research
  to the spreadsheet", "update the allocations xlsx".
---

# Allocation Update

This skill covers two workflows that build on each other:

- **Workflow A — Research an asset's allocation**: read the current values
  from the reference workbook, cross-check at least two reliable sources,
  and write a markdown comparison report per asset.
- **Workflow B — Build/update the dated workbook**: take the markdown
  reports produced by Workflow A and write their "new values" into
  `data/input/allocations/{YYYY-MM-DD}.xlsx`, the single source of truth
  the pipeline reads, then report a synthesis of what changed.

Run Workflow A for one or more assets, then Workflow B once to commit that
day's research to the workbook. The two are independent — Workflow B can
also be re-run later for a past date's sheets.

The precise definition of the four allocation axes (geo, sector, currency,
asset class) lives in [`./references/axes.md`](./references/axes.md) —
read it before extracting or judging any values.

## Golden rules (apply to both workflows)

1. **Exploration/fetch goes through a sub-agent.** Any source discovery,
   URL collection, accessibility check, or initial extraction runs via an
   `Explore` sub-agent — this keeps the main thread focused on judgment
   and synthesis rather than raw browsing.
2. **Multi-asset requests get one exploration pass per asset.** Either
   spawn one `Explore` sub-agent per asset, or one run with clearly
   separated per-asset sections, then merge results into the final
   synthesis.
3. **Traceability.** The final deliverable must show which sources the
   sub-agent(s) surfaced and what was kept or rejected.

## Resolving the data directory

Both scripts below resolve the data directory the same way
`finance-pipeline` does: the `FINANCE_DATA_DIR` environment variable, else
`.` if `./input` already exists in the current directory, else `./data`.
Get the value Claude should use for `<data-dir>` once, up front:

```bash
if [ -n "$FINANCE_DATA_DIR" ]; then echo "$FINANCE_DATA_DIR"; elif [ -d "./input" ]; then echo "."; else echo "./data"; fi
```

All paths below are written as `<data-dir>/input/allocations/...` —
substitute the resolved value.

## Resolving the finance tool command

Prefer the standalone release executable when it is present in the working
folder. If Claude Code is running from the source repository, use the
repository `Makefile`.

```bash
if command -v finance-tool >/dev/null 2>&1; then echo "finance-tool"
elif [ -x "./finance-tool-linux" ]; then echo "./finance-tool-linux"
elif [ -x "./finance-tool-windows.exe" ]; then echo "./finance-tool-windows.exe"
elif [ -f "./Makefile" ]; then echo "make"
else echo ""; fi
```

Store the result as **`FINANCE_TOOL`**. If it is empty, ask the user where the
`finance-tool` executable is; do not assume a source checkout exists.

When `FINANCE_TOOL=make`, pass helper arguments through `ARGS`, for example:

```bash
make allocation-read ARGS='"EXACT ASSET NAME"'
make allocation-build ARGS="--date YYYY-MM-DD"
```

---

## Workflow A — Research an asset's allocation

### Step A0 — Compute the normalized name and the date

Get today's date:

```bash
date +%Y-%m-%d
```

Normalize the asset name for the filename (apply in this order):
1. Strip leading/trailing whitespace
2. Lowercase
3. Strip accents (NFD normalization)
4. Replace spaces, `&`, `/`, `.`, `(`, `)`, `+`, `,` with `-`
5. Collapse consecutive dashes
6. Strip leading/trailing dashes

Examples: `"Amundi MSCI World UCITS ETF"` → `amundi-msci-world-ucits-etf` |
`"S&P 500"` → `sp-500` | `"Fonds euros (Assureur X)"` → `fonds-euros-assureur-x`

**Output path**: `<data-dir>/input/allocations/{YYYY-MM-DD}/{normalized-name}.md`
Create the folder if it doesn't exist.

### Step A1 — Read the existing values from the workbook

From the release data folder:

```bash
{FINANCE_TOOL} allocation-read "EXACT ASSET NAME"
```

If `FINANCE_TOOL=make`, use:

```bash
make allocation-read ARGS='"EXACT ASSET NAME"'
```

By default the script picks the most recent
`<data-dir>/input/allocations/????-??-??.xlsx` file — the same file
`finance-pipeline` would use as of today. Pass `--file path/to/file.xlsx`
to target a specific snapshot, or `--data-dir path` to point at a
different data folder.

> Use the asset's real name as it appears (or is likely to appear) in the
> workbook. The script does fuzzy matching (case- and accent-insensitive).

**Read the returned JSON:**
- `found: true` → the asset is in the workbook; use
  `categories.{cat}.values` for the previous values
- `found: false` → the asset isn't in the workbook yet; use `—` for
  "Previous values" in the report
- `categories.{cat}.columns` → the **exact** column names to use as table
  headers — never hardcode column names
- Values are percentages (e.g. `50.0` means 50%)
- `references` → links already recorded for this asset in the workbook;
  these are the **priority sources** to check first in Step A2

### Step A2 — Research online (≥ 2 sources)

**Required**: launch an `Explore` sub-agent for the exploration/fetch
phase first.

For a single-asset request, ask the sub-agent to:
- identify priority sources (the workbook's `references` plus reliable
  external sources),
- qualify the accessibility of each URL,
- extract data for the four axes, or precisely state what's missing.

For a multi-asset request (different assets), run exploration **segmented
by asset** — at least one `Explore` run per asset, or a single run with
clearly separated per-asset sections.

**Start with the existing references**: if Step A1's JSON has a non-empty
`references` field, check those URLs **first** — they are sources already
validated for this asset. Include them in the "Sources" section of the
output file even if they turn out to be inaccessible.

**Suggested queries** (adapt to the asset type, in addition to the
existing references):
- `"{asset_name}" geographic sector allocation`
- `"{asset_name}" fact sheet portfolio allocation`
- `"{asset_name}" KIID DICI exposure`
- `"{asset_name}" site:justetf.com` (ETF)
- `"{asset_name}" site:morningstar.fr` (funds / stocks)
- `"{asset_name}" site:quantalys.com` (funds)
- `"{asset_name}" site:etf.com` (US ETF)

**Preferred sources by asset type:**

| Asset type | Recommended sources |
|---|---|
| ETF | JustETF.com, issuer site (Amundi, iShares, Vanguard, SPDR...), ETF.com |
| Fund / UCITS | Morningstar.fr, Quantalys.com, Fundinfo, asset manager's site |
| Euro fund | Insurer's annual management report, KIID |
| Stocks | Morningstar.fr, annual report, company IR site |
| Money market | KIID, asset manager's site |

**Stocks (companies) — specific guidance:**

- Explicitly look for sources giving the **revenue breakdown by
  geography** — this is essential to assess real geographic and currency
  exposure. Prioritize company-provided data (annual report, segment
  reporting notes) or recognized financial databases.
- Preferred sources for revenue by geography: annual/financial report
  (segmentation notes), investor presentations, 10-K/20-F filings (US
  companies), IR fact sheets, FactSet/Bloomberg/Refinitiv (if accessible),
  Morningstar (when available). Document the exact source and period
  covered.
- Do not infer geographic or currency exposure from headquarters location,
  listing country, or holding domicile alone. Favor **revenue breakdown**
  to estimate economic and currency exposure.
- If revenue by geography is unavailable, clearly state the proxy used
  (analyst estimates, product/segment split, aggregated holdings data) and
  quantify the uncertainty (use `NC` if the estimate is too uncertain).
- Use revenue geography to map country → currency (e.g. revenue in China
  → CNY), then aggregate to get economic currency exposure; document every
  conversion assumption and the impact of company-level FX hedging.

**If a page is inaccessible (login wall, bot detection, 403):**
- Open it with Playwright and ask the user to navigate it themselves, or
- Ask the user to paste the relevant content directly into the chat

**Document each URL's status**: ✅ accessible | ⚠️ partial | ❌ inaccessible

Example sub-agent prompt (exploration/fetch):

```text
Explore this asset for an allocation update (4 axes: geo, sector,
currency, asset class). Prioritize the workbook's reference URLs first,
then find at least 2 reliable, recent sources.
Return:
- list of URLs with status (accessible/partial/inaccessible),
- extracted data per axis (with date/scope),
- inconsistencies between sources,
- limitations and NC zones.
```

### Step A3 — Extract and harmonize the values

For each accessible source, extract the four axes per the rules in
[`./references/axes.md`](./references/axes.md). Read that file now if not
already loaded — it covers double-counting rules, the hedged/HKD currency
treatment, and the 100%-sum constraints, which are easy to get wrong.

Key points to keep in mind while extracting:
- Whole-percentage values: `50` (not `0.5`, not `50%`)
- Geo + Sector scope is **equities + bonds only** — the sum can be < 100
  if the asset holds cash, money-market instruments, etc.
- Currency scope is **all assets** — sum = 100% (or NC if unknown)
- Asset class sum **must be 100%**
- No double-counting of geography: France is not part of Europe; Japan and
  China are not part of Asia
- Reflect real economic exposure, not the registered office location

If a value is missing from every source, state an explicit assumption.

### Step A4 — Write the markdown report

Create `<data-dir>/input/allocations/{YYYY-MM-DD}/{normalized-name}.md`
with **exactly** this structure — Workflow B's build script parses it
verbatim, so the headings, table shape, and row labels below must match
character for character:

```markdown
Asset name: {Real asset name}

# Sources

- [URL1](URL1) — accessible
- [URL2](URL2) — unavailable (login required)

# Assumptions made

- (empty if none)

# Source comparison

(Summarize agreements and discrepancies between sources. Explicitly flag
any gap > 1% on the same figure.)

# Critical review

- Methodological consistency: (OK / not OK + justification)
- Currency-axis rules respected (including hedged cases): (OK / not OK + justification)
- Geo anti-double-counting rules respected: (OK / not OK + justification)
- Expected sums (`currency` and `classe`): (OK / not OK + justification)
- Remaining concerns / source limitations:

# Exposures

## Geographic

*% of total — scope: equities + bonds only (sum may be < 100)*

| | Col1 | Col2 | Col3 | ... |
|---|---|---|---|---|
| **New values** | X | X | X | ... |
| **Previous values (Excel)** | X | X | X | ... |
| **Significant change (>1%)** | | x | | ... |

## Sector

*% of total — scope: equities + bonds only (sum may be < 100)*

| | Col1 | Col2 | Col3 | ... |
|---|---|---|---|---|
| **New values** | X | X | X | ... |
| **Previous values (Excel)** | X | X | X | ... |
| **Significant change (>1%)** | | x | | ... |

## Currency

*% of total — scope: all assets (sum = 100% or NC)*

| | Col1 | Col2 | Col3 | Col4 |
|---|---|---|---|---|
| **New values** | X | X | X | X |
| **Previous values (Excel)** | X | X | X | X |
| **Significant change (>1%)** | | x | | |

## Asset class

*% of total — sum = 100%*

| | Col1 | Col2 | Col3 | ... |
|---|---|---|---|---|
| **New values** | X | X | X | ... |
| **Previous values (Excel)** | X | X | X | ... |
| **Significant change (>1%)** | | x | | ... |
```

**Filling the tables:**
- `Col1`, `Col2`... → replace with the **exact column names** from the
  Step A1 JSON (`columns` field) — never invent or translate them, they
  must match the workbook's headers verbatim (the workbook's own headers
  are in French; keep them as-is)
- "New values" → values from the online research (averaged if 2 sources
  agree, otherwise the more reliable value)
- "Previous values (Excel)" → values from the Step A1 JSON; `—` if
  `found: false`
- "Significant change (>1%)" → `x` if `|new − previous| > 1`, blank
  otherwise; blank if previous = `—`
- Unknown value → write `NC` in that cell (Workflow B leaves matching
  workbook cells untouched rather than guessing)
- Genuine zero → write `0`

### Step A5 — Challenge the result with a sub-agent

Before finalizing, launch a sub-agent to audit the result and fill in
**Critical review**.

Recommended sub-agent: `Explore`

Audit goals:
- Check assumptions are consistent with the listed sources
- Check compliance with [`./references/axes.md`](./references/axes.md)
- Check the hedged-currency logic (majority hedging correctly reflected)
- Check the HKD→USD consolidation rule when HKD exposure is material (and
  that the assumption is documented)
- Check the sum constraints (`currency` and `classe`)
- Flag domicile-vs-economic-exposure bias risk

Example sub-agent request:

```text
Audit this allocation file and provide 5 bullets ready to paste into
"Critical review":
1) methodological consistency,
2) currency rules respected (including hedged),
3) geo anti-double-counting respected,
4) sum checks,
5) remaining limitations/uncertainty and impact.
```

Fold the sub-agent's findings into the **Critical review** section of the
final markdown.

For multi-asset requests, repeat this challenge step per asset (or provide
a distinct challenge section per asset).

### Workflow A validation checklist

- [ ] The normalized name follows the convention (lowercase, no accents, dashes)
- [ ] Table headers use the exact JSON column names (not hardcoded values)
- [ ] "Previous values" come from the JSON (not invented)
- [ ] "Significant change" is computed correctly (`|new − previous| > 1%`)
- [ ] Every assumption is documented in "Assumptions made"
- [ ] Source discrepancies are flagged in "Source comparison"
- [ ] References from the JSON's `references` field are included in Sources, even if inaccessible
- [ ] "Critical review" is filled in after the sub-agent challenge
- [ ] Hedged cases: net post-hedge currency exposure is explained and consistent
- [ ] Strong HKD exposure: the HKD→USD consolidation is applied and explained

---

## Workflow B — Build/update the dated workbook

Use this workflow once one or more Workflow A reports exist for a given
date, to actually commit their "new values" into the xlsx the pipeline
reads. Nothing in `data/input/allocations/*.xlsx` changes until this step
runs — Workflow A only writes markdown reports.

### Step B1 — Run the build script

```bash
{FINANCE_TOOL} allocation-build --date YYYY-MM-DD
```

If `FINANCE_TOOL=make`, use:

```bash
make allocation-build ARGS="--date YYYY-MM-DD"
```

Defaults: `--date` is today, `--sheets-dir` is
`<data-dir>/input/allocations/{date}/` (Workflow A's output folder for
that date), `--data-dir` auto-resolves as described above. Pass
`--sheet path/to/one-report.md` to commit a single report instead of every
`*.md` file in the sheets folder. Pass `--dry-run` to preview the changes
without writing anything.

The script:
1. Picks the base workbook — the dated file itself if it already exists
   (so re-running the same day is safe and idempotent), otherwise the most
   recent existing `*.xlsx` dated on or before the target date (carrying
   its values forward).
2. Copies that base to `<data-dir>/input/allocations/{date}.xlsx` if it's
   a new file, or backs up the existing target to `{date}.xlsx.bak` before
   editing it in place.
3. For each markdown report, matches the asset by name (same fuzzy
   matching as `read_allocation.py`) against the workbook's rows. Writes
   the "New values" row's figures into the matching columns for that
   asset. Appends a new row at the bottom of the data block for assets not
   already in the workbook.
4. Merges the report's "Sources" URLs into that row's `reference` column
   (deduplicated), so the next Workflow A run for this asset finds them in
   Step A1.
5. Leaves any cell whose markdown value is `NC`, blank, or unparseable
   untouched, and lists it as a skipped cell in the synthesis instead of
   guessing.
6. Prints a JSON synthesis to stdout: which assets were updated vs.
   created, the before/after value for every changed cell, skipped cells,
   and warnings (e.g. a newly created asset has no ISIN/`yahoo_symbol`/
   `currency`/`ticker` set, so `finance-pipeline` can't price it yet).

### Step B2 — Present the synthesis to the user

Read the script's JSON output and turn it into a short, readable summary
in the chat — this is the deliverable the user asked for, not a file to
generate separately. Cover, per asset: created vs. updated, the
significant value changes (mirroring the `>1%` flags from Workflow A's
reports), and any warnings (skipped `NC` cells, missing ISIN on new
assets). If `--dry-run` was used, say so plainly and offer to re-run
without it once the user confirms.

If the script's `errors` array is non-empty (e.g. a report's asset name
or table structure couldn't be parsed), surface those before declaring
success — don't silently skip a report.

### Workflow B validation checklist

- [ ] The target file is `<data-dir>/input/allocations/{date}.xlsx` (not `.xls`)
- [ ] An existing target was backed up to `{date}.xlsx.bak` before editing
- [ ] Every "New values" figure from the processed reports landed in the
      right column (spot-check the synthesis against the source report)
- [ ] Skipped/`NC` cells and parsing errors are called out to the user
- [ ] New assets' missing ISIN/currency/ticker are flagged so the user can
      fill them in before the next `finance-pipeline` run
