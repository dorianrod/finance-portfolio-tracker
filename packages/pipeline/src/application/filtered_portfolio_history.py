"""Build account-scoped portfolio history from normalized output CSVs.

This module is the bridge used by the local dashboard API.  It deliberately
delegates all return calculations to ``portfolio_history_snapshot`` so the
browser never needs its own XIRR implementation.
"""

from __future__ import annotations

import argparse
import json
from collections.abc import Iterable
from datetime import date, datetime
from pathlib import Path
from typing import Any

import pandas as pd

from src.domain.models import Operation, OperationType, Position
from src.domain.reporting.portfolio_history import portfolio_history_snapshot


class UnknownAccountsError(ValueError):
    """Raised when a requested account is absent from normalized outputs."""

    def __init__(self, accounts: Iterable[str]) -> None:
        self.accounts = tuple(sorted(set(accounts)))
        super().__init__(f"Unknown accounts: {', '.join(self.accounts)}")


def _optional_text(value: Any) -> str | None:
    if value is None or pd.isna(value):
        return None
    text = str(value).strip()
    return text or None


def _optional_float(value: Any) -> float | None:
    if value is None or pd.isna(value) or str(value).strip() == "":
        return None
    return float(value)


def _required_float(value: Any, default: float = 0.0) -> float:
    parsed = _optional_float(value)
    return default if parsed is None else parsed


def _load_positions(path: Path) -> list[Position]:
    frame = pd.read_csv(path, dtype=str).fillna("")
    return [
        Position(
            snapshot_date=date.fromisoformat(str(row["snapshot_date"])),
            account=str(row["account"]),
            isin=_optional_text(row.get("isin")),
            ticker=_optional_text(row.get("ticker")),
            name=str(row.get("name") or ""),
            quantity=_required_float(row.get("quantity")),
            avg_buy_price=_required_float(row.get("avg_buy_price")),
            last_price=_required_float(row.get("last_price")),
            total_value=_required_float(row.get("total_value")),
            unrealized_gain=_required_float(row.get("unrealized_gain")),
            unrealized_gain_pct=_required_float(
                row.get("unrealized_gain_pct")
            ),
            realized_gain=_required_float(row.get("realized_gain")),
            tax_rate=_required_float(row.get("tax_rate"), 0.30),
            realized_tax_rate=_optional_float(row.get("realized_tax_rate")),
            dividend_tax_rate=_optional_float(row.get("dividend_tax_rate")),
        )
        for _, row in frame.iterrows()
    ]


def _load_operations(path: Path) -> list[Operation]:
    frame = pd.read_csv(path, dtype=str).fillna("")
    operations: list[Operation] = []
    for _, row in frame.iterrows():
        operation_type = str(row["operation_type"])
        try:
            parsed_type = OperationType(operation_type)
        except ValueError:
            # The normalized file may gain display-only operation types in a
            # future release. They cannot affect portfolio TRI, so skip them.
            continue
        operations.append(
            Operation(
                date=datetime.fromisoformat(str(row["date"])),
                account=str(row["account"]),
                isin=_optional_text(row.get("isin")),
                ticker=_optional_text(row.get("ticker")),
                name=_optional_text(row.get("name")),
                operation_type=parsed_type,
                quantity=_optional_float(row.get("quantity")),
                price_per_unit=_optional_float(row.get("price_per_unit")),
                total_amount=_required_float(row.get("total_amount")),
                currency=_optional_text(row.get("currency")) or "EUR",
                realized_gain=_optional_float(row.get("realized_gain")),
                tax_rate=_optional_float(row.get("tax_rate")),
                realized_tax_rate=_optional_float(
                    row.get("realized_tax_rate")
                ),
                dividend_tax_rate=_optional_float(
                    row.get("dividend_tax_rate")
                ),
            )
        )
    return operations


def _json_value(value: Any) -> Any:
    if value is None or pd.isna(value):
        return None
    if isinstance(value, (date, datetime)):
        return value.isoformat()
    if hasattr(value, "item"):
        return value.item()
    return value


def _history_records(frame: pd.DataFrame) -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    for row in frame.to_dict(orient="records"):
        records.append(
            {str(column): _json_value(value) for column, value in row.items()}
        )
    return records


def build_filtered_portfolio_history(
    output_dir: Path, accounts: Iterable[str]
) -> dict[str, Any]:
    """Return the API payload for a set of complete portfolio accounts.

    An empty account list means all accounts.  Positions and operations are
    filtered together; this makes a transfer internal when both accounts are
    selected and an investor cash flow when only one side is selected.
    """
    positions_path = output_dir / "positions.csv"
    operations_path = output_dir / "operations.csv"
    positions = _load_positions(positions_path)
    operations = _load_operations(operations_path)

    available_accounts = {position.account for position in positions} | {
        operation.account for operation in operations
    }
    requested_accounts = tuple(
        sorted({account.strip() for account in accounts if account.strip()})
    )
    unknown = set(requested_accounts) - available_accounts
    if unknown:
        raise UnknownAccountsError(unknown)

    selected_accounts = (
        set(requested_accounts) if requested_accounts else available_accounts
    )
    filtered_positions = [
        position
        for position in positions
        if position.account in selected_accounts
    ]
    filtered_operations = [
        operation
        for operation in operations
        if operation.account in selected_accounts
    ]
    history = portfolio_history_snapshot(
        filtered_positions, filtered_operations
    )
    return {
        "accounts": sorted(selected_accounts),
        "history": _history_records(history),
    }


def accounts_excluding_category(
    output_dir: Path, excluded_category: str
) -> list[str]:
    """Return raw account names outside a normalized account category."""
    frame = pd.read_csv(output_dir / "positions.csv", dtype=str).fillna("")
    all_accounts = set(frame["account"].astype(str))
    excluded_accounts = set(
        frame.loc[
            frame["account_category"] == excluded_category, "account"
        ].astype(str)
    )
    return sorted(all_accounts - excluded_accounts)


def _parse_args(argv: list[str] | None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-dir", type=Path, required=True)
    parser.add_argument("--destination", type=Path, required=True)
    parser.add_argument("--exclude-category", required=True)
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> None:
    """Generate a static API-compatible fixture for the public demo."""
    args = _parse_args(argv)
    accounts = accounts_excluding_category(
        args.output_dir, args.exclude_category
    )
    payload = build_filtered_portfolio_history(args.output_dir, accounts)
    args.destination.parent.mkdir(parents=True, exist_ok=True)
    args.destination.write_text(
        json.dumps(payload, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
