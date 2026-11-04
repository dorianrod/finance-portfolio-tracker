# Corrective plan

## Implementation scope and authorization

The explicit 2026-10-31 audit-and-fix request authorizes both phases and improvements addressing prior misses. Phase 1 completed before source changes. Source inputs and prior decisions are frozen. No runtime behavior change, dependency upgrade, remote write or existing-exception revalidation is needed.

## Prioritized actions

| Action | Findings / priority | Option and affected owners                                                                                                 | Status   | Dependencies                      | Acceptance / outcome                                                                                              |
| ------ | ------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| P-001  | F-001 / MEDIUM      | fix; reject unavailable semantic/scope analysis in generic collector, with portable bad/good regressions                   | verified | none                              | Invalid-input CLI exit 2; valid actual dashboard inventory unchanged; final generic/integration suite             |
| P-002  | F-002 / MEDIUM      | fix; fingerprinted candidate-review validator, versioned dashboard ledger, explicit CI command and rule/tool documentation | verified | P-001 stabilizes collector inputs | 15 reviewed candidates accepted; unknown/stale/duplicate/orphan decisions rejected; installed CLI and full checks |

P-001 implementation: compiler diagnostics plus filesystem/program test reconciliation; retain genuine empty-source behavior and project aliases. P-002 implementation: opt-in --review mode; no automatic semantic decisions or universal type-match errors. Add sibling generic tests; project integration stays in tests/eslint. No new production runtime owner is introduced. Add no architecture comment for routine tooling/fixture review mechanics.

## User decisions

No unresolved arbitration. Existing 15 keep decisions and domain ownership remain valid under exact matching inputs. No request to renew suppression approvals.

## Rule and enforcement feedback

Preserve bounded collection mode and full lint warning gate. Enforce input availability and review freshness; keep business meaning manual. Reusable logic uses generic paths/configured roots, not finance-specific entities or paths. Review ledger is project data. Compiler/check/contract changes require review, without automatically granting approval.

## Follow-ups and plan changes

Prior misses are analyzed in root-causes.md. Opaque builders, computed dynamic keys and noncanonical support contracts remain manual. Broader static business-ownership inference is deferred because no sound bounded implementation is established. Required fixes above are not deferred.

P-001/P-002 implementation delta: the new scope check rejected the real Storybook catalog test omitted by the default app project. Add the dedicated analysis-only `tsconfig.fixtures.json`, select it in both package commands and include its full source in fingerprint validation. This closes the input-availability finding without widening production tsconfig or suppressing the new check. Preserve the added generic tests' nominal modules with explicit module markers: stricter diagnostics correctly exposed their formerly hidden duplicate global declarations. No application test data changes were needed.

## Verified outcomes

- P-001: actual compiler diagnostics and omitted tests fail with exit 2; the valid isolated neighbor and complete 240-test dashboard project pass. The additional Storybook test is explicitly asserted in installed integration. See phase2-calibration.json, phase2-inventory-delta.json and final-tests-tests.txt.
- P-002: 15 explicit project decisions pass the installed --review CLI and CI command. Unknown, moved/disappeared, changed-test, changed-analysis, duplicate and malformed decisions are rejected; a valid owning-factory consumer is accepted. Input binding covers all non-test in-source program inputs, preventing stale transitive type/consumer decisions. See final-review.txt, fixture-review.test.mjs, cli.integration.test.mjs and phase2-relocation.json.
- Final checks: 2,327 application/integration tests plus 726 generic tests pass; uncached lint has 0 errors/143 warnings, formatting/TypeScript/builds pass. Source colocation has 0 missing/0 pending. No authorized action or arbitration remains.
