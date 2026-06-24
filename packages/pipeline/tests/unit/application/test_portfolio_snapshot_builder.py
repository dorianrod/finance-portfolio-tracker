"""PortfolioSnapshotBuilder must not blow up when there are no operations
(e.g. a misconfigured/empty data dir): cash_snapshot([]) returns a
DataFrame with no columns at all, so any column access on it must be
guarded.
"""

from datetime import date

import pandas as pd

from src.application.portfolio_snapshot_builder import PortfolioSnapshotBuilder


class _FakeAccountGroupsRepository:
    def load_type_map(self) -> dict[str, str]:
        return {}

    def load_label_map(self) -> dict[str, str]:
        return {}

    def load_category_map(self) -> dict[str, str]:
        return {}

    def load_accounts_table(self) -> pd.DataFrame | None:
        return None


def test_build_with_no_operations_returns_empty_snapshot():
    builder = PortfolioSnapshotBuilder(_FakeAccountGroupsRepository())

    result = builder.build([], [], today=date.today())

    assert result.cash_df.empty
    assert result.all_positions == []
    assert result.latest_positions == []
