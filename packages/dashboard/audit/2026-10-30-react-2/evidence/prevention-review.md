# Prevention review — 2026-10-30

The user requested an investigation of changes to the reusable skill and/or ESLint after the two missed testing obligations. This follow-up changes proposals only. No application, skill, detector, configuration or test source was edited.

## Evidence and cause

- The first dossier's coverage.md:104 marked test-mock-data automatically checked and manually reviewed using typing, fixed dates and absence of cast/clock diagnostics. Fixture placement had no matching evidence. The existing rule implementation has only cast and clock messages/visitors; it contains no location check. Its owning rule explicitly documents that limit.
- The first dossier's semantic-review.md:37 explicitly reserved new-file colocation for phase-2 additions. Its phase2-input-deltas.json lists the new modules, but phase2-semantic-review.md checks existing rendering/network tests without reconciling sibling test files. The phase-1 rule table was intentionally preserved rather than updated with a final obligation-level delta.
- The current fixture-calibration.json reproduces the boundary: an incomplete cast is rejected at severity 2, while a complete defaults factory inside a test is accepted. That is the implementation's documented coverage, not evidence that the whole fixture rule passes.
- Existing instructions already say that passing tools and coverage counts do not prove compliance. The useful change is a concrete closure obligation with distinct evidence, combined with two bounded checks.

## P-004 — Make partial coverage and implementation deltas explicit

### Owning files

- `.agents/skills/generic-react-best-practices/references/audit-method.md`: rule coverage and phase-2 closure.
- `.agents/skills/generic-react-best-practices/references/audit-output.md`: coverage evidence and final input reconciliation.
- `.agents/skills/generic-react-best-practices/SKILL.md`: one short reference to the strengthened closure contract; keep detailed procedure in its existing references.

### Proposed contract

For a rule with distinct obligations, record which obligations the automatic check verifies, what semantic obligations were inspected, and what remains pending. A single overall manually-reviewed status cannot stand for obligations with no inspection evidence. Use target groups/family evidence; do not require a file-by-rule Cartesian table or invent IDs for every sentence in all 110 rules.

Example: test-mock-data has entity typing, determinism and fixture placement. Evidence for typing/determinism does not close placement. Existing ignores retain their separate policy and are not reopened by this refinement.

After phase-2 edits, reconcile actual added/extracted/moved modules with the frozen starting inventory and assess all catalog obligations triggered by those changes, including requirements absent from the original corrective-action list. Preserve the historical phase-1 table, but add current delta evidence instead of carrying its original applicability forward unchanged. Newly extracted views and new query/cache hooks trigger the existing new-file testing contract.

Illustrative wording for the existing references:

> For rules with distinct obligations, identify the obligations covered by each check and link the remaining semantic inspection. Keep unexamined obligations pending even when another part of the rule passes. Before closing implementation, compare the actual added, extracted and moved modules with the starting inventory and review the obligations their final contracts trigger. Original plan acceptance and unchanged baseline rows do not substitute for this delta review.

### Acceptance and limits

A future review of a typed, deterministic local fixture factory must retain placement as pending or report its violation. A phase-2 extraction with integration coverage but no required sibling must remain open under the colocation contract. A move of an unchanged historical module is distinguished from a newly introduced contract.

These are semantic review outcomes. A Markdown/JSON validator may detect missing fields or an unresolved state, but cannot certify that the underlying review actually happened. Do not add wording-snapshot tests claiming to establish review quality.

## P-003 — Extend the existing fixture rule within a sound boundary

### Owning files

- `.agents/skills/generic-react-best-practices/eslint-rules/test-fixture-contract.js`.
- `.agents/skills/generic-react-best-practices/rules/test-mock-data.md`: location-focused incorrect/correct examples and precise detection limits.
- A new generic sibling regression suite for this rule under the skill's `eslint-rules/`.
- `packages/dashboard/tests/eslint/`: actual configured integration coverage, retaining existing valid cast/partial/DOM cases.

### Proposed detector

Extend local/test-fixture-contract, already configured at error level. Recognize a complete defaults factory in a test whose return contract resolves to an application-owned domain entity and whose returned object supplies its required base fields, optionally followed by a Partial override. Resolve imported type aliases and supported union variants. Include function declarations and equivalent arrow/function expressions when their static shape is demonstrable.

Keep the implementation generic: no portfolio names, application fields, factory-name guesses or hardcoded entity allowlist. Do not infer fixture ownership merely because an object is assignable to some entity. Preserve raw validation inputs, expected assertion values, Partial arguments, existing-sample updates, state-updater callbacks and unrelated functions. Report unsupported inferred/opaque factories as a remaining manual analysis limit, not a clean result for the complete rule.

