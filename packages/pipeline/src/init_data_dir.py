"""Scaffold a data/ folder with a richer example portfolio.

Usage:
    finance-init [--data-dir DATA_DIR] [--force]

Creates <data-dir>/input/ with an example covering every supported broker
format, several accounts, and a geo/secteur/currency/classe allocation
file — see the generated input/README.md for what each one is for. Run
finance-pipeline afterwards: it fetches real historical prices for every
Yahoo-Finance-tracked asset below and generates the dashboard CSVs under
<data-dir>/output/.

The data directory is resolved the same way as finance-pipeline: the
--data-dir flag, the FINANCE_DATA_DIR environment variable, or a data/
folder in the current working directory.

Also installs the allocation-update Claude Code skill into
.claude/skills/allocation-update/ in the current working directory (the
folder you're running this command from), so it's available next time you
work on that folder with Claude Code. This always re-syncs to the version
bundled with the installed finance-pipeline, regardless of --force.
"""

import argparse
import shutil
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from src.data_dir import resolve_data_dir  # noqa: E402

_BUNDLED_SKILL_DIR = Path(__file__).parent / "skills" / "allocation-update"

# ---------------------------------------------------------------------------
# account_groups.csv
# ---------------------------------------------------------------------------
#
# "category" is a fixed, code-controlled vocabulary (brokerage / checking /
# employer_savings / retirement / savings / private_equity) used to drive
# pipeline/dashboard behaviour (e.g. which accounts get synthetic cash
# positions). "type"/"label" are free text, only used for display.

_ACCOUNT_GROUPS = """account,type,category,label
checking_account,Checking account,checking,Checking account
brokerage,Brokerage,brokerage,Personal brokerage
boursorama_pea,Brokerage,brokerage,Boursorama PEA
boursorama_cto,Brokerage,brokerage,Boursorama CTO
revolut,Brokerage,brokerage,Revolut Trading
per_fortuneo,Retirement,retirement,Fortuneo PER
life_insurance,Life insurance,savings,Life insurance
"""

# ---------------------------------------------------------------------------
# brokers/direct/ -- full transaction history, one row per operation
# ---------------------------------------------------------------------------

_DIRECT_CHECKING_ACCOUNT = """date,account,isin,ticker,name,operation_type,quantity,price_per_unit,total_amount,currency
2024-06-30,checking_account,,,Checking account,DEPOSIT,,,5000,EUR
2025-06-30,checking_account,,,Checking account,DEPOSIT,,,2000,EUR
2025-12-31,checking_account,,,Checking account,INTEREST,,,45.5,EUR
2026-03-31,checking_account,,,Checking account,WITHDRAWAL,,,-800,EUR
"""

# Nested under brokers/direct/brokerage/ on purpose: direct/ (like
# valuations/) is scanned recursively, so you can group files by
# account/source in subfolders instead of dumping everything flat.
_DIRECT_BROKERAGE_HISTORY = """date,account,isin,ticker,name,operation_type,quantity,price_per_unit,total_amount,currency
2024-09-30,brokerage,US0378331005,AAPL,Apple Inc.,BUY,10,220,2200,USD
2024-12-31,brokerage,FR0000121014,MC.PA,LVMH,BUY,3,650,1950,EUR
2025-06-30,brokerage,US0378331005,AAPL,Apple Inc.,BUY,5,200,1000,USD
2025-09-30,brokerage,FR0000121014,MC.PA,LVMH,SELL,1,600,600,EUR
2025-12-31,brokerage,US0378331005,AAPL,Apple Inc.,DIVIDEND,,,12,USD
2026-03-31,brokerage,FR0000121014,MC.PA,LVMH,DIVIDEND,,,20,EUR
"""

