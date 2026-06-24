"""PortfolioSnapshotBuilder: synthesises cash positions and the
latest-date snapshot.
"""

from dataclasses import dataclass
from datetime import date

import pandas as pd

from src.domain.models import Operation, PortfolioSnapshot, Position
from src.domain.portfolio import (
    aggregate_positions,
    build_snapshot,
    gain_breakdown,
)
from src.domain.reporting.cash import cash_snapshot
from src.ports.account_groups import AccountGroupsRepository


@dataclass
class PortfolioSnapshotResult:
    account_type_map: dict[str, str]
    account_label_map: dict[str, str]
    account_category_map: dict[str, str]
    cash_df: pd.DataFrame
    all_positions: list[Position]  # includes the synthetic cash positions
    latest_positions: list[Position]
    aggregated: list[Position]
    snapshot: PortfolioSnapshot


@dataclass
class PortfolioSnapshotBuilder:
    """Adds synthetic cash positions, then aggregates the latest-date snapshot.

    account_groups.csv (account -> type/label/category) is loaded once here
    since both steps need it: cash positions only apply to "brokerage"
    category accounts without their own named position, and the label
    feeds their display name ("Cash <label>").
    """

    account_groups_repo: AccountGroupsRepository

    def build(
        self,
        operations: list[Operation],
        positions: list[Position],
        today: date,
    ) -> PortfolioSnapshotResult:
        account_type_map = self.account_groups_repo.load_type_map()
        account_label_map = self.account_groups_repo.load_label_map()
        account_category_map = self.account_groups_repo.load_category_map()

        cash_df, synthetic_positions = self._compute_cash_positions(
            operations, account_category_map, account_label_map
        )
        all_positions = positions + synthetic_positions

        latest_date = (
            max(p.snapshot_date for p in all_positions)
            if all_positions
            else today
        )
        latest_positions = [
            p for p in all_positions if p.snapshot_date == latest_date
        ]
        aggregated = aggregate_positions(latest_positions)
        snapshot = build_snapshot(
            latest_positions, operations, snapshot_date=today
        )
        gain_breakdown(latest_positions, snapshot.cash_flows)

        return PortfolioSnapshotResult(
            account_type_map=account_type_map,
            account_label_map=account_label_map,
            account_category_map=account_category_map,
            cash_df=cash_df,
            all_positions=all_positions,
            latest_positions=latest_positions,
            aggregated=aggregated,
            snapshot=snapshot,
        )

    def _compute_cash_positions(
        self,
        operations: list[Operation],
        account_category_map: dict[str, str],
        account_label_map: dict[str, str],
    ) -> tuple[pd.DataFrame, list[Position]]:
        """Broker uninvested cash -> synthetic positions.

        Must run before the snapshot so totals include cash.
        """
        cash_df = cash_snapshot(operations)
        if cash_df.empty:
            return cash_df, []
        brokerage_accounts = {
            acc
            for acc, cat in account_category_map.items()
            if cat == "brokerage"
        }
        # Only create cash positions for accounts whose DEPOSIT/WITHDRAWAL ops
        # carry no isin/ticker/name — those are pure cash flows. Accounts that
        # already track their balance as named positions (e.g. IBKR "CTO IBKR")
        # must be excluded to avoid double-counting.
        cash_flow_accounts = {
            op.account
            for op in operations
            if op.operation_type.value in ("DEPOSIT", "WITHDRAWAL")
            and not op.isin
            and not op.ticker
            and not op.name
            and op.account in brokerage_accounts
        }
        synthetic_positions: list[Position] = []
        for _, crow in cash_df[
            cash_df["account"].isin(cash_flow_accounts)
        ].iterrows():
            amount = float(crow["cumulative_cash"])
            if amount <= 0:
                continue
            acc = crow["account"]
            label = account_label_map.get(acc, acc)
            snap = pd.to_datetime(crow["snapshot_date"]).date()
            synthetic_positions.append(
                Position(
                    snapshot_date=snap,
                    account=acc,
                    name=f"Cash {label}",
                    quantity=amount,
                    avg_buy_price=1.0,
                    last_price=1.0,
                    total_value=amount,
                    unrealized_gain=0.0,
                    unrealized_gain_pct=0.0,
                    realized_gain=0.0,
                    tax_rate=0.0,
                    dividend_tax_rate=0.0,
                )
            )
        return cash_df, synthetic_positions
