"""IngestPortfolioUseCase: orchestrates the full ingestion pipeline.

Coordinates three focused collaborators — BrokerDataCollector (reads every
broker/account export), PortfolioSnapshotBuilder (adds synthetic cash
positions and aggregates the latest snapshot), and PortfolioErrorDetector
(consolidates every data-quality check) — then assembles and writes the
normalised CSVs via the injected PortfolioOutputWriter. The CLI entry point
(src/ingest_portfolio.py) is just the assembly of concrete adapters + a call
to execute().
"""

from dataclasses import dataclass
from datetime import date

import pandas as pd

from src.application.broker_data_collector import BrokerDataCollector
from src.application.portfolio_error_detector import PortfolioErrorDetector
from src.application.portfolio_snapshot_builder import (
    PortfolioSnapshotBuilder,
    PortfolioSnapshotResult,
)
from src.domain.errors import ErrorCollector
from src.domain.models import Operation, Position
from src.domain.reporting.portfolio_history import portfolio_history_snapshot
from src.domain.reporting.positions_allocation import (
    build_positions_allocation,
    build_positions_allocation_by_isin,
)
from src.domain.reporting.saving_capacity import (
    saving_capacity_per_account,
    saving_capacity_snapshot,
)
from src.domain.tri import _xirr as _xirr_impl
from src.domain.tri import portfolio_xirr
from src.ports.account_groups import AccountGroupsRepository
from src.ports.allocation_repository import AllocationRepository
from src.ports.asset_prices import AssetPriceRepository
from src.ports.output_writer import PortfolioOutputWriter

_POSITIONS_COLS = [
    "snapshot_date",
    "account",
    "isin",
    "ticker",
    "name",
    "quantity",
    "avg_buy_price",
    "last_price",
    "total_value",
    "unrealized_gain",
    "unrealized_gain_net",
    "unrealized_gain_pct",
    "realized_gain",
    "realized_gain_net",
    "tax_rate",
    "dividend_tax_rate",
]


def _operations_to_df(operations: list[Operation]) -> pd.DataFrame:
    df = pd.DataFrame([op.model_dump() for op in operations])
    cols = ["date", "account", "isin", "ticker"] + [
        c for c in df.columns if c not in ("date", "account", "isin", "ticker")
    ]
    return df[cols]


def _positions_to_df(positions: list[Position]) -> pd.DataFrame:
    df = pd.DataFrame([pos.model_dump() for pos in positions])
    df["unrealized_gain_net"] = (
        df["unrealized_gain"] * (1 - df["tax_rate"])
    ).round(2)
    realized_tax = df["realized_tax_rate"].where(
        df["realized_tax_rate"].notna(), df["tax_rate"]
    )
    df["realized_gain_net"] = (df["realized_gain"] * (1 - realized_tax)).round(
        2
    )
    available = [c for c in _POSITIONS_COLS if c in df.columns]
    return (
        df[available]
        .sort_values(["snapshot_date", "account"])
        .reset_index(drop=True)
    )


def _xirr(cashflows: list[tuple[float, date]]) -> float | None:
    return _xirr_impl(cashflows)


