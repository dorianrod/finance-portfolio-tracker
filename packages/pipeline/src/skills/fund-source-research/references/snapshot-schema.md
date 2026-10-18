# Snapshot schema

Create:

```text
<data-dir>/input/fund_holdings/snapshots/YYYY-MM-DD/<fund-key>/
  holdings.csv
  manifest.json
  evidence.md
```

`holdings.csv` uses decimal weights:

```csv
holding_id,holding_name,holding_isin,holding_kind,weight
EXAMPLE-SECURITY,Example security,XX0000000001,security,0.0831
CHILD-FUND,Example child fund,LU0000000001,fund,0.25
```

`holding_kind` is one of `security`, `fund`, `cash`, `derivative`, `unknown`.
Funds are recursively expanded when their own active snapshot exists.

`manifest.json`:

```json
{
  "fund_id": "FR0012345678",
  "fund_name": "Exact official share-class name",
  "snapshot_date": "2026-10-17",
  "as_of_date": "2026-09-30",
  "generated_at": "2026-10-17T14:00:00+02:00",
  "origin": "agent_research",
  "complete": false,
  "coverage_pct": 83.31,
  "source_urls": ["https://issuer.example/official-document"],
  "checksum_sha256": "optional; validator verifies it when present",
  "notes": "State limitations and interpretation decisions."
}
```

The weight sum and `coverage_pct` may differ by at most one percentage point.
A complete snapshot must total between 98% and 102%. `evidence.md` must explain
identity, replication, date, whether the list is exhaustive, and any mapping
or proxy decision.

