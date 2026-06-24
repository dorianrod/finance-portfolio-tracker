from pathlib import Path

import pandas as pd

from src.infrastructure.csv_asset_price_repository import (
    CsvAssetPriceRepository,
)


def _repo(
    tmp_path: Path,
    generated_dir: Path | None = None,
    others_dir: Path | None = None,
    ticker_map_file: Path | None = None,
    ticker_map_error_file: Path | None = None,
) -> CsvAssetPriceRepository:
    return CsvAssetPriceRepository(
        generated_dir=generated_dir or tmp_path / "generated",
        others_dir=others_dir or tmp_path / "others",
        ticker_map_file=ticker_map_file or tmp_path / "ticker_map.csv",
        ticker_map_error_file=(
            ticker_map_error_file or tmp_path / "ticker_map_error.csv"
        ),
    )


_PRICE_HEADER = "isin,ticker,yahoo_symbol,name,price,currency,price_eur,date\n"


def _write_generated_month(
    generated_dir: Path, year: int, month: int, rows: list[str]
) -> None:
    generated_dir.mkdir(parents=True, exist_ok=True)
    (generated_dir / f"{year:04d}-{month:02d}.csv").write_text(
        _PRICE_HEADER + "\n".join(rows) + "\n"
    )


# ---------------------------------------------------------------------------
# existing_months
# ---------------------------------------------------------------------------


def test_existing_months_empty_when_dir_missing(tmp_path: Path):
    repo = _repo(tmp_path)
    assert repo.existing_months() == set()


def test_existing_months_parses_year_month_from_filenames(tmp_path: Path):
    repo = _repo(tmp_path)
    _write_generated_month(
        repo.generated_dir,
        2024,
        1,
        ["FR1,,,Total,100,EUR,100,2024-01-31"],
    )
    _write_generated_month(
        repo.generated_dir,
        2024,
        2,
        ["FR1,,,Total,101,EUR,101,2024-02-29"],
    )
    (repo.generated_dir / "not_a_month.csv").write_text("x\n")

    assert repo.existing_months() == {(2024, 1), (2024, 2)}


# ---------------------------------------------------------------------------
# write_month
# ---------------------------------------------------------------------------


def test_write_month_creates_dir_and_expected_file(tmp_path: Path):
    repo = _repo(tmp_path)
    df = pd.DataFrame({"isin": ["FR1"], "price": [100.0]})

    repo.write_month(2024, 3, df)

    out_file = repo.generated_dir / "2024-03.csv"
    assert out_file.exists()
    pd.testing.assert_frame_equal(pd.read_csv(out_file), df)


# ---------------------------------------------------------------------------
# write_ticker_map_errors
# ---------------------------------------------------------------------------


def test_write_ticker_map_errors_writes_when_nonempty(tmp_path: Path):
    repo = _repo(tmp_path)
    df = pd.DataFrame({"isin": ["XX0000000000"], "reason": ["unresolved"]})

    repo.write_ticker_map_errors(df)

    assert repo.ticker_map_error_file.exists()
    pd.testing.assert_frame_equal(
        pd.read_csv(repo.ticker_map_error_file), df
    )


def test_write_ticker_map_errors_clears_existing_file_when_empty(
    tmp_path: Path,
):
    repo = _repo(tmp_path)
    repo.ticker_map_error_file.write_text("isin,reason\nXX1,bad\n")

    repo.write_ticker_map_errors(pd.DataFrame())

    assert not repo.ticker_map_error_file.exists()


def test_write_ticker_map_errors_noop_when_empty_and_no_file(
    tmp_path: Path,
):
    repo = _repo(tmp_path)

    repo.write_ticker_map_errors(pd.DataFrame())

    assert not repo.ticker_map_error_file.exists()


# ---------------------------------------------------------------------------
# load_ticker_map_errors
# ---------------------------------------------------------------------------


def test_load_ticker_map_errors_empty_when_file_missing(tmp_path: Path):
    repo = _repo(tmp_path)
    assert repo.load_ticker_map_errors().empty


def test_load_ticker_map_errors_fills_missing_values_with_empty_string(
    tmp_path: Path,
):
    repo = _repo(tmp_path)
    repo.ticker_map_error_file.write_text("isin,reason\nXX1,\nXX2,bad\n")

    df = repo.load_ticker_map_errors()

    assert df["reason"].tolist() == ["", "bad"]


# ---------------------------------------------------------------------------
# load_all
# ---------------------------------------------------------------------------


