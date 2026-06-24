"""Tests FetchPricesUseCase's symbol resolution without any network access.

The MarketDataClient port (src.ports.market_data) is the boundary to mock:
FakeMarketDataClient below satisfies it structurally (Protocol = duck
typing) with in-memory data, so _resolve_symbols can be exercised exactly
as it runs in production, minus the actual yfinance calls.
"""

from datetime import date, datetime

import pandas as pd

from src.application.fetch_prices import FetchPricesUseCase
from src.domain.errors import ErrorCollector
from src.domain.models import Operation, OperationType
from src.infrastructure.csv_asset_price_repository import (
    CsvAssetPriceRepository,
)


class FakeMarketDataClient:
    def __init__(
        self, known_symbols: set[str], currencies: dict[str, str]
    ) -> None:
        self._known_symbols = known_symbols
        self._currencies = currencies
        self.probed: list[str] = []

    def probe_symbol(self, key: str) -> bool:
        self.probed.append(key)
        return key in self._known_symbols

    def fetch_currency(self, yahoo_symbol: str) -> str:
        return self._currencies.get(yahoo_symbol, "")

    def download_close_prices(self, yahoo_symbols, start: date):
        raise AssertionError("not used by _resolve_symbols")

    def download_fx_rates(self, currencies, start: date):
        raise AssertionError("not used by _resolve_symbols")


def _use_case(market_data) -> FetchPricesUseCase:
    # None stands in for the ports _resolve_symbols doesn't touch; the
    # real protocols aren't satisfiable by None, hence the ignores below.
    return FetchPricesUseCase(
        broker_operations=None,  # pyright: ignore[reportArgumentType]
        asset_price_repo=None,  # pyright: ignore[reportArgumentType]
        market_data=market_data,
        allocation_repo=None,  # pyright: ignore[reportArgumentType]
        output_writer=None,  # pyright: ignore[reportArgumentType]
        confirm_current_month_refetch=lambda d: False,
    )


def test_resolve_symbols_prefers_ticker_map_entry():
    assets = {
        "FR1": {"isin": "FR1", "ticker": "", "name": "TestStock A"}
    }
    ticker_map = {
        "FR1": {
            "isin": "FR1",
            "yahoo_symbol": "TSA.PA",
            "name": "TestStock A Updated",
            "currency": "EUR",
        }
    }
    market_data = FakeMarketDataClient(known_symbols=set(), currencies={})

    sym_to_asset, unresolved = _use_case(market_data)._resolve_symbols(
        assets, ticker_map
    )

    assert not unresolved
    assert "TSA.PA" in sym_to_asset
    assert sym_to_asset["TSA.PA"]["currency"] == "EUR"
    assert sym_to_asset["TSA.PA"]["name"] == "TestStock A Updated"
    # ticker_map hit means no network probe needed
    assert market_data.probed == []


def test_resolve_symbols_falls_back_to_direct_probe():
    assets = {"AAPL": {"isin": "", "ticker": "AAPL", "name": ""}}
    market_data = FakeMarketDataClient(
        known_symbols={"AAPL"}, currencies={"AAPL": "USD"}
    )

    sym_to_asset, unresolved = _use_case(market_data)._resolve_symbols(
        assets, {}
    )

    assert not unresolved
    assert sym_to_asset["AAPL"]["currency"] == "USD"
    assert market_data.probed == ["AAPL"]


def test_resolve_symbols_reports_unresolved_assets():
    assets = {
        "XX0000000000": {
            "isin": "XX0000000000",
            "ticker": "",
            "name": "Unknown",
        }
    }
    market_data = FakeMarketDataClient(known_symbols=set(), currencies={})

    sym_to_asset, unresolved = _use_case(market_data)._resolve_symbols(
        assets, {}
    )

    assert sym_to_asset == {}
    assert unresolved == [
        {
            "key": "XX0000000000",
            "isin": "XX0000000000",
            "ticker": "",
            "name": "Unknown",
        }
    ]


class _FakeBrokerOperationsReader:
    def __init__(self, operations: list[Operation]) -> None:
        self._operations = operations

    def read_all(self) -> list[Operation]:
        return self._operations


class _FakeAllocationRepo:
    def load_ticker_data(self) -> dict:
        return {}


class _FakeOutputWriter:
    def __init__(self) -> None:
        self.errors: pd.DataFrame | None = None

    def write_errors(self, df: pd.DataFrame) -> None:
        self.errors = df


