# Audit findings

## F-001 — Omitted canonical types silently remove the matching universe

- Kind: prevention-gap
- Rule IDs and actual impact: test-mock-data, MEDIUM.
- Affected files, symbols and callers: scripts/fixture-candidates.mjs, findFixtureCandidates, installed fixture CLI and all consumers using a restricted TypeScript project.
- Proposed action: fix.
- Plan actions and related code decision identifiers: P-001; no business architecture decision changes.

### Requirement and evidence

The frozen Complete sample inventory contract enumerates canonical domain contracts using the actual project and rejects unavailable input. [Isolated installed-package reproduction](evidence/baseline-boundaries.json): a source test containing `{weight:2}` produces one candidate with its canonical type included. A tsconfig containing only that same test succeeds with zero contracts and zero candidates while the canonical file still exists under source/domains. The previous completeness check reconciles tests only. This is an analyzer reliability gap, not a proven application fixture-placement violation.

### Why this matters

The standalone inventory can report successful availability after silently dropping the types that define what it searches for. Candidate equality cannot detect a missing matching universe.

### Alternatives considered

Continue relying on separate manual configuration review, or silently inject missing types into the program. The former leaves the CLI's availability result incomplete; the latter overrides the selected configuration. Reject omitted canonical files with their relative paths, just as omitted tests are rejected. Complete projects and explicitly narrowed sources remain valid.

### Proposed corrective plan

Reconcile filesystem canonical types as well as tests against the compiler program. Preserve the no-field-count inventory and normal compiler diagnostics. Cover inherited exclusions, .type.ts files without object declarations, an empty domain tree and included imported types. Do not require types outside the selected source.

### Decision or clarification required

None. This extends the existing fail-on-unavailable-analysis protection under the authorized prevention scope.

### Acceptance and prevention

Omitted canonical types fail with CLI exit 2 and the omitted path; an equivalent complete project exits 0 and retains its candidate. Actual dashboard candidates/exclusions stay reviewed. Portable sibling and CLI tests cover both sides.

### Phase-2 input-root delta

The required relocated-project check run from the repository root failed with missing node/vite type libraries, while the same project works from the dashboard directory. Preserve evidence in phase2-relocation-before-root-fix.json. The parser was not given its configuration filename, so TypeScript resolves default type roots against process.cwd rather than the explicitly selected project. Installed TypeScript getEffectiveTypeRoots confirms this branch. Prior relocation ran from the application and did not vary the invoking directory. P-001 additionally passes the configuration filename to the existing parser, preserving the actual selected options and making explicit-root execution independent of caller cwd. Add a portable configured-type-library CLI regression from an unrelated cwd; do not change process.cwd or mask missing dependencies.

## F-002 — Ancestor exclusions hide a nearer business call

- Kind: prevention-gap
- Rule IDs and actual impact: test-mock-data, MEDIUM.
- Affected files, symbols and callers: scripts/fixture-candidates.mjs, exclusion; test case tables, Yup validation calls and mock consumers.
- Proposed action: fix.
- Plan actions and related code decision identifiers: P-002; no new runtime owner or business decision.

### Requirement and evidence

The inventory must distinguish expected/raw/scenario/override data from input samples consumed by business calls. [Three paired probes](evidence/baseline-boundaries.json) show that `it.each([consume({weight:2})])`, `schema.validateSync(consume({weight:2}))` and `makeParcel(consume({weight:2}))` are excluded as though the original object were passed directly to each outer API. The resolved nearer consume call has no recognized exemption. The earlier assertion-family fix already stops at such an intervening call, but the other exclusions keep walking ancestors.

### Why this matters

A complete inline sample can avoid both candidate review and the durable CI gate merely because the result of its business consumer is subsequently used in a case table or validation/mock call. An ancestor API does not establish the original object's responsibility.

### Alternatives considered

Remove all these exclusions, causing direct raw/scenario/mock arguments to require review, or add a universal data-flow interpreter. Prefer the bounded existing assertion approach: the nearest enclosing call determines whether a call-based exemption is recognizable. An unknown nearer call leaves a candidate for semantic review. Typed Partial overrides and explicit spreads retain their separate documented meanings.

### Proposed corrective plan

Stop call-based exclusion search at the first unrecognized call. Preserve direct valid cases, arrays/record wrappers, imported aliases, and supported library binding checks. Add portable paired regressions and an installed-CLI assertion that a wrapped business input makes a fresh empty ledger pending.

### Decision or clarification required

None. The correction changes enumeration, not automatic fixture ownership policy.

### Acceptance and prevention

All three wrapped business inputs become requires-semantic-review candidates; direct corresponding arguments remain excluded. Candidate collection still exits 0, review of an unapproved candidate exits 1. Inspect any real dashboard delta rather than adding blind approvals.

