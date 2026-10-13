"""Fetch the top disclosed constituents of funds held in the portfolio.

The generated ``fund_holdings.csv`` is consumed by the dashboard's
look-through concentration calculation.  Yahoo exposes the leading holdings,
not necessarily the complete portfolio; the dashboard deliberately keeps the
undisclosed remainder in the denominator without treating it as one holding.
"""

from __future__ import annotations

import argparse
import re
import unicodedata
from collections.abc import Callable
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

import pandas as pd
import yfinance as yf

from src.data_dir import resolve_data_dir
from src.infrastructure.xlsx_allocation_repository import (
    XlsxAllocationRepository,
)

_OUTPUT_COLUMNS = [
    "parent_isin",
    "parent_ticker",
    "parent_name",
    "holding_id",
    "holding_name",
    "weight",
]


def _text(value: object) -> str:
    if value is None:
        return ""
    text = str(value).strip()
    return "" if text.lower() in {"nan", "none"} else text


def _is_fund(name: str) -> bool:
    upper = name.upper()
    return any(token in upper for token in (" ETF", "UCITS", " FUND")) or (
        upper.startswith(
            (
                "AMUNDI ",
                "BNP PARIBAS EASY ",
                "GLOBAL X ",
                "ISHARES ",
                "L&G ",
                "XTRACKERS ",
            )
        )
    )


def _norm_name(value: str) -> str:
    value = "".join(
        char
        for char in unicodedata.normalize("NFD", value.lower())
        if unicodedata.category(char) != "Mn"
    )
    value = re.sub(
        r"\b(?:inc|corp|corporation|plc|sa|se|ag|nv|ltd|ordinary|shares?|"
        r"registered|class|cat)\b",
        " ",
        value,
    )
    return "".join(char for char in value if char.isalnum())


def _fetch_yahoo_holdings(symbol: str) -> pd.DataFrame:
    return yf.Ticker(symbol).funds_data.top_holdings


def build_fund_holdings(
    positions: pd.DataFrame,
    ticker_data: dict[str, dict],
    fetch: Callable[[str], pd.DataFrame] = _fetch_yahoo_holdings,
    max_workers: int = 6,
) -> pd.DataFrame:
    """Return normalized top-holding rows for funds in the latest snapshot."""
    if positions.empty:
        return pd.DataFrame(columns=_OUTPUT_COLUMNS)

    positions = positions.copy()
    latest = positions["snapshot_date"].astype(str).max()
    positions = positions[positions["snapshot_date"].astype(str) == latest]

    # Translate Yahoo symbols back to a stable portfolio identifier whenever
    # the constituent is itself held directly (e.g. TICKER -> DIRECT-ASSET).
    symbol_to_id: dict[str, str] = {}
    for key, meta in ticker_data.items():
        isin = _text(meta.get("isin"))
        symbol = _text(meta.get("yahoo_symbol"))
        if symbol and isin:
            symbol_to_id.setdefault(symbol.upper(), isin)
        ticker = _text(meta.get("ticker"))
        if ticker and isin:
            symbol_to_id.setdefault(ticker.upper(), isin)
        if isin:
            symbol_to_id.setdefault(str(key).upper(), isin)

    direct_name_to_id: dict[str, str] = {}
    for _, row in positions.iterrows():
        isin = _text(row.get("isin"))
        name = _text(row.get("name"))
        if isin and name and not _is_fund(name):
            direct_name_to_id.setdefault(_norm_name(name), isin)

    def canonical_holding_id(symbol: str, name: str) -> str:
        known = symbol_to_id.get(symbol.upper())
        if known:
            return known
        normalized = _norm_name(name)
        direct = direct_name_to_id.get(normalized)
        if direct:
            return direct
        if len(normalized) >= 4:
            matches = {
                isin
                for direct_name, isin in direct_name_to_id.items()
                if min(len(normalized), len(direct_name)) >= 4
                and (
                    normalized.startswith(direct_name)
                    or direct_name.startswith(normalized)
                )
            }
            if len(matches) == 1:
                return matches.pop()
        return symbol

    funds: list[dict[str, str]] = []
    seen: set[str] = set()
    for _, row in positions.iterrows():
        name = _text(row.get("name"))
        isin = _text(row.get("isin"))
        ticker = _text(row.get("ticker"))
        if not _is_fund(name) or not (isin or ticker):
            continue
        parent_id = isin or ticker
        if parent_id in seen:
            continue
        seen.add(parent_id)
        meta = ticker_data.get(isin) or ticker_data.get(ticker) or {}
        symbol = _text(meta.get("yahoo_symbol")) or isin or ticker
        funds.append({
            "parent_isin": isin,
            "parent_ticker": ticker,
            "parent_name": name,
            "symbol": symbol,
        })

    rows: list[dict[str, object]] = []
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {
            executor.submit(fetch, fund["symbol"]): fund for fund in funds
        }
        for future in as_completed(futures):
            fund = futures[future]
            try:
                holdings = future.result()
            except Exception as exc:
                print(
                    f"[fund-holdings] {fund['parent_name']}: unavailable"
                    f" ({exc})"
                )
                continue
            if holdings is None or holdings.empty:
                print(f"[fund-holdings] {fund['parent_name']}: no holdings")
                continue
            for raw_symbol, holding in holdings.iterrows():
                symbol = _text(raw_symbol)
                name = _text(holding.get("Name")) or symbol
                try:
                    weight = float(holding.get("Holding Percent", 0) or 0)
                except (TypeError, ValueError):
                    continue
                if not symbol or not name or weight <= 0 or weight > 1:
                    continue
                rows.append({
                    "parent_isin": fund["parent_isin"],
                    "parent_ticker": fund["parent_ticker"],
                    "parent_name": fund["parent_name"],
                    "holding_id": canonical_holding_id(symbol, name),
                    "holding_name": name,
                    "weight": round(weight, 8),
                })

    return pd.DataFrame(rows, columns=_OUTPUT_COLUMNS).sort_values(
        ["parent_name", "weight"], ascending=[True, False]
    )


def refresh_fund_holdings(data_dir: Path) -> Path:
    output_dir = data_dir / "output"
    positions_path = output_dir / "positions.csv"
    if not positions_path.exists():
        raise FileNotFoundError(
            f"{positions_path} does not exist; run finance-pipeline first"
        )

    allocation_repo = XlsxAllocationRepository(
        data_dir / "input" / "allocations"
    )
    holdings = build_fund_holdings(
        pd.read_csv(positions_path), allocation_repo.load_ticker_data()
    )
    destination = output_dir / "fund_holdings.csv"
    if holdings.empty:
        raise RuntimeError(
            "No fund holdings were returned; the existing file was preserved"
        )
    holdings.to_csv(destination, index=False)
    print(
        f"[fund-holdings] {destination} — {len(holdings)} rows, "
        f"{holdings['parent_isin'].nunique()} funds"
    )
    return destination


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--data-dir")
    args = parser.parse_args(argv)
    refresh_fund_holdings(resolve_data_dir(args.data_dir))


if __name__ == "__main__":
    main()
