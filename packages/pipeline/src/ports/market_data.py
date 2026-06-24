"""Port for the network market-data lookups used by FetchPricesUseCase."""

from abc import abstractmethod
from datetime import date
from typing import Protocol

import pandas as pd


class MarketDataClient(Protocol):
    """Yahoo Finance access — the only network boundary in FetchPricesUseCase.

    Concrete clients subclass this explicitly rather than just duck-typing
    it, so the contract is visible at the class declaration.
    """

    @abstractmethod
    def probe_symbol(self, key: str) -> bool:
        """Return True if `key` (ISIN/ticker) resolves to a
        downloadable symbol.
        """
        ...

    @abstractmethod
    def fetch_currency(self, yahoo_symbol: str) -> str:
        """Return the trading currency for a resolved Yahoo symbol."""
        ...

    @abstractmethod
    def download_close_prices(
        self, yahoo_symbols: list[str], start: date
    ) -> pd.DataFrame:
        """Download full close-price history since `start` (date x symbol)."""
        ...

    @abstractmethod
    def download_fx_rates(
        self, currencies: set[str], start: date
    ) -> dict[tuple[int, int, str], float]:
        """Download EUR/CCY rates since `start`, keyed by (year, month,
        currency).
        """
        ...
