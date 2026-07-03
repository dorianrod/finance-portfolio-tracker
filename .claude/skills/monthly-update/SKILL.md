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

Process each file in `VALUATION_FILES` one at a time.

### 4a — Read the last entry

```bash
head -1 {file}        # header → detect columns
tail -1 {file}        # last row → previous values
```

Show a one-line summary:
> **{name}** ({account}) — last value: **{value} {currency}** on {date},
> invested: {invested}, tax_rate: {tax_rate if column exists}

### 4b — Collect the new value

Ask in chat (free-form text, **not** AskUserQuestion — the user types a number):

> Value of **{name}** ({account}) as of {TARGET_DATE}?
> _(type the amount, or `=` to keep {value} unchanged)_

If the user replies `=` or "unchanged", keep the previous value.

### 4c — Collect investment delta

**Skip for current accounts** (detected in Step 2): for those, always set
`invested = new_value`.

For all others, ask in chat:

> Any contributions/withdrawals on **{name}** since {last_date}?
> _(net amount — positive for deposits, negative for withdrawals — or `no`)_

If yes: `new_invested = previous_invested + delta`.
If no: `new_invested = previous_invested`.

### 4d — Confirm tax_rate

Only for files whose header contains a `tax_rate` column. Use **AskUserQuestion**:
- question: "Tax rate for {name}?"
- option 1: `{previous_tax_rate} — unchanged (recommended)`
- option 2: `Change`

If "Change", ask the user to type the new rate (e.g. `30%` or `17.2%`).

If the column exists but was blank in the last row, keep it blank unless the
user provides a value.

### 4e — Confirm and append

Show the full CSV row before writing:

> New row for **{name}**:
> `{TARGET_DATE},{account},,,{name},{new_value},{new_invested},{currency},{tax_rate}`
> (omit tax_rate if the file has no tax_rate column)

Use **AskUserQuestion**:
- option 1: "Confirm"
- option 2: "Edit" → ask what to change, then re-show
- option 3: "Skip this account"

Append the confirmed row using the **Edit** tool. Always:
- Copy `account` and `name` verbatim from the last row of the file
- Leave `isin` and `ticker` columns empty (bare commas)
- Preserve the exact column order read from the file header

---

## Step 5 — Direct-entry accounts

For each file in `DIRECT_FILES`:

### 5a — Read header and last rows

```bash
head -1 {file}       # detect columns
tail -3 {file}       # show recent context to the user
```

Display the last few rows so the user has context.

### 5b — Ask for movements

Ask in chat:

> Any movements on **{name from last row}** ({account from last row})
> since {last_date in the file}?
> _(If yes, list each movement: date, operation type, quantity if any,
> unit price if any, total amount. Common types: BUY / SELL / DIVIDEND /
> DEPOSIT / WITHDRAW / INTEREST)_

### 5c — Build and confirm rows

For each movement the user provides, construct a CSV row using the exact
column order from the file header. Leave columns for which no value was
given as empty (bare commas). Show the row and confirm with **AskUserQuestion**
(Confirm / Edit / Skip) before appending.

---

## Step 6 — Allocation file

### 6a — Check the existing allocation workbook

Find the most recent allocation xlsx:

```bash
ls -t <data-dir>/input/allocations/*.xlsx | head -1
```

Run the read script to list all assets and flag those missing a `ticker` or
`yahoo_symbol`:

```bash
python .claude/skills/allocation-update/scripts/read_allocation.py --list-all 2>/dev/null \
  || python .claude/skills/allocation-update/scripts/read_allocation.py "" 2>&1 | head -60
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

If there is no usable `Makefile`, run the pipeline entry point directly:

```bash
finance-portfolio-tracker/packages/pipeline/.venv/bin/python \
  finance-portfolio-tracker/packages/pipeline/src/ingest_portfolio.py \
  --data-dir <data-dir>
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
3. Check local files first: generated price CSVs, allocation workbook metadata,
   broker operations, and any existing research notes.
4. Use online sources only when needed to verify ticker/ISIN/listing/currency;
   cite the source in the work log or the chat summary.
5. Present a concise plan to the user before editing:

```
Pipeline errors found: {N}

Proposed plan:
1. {asset/error}: verify {ticker/currency/price source}; expected edit: {file}
2. {asset/error}: ...

Need confirmation for:
- {any strategy choice, manual valuation, or ambiguous source}
```

Only apply fixes after the user confirms the plan, unless the fix is purely
mechanical and already proven by local data (for example, a generated row has
an empty currency while the allocation row explicitly says `EUR`).

After any fixes, rerun Step 7, then repeat Step 8 until either:

- `errors.csv` has only the header row, or
- remaining items require user confirmation/manual source data.

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

Pipeline:
  {completed / failed}
  errors.csv: {clear / N warnings / N errors}
  Error plan: {not needed / completed / waiting for user confirmation}
```

Flag any skipped items or warnings so the user can follow up.