## F-003 — Review freshness omits other analyzed tests

- Kind: prevention-gap
- Rule IDs and actual impact: test-mock-data, MEDIUM.
- Affected files, symbols and callers: fixture collector sourceSha256 fingerprint, fixture-review validator consumers and documentation; current dashboard ledger.
- Proposed action: fix.
- Plan actions and related code decision identifiers: P-003, after P-001/P-002 stabilize the inventory.

### Requirement and evidence

Repeatable review binds a keep decision to inspected definitions and consumers. [Cross-test dependency probe](evidence/baseline-boundaries.json): an unchanged candidate test imports consume from another .spec.ts module. Editing that consumer leaves every analysis fingerprint unchanged and the ledger reviewed. sourceSha256 explicitly drops every test, and row hashes cover only files with candidates. Test files are allowed to contain runtime exports; their suffix does not establish irrelevance to another candidate's semantics.

### Why this matters

The reviewed CI result can reuse an old semantic disposition after its analyzed consumer changed. Prior testing varied the candidate's own file and non-test inputs but not another test file.

### Alternatives considered

Compute a candidate-specific dependency graph or conservatively fingerprint all analyzed in-source files. The existing design already invalidates reviews for any production-source change. Extend that same conservative boundary to tests, avoiding a second partial dependency analyzer. This intentionally also requires fresh review after unrelated in-source test additions/changes; document that cost. A mechanically fresh reason still cannot prove its meaning.

### Proposed corrective plan

Include test files in sourceSha256. Keep row identities and file hashes as useful per-candidate diagnostics. Document the broadened fingerprint and manual refresh procedure, test changes/additions/removals and checkout relocation, and re-review the actual 15 current semantic decisions before updating their metadata. Do not add an automatic ledger refresh command.

### Decision or clarification required

None. This is a routine conservative implementation of the user's requested deterministic prevention; existing semantic decisions remain subject to inspection before refresh.

### Acceptance and prevention

Changing only another analyzed test makes the old ledger pending even when candidates are unchanged. A freshly reviewed valid owning-factory consumer passes. Tests outside the selected source and opaque ownership meanings remain outside this bounded guarantee.

## F-004 — A formatted month label still owns its fallback in the component

- Kind: violation
- Rule IDs and actual impact: helpers-formatter-hooks, MEDIUM-HIGH.
- Affected files, symbols and callers: src/domains/portfolio/features/wealth/components/WealthComparisonKpi.view.tsx, currentLabel and Kpi.Detail; owning useFormatMonthRange and the existing component/formatter tests. Reusable no-inline-format-fallback detector and its configured integration cases.
- Proposed action: fix.
- Plan actions and related code decision identifiers: P-004; phase-2 discovered in-scope family. No architecture choice is reversed.

### Requirement and evidence

The frozen Missing Values in Every Formatter contract requires the existing formatter to own the configurable text fallback. WealthComparisonKpi computes `currentLabel = formatMonthRange(currentMonths)` and then renders `currentLabel || i18n.t('ui.wealthtab.insufficientHistory')` at line 59. useFormatMonthRange already accepts a fallback option and returns it for an empty array. Its existing test covers custom fallbacks. No loading/structure/comparability branch is involved: both alternatives are the same detail text. The component's empty-history test proves the exact output to preserve. [Actual configured invalid/valid probes](evidence/baseline-format-output.json) receive no intended-rule error before the correction.

### Why this matters

The fallback policy is duplicated in a formatter consumer despite an existing supported option. This is a maintenance/convention defect; the current output is not claimed numerically wrong. Source/contract hashes match earlier audits, so this is an earlier missed violation, not a new preference or regression.

### Alternatives considered

Pass the translated fallback through the existing formatter's options, preserving output and the caller's translation key. Adding a new formatter or changing the common default is unnecessary and would affect other consumers. The correction is mechanical under the existing contract.

### Proposed corrective plan

Pass the existing translated fallback into formatMonthRange and render currentLabel directly. Extend the existing reusable ESLint rule to recognize direct `formatter(value) || text` / `?? text` and immutable aliases of the formatted result, with translated/literal text fallbacks. Preserve structural JSX, unrelated/shadowed calls, mutable aliases and business conditions. Add portable bad/good tests plus a real-configuration integration pair. Inspect the full-project diagnostics for equivalent in-scope cases.

### Decision or clarification required

None. Existing output, translation and formatter API select the correction. The concrete currentLabel code contradicts the earlier retained whole-rule conclusion and is its explicit reopening trigger.

### Acceptance and prevention

Actual configured lint rejects the output fallback with local/no-inline-format-fallback at error level and accepts formatter-owned fallback. Existing component and formatter tests preserve nominal and unavailable-history text. Full lint identifies any equivalent cases without weakening severity or raising the ceiling. New standalone result-fallback tests fail on the old detector.
