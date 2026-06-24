"""Port for writing the pipeline's output CSVs under data/output/."""

from abc import abstractmethod
from typing import Protocol

import pandas as pd


class PortfolioOutputWriter(Protocol):
    """Writes every CSV produced by the ingestion pipeline.

    One method per file, so each write stays independently testable and
    write-site call code (the use case) reads as a flat list of outputs.
    Concrete writers subclass this explicitly rather than just duck-typing
    it, so the contract is visible at the class declaration.
    """

    @abstractmethod
    def write_operations(self, df: pd.DataFrame) -> None: ...

    @abstractmethod
    def write_positions(self, df: pd.DataFrame) -> None: ...

    @abstractmethod
    def write_positions_aggregated(self, df: pd.DataFrame) -> None: ...

    @abstractmethod
    def write_portfolio_snapshot(self, row: dict) -> None: ...

    @abstractmethod
    def write_cash(self, df: pd.DataFrame) -> None: ...

    @abstractmethod
    def write_portfolio_history(self, df: pd.DataFrame) -> None: ...

    @abstractmethod
    def write_saving_capacity(self, df: pd.DataFrame) -> None: ...

    @abstractmethod
    def write_saving_capacity_by_account(self, df: pd.DataFrame) -> None: ...

    @abstractmethod
    def write_positions_allocation(
        self, category: str, df: pd.DataFrame
    ) -> None: ...

    @abstractmethod
    def write_positions_allocation_by_isin(
        self, category: str, df: pd.DataFrame
    ) -> None: ...

    @abstractmethod
    def write_accounts(self, df: pd.DataFrame) -> None: ...

    @abstractmethod
    def write_errors(self, df: pd.DataFrame) -> None: ...
