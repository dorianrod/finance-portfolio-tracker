"""FetchPricesUseCase: orchestrates the monthly price-fetching pipeline.

Invoked by ingest_portfolio.py before IngestPortfolioUseCase, so missing
month-end prices are fetched before the portfolio is valued — no separate
script to run in the right order.
"""

from collections.abc import Callable
from dataclasses import dataclass
from datetime import date
from typing import cast

import pandas as pd

from src.domain.errors import ErrorCollector
from src.domain.models import OperationType
from src.domain.utils import month_end_dates
from src.ports.allocation_repository import AllocationRepository
from src.ports.asset_prices import AssetPriceRepository
from src.ports.broker_operations import BrokerOperationsReader
from src.ports.market_data import MarketDataClient
from src.ports.output_writer import PortfolioOutputWriter

# Above this relative change vs. the previous month's price_eur, the user is
# asked to confirm which value to keep instead of silently accepting the
# fresh Yahoo quote (which can reflect a stock split, a data glitch, or a
# genuine market move).
PRICE_JUMP_ALERT_THRESHOLD = 0.10


@dataclass(frozen=True)
class PriceDiscrepancy:
    """A fresh quote that moved more than the alert threshold vs. the last
    known price for the same asset — passed to `resolve_price_discrepancy`
    so the caller can ask the user which value to keep.
    """

    key: str  # isin, or ticker/yahoo_symbol when no isin is known
    name: str
    previous_month: str  # "YYYY-MM"
    previous_price_eur: float
    new_month: str  # "YYYY-MM"
    new_price_eur: float

    @property
    def change_ratio(self) -> float:
        return (self.new_price_eur - self.previous_price_eur) / abs(
            self.previous_price_eur
        )