# ---------------------------------------------------------------------------
# brokers/boursorama/{PEA,CTO}/operations.csv -- consolidated export format
#
# NOTE: column names and operation labels below (date_operation, nom_valeur,
# libelle, VIR/ACHAT/VENTE/COUPONS, ...) are Boursorama's real export
# vocabulary, matched verbatim by
# src/infrastructure/parsers/boursorama.py -- intentionally left in French,
# translating them would break parsing of real Boursorama exports.
# ---------------------------------------------------------------------------

_BOURSORAMA_PEA = """date_operation,date_valeur,nom_valeur,libelle,isin,quantite,cours,montant
15/01/2024,15/01/2024,,VIR Virement interne,,,,8000
01/03/2024,01/03/2024,Amundi CAC 40 UCITS ETF Acc,ACHAT COMPTANT 100 AMUNDI CAC40 U.ACC,FR0013380607,100,37.4,-3740.0
01/09/2024,01/09/2024,,VIR Virement interne,,,,2000
15/01/2026,15/01/2026,Amundi CAC 40 UCITS ETF Acc,COUPONS ECHEANCE 100 AMUNDI CAC40 U.ACC,FR0013380607,100,,42.5
"""

_BOURSORAMA_CTO = """date_operation,date_valeur,nom_valeur,libelle,isin,quantite,cours,montant
10/02/2024,10/02/2024,,VIR Virement interne,,,,12000
20/03/2024,20/03/2024,iShares Core S&P 500 UCITS ETF USD,ACHAT ETRANGER 60 ISHSCOR.SP500USD,IE0031442068,60,38.0,-2280.0
05/10/2024,05/10/2024,,VIR Virement interne,,,,3000
04/01/2026,04/01/2026,iShares Core S&P 500 UCITS ETF USD,COUPONS ECHEANCE 60 ISHSCOR.SP500USD,IE0031442068,60,,18.3
"""

# ---------------------------------------------------------------------------
# brokers/revolut/ -- raw trading-account-statement export
# ---------------------------------------------------------------------------

_REVOLUT_STATEMENT = """Date,Ticker,Type,Quantity,Price per share,Total Amount,Currency,FX Rate
2024-02-01T09:00:00.000Z,,CASH TOP-UP,,,EUR 3000,EUR,1.0000
2024-03-15T10:30:00.000Z,MSFT,BUY - MARKET,8,USD 410,USD 3280,USD,0.92
2025-06-15T10:30:00.000Z,MSFT,DIVIDEND,,,USD 24,USD,0.92
"""

# ---------------------------------------------------------------------------
# brokers/valuations/ -- periodic value+invested snapshots, NOT transaction
# detail (see input/README.md). Two files, to show several sources is fine.
# ---------------------------------------------------------------------------

_VALUATIONS_PER_FORTUNEO = """date,account,isin,ticker,name,value,invested,currency,tax_rate
2024-03-31,per_fortuneo,,,PER Fortuneo,5000,5000,EUR,30%
2025-03-31,per_fortuneo,,,PER Fortuneo,8200,7500,EUR,30%
2026-03-31,per_fortuneo,,,PER Fortuneo,9100,8000,EUR,30%
"""

_VALUATIONS_LIFE_INSURANCE = """date,account,isin,ticker,name,value,invested,currency,tax_rate
2024-06-30,life_insurance,,,Life insurance,10000,10000,EUR,17.2%
2025-06-30,life_insurance,,,Life insurance,11400,10500,EUR,17.2%
2026-06-30,life_insurance,,,Life insurance,12100,11000,EUR,17.2%
"""

# ---------------------------------------------------------------------------
# allocations/*.xlsx -- geo/sector/currency/class breakdown + optional
# Yahoo symbol overrides, one row per asset (matched by ISIN, else by name).
#
# NOTE: "autre"/"nc" (and "Autre" for currency) are NOT translated below --
# src/infrastructure/xlsx_allocation_repository.py looks for those exact
# French labels to recognise the "leftover" and "no data" buckets. This is
# a fixed contract of the real xlsx format, shared with the user's own
# allocation files, so it's out of scope here too.
# ---------------------------------------------------------------------------

