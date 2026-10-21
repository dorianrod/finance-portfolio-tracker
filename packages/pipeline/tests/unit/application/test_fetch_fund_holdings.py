import json
from datetime import date

import pandas as pd
import pytest

from src.fetch_fund_holdings import (
    FundPosition,
    _normalize_source_rows,
    _status_row,
    archive_fund_holdings_history,
    build_coverage_report,
    build_fund_holdings,
    refresh_fund_holdings,
)
from src.fund_holdings_sources import (
    FundSource,
    SourceResult,
    fetch_official_source_as_of,
    load_fund_sources,
    parse_amundi_json,
    parse_dws_json,
    parse_globalx_csv,
    parse_globalx_hk_html,
    parse_ishares_csv,
)


def test_historical_ishares_fetch_uses_prior_business_day_without_lookahead():
    source = FundSource(
        "FUND",
        "iShares",
        "ishares_csv",
        "https://example.test/holdings.csv?fileType=csv",
        "A",
        "Index",
        "physical",
    )
    requested_urls = []

    def download(url: str) -> bytes:
        requested_urls.append(url)
        holdings_date = (
            "20/Oct/2026"
            if len(requested_urls) == 1
            else "16/Oct/2026"
        )
        return (
            f'Fund Holdings as of,"{holdings_date}"\n\n'
            "Ticker,Name,Exchange,Weight (%)\n"
            "AAA,Example Corp,NASDAQ,100\n"
        ).encode()

    result = fetch_official_source_as_of(
        source, date(2026, 10, 19), download=download
    )

    assert result.holdings_date == "2026-10-16"
    assert "asOfDate=20261019" in requested_urls[0]
    assert "asOfDate=20261016" in requested_urls[1]

    unsupported = FundSource(
        "FUND", "DWS", "dws_api", "https://example.test", "A", "", ""
    )
    with pytest.raises(ValueError, match="does not support historical"):
        fetch_official_source_as_of(unsupported, date(2026, 10, 19))


def test_history_archive_is_idempotent_and_keeps_distinct_dates(tmp_path):
    destination = tmp_path / "fund_holdings_history.csv"
    base = pd.DataFrame(
        [
            {
                "parent_isin": "FUND",
                "parent_name": "Example ETF",
                "holding_id": "AAA",
                "holding_name": "Example Corp",
                "issuer_id": "AAA",
                "issuer_name": "Example Corp",
                "weight": 1.0,
                "holdings_date": "2026-09-30",
            }
        ]
    )

    archive_fund_holdings_history(
        destination, [base], captured_at="2026-10-01T00:00:00Z"
    )
    archive_fund_holdings_history(
        destination, [base], captured_at="2026-10-02T00:00:00Z"
    )
    later = base.assign(holdings_date="2026-10-31")
    history = archive_fund_holdings_history(destination, [later])

    assert len(history) == 2
    assert history["history_snapshot_id"].nunique() == 2
    assert history["effective_date"].tolist() == ["2026-09-30", "2026-10-31"]


def test_build_fund_holdings_canonicalizes_direct_and_indirect_asset():
    positions = pd.DataFrame(
        [
            {
                "snapshot_date": "2026-10-01",
                "isin": "FUND-1",
                "ticker": "",
                "name": "Example UCITS ETF",
            },
            {
                "snapshot_date": "2026-10-01",
                "isin": "FR-DIRECT",
                "ticker": "",
                "name": "Example Energy",
            },
            {
                "snapshot_date": "2026-09-01",
                "isin": "OLD-FUND",
                "ticker": "",
                "name": "Old ETF",
            },
        ]
    )

    def fetch(symbol: str) -> pd.DataFrame:
        assert symbol == "YAHOO-FUND"
        return pd.DataFrame(
            [{"Name": "Example Energy Corp", "Holding Percent": 0.12}],
            index=["ENERGY.EX"],
        )

    result = build_fund_holdings(
        positions,
        {"FUND-1": {"isin": "FUND-1", "yahoo_symbol": "YAHOO-FUND"}},
        fetch=fetch,
        max_workers=1,
    )

    assert result.to_dict("records") == [
        {
            "parent_isin": "FUND-1",
            "parent_ticker": "",
            "parent_name": "Example UCITS ETF",
            "holding_id": "FR-DIRECT",
            "holding_name": "Example Energy Corp",
            "weight": 0.12,
        }
    ]


