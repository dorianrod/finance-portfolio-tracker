"""Asset-level IRR over an arbitrary dashboard date range."""

from __future__ import annotations

from collections import defaultdict
from collections.abc import Iterable
from datetime import date
from pathlib import Path
from typing import Any

import pandas as pd

from src.domain.tri import _xirr

CASH_SUFFIX = " – Cash"
CASH_FILTER_SUFFIX = "::cash"


def _text(value: Any) -> str:
    if value is None or pd.isna(value):
        return ""
    return str(value).strip()


def _number(value: Any) -> float:
    text = _text(value)
    return float(text) if text else 0.0


def _asset_key(row: pd.Series) -> str:
    for column in ("isin", "ticker", "name"):
        value = _text(row.get(column))
        if value:
            normalized = (
                value.upper() if column != "name" else value.casefold()
            )
            return f"{column}:{normalized}"
    return ""


def _is_synthetic_cash(row: pd.Series) -> bool:
    return (
        _text(row.get("account_category")) == "brokerage"
        and _text(row.get("name")).startswith("Cash ")
    )


def _account_filter_id(row: pd.Series) -> str:
    account = _text(row.get("account"))
    if _is_synthetic_cash(row):
        return f"{account}{CASH_FILTER_SUFFIX}"
    return account


def _effective_account_type(row: pd.Series) -> str:
    account_type = _text(row.get("account_type"))
    if _is_synthetic_cash(row) and not account_type.endswith(CASH_SUFFIX):
        return f"{account_type}{CASH_SUFFIX}"
    return account_type


def _is_cash_based_asset(
    row: pd.Series, operations: pd.DataFrame | None
) -> bool:
    """Return whether the position is a balance rather than an investment."""
    classified_as_cash = (
        _text(row.get("account_category")) == "checking"
        or _text(row.get("account_type")) == "Livret"
    )
    if classified_as_cash:
        return True
    if operations is None or operations.empty:
        return False
    operation_types = set(operations["operation_type"].astype(str))
    cash_operation_types = {"DEPOSIT", "WITHDRAWAL", "INTEREST"}
    return bool(operation_types) and operation_types <= cash_operation_types


def _in_scope(
    row: pd.Series,
    accounts: set[str],
    account_types: set[str],
) -> bool:
    if _is_synthetic_cash(row):
        return False
    if accounts and _account_filter_id(row) not in accounts:
        return False
    return not account_types or _effective_account_type(row) in account_types


def _parse_date(value: str | None) -> date | None:
    return date.fromisoformat(value) if value else None


