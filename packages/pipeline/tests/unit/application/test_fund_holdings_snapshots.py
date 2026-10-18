import json
from datetime import date

import pandas as pd

from src.fetch_fund_holdings import refresh_fund_holdings
from src.fund_holdings_snapshots import load_fund_snapshots


def _write_snapshot(
    data_dir,
    fund_id: str,
    rows: list[dict[str, object]],
    *,
    snapshot_date: str = "2026-10-17",
    as_of_date: str = "2026-10-01",
    origin: str = "agent_research",
    complete: bool = True,
):
    directory = (
        data_dir
        / "input"
        / "fund_holdings"
        / "snapshots"
        / snapshot_date
        / fund_id
    )
    directory.mkdir(parents=True)
    pd.DataFrame(rows).to_csv(directory / "holdings.csv", index=False)
    coverage = sum(float(str(row["weight"])) for row in rows) * 100
    (directory / "manifest.json").write_text(
        json.dumps(
            {
                "fund_id": fund_id,
                "fund_name": fund_id,
                "snapshot_date": snapshot_date,
                "as_of_date": as_of_date,
                "generated_at": f"{snapshot_date}T12:00:00+02:00",
                "origin": origin,
                "complete": complete,
                "coverage_pct": coverage,
                "source_urls": ["https://issuer.example/holdings"],
                "notes": "Test evidence",
            }
        )
    )
    (directory / "evidence.md").write_text("Official issuer document.")
    return directory


def test_snapshot_lifecycle_keeps_stale_and_expires_after_180_days(tmp_path):
    rows = [
        {
            "holding_id": "ASSET",
            "holding_name": "Asset",
            "holding_kind": "security",
            "weight": 1.0,
        }
    ]
    _write_snapshot(
        tmp_path,
        "STALE",
        rows,
        snapshot_date="2026-06-01",
        as_of_date="2026-06-01",
    )
    _write_snapshot(
        tmp_path,
        "EXPIRED",
        rows,
        snapshot_date="2026-01-01",
        as_of_date="2026-01-01",
    )

    snapshots, audit = load_fund_snapshots(tmp_path, today=date(2026, 10, 17))

    assert snapshots["STALE"].is_stale is True
    assert "EXPIRED" not in snapshots
    expired = audit[audit["fund_id"] == "EXPIRED"].iloc[0]
    assert expired["status"] == "expired"
    assert expired["is_active"] == "false"


def test_refresh_recursively_uses_manual_snapshot_and_exposes_provenance(
    tmp_path,
):
    output = tmp_path / "output"
    output.mkdir()
    (tmp_path / "input" / "allocations").mkdir(parents=True)
    pd.DataFrame(
        [
            {
                "snapshot_date": "2026-10-17",
                "isin": "PEE-ROOT",
                "ticker": "",
                "name": "Employee savings vehicle",
                "total_value": 10_000,
            }
        ]
    ).to_csv(output / "positions.csv", index=False)
    _write_snapshot(
        tmp_path,
        "PEE-ROOT",
        [
            {
                "holding_id": "DIRECT",
                "holding_name": "Direct asset",
                "holding_kind": "security",
                "weight": 0.4,
            },
            {
                "holding_id": "CHILD",
                "holding_name": "Child FCPE",
                "holding_kind": "fund",
                "weight": 0.6,
            },
        ],
        origin="manual",
    )
    _write_snapshot(
        tmp_path,
        "CHILD",
        [
            {
                "holding_id": "UNDERLYING",
                "holding_name": "Underlying asset",
                "holding_kind": "security",
                "weight": 1.0,
            }
        ],
    )

    refresh_fund_holdings(
        tmp_path,
        force=True,
        yahoo_fetch=lambda _symbol: (_ for _ in ()).throw(
            AssertionError("snapshot should precede Yahoo")
        ),
        today=date(2026, 10, 17),
    )

    holdings = pd.read_csv(output / "fund_holdings.csv")
    assert set(holdings["holding_id"]) == {"DIRECT", "UNDERLYING"}
    assert holdings["weight"].sum() == 1
    assert holdings["depth"].max() == 1
    status = pd.read_csv(output / "fund_holdings_status.csv").iloc[0]
    assert status["quality_tier"] == "C"
    assert bool(status["manual_attention"]) is True
    assert status["source_name"] == "Snapshot manuel"
    assert status["decomposition_state"] == "resolved"
    assert pd.read_csv(output / "fund_unresolved.csv").empty
    audit = pd.read_csv(output / "fund_snapshot_manifest.csv")
    assert len(audit) == 2
