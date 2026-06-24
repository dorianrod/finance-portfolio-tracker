"""Concrete AccountGroupsRepository: reads data/input/account_groups.csv."""

from dataclasses import dataclass
from pathlib import Path

import pandas as pd

from src.ports.account_groups import AccountGroupsRepository


@dataclass
class CsvAccountGroupsRepository(AccountGroupsRepository):
    account_groups_file: Path

    def load_type_map(self) -> dict[str, str]:
        if not self.account_groups_file.exists():
            return {}
        df = pd.read_csv(self.account_groups_file, dtype=str)
        df.columns = [c.strip() for c in df.columns]
        if "account" not in df.columns or "type" not in df.columns:
            return {}
        return dict(
            zip(df["account"].str.strip(), df["type"].str.strip(), strict=True)
        )

    def load_label_map(self) -> dict[str, str]:
        if not self.account_groups_file.exists():
            return {}
        df = pd.read_csv(self.account_groups_file, dtype=str)
        df.columns = [c.strip() for c in df.columns]
        if "account" not in df.columns or "label" not in df.columns:
            return {}
        return dict(
            zip(
                df["account"].str.strip(), df["label"].str.strip(), strict=True
            )
        )

    def load_category_map(self) -> dict[str, str]:
        if not self.account_groups_file.exists():
            return {}
        df = pd.read_csv(self.account_groups_file, dtype=str)
        df.columns = [c.strip() for c in df.columns]
        if "account" not in df.columns or "category" not in df.columns:
            return {}
        return dict(
            zip(
                df["account"].str.strip(),
                df["category"].str.strip(),
                strict=True,
            )
        )

    def load_accounts_table(self) -> pd.DataFrame | None:
        if not self.account_groups_file.exists():
            return None
        df = pd.read_csv(self.account_groups_file, dtype=str)
        return df[["account", "label"]]
