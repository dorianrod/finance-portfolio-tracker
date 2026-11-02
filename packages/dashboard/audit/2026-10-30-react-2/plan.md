# Corrective plan

## Implementation scope and authorization

Implementation: complete. The user explicitly requested implementation, followed by repeatable impact volumes and score. P-001–P-005 and reporting action P-006 are authorized and verified. The preceding proposal/prevention analysis is preserved in evidence/phase2-before-closure-plan.md and evidence/prevention-review.md. No user arbitration was required.

## Prioritized actions

All actions have the owning rules' MEDIUM impact. Fixture ownership precedes new sibling test data so additions follow the existing convention; this is a dependency within equal priority.

### P-002 — Centralize the confirmed fixture baselines

- Findings and priority: F-002; test-mock-data, MEDIUM.
- Action and proposed option: fix; reuse typed owner factories and preserve scenario values with explicit overrides/profiles.
- Status: verified.
- Authorization or choice: explicit implementation request; existing ownership selects fixture profiles, with no unresolved design choice.
- Dependencies: none; P-001 can proceed independently when it uses existing canonical mocks.
- Implementation: migrate all confirmed locations in evidence/fixture-locations.json; reuse portfolio/shared/mocks position, operation, filter and fund factories; place missing coverage/history/allocation/series/support fixtures at their nearest consuming feature/shared owner. Keep every current effective value. Avoid changing shared default values used by unrelated tests. Keep the 23 explicitly retained scenario/update/transport candidates. No architecture decision comment is warranted for routine fixture placement; existing source choices remain authoritative.
- Acceptance: all confirmed local fixture factories/baselines resolve to typed mock owners; focused affected tests and full npm test, npm run typecheck and npm run lint -- --no-cache pass. Preserve the 143 ceiling. Where helpful, compare serialized old/new test inputs in an isolated migration probe, without permanent implementation-mirroring tests.
- Outcome: verified I-001/I-002/I-006/I-009. Canonical fixtures and feature profiles own the 41 test baselines; six existing fixture modules moved to common owners. All 17 profiles retain identical outputs in 32 isolated comparison cases; no production runtime behavior changed.

### P-001 — Give the seven new owners sibling behavior tests

- Findings and priority: F-001; test-colocated-tests, MEDIUM.
- Action and proposed option: fix; relocate appropriate direct assertions and add focused missing edge cases.
- Status: verified.
- Authorization or choice: explicit implementation request; no arbitration required.
- Dependencies: follow P-002 fixture conventions; the runtime architecture stays settled.
- Implementation: add DashboardSourceBoundary.view.test.tsx, DashboardSources.feature.test.tsx, services/useCachedDashboardSources.test.tsx, MiniDonut.view.test.tsx, OverviewPeriodFilter.view.test.tsx, AssetIrrResults.view.test.tsx and useCachedPortfolioSourceQuery.test.tsx beside their sources. Verify error containment, parallel source starts, cache success/pending/error observation with no extra network acquisition, percentages/empty entries, nullable/empty IRR result data and the named period-open action. Retain shell/navigation/network integration coverage. No cosmetic snapshots or empty tests; no production changes should be necessary.
- Acceptance: seven matching siblings, each with nominal plus edge/error assertions; userEvent/semantic queries, fresh providers and network-boundary stubs as applicable. Full tests/types/unchanged lint budget pass.
- Outcome: verified I-001/I-002/I-005. Seven source siblings now cover query observation, source orchestration/error containment and supplied-data presentation/interaction; shell integration coverage remains.

### P-003 — Detect unmistakable typed fixture factories outside mocks

- Findings and priority: F-002 prevention; test-mock-data, MEDIUM.
- Action and proposed option: fix by strengthening the existing reusable check, not adding a competing detector.
- Status: verified.
- Authorization or choice: explicit implementation request for the documented prevention plan.
- Dependencies: use P-002's genuine factory cases and valid neighbors; develop in isolation and enable alongside its corresponding fixture cleanup. Independent of UI behavior.
- Implementation: extend the skill's existing test-fixture-contract rule and its regression suite for complete explicitly typed domain-entity base factories in tests, including aliased types/union variants and optional Partial overrides. Keep detection scoped to proven complete bases, without names hardcoded to this application. Update the owning rule's stated coverage/limits and add consumer integration cases through actual calculated configuration. Do not claim automatic classification of every object literal or fixture's ideal business owner.
- Acceptance: intended rule at severity 2 rejects a complete local base factory; the same factory in mocks and tests calling it with Partial overrides pass. Raw schema input, expected values, state updaters, incomplete case params and unrelated functions remain valid. Generic and application integration suites plus full lint/types pass; no severity reduction, suppression or budget increase.
- Outcome: verified I-001/I-002/I-006/I-008. local/test-fixture-contract now rejects complete explicitly typed local domain defaults factories at severity 2; generic and actual configured positive/negative cases pass. The original concentration test produces two intended diagnostics; the corrected test produces none. Bounded unsupported forms remain documented.

### P-004 — Reconcile distinct obligations and newly introduced code before closure

