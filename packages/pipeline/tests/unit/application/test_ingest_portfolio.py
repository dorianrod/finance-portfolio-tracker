from datetime import date, datetime

import pandas as pd

from src.application.ingest_portfolio import IngestPortfolioUseCase
from src.application.portfolio_snapshot_builder import PortfolioSnapshotResult
from src.domain.errors import ErrorCollector
from src.domain.models import (
    CashFlows,
    Operation,
    OperationType,
    PortfolioSnapshot,
    Position,
)


class _NoAllocationFilesRepository:
    def file_dates(self):
        return []


class _NoAccountsRepository:
    def load_accounts_table(self):
        return None


class _OutputWriterSpy:
    def __init__(self) -> None:
        self.positions: pd.DataFrame | None = None
        self.positions_aggregated: pd.DataFrame | None = None
        self.operations: pd.DataFrame | None = None

    def write_operations(self, df: pd.DataFrame) -> None:
        self.operations = df

    def write_cash(self, df: pd.DataFrame) -> None:
        pass

    def write_positions(self, df: pd.DataFrame) -> None:
        self.positions = df

    def write_positions_aggregated(self, df: pd.DataFrame) -> None:
        self.positions_aggregated = df

    def write_portfolio_snapshot(self, row: dict) -> None:
        pass

    def write_portfolio_history(self, df: pd.DataFrame) -> None:
        pass

    def write_saving_capacity(self, df: pd.DataFrame) -> None:
        pass

    def write_saving_capacity_by_account(self, df: pd.DataFrame) -> None:
        pass

    def write_positions_allocation(
        self, category: str, df: pd.DataFrame
    ) -> None:
        pass

    def write_positions_allocation_by_isin(
        self, category: str, df: pd.DataFrame
    ) -> None:
        pass

    def write_accounts(self, df: pd.DataFrame) -> None:
        pass

    def write_errors(self, df: pd.DataFrame) -> None:
        pass


def _position(account: str, name: str, total_value: float) -> Position:
    return Position(
        snapshot_date=date(2026, 6, 30),
        account=account,
        name=name,
        quantity=total_value,
        avg_buy_price=1.0,
        last_price=1.0,
        total_value=total_value,
        unrealized_gain=0.0,
        unrealized_gain_pct=0.0,
        tax_rate=0.0,
    )


def test_write_outputs_tags_only_brokerage_synthetic_cash_positions():
    output_writer = _OutputWriterSpy()
    use_case = IngestPortfolioUseCase(
        asset_price_repo=None,  # pyright: ignore[reportArgumentType]
        allocation_repo=_NoAllocationFilesRepository(),  # pyright: ignore[reportArgumentType]
        account_groups_repo=_NoAccountsRepository(),  # pyright: ignore[reportArgumentType]
        broker_data_collector=None,  # pyright: ignore[reportArgumentType]
        snapshot_builder=None,  # pyright: ignore[reportArgumentType]
        error_detector=None,  # pyright: ignore[reportArgumentType]
        output_writer=output_writer,  # pyright: ignore[reportArgumentType]
    )
    positions = [
        _position("broker", "Cash CTO", 100.0),
        _position("bank", "Cash Livret A", 200.0),
        _position("broker", "ETF World", 300.0),
    ]
    result = PortfolioSnapshotResult(
        account_type_map={"broker": "CTO", "bank": "Livret A"},
        account_label_map={"broker": "CTO", "bank": "Livret A"},
        account_category_map={"broker": "brokerage", "bank": "cash"},
        cash_df=pd.DataFrame(),
        all_positions=positions,
        latest_positions=positions,
        aggregated=positions,
        snapshot=PortfolioSnapshot(
            snapshot_date=date(2026, 6, 30),
            total_value=600.0,
            total_cost_basis=600.0,
            unrealized_gain=0.0,
            unrealized_gain_pct=0.0,
            cash_flows=CashFlows(
                total_deposited=0.0,
                total_withdrawn=0.0,
                net_cash_injected=0.0,
                total_dividends=0.0,
                total_interest=0.0,
            ),
        ),
    )
    operations = [
        Operation(
            date=datetime(2026, 6, 1),
            account="broker",
            operation_type=OperationType.DEPOSIT,
            total_amount=100.0,
        )
    ]

    use_case._write_outputs(
        all_operations=operations,
        result=result,
        errors=ErrorCollector(),
        today=date(2026, 7, 1),
    )

    assert output_writer.positions is not None
    by_name = output_writer.positions.set_index("name")
    assert by_name.loc["Cash CTO", "account_type"] == "CTO – Cash"
    assert by_name.loc["Cash Livret A", "account_type"] == "Livret A"
    assert by_name.loc["ETF World", "account_type"] == "CTO"
    assert output_writer.positions_aggregated is not None
    assert (
        output_writer.positions_aggregated.set_index("name").loc[
            "Cash CTO", "account_type"
        ]
        == "CTO – Cash"
    )
