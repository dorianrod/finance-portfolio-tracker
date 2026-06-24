from pathlib import Path

from src.infrastructure.csv_account_groups_repository import (
    CsvAccountGroupsRepository,
)


def _repo(path: Path) -> CsvAccountGroupsRepository:
    return CsvAccountGroupsRepository(account_groups_file=path)


def test_load_type_map_returns_empty_when_file_missing(tmp_path: Path):
    repo = _repo(tmp_path / "missing.csv")
    assert repo.load_type_map() == {}


def test_load_label_map_returns_empty_when_file_missing(tmp_path: Path):
    repo = _repo(tmp_path / "missing.csv")
    assert repo.load_label_map() == {}


def test_load_accounts_table_returns_none_when_file_missing(tmp_path: Path):
    repo = _repo(tmp_path / "missing.csv")
    assert repo.load_accounts_table() is None


def test_load_category_map_returns_empty_when_file_missing(tmp_path: Path):
    repo = _repo(tmp_path / "missing.csv")
    assert repo.load_category_map() == {}


def test_load_type_map_strips_whitespace_from_headers_and_values(
    tmp_path: Path,
):
    csv_file = tmp_path / "account_groups.csv"
    csv_file.write_text(
        " account , type , label \n"
        " brokerage_account , Bourse , PEA \n"
        " livret_a , Epargne , Livret A \n"
    )
    repo = _repo(csv_file)

    assert repo.load_type_map() == {
        "brokerage_account": "Bourse",
        "livret_a": "Epargne",
    }


def test_load_label_map_strips_whitespace_from_headers_and_values(
    tmp_path: Path,
):
    csv_file = tmp_path / "account_groups.csv"
    csv_file.write_text(
        " account , type , label \n"
        " brokerage_account , Bourse , PEA \n"
    )
    repo = _repo(csv_file)

    assert repo.load_label_map() == {"brokerage_account": "PEA"}


def test_load_type_map_returns_empty_when_type_column_missing(
    tmp_path: Path,
):
    csv_file = tmp_path / "account_groups.csv"
    csv_file.write_text("account,label\nbrokerage_account,PEA\n")
    repo = _repo(csv_file)

    assert repo.load_type_map() == {}
    assert repo.load_label_map() == {"brokerage_account": "PEA"}


def test_load_label_map_returns_empty_when_label_column_missing(
    tmp_path: Path,
):
    csv_file = tmp_path / "account_groups.csv"
    csv_file.write_text("account,type\nbrokerage_account,Bourse\n")
    repo = _repo(csv_file)

    assert repo.load_label_map() == {}
    assert repo.load_type_map() == {"brokerage_account": "Bourse"}


def test_load_category_map_strips_whitespace_from_headers_and_values(
    tmp_path: Path,
):
    csv_file = tmp_path / "account_groups.csv"
    csv_file.write_text(
        " account , type , category , label \n"
        " brokerage_account , Bourse , brokerage , PEA \n"
        " livret_a , Epargne , savings , Livret A \n"
    )
    repo = _repo(csv_file)

    assert repo.load_category_map() == {
        "brokerage_account": "brokerage",
        "livret_a": "savings",
    }


def test_load_category_map_returns_empty_when_category_column_missing(
    tmp_path: Path,
):
    csv_file = tmp_path / "account_groups.csv"
    csv_file.write_text(
        "account,type,label\nbrokerage_account,Bourse,PEA\n"
    )
    repo = _repo(csv_file)

    assert repo.load_category_map() == {}


def test_load_accounts_table_returns_account_and_label_columns(
    tmp_path: Path,
):
    csv_file = tmp_path / "account_groups.csv"
    csv_file.write_text(
        "account,type,label\n"
        "brokerage_account,Bourse,PEA\n"
        "livret_a,Epargne,Livret A\n"
    )
    repo = _repo(csv_file)

    table = repo.load_accounts_table()

    assert table is not None
    assert list(table.columns) == ["account", "label"]
    assert table["account"].tolist() == ["brokerage_account", "livret_a"]
    assert table["label"].tolist() == ["PEA", "Livret A"]
