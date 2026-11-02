# Audit verification

## Baseline checks

All baseline application commands below ran from `packages/dashboard` against the frozen source and locally installed lockfile tools. Command output and exit markers are retained under evidence/. No autofix, install, source edits, remote CI or publication ran.

| Evidence | Phase | Actual command | Exit / observed result | Retained output |
| --- | --- | --- | --- | --- |
| E-001 | audit baseline | npm run lint -- --no-cache | 1; 165 errors, 143 warnings. All errors are retired-category local/helper-module-contract. 142 directive tracking warnings + 1 shared-feature-sharing review warning; ceiling 143. A failing error gate is not budget headroom. | lint.txt, lint.exit, lint-diagnostics.json |
| E-002 | audit baseline | npm run typecheck | 0; all browser, tooling and Storybook TS projects compile. | typecheck.txt, typecheck.exit |
| E-003 | audit baseline | npm test | 0; application/integration: 261 files / 2,295 tests; packaged skill: 28 files / 624 tests. | tests.txt, tests.exit |
| E-004 | audit baseline | npx prettier --check . | 0; all matched files use the committed style. Audit artifacts/generated trees follow existing ignores. | prettier.txt, prettier.exit |
| E-005 | audit baseline | npm run audit:cycles | 0; no synchronous production runtime import cycle. Does not prove ownership or deferred-load safety. | cycles.txt, cycles.exit |
| E-006 | audit baseline | npm run audit:architecture | 0; 59 candidates, all dispositioned through component-boundaries/support-contract review. Candidate count is not error count. | architecture.txt, architecture.exit, component-boundaries.md |
| E-007 | audit baseline | npm run audit:i18n | 1; preliminary eslint src --quiet fails on category errors, so the wrapper never reaches catalog usage. | i18n.txt, i18n.exit |
| E-008 | audit baseline | npm run build | 0; TypeScript + Vite build. All seven optional tab/holdings entry chunks are outside the generated initial static import graph; 631,408 uncompressed initial JS bytes. This is not a latency benchmark. | build.txt, build.exit, bundle-graph.json |
| E-009 | audit baseline | npm run build-storybook | 0; UI catalog builds. | storybook.txt, storybook.exit |
| E-010 | audit baseline fallback | node_modules/.bin/react-best-practices-i18n --catalog src/i18n/locales/en.json | 0; no unused reference keys reported. Executed separately because E-007 short-circuited; does not hide the failed main gate. | catalog.txt (empty successful output), catalog.exit |
| E-011 | audit frozen inputs | installed package/workspace file comparison; versions/config/source hash reads | Executable rules/config/scripts match; seven documentation files differ. Node 22.22.0 / TS 6.0.3 / ESLint 10.4.1 / Vitest 4.1.12 / React 19.2.7 / Prettier 3.9.10. Current workspace rule contracts govern. | versions.json, installed-package-comparison.json, effective-eslint.json, contracts-and-config.json |
| E-012 | audit calibration | node audit/2026-10-30-react/evidence/calibrate.mjs | See actual individual outcomes below, not process exit alone. Effective configuration and intended rule IDs/severities retained. | calibration.json, calibration.txt, html-eslint-scope.json |
| E-013 | audit inventory | node audit/2026-10-30-react/evidence/inventory.mjs; node audit/2026-10-30-react/evidence/dependencies.mjs | 1,282 JS/TS authored modules; 333 classified modules (94 feature, 237 view, 2 state); 4,115 local value/type/reexport/dynamic edges. Supplemental workflow sections and four SVG assets inspected separately. | source-inventory.json, dependencies.json, svg-inventory.json, supplemental-ci-inputs.json |
| E-014 | audit closure | SHA-256 reconciliation of original authored files and rule/config inputs; git status --short | No original authored or contract/config input changed. Initial user `.gitignore` edit is still the only tracked diff. | final-input-deltas.json, git-status.txt |

The configured full-project lint gate remains failed. The packaged tooling's own lint stage may not run after that failure; the independent packaged regression suite did run successfully. npm run format:check was not rerun redundantly: E-004 and E-001 record its two substantive checks separately. Python pipeline/launcher tests are out of React scope. No browser latency profile or remote workflow execution is claimed.

## Detector calibration and reproductions

Seven in-memory probes use the real configured ESLint instance, existing in-project file paths, configured TypeScript service, plugins, processors and severities. They do not write probe source into the application.

