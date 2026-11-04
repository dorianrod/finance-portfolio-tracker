# Corrective plan

## Implementation scope and authorization

Implementation: complete. On 2026-10-31 the user explicitly requested implementation and investigation/improvement of missed detection, authorizing P-001 and promoting P-002 from deferred prevention. [Original phase-1 plan](evidence/phase1-plan.md) and [phase-2 start](evidence/phase2-start.json) preserve authorization, frozen inputs and the original proposal. Starting source/contract fingerprints matched; no user arbitration was necessary.

## Prioritized actions

### P-001 — Move confirmed test sample defaults to their owning typed mocks

- Findings and priority: F-001; `test-mock-data`, MEDIUM.
- Action and selected option: fix; reuse canonical factories and add missing typed entity factories in their existing owning feature/shared mocks.
- Status: verified.
- Authorization: explicit user implementation request on 2026-10-31; ordinary placement selected by the existing contract and consumers.
- Dependencies: none; P-002's candidate enumeration revealed two equivalent additional in-scope locations, included in this action.
- Implementation: migrated all 12 original test files plus `toLatestAllocationByIsin.test.ts` and `buildAllocationPieData.test.ts`. Reused raw-data/allocation/savings/quality-props factories; added six typed owners for dashboard data, fund holdings data, fund diagnostics, cumulative concentration points, wealth drivers and contribution filters. [Input deltas](evidence/phase2-input-deltas.json), [additional locations](evidence/phase2-new-equivalent-locations.json). All scenario-specific values and assertions are retained; no application production runtime module changed. Mechanical sample placement needs no architecture comment.
- Acceptance: 18 overlapping references in 14 test files resolve to owned fixtures; exact values and row identity preserved; scoped/full tests, TypeScript, formatting and unchanged-ceiling full lint pass. New-owner colocation and distinct typing/determinism/ownership obligations are checked.
- Outcome: [16 effective input comparisons](evidence/phase2-fixture-input-equivalence.json) pass exactly; fresh factories have typed returns, fixed dates and fresh mutable collections. Current inventory has no remaining proven violation; its 15 candidates and 135 supported exclusions are dispositioned. Colocation reports six fixture-only additions, zero missing/pending runtime owners. Verified by I-001–I-012 in evidence/phase2-checks.json.

### P-002 — Package a complete-shape fixture candidate inventory with regression protection

- Findings and priority: F-001 prevention; `test-mock-data`, MEDIUM; no new rule or business policy.
- Action and selected option: fix; the user explicitly included prevention in the implementation scope.
- Status: verified.
- Authorization: explicit request to investigate why detection missed these cases and improve it.
- Dependencies: none; the concrete P-001 forms supply regression shapes and historical replay targets.
- Implementation: added reusable `scripts/fixture-candidates.mjs` and its sibling tests, packaged CLI entry, actual consumer integration and `audit:fixtures` alias/lock metadata. Updated the owning rule, tool bindings, dashboard documentation and generated guide. Uses actual project aliases, composed/union/mapped/interface types, small records and generated inputs; distinguishes real expected outputs, input calls, shorthand uses, utility aliases and valid overrides. Invalid inputs fail explicitly. No application names/defaults/allowlists live in the generic logic.
- Acceptance: reproduce all 18 known references on the frozen revision; valid mocked overrides, expected/raw/scenario/action contexts retain their distinct disposition. Generic tests and packaged symlink/actual-config integration pass; source/installed package contents match. Existing lint severities and ceiling remain intact.
- Outcome: [Replay](evidence/phase2-fixture-replay-summary.json) reproduces 18/18 known references with zero misses. 31 generic collector cases, one new CLI case and one actual dashboard integration test protect the relevant forms and valid neighbors. The tool deliberately reports candidates without introducing unreliable automatic ownership errors. [Root causes and limits](root-causes.md). Verified by I-001–I-012 in evidence/phase2-checks.json.

## User decisions

None pending. Implementation and prevention were explicitly authorized. All eight source-owned runtime architecture decisions remain unchanged; routine fixture placement introduced no non-obvious structural choice requiring a new comment. No existing suppression was technically revalidated.

## Rule and enforcement feedback

The previous audit omitted intersections/small records and hid inputs lexically contained in assertions; it also closed semantic ownership too early. The existing ESLint detector's bounded scope was documented, not a guarantee of complete fixture placement. [Detailed explanation and evidence](root-causes.md).

Actual added protection: a packaged, regression-tested inventory required by the owning rule's audit binding, including actual consumer/CLI tests. Existing unsafe-cast/clock/local-factory ESLint protection is unchanged at error severity. No new ownership error is inferred solely from structural compatibility; 15 remaining valid raw/scenario/action candidates have explicit manual dispositions.

## Follow-ups and plan changes

Original baseline: one MEDIUM family, 12 affected files, score 99.65. During authorized prevention work, two equivalent input fixtures inside assertions were added to F-001; expanded baseline: the same one MEDIUM family, 14 files, score 99.65. Both original and expanded calculator inputs/results remain preserved; final score is 100 for reviewed obligations excluding 142 unrevalidated directives. [Metrics](metrics.md).

No changes to production runtime, warning ceiling, suppression metadata, dependency versions, CI jobs or publishing. Generic detection limits remain explicit future-review requirements; all current candidates are dispositioned. No additional mandatory correction or user choice remains; all final gates pass.

## Verified completion

P-001 and P-002 are verified against all acceptance criteria and newly triggered obligations. All 3026 tests pass; final lint remains 0 errors/143 warnings with the same ceiling, final tooling 0 warnings, TypeScript and formatting pass. No inspection, correction, arbitration or implementation obligation remains pending. [Verification](verification.md#implementation-checks) and [integrity](evidence/phase2-integrity.json).
