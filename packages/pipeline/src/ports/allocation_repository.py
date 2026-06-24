"""Port for reading the allocations xlsx (asset allocation source of truth)."""

from abc import abstractmethod
from datetime import date
from pathlib import Path
from typing import Protocol

import pandas as pd


class AllocationRepository(Protocol):
    """Source of truth for asset metadata (ISIN, Yahoo symbol, currency) and
    category allocation weights (geo, secteur, currency, classe), read from
    data/input/allocations/*.xlsx.

    Concrete repositories subclass this explicitly rather than just
    duck-typing it, so the contract is visible at the class declaration.
    """

    @abstractmethod
    def load_ticker_data(self) -> dict[str, dict]:
        """{key: {key, isin, yahoo_symbol, name, currency}} from the
        most recent file.
        """
        ...

    @abstractmethod
    def file_dates(self) -> list[tuple[date, Path]]:
        """(date, path) for every allocations xlsx, derived from its
        filename.
        """
        ...

    @abstractmethod
    def load_allocation_tables(
        self, as_of: date
    ) -> dict[str, tuple[pd.DataFrame, list[str]]] | None:
        """Allocation tables from the most recent file whose date <= as_of.

        Returns {category: (df_with_meta_and_values, value_cols)}, or None if
        no file applies yet.
        """
        ...
