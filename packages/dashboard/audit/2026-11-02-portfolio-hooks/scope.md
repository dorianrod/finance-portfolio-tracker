# Audit scope

## Request and phase status

Reference date: 2026-11-02. Request: `generic-react-best-practices audit et fix` with five IDE files. Focused scope: the five files below, tracing direct dependencies and consumers for evidence. This is not a full dashboard audit. Project root: packages/dashboard. Audit root: audit/2026-11-02-portfolio-hooks.

audit: complete. implementation: complete. Both phases authorized by the explicit audit-and-fix request; no architecture arbitration needed.

## Frozen inputs

Starting revision: 33639a61b245001d5420fe269e78ccb801998656. Staged/unstaged source changes: none. No untracked authored sources at baseline. Source, selected rule, skill, package/lockfile, effective adapter, fixture ledger and formatting hashes: [baseline manifest](evidence/baseline-manifest.json). [Effective test ESLint rules](evidence/contracts-and-config.json). Installed Vitest 4.1.12; TypeScript 6.0.3; tool versions remain bound to the unchanged lockfile. Warning ceiling: 1, baseline 0 errors/1 warning outside the focused scope.

## File inventory and exclusions

- `src/domains/portfolio/shared/services/usePortfolioAllocationData.ts`
- `src/domains/portfolio/shared/services/usePortfolioFilterOptions.ts`
- `src/domains/portfolio/shared/services/usePortfolioAllocationData.test.tsx`
- `src/domains/portfolio/shared/apis/queries/useGetFilteredPortfolioHistoryQuery/filteredHistoryResponseSchema.ts`
- `src/domains/portfolio/features/performance/pages/PerformancePage.feature.tsx`

Direct evidence includes PerformancePage.feature.test.tsx, useGetFilteredPortfolioHistoryQuery.test.ts, usePortfolioSourceData.test.tsx, cached-source API wrappers/options, filter builders, model/route callers and existing mocks. They are supporting inspection, not an expansion to a full audit of their owners. Existing sibling ownership was checked by exact classified filenames. No runtime module extraction or move is proposed. Add the planned new sibling test as an explicit implementation delta.

Generated output, dependencies and unrelated capabilities are excluded. Existing ignores receive metadata/unused checks only; technical revalidation was not requested. There are no suppressions in the five files. The one dashboard tracking warning is outside this scope and its prior approval is not renewed.

## Rule inventory

Closed selection: the 31 named rules and their actual impacts in [baseline metric input](evidence/baseline-metrics-input.json), with individual coverage below. This focused selection covers source ownership, passive cache reads, schema contracts, read-only state, relevant type/collection contracts, testing and formatting. No shared/ui implementation review; Tailwind companion is not applicable.

## Required checks and completion criteria

From packages/dashboard: full npm run lint (max-warnings 1), npm run typecheck, focused baseline/final Vitest cases, final npm test, npm run audit:fixtures:check after inspecting the fixture delta, Prettier checks, source snapshot colocation comparison and packaged audit metrics. Architecture inventory supports the selected role review; inspect only these files' candidates. No production change means builds and browser interaction checks are not required. Record exact commands/results in verification.md. Before editing, finish diagnosis/plan; after implementation, check nominal and empty/cache-update cases, new-file obligations and unchanged source hashes.

## Checkpoint

Phase 1 closed before test changes. F-001 is a prevention opportunity, not a proven runtime defect or retroactive new-file violation. P-001/P-002/P-003 are verified: seven new regression cases, reviewed fixture fingerprint, complete lint/type/fixture/test/format checks. Baseline inventory retained; one new test module and one ledger metadata delta explicitly reviewed. No pending inspection or user decision.
