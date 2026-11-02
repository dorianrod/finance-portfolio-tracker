# Audit scope

## Request and phase status

Independent full React catalog audit of `packages/dashboard`, requested with `$generic-react-best-practices audit`. Reference date: 2026-10-30, Europe/Paris. Dossier: `audit/2026-10-30-react-3`.

- audit: complete
- implementation: complete

Phase 1 covered diagnosis and proposals; its original state is preserved in evidence/phase1-scope.md. On 2026-10-31 the user authorized P-001 implementation and P-002 detection improvements. Current implementation changes tests/mocks, packaged analysis tooling, commands and documentation. No application runtime behavior, warning ceiling or existing exception changed. No commit, remote write or publication was requested; no user arbitration is pending.

## Frozen inputs

Starting revision: `c41a6ab029ee2a92fc45b3426b3ce08a2b1a7399`; authored working tree initially clean. [Start](evidence/start.json), [1351-file content manifest](evidence/files.json), [rule/tool/config fingerprints](evidence/contracts-and-config.json), [effective configurations](verification.md#detector-calibration-and-reproductions), and [installed-package equality](evidence/installed-package.json) freeze the inputs. Node 22.22.0 / npm 10.9.4; lockfile and package versions are fingerprinted. Baseline warning ceiling: 143.

All 1350 preceding final source/support inputs and all previously fingerprinted rule/configuration inputs match the preceding completed audit exactly. `pyproject.toml` is an additional read-only packaging/version input, not a changed source file. [Exact comparison](evidence/comparison-to-prior.json). The installed skill's executable code and contracts match the workspace. Unchanged prior semantic evidence is explicitly retained; this report does not claim a fresh line-by-line reread of every unchanged file. Fresh inspection supersedes the previous fixture-ownership verdict at the precise locations in F-001.

## File inventory and exclusions

The closed [per-file inventory](evidence/files.json) includes authored React/TypeScript source, tests, mocks, Storybook, catalogs/assets and associated configuration/documentation, plus three CI/release workflows, ignore policy and packaging metadata. [Per-file review](evidence/file-review.json) and [named target groups](evidence/target-groups.json) account for every target.

Generated/vendor dependencies, build and Storybook output, public generated data, caches, coverage, Python implementation/tests/packaging hooks, other application packages, and audit dossiers are excluded. Dedicated authored assets present in the original manifest remain included with the stated static-asset exceptions. Supplemental `pyproject.toml` is read only for metadata consistency; it does not expand into a Python audit. No exclusion was added to hide an application violation.

Existing inline suppressions, configured exclusions/severity choices and budgets receive no technical revalidation without an explicit request, per the owning rule. Normal metadata, tracking and unused-disable checks remain enabled. All [142 unchanged directives](evidence/exceptions.json) remain **existing ignore not revalidated**; no review date or justification was renewed. The existing unsuppressed sharing-review warning remains separately visible.

## Rule inventory

All 110 Quick Reference rules, with their individual actual impacts, are selected. [Rule review](evidence/rule-review.json) and [coverage](coverage.md) identify eligible targets, automatic/manual obligations, retained evidence, limits and findings. The current result has 101 applicable rules, nine not applicable and zero pending inspections.

The `tailwind-design-system` companion applies only to shared UI. The React catalog has priority over companion examples. No new policy is inferred from a different conforming implementation; eight code-owned architecture decisions and 94 feature-boundary choices are retained under unchanged inputs.

## Required checks and completion criteria

Required baseline checks from `packages/dashboard`: uncached normal lint at ceiling 143, architecture inventory, production import cycles, i18n catalog usage, configured Prettier check, strict TypeScript, full application and generic tests, production and Storybook builds. Actual configured invalid/valid probes test relevant recurring detector families and the fixture detection limit. Capture a source snapshot and compare against the prior final snapshot for new-owner provenance. Calculate metrics with the packaged calculator. [Commands, exits and evidence](verification.md), [machine check ledger](evidence/checks.json).

Phase-1 completion requires every file/rule and current semantic candidate to have a disposition, confirmed findings to carry proof and alternatives, prevention review, actionable correction proposals, metrics and actual check results. A passing gate alone does not close a semantic obligation. Phase 1 may close with open corrections; phase 2 was not requested and is not claimed.

## Checkpoint

Phase-1 baseline (preserved): 1351 files; 110 rules; 57 complete-shape fixture candidates plus five overlapping composed-input candidates disposed; 43 unchanged architecture candidates; zero pending inspection or user arbitration. At phase-1 diagnosis, F-001 was one open MEDIUM family across 12 test files; the phase-2 delta below records its verified resolution. All required checks pass. [Metrics](metrics.md) report 99.65/100 for reviewed obligations excluding 142 unrevalidated directives. See [plan](plan.md) for the authorized, verified correction and prevention implementation.

## Phase-2 delta (2026-10-31)

The [final 1358-file app/support manifest](evidence/phase2-files.json) preserves every original target and adds six typed fixture modules plus one actual installed-package integration test. New generic tooling owners and final contract/config hashes are separately in [phase2-contracts-and-config.json](evidence/phase2-contracts-and-config.json). [Input deltas](evidence/phase2-input-deltas.json) identify every change; application production runtime changes are zero.

Two equivalent previously hidden input fixtures discovered by the improved inventory extend F-001 to 14 test files without changing its rule/impact or denominator. Original baseline remains unchanged. [Introduced owners and triggered obligations](evidence/phase2-introduced-owner-review.json), [current file review](evidence/phase2-file-review.json), [fixture dispositions](evidence/phase2-fixture-review.json), [root causes](root-causes.md) and [final metrics](evidence/metrics-final.json) describe the current result. No original scope was narrowed. All required implementation checks pass; P-001 and P-002 are verified. Implementation is complete, with no pending candidate or arbitration.
