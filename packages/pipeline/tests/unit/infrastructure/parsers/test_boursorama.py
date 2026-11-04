from datetime import date, datetime
from pathlib import Path

import pandas as pd
import pytest

from src.domain.errors import DuplicateBrokerOperationsError
from src.domain.models import Operation, OperationType
from src.infrastructure.parsers.boursorama import (
    BoursoramaLoader,
    compute_positions,
    merge_operations,
    parse_operations,
)

_CONSOLIDATED_HEADER = (
    "date_operation,date_valeur,nom_valeur,libelle,isin,quantite,cours,"
    "montant\n"
)
_RAW_HEADER = (
    '"Date opération";"Date valeur";Opération;Valeur;"Code ISIN";Montant;'
    "Quantité;Cours\n"
)


def _write_consolidated(tmp_path: Path, *rows: str) -> Path:
    path = tmp_path / "operations.csv"
    path.write_text(
        _CONSOLIDATED_HEADER + "\n".join(rows) + "\n", encoding="utf-8"
    )
    return path


def _write_raw(tmp_path: Path, *rows: str) -> Path:
    path = tmp_path / "export.csv"
    path.write_text(_RAW_HEADER + "\n".join(rows) + "\n", encoding="utf-8")
    return path


# ---------------------------------------------------------------------------
# parse_operations
# ---------------------------------------------------------------------------


def test_parse_operations_detects_consolidated_format(tmp_path: Path):
    path = _write_consolidated(
        tmp_path,
        "15/01/2024,15/01/2024,TestStock,ACHAT,FR1,10,50.5,-505.0",
    )

    ops = parse_operations(path, account="test_account_a")

    assert len(ops) == 1
    op = ops[0]
    assert op.date == datetime(2024, 1, 15)
    assert op.account == "test_account_a"
    assert op.isin == "FR1"
    assert op.name == "TestStock"
    assert op.operation_type == OperationType.BUY
    assert op.quantity == 10.0
    assert op.price_per_unit == 50.5
    assert op.total_amount == -505.0
    assert op.currency == "EUR"
    assert op.ticker is None


def test_parse_operations_detects_raw_export_format(tmp_path: Path):
    path = _write_raw(
        tmp_path,
        '"15/01/2024";"15/01/2024";VENTE;TestStock;"FR1";505,00;10;'
        '"50,50 €"',
    )

    ops = parse_operations(path, account="test_account_b")

    assert len(ops) == 1
    op = ops[0]
    assert op.operation_type == OperationType.SELL
    assert op.total_amount == 505.0
    assert op.quantity == 10.0
    assert op.price_per_unit == 50.5
    assert op.isin == "FR1"


def test_parse_operations_blank_fields_become_none(tmp_path: Path):
    path = _write_consolidated(
        tmp_path, "01/02/2024,01/02/2024,,VIR,,,,1000.0"
    )

    ops = parse_operations(path, account="a")

    op = ops[0]
    assert op.isin is None
    assert op.name is None
    # blank "quantite" parses as float("nan"), not None -- nan != 0.0 is
    # always True, so the zero-check in the source doesn't catch it
    assert op.quantity is not None and pd.isna(op.quantity)
    assert op.price_per_unit is None
    assert op.operation_type == OperationType.DEPOSIT


def test_parse_operations_unknown_label_defaults_to_deposit(tmp_path: Path):
    path = _write_consolidated(
        tmp_path, "01/02/2024,01/02/2024,,SOME_UNKNOWN_LABEL,,,,100.0"
    )

    ops = parse_operations(path, account="a")

    assert ops[0].operation_type == OperationType.DEPOSIT


# ---------------------------------------------------------------------------
# compute_positions
# ---------------------------------------------------------------------------


def test_compute_positions_uses_price_lookup_when_available():
    ops = [
        Operation(
            date=datetime(2024, 1, 10),
            account="a",
            isin="FR1",
            name="TestStock",
            operation_type=OperationType.BUY,
            quantity=10.0,
            price_per_unit=100.0,
            total_amount=-1000.0,
        ),
    ]
    asset_prices = pd.DataFrame(
        {
            "isin": ["FR1"],
            "price": [120.0],
            "price_eur": [120.0],
            "currency": ["EUR"],
            "name": ["TestStock Updated"],
            "date": pd.to_datetime(["2024-01-31"]),
        }
    )

    positions = compute_positions(
        ops,
        account="a",
        asset_prices=asset_prices,
        snapshot_dates=[date(2024, 1, 31)],
    )

    assert len(positions) == 1
    pos = positions[0]
    assert pos.last_price == 120.0
    assert pos.name == "TestStock Updated"


