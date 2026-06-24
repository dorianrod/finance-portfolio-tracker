"""Concrete PortfolioOutputWriter: writes every pipeline CSV under
output_dir.
"""

from dataclasses import dataclass
from pathlib import Path

import pandas as pd

from src.ports.output_writer import PortfolioOutputWriter


@dataclass
class CsvOutputWriter(PortfolioOutputWriter):
    output_dir: Path

    def write_operations(self, df: pd.DataFrame) -> None:
        self._write(df, "operations.csv")

    def write_positions(self, df: pd.DataFrame) -> None:
        self._write(df, "positions.csv")

    def write_positions_aggregated(self, df: pd.DataFrame) -> None:
        self._write(df, "positions_aggregated.csv")

    def write_portfolio_snapshot(self, row: dict) -> None:
        self._write(pd.DataFrame([row]), "portfolio_snapshot.csv")

    def write_cash(self, df: pd.DataFrame) -> None:
        self._write(df, "cash.csv")

    def write_portfolio_history(self, df: pd.DataFrame) -> None:
        self._write(df, "portfolio_history.csv")

    def write_saving_capacity(self, df: pd.DataFrame) -> None:
        self._write(df, "saving_capacity.csv")

    def write_saving_capacity_by_account(self, df: pd.DataFrame) -> None:
        self._write(df, "saving_capacity_by_account.csv")

    def write_positions_allocation(
        self, category: str, df: pd.DataFrame
    ) -> None:
        self._write(df, f"positions_{category}.csv")

    def write_positions_allocation_by_isin(
        self, category: str, df: pd.DataFrame
    ) -> None:
        self._write(df, f"positions_{category}_by_isin.csv")

    def write_accounts(self, df: pd.DataFrame) -> None:
        self._write(df, "accounts.csv")

    def write_errors(self, df: pd.DataFrame) -> None:
        self._write(df, "errors.csv")

    def _write(self, df: pd.DataFrame, filename: str) -> None:
        self.output_dir.mkdir(parents=True, exist_ok=True)
        df.to_csv(self.output_dir / filename, index=False)
