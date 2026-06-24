"""Port for reading and writing the pipeline's asset price data."""

from abc import abstractmethod
from typing import Protocol

import pandas as pd


class AssetPriceRepository(Protocol):
    """Source of monthly asset prices (generated + manual overrides).

    Concrete repositories subclass this explicitly rather than just
    duck-typing it, so the contract is visible at the class declaration.
    """

    @abstractmethod
    def load_all(self) -> pd.DataFrame:
        """Return the consolidated asset_prices DataFrame.

        Columns: isin, ticker, yahoo_symbol, name, price, currency,
        price_eur, date. Includes rows from data/input/asset_prices/others/
        (expanded to one row per snapshot month) and names backfilled from
        ticker_map.csv where missing.
        """
        ...

    @abstractmethod
    def load_ticker_map_errors(self) -> pd.DataFrame:
        """Return the contents of ticker_map_error.csv (empty if absent)."""
        ...

    @abstractmethod
    def load_manual_price_keys(self) -> set[str]:
        """Identifiers (isin if set, else ticker) covered by a manual price
        override under others/ (private equity, insurance funds, ...).

        These are precisely the assets Yahoo Finance has never heard of —
        that's why a manual override exists for them in the first place —
        so fetch_prices must not try to resolve them on Yahoo nor report
        them as unresolved tickers.
        """
        ...

    @abstractmethod
    def existing_months(self) -> set[tuple[int, int]]:
        """(year, month) pairs that already have a generated price file."""
        ...

    @abstractmethod
    def read_month(self, year: int, month: int) -> pd.DataFrame:
        """Return the existing generated price file for (year, month), or
        an empty DataFrame if it doesn't exist yet. Used to avoid losing
        previously-fetched prices when a refetch (e.g. of the current
        month) only partially succeeds.
        """
        ...

    @abstractmethod
    def write_month(self, year: int, month: int, df: pd.DataFrame) -> None:
        """Write the generated price file for (year, month)."""
        ...

    @abstractmethod
    def write_ticker_map_errors(self, df: pd.DataFrame) -> None:
        """Write ticker_map_error.csv, or clear it if df is empty."""
        ...
