# Audit metrics

Formula: weighted-rule-compliance/v1. Full 110-rule scope, 101 applicable rules,
nine not applicable, no pending inspection. Weighted denominator 1,152. Existing
142 suppressions remain technically unrevalidated and outside this assurance.

The initial phase-1 snapshot found three prevention gaps and no proven application
violation: 100/100. Fresh phase-2 consumer inspection then proved F-004 in unchanged
baseline source. Preserve that initial snapshot and report the amended baseline
as **99.31/100**, rather than pretending the earlier diagnosis was complete. Final score after verified resolution: **100/100**.

| Actual impact | Amended baseline violation families | Final open | Resolved |
| ------------- | ----------------------------------: | ---------: | -------: |
| CRITICAL      |                                   0 |          0 |        0 |
| HIGH          |                                   0 |          0 |        0 |
| MEDIUM-HIGH   |                                   1 |          0 |        1 |
| MEDIUM        |                                   0 |          0 |        0 |
| LOW-MEDIUM    |                                   0 |          0 |        0 |
| LOW           |                                   0 |          0 |        0 |

Confirmed affected application files at the amended baseline: one. Prevention-gap
families: three, reported separately from scored violations. F-001 includes the
explicit-project root-resolution problem exposed by the relocated check; it is
not a second application violation. Application/support scope stays at 1,360
files, plus 245 separately tracked reusable skill files. No scope is removed.

[Original input](evidence/metrics-baseline-input.json),
[original calculated snapshot](evidence/metrics-baseline.json),
[amended baseline input](evidence/metrics-amended-baseline-input.json),
[amended calculated baseline](evidence/metrics-amended-baseline.json).

A score of 100 means no proven open violation in the reviewed scope. It does not
certify exhaustive detection or approve existing exceptions. Input equality
supports retaining prior evidence but does not cure a previously missed
obligation, as F-004 demonstrates.

[Final input](evidence/metrics-final-input.json), [calculated final](evidence/metrics-final.json). One confirmed family resolved in one application file; all three prevention-gap families resolved. No scoring credit is invented for merely adding a detector.
