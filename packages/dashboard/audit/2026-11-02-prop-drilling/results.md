# Correction results

All 29 reviewed local/no-prop-drilling suppressions are removed; no exception proposed or retained. Existing legitimate direct parent-child APIs remain.

| Family                                  | Original suppressions | Final | Correction                                                                                                                          |
| --------------------------------------- | --------------------: | ----: | ----------------------------------------------------------------------------------------------------------------------------------- |
| F-001 — Account selection               |                     6 |     0 | Group prepares row flags/labels and owns toggle actions; rows are presentation.                                                     |
| F-002 — Tooltip and metric presentation |                     9 |     0 | Owners read raw filter context and compose provider-free views; reporting scope is no longer sent through generic feature wrappers. |
| F-003 — Contribution lists              |                     3 |     0 | Rankings compose existing list views and tooltip slots directly.                                                                    |
| F-004 — Overview cards                  |                     3 |     0 | Shell is a presentation view; metric owners invoke navigation.                                                                      |
| F-005 — Three-year IRR                  |                     2 |     0 | Receiving features accept raw history and call the latest-value selector.                                                           |
| F-006 — Quality KPIs                    |                     5 |     0 | Adapters invoke navigation and render the compact view directly.                                                                    |
| F-007 — Position breakdown              |                     1 |     0 | Preview-owning cell reads selection and renders the status button view directly.                                                    |

The [29-location ledger](evidence/suppression-review.json) preserves original source locations, text, family, correction and exception disposition. Original diagnostics were reproduced individually using the effective ESLint configuration; all 29 matched the expected rule. Existing metadata dates for unrelated suppressions are unchanged.

Reusable policy now requires a retained comment to identify the constraint preventing compliance and why the applicable conforming alternatives cannot meet the required behavior. Merely describing the current code or ownership is insufficient. The policy explicitly honors requested user approval for any proposed exception. Compiled catalog regenerated and validated; no static keyword check claims to judge this technical rationale.

Normal lint warnings decrease from 143 to 114 (113 unrelated suppression trackers and one existing shared-feature warning). The warning ceiling is reduced to 114. Prop-drilling enforcement remains at error severity and no lint exclusion was widened.