def test_official_source_parsers_reject_format_changes_and_parse_dates():
    ishares = parse_ishares_csv(
        b'Fund Holdings as of,"12/Oct/2026"\n\n'
        b"Ticker,Name,Exchange,Weight (%)\n"
        b"AAA,Example Corp,NASDAQ,5.25\n"
    )
    assert ishares.holdings_date == "2026-10-12"
    assert ishares.holdings.iloc[0]["weight"] == pytest.approx(0.0525)

    globalx = parse_globalx_csv(
        b"AS_OF_DATE,NAME,NET_ASSETS,TICKER,ISIN\n"
        b"2026-10-12,Cameco,15.5,CCO,CA13321L1085\n"
    )
    assert globalx.holdings_date == "2026-10-12"
    assert globalx.holdings.iloc[0]["source_holding_id"] == "CA13321L1085"

    html = b"""
      <h3>Daily Holdings<small>As of 12 Oct 2026</small></h3>
      <table id="holdingsList" id="top-ten"><tbody><tr>
      <td>Samsung Electronics</td><td>005930 KS</td><td>Seoul</td>
      <td>100</td><td>10</td><td>1000</td><td>7.12</td>
      </tr></tbody></table>
    """
    parsed_html = parse_globalx_hk_html(html)
    assert parsed_html.holdings_date == "2026-10-12"
    assert parsed_html.holdings.iloc[0]["weight"] == pytest.approx(0.0712)

    with pytest.raises(ValueError, match="header not found"):
        parse_ishares_csv(b"provider changed this format")
    with pytest.raises(ValueError, match="no parseable holdings"):
        parse_globalx_csv(b"AS_OF_DATE,NAME,NET_ASSETS,TICKER,ISIN\n")


def test_amundi_and_dws_api_parsers_validate_economic_holdings():
    amundi_product = {
        "products": [
            {
                "characteristics": {
                    "REPLICATION_METHODOLOGY": "Direct (Physical)",
                    "BENCHMARK_NAME": "Example Index",
                },
                "composition": {
                    "compositionData": [
                        {
                            "compositionCharacteristics": {
                                "date": "2026-10-12",
                                "isin": "XX0000000001",
                                "name": "Example Holding",
                                "weight": 0.08,
                            }
                        }
                    ]
                },
            }
        ]
    }
    amundi = parse_amundi_json(json.dumps(amundi_product).encode())
    assert amundi.holdings_date == "2026-10-12"
    assert amundi.metadata == {
        "replication_method": "Direct (Physical)",
        "index_name": "Example Index",
    }

    amundi_product["products"][0]["characteristics"][
        "REPLICATION_METHODOLOGY"
    ] = "Indirect (Swap)"
    with pytest.raises(ValueError, match="collateral basket"):
        parse_amundi_json(json.dumps(amundi_product).encode())

    dws = parse_dws_json(
        json.dumps(
            {
                "asOfDate": "2026-10-12",
                "tables": [
                    {
                        "values": [
                            {
                                "header": {"value": "US0378331005"},
                                "column_0": {"value": "Apple"},
                                "column_1": {"sortValue": 7.5},
                            }
                        ]
                    }
                ],
            }
        ).encode()
    )
    assert dws.holdings.iloc[0]["weight"] == pytest.approx(0.075)


