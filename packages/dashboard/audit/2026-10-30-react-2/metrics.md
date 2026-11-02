# Audit metrics

## Impact volumes and score

| Actual impact | Baseline families | Open now | Resolved |
| ------------- | ----------------: | -------: | -------: |
| CRITICAL      |                 0 |        0 |        0 |
| HIGH          |                 0 |        0 |        0 |
| MEDIUM-HIGH   |                 0 |        0 |        0 |
| MEDIUM        |                 2 |        0 |        2 |
| LOW-MEDIUM    |                 0 |        0 |        0 |
| LOW           |                 0 |        0 |        0 |

**Score: 99.31/100 → 100.00/100**, formula `weighted-rule-compliance/v1`.

`100 × (1 − open violated-rule weight / applicable-rule weight)`; fixed weights:
CRITICAL 32, HIGH 16, MEDIUM-HIGH 8, MEDIUM 4, LOW-MEDIUM 2, LOW 1.
Baseline: 8 / 1,152 weighted penalty; final: 0 / 1,152. Each violated rule counts
once, regardless of finding grouping or location count. 110 selected rules,
101 applicable, nine not applicable, zero pending inspection.

The two baseline families affected 48 files/owners: seven new runtime owners
without sibling tests and fixture baselines in 41 test files. There are no open
confirmed violations now. Family counts and file counts are separate measures.
The 142 existing suppressions were not technically revalidated; 143 lint warnings
remain. This is conformity of the reviewed obligations, not certification of all
code or renewed approval of those exceptions. Comparisons require the same scope,
rule selection, coverage, exception policy and formula version.

[Baseline input](evidence/metrics-baseline-input.json) / [result](evidence/metrics-baseline.json),
[final input](evidence/metrics-final-input.json) / [result](evidence/metrics-final.json),
[owning formula](../../../../.agents/skills/generic-react-best-practices/references/audit-metrics.md).