| Probe | Intended rule and severity | Rejected / valid neighbor | Outcome |
| --- | --- | --- | --- |
| C-01 / C-02 | local/helper-module-contract, error | Retired selectors/getOwnValue path vs canonical presenters/partitionSlot with pure explicit data | Category is rejected; canonical helper has no intended-rule diagnostic. |
| C-03 / C-02 | local/helper-module-contract, error | Aliased real query acquisition inside canonical helper vs pure explicit data | Intended dependency diagnostic at severity 2; valid neighbor accepted. |
| C-04 / C-05 | local/no-service-presentation, error | Reusable service imports a formatter vs numeric service without presentation | Intended presentation-dependency diagnostic; numeric neighbor accepted. |
| C-06 / C-07 | local/no-hardcoded-colors, error | Browser theme-color setAttribute uses literal color vs PAGE_THEME_COLORS | Intended hardcoded-color diagnostic at severity 2; canonical-token neighbor accepted. |

The initial C-04/C-05 attempt used a nonexistent TypeScript path and produced a project-service parse error. That attempt is preserved as calibration.initial.json and is **not** detection evidence. The probes were corrected to an existing source-service path and rerun. Existing application/generic regression tests additionally exercise aliases, reexports, dynamic dependencies, shadowing, roles, callable memo, state, composition and type/formatter safety. Their 2,919 passing tests are evidence of those tested cases, not universal detector completeness.

html-eslint-scope.json records that index.html has no matching ESLint config, while C-06/C-07 check the equivalent matched TS contract. Semantic source/caller evidence in findings is required beyond these probes. No pending reproduction is used to label a violation.

## Implementation checks

Phase 2 was authorized on 2026-10-30 by “implémente le plan”. All commands below ran from `packages/dashboard` against the implemented source and existing lockfile tools. No install or rule/dependency upgrade occurred. Final runtime changes were in place for both builds; subsequent edits concerned test fixtures, formatting/import order and exception/decision documentation. The complete final formatting/type/test runs include those edits. Audit dossier changes are outside application source checking.

| Evidence | Actual command / operation | Exit / observed result | Retained output |
| --- | --- | --- | --- |
| I-001 | npm run format:check | 0; committed Prettier policy, full application lint and packaged tooling lint pass. 0 errors / 143 warnings: 142 tracked directives + 1 existing sharing warning; ceiling remains 143. | [final output](evidence/phase2-format-complete.txt), phase2-format-complete.exit, [warning reconciliation](evidence/phase2-warning-reconciliation.json) |
| I-002 | npm run typecheck | 0; browser, tooling (including themeHtmlPlugin) and Storybook TS projects compile. | [output](evidence/phase2-types-complete.txt), phase2-types-complete.exit |
| I-003 | npm test | 0; 263 application/integration files / 2,308 tests, plus 28 packaged tooling files / 624 tests: **2,932 passing tests**. Includes concurrent required-source starts, persistent shell on error, final-schema/network cases, provider-specific metrics, account/source labels, ten prepaint bootstrap cases and configured category rejection/valid neighbor. | [complete output](evidence/phase2-tests-complete.txt), phase2-tests-complete.exit |
| I-004 | npm run build; npm run build-storybook | Both 0; application TypeScript/Vite and shared UI catalog builds pass. | [app build](evidence/phase2-build.txt), phase2-build.exit; [Storybook build](evidence/phase2-storybook.txt), phase2-storybook.exit |
| I-005 | npm run audit:i18n; npm run audit:cycles; npm run audit:architecture | All 0; combined i18n wrapper now completes both lint and catalog usage; no production runtime cycle; 43 architecture candidates, all semantically dispositioned. A candidate is not a violation. | phase2-i18n.txt/.exit, phase2-cycles.txt/.exit, [architecture output](evidence/phase2-architecture.txt)/.exit, [candidate review](evidence/phase2-architecture-review.json) |
| I-006 | node audit/2026-10-30-react/evidence/verify-bodies.mjs | 141 pure/support helper bodies have identical tokenized non-import statements versus baseline source, excluding comments. Zero differences. This proves mechanical-body preservation, not universal algorithm correctness. | [comparison](evidence/phase2-pure-body-comparison.json), [comparison script](evidence/verify-bodies.mjs) |
| I-007 | pinned node_modules/.bin/prettier --check --stdin-filepath src/formatProbe.ts | Malformed isolated stdin exits 1; valid neighboring stdin exits 0. No probe source remains. Combined valid CI gate passes under I-001. | [inputs/outcomes](evidence/phase2-format-calibration.json) |
| I-008 | actual ESLint configuration, in-memory unmask of historicalFundHoldingSchema sharing directive; source/caller trace | Intended local/review-shared-feature-sharing diagnostic at severity 1 reproduced. Shared source reaches holdings, overview and concentration through shell props; exactly this merged-owner allowance was technically reviewed/redated. 141 other directives retain exact text/date and existing-ignore status. | [unmasked diagnostic/verdict](evidence/phase2-merged-schema-exception.json), [final directive list](evidence/phase2-exceptions.json) |
| I-009 | source/hash, 165-entry owner, import/role and generated bundle graph reconciliation | All 1,298 original files plus three CI inputs remain accounted for. Final source manifest: 1,309 files; 389 changed/moved originals + 11 new modules. All 165 helper diagnostics resolve, 249 original paths are renamed/folded; zero retired production categories. All seven optional entry chunks remain outside the initial static import graph (633,813 uncompressed JS bytes; baseline 631,408). This is not a latency benchmark. Eight code decisions implemented; reusable catalog/runtime/config integration inputs are unchanged except explicit authored app/CI wiring. | [final inputs](evidence/phase2-input-deltas.json), [file review](evidence/phase2-file-review.md), [migration resolution](evidence/phase2-migration-resolution.json), [bundle graph](evidence/phase2-bundle-graph.json), [decisions](evidence/phase2-decisions.json), [semantic review](evidence/phase2-semantic-review.md) |

