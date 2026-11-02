# Audit findings

No proven catalog violation in the five-file scope. No pending contract arbitration.

## F-001 — Cache subscriptions lack direct nonempty update regressions

- Kind: prevention-gap
- Rule IDs and actual impact: test-colocated-tests (MEDIUM), as guidance for proposed regression tests; not an application violation.
- Affected files, symbols and callers: usePortfolioAllocationData.test.tsx, usePortfolioFilterOptions.ts and its missing sibling test; allocation/quality source consumers and filter-option consumers in scope-selection/positions.
- Proposed action: fix
- Plan actions and related code decision identifiers: P-001, P-002, P-003; no architecture decision change.

### Requirement and evidence

Current allocation test sets only empty source arrays and checks loading. A service returning permanently empty dimension arrays could pass it. The filter-options hook has no sibling regression proving cache updates; history shows an unchanged legacy move, so this is not classified as an introduced-owner colocation violation. Existing source/model/page tests cover related behavior but do not directly assert this hook's complete output. See baseline tests (14 passing) and coverage history.

### Why this matters

An accidentally frozen allocation/filter result would leave financial breakdowns or selectable accounts stale after source cache updates. This is a regression risk, not an observed runtime defect.

### Alternatives considered

Retain existing indirect coverage: conforming but leaves these dynamic contracts weakly protected. Add focused renderHook tests using real QueryClient subscriptions and owning fixtures: selected, bounded and directly observable. A custom static detector cannot soundly prove runtime update behavior; no new ESLint rule or hook redesign is justified. Existing source ownership remains conforming.

### Proposed corrective plan

P-001: parameterized nonempty cache replacement checks for all four allocation dimensions plus explicit readiness distinctions. P-002: same-base filter-options tests for initial results, missing cache, arrival, changed labels, cash aliases and account/type/operation option changes. P-003: inspect new fixture candidates and changed inputs before refreshing the fixture review fingerprint; preserve prior reasons. Use existing mocks, no duplicated fixture defaults or internal mocks. Prove new tests fail for empty/frozen service results using temporary local mutations restored before final checks.

### Decision or clarification required

None. This bounded test prevention is included in the explicit audit-and-fix plan; no runtime architecture change or materially different product behavior is selected.

### Acceptance and prevention

Both services run unchanged through real query observers; cache updates change caller-visible values and empty caches stay valid. New tests fail under frozen/empty output, then pass on the original implementation. Full lint/typecheck/tests and fixture gate pass without new suppressions or warning-budget changes. No generic static enforcement addition: the invariant is runtime reactivity and has no sound bounded syntax-only detector.
