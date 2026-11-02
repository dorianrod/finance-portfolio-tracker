# Corrective plan

## Implementation scope and authorization

Both phases authorized by `audit et fix`. Phase 1 complete before edits. Production code retained; implement bounded cache-regression prevention F-001, without inventing a proven bug.

## Prioritized actions

| Action | Finding / priority        | Option / affected owners                                  | Status   | Authorization / dependencies | Implementation and acceptance                                                                                                                                                        | Outcome                                                                                                                  |
| ------ | ------------------------- | --------------------------------------------------------- | -------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| P-001  | F-001 / MEDIUM prevention | fix: allocation sibling test                              | verified | user audit-and-fix; none     | Assert all dimensions on nonempty cache replacements, successful empty vs missing, fresh wrapper, existing typed mocks. Focused regression and deliberate-empty failure proof.       | Implemented; E-007/E-008 verify actual cache propagation and deliberate regression detection.                            |
| P-002  | F-001 / MEDIUM prevention | fix: add usePortfolioFilterOptions.test.tsx               | verified | same request; none           | Fresh real cache wrapper; expected account/type/operation/labels, empty and live arrival/replacement, cash alias and label-only changes. Deliberately freeze memo and prove failure. | Implemented; E-007/E-008 verify actual cache propagation and deliberate regression detection.                            |
| P-003  | F-001 / closure           | fix: reviewed fixture fingerprints; retain runtime owners | verified | P-001/P-002                  | Inspect baseline/final candidate delta and owning mocks, update only justified review metadata, run lint/typecheck/npm test/fixture gate/format/colocation/metrics.                  | Verified by E-009–E-017: identical 24-candidate review, 3243 full tests, lint/type/fixture/format/colocation gates pass. |

## User decisions

None pending. No reauthorization, role rename, folder move or exception required.

## Rule and enforcement feedback

No rule/config change planned. Existing typed safety, test-style checks, suppression policy and warning budget stay enabled. Runtime regression tests provide the appropriate equivalent protection against stale cache-derived outputs. New sibling is a test module; no independent runtime owner is introduced.

## Follow-ups and plan changes

Full dashboard audit, existing exception technical revalidation and alternative production structures are outside the focused request. Preserve baseline/final snapshots separately and append any actual scope delta here.

Closure: P-001/P-002/P-003 verified. No confirmed violation, open prevention action, required decision, runtime-owner addition or pending inspection remains. Final production source/config/rule hashes match the frozen baseline; no architecture choice or suppression changed.
