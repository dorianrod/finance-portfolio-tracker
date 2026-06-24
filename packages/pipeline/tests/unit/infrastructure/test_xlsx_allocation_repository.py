from datetime import date
from pathlib import Path

import pandas as pd

from src.infrastructure.xlsx_allocation_repository import (
    XlsxAllocationRepository,
)

# Mirrors the column layout documented in xlsx_allocation_repository.py:
# col0/1 = nom_placement/id, then geo/secteur/currency/classe value blocks,
# then optional yahoo_symbol/currency/ticker meta columns searched by label.
_GEO_COLS = [
    "france",
    "europe",
    "usa",
    "japon",
    "royaume_uni",
    "suisse",
    "canada",
    "emergents",
    "autre",
    "nc",
]
_SECTEUR_COLS = [
    "techno",
    "sante",
    "fin_sec",
    "industrie",
    "conso_disc",
    "conso_base",
    "energie",
    "materiaux",
    "telecom",
    "pub_services",
    "immo_sec",
    "utilities",
    "autre",
    "nc",
]
_CURRENCY_COLS = ["EUR", "USD", "GBP", "autre"]
_CLASSE_COLS = [
    "actions",
    "obligations",
    "immobilier",
    "mat_premieres",
    "cash",
    "private_equity",
    "crypto",
    "autre",
    "nc",
]
_HEADERS = [
    "nom_placement",
    "id",
    *_GEO_COLS,
    *_SECTEUR_COLS,
    *_CURRENCY_COLS,
    *_CLASSE_COLS,
    "yahoo_symbol",
    "currency",
    "ticker",
]


def _values(cols: list[str], overrides: dict[str, float]) -> list[float]:
    return [overrides.get(c, 0) for c in cols]


def _row(
    nom_placement: str,
    isin: str,
    geo: dict[str, float] | None = None,
    secteur: dict[str, float] | None = None,
    currency: dict[str, float] | None = None,
    classe: dict[str, float] | None = None,
    yahoo_symbol: str = "",
    currency_meta: str = "",
    ticker: str = "",
) -> list:
    return [
        nom_placement,
        isin,
        *_values(_GEO_COLS, geo or {}),
        *_values(_SECTEUR_COLS, secteur or {}),
        *_values(_CURRENCY_COLS, currency or {}),
        *_values(_CLASSE_COLS, classe or {}),
        yahoo_symbol,
        currency_meta,
        ticker,
    ]


def _write_xlsx(path: Path, rows: list[list]) -> None:
    table = [[""] * len(_HEADERS), _HEADERS, *rows]
    pd.DataFrame(table).to_excel(path, header=False, index=False)


# ---------------------------------------------------------------------------
# file_dates
# ---------------------------------------------------------------------------


def test_file_dates_empty_when_dir_missing(tmp_path: Path):
    repo = XlsxAllocationRepository(allocations_dir=tmp_path / "missing")
    assert repo.file_dates() == []


def test_file_dates_parses_valid_filenames_and_ignores_invalid(
    tmp_path: Path,
):
    allocations_dir = tmp_path / "allocations"
    allocations_dir.mkdir()
    _write_xlsx(allocations_dir / "2024-03-01.xlsx", [_row("A", "FR1")])
    _write_xlsx(allocations_dir / "2024-01-15.xlsx", [_row("A", "FR1")])
    # matches the glob shape but isn't a real date -> silently skipped
    (allocations_dir / "9999-99-99.xlsx").write_text("not a real workbook")

    repo = XlsxAllocationRepository(allocations_dir=allocations_dir)
    dates = repo.file_dates()

    assert [d for d, _ in dates] == [date(2024, 1, 15), date(2024, 3, 1)]


# ---------------------------------------------------------------------------
# load_ticker_data
# ---------------------------------------------------------------------------


def test_load_ticker_data_empty_when_no_files(tmp_path: Path):
    repo = XlsxAllocationRepository(allocations_dir=tmp_path)
    assert repo.load_ticker_data() == {}


def test_load_ticker_data_extracts_keys_from_latest_file(tmp_path: Path):
    allocations_dir = tmp_path
    rows = [
        # isin + explicit yahoo_symbol override
        _row(
            "TestStock A",
            "FR1",
            yahoo_symbol="TSA.PA",
            currency_meta="EUR",
        ),
        # isin only -> yahoo_symbol falls back to isin
        _row("TestStock B", "FR2", currency_meta="EUR"),
        # isin + revolut ticker different from isin -> two entries
        _row(
            "Apple Inc",
            "US0378331005",
            ticker="AAPL",
            currency_meta="USD",
        ),
        # ticker only, no isin (e.g. crypto)
        _row(
            "Bitcoin",
            "",
            ticker="BTC",
            yahoo_symbol="BTC-USD",
            currency_meta="USD",
        ),
        # neither isin nor ticker -> skipped entirely
        _row("Unknown", ""),
    ]
    _write_xlsx(allocations_dir / "2024-01-01.xlsx", rows)

    repo = XlsxAllocationRepository(allocations_dir=allocations_dir)
    result = repo.load_ticker_data()

    assert result["FR1"] == {
        "key": "FR1",
        "isin": "FR1",
        "yahoo_symbol": "TSA.PA",
        "name": "TestStock A",
        "currency": "EUR",
    }
    assert result["FR2"]["yahoo_symbol"] == "FR2"

    assert result["US0378331005"]["name"] == "Apple Inc"
    assert result["AAPL"] == {
        "key": "AAPL",
        "isin": "US0378331005",
        "yahoo_symbol": "US0378331005",
        "name": "Apple Inc",
        "currency": "USD",
    }

    assert result["BTC"] == {
        "key": "BTC",
        "isin": "",
        "yahoo_symbol": "BTC-USD",
        "name": "Bitcoin",
        "currency": "USD",
    }

    assert all(v["name"] != "Unknown" for v in result.values())