The closest feature/shared mocks owner still requires semantic review. This bounded detector will not automatically classify all 98 confirmed sample locations or every support-type factory.

### Regression cases and rollout

| Case                                                       | Required result                                     |
| ---------------------------------------------------------- | --------------------------------------------------- |
| Complete typed domain defaults factory inside a test       | Intended ownership diagnostic at severity 2         |
| Same factory in an owning mocks module                     | No ownership diagnostic                             |
| Test invoking an imported factory with Partial overrides   | No ownership diagnostic                             |
| Imported/aliased entity and supported union variant        | Same intended verdict; no name-based workaround     |
| Raw JSON/schema error case, expected value or state update | No ownership diagnostic                             |
| Missing type information or opaque/inferred return         | Documented analysis limit; no speculative violation |
| Existing incomplete cast / nondeterministic mock           | Existing diagnostics retained                       |

Develop generic tests in isolated projects with unrelated vocabulary and run consumer cases through calculated real configuration. Enable the strengthened detector with P-002's corresponding cleanup so the full lint gate stays honest. Do not add suppressions, raise the warning ceiling or weaken existing positive cases to deploy it.

## P-005 — Check sibling presence from actual file provenance

### Owning files

- `.agents/skills/generic-react-best-practices/rules/test-colocated-tests.md`: invocation, eligibility, move handling and manual behavior-coverage limits.
- New generic `scripts/check-test-colocation.mjs` and `scripts/check-test-colocation.test.mjs` in the skill.
- Skill `package.json`: proposed `react-best-practices-test-colocation` binary.
- `references/project-enforcement.md`: binding to the owning rule and consuming-project parameters.
- Audit method/output references: invoke and reconcile this result during phase-2 closure.

### Proposed scope

Use the frozen starting file inventory, the current authored-source inventory and an explicit reviewed move map. Comparing filesystem inventories also catches newly written untracked files; the tool must not rely exclusively on git diff, or assume a clean starting tree. Require an explicit valid baseline; absent/malformed input is an unavailable check, never a passing empty result.

Every newly appearing source path must have provenance: introduced/extracted runtime owner, move of an existing owner, type-only or an explained excluded role. For proven new components, hooks, helpers, services and stores, check a same-base sibling test. A new feature/view extraction counts as introduced even if an integration test exercises it. Type-only modules, fixture modules, stories, assets and tooling outside the rule's contract are distinguished. An ambiguous role/move requires review and cannot be silently dropped or reported as a proven violation.

Moves of existing source/tests must retain their relationship. A renamed historical owner with no previous sibling is not automatically a newly created module; semantic changes or a new independent contract still need review. The move map needs provenance validation and cannot be an arbitrary exemption list.

Use a separate project/audit command rather than embedding Git/provenance state in ordinary ESLint. This avoids making lint results depend on a checkout's chosen comparison commit and avoids a blanket requirement to retrofit every historical trivial module. CI adoption can supply its own explicit comparison input later; no CI rewrite is needed to run the audit closure check.

### Regression cases and limits

| Case                                                     | Required result                                          |
| -------------------------------------------------------- | -------------------------------------------------------- |
| New/extracted runtime owner without a sibling            | Failing presence result                                  |
| Same owner with a same-base sibling                      | Presence check passes                                    |
| Newly written, untracked source module                   | Included in the comparison                               |
| Source and sibling moved together                        | Relationship retained                                    |
| Unchanged legacy owner moved without an existing sibling | Classified move; no invented new-file violation          |
| Type-only module, story or fixture module                | Explained non-applicability                              |
| Missing baseline, unresolved role or unproven move       | Unavailable/pending result; never silently clean         |
| Empty sibling or nominal-only test                       | Presence may pass; behavior/edge coverage remains manual |

The permanent suite must create its own temporary baseline/current trees; it must not depend on this application's ignored audit artifacts. Test meaningful file/provenance behavior, not CLI wording snapshots. Where a detector change exposes equivalent in-scope violations, record the actual family and fix it with the corresponding plan action.

## Validation when implemented

Run generic rule/CLI regressions, actual consumer configuration cases, compiler/build checks for changed tooling, and the existing full lint/test gates. Refresh the installed local skill package before consumer checks as prescribed by project-enforcement.md, regenerate AGENTS.md and run its check mode, and validate the modified skill. Source rules remain authoritative; do not hand-edit generated AGENTS.md.

No new catalog rule or severity is needed for these three changes. The 110-rule inventory and existing warning budget remain. No test source or skill source was changed during this investigation, so previous execution evidence is retained without an unnecessary full test rerun.
