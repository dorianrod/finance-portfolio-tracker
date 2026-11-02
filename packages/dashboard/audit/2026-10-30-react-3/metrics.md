# Audit metrics

Baseline observation for independent phase 1: **99.65 / 100**, `weighted-rule-compliance/v1`.

Scope: full dashboard catalog; unchanged prior semantic evidence retained explicitly after exact hash comparison, plus fresh gates, source/caller traces and fixture ownership inspection. **110 selected / 101 applicable / 0 pending rules**. **142 existing directives were not technically revalidated**. Nine rules have explicit capability-based non-applicability reasons in the rule ledger.

`100 × (1 − 4 / 1152) = 99.65` after rounding. Each violated rule contributes once; F-001 has MEDIUM weight 4. Repeated locations, nested references and multiple files do not create independent score penalties.

| Actual impact | Baseline confirmed families | Open | Resolved |
| --- | ---: | ---: | ---: |
| CRITICAL | 0 | 0 | 0 |
| HIGH | 0 | 0 | 0 |
| MEDIUM-HIGH | 0 | 0 | 0 |
| MEDIUM | 1 | 1 | 0 |
| LOW-MEDIUM | 0 | 0 | 0 |
| LOW | 0 | 0 | 0 |

Affected files: **12**, all tests. Confirmed family: **1**, `test-mock-data`. Open ambiguities: 0. User decisions pending: 0. Optional prevention work is P-002, not a second defect or a condition for completing this diagnosis.

[Calculator input](evidence/metrics-baseline-input.json), [actual packaged calculator result](evidence/metrics-baseline.json), command B-013 in [verification](verification.md). Original input/source/config fingerprints remain preserved. At the original phase-1 baseline no implementation ran; the separate verified snapshot below records the later correction.

The preceding audit reported 100 after its correction; its source inputs are unchanged. The lower current result records newly demonstrated missed coverage, not a code regression or a changed requirement. Its original dossier and metrics remain untouched. Comparisons are bounded by evidence coverage and exception policy; the score does not certify ignored code, measure defect probability or change catalog priority.

## Verified implementation snapshot (2026-10-31)

**99.65 → 100.00** under the unchanged `weighted-rule-compliance/v1` formula. The original 12-file baseline is preserved. [Expanded baseline](evidence/metrics-expanded-baseline.json) adds two equivalent assertion-contained input fixtures: still one MEDIUM family and score 99.65, now 14 affected test files. [Final input](evidence/metrics-final-input.json) and [packaged calculator result](evidence/metrics-final.json) mark that family resolved after actual acceptance evidence.

| Actual impact | Baseline families (expanded) | Final open | Verified resolved |
| --- | ---: | ---: | ---: |
| CRITICAL | 0 | 0 | 0 |
| HIGH | 0 | 0 | 0 |
| MEDIUM-HIGH | 0 | 0 | 0 |
| MEDIUM | 1 | 0 | 1 |
| LOW-MEDIUM | 0 | 0 | 0 |
| LOW | 0 | 0 | 0 |

Affected correction files: 14 tests; final open affected files: zero. Source scope: 1358 final app/support inputs, plus fingerprinted reusable tooling/contract inputs; 110 selected / 101 applicable / zero pending rules. No user arbitration remains. All 142 existing directives remain outside technical revalidation. Score 100 describes these reviewed obligations and exceptions, not universal correctness or complete automatic detection.