@dataclass
class FetchPricesUseCase:
    broker_operations: BrokerOperationsReader
    asset_price_repo: AssetPriceRepository
    market_data: MarketDataClient
    allocation_repo: AllocationRepository
    output_writer: PortfolioOutputWriter
    confirm_current_month_refetch: Callable[[date], bool]
    resolve_price_discrepancy: Callable[[PriceDiscrepancy], float]

    def execute(self) -> None:
        collector = ErrorCollector()

        print("Collecting assets from operations...")
        operations = self.broker_operations.read_all()
        assets = self._collect_assets(operations)

        # Assets manually priced in others/ (private equity, insurance
        # funds, ...) are precisely the ones Yahoo Finance doesn't know
        # about — that's why a manual override exists. Skip them instead
        # of reporting them as unresolved tickers.
        manual_keys = self.asset_price_repo.load_manual_price_keys()
        manually_priced = manual_keys & assets.keys()
        for key in manually_priced:
            del assets[key]

        print(f"  {len(assets)} unique asset(s) found")
        if manually_priced:
            print(
                f"  {len(manually_priced)} asset(s) skipped (manually priced"
                f" in others/): {', '.join(sorted(manually_priced))}"
            )

        print("Resolving Yahoo Finance symbols...")
        ticker_map = self.allocation_repo.load_ticker_data()
        print(f"  {len(ticker_map)} asset(s) in allocations xlsx")
        sym_to_asset, unresolved = self._resolve_symbols(assets, ticker_map)

        self.asset_price_repo.write_ticker_map_errors(
            pd.DataFrame(unresolved, columns=["key", "isin", "ticker", "name"])
        )
        self._report_unresolved(unresolved, collector)

        yahoo_symbols = list(sym_to_asset)
        if not yahoo_symbols:
            print("No symbols resolved. Exiting.")
            return

        missing, snap_dates = self._determine_missing_months(operations)
        if not missing:
            print("\nAll monthly files already exist. Nothing to do.")
            return

        already = len(snap_dates) - len(missing)
        print(f"\n{len(missing)} month(s) to fetch ({already} already exist)")

        first_missing = min(missing)
        batch_start = date(first_missing.year, first_missing.month, 1)
        close = self.market_data.download_close_prices(
            yahoo_symbols, start=batch_start
        )
        if close.empty:
            print("Download returned no data.")
            return

        # Collect all non-EUR currencies across resolved assets
        non_eur_currencies = {
            meta["currency"]
            for meta in sym_to_asset.values()
            if meta.get("currency")
            and meta["currency"] not in ("EUR", "GBp", "")
        }
        non_eur_currencies.add("GBP")  # GBp assets are normalised to GBP
        fx_rates = self.market_data.download_fx_rates(
            non_eur_currencies, start=batch_start
        )

        self._write_monthly_price_files(
            missing, yahoo_symbols, close, fx_rates, sym_to_asset, collector
        )

        self.output_writer.write_errors(collector.to_df())
        if len(collector) > 0:
            print(
                f"\n[errors] {len(collector)} entries written to"
                " errors.csv"
            )

        print("\nDone.")

    # ------------------------------------------------------------------
    # Steps
    # ------------------------------------------------------------------

    def _collect_assets(self, operations) -> dict[str, dict]:
        assets: dict[str, dict] = {}
        for op in operations:
            if op.operation_type not in (
                OperationType.BUY,
                OperationType.SELL,
            ):
                continue
            if op.isin:
                if op.isin not in assets:
                    assets[op.isin] = {
                        "isin": op.isin,
                        "ticker": "",
                        "name": op.name or "",
                    }
                elif op.name and not assets[op.isin]["name"]:
                    assets[op.isin]["name"] = op.name
            elif op.ticker and op.ticker not in assets:
                assets[op.ticker] = {
                    "isin": "",
                    "ticker": op.ticker,
                    "name": "",
                }
        return assets

    def _resolve_symbols(
        self,
        assets: dict[str, dict],
        ticker_map: dict[str, dict],
    ) -> tuple[dict[str, dict], list[dict]]:
        """Resolve yahoo_symbol for each asset key.

        Returns:
            sym_to_asset  -- {yahoo_symbol: {isin, ticker, name, currency}}
            errors        -- list of {key, isin, ticker, name} that could
                             not be resolved
        """
        sym_to_asset: dict[str, dict] = {}
        errors: list[dict] = []

        for key, asset in assets.items():
            entry = ticker_map.get(key)

            # 1. User-provided mapping
            if entry and entry.get("yahoo_symbol"):
                yahoo_sym = entry["yahoo_symbol"]
                currency = entry.get("currency", "")
                name = entry.get("name") or asset["name"]
                # prefer map isin; fall back to asset (for ISIN-keyed ops)
                isin = entry.get("isin") or asset["isin"]
                source = "map"
            # 2. Direct ISIN/ticker download
            elif self.market_data.probe_symbol(key):
                yahoo_sym = key
                currency = self.market_data.fetch_currency(key)
                name = asset["name"]
                isin = asset["isin"]
                source = "direct"
            else:
                errors.append(
                    {
                        "key": key,
                        "isin": asset["isin"],
                        "ticker": asset["ticker"],
                        "name": asset["name"],
                    }
                )
                print(
                    f"  {key:20s}  [NOT FOUND] -- add a ticker/yahoo_symbol"
                    " row in the allocations xlsx"
                )
                continue

            print(f"  {key:20s}  [{source:6s}]  {yahoo_sym}  ({currency})")
            sym_to_asset[yahoo_sym] = {
                "isin": isin,
                "ticker": asset["ticker"],
                "name": name,
                "currency": currency,
            }

        return sym_to_asset, errors

    def _report_unresolved(
        self, unresolved: list[dict], collector: ErrorCollector
    ) -> None:
        if not unresolved:
            return
        print(
            f"\n  {len(unresolved)} unresolved asset(s) written to"
            " ticker_map_error.csv"
        )
        print(
            "  Add their yahoo_symbol/ticker to the allocations xlsx and"
            " re-run."
        )
        for row in unresolved:
            collector.add(
                source="fetch_prices",
                level="error",
                type="unresolved_ticker",
                isin=row.get("isin", ""),
                ticker=row.get("ticker", "") or row.get("key", ""),
                name=row.get("name", ""),
                message=(
                    "Yahoo Finance symbol not found for"
                    f" '{row.get('key', '')}'"
                    " — add a yahoo_symbol/ticker row for it in the"
                    " allocations xlsx (see allocation-update skill)"
                ),
            )

    def _determine_missing_months(
        self, operations
    ) -> tuple[list[date], list[date]]:
        today = date.today()
        snap_dates = month_end_dates(operations)
        existing = self.asset_price_repo.existing_months()
        missing: list[date] = []
        for d in snap_dates:
            if (d.year, d.month) not in existing or (
                d.year == today.year
                and d.month == today.month
                and self.confirm_current_month_refetch(d)
            ):
                missing.append(d)
        return missing, snap_dates

    def _month_price_eur_by_symbol(
        self, year: int, month: int
    ) -> dict[str, float]:
        """price_eur per yahoo_symbol for an already-generated month, used
        to detect month-over-month price jumps. Empty if the month has no
        price file yet (e.g. the very first month fetched).
        """
        month_df = self.asset_price_repo.read_month(year, month)
        if month_df.empty or "yahoo_symbol" not in month_df.columns:
            return {}
        prices: dict[str, float] = {}
        for _, row in month_df.iterrows():
            sym = row.get("yahoo_symbol")
            price_eur = row.get("price_eur")
            if pd.isna(sym) or pd.isna(price_eur):
                continue
            try:
                prices[str(sym)] = float(price_eur)
            except (TypeError, ValueError):
                continue
        return prices

    def _write_monthly_price_files(
        self,
        missing: list[date],
        yahoo_symbols: list[str],
        close: pd.DataFrame,
        fx_rates: dict[tuple[int, int, str], float],
        sym_to_asset: dict[str, dict],
        collector: ErrorCollector,
    ) -> None:
        for snap_date in missing:
            year, month = snap_date.year, snap_date.month

            # A refetch (e.g. of the current month) must never make a
            # previously successful fetch *worse*: Yahoo's batch download
            # can silently fail for most symbols in one call (rate
            # limiting) while still returning data for a few, so keep
            # whatever was already on disk for symbols this attempt missed.
            existing = self.asset_price_repo.read_month(year, month)
            existing_by_symbol: dict[str, dict] = {}
            if not existing.empty and "yahoo_symbol" in existing.columns:
                existing_by_symbol = {
                    str(r["yahoo_symbol"]): r.to_dict()
                    for _, r in existing.iterrows()
                    if pd.notna(r.get("yahoo_symbol"))
                }

            prev_year, prev_month = (
                (year - 1, 12) if month == 1 else (year, month - 1)
            )
            prev_month_label = f"{prev_year:04d}-{prev_month:02d}"
            prev_price_eur_by_symbol = self._month_price_eur_by_symbol(
                prev_year, prev_month
            )

            close_index = cast(pd.DatetimeIndex, close.index)
            mask = (close_index.year == year) & (close_index.month == month)
            month_close = close.loc[mask]
            if month_close.empty:
                print(f"  {year:04d}-{month:02d}: no data, skipping")
                collector.add(
                    source="fetch_prices",
                    level="error",
                    type="missing_data",
                    date=f"{year:04d}-{month:02d}",
                    message=(
                        "No Yahoo Finance data for"
                        f" {year:04d}-{month:02d}"
                    ),
                )
                continue

            last_row = month_close.iloc[-1]
            price_date = month_close.index[-1].date().isoformat()

            rows = []
            for sym in yahoo_symbols:
                if sym not in last_row.index or pd.isna(last_row[sym]):
                    meta = sym_to_asset.get(sym, {})
                    kept = existing_by_symbol.get(sym)
                    if kept is not None:
                        rows.append(kept)
                        collector.add(
                            source="fetch_prices",
                            level="warning",
                            type="stale_price_kept",
                            date=f"{year:04d}-{month:02d}",
                            isin=meta.get("isin", "") or kept.get("isin", ""),
                            ticker=meta.get("ticker", "") or sym,
                            name=meta.get("name", "") or kept.get("name", ""),
                            message=(
                                f"No fresh Yahoo quote for '{sym}' in"
                                f" {year:04d}-{month:02d} — kept previous"
                                f" price from {kept.get('date', '?')}"
                            ),
                        )
                    else:
                        collector.add(
                            source="fetch_prices",
                            level="warning",
                            type="missing_price",
                            date=f"{year:04d}-{month:02d}",
                            isin=meta.get("isin", ""),
                            ticker=meta.get("ticker", "") or sym,
                            name=meta.get("name", ""),
                            message=(
                                f"No Yahoo quote for '{sym}' in"
                                f" {year:04d}-{month:02d}"
                            ),
                        )
                    continue
                meta = sym_to_asset[sym]
                raw_price = float(last_row[sym])
                currency = meta["currency"]
                # Yahoo returns GBp (pence) for some London-listed ETFs.
                # Normalise to GBP (divide by 100) before storing.
                if currency == "GBp":
                    raw_price = raw_price / 100.0
                    currency = "GBP"

                if currency == "EUR":
                    price_eur = round(raw_price, 4)
                else:
                    fx_rate = fx_rates.get((year, month, currency))
                    price_eur = (
                        round(raw_price / fx_rate, 4) if fx_rate else None
                    )

                previous_price_eur = prev_price_eur_by_symbol.get(sym)
                if (
                    price_eur is not None
                    and previous_price_eur is not None
                    and previous_price_eur != 0
                ):
                    discrepancy = PriceDiscrepancy(
                        key=meta["isin"] or meta["ticker"] or sym,
                        name=meta["name"] or sym,
                        previous_month=prev_month_label,
                        previous_price_eur=previous_price_eur,
                        new_month=f"{year:04d}-{month:02d}",
                        new_price_eur=price_eur,
                    )
                    if (
                        abs(discrepancy.change_ratio)
                        > PRICE_JUMP_ALERT_THRESHOLD
                    ):
                        resolved_price_eur = self.resolve_price_discrepancy(
                            discrepancy
                        )
                        collector.add(
                            source="fetch_prices",
                            level="warning",
                            type="price_jump",
                            date=f"{year:04d}-{month:02d}",
                            isin=meta["isin"],
                            ticker=meta["ticker"] or sym,
                            name=meta["name"],
                            message=(
                                f"Price for {meta['name'] or sym} moved"
                                f" {discrepancy.change_ratio:+.1%} vs"
                                f" {prev_month_label}"
                                f" ({previous_price_eur:.4f} EUR ->"
                                f" {price_eur:.4f} EUR) — user confirmed"
                                f" {resolved_price_eur:.4f} EUR"
                            ),
                        )
                        if resolved_price_eur != price_eur:
                            price_eur = round(resolved_price_eur, 4)
                            if currency == "EUR":
                                raw_price = resolved_price_eur

                rows.append(
                    {
                        "isin": meta["isin"],
                        "ticker": meta["ticker"],
                        "yahoo_symbol": sym,
                        "name": meta["name"],
                        "price": round(raw_price, 4),
                        "currency": currency,
                        "price_eur": price_eur,
                        "date": price_date,
                    }
                )

            self.asset_price_repo.write_month(year, month, pd.DataFrame(rows))
            print(
                f"  {year:04d}-{month:02d}:"
                f" {len(rows)} prices -> {year:04d}-{month:02d}.csv"
            )