def _enrich_with_returns(
    positions_df: pd.DataFrame, operations: list[Operation]
) -> pd.DataFrame:
    """Add total_dividends, total_interest, total_realized_return,
    total_return_pct and xirr columns.
    """
    ops_df = pd.DataFrame([op.model_dump() for op in operations])
    ops_df["date"] = pd.to_datetime(ops_df["date"])

    # Grouping key: isin if available, else name
    ops_df["_key"] = ops_df["isin"].where(
        ops_df["isin"].notna() & (ops_df["isin"] != ""), ops_df["name"]
    )
    positions_df = positions_df.copy()
    positions_df["_key"] = positions_df["isin"].where(
        positions_df["isin"].notna() & (positions_df["isin"] != ""),
        positions_df["name"],
    )

    # --- dividends (lifetime, per asset) ---
    divs = (
        ops_df[ops_df["operation_type"] == "DIVIDEND"]
        .groupby("_key", dropna=True)["total_amount"]
        .sum()
        .reset_index()
        .rename(columns={"total_amount": "total_dividends"})
    )
    df = positions_df.merge(divs, on="_key", how="left")
    df["total_dividends"] = df["total_dividends"].fillna(0.0)
    div_tax = df["dividend_tax_rate"].where(
        df["dividend_tax_rate"].notna(), df["tax_rate"]
    )
    df["total_dividends_net"] = (df["total_dividends"] * (1 - div_tax)).round(
        2
    )

    # --- interest (lifetime, per asset) ---
    ints = (
        ops_df[ops_df["operation_type"] == "INTEREST"]
        .groupby("_key", dropna=True)["total_amount"]
        .sum()
        .reset_index()
        .rename(columns={"total_amount": "total_interest"})
    )
    df = df.merge(ints, on="_key", how="left")
    df["total_interest"] = df["total_interest"].fillna(0.0)
    df["total_interest_net"] = (
        df["total_interest"] * (1 - df["tax_rate"])
    ).round(2)
    df = df.drop(columns=["_key"])

    df["total_realized_return"] = (
        df["realized_gain"] + df["total_dividends"] + df["total_interest"]
    )

    # --- per-row XIRR & total_return_pct ---
    # Build cashflow lists per (isin, snapshot_date):
    #   BUY  → negative (already stored as negative in total_amount)
    #   SELL + DIVIDEND + INTEREST → positive (abs value)
    #   terminal → total_value at snapshot_date (positive inflow)
    trade_op_types = ["BUY", "SELL", "DIVIDEND", "INTEREST"]
    trade_ops = ops_df[ops_df["operation_type"].isin(trade_op_types)].copy()
    trade_ops = trade_ops[
        trade_ops["isin"].notna() & (trade_ops["isin"] != "")
    ]

    xirr_vals: list[float | None] = []
    ret_vals: list[float | None] = []

    for _, row in df.iterrows():
        isin = row.get("isin")
        snap_date = pd.to_datetime(row["snapshot_date"]).date()
        total_value = (
            float(row["total_value"])
            if pd.notna(row.get("total_value"))
            else 0.0
        )

        asset_ops = (
            trade_ops[
                (trade_ops["isin"] == isin)
                & (trade_ops["date"].dt.date <= snap_date)
            ]
            if isin
            else pd.DataFrame()
        )

        flows: list[tuple[float, date]] = []
        total_invested = 0.0
        total_out = 0.0

        for _, op in asset_ops.iterrows():
            amt = float(op["total_amount"])
            d = op["date"].date()
            if op["operation_type"] == "BUY":
                flows.append((amt, d))  # already negative
                total_invested += abs(amt)
            else:
                flows.append(
                    (abs(amt), d)
                )  # SELL / DIVIDEND / INTEREST → positive
                total_out += abs(amt)

        if total_value > 0:
            flows.append((total_value, snap_date))
        total_out += total_value

        # Sort by date for XIRR
        flows.sort(key=lambda x: x[1])

        xirr_vals.append(_xirr(flows) if flows else None)
        ret_vals.append(
            ((total_out - total_invested) / total_invested * 100)
            if total_invested > 0
            else None
        )

    df["xirr"] = [
        round(v * 100, 2) if v is not None else None for v in xirr_vals
    ]
    df["total_return_pct"] = [
        round(v, 2) if v is not None else None for v in ret_vals
    ]
    return df


def _add_account_type(
    df: pd.DataFrame, account_type_map: dict[str, str]
) -> pd.DataFrame:
    if not account_type_map or "account" not in df.columns:
        return df
    df = df.copy()
    account_loc = df.columns.get_loc("account")
    assert isinstance(account_loc, int)
    df.insert(
        account_loc + 1,
        "account_type",
        df["account"].map(account_type_map).fillna(""),
    )
    return df


def _add_account_category(
    df: pd.DataFrame, account_category_map: dict[str, str]
) -> pd.DataFrame:
    if not account_category_map or "account" not in df.columns:
        return df
    df = df.copy()
    insert_after = (
        "account_type" if "account_type" in df.columns else "account"
    )
    insert_loc = df.columns.get_loc(insert_after)
    assert isinstance(insert_loc, int)
    df.insert(
        insert_loc + 1,
        "account_category",
        df["account"].map(account_category_map).fillna(""),
    )
    return df


