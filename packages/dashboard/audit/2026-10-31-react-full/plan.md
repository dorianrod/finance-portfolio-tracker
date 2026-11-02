# Corrective plan

## Implementation scope and authorization

The user explicitly requested a full audit and immediate fixes. All corrections below are within that authorization. No authorization to commit, publish or deploy was requested or inferred. Existing ESLint suppressions retain their dates and rationale; technical revalidation is outside this request.

## Prioritized actions

### P-001 — Prepare account chart totals before views

- Findings and priority: F-001; CRITICAL.
- Action and proposed option: fix; chart-owned features and pure transformers, existing presentation contracts retained except required prepared totals.
- Status: verified.
- Authorization or choice: audit-and-fix request plus existing dashboard chart-preparation convention in README.
- Dependencies: none. P-002 is independent; P-003 follows by impact.
- Implementation: add `AccountTypeBreakdownChart.feature.tsx` and `AccountTypeHistoryChart.feature.tsx`, pure component-owned total helpers and sibling tests; update existing chart/tooltip views, history chart point type, presenters, WealthTab and all consumers. Add `prepared-account-type-breakdown` and `prepared-account-type-history` comments. Keep visual coordinate/series adaptation in presenters.
- Acceptance: nominal, empty, missing-key, unusual-key and input-immutability tests; 90/300 = 30% preserved; raw negative amounts included in the denominator; existing component-role detector rejects importing the new business transformers from a view, with presenter indirection retained as a manual semantic obligation. Typecheck/lint/tests/build and introduced-owner colocation pass.
- Outcome: Two wealth chart features now prepare reporting totals through component-owned pure transformers; existing views receive required portfolioTotal/prepared historical total. WealthTab and tooltip callers were migrated. Keyboard/empty/negative-key/immutability cases pass (E16/E38); the compiler rejects omitted totals with TS2741/TS2322 and accepts prepared neighbors (E38). Both code decisions are present. E26/E27/E28/E30/E35/E37 verify types, builds, dependencies, tests and lint.

### P-002 — Explain nullable contract fields

- Findings and priority: F-003; HIGH.
- Action and proposed option: fix; document current absence semantics at the recorded fields.
- Status: verified.
- Authorization or choice: explicit rule contract and audit-and-fix request.
- Dependencies: none; no runtime changes.
- Implementation: follow `nullable-contract-candidates.json`, read producers and add concise English absence reasons; preserve comments already shared by same-reason fields and inherited contracts.
- Acceptance: source/caller review, typecheck, formatting. No new tests needed for comments.
- Outcome: Absence rationale is documented at the affected public/support contracts and their same-named local consumers; existing shared threshold rationale remains intact. E36 confirms all 28 candidate files retain identical non-trivia TypeScript tokens, including the unchanged threshold source. E26/E37 verify typing/formatting; no runtime test was added solely for comments.

### P-003 — Extract the pure data-quality assessment

- Findings and priority: F-002; MEDIUM-HIGH.
- Action and proposed option: fix; page-owned `buildDataQualityAssessment` transformer and sibling test, with a presentation-only adapter.
- Status: verified.
- Authorization or choice: owning helper rule and explicit audit-and-fix request select the narrow existing page owner.
- Dependencies: none; follow P-001/P-002 by impact.
- Implementation: extract diagnostic calculations/private affected-asset grouping without changing behavior; keep translated theme and recommendation policy in presenter; add `data-quality-assessment-before-presentation` comment.
- Acceptance: empty/loading/not-applicable/partial coverage and fund issue cases; canonical fixtures, no internal mocks; unchanged presenter and integration results. Lint/type/tests/colocation pass.
- Outcome: The page-owned buildDataQualityAssessment transformer owns the 17 unchanged diagnostic statements and private affected-asset grouping (E36). Its five normal/edge scenarios and existing presenter/DataQualityTab callers pass in E16/E38. Presentation still owns labels/theme priority; the code decision records that boundary. No new rule suppression or detector heuristic was introduced.

### P-004 — Reconcile actual additions, fixture decisions and final evidence

- Findings and priority: closure obligations, not a new defect family.
- Action and proposed option: fix; use the existing compiler/checks as prevention, add meaningful sibling tests for new owners, preserve manual semantic boundary review.
- Status: verified.
- Authorization or choice: skill closure contract, already within the requested fixes.
- Dependencies: P-001 through P-003.
- Implementation: record actual added/moved files; run source-snapshot colocation; review current fixture candidates against all source changes before updating the ownership ledger metadata; preserve reviewed keep reasons when still true. Run the frozen required commands and baseline/final metrics. Save final hashes without replacing baseline.
- Acceptance: no pending owner, false fixture approvals, required failed checks, unresolved required decisions or proven violations; warning ceiling is never raised.
- Outcome: All ten introduced source files and five runtime contracts were re-reviewed (introduced-owner-review.md). E35 reports missing=0/pending=0; fresh E25 fixture review preserves all 15 candidate reasons and changes only sourceSha256, verified by E34 and E38. Every required final gate passes, final source/config hashes match reviewed inputs, and final metrics are 100 with zero open proven families/affected files. Baseline evidence and failures remain preserved.

## User decisions

None pending. Existing architecture choices remain valid. Preparing chart business data in its feature is already documented application policy; routine implementation details do not create a new user arbitration.

## Rule and enforcement feedback

The business responsibility of an inline calculation cannot be inferred soundly from a presenter path or a field name. The current configured `local/component-role` detects direct transformer access from views once ownership is explicit; the E12 probe shows that indirect pure presenter dependencies still require manual review; helper contracts and strict TypeScript protect typed prepared data. Calibrate these existing protections and exercise semantic invariants in behavior tests. No new rule preference, severity reduction, ignore expansion or warning increase is planned. Nullable comment truth remains manual.

## Follow-ups and plan changes

Performance deferral/containment changes require profiling evidence; none is justified here. Protected-file/auth and write-mutation rules are not applicable to the current read-only local dashboard. Record later source deltas and newly exposed equivalent violations here before changing scope.

2026-10-31 implementation delta: extend the existing application compiler-contract test table with rejected raw chart props and valid prepared neighbors (P-001/P-004). E12 showed indirect pure-presenter aggregation is outside the current detector; preserve that baseline limitation and use required typed preparation rather than claiming a new transitive ESLint guarantee.

2026-10-31 verification delta: the two new compiler-contract cases resolve the actual Recharts declaration graph. Under full-suite concurrency their first run exceeded Vitest's default 5-second per-case limit (6.2/5.2 seconds). Give this typed integration table the same explicit 30-second allowance used by other typed suites; preserve all invalid/valid assertions and rerun the full application gate. This changes test scheduling tolerance, not application rules or warning ceilings.
