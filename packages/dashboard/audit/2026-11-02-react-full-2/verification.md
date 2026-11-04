# Audit verification

## Baseline checks

Working directory for all application commands: `packages/dashboard`. Input:
HEAD `444f8b4121b24978736b9f194c56c030f8346d2d`, initially clean; source/rule/config
hashes remain frozen in the dossier. New audit artifacts are outside the React
source inventory. All outputs below were actually produced; full logs are local
supplementary evidence under the existing Git-ignore policy. Essential results
are retained here even when raw logs are not versioned.

Installed versions: React/React DOM 19.2.7, TanStack Query 5.104.5, TypeScript
6.0.3, ESLint 10.4.1, Vitest 4.1.12, Prettier 3.9.10, local skill 1.7.0;
[full installed snapshot](evidence/installed-versions.json). All 122 shipped
JS/MJS tooling files match the source skill byte-for-byte
([parity](evidence/tool-parity-review.json)); fresh tests use those installed
implementations and actual dependencies.

| ID  | Phase / command                                                                                                                         | Exit | Essential observed result                                                                                                                                                                                         |
| --- | --------------------------------------------------------------------------------------------------------------------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E01 | baseline: `npm run lint -- --no-cache`                                                                                                  | 0    | 0 errors, 143 warnings: 142 dated suppression tracking plus one existing shared-owner review. Ceiling 143 retained; packaged tooling zero-warning gate also passes.                                               |
| E02 | baseline: `npm run typecheck`                                                                                                           | 0    | Actual application/tooling/Storybook TypeScript projects compile.                                                                                                                                                 |
| E03 | baseline: `npm test`                                                                                                                    | 0    | 280 application/integration files, 2,368 tests; 33 generic files, 756 tests. 3,124 tests total. No failure, retry, timeout or test/config edit.                                                                   |
| E04 | baseline: `npm run --silent audit:architecture`                                                                                         | 0    | 43 candidates: 11 feature boundaries and 32 support contracts, dispositioned with retained/current responsibility evidence. Candidate count is not a defect count.                                                |
| E05 | baseline: `npm run --silent audit:cycles`                                                                                               | 0    | No synchronous production runtime cycle. Deferred/type-only edges retain stated limits.                                                                                                                           |
| E06 | baseline: `npm run audit:i18n`                                                                                                          | 0    | Quiet source lint and reference catalog usage gate pass; this does not replace E01.                                                                                                                               |
| E07 | baseline: `npm run --silent audit:fixtures:check`                                                                                       | 0    | 16 current explicit reviewed candidates; pending=[], stale=[]. No ledger changed.                                                                                                                                 |
| E08 | baseline: `npm run --silent audit:colocation -- --snapshot`                                                                             | 0    | Frozen source/role/hash snapshot saved before any implementation; no implementation is performed.                                                                                                                 |
| E09 | baseline: `npm run build`                                                                                                               | 0    | TypeScript and Vite production build pass; optional tab chunks remain separate. Native Vite-config compatibility notice is nonfatal.                                                                              |
| E10 | baseline: `npm run build-storybook`                                                                                                     | 0    | Storybook static build succeeds; dependency/directive and chunk-size notices are nonfatal, not lint-budget diagnostics.                                                                                           |
| E11 | baseline: `npx prettier --check .`                                                                                                      | 1    | 80 records: 79 historical audit Markdown/JSON plus this audit's scratch comparison JSON; no application-source formatting failure. Scratch artifact formatted separately, historical records preserved.           |
| E13 | phase-1 verification: local Prettier `--check --ignore-unknown` with every frozen source-manifest path supplied as structured arguments | 0    | All supported in-scope application source/test/config/doc files pass. Does not replace failed whole-project gate E14.                                                                                             |
| E14 | phase-1 final gate: `npm run format:check`                                                                                              | 1    | 79 historical records remain unformatted; no current-dossier/source violation. This runs the actual CI command; Prettier failure prevents its following lint step. E01 independently supplies full lint evidence. |