def test_load_ticker_data_uses_most_recent_file(tmp_path: Path):
    _write_xlsx(
        tmp_path / "2024-01-01.xlsx", [_row("Old Name", "FR1")]
    )
    _write_xlsx(
        tmp_path / "2024-06-01.xlsx", [_row("New Name", "FR1")]
    )

    repo = XlsxAllocationRepository(allocations_dir=tmp_path)
    result = repo.load_ticker_data()

    assert result["FR1"]["name"] == "New Name"


# ---------------------------------------------------------------------------
# load_allocation_tables
# ---------------------------------------------------------------------------


def test_load_allocation_tables_none_when_no_applicable_file(
    tmp_path: Path,
):
    _write_xlsx(tmp_path / "2024-06-01.xlsx", [_row("A", "FR1")])
    repo = XlsxAllocationRepository(allocations_dir=tmp_path)

    assert repo.load_allocation_tables(date(2024, 1, 1)) is None


def test_load_allocation_tables_selects_latest_applicable_file(
    tmp_path: Path,
):
    _write_xlsx(
        tmp_path / "2024-01-01.xlsx", [_row("January Version", "FR1")]
    )
    _write_xlsx(tmp_path / "2024-06-01.xlsx", [_row("June Version", "FR1")])
    repo = XlsxAllocationRepository(allocations_dir=tmp_path)

    tables_march = repo.load_allocation_tables(date(2024, 3, 1))
    assert tables_march is not None
    geo_df, _ = tables_march["geo"]
    assert geo_df["nom_placement"].tolist() == ["January Version"]

    tables_december = repo.load_allocation_tables(date(2024, 12, 31))
    assert tables_december is not None
    geo_df, _ = tables_december["geo"]
    assert geo_df["nom_placement"].tolist() == ["June Version"]


def test_load_allocation_tables_fills_autre_and_filters_dirty_rows_per_category(  # noqa: E501
    tmp_path: Path,
):
    rows = [
        _row(
            "TestStock A",
            "FR1",
            geo={"france": 40, "europe": 20},
            secteur={"energie": 70},
            currency={"EUR": 100},
            classe={"actions": 100},
        ),
        _row(
            "Apple",
            "US0378331005",
            geo={"usa": 100},
            secteur={"techno": 100},
            currency={"USD": 100},
            classe={"actions": 100},
        ),
        # geo allocation sums to 120% -> excluded from "geo" only
        _row(
            "DirtyGeo",
            "FR9999999999",
            geo={"france": 60, "europe": 60},
            secteur={"techno": 50},
            currency={"EUR": 100},
            classe={"actions": 50},
        ),
    ]
    _write_xlsx(tmp_path / "2024-01-01.xlsx", rows)
    repo = XlsxAllocationRepository(allocations_dir=tmp_path)

    tables = repo.load_allocation_tables(date(2024, 6, 1))
    assert tables is not None

    geo_df, _ = tables["geo"]
    assert sorted(geo_df["nom_placement"]) == ["Apple", "TestStock A"]
    total_geo = geo_df[geo_df["nom_placement"] == "TestStock A"].iloc[0]
    assert total_geo["autre"] == 40.0
    assert total_geo["nc"] == 0.0

    secteur_df, _ = tables["secteur"]
    assert sorted(secteur_df["nom_placement"]) == [
        "Apple",
        "DirtyGeo",
        "TestStock A",
    ]
    dirty_secteur = secteur_df[secteur_df["nom_placement"] == "DirtyGeo"].iloc[
        0
    ]
    assert dirty_secteur["autre"] == 50.0

    currency_df, currency_cols = tables["currency"]
    assert "Autre" in currency_cols
    is_test_a = currency_df["nom_placement"] == "TestStock A"
    total_currency = currency_df[is_test_a].iloc[0]
    assert total_currency["Autre"] == 0.0

    classe_df, _ = tables["classe"]
    is_test_a = classe_df["nom_placement"] == "TestStock A"
    total_classe = classe_df[is_test_a].iloc[0]
    assert total_classe["autre"] == 0.0


def test_load_allocation_tables_caches_parsed_file(tmp_path: Path):
    _write_xlsx(tmp_path / "2024-01-01.xlsx", [_row("TestStock A", "FR1")])
    repo = XlsxAllocationRepository(allocations_dir=tmp_path)

    first = repo.load_allocation_tables(date(2024, 6, 1))
    second = repo.load_allocation_tables(date(2024, 6, 1))

    assert first is second