- Findings and priority: F-001/F-002 prevention; owning testing rules MEDIUM; no new catalog severity.
- Action and proposed option: fix the audit method/output contract and add a short owning reference in SKILL.md.
- Status: verified.
- Authorization or choice: user subsequently requested implementation of the prevention plan.
- Dependencies: none; complements P-003/P-005 rather than depending on detector coverage.
- Implementation: record which distinct obligations are covered automatically/manually and keep unexamined obligations pending. Preserve original phase-1 evidence but add a phase-2 delta for actual added/extracted/moved modules and all triggered requirements. Detailed files, proposed wording and limits are in evidence/prevention-review.md. Avoid a full file-by-rule Cartesian checklist.
- Acceptance: typed/fixed-date evidence cannot close fixture placement; an extracted/new module with integration coverage cannot be called compliant without resolving the existing sibling requirement. Unchanged supported decisions/ignores remain preserved. Documentation validation establishes structure only, not semantic review quality.
- Outcome: verified I-008/I-009. Method/output/SKILL and owning rules require distinct obligation evidence and final introduced/extracted/moved-owner reconciliation; baseline evidence is retained and final coverage is explicit.

### P-005 — Add a provenance-aware sibling-test presence command

- Findings and priority: F-001 prevention; test-colocated-tests, MEDIUM.
- Action and proposed option: fix with a reusable script bound to the existing rule, run during audit implementation closure.
- Status: verified.
- Authorization or choice: explicit implementation request; new packaged command and project alias implemented. CI publication/execution was not requested.
- Dependencies: P-004 defines closure evidence; use P-001's cases and retain a reviewed move map. Permanent tests must be independent of ignored application audit artifacts.
- Implementation: compare an explicit frozen source inventory with actual current files, including untracked additions; classify introduced/extracted runtime owners versus proven moves/type-only/excluded roles. Reject missing siblings for proven new owners. Keep unresolved provenance/roles pending. Put invocation/limits in test-colocated-tests and project-enforcement; keep Git state out of ordinary ESLint. See evidence/prevention-review.md for exact owning files and regression cases.
- Acceptance: new source without a sibling fails; sibling passes presence; moves and untracked additions are handled correctly; missing baseline and ambiguous classification never pass silently. Nominal/error/edge behavior remains a semantic check, so empty sibling files cannot close the overall requirement. Generic temporary-project and consumer integration checks pass without lowering gates or inventing a historical-file blanket policy.
- Outcome: verified I-002/I-005/I-008. Packaged react-best-practices-test-colocation and audit:colocation alias validate snapshots/provenance, include untracked files, reject missing/unavailable/pending evidence and distinguish moves. Historical replay finds exactly the seven missed siblings; current delta has no missing/pending owner. Meaningful assertion coverage remains manual.

### P-006 — Report stable impact volumes and a versioned score

- Findings and priority: user-requested reporting enhancement, separate from proven code violations.
- Action: implement a reusable deterministic metrics calculator and owning output/method contract; retain baseline and final snapshots.
- Status: verified.
- Authorization: explicit user follow-up requesting counts by HIGH/MEDIUM/etc and a consistently calculated score.
- Dependencies: final verified finding statuses and rule coverage; calculation can be developed independently.
- Implementation: count confirmed violation families by their highest actual owning-rule impact; list affected files separately. Score the set of applicable reviewed rules using fixed weights (CRITICAL 32, HIGH 16, MEDIUM-HIGH 8, MEDIUM 4, LOW-MEDIUM 2, LOW 1). Each violated rule contributes once, independent of finding grouping/location counts. Formula: 100 × (1 − open violated-rule weight / applicable-rule weight). Withhold a numeric score when inspection is pending. Display scope, coverage and unreviewed exceptions beside it; 100 describes the reviewed scope, not universal code safety.
- Acceptance: portable calculator/CLI tests cover weights, grouping invariance, resolved/ambiguous findings, invalid inputs and incomplete coverage; reports retain before/after metrics with formula version and caveats.
- Outcome: verified I-002/I-007/I-008. Packaged metrics calculator and audit:metrics alias emit fixed v1 weights/formula, all six impact volumes and scope/exception limits. Baseline 99.31; final 100.00; two MEDIUM families resolved. Machine inputs/results are preserved.

## User decisions

No pending user arbitration. All six actions are verified. Runtime ownership, feature/view boundaries, source concurrency and canonical theme generation remain supported. The authorized implementation preserved settled architecture choices.

## Rule and enforcement feedback

F-002 is a missed application obligation under the unchanged fixture contract, not a new preference. P-003 proposes partial deterministic prevention and an honest coverage-limit update to the owning rule. P-004 makes the remaining obligations and implementation delta explicit. P-005 checks new-owner sibling presence using reviewed provenance rather than ordinary ESLint/Git heuristics. The existing fixture rule is strengthened at its original severity; the lint ceiling remains 143. Semantic judgments about fixture identity/ownership, meaningful nominal/edge coverage, component contracts and query necessity remain manual.

## Follow-ups and plan changes

The user's prevention follow-up promotes the former optional sibling-presence investigation to the concrete P-005 proposal, with frozen-inventory/move provenance and explicit analysis limits. CI adoption remains a separate integration choice; no CI rewrite or broad historical policy is proposed here. No unmeasured performance tuning, compiler-option migration, existing-ignore revalidation, publishing or remote CI work is included.

The final scope adds two read-only ignore-policy inputs (.gitignore and packages/dashboard/.gitignore) to the original 1,316-file inventory; evidence/files-initial.json preserves the original list. No original target was removed. F-002 was added after completing the fixture candidate investigation; no unresolved candidate is hidden as a follow-up.


## Verification and current outcome

All P-001–P-006 obligations meet I-001–I-009. [Verification](verification.md#implementation-checks) preserves baseline, intermediate failures and final gates. Runtime application code, eight architecture decisions and 142 existing exception directives are unchanged. No new ignore, lowered severity, warning headroom, commit or remote write was introduced.