def test_amundi_parser_keeps_unnamed_cash_and_normalizer_merges_same_isin():
    payload = {
        "products": [
            {
                "characteristics": {
                    "REPLICATION_METHODOLOGY": "Direct (Physical)",
                    "BENCHMARK_NAME": "CAC 40 Total Return Index",
                },
                "composition": {
                    "compositionData": [
                        {
                            "compositionCharacteristics": {
                                "date": "2026-10-14",
                                "type": "STOCK",
                                "isin": "XX0000000002",
                                "name": "EXAMPLE EQUITY CLASS A",
                                "weight": 0.6,
                            }
                        },
                        {
                            "compositionCharacteristics": {
                                "date": "2026-10-14",
                                "type": "STOCK",
                                "isin": "XX0000000002",
                                "name": "EXAMPLE EQUITY CLASS B",
                                "weight": 0.3985,
                            }
                        },
                        {
                            "compositionCharacteristics": {
                                "date": "2026-10-14",
                                "type": "CASH",
                                "currency": "EUR",
                                "weight": 0.0015,
                            }
                        },
                    ]
                },
            }
        ]
    }
    result = parse_amundi_json(json.dumps(payload).encode())
    assert result.holdings["weight"].sum() == pytest.approx(1.0)
    assert result.holdings.iloc[-1].to_dict() == {
        "source_holding_id": "CASH:EUR",
        "source_holding_name": "Cash EUR",
        "exchange": "",
        "holding_kind": "cash",
        "preserve_id": True,
        "weight": 0.0015,
    }

    fund = FundPosition("FUND", "", "Fund ETF", "FUND", 1_000)
    normalized = _normalize_source_rows(
        fund,
        result,
        "A",
        "Amundi",
        lambda symbol, name: symbol,
    )
    assert normalized["weight"].sum() == pytest.approx(1.0)
    assert normalized["holding_id"].tolist().count("XX0000000002") == 1


def test_dws_parser_reads_holdings_date_from_disclaimer():
    payload = {
        "asOfDate": "",
        "tables": [
            {
                "disclaimers": [{"text": "<p>Source: DWS 15/10/2026</p>"}],
                "values": [
                    {
                        "header": {"value": "US0378331005"},
                        "column_0": {"value": "Apple"},
                        "column_1": {"sortValue": 7.5},
                    }
                ],
            }
        ],
    }
    assert parse_dws_json(json.dumps(payload).encode()).holdings_date == (
        "2026-10-15"
    )


_SOURCE_HEADER = (
    "parent_isin,provider,adapter,url,quality_tier,index_name,"
    "replication_method,proxy_name,proxy_isin\n"
)


def test_load_fund_sources_reads_registry_from_data_dir(tmp_path):
    assert load_fund_sources(tmp_path) == {}
    (tmp_path / "input").mkdir()
    registry = tmp_path / "input" / "fund_sources.csv"
    registry.write_text(
        _SOURCE_HEADER
        + "SYNTH,Provider,ishares_csv,https://example.test/p.csv,B,"
        "Some Index,synthetic,Physical ETF,PHYS\n"
    )
    source = load_fund_sources(tmp_path)["SYNTH"]
    assert source.quality_tier == "B"
    assert source.index_name == "Some Index"
    assert source.proxy_isin == "PHYS"

    registry.write_text(
        _SOURCE_HEADER + "X,P,unknown_adapter,https://e.test,A,I,physical,,\n"
    )
    with pytest.raises(ValueError, match="unsupported adapter"):
        load_fund_sources(tmp_path)
    registry.write_text("parent_isin,provider\nX,P\n")
    with pytest.raises(ValueError, match="missing columns"):
        load_fund_sources(tmp_path)


_EXAMPLE_SOURCE = FundSource(
    "FUND",
    "Provider",
    "ishares_csv",
    "https://example.test/p.csv",
    "A",
    "Example Index",
    "physical",
)


def test_status_flags_stale_and_incomplete_official_data():
    fund = FundPosition("FUND", "", "Fund ETF", "FUND", 1_000)
    source = _EXAMPLE_SOURCE
    source_rows = pd.DataFrame(
        [
            {
                "source_holding_id": "AAA",
                "source_holding_name": "Example Corp",
                "exchange": "NASDAQ",
                "weight": 0.5,
            }
        ]
    )
    normalized = pd.DataFrame(
        [
            {
                "holding_id": "AAA",
                "weight": 0.5,
            }
        ]
    )
    status = _status_row(
        fund,
        normalized,
        source,
        "A",
        SourceResult(source_rows, "2026-01-01"),
        None,
        date(2026, 10, 13),
    )
    assert status["validation_status"] == "warning"
    assert status["is_stale"] == "true"
    assert "weights total 50.00%" in str(status["issues"])