[Structured baseline results](evidence/check-results.json) record the sequential
command outputs. Raw baseline logs, exit sidecars and source-format.log remain
local supplementary evidence. The exact 79 layout failures are durable in
[format dispositions](evidence/format-dispositions.json) and
[format target hashes](evidence/format-target-manifest.json). No remote CI state
was queried or claimed. E11/E14 are application check failures diagnosed in F-002;
they do not prevent closing an audit-only diagnosis.

## Detector calibration and reproductions

**E12 — actual-project in-memory component-role probe, exit 0.** Ran ESLint.lintText
with the real application adapter, source path and typed configuration:

- Invalid neighbor imports the existing withAccountTypeHistoryTotals transformer
  from a view: `local/component-role`, severity 2, messageId
  `viewImportsBusiness`.
- Valid neighbor renders supplied text: no intended-rule diagnostic.
- Current EvolutionChart source imports its mislabeled presenter: no intended-rule
  diagnostic, reproducing the semantic blind spot behind F-001.

[Full calibration decisions](evidence/calibration-review.json) preserve intended
and unrelated diagnostics. No source probe file was added. Other actual-config
invalid/valid role/naming/import/alias/schema/type/formatter/UI/event/test/i18n
cases ran in E03's integration and generic suites; passing lint alone was not
used as calibration. Business meaning cannot be soundly inferred from arithmetic
or a presenter path; explicit types/import boundaries and semantic review remain
necessary. No detector/configuration change is made in phase 1.

Existing runtime tests directly exercise cancellation, overlay outside dismissal
and keyboard reopening, Escape, both Tab directions, unavailable controls,
modal containment, refs, source acquisition/retained shell and provider-specific
formatter fallbacks. E03 passes them unchanged. No new browser or assistive-
technology session was run; those combinations are not certified by jsdom.

**E15 — metrics calculator, exit 0.** `npm run --silent audit:metrics -- --input
 audit/2026-11-02-react-full-2/evidence/metrics-baseline-input.json` (single-line
command with the same input path). Preserve the [input](evidence/metrics-baseline-input.json)
and [calculated result](evidence/metrics-baseline.json). Formula:
weighted-rule-compliance/v1; applicable weight 1,128; open violated-rule weight
41; score **96.37**. 110 selected rules, 99 applicable, 11 not applicable,
0 pending inspections, 154 unrevalidated exception units. F-001 scores only
arch-component-roles/helpers-categories, once per rule; F-002 scores only
quality-formatting-and-sorting.

| Actual family impact | Baseline families | Open | Resolved |
| -------------------- | ----------------: | ---: | -------: |
| CRITICAL             |                 1 |    1 |        0 |
| HIGH                 |                 0 |    0 |        0 |
| MEDIUM-HIGH          |                 0 |    0 |        0 |
| MEDIUM               |                 0 |    0 |        0 |
| LOW-MEDIUM           |                 0 |    0 |        0 |
| LOW                  |                 1 |    1 |        0 |

Affected files are separate from family counts: F-001 ten source/adapter files
(six independent calculation owners); F-002 79 historical records; 89 distinct
files total. Callers read for proof are listed separately in findings, not
invented additional defect families. A family uses its highest impact, so the
MEDIUM-HIGH row is zero despite helpers-categories being violated within F-001.
No ambiguity, unproven candidate, optional suggestion or old suppression is
counted as another violation. The score is bounded by retained/current coverage
and exceptions; it is not a runtime correctness certification. No implementation
final snapshot is fabricated for this phase-1-only request.

## Implementation checks

Not applicable: implementation not requested. No source, test, rule, check,
ignore, warning-budget or historical-report edit; no owner introduced/extracted/
moved and no protection claimed added. P-001–P-005 remain proposed.

**E16 — unchanged-source colocation comparison, exit 0.**
`npm run --silent audit:colocation -- --baseline
 audit/2026-11-02-react-full-2/evidence/baseline-colocation.log` using the E08 JSON
snapshot. [Result](evidence/colocation-final.json): rows=[], missing=0, pending=0.
This checks no introduced contract; it does not retroactively require siblings
for every legacy module or establish the behavior of an empty test.

## Completion review

Phase 1 is complete. The original file/rule inventories remain preserved, all
eligible targets are accounted for with explicit retained/current evidence, the
50-presenter family and 43 architecture candidates are dispositioned, ten
code-local decisions remain supported, and the deterministic 79-file formatting
supplement is recorded separately. No pending inspection, required clarification
or architectural arbitration remains. F-001/F-002 remain open proven violations
with proposed acceptance criteria/prevention, and E14 remains failed as reported.

