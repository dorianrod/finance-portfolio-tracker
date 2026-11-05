# Audit verification

## Baseline checks

All commands below ran from `packages/dashboard` against the frozen source. Raw `evidence/baseline-*.log` files are ignored local supplementary evidence; essential results are retained here.

| Evidence | Command                                               | Exit | Essential result                                                                                                            |
| -------- | ----------------------------------------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------- |
| B-01     | `npm run lint`                                        | 0    | 0 errors, 1 existing suppression-tracking warning; ceiling 1 satisfied.                                                     |
| B-02     | `npm run typecheck`                                   | 0    | All configured TypeScript project references compile.                                                                       |
| B-03     | `npm run audit:architecture`                          | 0    | 40 candidates: 8 feature review signals and 32 support contracts; all dispositioned semantically, not counted as errors.    |
| B-04     | `npm run audit:cycles`                                | 0    | No synchronous production runtime import cycles.                                                                            |
| B-05     | `npm run audit:colocation -- --source src --snapshot` | 0    | Frozen [source/role snapshot](evidence/baseline-colocation-manifest.json); no retroactive introduced-owner claim.           |
| B-06     | `npm run audit:fixtures:check`                        | 0    | All 25 candidate decisions current; no pending/stale review.                                                                |
| B-07     | `npm run audit:i18n`                                  | 1    | Five verified orphan keys; F-001.                                                                                           |
| B-08     | `npx prettier --check .`                              | 0    | Original supported authored files formatted.                                                                                |
| B-09     | `npm test`                                            | 0    | 345 application test files / 2,602 tests; 34 generic skill test files / 765 tests.                                          |
| B-10     | `npm run --silent lint:counts -- --json`              | 0    | 1,482 linted files; 0 active errors, 1 active warning, 1 separately suppressed error.                                       |
| B-11     | `npm run build`                                       | 0    | TypeScript and Vite pass; seven route chunks remain distinct. Existing dependency/native-loader notice does not fail build. |
| B-12     | `npm run build-storybook`                             | 0    | Catalog builds; existing dependency module-directive warnings, no application error.                                        |

Launcher corrections: this host provides `python3`, not `python`; an initial script attempt and two path-prefixed metadata/probe attempts used an incorrect working-directory prefix. Corrected before dependent analysis. These failures changed no audited inputs and are not reported as passing checks.

## Detector calibration and reproductions

C-01: B-09 includes actual-config invalid/valid cases in `tests/eslint/catalog-enforcement.integration.test.js`, `architecture-prevention.integration.test.js`, and typed-contract/accessibility/style/fixture tests. Intended rule IDs and severity 2 are asserted, separately from valid neighbors; aliases/shadowing/indirect dependencies are exercised where supported. Generic fixture/cycle/scanner regressions run in the packaged suite. Their bounded limits are stated in each rule review.

C-02: Isolated `npx vitest run audit/2026-11-05-react-full/evidence/valuation-probe.test.tsx` exits 0, reproducing the defect: a position with `total_value: null` and holding weight 0.25 renders `0 €`, no `—`. This ignored scratch probe is removed before the final full run; the permanent P-001 regression must fail with the original row implementation.

C-03: The actual configured application catalog command B-07 is the invalid gate case for P-003; final clean usage is its valid neighbor. The exact missing-key detector examples will be updated to a live existing key, retaining calibration assertions.

## Implementation checks

All commands ran from `packages/dashboard` after source/test corrections. Raw final logs remain local supplementary evidence.

| Evidence | Command                                                                                                                                                                             | Exit | Essential result                                                                                                                                                                       |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I-01     | `npx vitest run src/domains/portfolio/features/holdings/features/positions/components/FundPositionHoldingRow.feature.test.tsx` (before row correction)                              | 1    | Null case failed; zero/nonzero passed. Direct regression proves baseline defect.                                                                                                       |
| I-02     | `npx vitest run src/domains/portfolio/features/holdings/features/positions/components/FundPositionHoldingRow.feature.test.tsx tests/eslint/catalog-enforcement.integration.test.js` | 0    | 58 tests pass, including all three monetary cases and real-config invalid/valid examples.                                                                                              |
| I-03     | `npm run --silent audit:fixtures`                                                                                                                                                   | 0    | 25 unchanged candidate identities; unchanged reviewed test hashes/contracts/compiler. New test uses owning-mock Partial overrides and creates no candidate. Only sourceSha256 differs. |
| I-04     | `npm run --silent audit:colocation -- --source src --baseline audit/2026-11-05-react-full/evidence/baseline-colocation-manifest.json`                                               | 0    | 0 missing, 0 pending; only new test module, no new/moved runtime owner. Nominal/edge behavior assessed in I-01/I-02.                                                                   |
| I-05     | `npm run lint`                                                                                                                                                                      | 0    | 0 errors, same 1 existing tracking warning; no new suppression or allowance.                                                                                                           |
| I-06     | `npm run audit:i18n`                                                                                                                                                                | 0    | No orphan catalog keys. This is the exact new CI gate.                                                                                                                                 |
| I-07     | `npm run build`                                                                                                                                                                     | 0    | TypeScript project build and Vite succeed; existing independent route chunks retained.                                                                                                 |
| I-08     | `npm run audit:fixtures:check`                                                                                                                                                      | 0    | 25 current reviewed decisions, no pending/stale cases.                                                                                                                                 |
| I-09     | `npm run audit:cycles`                                                                                                                                                              | 0    | No synchronous production cycle.                                                                                                                                                       |
| I-10     | `npm test`                                                                                                                                                                          | 0    | 346 application files / 2,605 tests; 34 generic skill files / 765 tests. Total 3,370 tests.                                                                                            |
| I-11     | `npx prettier --check . ../../.github/workflows/ci.yml`                                                                                                                             | 0    | Changed authored files and CI workflow formatted. Final dossier-only formatting is checked again after closure records.                                                                |

Additional read-only checks: workflow parses with PyYAML and contains the exact catalog command; `git diff --check` passes. Installed ESLint preset and complete plugin directory match the frozen skill sources. Effective configuration enables component-role at error severity. No source/rule/config mutation occurred during phase 1.

[Implementation review](evidence/implementation-review.json), [fixture reconciliation](evidence/fixture-refresh-review.json), and [final hashes](evidence/final-files-manifest.json) retain exact affected owners and the introduced-code obligations.

## Completion review

Both phases complete. P-001/P-002/P-003 are verified, two proven violation families are resolved, and the bounded catalog prevention gap is closed. No pending user choice, new exception or introduced-runtime obligation. Baseline/final metrics are retained separately. Existing ignores and all possible functional/performance behavior are not certified. The source/fixture/compiler ownership choices from earlier audits remain intact. No new runtime API, entity, store, helper or component was extracted; the sole addition is a meaningful sibling regression test. Final documentation-only checks are recorded below.

Final supplementary closure: `npm run build-storybook` exits 0 on the corrected source; existing dependency directive warnings remain nonfatal. `npm run audit:architecture` exits 0 with the same 40 reviewed candidates; no new unresolved responsibility. Final metric calculator exits 0 with zero open proven families, score 100/100 under the recorded scope/exception limits. Final dossier formatting and whitespace verification run after these records.
