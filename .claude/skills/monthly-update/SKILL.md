---
name: monthly-update
description: >-
  Interactive monthly finance data update — confirms the reference date,
  checks broker extraction files (CSV exports), collects new valuations for
  each valuation account, records movements in direct-entry accounts, updates
  the allocation workbook (dated to the last day of the target month), and
  researches any assets with missing tickers. It then runs the pipeline,
  checks generated errors, and proposes a correction plan before fixing data
  issues. Use when the user says "monthly update", "update the data", "mise
  à jour mensuelle", "update du mois", or anything referencing a periodic
  finance data refresh.
---

# Monthly Finance Update

This skill guides a complete periodic refresh of `data/input/`. It discovers
what is present in the data directory at runtime — never assume specific
broker names or file structures. Sections run in order; each waits for user
input before proceeding. Never invent or assume values.

Default operating mode: apply mechanical edits directly and show a clear
summary of changed files and rows for review. If the workspace is a git
repository, `git diff` may be used as an additional review aid, but git must
not be required: the workflow must also work for non-technical users and
folders where git is not installed. Ask for confirmation only when user data
is inconsistent, a value implies an unexpectedly large movement, a target-date
row already exists, file ordering/format could change pipeline behavior, an
external source choice is ambiguous, or a manual price source is weak/inferred.
Do not ask before appending rows that exactly match user-provided values,
copying the latest allocation workbook to `ALLOC_DATE`, or adding manual
prices from a broker export/source already provided by the user.

## Resolving the data directory

```bash
if [ -n "$FINANCE_DATA_DIR" ]; then echo "$FINANCE_DATA_DIR"
elif [ -d "./input" ]; then echo "."
else echo "./data"; fi
```

All paths below use `<data-dir>` as a placeholder for the resolved value.

---

## Step 1 — Confirm the reference date

Read today's date (available in the system context). Compute:
- **`PREV_MONTH_END`**: last day of the previous calendar month
- **`TODAY`**: today's date

If today is day 1–10 of the month, the user most likely wants to record
values as of the end of the previous month — propose that as the default.

Use **AskUserQuestion**:
- question: "Reference date for this update?"
- option 1 (when day ≤ 10): `{PREV_MONTH_END}  — end of previous month (recommended)`
- option 2: `{TODAY}  — today`
- option 3: `Other date`

Store the confirmed date as **`TARGET_DATE`** (YYYY-MM-DD). If the user picks
"Other date", ask them to type it before continuing.

Also compute **`ALLOC_DATE`** = last day of the calendar month containing
`TARGET_DATE`:

```bash
python3 -c "
from calendar import monthrange
from datetime import date
d = date.fromisoformat('TARGET_DATE')
print(date(d.year, d.month, monthrange(d.year, d.month)[1]))
"
```

---

## Step 2 — Discover the data layout

Scan the brokers directory to discover what is present:

```bash
# Extraction-type brokers: subdirectories that are not 'valuations' or 'direct'
find <data-dir>/input/brokers -mindepth 1 -maxdepth 3 -type d \
  | grep -vE '/(valuations|direct)$' \
  | grep -vE '/(valuations|direct)/' \
  | sort

# Valuation files
ls <data-dir>/input/brokers/valuations/*.csv 2>/dev/null

# Direct-entry files
ls <data-dir>/input/brokers/direct/*.csv 2>/dev/null
```

From these results build three lists:
- **`EXTRACTION_DIRS`**: folders containing export CSVs from a broker website
  (any path under `brokers/` that is neither `valuations/` nor `direct/`)
- **`VALUATION_FILES`**: every CSV in `brokers/valuations/`
- **`DIRECT_FILES`**: every CSV in `brokers/direct/`

**Detecting current accounts** (accounts where `invested` tracks `value`):
Read the header and last 5 rows of each valuation file and check whether
`value` and `invested` are always equal. If so, mark it as a current account
— `invested` will always be set equal to `value` without asking.

---

## Step 3 — Broker extraction files

For each folder in `EXTRACTION_DIRS`, look for a file that is **not** a
`*-historic.csv` (that naming convention marks the baseline file; the new
export has a fresh name):

