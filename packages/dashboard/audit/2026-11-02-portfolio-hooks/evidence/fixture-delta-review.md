# Fixture review delta

Only the two reviewed cache-reader test files changed in src. Their complete data baselines use existing makeDashboardData, makePosition, rawData and isinRow mocks; per-test object arguments are typed overrides or expected assertion values. Fixed row dates/IDs come from the existing mocks. The allocation cases isolate one dimension each; account replacement uses a unique cash-1 ID and a single cash row. No new fixture baseline, arbitrary cast, clock or internal module mock is introduced.

Baseline/final inventories have exactly the same 24 candidate records, including file/content/line/column data and contracts. The previous review reasons remain valid for unchanged definitions/consumers; no candidate approval was generated. All analysis metadata except sourceSha256 is identical (compiler, collector, reviewer, lockfile). Source fingerprint changes solely because the two tests changed. The ledger updates only that fingerprint after this review.

History: ledger staged/unstaged diffs were empty before editing; 33639a6 last changed its source fingerprint and an unrelated existing test hash. No earlier decision is replaced. Baseline/current candidates and full inventory logs remain local supplementary evidence; this semantic review is retained. Required final gate: npm run audit:fixtures:check.
