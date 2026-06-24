"""Port for the broker/account loaders consumed by IngestPortfolioUseCase."""

from abc import abstractmethod
from typing import Protocol

import pandas as pd

from src.domain.models import Operation, Position


class BrokerLoader(Protocol):
    """Loads one broker/account export into (operations, positions).

    ticker_map and asset_prices are passed uniformly to every loader, even
    though most implementations ignore one or both — e.g. only
    RevolutLoader uses ticker_map (to backfill isin/name from the
    allocations xlsx), and ValuationsLoader ignores asset_prices entirely
    (it works off explicit value/invested columns, not market prices).

    Concrete loaders subclass this explicitly rather than just duck-typing
    it, so the contract is visible at the class declaration and
    instantiating an incomplete implementation fails immediately instead
    of only when a type checker happens to look.
    """

    label: str  # for logging and error reporting, e.g. "boursorama_pea"

    @abstractmethod
    def load(
        self,
        ticker_map: dict[str, dict],
        asset_prices: pd.DataFrame,
    ) -> tuple[list[Operation], list[Position]]: ...