_GEO_COLS = [
    "europe",
    "north_america",
    "south_america",
    "asia",
    "africa",
    "oceania",
    "emerging_markets",
    "international",
    "autre",
    "nc",
]
_SECTEUR_COLS = [
    "technology",
    "healthcare",
    "financials",
    "consumer_discretionary",
    "energy",
    "industrials",
    "materials",
    "telecom",
    "public_utilities",
    "real_estate",
    "consumer_staples",
    "utilities",
    "autre",
    "nc",
]
_CURRENCY_COLS = ["EUR", "USD", "Autre", "nc"]
_CLASSE_COLS = [
    "equities",
    "bonds",
    "real_estate",
    "cash",
    "commodities",
    "private_equity",
    "crypto",
    "autre",
    "nc",
]
_META_COLS = ["yahoo_symbol", "currency", "ticker"]

# Real, Yahoo-Finance-tracked assets used across the brokers/ examples
# above. yahoo_symbol/currency here are exactly the kind of override you'd
# add for any asset whose ISIN/ticker doesn't resolve directly on Yahoo
# (IE0031442068 is the example: it needs IUSA.DE, its Xetra listing).
_ASSETS = [
    {
        "nom_placement": "Apple Inc.",
        "id": "US0378331005",
        "geo": {"north_america": 100},
        "secteur": {"technology": 100},
        "currency_alloc": {"USD": 100},
        "classe": {"equities": 100},
        "yahoo_symbol": "AAPL",
        "currency": "USD",
    },
    {
        "nom_placement": "LVMH",
        "id": "FR0000121014",
        "geo": {"europe": 100},
        "secteur": {"consumer_discretionary": 100},
        "currency_alloc": {"EUR": 100},
        "classe": {"equities": 100},
        "yahoo_symbol": "MC.PA",
        "currency": "EUR",
    },
    {
        "nom_placement": "Microsoft Corporation",
        "id": "US5949181045",
        "geo": {"north_america": 100},
        "secteur": {"technology": 100},
        "currency_alloc": {"USD": 100},
        "classe": {"equities": 100},
        "yahoo_symbol": "MSFT",
        "currency": "USD",
        # Revolut operations only carry a ticker (no ISIN column in that
        # export format) — this alias is what lets the pipeline match
        # "MSFT" back to this row for both price-fetching and ISIN backfill.
        "ticker": "MSFT",
    },
    {
        "nom_placement": "Amundi CAC 40 UCITS ETF Acc",
        "id": "FR0013380607",
        "geo": {"europe": 100},
        # Index ETF: no single sector — left at 0, auto-filled as "nc".
        "secteur": {},
        "currency_alloc": {"EUR": 100},
        "classe": {"equities": 100},
        "yahoo_symbol": "FR0013380607",  # resolves directly, no override
        "currency": "EUR",
    },
    {
        "nom_placement": "iShares Core S&P 500 UCITS ETF USD",
        "id": "IE0031442068",
        "geo": {"north_america": 100},
        "secteur": {},
        "currency_alloc": {"USD": 100},
        "classe": {"equities": 100},
        "yahoo_symbol": "IUSA.DE",  # ISIN alone doesn't resolve on Yahoo
        "currency": "EUR",  # IUSA.DE itself trades in EUR on Xetra
    },
]


def _allocation_header_row() -> list[str]:
    return (
        ["nom_placement", "id"]
        + _GEO_COLS
        + _SECTEUR_COLS
        + _CURRENCY_COLS
        + _CLASSE_COLS
        + _META_COLS
    )


def _allocation_title_row(header_row: list[str]) -> list[str]:
    title_row = [""] * len(header_row)
    title_row[0] = "Asset"
    title_row[2] = "Geography"
    title_row[2 + len(_GEO_COLS)] = "Sector"
    title_row[2 + len(_GEO_COLS) + len(_SECTEUR_COLS)] = "Currency (allocation)"
    title_row[
        2 + len(_GEO_COLS) + len(_SECTEUR_COLS) + len(_CURRENCY_COLS)
    ] = "Asset class"
    title_row[len(header_row) - len(_META_COLS)] = "Yahoo Finance"
    return title_row


