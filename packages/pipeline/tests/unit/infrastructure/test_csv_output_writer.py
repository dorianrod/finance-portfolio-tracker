from pathlib import Path

import pandas as pd
import pytest

from src.infrastructure.csv_output_writer import CsvOutputWriter

_SIMPLE_DF_METHODS = [
    ("write_operations", "operations.csv"),
    ("write_positions", "positions.csv"),
    ("write_positions_aggregated", "positions_aggregated.csv"),
    ("write_cash", "cash.csv"),
    ("write_portfolio_history", "portfolio_history.csv"),
    ("write_saving_capacity", "saving_capacity.csv"),
    ("write_saving_capacity_by_account", "saving_capacity_by_account.csv"),
    ("write_accounts", "accounts.csv"),
    ("write_errors", "errors.csv"),
]


def _writer(tmp_path: Path) -> CsvOutputWriter:
    return CsvOutputWriter(output_dir=tmp_path / "out")


@pytest.mark.parametrize("method_name,filename", _SIMPLE_DF_METHODS)
def test_write_methods_create_expected_csv(
    tmp_path: Path, method_name: str, filename: str
):
    writer = _writer(tmp_path)
    df = pd.DataFrame({"a": [1, 2], "b": ["x", "y"]})

    getattr(writer, method_name)(df)

    out_file = writer.output_dir / filename
    assert out_file.exists()
    pd.testing.assert_frame_equal(pd.read_csv(out_file), df)


def test_write_creates_output_dir_when_missing(tmp_path: Path):
    writer = _writer(tmp_path)
    assert not writer.output_dir.exists()

    writer.write_operations(pd.DataFrame({"a": [1]}))

    assert writer.output_dir.is_dir()


def test_write_portfolio_snapshot_wraps_dict_in_single_row_csv(
    tmp_path: Path,
):
    writer = _writer(tmp_path)

    writer.write_portfolio_snapshot(
        {"snapshot_date": "2024-01-31", "total_value": 1000.0}
    )

    df = pd.read_csv(writer.output_dir / "portfolio_snapshot.csv")
    assert len(df) == 1
    assert df.iloc[0]["snapshot_date"] == "2024-01-31"
    assert df.iloc[0]["total_value"] == 1000.0


@pytest.mark.parametrize(
    "category,expected_filename",
    [("geo", "positions_geo.csv"), ("secteur", "positions_secteur.csv")],
)
def test_write_positions_allocation_names_file_by_category(
    tmp_path: Path, category: str, expected_filename: str
):
    writer = _writer(tmp_path)

    writer.write_positions_allocation(category, pd.DataFrame({"a": [1]}))

    assert (writer.output_dir / expected_filename).exists()


@pytest.mark.parametrize(
    "category,expected_filename",
    [
        ("geo", "positions_geo_by_isin.csv"),
        ("classe", "positions_classe_by_isin.csv"),
    ],
)
def test_write_positions_allocation_by_isin_names_file_by_category(
    tmp_path: Path, category: str, expected_filename: str
):
    writer = _writer(tmp_path)

    writer.write_positions_allocation_by_isin(
        category, pd.DataFrame({"a": [1]})
    )

    assert (writer.output_dir / expected_filename).exists()
