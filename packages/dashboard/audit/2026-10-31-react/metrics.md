# Audit metrics

Formula: weighted-rule-compliance/v1. Baseline and final score: **100/100**, weighted denominator 1,152; 110 selected rules, 101 applicable, nine not applicable, zero pending inspections. The score counts proven catalog violations, not prevention gaps. This audit found no new proven application violation and closed two prevention gaps. Existing 142 directives remain technically unrevalidated and outside this assurance statement.

| Actual impact | Baseline violation families | Final open | Resolved |
| ------------- | --------------------------: | ---------: | -------: |
| CRITICAL      |                           0 |          0 |        0 |
| HIGH          |                           0 |          0 |        0 |
| MEDIUM-HIGH   |                           0 |          0 |        0 |
| MEDIUM        |                           0 |          0 |        0 |
| LOW-MEDIUM    |                           0 |          0 |        0 |
| LOW           |                           0 |          0 |        0 |

Affected files with confirmed violations: zero. Prevention-gap families: two open at baseline, two resolved at final. No score increase is invented for adding detectors. A score of 100 means no proven open violation in this reviewed scope; it cannot establish exhaustive detection or approve historical ignores.

[Baseline input](evidence/metrics-baseline-input.json), [calculated baseline](evidence/metrics-baseline.json), [final input](evidence/metrics-final-input.json), [calculated final](evidence/metrics-final.json). Original app/support inventory 1,358 files; final 1,360. Generic tools and contracts have separate fingerprints. The scope and exception policy remain comparable across both snapshots.