def _allocation_data_row(asset: dict) -> list:
    return (
        [asset["nom_placement"], asset["id"]]
        + [asset.get("geo", {}).get(c, 0) for c in _GEO_COLS]
        + [asset.get("secteur", {}).get(c, 0) for c in _SECTEUR_COLS]
        + [asset.get("currency_alloc", {}).get(c, 0) for c in _CURRENCY_COLS]
        + [asset.get("classe", {}).get(c, 0) for c in _CLASSE_COLS]
        + [
            asset.get("yahoo_symbol", ""),
            asset.get("currency", ""),
            asset.get("ticker", ""),
        ]
    )


def _write_allocations_xlsx(path: Path) -> None:
    from openpyxl import Workbook

    header_row = _allocation_header_row()
    wb = Workbook()
    ws = wb.active
    assert ws is not None, "workbook has no active worksheet"
    ws.title = "repartition"
    ws.append(_allocation_title_row(header_row))
    ws.append(header_row)
    for asset in _ASSETS:
        ws.append(_allocation_data_row(asset))
    wb.save(path)


# ---------------------------------------------------------------------------
# input/README.md
# ---------------------------------------------------------------------------

_INPUT_README = """# input/

This is an example generated by `finance-init` — replace these files with
your own exports once you understand the expected structure.
Run `finance-pipeline` to turn it into a dashboard.

## account_groups.csv

One row per account: `account,type,category,label`. `account` must exactly
match the `account` column used in the files below (or the account name
fixed by the format: `boursorama_pea`, `boursorama_cto`, `revolut`). `type`
and `label` are free text, used for display only. `category` is a fixed
vocabulary the pipeline/dashboard rely on for behaviour (e.g. which
accounts get synthetic cash positions) — one of: `brokerage`, `checking`,
`employer_savings`, `retirement`, `savings`, `private_equity`.

## brokers/boursorama/{PEA,CTO}/operations.csv

Export (raw or consolidated) of a Boursorama account — one subfolder per
account (`PEA`, `CTO`). Consolidated columns:
`date_operation,date_valeur,nom_valeur,libelle,isin,quantite,cours,montant`
(kept in Boursorama's own French export vocabulary — see
src/infrastructure/parsers/boursorama.py for the exact format).
`libelle` determines the operation type (VIR, ACHAT, VENTE, COUPONS...).

## brokers/revolut/trading-account-statement_*.csv

Raw Revolut export ("Trading account statement"). One or more files, the
exact name doesn't matter as long as it starts with
`trading-account-statement_`. Columns:
`Date,Ticker,Type,Quantity,Price per share,Total Amount,Currency,FX Rate`.

## brokers/direct/

Generic format for anything you can describe operation by operation:
`date,account,isin,ticker,name,operation_type,quantity,
price_per_unit,total_amount,currency`. `operation_type` is one of
DEPOSIT, WITHDRAWAL, BUY, SELL, DIVIDEND, INTEREST.

**Use `direct/` when you know the full transaction history** (deposits,
withdrawals, buys, sells, dividends, interest) with exact dates and
amounts — it gives an accurate average buy price and realized gains. This
is the typical case for a savings account, a checking account, or any
asset you track yourself transaction by transaction.

Multiple files and subfolders are accepted (any `*.csv` under `direct/`, at
any depth) — organise by account if useful, e.g.
`direct/checking_account.csv` flat, or `direct/brokerage/history.csv` in a
subfolder.

## brokers/valuations/

Format for when you only have periodic value statements, not operation
detail: `date,account,isin,ticker,name,value,invested,
currency`. `value` = total value as of that date, `invested` = cumulative
capital invested as of that date (used to separate performance from new
contributions). `isin`/`ticker` are almost always empty here — these
aren't assets tracked on Yahoo Finance.

**Use `valuations/` when you only have one amount per statement** (monthly,
quarterly...) and not the detailed history — typically a life insurance
policy, a retirement plan, a Private Equity fund, or any product you only
get a periodic valuation statement for.

Multiple files and subfolders are accepted, same as `direct/`.

## asset_prices/

Managed automatically by `finance-pipeline` (Yahoo Finance price cache) —
don't edit `generated/` by hand. `others/` is for manual prices for assets
absent from Yahoo Finance (e.g. Private Equity).

## allocations/*.xlsx

Optional. One file per date (`YYYY-MM-DD.xlsx`) giving, per asset, its
geographic/sector/currency/asset-class breakdown (used by the dashboard's
charts) and, if needed, the Yahoo Finance symbol to use when the
ISIN/ticker alone isn't enough to find it (e.g. IE0031442068 -> IUSA.DE in
the generated example). See
src/infrastructure/xlsx_allocation_repository.py for the exact column
format.
"""