**E17 — dossier formatting, exit 0.**
`npx prettier --check audit/2026-11-02-react-full-2`: every supported new artifact
passes after formatting only this dossier. Its own-format-check.log is local
supplementary evidence. E14 still contains exactly the 79 original failures.

**E18 — frozen-input reconciliation, exit 0.** Compared 1,807 source, rule,
contract/config/CI and supplemental historical hash entries: changed=[];
the exact final formatter failure set equals the original 79 targets.
[Reconciliation](evidence/input-reconciliation-review.json) also records the
working tree: only this new dossier is untracked. No application/input drift.
All local dossier Markdown links resolve. Generated build/test/cache output is
incidental, as permitted by phase 1. No source fix, historical-report rewrite,
commit or remote write was made.

## Phase-2 implementation verification

The user “corrige” authorized the corrective plan. Phase-1 results/failures above
remain the baseline; the following evidence supersedes only current resolution
and implementation status. Application source/rules matched before editing.
All commands use packages/dashboard and the existing installed/pinned tools.

| Evidence | Command / input                                                  | Exit               | Observed result                                                                                                                                                             |
| -------- | ---------------------------------------------------------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I01      | Targeted P-001 tests and compiler contracts                      | 0                  | Six suites/26 cases at the initial P-001 checkpoint; application typecheck passes.                                                                                          |
| I02      | Targeted P-002 helper, controller, assessment and shell tests    | 0                  | Four suites/12 cases; global error/warning badges survive table filtering/sort.                                                                                             |
| I03      | Targeted P-003 metrics/trend/controller tests                    | 0                  | Seven suites/27 cases preserve confidence, null and adjacent-snapshot behavior.                                                                                             |
| I04      | Actual changed-code ESLint/Prettier/typecheck                    | 0 after correction | Initial lint exposed private imports and hidden feature responsibility; colocated actual owners and explicit preparation fix them without rule changes or suppressions.     |
| I05      | Final focused source tests + actual compiler table               | 0                  | 18 suites/76 cases before strengthening the compiler neighbor; current compiler case is also covered in I07.                                                                |
| I06      | Isolated original-tooltip replay                                 | 1 expected         | One failed/four passed: original raw-field calculation displays Total 0 for the new prepared contract; corrected view displays 100. Probe removed before full collection.   |
| I07a     | First full npm test                                              | 1                  | 2,397 cases pass; only the new compiler test’s valid neighbor has unused-import TS6133. Its invalid raw neighbor correctly receives TS2322. No product assertion fails.     |
| I07b     | Focused compiler neighbor recheck                                | 0                  | Valid neighbor uses the source factory Date; intended invalid/valid assertions both pass. Nine other cases are unselected by the focused CLI filter, not skipped in source. |
| I07      | Final npm test rerun                                             | 0                  | 289 application/integration suites, 2,398 tests; 33 generic suites, 756 tests. 3,154 total, 30 more cases than baseline.                                                    |
| I08      | npm run lint -- --no-cache                                       | 0                  | Full application and packaged gates: 0 errors, 143 existing warnings; no ceiling/date/ignore/severity change.                                                               |
| I09      | npm run typecheck                                                | 0                  | Strict source/configuration/Storybook projects compile.                                                                                                                     |
| I10      | npm run build                                                    | 0                  | Dashboard production build passes.                                                                                                                                          |
| I11      | npm run build-storybook                                          | 0                  | Static design-system catalog builds; existing nonfatal dependency/chunk notices remain.                                                                                     |
| I12      | npm run --silent audit:architecture                              | 0                  | 43 responsibility/support candidates; new/moved contracts and callers re-reviewed by actual meaning.                                                                        |
| I13      | npm run --silent audit:cycles                                    | 0                  | No synchronous production runtime cycles.                                                                                                                                   |
| I14      | npm run audit:i18n                                               | 0                  | Quiet source lint/reference catalog gate pass.                                                                                                                              |
| I15      | npm run --silent audit:fixtures:check                            | 0                  | 16 explicit reviewed decisions; no pending/stale entry. Only analysis.sourceSha256 changes in the versioned ledger after semantic review.                                   |
| I16      | Colocation with frozen E08 baseline and phase2-provenance-review | 0                  | Six introduced runtime owners have meaningful sibling tests; eight reviewed moves; missing=0/pending=0.                                                                     |
| I17      | Pinned Prettier on the exact 79 formatting targets               | 0                  | Every parsed JSON value and normalized Markdown AST is equal; all intended files changed layout only.                                                                       |
| I18      | Final npm run format:check                                       | 0                  | Full Prettier and normal lint pass, including all historical targets; 0 errors/143 unchanged warnings.                                                                      |
| I19      | Packaged audit metrics on metrics-final-input.json               | 0                  | weighted-rule-compliance/v1 score 100, versus 96.37 baseline; same 99 applicable rules/154 unrevalidated exception units.                                                   |

