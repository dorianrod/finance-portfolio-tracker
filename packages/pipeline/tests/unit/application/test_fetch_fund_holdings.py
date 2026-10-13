import pandas as pd

from src.fetch_fund_holdings import build_fund_holdings


def test_build_fund_holdings_canonicalizes_direct_and_indirect_asset():
    positions = pd.DataFrame([
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
    ])

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

    assert result.to_dict("records") == [{
        "parent_isin": "FUND-1",
        "parent_ticker": "",
        "parent_name": "Example UCITS ETF",
        "holding_id": "FR-DIRECT",
        "holding_name": "Example Energy Corp",
        "weight": 0.12,
    }]
