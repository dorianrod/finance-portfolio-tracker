"""PortfolioErrorDetector: consolidates every data-quality check into one
ErrorCollector.
"""

from dataclasses import dataclass
from typing import cast

import pandas as pd

from src.application.broker_data_collector import ParseFailure
from src.domain.errors import ErrorCollector
from src.domain.models import Position
from src.ports.asset_prices import AssetPriceRepository


@dataclass
class PortfolioErrorDetector:
    """Runs every known data-quality check: broker files that failed to
    parse, unresolved tickers, missing monthly prices, and missing EUR/CCY
    exchange rates.
    """

    asset_price_repo: AssetPriceRepository

    def detect(
        self,
        asset_prices: pd.DataFrame,
        positions: list[Position],
        parse_failures: list[ParseFailure],
    ) -> ErrorCollector:
        errors = ErrorCollector()
        self._add_parse_failures(errors, parse_failures)
        self._add_ticker_map_errors(errors)
        self._add_missing_price_warnings(errors, asset_prices, positions)
        self._add_missing_fx_warnings(errors, asset_prices)
        return errors

    def _add_parse_failures(
        self, errors: ErrorCollector, parse_failures: list[ParseFailure]
    ) -> None:
        for failure in parse_failures:
            errors.add(
                source="main",
                level="error",
                type="parsing_error",
                name=failure.label,
                message=failure.message,
            )

    def _add_ticker_map_errors(self, errors: ErrorCollector) -> None:
        # Unresolved ticker (from fetch_prices ticker_map_error.csv)
        for (
            _,
            row,
        ) in self.asset_price_repo.load_ticker_map_errors().iterrows():
            errors.add(
                source="fetch_prices",
                level="error",
                type="unresolved_ticker",
                isin=row.get("isin", ""),
                ticker=row.get("ticker", "") or row.get("key", ""),
                name=row.get("name", ""),
                message=(
                    f"Yahoo Finance symbol not found for"
                    f" '{row.get('key', '')}' — add a yahoo_symbol/ticker"
                    " row for it in the allocations xlsx (see"
                    " allocation-update skill)"
                ),
            )

    def _add_missing_price_warnings(
        self,
        errors: ErrorCollector,
        asset_prices: pd.DataFrame,
        positions: list[Position],
    ) -> None:
        # Missing price: ISIN positions with no entry in asset_prices for
        # that month. The parsers (see PriceLookup.get_row_or_latest /
        # get_price_eur_or_price_or_latest) fall back to the latest prior
        # month's price when one exists, and only to avg_buy_price when the
        # isin was never priced at all — mirror that here so the warning
        # message matches what last_price actually is.
        available_isin_prices: set[tuple[int, int, str]] = set()
        months_by_isin: dict[str, list[tuple[int, int]]] = {}
        if (
            not asset_prices.empty
            and "isin" in asset_prices.columns
            and "date" in asset_prices.columns
        ):
            _tmp = asset_prices[
                asset_prices["isin"].notna() & (asset_prices["isin"] != "")
            ].copy()
            _tmp_dates = pd.to_datetime(_tmp["date"], errors="coerce")
            for idx, _row in _tmp.iterrows():
                _d = _tmp_dates.loc[cast(int, idx)]
                if pd.notna(_d):
                    isin = str(_row["isin"])
                    year_month = (int(_d.year), int(_d.month))
                    available_isin_prices.add((*year_month, isin))
                    months_by_isin.setdefault(isin, []).append(year_month)
        for months in months_by_isin.values():
            months.sort()

        seen_missing: set[tuple[str, int, int]] = set()
        for pos in positions:
            if not pos.isin:
                continue
            key = (pos.isin, pos.snapshot_date.year, pos.snapshot_date.month)
            if key in seen_missing:
                continue
            target = (pos.snapshot_date.year, pos.snapshot_date.month)
            price_key = (*target, pos.isin)
            if price_key not in available_isin_prices:
                seen_missing.add(key)
                prior_months = [
                    ym
                    for ym in months_by_isin.get(pos.isin, [])
                    if ym < target
                ]
                fallback_msg = (
                    f"last_price = last known price from"
                    f" {prior_months[-1][0]}-{prior_months[-1][1]:02d} used"
                    if prior_months
                    else "last_price = avg_buy_price used"
                )
                errors.add(
                    source="main",
                    level="warning",
                    type="missing_price",
                    date=f"{pos.snapshot_date.year}-{pos.snapshot_date.month:02d}",
                    account=pos.account,
                    isin=pos.isin,
                    ticker=pos.ticker or "",
                    name=pos.name or "",
                    message=(
                        f"No price for {pos.isin}"
                        f" ({pos.name or pos.ticker or '?'})"
                        f" in {pos.snapshot_date.year}"
                        f"-{pos.snapshot_date.month:02d}"
                        f" — {fallback_msg}"
                    ),
                )

    def _add_missing_fx_warnings(
        self, errors: ErrorCollector, asset_prices: pd.DataFrame
    ) -> None:
        # Missing EUR price (no exchange rate available to convert)
        if not asset_prices.empty and "price_eur" in asset_prices.columns:
            missing_eur = asset_prices[
                asset_prices["price_eur"].isna()
                & asset_prices["isin"].notna()
                & (asset_prices["isin"] != "")
            ]
            seen_eur: set[tuple[str, int, int]] = set()
            for _, _row in missing_eur.iterrows():
                _d = pd.to_datetime(str(_row.get("date", "")), errors="coerce")
                if pd.isna(_d):
                    continue
                key_eur = (str(_row["isin"]), int(_d.year), int(_d.month))
                if key_eur in seen_eur:
                    continue
                seen_eur.add(key_eur)
                errors.add(
                    source="main",
                    level="warning",
                    type="missing_fx_rate",
                    date=f"{_d.year}-{_d.month:02d}",
                    isin=str(_row["isin"]),
                    ticker=str(_row.get("ticker", "") or ""),
                    name=str(_row.get("name", "") or ""),
                    message=(
                        "EUR/"
                        f"{_row.get('currency', '?')} exchange rate not found"
                        f" for {_row.get('name', _row['isin'])}"
                        f" in {_d.year}-{_d.month:02d}"
                        f" — price_eur not computed"
                    ),
                )
