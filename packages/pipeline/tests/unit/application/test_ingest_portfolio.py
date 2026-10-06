from datetime import date, datetime

import pandas as pd
import pytest

from src.application.ingest_portfolio import (
    IngestPortfolioUseCase,
    _enrich_with_returns,
    _positions_to_df,
)
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


class _NoManualPricesRepository:
    def load_manual_prices(self) -> pd.DataFrame:
        return pd.DataFrame()


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

    def write_manual_price_overrides(self, df: pd.DataFrame) -> None:
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
        asset_price_repo=_NoManualPricesRepository(),  # pyright: ignore[reportArgumentType]
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


def test_returns_use_name_when_valuation_position_has_no_isin_or_ticker():
    position = Position(
        snapshot_date=date(2025, 1, 1),
        account="employee-plan",
        name="Employee savings plan",
        quantity=1100.0,
        avg_buy_price=1.0,
        last_price=1.0,
        total_value=1100.0,
        unrealized_gain=100.0,
        unrealized_gain_pct=10.0,
    )
    operations = [
        Operation(
            date=datetime(2024, 1, 1),
            account="employee-plan",
            name="Employee savings plan",
            operation_type=OperationType.BUY,
            quantity=1000.0,
            price_per_unit=1.0,
            # Direct imports are not guaranteed to carry the expected sign.
            total_amount=1000.0,
        )
    ]

    enriched = _enrich_with_returns(
        _positions_to_df([position]),
        operations,
        account_type_map={"employee-plan": "PEE"},
        account_category_map={"employee-plan": "employer_savings"},
    )

    assert enriched.loc[0, "xirr"] == pytest.approx(10.0, abs=0.05)
    assert enriched.loc[0, "xirr_rolling_3y"] == pytest.approx(
        10.0, abs=0.05
    )
    assert enriched.loc[0, "xirr_rolling_period_years"] == pytest.approx(
        1.0, abs=0.01
    )
    assert enriched.loc[0, "total_return_pct"] == 10.0


def test_rolling_return_uses_three_year_start_value_and_later_flows():
    start_date = date(2021, 12, 31)
    contribution_date = date(2024, 1, 1)
    end_date = date(2025, 1, 1)
    annual_rate = 1.10
    terminal_value = 1000 * annual_rate ** (
        (end_date - start_date).days / 365.25
    ) + 500 * annual_rate ** (
        (end_date - contribution_date).days / 365.25
    )
    positions = [
        Position(
            snapshot_date=start_date,
            account="retirement-plan",
            name="Retirement plan",
            quantity=1000.0,
            avg_buy_price=1.0,
            last_price=1.0,
            total_value=1000.0,
            unrealized_gain=0.0,
            unrealized_gain_pct=0.0,
        ),
        Position(
            snapshot_date=end_date,
            account="retirement-plan",
            name="Retirement plan",
            quantity=terminal_value,
            avg_buy_price=1.0,
            last_price=1.0,
            total_value=terminal_value,
            unrealized_gain=terminal_value - 1500,
            unrealized_gain_pct=(terminal_value - 1500) / 1500 * 100,
        ),
    ]
    operations = [
        Operation(
            date=datetime(2021, 1, 1),
            account="retirement-plan",
            name="Retirement plan",
            operation_type=OperationType.BUY,
            quantity=1000.0,
            price_per_unit=1.0,
            total_amount=-1000.0,
        ),
        Operation(
            date=datetime.combine(contribution_date, datetime.min.time()),
            account="retirement-plan",
            name="Retirement plan",
            operation_type=OperationType.BUY,
            quantity=500.0,
            price_per_unit=1.0,
            total_amount=-500.0,
        ),
    ]

    enriched = _enrich_with_returns(
        _positions_to_df(positions),
        operations,
        account_type_map={"retirement-plan": "PER / PERCO"},
        account_category_map={"retirement-plan": "retirement"},
    )
    current = enriched[enriched["snapshot_date"] == end_date].iloc[0]

    assert current["xirr_rolling_3y"] == pytest.approx(10.0, abs=0.01)
    assert current["xirr_rolling_period_years"] == 3.0


def test_returns_are_isolated_by_account_for_the_same_ticker():
    positions = [
        Position(
            snapshot_date=date(2025, 1, 1),
            account="account-a",
            ticker="SHARED",
            name="Shared asset",
            quantity=1.0,
            avg_buy_price=1000.0,
            last_price=1100.0,
            total_value=1100.0,
            unrealized_gain=100.0,
            unrealized_gain_pct=10.0,
        ),
        Position(
            snapshot_date=date(2025, 1, 1),
            account="account-b",
            ticker="SHARED",
            name="Shared asset",
            quantity=1.0,
            avg_buy_price=2000.0,
            last_price=2400.0,
            total_value=2400.0,
            unrealized_gain=400.0,
            unrealized_gain_pct=20.0,
        ),
    ]
    operations = [
        Operation(
            date=datetime(2024, 1, 1),
            account="account-a",
            ticker="SHARED",
            name="Shared asset",
            operation_type=OperationType.BUY,
            quantity=1.0,
            price_per_unit=1000.0,
            total_amount=-1000.0,
        ),
        Operation(
            date=datetime(2024, 1, 1),
            account="account-b",
            ticker="SHARED",
            name="Shared asset",
            operation_type=OperationType.BUY,
            quantity=1.0,
            price_per_unit=2000.0,
            total_amount=-2000.0,
        ),
    ]

    enriched = _enrich_with_returns(
        _positions_to_df(positions), operations
    ).set_index("account")

    assert enriched.loc["account-a", "xirr"] == pytest.approx(
        10.0, abs=0.05
    )
    assert enriched.loc["account-b", "xirr"] == pytest.approx(
        20.0, abs=0.05
    )


def test_returns_are_disabled_for_livrets_and_synthetic_brokerage_cash():
    positions = [
        _position("savings-account", "Livret A", 1100.0),
        _position("broker", "Cash CTO", 1100.0),
    ]
    operations = [
        Operation(
            date=datetime(2025, 1, 1),
            account=position.account,
            name=position.name,
            operation_type=OperationType.BUY,
            quantity=1000.0,
            price_per_unit=1.0,
            total_amount=-1000.0,
        )
        for position in positions
    ]

    enriched = _enrich_with_returns(
        _positions_to_df(positions),
        operations,
        account_type_map={"savings-account": "Livret", "broker": "Bourse"},
        account_category_map={
            "savings-account": "savings",
            "broker": "brokerage",
        },
    )

    assert enriched["xirr"].isna().all()
    assert enriched["xirr_rolling_3y"].isna().all()
    assert enriched["xirr_rolling_period_years"].isna().all()
    assert enriched["total_return_pct"].isna().all()
