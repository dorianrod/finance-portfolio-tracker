# Audit scope

## Request and phase status

Independent full dashboard audit requested on 2026-11-02 (Europe/Paris) using
`generic-react-best-practices` 1.7.0. Application: `packages/dashboard`.
Audit: complete. Implementation: complete under the subsequent user “corrige” request. Only dossier artifacts and
isolated analysis output may change.

## Frozen inputs

Starting revision and clean working tree: [start](evidence/start.json).
[Application hashes](evidence/source-manifest.json), [110 rule contracts and
actual impacts](evidence/rule-manifest.json), [tooling, companion and workflow
hashes](evidence/contracts-and-config.json). Effective ESLint configuration:
application adapter and installed shared preset; warning ceiling 143. Installed
versions and effective settings are recorded with verification.

## File inventory and exclusions

The source manifest is the closed authored inventory: production source, tests,
mocks, stories, assets, catalogs, frontend configuration and documentation.
Relevant CI inputs are included in the contracts/configuration manifest. Exclude
dependencies, generated builds/data, Python implementation, caches and audit
artifacts. The preceding audit included `.pytest_cache/README.md`; this cache is
explicitly excluded here as generated output. Existing inline suppressions,
configuration ignores, rule reductions and warning baselines are inventoried
without technical revalidation; normal metadata and unused-suppression checks
remain active. No new exception or ignore is introduced.

## Rule inventory

All 110 Quick Reference rules, investigated by actual impact and then category
priority. `tailwind-design-system` applies inside shared UI. Unchanged historical
evidence is cited selectively and revalidated against current contracts, inputs,
callers and fresh checks; it is not represented as a fresh reading of every file.

## Required checks and completion criteria

From `packages/dashboard`: uncached normal lint (0 errors, <=143 warnings),
typecheck, application and packaged skill tests, Prettier check, dashboard and
Storybook builds, architecture inventory, cycles, i18n, fixture ownership gate,
source-colocation snapshot and audit metrics. Use isolated invalid/valid probes
through actual configuration. Semantic requirements beyond detector coverage
remain independent obligations. Phase 1 closes only with every file/rule
accounted for, all candidates investigated and a complete findings/plan handoff.

## Checkpoint

Phase 1 complete: all file/rule targets accounted for, no pending inspection or
required architectural decision. Two proven violation families have a complete
proposed plan: F-001 business calculations hidden in presenters/views; F-002
historical report formatting now covered by the committed gate. Implementation
is not requested. The calculated baseline score is 96.37 under
weighted-rule-compliance/v1 (110 selected, 99 applicable, 154 exception units not
technically revalidated); all impact volumes are in verification.md.

The original manifest is preserved: 1,368 authored frontend entries plus one
generated cache-metadata row explicitly marked not applicable. All 1,364 files
common with the previous final manifest and all 110 rule hashes are unchanged.
Five additional entries account for the current Git-ignore policy, three static
assets and that generated cache metadata.

Scope delta after the frozen baseline: the full formatting check exposes 79
historical authored audit records because HEAD changed Git-ignore discovery.
The separate format-target-manifest adds deterministic layout-only review;
historical semantic conclusions remain outside the inspected scope. Nothing was
silently removed from the original inventory. All substantive checks pass,
including 2,368 application/integration and 756 generic tests; the full format
gate remains failed on the 79 original records. Source formatting passes.

Only this new dossier changed. No source, test, rule, check configuration,
historical report, ignore or warning-ceiling correction was applied. Final
input reconciliation and actual command outcomes are in verification.md.

## Phase-2 authorization and input check

2026-11-02: the user requested “corrige”, authorizing P-001–P-005.
Audit: complete; implementation: in-progress. All original source, rule and
79 formatting-target hashes still match. Prior Git patches and the three selected
audits remain applicable; newly affected callers/compiler-test history was also
checked. No new arbitration or exception revalidation is required. The existing
colocation snapshot is retained as the unchanged implementation baseline.

## Final phase-2 checkpoint

P-001–P-005 are implemented and verified. The previous phase-1/implementation-start
checkpoints above are historical. Source scope is 1,386 entries (1,385 authored
plus the original explicitly inapplicable cache metadata), with the original
1,369-entry baseline preserved. Actual delta: 25 added paths, 15 modified, eight
removed; eight are reviewed moves, leaving six new runtime owners, nine tests,
one derived type and one fixture. The separate 79-record formatting supplement
has JSON/Markdown equivalence proof. The 110 rule contracts and check/ignore/
warning policies remain unchanged. Two new architecture decisions record actual
prepared-data and shared-severity ownership; all original ten remain supported.
No pending inspection, required choice or confirmed violation remains. Final
metrics are 100 versus the preserved 96.37 baseline; exception policy is unchanged.
Final full command/evidence and source reconciliation are in verification.md.
