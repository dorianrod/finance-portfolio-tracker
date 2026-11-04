# Corrective plan

## Implementation scope and authorization

The user’s “corrige” on 2026-11-02 authorizes all P-001–P-005 actions.
Audit and implementation are complete. The original phase-1 source/rule hashes,
diagnosis and baseline score remain preserved; the current statuses below are
the authoritative implementation result. Source/test corrections and the exact
79 historical formatting targets are fulfilled. No commit, push, release,
warning-ceiling/ignore change or technical review of old suppressions was made.

## Prioritized actions

### P-001 — Prepare evolution metrics before rendering

- Findings and priority: F-001; CRITICAL role correction, including prerequisite
  MEDIUM-HIGH helper extraction.
- Action/option: fix; chart-owned transformer and feature, existing chart/tooltip
  views and visual series adaptation retained.
- Status: verified. Authorization: user “corrige”; the existing
  account-chart convention selects the responsibility boundary.
- Dependencies: none; P-002 is independent at the same impact, then P-003.
- Implementation: move the independent composition calculation into the chart's
  transformers; add a feature and a prepared point contract; update WealthTab,
  chart/tooltip callers and tests. Keep visual state in the view. Proposed
  `prepared-evolution-metrics` comment records the chart-owned reporting contract
  and revisits it only when reporting scope becomes independent. F-001 explains
  the concrete contradiction justifying correction of 6cea357c's classification.
- Acceptance: cost 125/gain -25 retains total 100 and signed shares; canceling
  totals retain unavailable shares; empty/missing payloads preserve output.
  Compiler rejects unprepared props and accepts prepared neighbors. Configured
  role checks reject business dependencies in views. New runtime owners have
  meaningful sibling tests.
- Outcome: implemented; current full checks, regression/type evidence and introduced-owner review are linked from verification.md.

### P-002 — Share pipeline severity statistics and declare their owner

- Findings and priority: F-001; CRITICAL error-controller role, including
  prerequisite MEDIUM-HIGH helper extraction.
- Action/option: fix; data-quality shared pure count helper; controller becomes
  a feature and keeps the existing ErrorsTabView.
- Status: verified. Authorization: user “corrige”; actual
  assessment/errors consumers select their common owner.
- Dependencies: none; after P-001 by equal-impact category/responsibility order.
- Implementation: extract severity counting under data-quality shared
  transformers; compose it in both presenter adapters and buildDataQualitySummary.
  Keep table filtering/sorting/keys, labels and theme priority with their visual
  owners. Rename the controller and sibling test to the feature role and update
  DashboardDataQuality/callers. Proposed `pipeline-severity-counts` comment
  distinguishes shared source statistics from filtered row counts. This corrects
  34d269ec's unsupported classification for the exact chain in F-001; preserve
  its extracted view and the existing page-assessment decision.
- Acceptance: empty/error-only/warning-only/mixed input, global counts while
  filtering/sorting, unchanged reliability/recommendation outputs and order.
  New helper has sibling tests; moved controller retains existing cases. Review
  all indirect view dependencies after extraction.
- Outcome: implemented; current full checks, regression/type evidence and introduced-owner review are linked from verification.md.

### P-003 — Separate financial and concentration metrics from visual policy

- Findings and priority: F-001; MEDIUM-HIGH helpers-categories.
- Action/option: fix; narrow component-owned transformers composed by existing
  overview/coverage presenters and features.
- Status: verified. Authorization: user “corrige”.
- Dependencies: none; lower impact than P-001/P-002.
- Implementation: extract current/previous gross-change arithmetic and
  exposure/confidence numeric metrics, plus the four adjacent concentration
  threshold deltas in buildConcentrationChartRows. Keep labels, timestamps,
  chart rows, tones and visual
  state in presenters. Reuse computeFundExposurePercentages and preserve every
  confidence cap/denominator. Support types stay with their actual component.
  Add a code decision only if confidence policy versus tone remains non-obvious;
  no new domain/shared hierarchy is justified.
- Acceptance: null/negative period changes, zero denominator, not-applicable,
  partial/high-confidence coverage, adjacent-snapshot absence/threshold changes,
  immutable inputs and identical view output. Preserve the concentration owner's
  6cea357c placement and e271d108 nullability comments.
  New helpers have nominal/edge sibling tests and no translation/UI dependency.
- Outcome: implemented; current full checks, regression/type evidence and introduced-owner review are linked from verification.md.

### P-004 — Format the 79 historical records covered by the gate

- Findings and priority: F-002; LOW.
- Action/option: fix; pinned Prettier on format-target-manifest only.
- Status: verified. Authorization: user “corrige”; preserve HEAD's
  durable-report policy and existing formatter coverage.
- Dependencies: independent; verify after source work if both are implemented.
- Implementation: use structured file arguments; snapshot/compare parsed JSON;
  review Markdown diffs for layout only. Preserve report meaning, IDs, historical
  decisions and score values. No broad source autofix or ignore change.
