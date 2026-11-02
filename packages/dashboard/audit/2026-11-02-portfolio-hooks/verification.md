# Audit verification

## Baseline checks

All commands run in packages/dashboard against 33639a6, clean source tree, before edits.

- E-001: `npm run lint`, exit 0; 0 errors/1 existing outside-scope tracking warning, ceiling 1. Local supplementary evidence: evidence/baseline-lint.log.
- E-002: `npm run typecheck`, exit 0; no diagnostics. Local log: evidence/baseline-typecheck.log.
- E-003: `npx vitest run src/domains/portfolio/shared/services/usePortfolioAllocationData.test.tsx src/domains/portfolio/shared/services/usePortfolioSourceData.test.tsx src/domains/portfolio/shared/apis/queries/useGetFilteredPortfolioHistoryQuery.test.ts src/domains/portfolio/features/performance/pages/PerformancePage.feature.test.tsx`, exit 0; 4 files/14 tests pass. Local log: evidence/baseline-tests.log.
- E-004: `npm run --silent audit:colocation -- --snapshot`, exit 0; frozen authored source snapshot at evidence/baseline-colocation.json.
- E-005: `npm run --silent audit:fixtures`, exit 0; 24 candidates, none in frozen five-file scope. Supporting raw history input is intentionally transport data. Local evidence: evidence/baseline-fixtures.json.

## Detector calibration and reproductions

- E-006: in-memory ESLint.lintText with actual allocation sibling path; invalid conditional assertion produces local/no-conditional-test-assertions at error severity, neighboring it.each example has no diagnostics. Exit 0. [Retained calibration](evidence/calibration-review.json), [effective rules](evidence/contracts-and-config.json). This proves conditional-assertion detection, not test adequacy, cache reactivity or semantic ownership.
- Cache mutation proofs planned for P-001/P-002; no production mutation accepted into the final changes.

## Implementation checks

- E-007: focused final tests, `npx vitest run src/domains/portfolio/shared/services/usePortfolioAllocationData.test.tsx src/domains/portfolio/shared/services/usePortfolioFilterOptions.test.tsx`, exit 0; 2 files/9 tests pass.
- E-008: [temporary regression probes](evidence/cache-regression-review.json): permanently empty allocation output causes 4 intended failures; frozen filter memo causes all 3 new cases to fail. Both commands exit 1 as expected. Production files restored in finally blocks and checked against baseline hashes. These establish detection of stale/empty output, not universal cache correctness.
- E-009: `npm run lint`, exit 0; 0 errors/1 unchanged outside-scope warning, ceiling 1. Local final-lint.log. No suppressions/rules/config changed.
- E-010: `npm run typecheck`, exit 0; no diagnostics. Local final-typecheck.log.
- E-011: `npm run --silent audit:colocation -- --baseline audit/2026-11-02-portfolio-hooks/evidence/baseline-colocation.json`, exit 0; one new test module classified support, missing 0/pending 0. No new runtime owner or move. Both new/changed test files also received nominal/edge/cache-replacement semantic review.
- E-012: final `npm run --silent audit:fixtures`, exit 0; candidate array identical to baseline (24). [Fixture delta review](evidence/fixture-delta-review.md) records actual source/candidate comparison, owning mock reuse and ledger history.
- E-013: `npm run audit:fixtures:check`, exit 0; reviewed 24, stale [], pending []. Only sourceSha256 in ledger changed.
- E-014: `npm run --silent audit:architecture`, exit 0; 39 project-wide review candidates, none is an in-scope owner; PerformancePage remains manually justified by its query/model/filter orchestration. Tool silence does not establish role compliance. Local architecture.log.
- E-015a: first `npm test`, exit 1; 324 files/2477 tests pass, one fixture inventory integration case fails at fixture-candidates.integration.test.mjs:40 because the suite started before P-003 updated the source fingerprint. This is a stale-analysis approval result, not a timeout or product assertion failure. The generic suite did not run because the application command failed. Preserve local final-tests.log. Remedy is correct check sequencing after P-003; no test/config/timeout weakening.
- E-015: normal full `npm test` retry after verified fixture ledger update, exit 0; 325 application/integration files, 2478 tests pass; 34 generic tooling files, 765 tests pass (3243 total). The source/test/config/timeout inputs are identical to the first run; its fixture-review read had preceded the reviewed source-fingerprint refresh. The retry starts with the fresh ledger. Local final-tests-retry.log.
- E-016: initial full `npx prettier --check .`, exit 0; all matched files conform. Dossier-only updates followed; E-017 verifies their closure state.

- E-017: final full `npx prettier --check .`, exit 0; all matched files conform after report updates. Local final-prettier-closure.log. `git diff --check` passes. Final source/config/rule/ledger manifest drift check is empty. Closure text is formatted and checked again as an audit-only delta.

## Completion review

Phase 1 complete: five files and 31 selected rules accounted for, history consulted, prevention plan written. Proven violations: 0; prevention opportunities: 1; pending inspection/user decisions: 0. Baseline score/impact rows come from packaged metrics output, not hand-edited arithmetic. Phase 2 complete: P-001/P-002/P-003 verified, seven new behavior regressions, fixture review delta inspected, required checks pass. No production correction or new static rule was warranted; tests provide prevention for the dynamic cache contracts. No pending decision, inspection or required fix remains.

## Impact volumes and score

Formula: weighted-rule-compliance/v1. Baseline and final selected rules: 31; applicable: 30; pending: 0. Confirmed violation families: 0; affected files with proven violations: 0. Both scores are 100/100 for this focused scope. The prevention opportunity is not counted as a violation. Existing in-scope unrevalidated exceptions: 0; one existing outside-scope tracking warning is unchanged and not approved anew. Baseline/final inputs and results are retained separately under `evidence/*-metrics*.json`. This does not certify unrelated dashboard files or prove that further defects are impossible.

| Actual impact | Baseline confirmed | Open confirmed | Resolved confirmed |
| ------------- | -----------------: | -------------: | -----------------: |
| CRITICAL      |                  0 |              0 |                  0 |
| HIGH          |                  0 |              0 |                  0 |
| MEDIUM-HIGH   |                  0 |              0 |                  0 |
| MEDIUM        |                  0 |              0 |                  0 |
| LOW-MEDIUM    |                  0 |              0 |                  0 |
| LOW           |                  0 |              0 |                  0 |

Prevention changes affect two test files and one review ledger. No production type, ESLint check or compiler constraint added: dynamic QueryClient update behavior is protected by seven new regression cases using real subscriptions. New tests fail under the matching frozen/empty output probes. Existing static guards remain enabled.
