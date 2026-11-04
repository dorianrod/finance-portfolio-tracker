# Focused audit metrics

Scope: 29 explicitly revalidated prop-drilling suppressions in 12 starting files; seven code families, plus the requested reusable policy clarification. Two selected/applicable primary rules; zero pending inspection. 113 unrelated suppression directives remain outside technical revalidation. This does not score the full application.

Formula: weighted-rule-compliance/v1. Baseline score **33.33**, final **100**. The primary architecture rule contributes weight 32 and the exception policy weight 16; repeated directives do not multiply the rule penalty.

| Actual impact | Baseline families | Final open | Resolved |
| ------------- | ----------------: | ---------: | -------: |
| CRITICAL      |                 7 |          0 |        7 |
| HIGH          |                 0 |          0 |        0 |
| MEDIUM-HIGH   |                 0 |          0 |        0 |
| MEDIUM        |                 0 |          0 |        0 |
| LOW-MEDIUM    |                 0 |          0 |        0 |
| LOW           |                 0 |          0 |        0 |

Policy clarification is a prevention improvement rather than an invented source violation. [Baseline input/result](evidence/metrics-baseline-input.json), [baseline result](evidence/metrics-baseline-result.json), [final input](evidence/metrics-final-input.json), [final result](evidence/metrics-final-result.json).
