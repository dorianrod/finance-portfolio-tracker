"""Tests for build_positions_allocation / build_positions_allocation_by_isin.

The AllocationRepository port (src.ports.allocation_repository) is the
boundary to fake: _FakeAllocationRepository below satisfies it structurally
with an in-memory allocation table, exercising the real matching cascade
(ISIN -> exact normalized name -> "clean" normalized name with ticker
codes/parens stripped) and the snapshot-date gating (>= earliest file
date) exactly as production does.
"""

from datetime import date
from pathlib import Path

import pandas as pd
import pytest

from src.domain.reporting.positions_allocation import (
    build_positions_allocation,
    build_positions_allocation_by_isin,
)

_VALUE_COLS = ["france", "usa"]
_DUMMY_PATH = Path("dummy.xlsx")  # never opened, only the date is used


class _FakeAllocationRepository:
    def __init__(self, file_date: date, tables: dict) -> None:
        self._file_date = file_date
        self._tables = tables

    def file_dates(self) -> list[tuple[date, Path]]:
        return [(self._file_date, _DUMMY_PATH)]

    def load_allocation_tables(self, as_of: date):
        if as_of < self._file_date:
            return None
        return self._tables

    def load_ticker_data(self):
        raise AssertionError("not used by positions_allocation")


def _allocation_table() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "nom_placement": [
                "TestStock A",
                "Global EM UCITS ETF (Acc)",
                "Cash EUR",
            ],
            "id": ["FR1", None, ""],
            "france": [100.0, 0.0, 100.0],
            "usa": [0.0, 100.0, 0.0],
        }
    )


def _repo(file_date: date = date(2024, 1, 1)) -> _FakeAllocationRepository:
    return _FakeAllocationRepository(
        file_date, {"geo": (_allocation_table(), _VALUE_COLS)}
    )


def _positions_df() -> pd.DataFrame:
    snap = date(2024, 2, 29)
    return pd.DataFrame(
        [
            # exact ISIN match
            {
                "snapshot_date": snap,
                "isin": "FR1",
                "name": "TestStock A",
                "total_value": 1000.0,
            },
            # no isin -> exact normalized-name match (case/whitespace only)
            {
                "snapshot_date": snap,
                "isin": "",
                "name": "Global EM UCITS ETF (Acc)",
                "total_value": 500.0,
            },
            # no isin, exact match fails (extra ticker suffix) -> falls
            # back to "clean" name match (parens unwrapped, ticker
            # stripped)
            {
                "snapshot_date": snap,
                "isin": "",
                "name": "GLOBAL EM UCITS ETF (ACC) O4J0",
                "total_value": 300.0,
            },
            # no isin -> exact normalized-name match, different case
            {
                "snapshot_date": snap,
                "isin": "",
                "name": "cash eur",
                "total_value": 200.0,
            },
            # zero value -> skipped even though it would otherwise match
            {
                "snapshot_date": snap,
                "isin": "FR1",
                "name": "TestStock A",
                "total_value": 0.0,
            },
            # before the allocation file's date -> entire row skipped
            {
                "snapshot_date": date(2023, 12, 31),
                "isin": "FR1",
                "name": "TestStock A",
                "total_value": 999.0,
            },
            # no match at all -> skipped
            {
                "snapshot_date": snap,
                "isin": "XX0000000000",
                "name": "Totally Unknown Fund",
                "total_value": 100.0,
            },
        ]
    )


class _NoFilesRepository(_FakeAllocationRepository):
    def file_dates(self):
        return []


def test_build_positions_allocation_empty_when_no_allocation_files():
    repo = _NoFilesRepository(date(2024, 1, 1), {})

    assert build_positions_allocation(_positions_df(), repo) == {}
    assert build_positions_allocation_by_isin(_positions_df(), repo) == {}


def test_build_positions_allocation_empty_when_no_snapshot_after_min_date():
    positions_df = pd.DataFrame(
        [
            {
                "snapshot_date": date(2020, 1, 31),
                "isin": "FR1",
                "name": "TestStock A",
                "total_value": 1000.0,
            }
        ]
    )

    assert build_positions_allocation(positions_df, _repo()) == {}


def test_build_positions_allocation_aggregates_via_matching_cascade():
    result = build_positions_allocation(_positions_df(), _repo())

    geo_df = result["geo"]
    assert geo_df["snapshot_date"].tolist() == ["2024-02-29"]
    assert geo_df["france"].iloc[0] == 1200.0  # 1000 (TestStock) + 200 (Cash)
    assert geo_df["usa"].iloc[0] == 800.0  # 500 + 300 (Global EM, both forms)


def test_build_positions_allocation_by_isin_requires_isin():
    result = build_positions_allocation_by_isin(_positions_df(), _repo())

    geo_df = result["geo"]
    # only the position with both a matching ISIN and total_value > 0
    # survives -- name-matched rows without an isin are excluded here,
    # unlike the aggregated build_positions_allocation
    assert len(geo_df) == 1
    row = geo_df.iloc[0]
    assert row["isin"] == "FR1"
    assert row["name"] == "TestStock A"
    assert row["france"] == 1000.0
    assert row["usa"] == 0.0


def _cash_position(snap: date, label: str, total_value: float) -> dict:
    """A synthetic broker-cash row as PortfolioSnapshotBuilder produces it:
    no isin, name "Cash <label>", account_category "brokerage" -- and no
    matching row in the allocations xlsx (nothing to research, it's cash).
    """
    return {
        "snapshot_date": snap,
        "isin": None,
        "name": f"Cash {label}",
        "account_category": "brokerage",
        "total_value": total_value,
    }


def test_build_positions_allocation_classifies_synthetic_broker_cash():
    """Uninvested brokerage cash has no entry in the allocations xlsx, so
    it must be classified in code instead of dropped -- 100% to whichever
    column _CASH_CATEGORY_TARGET maps "geo" to (here "france", which the
    fake allocation table already defines).
    """
    positions_df = pd.concat(
        [
            _positions_df(),
            pd.DataFrame([_cash_position(date(2024, 2, 29), "CTO", 1377.22)]),
        ],
        ignore_index=True,
    )

    result = build_positions_allocation(positions_df, _repo())

    geo_df = result["geo"]
    assert geo_df["france"].iloc[0] == pytest.approx(1200.0 + 1377.22)
    assert geo_df["usa"].iloc[0] == 800.0


def test_build_positions_allocation_by_isin_includes_synthetic_broker_cash():
    positions_df = pd.concat(
        [
            _positions_df(),
            pd.DataFrame([_cash_position(date(2024, 2, 29), "CTO", 1377.22)]),
        ],
        ignore_index=True,
    )

    result = build_positions_allocation_by_isin(positions_df, _repo())

    geo_df = result["geo"]
    cash_rows = geo_df[geo_df["name"] == "Cash CTO"]
    assert len(cash_rows) == 1
    row = cash_rows.iloc[0]
    # no real isin -> falls back to a stable synthetic key instead of a
    # blank/NaN one that would collide with other no-isin positions
    assert row["isin"] == "NC-Cash CTO"
    assert row["france"] == 1377.22
    assert row["usa"] == 0.0
