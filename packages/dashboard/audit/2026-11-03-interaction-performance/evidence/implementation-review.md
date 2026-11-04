# Implementation verification and retained evidence

The user “implémente” authorizes the existing P-001–P-003 plan. The original baseline remains in performance-review.md and the baseline manifests. Final authored input hashes are in implementation-source-manifest.json, including untracked additions. Source/configuration histories were reviewed before changes; no source edit reverses the existing consumer-owned model, persistent source boundary or background validation decisions.

## Financial and display equivalence

A local Vite SSR probe loads baseline helpers from `git show HEAD:packages/dashboard/src/...` into isolated audit copies, rewrites their imports to the original aggregation/history implementations, and compares their complete returned objects with the final code using `assert.deepEqual`. CSVs are parsed through the existing Yup schemas. No personal data is added to the dossier.

- 16 complete exposure-model cases pass: empty/exact-fund/free-text/unmatched queries, value/name sorting, collapsed/expanded issuers. Rows, monetary values, weights, counts and source detail agree.
- Nine complete overview comparison cases pass: default/custom/end-only periods and all/one/missing account scopes. Concentration snapshots, dates, holdings, values and comparisons agree.
- The final canonical resolver separately matches the original on 7,108 distinct lookups covering issuer IDs, security IDs and an unknown identifier. The unit tests additionally cover unknown prefixes, short IDs, authoritative ISINs, last duplicate name and equal-longest input-order ties.
- New hook tests verify stable aggregate/entity identity on disclosure/sort/ordinary search, exact-fund scope invalidation, updated financial inputs and empty results. Historical tests verify account/type filters, non-future endpoints, duplicate endpoints and fallback past dates with no usable composition. Default full-series behavior is retained for diversification.

## Final production measurements

Same Chromium headless setup, viewport, local data and click-to-two-animation-frames method as the original baseline. Modules/data were warm. Run after the global test/lint work completed; a preliminary run during those CPU-heavy checks is excluded from the comparison. These are rendering proxies, not standardized INP or cross-device guarantees.

| Interaction                   | Baseline median, ms | Final median, ms | Final range, ms |
| ----------------------------- | ------------------: | ---------------: | --------------- |
| expand issuer                 |                99.4 |              8.3 | 6.1–17          |
| collapse issuer               |               102.6 |              7.9 | 7–7.9           |
| underlying -> overview        |               137.1 |             67.4 | 64.8–75.5       |
| overview -> underlying (warm) |               118.6 |             43.9 | 42.6–46.9       |

Final individual observations: expand issuer: 8.3 ms, collapse issuer: 7.9 ms, expand issuer: 17 ms, collapse issuer: 7 ms, expand issuer: 6.1 ms, collapse issuer: 7.9 ms, underlying -> overview: 72.4 ms, overview -> underlying (warm): 46.7 ms, underlying -> overview: 75.5 ms, overview -> underlying (warm): 43.9 ms, underlying -> overview: 65.4 ms, overview -> underlying (warm): 46.9 ms, underlying -> overview: 64.8 ms, overview -> underlying (warm): 43.1 ms, underlying -> overview: 67.4 ms, overview -> underlying (warm): 42.6 ms.

## Integrated prefix resolver benchmark

The final implementation uses a Map of prefixes rather than the prototype's per-character tree. A second map restricts canonical lookup to the original known normalized IDs, so unknown prefixes and authoritative ISINs remain unchanged. The original/full final resolvers are compared on actual validated holdings; eight construction runs per implementation, without rendering:

| Run | Baseline, ms | Final, ms |
| --- | -----------: | --------: |
| 1   |       132.61 |      4.29 |
| 2   |        93.62 |      5.75 |
| 3   |       103.66 |      3.65 |
| 4   |       104.76 |       3.3 |
| 5   |       103.65 |      3.37 |
| 6   |       103.37 |      3.74 |
| 7   |       103.93 |      3.57 |
| 8   |        103.7 |      5.36 |

The index is local to each aggregation and has no unbounded persistent cache. Financial aggregation, disclosure and history-endpoint decisions are recorded beside their owners. Shared UI, page lifecycles, source queries and exception policy are unchanged.

## Source, tests and prevention review

Five new runtime helpers are under their existing business/presentation owners; every helper has one public callable and a meaningful sibling test. The row union moves with its presentation output and both consuming imports are updated. Seven sibling test files and one typed owning fixture were added. No network or internal helper modules are mocked in the real-hook test; each instance uses a fresh QueryClient/Jotai store.

All 24 prior fixture-review candidate locations and test hashes are unchanged. The only new candidate is an explicit `fund: null, value: 20` direct-source delta used to test multiple-source disclosure. It is a scenario update to the owning issuer fixture, not reusable defaults. Its retained decision and refreshed aggregate source fingerprint are in fixture-review-delta.json. The gate reports 25 reviewed, no stale/pending decisions.

Global lint passes with zero errors and the one unchanged TanStack Table warning. Build/typecheck passes. The application suite initially passed 2,566 tests and failed only its expected stale fixture-ledger gate; after the documented ledger review, the failed integration test passes on targeted rerun. No application source changed after that suite. All 765 packaged skill tests pass. Colocation reports zero missing/pending new owners; runtime imports have no cycles. Formatting and final diff checks pass.

No ESLint/TypeScript protection was added or weakened: these are measured dependency/algorithm improvements, enforced by behavior regressions and existing typed contracts rather than unreliable timing thresholds. No new suppression, configuration exception, cache, worker or source-state duplication was introduced. The plan is complete; no pending source work or required decision remains.
