# Audit findings

## F-002 — Unknown fund exposure is displayed as a known zero

- Kind: violation.
- Rule IDs and actual impact: `yup-last-coercion-barrier`, HIGH. `helpers-formatter-hooks` is a correction constraint, not an additional scored violation.
- Affected files, symbols and callers: `src/domains/portfolio/features/holdings/features/positions/components/FundPositionHoldingRow.feature.tsx:18`, `FundPositionHoldingRow`, called by `FundPositionPopover/FundPositionPopover.feature.tsx:36`.
- Proposed action: fix.
- Plan actions and related code decision identifiers: P-001; routine correction, no new architecture decision.

### Requirement and evidence

The rule keeps null-to-default conversion at the validation boundary and separates a formatter's display fallback from domain values. `RawPosition.total_value` is explicitly nullable because an incomplete valuation must remain unknown; `PositionRow` inherits that contract, and `snapshotPositionValues` preserves null. The row instead executes `position.total_value ?? 0`, multiplies it by the holding's weight and displays `0 €`. An isolated baseline reproduction renders a null-valued position at weight 0.25 and finds `0 €`, with no `—` placeholder. Normal rendering of a known zero remains legitimate. The numeric-default exception for actual business calculations does not justify inventing a known monetary exposure from this explicitly unknown source valuation.

### Why this matters

The detail panel presents missing data as an exact zero-valued holding. This contradicts the adjacent position table, which passes the nullable amount to the existing formatter.

### Alternatives considered

Preserve null in the derived holding amount and use the existing formatter: conforms and preserves the distinction between zero and missing data. Hiding the entire holding loses its known identity/weight. Changing the source schema to default zero contradicts its documented domain contract. No component extraction is necessary for one multiplication and a nullable result.

### Proposed corrective plan

P-001 calculates `holdingValue` only when `position.total_value` is known, passes that nullable value directly to `formatMoney`, and adds a sibling parametrized behavior test using existing owning fixtures for null, zero and nonzero source values.

### Decision or clarification required

None. The existing nullable source contract selects the behavior; the user already authorized corrections. Git history `49ff887b`, `bbded428`, `309c9f02` changed presentation/imports without requiring null to become zero. Source-type history `5590cc7f` and the current explicit comment support preserving unknown values. No prior architecture decision is reversed.

### Acceptance and prevention

Null displays `—`; zero displays `0 €`; 1,000 at 0.25 displays `250 €`, retaining the 25.00% known weight. The regression test must fail against the baseline. Review confirms this is the only component `total_value ?? 0` instance. No blanket prohibition on calculation defaults is sound: reducers and partial totals have different business meanings. Existing TypeScript nullability and a direct behavior regression are the appropriate protection.

## F-001 — Five obsolete catalog keys fail the application translation check

- Kind: violation.
- Rule IDs and actual impact: `i18n-static-keys`, MEDIUM.
- Affected files, symbols and callers: `src/i18n/locales/en.json:18`, `:96`, `:480`, `:482`, `:494`; `tests/eslint/catalog-enforcement.integration.test.js` contains isolated examples referring to the obsolete loading key.
- Proposed action: fix.
- Plan actions and related code decision identifiers: P-002; no architecture decision needed.

### Requirement and evidence

The owning rule requires catalog usage verification and investigation of unused entries. `npm run audit:i18n` exits 1 with these five keys:

- `ui.diversificationcharts.loadingBreakdowns`
- `ui.app.loading`
- `ui.overviewsummarycards.depositsMinusWithdrawalsDuringThePeriod`
- `ui.overviewsummarycards.grossMarketValueBeforeEstimatedTax`
- `ui.overviewsummarycards.previous`

A repository search confirms no production consumer. Current copy uses `loadingAnalysis`, fuller comparison descriptions and `previousValue`. The loading key appears only inside five ESLint probe strings, outside application source. It is not a hidden production use or unsupported translation binding. Catalog history `91571196`, `45beef80`, `b9d6a7da` and detector-example history `c800e284` inspected; the current copy is retained.

### Why this matters

The declared application translation check fails, and obsolete strings remain maintained after their screen consumers disappear.

### Alternatives considered

Remove the obsolete entries and use an existing live key in detector examples: preserves displayed copy and the intended detector calibration. Adding fake production references merely to keep entries would conceal the defect. Keeping unused product strings solely for probe data is unnecessary.

### Proposed corrective plan

P-002 replaces only the exact `ui.app.loading` string in detector examples with `ui.app.loadingAnalysis`, then deletes the five orphan entries. Existing catalog and configured-rule tests establish both directions.

### Decision or clarification required

None; this is deterministic cleanup of verified orphan entries, without changing live user-facing wording.

### Acceptance and prevention

Application catalog usage exits 0; configured invalid/valid examples still check their intended rule at the expected severity. P-003 makes that existing application command a CI gate.

## F-003 — CI omits the existing application catalog-usage gate

- Kind: prevention-gap; no additional scored application violation.
- Rule IDs and actual impact: `i18n-static-keys`, MEDIUM.
- Affected files, symbols and callers: `../../.github/workflows/ci.yml`, dashboard job.
- Proposed action: fix.
- Plan actions and related code decision identifiers: P-003.

### Requirement and evidence

The current workflow runs formatting/lint, fixture review, tests and build, but never the application's `audit:i18n` command. All those baseline checks pass while F-001's catalog-usage command fails. Missing-key lint and the generic scanner suite do not establish the actual application's unused-key consistency.

### Why this matters

The same proven failure can pass CI again when source consumers are removed.

### Alternatives considered

Add the existing `npm run audit:i18n` command to the dashboard CI job. A duplicate custom scanner or catalog-specific ESLint suppression is unnecessary. The existing command also performs quiet source lint; this duplicates some validation but preserves the documented command and its binding contract.

### Proposed corrective plan

P-003 adds a named translation-catalog check after formatting/lint. No warning ceiling, detector severity, catalog contract or ignores change.

### Decision or clarification required

None. This is bounded deterministic prevention expressly included in the authorized corrective plan. Workflow history `cbfc5844` and `f3065b04` shows previous additions of formatting and fixture gates; no contrary policy or decision exists.

### Acceptance and prevention

The exact CI command fails for the baseline five orphan keys and passes after P-002. Existing scanner regressions cover unrelated bindings/aliases and unused keys. Remote GitHub execution is outside this local correction; validate the workflow's command and local gates without claiming a remote run.