def test_compute_positions_falls_back_to_avg_buy_price_without_match():
    ops = [
        Operation(
            date=datetime(2024, 1, 10),
            account="a",
            isin="FR1",
            name="TestStock",
            operation_type=OperationType.BUY,
            quantity=10.0,
            price_per_unit=100.0,
            total_amount=-1000.0,
        ),
    ]

    positions = compute_positions(
        ops,
        account="a",
        asset_prices=pd.DataFrame(),
        snapshot_dates=[date(2024, 2, 29)],
    )

    pos = positions[0]
    assert pos.last_price == pos.avg_buy_price == 100.0
    # no price row -> name falls back to data carried from the BUY op
    assert pos.name == "TestStock"


def test_compute_positions_filters_out_fully_closed_positions():
    ops = [
        Operation(
            date=datetime(2024, 1, 10),
            account="a",
            isin="FR1",
            operation_type=OperationType.BUY,
            quantity=10.0,
            price_per_unit=100.0,
            total_amount=-1000.0,
        ),
        Operation(
            date=datetime(2024, 1, 20),
            account="a",
            isin="FR1",
            operation_type=OperationType.SELL,
            quantity=10.0,
            price_per_unit=110.0,
            total_amount=1100.0,
        ),
    ]

    positions = compute_positions(
        ops, account="a", snapshot_dates=[date(2024, 1, 31)]
    )

    assert positions == []


# ---------------------------------------------------------------------------
# BoursoramaLoader
# ---------------------------------------------------------------------------


def test_boursorama_loader_label_is_the_account():
    loader = BoursoramaLoader(filepaths=[], account="test_account_a")
    assert loader.label == "test_account_a"


def test_boursorama_loader_merges_multiple_files_before_replaying(
    tmp_path: Path,
):
    file1 = tmp_path / "operations1.csv"
    file1.write_text(
        _CONSOLIDATED_HEADER
        + "10/01/2024,10/01/2024,TestStock,ACHAT,FR1,10,100.0,-1000.0\n",
        encoding="utf-8",
    )
    file2 = tmp_path / "operations2.csv"
    file2.write_text(
        _CONSOLIDATED_HEADER
        + "20/01/2024,20/01/2024,TestStock,VENTE,FR1,4,110.0,440.0\n",
        encoding="utf-8",
    )

    loader = BoursoramaLoader(
        filepaths=[file1, file2], account="test_account_a"
    )
    operations, positions = loader.load(
        ticker_map={}, asset_prices=pd.DataFrame()
    )

    assert len(operations) == 2
    jan31 = next(p for p in positions if p.snapshot_date == date(2024, 1, 31))
    # replay combines both files -> 10 bought, 4 sold = 6 remaining
    assert jan31.quantity == 6.0


def test_overlapping_exports_block_cash_trades_and_dividends(
    tmp_path: Path,
):
    rows = [
        "01/01/2024,01/01/2024,,VIR,,,,1000",
        "10/01/2024,10/01/2024,Stock,ACHAT,FR1,10,50,-500",
        "20/01/2024,20/01/2024,Stock,COUPONS,FR1,10,,20",
        "25/01/2024,25/01/2024,,VIR,,,,-200",
    ]
    first = _write_consolidated(tmp_path, *rows)
    overlap = tmp_path / "overlap.csv"
    overlap.write_text(first.read_text(), encoding="utf-8")
    loader = BoursoramaLoader(
        [first, overlap], account="broker", as_of=date(2024, 1, 31)
    )

    with pytest.raises(DuplicateBrokerOperationsError) as error:
        loader.load({}, pd.DataFrame())
    assert "operations.csv" in str(error.value)
    assert "overlap.csv" in str(error.value)
    assert "-200 EUR" in str(error.value)
    assert "4 repeated operation(s)" in str(error.value)


def test_merge_preserves_identical_trades_within_a_single_export(
    tmp_path: Path,
):
    row = "10/01/2024,10/01/2024,Stock,ACHAT,FR1,10,50,-500"
    first = _write_consolidated(tmp_path, row)
    overlap = tmp_path / "overlap.csv"
    overlap.write_text(_CONSOLIDATED_HEADER + f"{row}\n{row}\n")

    operations = merge_operations([overlap], account="broker")
    assert len(operations) == 2
    assert sum(op.quantity or 0 for op in operations) == 20
    for paths in ([first, overlap], [overlap, first]):
        with pytest.raises(DuplicateBrokerOperationsError):
            merge_operations(paths, account="broker")


def test_merge_matches_raw_and_consolidated_missing_quantities(
    tmp_path: Path,
):
    consolidated = _write_consolidated(
        tmp_path, "01/01/2024,01/01/2024,,VIR,,,,1000"
    )
    raw = _write_raw(
        tmp_path, '01/01/2024;01/01/2024;VIR;;;1000;0;"0,0000 €"'
    )

    with pytest.raises(DuplicateBrokerOperationsError):
        merge_operations([consolidated, raw], "broker")