- Acceptance: JSON equality, Markdown layout-only diffs and the actual
  `npm run format:check` passing with the existing ceiling 143.
- Outcome: all 79 targets formatted; parsed JSON and Markdown AST equality verified in phase2-format-review.json; no historical semantic content changed.

### P-005 — Verify prevention and introduced-owner obligations

- Findings/priority: F-001/F-002 closure; follows P-001–P-004.
- Action/option: fix; existing ESLint/type protection, behavior regressions,
  colocation and full gates.
- Status: verified. Authorization: user “corrige”.
- Dependencies: all preceding actions; local checks accompany coherent changes.
- Implementation: retain the baseline, reconcile actual additions/extractions/
  moves with hashes and provenance, review newly triggered rule obligations,
  require sibling tests for new owners and fresh fixture decisions after semantic
  inspection. Add real-project rejected/valid prepared-data compiler cases and
  run existing import/role calibration. Update code decisions and final metrics
  only with actual evidence.
- Acceptance: preserved source/query/behavior outputs; lint 0 errors/<=143
  warnings; compiler/tests/builds/i18n/cycles/fixtures/format pass; colocation
  missing=0/pending=0 with reviewed moves. No unresolved violation/required choice.
  Test presence alone does not establish meaningful behavior coverage.
- Outcome: verified. 2,398 application/integration plus 756 generic tests pass. Required prepared-data type/compiler case, meaningful sibling tests, fixture freshness, reviewed moves and colocation are complete. Full check evidence is in verification.md.

## User decisions

None pending. The contracts and existing ownership/policy select the corrections.
The implementation request authorized these actions; no required user decision remains.

## Rule and enforcement feedback

No rule ambiguity is established. Existing component-role calibration demonstrates
its semantic limits and the protection once transformers are explicit. Prepared
types and behavioral regressions provide sound prevention. Arithmetic/field names
alone cannot distinguish business metrics from valid geometry or localized UI
adaptation, so no blanket detector is proposed. Existing CI already checks F-002;
no extra test is needed for mechanical document formatting. Preserve all warning
severities, budgets, ignores and supported source-sharing decisions.

## Follow-ups and plan changes

The original manifest remains preserved. A deterministic-only supplement adds the
79 historical documents reported by the formatter; their semantic conclusions
remain outside the audit. Existing suppression dates are not renewed. Browser
profiling, compiler migrations, alternative folder arrangements and technical
revalidation of existing ignores remain outside required corrections without
additional evidence or a request.

## Authorized implementation checkpoint

2026-11-02: user “corrige” authorizes every proposed action above. The preceding
phase-1 authorization/status text is the historical baseline; current status:
P-001 in-progress, P-002–P-005 ready. No option/approval is pending.

### Phase-2 implementation deltas

- P-001: added a chart-owned prepared point containing Date plus composition,
  rather than leaking the raw reporting entity into views. The presenter adapts
  prepared numbers into existing Recharts keys. The tooltip retains its prior
  zero display for an absent library payload. Added the code decision and
  compiler rejection of a complete raw PortfolioHistoryPoint.
- P-002: the real component-role check requires the controller to own its
  business preparation explicitly. It calls countPipelineIssues and supplies
  required prepared counts to the presenter; the shared assessment adapter and
  quality summary compose the same pure helper. No detector or exception change.
- P-003: the real import-boundary check requires component-private support files
  to be inside their consuming owner. Moved overview driver feature/view/presenter
  into OverviewDriversChart and coverage feature/presenter into the existing
  lookThroughCoverageSummary directory. Updated callers and retained visual APIs,
  type-only references, source order and the existing nullability rationale.
  All financial/diagnostic arithmetic now lives in narrow transformers.
- P-004: all 79 exact targets formatted. Parsed JSON equality and Markdown AST
  equality (ignoring positions/prose wrapping) pass for every record; history
  confirms their prior commit and the durable-report policy stays unchanged.
  See evidence/phase2-format-review.json. No historical diagnosis was rewritten.
- P-005: 76 focused cases pass after owner normalization. The first intermediate
  lint exposed three ownership errors; they were corrected by the actual owner
  moves/explicit preparation, without ignores, suppressions or changed severities.
  Final full checks, fixture freshness, colocation and metrics are in progress.

## Final implementation checkpoint

P-001–P-005 are verified. Earlier phase-1 and intermediate phase-2 checkpoints
above remain historical. All six calculation owners have explicit transformer
boundaries; views receive prepared data, with current callers and owner moves
reviewed. The 79 layout corrections preserve structured/document meaning.
Full tests pass: 2,398 application/integration + 756 generic. Typecheck, lint
(0 errors/143 unchanged warnings), builds, cycles, i18n, fixture ownership and
colocation pass. The final whole-project formatting/lint gate is recorded in
verification.md. No required correction, prevention, comment or choice remains.
Score: baseline 96.37, final 100, under weighted-rule-compliance/v1 with the same
99 applicable rules and 154 unrevalidated exception units.