def test_status_resets_repeatability_when_provider_shape_changes():
    fund = FundPosition("FUND", "", "Fund ETF", "FUND", 1_000)
    source = _EXAMPLE_SOURCE
    source_rows = pd.DataFrame(
        [
            {
                "source_holding_id": "ONE",
                "source_holding_name": "One",
                "exchange": "",
                "weight": 1.0,
            }
        ]
    )
    normalized = pd.DataFrame([{"holding_id": "ONE", "weight": 1.0}])
    previous = pd.Series(
        {
            "refresh_streak": 4,
            "holding_count": 500,
            "raw_weight_sum": 1.0,
            "quality_tier": "A",
        }
    )
    status = _status_row(
        fund,
        normalized,
        source,
        "A",
        SourceResult(source_rows, "2026-10-12"),
        previous,
        date(2026, 10, 13),
    )
    assert status["refresh_streak"] == 1
    assert status["validation_status"] == "warning"
    assert "streak reset" in str(status["issues"])


def test_coverage_report_requires_high_confidence_and_repeatability():
    positions = pd.DataFrame(
        [
            {
                "snapshot_date": "2026-10-13",
                "isin": "F1",
                "ticker": "",
                "name": "Fund ETF",
                "total_value": 900,
            },
            {
                "snapshot_date": "2026-10-13",
                "isin": "DIRECT",
                "ticker": "",
                "name": "Direct",
                "total_value": 100,
            },
        ]
    )
    statuses = pd.DataFrame(
        [
            {
                "quality_tier": "A",
                "explained_value": 900,
                "market_value": 900,
                "explained_pct": 100,
                "index_name": "Index",
                "proxy_isin": "",
                "refresh_streak": 2,
                "validation_status": "ok",
            }
        ]
    )
    report = build_coverage_report(positions, statuses).iloc[0]
    assert report["fund_coverage_pct"] == 100
    assert report["portfolio_coverage_pct"] == 100
    # A real portfolio needs seven material funds before the full UI unlocks.
    assert report["feasibility_status"] == "limited"


def test_refresh_uses_cache_and_preserves_last_valid_data_on_failure(tmp_path):
    output = tmp_path / "output"
    output.mkdir()
    (tmp_path / "input" / "allocations").mkdir(parents=True)
    (tmp_path / "input" / "fund_sources.csv").write_text(
        _SOURCE_HEADER
        + "FUND,Provider,ishares_csv,https://example.test/p.csv,A,"
        "Example Index,physical,,\n"
    )
    pd.DataFrame(
        [
            {
                "snapshot_date": "2026-10-13",
                "isin": "FUND",
                "ticker": "",
                "name": "Example Core UCITS ETF",
                "total_value": 1_000,
            }
        ]
    ).to_csv(output / "positions.csv", index=False)

    result = SourceResult(
        pd.DataFrame(
            [
                {
                    "source_holding_id": "AAA",
                    "source_holding_name": "Example Corp",
                    "exchange": "NASDAQ",
                    "weight": 1.0,
                }
            ]
        ),
        "2026-10-12",
    )
    refresh_fund_holdings(
        tmp_path,
        force=True,
        official_fetch=lambda source: result,
        today=date(2026, 10, 13),
    )
    first = (output / "fund_holdings.csv").read_text()

    def should_not_fetch(source):
        raise AssertionError("fresh cache should avoid the provider")

    refresh_fund_holdings(
        tmp_path,
        official_fetch=should_not_fetch,
        today=date(2026, 10, 20),
    )
    assert (output / "fund_holdings.csv").read_text() == first

    def failing_fetch(source):
        raise RuntimeError("provider unavailable")

    refresh_fund_holdings(
        tmp_path,
        force=True,
        official_fetch=failing_fetch,
        today=date(2026, 12, 1),
    )
    assert (output / "fund_holdings.csv").read_text() == first
    status = pd.read_csv(output / "fund_holdings_status.csv").iloc[0]
    assert status["validation_status"] == "warning"
    assert "last valid data kept" in status["issues"]