```bash
ls -t {folder}/ | grep -v historic
```

Tell the user the status of each folder (new file already present ✅ or
missing ⚠️). Then ask:

> **Extractions expected** for the following broker accounts:
> {list each folder whose new export is missing}
> Please export the statement from the broker's website/app and place the
> file in the corresponding folder above.

Use **AskUserQuestion**:
- question: "Are all export files in place?"
- option 1: "Yes, all files are placed"
- option 2: "Skip — I'll handle exports later"

Re-run the `ls` checks after the user confirms and report which files are
now present. If a folder is still empty, warn but continue.

---

## Step 4 — Valuations

Read every file first, then collect all valuation updates in one paste.

### 4a — Read the last entries

```bash
for file in <data-dir>/input/brokers/valuations/*.csv; do
  head -1 "$file"
  tail -1 "$file"
done
```

For each file, show a one-line summary:
> **{name}** ({account}) — last value: **{value} {currency}** on {date},
> invested: {invested}, tax_rate: {tax_rate if column exists}

### 4b — Collect values in bulk

Ask the user to paste this template, prefilled with discovered accounts:

```text
MONTHLY UPDATE INPUT
target_date: {TARGET_DATE}

valuations:
  - account: {account}
    name: {name}
    value: {new value or unchanged}
    invested_delta: {net contribution/withdrawal or 0}
    tax_rate: unchanged
    action: append

direct_movements:
  - account: {account}
    name: {name}
    movements: none
```

Parsing rules:
- `value: unchanged` or `value: =` keeps the previous value.
- `invested_delta: 0`, `none`, or `no` keeps invested unchanged.
- For current accounts, ignore `invested_delta` and set `invested = value`.
- `action: skip` means do not append a row, even if the value is unchanged.
- Missing `tax_rate` means keep the previous value, including blank.
- If one row is ambiguous, ask only about that row.

### 4c — Detect target-date duplicates

Before appending a valuation row, check whether the file already contains
`TARGET_DATE`:

```bash
grep -n '^TARGET_DATE,' {file}
```

If a target-date row exists, ask whether to replace, append anyway, or skip.
Default to replace only when the existing row is clearly for the same
account/name.

### 4d — Append rows

Append each unambiguous row using the **Edit** tool. Always:
- Copy `account` and `name` verbatim from the last row of the file
- Leave `isin` and `ticker` columns empty (bare commas)
- Preserve the exact column order read from the file header
- Summarize rows added/skipped for the final recap

---

## Step 5 — Direct-entry accounts

Use the `direct_movements` block from the bulk paste. If it was omitted, read
each file and ask once for all direct-entry movements.

### 5a — Read header and last rows

```bash
head -1 {file}       # detect columns
tail -3 {file}       # show recent context to the user
```

Display the last few rows so the user has context.

### 5b — Interpret movements

Accepted values:
- `movements: none`, `no`, or `0` means no rows are added.
- Otherwise, the user must list each movement with date, operation type,
  quantity if any, unit price if any, and total amount.
- Common operation types: BUY / SELL / DIVIDEND / DEPOSIT / WITHDRAW /
  INTEREST.

### 5c — Build and append rows

For each movement the user provides, construct a CSV row using the exact
column order from the file header. Leave columns for which no value was
given as empty (bare commas). Append unambiguous rows directly; ask only about
missing or inconsistent movement details.

---

## Preflight new broker tickers

After extraction files are confirmed and before running the pipeline, scan new
broker exports for tickers/ISINs that are absent from allocation metadata or
manual prices:

```bash
python .claude/skills/allocation-update/scripts/read_allocation.py --list-all
find <data-dir>/input/asset_prices/others -maxdepth 1 -name '*.csv' -print
```

For Revolut-style exports, explicitly scan ticker-only buys:

```bash
rg -n 'BUY - MARKET|Ticker,Type,Quantity,Price per share,Total Amount,Currency' \
  <data-dir>/input/brokers
```