def build_asset_irr(
    output_dir: Path,
    accounts: Iterable[str] = (),
    account_types: Iterable[str] = (),
    date_from: str | None = None,
    date_to: str | None = None,
) -> dict[str, Any]:
    """Return annualized, money-weighted IRR for each selected asset.

    Unit/valuation assets use BUY as outflows and SELL, DIVIDEND and INTEREST
    as inflows. Cash-based assets such as savings accounts use DEPOSIT and
    WITHDRAWAL; interest remains in the terminal balance and is not counted
    twice. Brokerage synthetic cash is intentionally excluded.
    """
    positions = pd.read_csv(output_dir / "positions.csv", dtype=str).fillna("")
    operations = pd.read_csv(
        output_dir / "operations.csv", dtype=str
    ).fillna("")
    selected_accounts = {value.strip() for value in accounts if value.strip()}
    selected_types = {
        value.strip() for value in account_types if value.strip()
    }

    positions = positions[
        positions.apply(
            lambda row: _in_scope(row, selected_accounts, selected_types),
            axis=1,
        )
    ].copy()
    operations = operations[
        operations.apply(
            lambda row: _in_scope(row, selected_accounts, selected_types),
            axis=1,
        )
    ].copy()
    if positions.empty:
        return {
            "available": False,
            "start_date": None,
            "end_date": None,
            "assets": [],
        }

    positions["_date"] = pd.to_datetime(positions["snapshot_date"]).dt.date
    positions["_asset_key"] = positions.apply(_asset_key, axis=1)
    operations["_date"] = pd.to_datetime(operations["date"]).dt.date
    operations["_asset_key"] = operations.apply(_asset_key, axis=1)
    positions = positions[positions["_asset_key"] != ""]
    operations = operations[operations["_asset_key"] != ""]

    requested_end = _parse_date(date_to)
    if requested_end is not None:
        positions = positions[positions["_date"] <= requested_end]
        operations = operations[operations["_date"] <= requested_end]
    if positions.empty:
        return {
            "available": False,
            "start_date": None,
            "end_date": None,
            "assets": [],
        }

    snapshot_dates = sorted(set(positions["_date"]))
    end_date = snapshot_dates[-1]
    requested_start = _parse_date(date_from)
    start_date: date | None = None
    if requested_start is not None:
        preceding = [
            value for value in snapshot_dates if value <= requested_start
        ]
        start_date = preceding[-1] if preceding else snapshot_dates[0]

    position_groups: dict[tuple[str, str], pd.DataFrame] = {
        (str(account), str(asset_key)): group
        for (account, asset_key), group in positions.groupby(
            ["account", "_asset_key"], sort=False
        )
    }
    operation_groups: dict[tuple[str, str], pd.DataFrame] = {
        (str(account), str(asset_key)): group
        for (account, asset_key), group in operations.groupby(
            ["account", "_asset_key"], sort=False
        )
    }
    asset_flows: dict[str, list[tuple[float, date]]] = defaultdict(list)
    asset_values: dict[str, float] = defaultdict(float)
    asset_names: dict[str, str] = {}
    asset_accounts: dict[str, set[str]] = defaultdict(set)
    asset_types: dict[str, set[str]] = defaultdict(set)

    for group_key, group in position_groups.items():
        account, asset_key = group_key
        latest = group.sort_values("_date").iloc[-1]
        asset_names.setdefault(
            asset_key, _text(latest.get("name")) or asset_key
        )
        asset_accounts[asset_key].add(account)
        account_type = _effective_account_type(latest)
        if account_type:
            asset_types[asset_key].add(account_type)

        group_operations = operation_groups.get(group_key)
        is_cash_based = _is_cash_based_asset(latest, group_operations)

        if start_date is not None:
            opening = group[group["_date"] == start_date]
            if not opening.empty:
                opening_value = sum(
                    _number(value) for value in opening["total_value"]
                )
                if opening_value > 0:
                    asset_flows[asset_key].append((-opening_value, start_date))
        else:
            first_date = min(group["_date"])
            first_rows = group[group["_date"] == first_date]
            first_value = sum(
                _number(value) for value in first_rows["total_value"]
            )
            has_prior_flow = False
            if group_operations is not None:
                relevant = {"DEPOSIT"} if is_cash_based else {"BUY"}
                has_prior_flow = bool(
                    (
                        group_operations["operation_type"].isin(relevant)
                        & (group_operations["_date"] <= first_date)
                    ).any()
                )
            if first_value > 0 and not has_prior_flow:
                asset_flows[asset_key].append((-first_value, first_date))

        if group_operations is not None:
            for _, operation in group_operations.iterrows():
                operation_date = operation["_date"]
                if operation_date > end_date:
                    continue
                if start_date is not None and operation_date <= start_date:
                    continue
                operation_type = _text(operation.get("operation_type"))
                amount = _number(operation.get("total_amount"))
                if amount == 0:
                    continue
                if is_cash_based:
                    if operation_type in {"DEPOSIT", "WITHDRAWAL"}:
                        asset_flows[asset_key].append(
                            (-amount, operation_date)
                        )
                elif operation_type in {
                    "BUY",
                    "SELL",
                    "DIVIDEND",
                    "INTEREST",
                }:
                    asset_flows[asset_key].append((amount, operation_date))

        terminal = group[group["_date"] == end_date]
        terminal_value = sum(
            _number(value) for value in terminal["total_value"]
        )
        if terminal_value > 0:
            asset_flows[asset_key].append((terminal_value, end_date))
            asset_values[asset_key] += terminal_value

    assets: list[dict[str, Any]] = []
    for asset_key, flows in asset_flows.items():
        flows.sort(key=lambda item: item[1])
        irr = _xirr(flows)
        if irr is None:
            continue
        name = asset_names.get(asset_key, asset_key)
        assets.append(
            {
                "key": asset_key,
                "label": name,
                "name": name,
                "irr": round(irr * 100, 4),
                "value": round(asset_values.get(asset_key, 0.0), 2),
                "accounts": sorted(asset_accounts[asset_key]),
                "account_types": sorted(asset_types[asset_key]),
            }
        )

    assets.sort(key=lambda item: item["irr"], reverse=True)
    actual_start = start_date
    if actual_start is None and asset_flows:
        actual_start = min(
            flow_date
            for flows in asset_flows.values()
            for _, flow_date in flows
        )
    return {
        "available": True,
        "start_date": actual_start.isoformat() if actual_start else None,
        "end_date": end_date.isoformat(),
        "assets": assets,
    }