@dataclass
class IngestPortfolioUseCase:
    asset_price_repo: AssetPriceRepository
    allocation_repo: AllocationRepository
    account_groups_repo: AccountGroupsRepository
    broker_data_collector: BrokerDataCollector
    snapshot_builder: PortfolioSnapshotBuilder
    error_detector: PortfolioErrorDetector
    output_writer: PortfolioOutputWriter

    def execute(self) -> None:
        today = date.today()
        asset_prices = self.asset_price_repo.load_all()

        operations, positions, parse_failures = (
            self.broker_data_collector.collect(asset_prices)
        )

        result = self.snapshot_builder.build(operations, positions, today)

        errors = self.error_detector.detect(
            asset_prices, result.all_positions, parse_failures
        )

        global_tri_pct = self._write_outputs(
            all_operations=operations,
            result=result,
            errors=errors,
            today=today,
        )

        self._print_summary(
            result.snapshot, result.all_positions, global_tri_pct
        )

    # ------------------------------------------------------------------
    # Output assembly
    # ------------------------------------------------------------------

    def _write_outputs(
        self,
        *,
        all_operations: list[Operation],
        result: PortfolioSnapshotResult,
        errors: ErrorCollector,
        today: date,
    ) -> float | None:
        account_type_map = result.account_type_map
        account_label_map = result.account_label_map
        account_category_map = result.account_category_map
        all_positions = result.all_positions
        aggregated = result.aggregated
        snapshot = result.snapshot
        cash_df = result.cash_df

        def _tag_account(df: pd.DataFrame) -> pd.DataFrame:
            return _add_account_category(
                _add_account_type(df, account_type_map), account_category_map
            )

        def _tag_cash_positions(df: pd.DataFrame) -> pd.DataFrame:
            """Append ' – Cash' to account_type for synthetic cash positions.

            Synthetic cash rows are identified by their name convention
            ("Cash <label>") AND brokerage category — both derived from
            account_groups.csv, not from hardcoded account names.
            """
            is_cash = df["name"].str.startswith("Cash ", na=False) & (
                df["account_category"] == "brokerage"
            )
            df = df.copy()
            df.loc[is_cash, "account_type"] = (
                df.loc[is_cash, "account_type"].fillna("") + " – Cash"
            )
            return df

        # Tag DEPOSIT/WITHDRAWAL ops for brokerage accounts so the dashboard
        # can link them to the corresponding cash position row.
        ops_df = _tag_account(_operations_to_df(all_operations))

        def _blank(s: pd.Series) -> pd.Series:
            return s.isna() | (s == "")

        is_cash_op = (
            (ops_df["account_category"] == "brokerage")
            & ops_df["operation_type"].isin(["DEPOSIT", "WITHDRAWAL"])
            & _blank(ops_df["isin"])
            & _blank(ops_df["ticker"])
            & _blank(ops_df["name"])
        )
        ops_df.loc[is_cash_op, "name"] = ops_df.loc[is_cash_op, "account"].map(
            lambda a: f"Cash {account_label_map.get(str(a), str(a))}"
        )
        self.output_writer.write_operations(ops_df)

        self.output_writer.write_cash(_tag_account(cash_df))
        self.output_writer.write_positions(
            _tag_cash_positions(
                _tag_account(
                    _enrich_with_returns(
                        _positions_to_df(all_positions), all_operations
                    )
                )
            )
        )
        self.output_writer.write_positions_aggregated(
            _tag_cash_positions(
                _tag_account(
                    _enrich_with_returns(
                        _positions_to_df(aggregated), all_operations
                    )
                )
            )
        )

        global_tri = portfolio_xirr(
            all_operations, snapshot.total_value, today
        )
        global_tri_pct = (
            round(global_tri * 100, 2) if global_tri is not None else None
        )

        snapshot_row = {
            "snapshot_date": snapshot.snapshot_date.isoformat(),
            "total_value": snapshot.total_value,
            "total_cost_basis": snapshot.total_cost_basis,
            "unrealized_gain": snapshot.unrealized_gain,
            "unrealized_gain_pct": snapshot.unrealized_gain_pct,
            "net_cash_injected": snapshot.cash_flows.net_cash_injected,
            "total_deposited": snapshot.cash_flows.total_deposited,
            "total_withdrawn": snapshot.cash_flows.total_withdrawn,
            "total_dividends": snapshot.cash_flows.total_dividends,
            "total_interest": snapshot.cash_flows.total_interest,
            "tri": global_tri_pct,
        }
        self.output_writer.write_portfolio_snapshot(snapshot_row)

        history_df = portfolio_history_snapshot(all_positions, all_operations)
        self.output_writer.write_portfolio_history(history_df)

        saving_cap_df = saving_capacity_snapshot(history_df)
        self.output_writer.write_saving_capacity(saving_cap_df)

        saving_cap_by_account_df = saving_capacity_per_account(all_positions)
        self.output_writer.write_saving_capacity_by_account(
            saving_cap_by_account_df
        )

        # Allocation time-series per category (geo, secteur, currency, classe).
        # build_positions_allocation*() already return {} when the
        # allocation_repo has no files, so no existence guard is needed here.
        positions_raw_df = _tag_account(
            _enrich_with_returns(
                _positions_to_df(all_positions), all_operations
            )
        )
        alloc_dfs = build_positions_allocation(
            positions_raw_df, self.allocation_repo
        )
        for category, alloc_df in alloc_dfs.items():
            self.output_writer.write_positions_allocation(category, alloc_df)
            print(
                f"[allocation] positions_{category}.csv"
                f" — {len(alloc_df)} rows"
            )

        by_isin_dfs = build_positions_allocation_by_isin(
            positions_raw_df, self.allocation_repo
        )
        for category, isin_df in by_isin_dfs.items():
            self.output_writer.write_positions_allocation_by_isin(
                category, isin_df
            )
            n_isins = isin_df["isin"].nunique()
            print(
                f"[allocation] positions_{category}_by_isin.csv"
                f" — {len(isin_df)} rows, {n_isins} ISINs"
            )

        accounts_table = self.account_groups_repo.load_accounts_table()
        if accounts_table is not None:
            self.output_writer.write_accounts(accounts_table)

        # dashboard/public/data is hardlinked to data/output — no copy needed

        self.output_writer.write_errors(errors.to_df())
        if len(errors) > 0:
            n_err = sum(
                1 for e in errors.to_df().itertuples() if e.level == "error"
            )
            n_warn = len(errors) - n_err
            print(
                f"\n[errors] {len(errors)} entries written to errors.csv"
                f" ({n_err} error(s), {n_warn} warning(s))"
            )

        return global_tri_pct

    def _print_summary(
        self,
        snapshot,
        all_positions: list[Position],
        global_tri_pct: float | None,
    ) -> None:
        print("\n" + "=" * 50)
        print(f"  Portfolio Snapshot — {snapshot.snapshot_date}")
        print("=" * 50)
        print(f"  Current Value     :" f" €{snapshot.total_value:>12,.2f}")
        print(
            f"  Cost Basis        :" f" €{snapshot.total_cost_basis:>12,.2f}"
        )
        print(
            f"  Unrealized Gain   :"
            f" €{snapshot.unrealized_gain:>12,.2f}"
            f"  ({snapshot.unrealized_gain_pct:+.1f}%)"
        )
        print(
            f"  Net Cash Injected :"
            f" €{snapshot.cash_flows.net_cash_injected:>12,.2f}"
        )
        print(
            f"  Dividends Received:"
            f" €{snapshot.cash_flows.total_dividends:>12,.2f}"
        )
        print(
            f"  Interest Received :"
            f" €{snapshot.cash_flows.total_interest:>12,.2f}"
        )
        if global_tri_pct is not None:
            print(f"  Global IRR        :" f"  {global_tri_pct:>11.2f}%")
        print("=" * 50)
        n_accounts = len(set(p.account for p in all_positions))
        print(
            f"\n  Positions : {len(all_positions)} rows"
            f" across {n_accounts} account(s)"
        )

        if snapshot.total_cost_basis > 0:
            cash_share = (
                snapshot.total_cost_basis
                / snapshot.cash_flows.net_cash_injected
                * 100
                if snapshot.cash_flows.net_cash_injected > 0
                else 0.0
            )
            print("\n  Gain breakdown:")
            print(
                f"    Cash deployed"
                f" (cost basis vs net injected): {cash_share:.1f}%"
            )
            print(
                f"    Unrealized gain"
                f" (pure asset appreciation) :"
                f" €{snapshot.unrealized_gain:,.2f}"
            )
