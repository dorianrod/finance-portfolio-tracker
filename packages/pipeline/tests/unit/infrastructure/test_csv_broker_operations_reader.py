from pathlib import Path

from src.infrastructure.csv_broker_operations_reader import (
    CsvBrokerOperationsReader,
)

_BOURSORAMA_HEADER = (
    "date_operation,date_valeur,nom_valeur,libelle,isin,quantite,cours,"
    "montant\n"
)
_REVOLUT_HEADER = (
    "Date,Ticker,Type,Quantity,Price per share,Currency,Total Amount\n"
)


def _write_boursorama_pea(input_dir: Path, isin: str = "FR1") -> None:
    path = input_dir / "brokers/boursorama/PEA/operations.csv"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        _BOURSORAMA_HEADER
        + f"01/01/2024,01/01/2024,TestStock,ACHAT,{isin},10,50.0,-500.0\n"
    )


def _write_boursorama_cto(input_dir: Path, isin: str = "US0378331005") -> None:
    path = input_dir / "brokers/boursorama/CTO/operations.csv"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        _BOURSORAMA_HEADER
        + f"02/01/2024,02/01/2024,Apple,ACHAT,{isin},5,100.0,-500.0\n"
    )


def _write_revolut(input_dir: Path, ticker: str = "AAPL") -> None:
    path = (
        input_dir
        / "brokers/revolut/trading-account-statement_2024.csv"
    )
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        _REVOLUT_HEADER
        + f"2024-01-05T00:00:00Z,{ticker},BUY - MARKET,1,USD 150,USD,"
        "USD 150\n"
    )


_DIRECT_HEADER = (
    "date,account,isin,ticker,name,operation_type,quantity,"
    "price_per_unit,total_amount,currency\n"
)
_VALUATIONS_HEADER = "date,account,isin,ticker,name,value,invested,currency\n"


def _write_direct(input_dir: Path, ticker: str = "AAPL") -> None:
    path = input_dir / "brokers/direct/example.csv"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        _DIRECT_HEADER
        + f"2024-01-10,bourse,,{ticker},Apple Inc.,BUY,1,150,150,USD\n"
    )


def _write_valuations(input_dir: Path) -> None:
    path = input_dir / "brokers/valuations/example.csv"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        _VALUATIONS_HEADER
        + "2024-01-10,insurer,,,PER Insurer,1000,1000,EUR\n"
    )


def test_read_all_returns_empty_when_no_files_present(tmp_path: Path):
    reader = CsvBrokerOperationsReader(input_dir=tmp_path)
    assert reader.read_all() == []


def test_read_all_parses_boursorama_pea_and_cto(tmp_path: Path):
    _write_boursorama_pea(tmp_path)
    _write_boursorama_cto(tmp_path)
    reader = CsvBrokerOperationsReader(input_dir=tmp_path)

    ops = reader.read_all()

    assert [op.account for op in ops] == [
        "boursorama_pea",
        "boursorama_cto",
    ]
    assert ops[0].isin == "FR1"
    assert ops[1].isin == "US0378331005"


def test_read_all_skips_missing_boursorama_accounts(tmp_path: Path):
    _write_boursorama_pea(tmp_path)
    reader = CsvBrokerOperationsReader(input_dir=tmp_path)

    ops = reader.read_all()

    assert [op.account for op in ops] == ["boursorama_pea"]


def test_read_all_parses_revolut_when_present(tmp_path: Path):
    _write_revolut(tmp_path)
    reader = CsvBrokerOperationsReader(input_dir=tmp_path)

    ops = reader.read_all()

    assert len(ops) == 1
    op = ops[0]
    assert op.account == "revolut"
    assert op.ticker == "AAPL"
    # BUY operations are forced negative regardless of the source sign
    assert op.total_amount == -150.0


def test_read_all_skips_revolut_when_no_matching_file(tmp_path: Path):
    reader = CsvBrokerOperationsReader(input_dir=tmp_path)
    assert reader.read_all() == []


def test_read_all_combines_boursorama_and_revolut_in_order(tmp_path: Path):
    _write_boursorama_pea(tmp_path)
    _write_boursorama_cto(tmp_path)
    _write_revolut(tmp_path)
    reader = CsvBrokerOperationsReader(input_dir=tmp_path)

    ops = reader.read_all()

    assert [op.account for op in ops] == [
        "boursorama_pea",
        "boursorama_cto",
        "revolut",
    ]


def test_read_all_parses_direct_when_present(tmp_path: Path):
    _write_direct(tmp_path)
    reader = CsvBrokerOperationsReader(input_dir=tmp_path)

    ops = reader.read_all()

    assert len(ops) == 1
    assert ops[0].account == "bourse"
    assert ops[0].ticker == "AAPL"


def test_read_all_parses_valuations_when_present(tmp_path: Path):
    _write_valuations(tmp_path)
    reader = CsvBrokerOperationsReader(input_dir=tmp_path)

    ops = reader.read_all()

    assert len(ops) == 1
    assert ops[0].account == "insurer"
    assert ops[0].isin is None
    assert ops[0].ticker is None


def test_read_all_skips_missing_direct_and_valuations_dirs(tmp_path: Path):
    reader = CsvBrokerOperationsReader(input_dir=tmp_path)
    assert reader.read_all() == []


def test_read_all_parses_direct_and_valuations_in_subfolders(
    tmp_path: Path,
):
    direct_path = tmp_path / "brokers/direct/per-account/history.csv"
    direct_path.parent.mkdir(parents=True, exist_ok=True)
    direct_path.write_text(
        _DIRECT_HEADER
        + "2024-01-10,bourse,,AAPL,Apple Inc.,BUY,1,150,150,USD\n"
    )
    val_path = tmp_path / "brokers/valuations/assurance/2026-06-01.csv"
    val_path.parent.mkdir(parents=True, exist_ok=True)
    val_path.write_text(
        _VALUATIONS_HEADER + "2024-01-10,insurer,,,PER Insurer,1000,1000,EUR\n"
    )
    reader = CsvBrokerOperationsReader(input_dir=tmp_path)

    ops = reader.read_all()

    assert [op.account for op in ops] == ["bourse", "insurer"]