[Structured check results](evidence/phase2-check-results.json) retain the first
full run; [final test rerun](evidence/phase2-final-tests-recheck.log) is local
supplementary evidence. Essential outcomes above remain durable. The initial
wrong valid-neighbor import was corrected rather than weakening assertions or
compiler options. The actual prepared-data case rejects a complete raw domain
entity (TS2322) and accepts the supplied numeric composition/source Date.

Current [source manifest](evidence/source-manifest-final.json),
[48-path code/config delta](evidence/file-review-final-delta.json),
[provenance](evidence/phase2-provenance-review.json),
[colocation](evidence/phase2-colocation.json),
[fixture review](evidence/fixture-review-delta.md),
[owner obligations](evidence/introduced-owner-review.md) and
[format equivalence](evidence/phase2-format-review.json) account for actual work.
The eight path moves are seven runtime owners and one existing sibling test;
all prior siblings are retained. Six new runtime owners have meaningful tests;
type-only/fixture/test support modules receive explicit non-applicability to the
runtime-owner sibling requirement. No new effect, atom, API/schema, submit form,
authentication or shared UI surface invalidates earlier capability N/A reasons.

Actual protection: the evolution view requires a prepared point with composition;
a canonical raw history entity cannot cross that interface. The real-project
bad/good compiler case and prepared-only tooltip regression protect it. Existing
ESLint role/import/helper rules protect explicit calculation boundaries and
component-private ownership. No new heuristic ESLint detector is added because
arithmetic alone cannot distinguish business metrics from valid geometry.
All original ten decisions remain; two new code comments document actual
reporting/shared-severity owners. No old suppression is technically renewed.

Final score volumes: CRITICAL baseline 1/open 0/resolved 1; HIGH 0/0/0;
MEDIUM-HIGH 0/0/0; MEDIUM 0/0/0; LOW-MEDIUM 0/0/0; LOW baseline 1/open 0/resolved 1.
The medium-high helper violation belongs to the critical family, counted once.
Final open affected files=0, ambiguities=0, required decisions=0. Original
baseline inputs/results remain preserved beside the new
[final input](evidence/metrics-final-input.json) and [result](evidence/metrics-final.json).
The score does not approve historical bypasses or certify untested browser/
assistive-technology combinations.

## Final implementation closure

I18 passes: the actual whole-project formatting/lint gate has exit 0. Audit and
implementation are complete. P-001–P-005 are verified, F-001/F-002 are resolved,
and no required decision, correction, inspection or prevention step remains.
The final source contains 1,385 authored entries plus the original generated
cache metadata; its original baseline remains unchanged. Six new runtime owners,
nine tests, the derived type/fixture and eight moves have explicit current
obligation/provenance evidence. All 79 historical layout changes retain values
and Markdown structure. New tests pass alongside all existing cases: 3,154 total.

[Final reconciliation](evidence/phase2-reconciliation-review.json) confirms no
source drift after review, no rule/tool/workflow/ignore/budget change, no
unexpected tracked edit and no broken active-dossier local link. Only authorized
source/test corrections, the exact historical layout fixes and this dossier are
changed. No commit or remote write. Baseline/final scores: 96.37/100 with the same
coverage/exception policy; no new guarantee beyond the documented type, lint,
behavior and semantic review limits is claimed.