List new tickers/ISINs, tickers absent from `asset_prices/others`, and entries
not resolvable from allocation metadata. Decide immediately whether to map the
ticker in the allocation workbook, add a manual price from the broker export,
or leave full allocation research for later.

## Step 6 — Allocation file

### 6a — Check the existing allocation workbook

Find the most recent allocation xlsx:

```bash
ls -t <data-dir>/input/allocations/*.xlsx | head -1
```

Run the read script to list all assets and flag those missing a `ticker` or
`yahoo_symbol`:

```bash
python .claude/skills/allocation-update/scripts/read_allocation.py --list-all
```

Also check for any assets that appear in broker files but are absent from
the allocation workbook (new positions the pipeline can't yet price).

### 6b — Research missing tickers

If there are assets with missing tickers or new assets not yet in the workbook:

Tell the user which assets need research, then follow **Workflow A** and
**Workflow B** from the `allocation-update` skill for each one.

> Assets needing ticker/allocation research:
> {list with reason: missing ticker / missing ISIN / not in workbook}

The output allocation file must be dated **`ALLOC_DATE`** (computed in
Step 1 as the last day of `TARGET_DATE`'s month):

```bash
python .claude/skills/allocation-update/scripts/build_allocation_xlsx.py \
  --date {ALLOC_DATE}
```

If no assets are missing, confirm that the existing workbook is up to date
and, if the most recent file is not already dated `ALLOC_DATE`, copy it:

```bash
cp <data-dir>/input/allocations/{most_recent}.xlsx \
   <data-dir>/input/allocations/{ALLOC_DATE}.xlsx
```

Show the user what was done.

---

## Step 7 — Run the pipeline

Run the portfolio pipeline after all input files and the allocation workbook
are updated.

Prefer the repo `Makefile` when present:

```bash
make -C finance-portfolio-tracker pipeline
```

For non-interactive refreshes, use:

```bash
make -C finance-portfolio-tracker pipeline-auto
```

If there is no usable `Makefile`, run the pipeline entry point directly:

```bash
finance-portfolio-tracker/packages/pipeline/.venv/bin/python \
  finance-portfolio-tracker/packages/pipeline/src/ingest_portfolio.py \
  --data-dir <data-dir> \
  --update-current-month ask \
  --price-jump-policy ask
```

If the pipeline asks whether to refetch the current month:

- answer `y` when `TARGET_DATE` is in the current month and fresh prices are
  expected
- answer `n` when validating historical/manual changes only

Capture and report whether the pipeline completed successfully. If it fails,
stop and propose a debugging plan based on the traceback; do not continue to
the final summary as if the update succeeded.

---

## Step 8 — Check errors and propose a plan

Immediately after a successful pipeline run, inspect:

```bash
sed -n '1,200p' <data-dir>/output/errors.csv
```

If `errors.csv` has only the header row, say so clearly and continue to the
summary.

If errors or warnings are present:

1. Group them by `type`, then by `date`, `isin`/`ticker`, and `account`.
2. Identify likely root causes without inventing values:
   - `missing_price`: missing generated price row, wrong Yahoo symbol,
     stale/month file not refetched, or asset absent from allocation metadata.
   - `missing_currency`: generated price or allocation row has no usable
     currency; check `yahoo_symbol`, `currency`, and the source listing.
   - `missing_fx_rate`: currency is known but the FX rate was not fetched or
     is unsupported.
   - `unresolved_ticker`: asset needs a verified `yahoo_symbol`/ticker in the
     allocation workbook.
   - `parsing_error`: broker input format or CSV contents need inspection.
3. Check local files first: broker export ticker/ISIN/price/quantity/currency,
   previous generated prices, allocation workbook metadata, and
   `asset_prices/others`.
4. If local data is insufficient, check reliable public sources in this order:
   issuer site, JustETF profile and Bourse/Cotations tab, exchange listing
   pages (XETRA, gettex, Euronext, LSE, SIX), then broker export price when it
   is the only exact transaction-date source. Prefer a listing in the
   portfolio trade currency. If Yahoo fails for an ISIN, try the exchange
   ticker/RIC found via JustETF.
5. If a price is needed only for a currently held manual/broker-only ticker,
   add it to `data/input/asset_prices/others/*.csv` and record the source in
   `data/input/asset_prices/others/SOURCES.md`. Do not invent prices.
6. Present a concise plan to the user before editing:

```
Pipeline errors found: {N}

Proposed plan:
1. {asset/error}: verify {ticker/currency/price source}; expected edit: {file}
2. {asset/error}: ...

Need confirmation for:
- {any strategy choice, manual valuation, or ambiguous source}
```

Only apply fixes after the user confirms the plan, unless the fix is purely
mechanical and already proven by local data.

After any fixes, rerun Step 7, then repeat Step 8 until either:

- `errors.csv` has only the header row, or
- remaining items require user confirmation/manual source data.

---

## Step 8b — Fund look-through sources

The pipeline refreshes ETF/fund constituents using the per-portfolio registry
`<data-dir>/input/fund_sources.csv` (columns: `parent_isin, provider, adapter,
url, quality_tier, index_name, replication_method, proxy_name, proxy_isin`).
It is user data: never copy its rows into code, tests, docs or commits.

Find funds with no official source (tier C = Yahoo fallback, D = unavailable):

```bash
python3 -c "
import pandas as pd
s = pd.read_csv('<data-dir>/output/fund_holdings_status.csv').fillna('')
print(s[s.quality_tier.isin(['C','D'])][
  ['parent_isin','parent_name','quality_tier','market_value','issues']
].sort_values('market_value', ascending=False).to_string(index=False))
"
```

Also flag registry rows whose fund is no longer held (informational; leave
them unless the user asks to prune).

For each tier C/D fund, largest `market_value` first, research an official
source and propose a row:

1. Issuer site, by ISIN. Supported adapters:
   - `ishares_csv`: iShares product page "Download holdings" CSV URL
     (`.../products/<id>/fund/<ajax-id>.ajax?fileType=csv&fileName=<T>_holdings&dataType=fund`);
     copy the pattern from an existing iShares row.
   - `globalx_csv` / `globalx_hk_html`: Global X holdings CSV / HK page.
2. Physical fund with complete official holdings: `quality_tier=A`,
   `replication_method=physical`, `proxy_*` empty.
3. Synthetic/swap fund: only if a physical fund tracks **exactly the same
   index** — `quality_tier=B`, `replication_method=synthetic`, fill
   `index_name`, `proxy_name`, `proxy_isin`, and point `url` to the proxy's
   holdings. Never map to the swap collateral basket.
4. No supported provider or no exact proxy: leave the fund on Yahoo and say
   so; do not add a row. A new provider needs a new adapter (code change in
   `fund_holdings_sources.py`, generic and with no portfolio data).

Present the proposed rows (fund, source URL, tier, rationale) and ask for
confirmation when the source choice is ambiguous or a proxy is used. Append
confirmed rows to the CSV with the **Edit** tool, then re-run:

```bash
make -C finance-portfolio-tracker fund-holdings DATA_DIR=<data-dir>
```

(`--force` is implied for new rows since uncached funds are always fetched.)
Check that each new fund reaches tier A/B with `validation_status` ok and
weights ≈ 100%; otherwise fix or revert the row.

---

## Step 9 — Summary

Display a concise recap once all steps are complete:

```
✅ Update complete — reference date: {TARGET_DATE}

Broker extractions:
  {broker/account}: ✅ file present / ⚠️ skipped
  ...

Valuations:
  {name}: {old_value} → {new_value} {currency}
  ...

Direct accounts:
  {account/name}: {N rows added} / no changes
  ...

Allocation file:
  {ALLOC_DATE}.xlsx — {created from scratch / copied from previous / updated with N assets}
  Assets researched: {list or "none"}

Fund look-through sources:
  {N funds already covered / N rows added to fund_sources.csv / funds left on Yahoo: list}

Pipeline:
  {completed / failed}
  errors.csv: {clear / N warnings / N errors}
  Error plan: {not needed / completed / waiting for user confirmation}
```

Flag any skipped items or warnings so the user can follow up.