def _parse_args(argv: list[str] | None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--data-dir",
        help=(
            "Folder to create input/ in (default: $FINANCE_DATA_DIR or"
            " ./data)"
        ),
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Overwrite an existing input/ folder",
    )
    return parser.parse_args(argv)


def _write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content)


def _install_skill() -> Path:
    """Sync the bundled allocation-update skill into the execution
    folder's .claude/skills/, so Claude Code picks it up there.

    Runs from the current working directory rather than --data-dir: the
    skill is a tool asset for whoever opens this folder in Claude Code,
    not personal financial data, so it follows the project root.
    """
    dest = Path.cwd() / ".claude" / "skills" / "allocation-update"
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.rmtree(dest, ignore_errors=True)
    shutil.copytree(_BUNDLED_SKILL_DIR, dest)
    return dest


def main(argv: list[str] | None = None) -> None:
    args = _parse_args(argv)
    data_dir = resolve_data_dir(args.data_dir)
    input_dir = data_dir / "input"

    skill_dest = _install_skill()
    print(f"  Skill installed : {skill_dest}/")

    if input_dir.exists() and not args.force:
        raise SystemExit(
            f"{input_dir} already exists — use --force to overwrite the"
            " example files."
        )

    _write(input_dir / "README.md", _INPUT_README)
    _write(input_dir / "account_groups.csv", _ACCOUNT_GROUPS)
    _write(
        input_dir / "brokers/direct/checking_account.csv",
        _DIRECT_CHECKING_ACCOUNT,
    )
    _write(
        input_dir / "brokers/direct/brokerage/history.csv",
        _DIRECT_BROKERAGE_HISTORY,
    )
    _write(
        input_dir / "brokers/boursorama/PEA/operations.csv", _BOURSORAMA_PEA
    )
    _write(
        input_dir / "brokers/boursorama/CTO/operations.csv", _BOURSORAMA_CTO
    )
    _write(
        input_dir
        / "brokers/revolut"
        / "trading-account-statement_2024-01-01_2026-06-23_demo.csv",
        _REVOLUT_STATEMENT,
    )
    _write(
        input_dir / "brokers/valuations/per_fortuneo.csv",
        _VALUATIONS_PER_FORTUNEO,
    )
    _write(
        input_dir / "brokers/valuations/life_insurance.csv",
        _VALUATIONS_LIFE_INSURANCE,
    )
    allocations_path = input_dir / "allocations/2024-01-01.xlsx"
    allocations_path.parent.mkdir(parents=True, exist_ok=True)
    _write_allocations_xlsx(allocations_path)

    print(f"  Example created in: {input_dir}/")
    print("  See input/README.md for details on each source.")
    print(
        "\n  Now run `finance-pipeline` to fetch real prices"
        " (AAPL, MC.PA, MSFT, two ETFs...) from Yahoo Finance and"
        " generate the dashboard."
    )


if __name__ == "__main__":
    main()
