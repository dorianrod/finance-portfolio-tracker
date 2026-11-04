# Audit findings

## F-001 — Incomplete TypeScript analysis can look like a clean fixture inventory

- Kind: prevention-gap
- Rule IDs and actual impact: test-mock-data, MEDIUM.
- Affected files, symbols and callers: reusable scripts/fixture-candidates.mjs, findFixtureCandidates; its generic tests and the dashboard audit:fixtures command. The dashboard source compiles; the initial inventory included 239 source tests but silently omitted the separate Storybook catalog test. This is an analyzer coverage defect, not a proven runtime or fixture-placement violation.
- Proposed action: fix.
- Plan actions and related code decision identifiers: P-001. No business architecture decision changes.

### Requirement and evidence

The owning rule's Complete sample inventory requires missing/invalid analysis input to fail rather than return a misleading clean result. [Four isolated real-TypeScript probes](evidence/baseline-calibration.json) demonstrate: a valid one-field sample yields one candidate; excluding its test via tsconfig yields success with zero tests/candidates; an unresolved imported builder yields success with zero candidates; an invalid canonical contract referring to MissingType also succeeds. The collector checks JSON/options and test syntax, but not semantic diagnostics, contract syntax or filesystem/project test completeness.

### Why this matters

A zero inventory may mean unavailable evidence. Audits could repeat the earlier false closure by treating that success as a complete candidate set. No existing dashboard test or financial calculation failed in these probes.

### Alternatives considered

Keep the current output and require a separate typecheck/scope check: workable for a careful auditor, but the standalone reusable CLI still misreports unavailable analysis. Recommended: reject compiler diagnostics and tests present under the selected source but absent from the program. This is a mechanical reliability correction; there is no business ownership choice. Silently injecting excluded tests into the program would change the consuming project's configuration and is rejected.

### Proposed corrective plan

P-001 validates the effective compiler program, inventories filesystem test paths and rejects omitted tests with actionable messages. Preserve valid empty projects, aliases and explicit root/source/project options. Add invalid/valid tests including syntax-invalid canonical types, unresolved imports, inherited exclusions and a genuinely empty source. Do not widen tsconfig or ignores.

### Decision or clarification required

None. The existing fail-on-unavailable-input contract and user audit-and-fix authorization select this correction.

### Acceptance and prevention

Bad inputs above fail with CLI exit 2; valid neighbors retain normal candidates and exit 0. Dashboard inventory still resolves the same 15 candidates. Generic and installed-package integration checks cover the behavior. This does not prove domain ownership or discover opaque builders.

## F-002 — Candidate dispositions exist only in ignored audit dossiers

- Kind: prevention-gap
- Rule IDs and actual impact: test-mock-data, MEDIUM.
- Affected files, symbols and callers: fixture collector CLI, project package.json, CI dashboard job and the existing 15 reviewed candidates across 9 source test files. The 15 candidates are conforming scenario/action/policy/transport data.
- Proposed action: fix.
- Plan actions and related code decision identifiers: P-002, after P-001; no runtime decision comment required.

### Requirement and evidence

The rule expressly separates candidate collection from semantic ownership review: successful inventory is not compliance. The previous audit implemented collection and retrospective replay, but CI still runs format:check, npm test and build only. The installed integration test checks a handful of known locations and tolerates unrelated new candidates. The current 15 concrete dispositions are in a gitignored dossier, with no configured command validating their completeness or freshness. This is a prevention opportunity, not a violation merely because a detector is absent.

### Why this matters

Adding a complete inferred inline sample in another test can leave every CI gate green. The earlier omitted-shape fixes improve enumeration, but do not make the review step repeatable or required.

### Alternatives considered

Reject every structural match in ESLint: unsound for the 15 verified action, scalar, policy and raw validation/network cases. Keep manual dossier-only review: conforming but not durable CI prevention. Recommended: an opt-in reviewed-inventory mode using explicit keep reasons bound to input fingerprints. Collection remains available independently; the gate requires review rather than inventing ownership semantics. Opaque constructions remain manual.

### Proposed corrective plan

Add a generic --review mode and a validator with stable file/line/column identities. Persist the 15 existing semantic decisions in a versioned project ledger outside audit/. Bind decisions to their test file, canonical contract inputs, effective compiler settings, TypeScript version and collector/validator implementations. Reject new, stale, duplicate or orphan reviews; never autoapprove candidates. Wire an explicit audit:fixtures:check command into CI and exercise it through the installed CLI. Update owning rule/tool binding docs with actual analysis limits and review-refresh procedure.

### Decision or clarification required

None. Existing reviewed keep decisions are retained; the user expressly requests deterministic improvements and immediate fixes. Fingerprint schema and equivalent command names are routine implementation details.

### Acceptance and prevention

The actual project gate passes with exactly 15 explicit reasons. Introducing an inferred fixture elsewhere makes it fail; a valid owning-factory consumer passes. Changed test/contract/check/config fingerprints require a fresh semantic review; malformed ledgers fail with exit 2, pending/stale reviews with exit 1. Application and generic suites, unchanged-ceiling lint, typecheck, formatting and builds pass. No approved warnings or suppression scope are widened.

### Phase-2 evidence delta for F-001

The filesystem/program comparison additionally rejected `src/shared/ui/storybook/catalog.test.ts` on the real dashboard app project. The test was compiled separately by the existing Storybook project and executed by npm test, but absent from fixture enumeration. The dedicated analysis configuration includes it; all original candidate/exclusion decisions remain identical. This is concrete application evidence of the scope-availability gap, beyond the isolated probes.
