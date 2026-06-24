"""Port for reading account_groups.csv (account -> type/label metadata)."""

from abc import abstractmethod
from typing import Protocol

import pandas as pd


class AccountGroupsRepository(Protocol):
    """Source of account metadata: free-text type/label for display, plus a
    fixed-vocabulary category used to drive behaviour (e.g. which accounts
    get synthetic cash positions).
    """

    @abstractmethod
    def load_type_map(self) -> dict[str, str]:
        """{account: type}, e.g. {"boursorama_pea": "Bourse"}. Free-text,
        user-defined, used for display only. Empty if absent.
        """
        ...

    @abstractmethod
    def load_label_map(self) -> dict[str, str]:
        """{account: label} for display names. Empty if absent."""
        ...

    @abstractmethod
    def load_category_map(self) -> dict[str, str]:
        """{account: category}, e.g. {"boursorama_pea": "brokerage"}. Fixed,
        code-controlled vocabulary (see account_groups.csv "category"
        column) used to classify accounts regardless of their free-text
        type/label. Empty if absent.
        """
        ...

    @abstractmethod
    def load_accounts_table(self) -> pd.DataFrame | None:
        """The {account, label} table as-is, for accounts.csv. None if
        absent.
        """
        ...
