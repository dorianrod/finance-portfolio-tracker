# Audit metrics

`weighted-rule-compliance/v1`. Scope: full dashboard React catalog, 110 selected / 100 applicable / 0 pending rules; 1 existing inline exception not technically revalidated. Scores describe observed convention compliance and do not certify all functional behavior or existing ignores.

Baseline: **98.24/100**. Final: **100/100**. Two affected application files / two proven families resolved; one additional CI prevention gap closed. Counts reflect the two violation owners, not every supporting test/configuration edit.

| Impact      | Baseline families | Final open | Final resolved |
| ----------- | ----------------: | ---------: | -------------: |
| CRITICAL    |                 0 |          0 |              0 |
| HIGH        |                 1 |          0 |              1 |
| MEDIUM-HIGH |                 0 |          0 |              0 |
| MEDIUM      |                 1 |          0 |              1 |
| LOW-MEDIUM  |                 0 |          0 |              0 |
| LOW         |                 0 |          0 |              0 |

Baseline [input](evidence/metrics-baseline-input.json) and [calculated result](evidence/metrics-baseline-result.json) are preserved separately from final [input](evidence/metrics-final-input.json) and [calculated result](evidence/metrics-final-result.json). The original 1,500-file manifest remains frozen; reviewed CI input and one new sibling regression bring the final authored manifest to 1,502 files. No impact-family regrouping occurred.
