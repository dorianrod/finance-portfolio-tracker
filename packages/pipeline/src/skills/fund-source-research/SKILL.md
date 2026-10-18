---
name: fund-source-research
description: >-
  Research and resolve funds, ETFs, UCITS, FCPE, PEE/PEI/PERCO vehicles and
  other composite positions left in fund_unresolved.csv. Prefer a reusable
  deterministic issuer source; otherwise create a dated, cited, validated
  holdings snapshot. Use for unresolved look-through, missing underlying
  assets, opaque employee-savings funds, or stale manual/agent snapshots.
---

# Fund Source Research

Resolve the data directory exactly as the repository's other finance skills
do. Never exclude a position because of its account, wrapper, domicile, or
product type. Work from monetary impact, largest first.

## Workflow

1. Run `scripts/research_queue.py --data-dir <data-dir>` and select the largest
   unresolved row. Read existing attempts and snapshots before doing research.
2. Identify the exact vehicle by ISIN first, then official name/ticker. Never
   merge share classes or guess an ISIN.
3. Search primary sources in this order: issuer full holdings, issuer index
   exposure, exact-index physical proxy, regulatory filing. Yahoo/top-ten data
   is corroboration only and cannot prove completeness.
4. For synthetic replication, never present the collateral/substitution
   basket as economic exposure. Use a documented index composition or an exact
   physical proxy; otherwise leave the unresolved value intact.
5. If a stable complete endpoint exists and an adapter is already supported,
   append a source to `<data-dir>/input/fund_sources.csv`. If a new adapter is
   required, implement and test it in the pipeline before registering it.
6. Otherwise create the immutable snapshot described in
   `references/snapshot-schema.md`. Record every source URL and reasoning in
   `evidence.md`; mark uncertain or partial work `complete: false`.
7. Run `scripts/validate_snapshot.py SNAPSHOT_DIR`, then run the fund-holdings
   pipeline. Confirm that the unresolved monetary value fell by exactly the
   newly explained amount and inspect Data Quality.

Snapshots remain tier C and always surface as a point of attention. Do not
edit an old snapshot: create a new dated directory. After 90 days it is stale;
after 180 days the pipeline stops using it and queues the fund again.