def _private_equity_buy() -> Operation:
    return Operation(
        date=datetime(2025, 11, 5),
        account="pe_custodian",
        ticker="FUNDZ",
        name="Fund Z",
        operation_type=OperationType.BUY,
        quantity=10,
        price_per_unit=65.0,
        total_amount=-650.0,
        currency="EUR",
    )


def test_execute_skips_yahoo_resolution_for_manually_priced_assets(
    tmp_path,
):
    """An asset manually priced under others/ (e.g. private equity) must
    never be probed on Yahoo nor reported as an unresolved ticker — a
    manual override exists precisely because Yahoo doesn't know it.
    """
    repo = CsvAssetPriceRepository(
        generated_dir=tmp_path / "generated",
        others_dir=tmp_path / "others",
        ticker_map_file=tmp_path / "ticker_map.csv",
        ticker_map_error_file=tmp_path / "ticker_map_error.csv",
    )
    repo.others_dir.mkdir(parents=True)
    (repo.others_dir / "fund_z.csv").write_text(
        "name,ticker,isin,price,currency,date_from,date_to\n"
        "Fund Z,FUNDZ,,65.0,EUR,2025-11-01,\n"
    )

    market_data = FakeMarketDataClient(known_symbols=set(), currencies={})
    output_writer = _FakeOutputWriter()

    use_case = FetchPricesUseCase(
        broker_operations=_FakeBrokerOperationsReader([_private_equity_buy()]),
        asset_price_repo=repo,
        market_data=market_data,
        # Both fakes only implement the methods this manual-pricing code
        # path actually calls, not the full protocol — hence the ignores.
        allocation_repo=_FakeAllocationRepo(),  # pyright: ignore[reportArgumentType]
        output_writer=output_writer,  # pyright: ignore[reportArgumentType]
        confirm_current_month_refetch=lambda d: False,
    )

    use_case.execute()

    assert market_data.probed == []
    assert repo.load_ticker_map_errors().empty


def test_write_monthly_price_files_keeps_existing_price_on_partial_failure(
    tmp_path,
):
    """A refetch (e.g. of the current month) must never lose data: Yahoo's
    batch download can return data for only some symbols in one call
    (rate limiting), so a symbol missing from the *new* fetch should keep
    its previously-fetched price rather than being dropped.
    """
    repo = CsvAssetPriceRepository(
        generated_dir=tmp_path / "generated",
        others_dir=tmp_path / "others",
        ticker_map_file=tmp_path / "ticker_map.csv",
        ticker_map_error_file=tmp_path / "ticker_map_error.csv",
    )
    repo.write_month(
        2026,
        6,
        pd.DataFrame(
            [
                {
                    "isin": "FR000A",
                    "ticker": "",
                    "yahoo_symbol": "A.PA",
                    "name": "Asset A",
                    "price": 10.0,
                    "currency": "EUR",
                    "price_eur": 10.0,
                    "date": "2026-06-15",
                },
                {
                    "isin": "FR000B",
                    "ticker": "",
                    "yahoo_symbol": "B.PA",
                    "name": "Asset B",
                    "price": 20.0,
                    "currency": "EUR",
                    "price_eur": 20.0,
                    "date": "2026-06-15",
                },
            ]
        ),
    )

    use_case = _use_case(None)
    use_case.asset_price_repo = repo
    close = pd.DataFrame(
        {"A.PA": [11.0], "B.PA": [float("nan")]},
        index=pd.to_datetime(["2026-06-20"]),
    )
    sym_to_asset = {
        "A.PA": {"isin": "FR000A", "ticker": "", "name": "Asset A",
                 "currency": "EUR"},
        "B.PA": {"isin": "FR000B", "ticker": "", "name": "Asset B",
                 "currency": "EUR"},
    }
    collector = ErrorCollector()

    use_case._write_monthly_price_files(
        missing=[date(2026, 6, 30)],
        yahoo_symbols=["A.PA", "B.PA"],
        close=close,
        fx_rates={},
        sym_to_asset=sym_to_asset,
        collector=collector,
    )

    written = repo.read_month(2026, 6)
    by_symbol = dict(
        zip(written["yahoo_symbol"], written["price"], strict=True)
    )
    assert float(by_symbol["A.PA"]) == 11.0  # fresh price used
    assert float(by_symbol["B.PA"]) == 20.0  # stale price kept

    errors = collector.to_df()
    stale_warnings = errors[errors["type"] == "stale_price_kept"]
    assert len(stale_warnings) == 1
    assert stale_warnings.iloc[0]["isin"] == "FR000B"