def test_refresh_bypasses_partial_cache_for_discovered_official_source(
    tmp_path,
):
    output = tmp_path / "output"
    output.mkdir()
    (tmp_path / "input" / "allocations").mkdir(parents=True)
    pd.DataFrame(
        [
            {
                "snapshot_date": "2026-10-13",
                "isin": "XX0000000000",
                "ticker": "",
                "name": "Amundi Example UCITS ETF",
                "total_value": 1_000,
            }
        ]
    ).to_csv(output / "positions.csv", index=False)
    pd.DataFrame(
        [
            {
                "parent_isin": "XX0000000000",
                "parent_ticker": "",
                "parent_name": "Amundi Example UCITS ETF",
                "holding_id": "AAA",
                "holding_name": "Cached top holding",
                "issuer_id": "AAA",
                "issuer_name": "Cached top holding",
                "weight": 0.5,
                "source_tier": "C",
                "source_name": "Yahoo Finance",
                "holdings_date": "",
            }
        ]
    ).to_csv(output / "fund_holdings.csv", index=False)
    pd.DataFrame(
        [
            {
                "parent_id": "XX0000000000",
                "parent_isin": "XX0000000000",
                "parent_name": "Amundi Example UCITS ETF",
                "quality_tier": "C",
                "validation_status": "warning",
                "source_name": "Yahoo Finance",
                "source_type": "partial fallback",
                "fetched_at": "2026-10-12T10:00:00+02:00",
                "raw_weight_sum": 0.5,
                "explained_pct": 50,
                "refresh_streak": 1,
                "issues": "holdings date unavailable",
            }
        ]
    ).to_csv(output / "fund_holdings_status.csv", index=False)

    official = SourceResult(
        pd.DataFrame(
            [
                {
                    "source_holding_id": "XX0000000001",
                    "source_holding_name": "Example Holding",
                    "exchange": "",
                    "weight": 0.99,
                }
            ]
        ),
        "2026-10-12",
    )
    calls = []

    def fetch(source):
        calls.append(source.adapter)
        return official

    refresh_fund_holdings(
        tmp_path,
        official_fetch=fetch,
        today=date(2026, 10, 13),
    )

    assert calls == ["amundi_api"]
    holdings = pd.read_csv(output / "fund_holdings.csv")
    assert holdings["weight"].sum() == pytest.approx(1.0)
    status = pd.read_csv(output / "fund_holdings_status.csv").iloc[0]
    assert status["source_name"] == "Amundi"
    assert status["decomposition_state"] == "resolved"
    assert status["residual_pct"] == 0
    assert pd.read_csv(output / "fund_unresolved.csv").empty


def test_backfill_only_fetches_months_when_supported_fund_is_held(tmp_path):
    output = tmp_path / "output"
    output.mkdir()
    (tmp_path / "input" / "allocations").mkdir(parents=True)
    (tmp_path / "input" / "fund_sources.csv").write_text(
        _SOURCE_HEADER
        + "FUND,Provider,ishares_csv,https://example.test/p.csv,A,"
        "Example Index,physical,,\n"
    )
    pd.DataFrame(
        [
            {
                "snapshot_date": "2025-01-31",
                "account_category": "brokerage",
                "account_type": "Brokerage",
                "isin": "FUND",
                "ticker": "",
                "name": "Example Core UCITS ETF",
                "total_value": 1_000,
            },
            {
                "snapshot_date": "2025-02-28",
                "account_category": "brokerage",
                "account_type": "Brokerage",
                "isin": "DIRECT",
                "ticker": "",
                "name": "Direct asset",
                "total_value": 1_000,
            },
        ]
    ).to_csv(output / "positions.csv", index=False)
    calls = []

    def historical_fetch(source, requested):
        calls.append((source.parent_isin, requested))
        return SourceResult(
            pd.DataFrame(
                [
                    {
                        "source_holding_id": "AAA",
                        "source_holding_name": "Example Corp",
                        "exchange": "",
                        "weight": 1.0,
                    }
                ]
            ),
            requested.isoformat(),
        )

    refresh_fund_holdings(
        tmp_path,
        backfill_history=True,
        historical_fetch=historical_fetch,
        today=date(2025, 3, 1),
    )

    assert calls == [("FUND", date(2025, 1, 31))]
    history = pd.read_csv(output / "fund_holdings_history.csv")
    assert history["effective_date"].tolist() == ["2025-01-31"]
    assert history["source_origin"].tolist() == ["historical_backfill"]