def test_load_all_returns_empty_when_no_sources(tmp_path: Path):
    repo = _repo(tmp_path)
    assert repo.load_all().empty


def test_load_all_concatenates_generated_months_and_coerces_types(
    tmp_path: Path,
):
    repo = _repo(tmp_path)
    _write_generated_month(
        repo.generated_dir,
        2024,
        1,
        ["FR1,,,Total,100,EUR,100,2024-01-31"],
    )
    _write_generated_month(
        repo.generated_dir,
        2024,
        2,
        ["FR1,,,Total,101,EUR,101,2024-02-29"],
    )

    df = repo.load_all()

    assert len(df) == 2
    assert df["price"].tolist() == [100.0, 101.0]
    assert pd.api.types.is_datetime64_any_dtype(df["date"])


def test_load_all_enriches_missing_names_from_ticker_map(tmp_path: Path):
    repo = _repo(tmp_path)
    _write_generated_month(
        repo.generated_dir,
        2024,
        1,
        ["FR1,,,,100,EUR,100,2024-01-31"],
    )
    repo.ticker_map_file.write_text("isin,name\nFR1,Total\n")

    df = repo.load_all()

    assert df.iloc[0]["name"] == "Total"


# ---------------------------------------------------------------------------
# load_manual_price_keys
# ---------------------------------------------------------------------------


def test_load_manual_price_keys_empty_when_others_dir_missing(
    tmp_path: Path,
):
    repo = _repo(tmp_path)

    assert repo.load_manual_price_keys() == set()


def test_load_manual_price_keys_uses_isin_when_present_else_ticker(
    tmp_path: Path,
):
    repo = _repo(tmp_path)
    repo.others_dir.mkdir(parents=True)
    (repo.others_dir / "fund_z.csv").write_text(
        "name,ticker,isin,price,currency,date_from,date_to\n"
        "Fund Z,FUNDZ,,65.0,EUR,2025-11-01,\n"
    )
    (repo.others_dir / "private_equity.csv").write_text(
        "name,ticker,isin,price,currency,date_from,date_to\n"
        "Fund X,,FR9999999999,42.0,USD,2024-01-15,2024-03-10\n"
    )

    assert repo.load_manual_price_keys() == {"FUNDZ", "FR9999999999"}


def test_load_all_includes_others_overrides_expanded_per_month(
    tmp_path: Path,
):
    repo = _repo(tmp_path)
    repo.others_dir.mkdir(parents=True)
    (repo.others_dir / "private_equity.csv").write_text(
        "name,ticker,isin,price,currency,date_from,date_to\n"
        "Fund X,,FR9999999999,42.0,USD,2024-01-15,2024-03-10\n"
    )

    df = repo.load_all()

    assert len(df) == 3
    dates = sorted(df["date"].dt.date.tolist())
    assert dates == [
        pd.Timestamp("2024-01-31").date(),
        pd.Timestamp("2024-02-29").date(),
        pd.Timestamp("2024-03-10").date(),
    ]
    assert (df["price"] == 42.0).all()
    # non-EUR currency -> price_eur left unset
    assert df["price_eur"].isna().all()


def test_load_all_others_defaults_currency_to_eur_and_sets_price_eur(
    tmp_path: Path,
):
    repo = _repo(tmp_path)
    repo.others_dir.mkdir(parents=True)
    # "currency" column absent entirely (not just blank) to trigger the
    # repository's "EUR" default
    (repo.others_dir / "manual.csv").write_text(
        "name,ticker,isin,price,date_from,date_to\n"
        "Fund Y,,FR8888888888,10.0,2024-01-01,2024-01-31\n"
    )

    df = repo.load_all()

    assert len(df) == 1
    assert df.iloc[0]["currency"] == "EUR"
    assert df.iloc[0]["price_eur"] == 10.0


def test_load_all_combines_generated_and_others(tmp_path: Path):
    repo = _repo(tmp_path)
    _write_generated_month(
        repo.generated_dir,
        2024,
        1,
        ["FR1,,,Total,100,EUR,100,2024-01-31"],
    )
    repo.others_dir.mkdir(parents=True)
    (repo.others_dir / "manual.csv").write_text(
        "name,ticker,isin,price,currency,date_from,date_to\n"
        "Fund Y,,FR8888888888,10.0,EUR,2024-01-01,2024-01-31\n"
    )

    df = repo.load_all()

    assert len(df) == 2
    assert set(df["isin"]) == {"FR1", "FR8888888888"}