The configured invalid/valid category regression now uses a temporary unrelated catalog/reporting project with the actual calculated application rule/plugin settings and severity, plus an explicit TS program. It rejects calculators at severity 2 and accepts transformers. Existing packaged/application alias, reexport and dependency regressions still execute under I-003; no detector was weakened. Baseline C-01–C-07 remain evidence for unchanged rules, not newly rerun probes.

Intermediate attempts remain visible:

- phase2-tests.txt records the broad attempt intentionally interrupted to update stale JS integration fixture paths. It is not a passing full run.
- phase2-focused-tests.txt first passed 42/45; three diagnostics tests still read result.error after a Suspense throw. They now inspect the actual boundary/cache error contract.
- phase2-integration-tests.txt first passed 1,209/1,211; import-boundary/category fixtures still named removed source paths. Real-path fixtures were updated, and portable invalid/valid examples now keep category detection independent of production paths.
- phase2-tests-final.txt passed 262/263 files and 2,305/2,308 tests; three isolated FundLookThroughTab tests needed a Suspense wrapper and awaited semantic queries. The focused six-case run then passed (phase2-fund-tab-tests.txt), followed by complete passing I-003.
- phase2-format-check.txt first rejected only newly added unsorted test imports; reviewed ESLint sorting fixed them. I-001 is the subsequent complete passing gate. Earlier source migration/type/lint probes are retained as intermediate evidence, never substituted for final results.

Local checks cover the authorized React correction scope. Python pipeline/launcher behavior, remote CI execution, publication, browser/screen-reader certification and runtime timing profiles were not run or claimed.

## Completion review

**Audit: complete. Implementation: complete.** All eight authorized actions meet their acceptance checks and link final evidence from plan.md. The seven original violation families are corrected, and CI now enforces the existing formatter gate. No required correction, inspection or user choice remains pending. All original inventories and failed baseline/intermediate checks remain preserved; final owners, caller changes, hashes, current candidates and code decisions are reconciled rather than replacing the starting scope.

ESLint protection is retained at its original rules/severities and warning ceiling; the complete retired helper family now passes it. Typed final API response schemas, the configured canonical-category neighbor regression, canonical theme generation/bootstrap behavior tests and CI Prettier wiring strengthen application prevention. Semantics of independent visual contracts, business sharing and query necessity still require review; no unsupported generic detector or rule preference was introduced.

There are still 143 warnings. Exactly one merged-owner exception was technically re-reviewed; 141 unchanged directives plus the existing sharing review warning remain outside technical revalidation. This is completion of the authorized corrective scope, not renewed approval of every historical exception. No commit or remote change was performed.
