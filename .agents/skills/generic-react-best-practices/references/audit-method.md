# Audit method

Requested audits use two phases: **audit and proposal**, then **take account of
findings**. Catalog rules and their actual impact define the review; lint and
complementary scripts supply evidence. Both focused and full audits use the
[required output contract](audit-output.md). Ordinary implementation work and
rule explanations do not require an audit dossier.

## Workflow and authorization

A bare audit or findings-only request runs phase 1 and ends with a reviewable
dossier. It does not authorize source corrections. An explicit audit-and-fix
request authorizes both phases: complete the dossier first, then continue with
the authorized actions without asking for the same permission again. A later
request to apply the plan starts phase 2 from the existing dossier.

During phase 1, write only audit artifacts and transient output or isolated
probes needed for analysis. Do not change application source, tests, catalog
rules, detectors, configuration or warning ceilings, and do not run autofixes.
Propose those changes in the plan. Existing check caches and generated test
output are incidental tool output, not permission to change the audited inputs.

A required user choice holds only its dependent actions. Complete all useful
analysis and concrete options before asking, and continue independent authorized
work. Existing user decisions, project decisions and explicit delegation of the
choice remain valid across turns.

## Phase 1: Audit and proposal

### Establish scope and keep a checkpoint

Create a new dossier under the consuming project's `audit/<date>-<scope>/`,
following the output contract. Fix the requested root, authored-file inventory,
selected rules, required commands and ignore-review policy before classifying
findings. Include source, tests and relevant tooling/configuration. A full audit
accounts for every Quick Reference rule and every in-scope authored file; a
focused audit states its narrower scope.

Record the starting revision and uncommitted content, rule contracts and effective
check configuration. Use content fingerprints when a version or commit alone
does not identify those inputs. Assess all alternatives against the same
requirements. Propose any necessary clarification explicitly; a new preference
is a catalog change rather than proof of an original violation.

Identify existing exclusions and their effect on coverage without technically
revalidating them unless requested. Explain any new audit-scope exclusion; never
introduce one to hide a violation or replace a global request with a sample.
Keep the dossier outside the inspected source set.

For each selected rule, enumerate eligible patterns, including valid-looking
candidates, rather than searching only for known errors. Read the implementations
and callers needed to decide ownership or behavior. Track file review and rule
coverage separately, linking findings and evidence. A category name or passing
command is not coverage evidence. For rules with distinct obligations, identify
which obligations each check verifies and link the remaining semantic review.
Keep an unexamined obligation pending even when another part of its rule passes.
For example, typed deterministic fixtures do not establish their owning location. Process manageable batches and retain pending
entries so an interruption can resume without silently narrowing the scope.

### Stabilize verdicts and record architecture decisions in code

For every proposed correction, identify the owning rule's explicit requirement,
the code that contradicts it and why its exceptions do not apply. Distinguish
proven violations, contract ambiguities, prevention gaps and optional suggestions.
An alternative conforming arrangement does not establish a violation.

Before proposing a structural correction or resolving a disputed keep decision,
examine a credible alternative under the same applicable rules and exceptions.
Explain how each option affects responsibilities, consumers, behavior and change
cost. If no credible alternative can be established, state the concrete constraint.
Several conforming implementations do not by themselves make a rule ambiguous.

If reasonable interpretations produce contradictory compliance verdicts, record
both interpretations, the exact contract gap and a distinguishing example.
Propose the clarification before the disputed correction; do not silently turn a
preference into a new requirement. An unproven violation remains an ambiguity or
an unverified candidate, not a confirmed defect.

Inventory existing `@architecture-decision` comments in the requested source
scope. Read relevant code and callers to establish whether their assumptions
hold. Preserve a supported conforming choice. Reopen it only for a relevant
implementation or rule-contract change, a met revisit condition, or concrete
contradictory evidence; identify that trigger in the finding.

For settled non-obvious choices, include the proposed
[architecture decision comment](../rules/quality-jsdoc-minimal.md#architecture-decision-comments)
in the plan. Add or update it in code only during phase 2. Dossiers track review
and implementation; the code-local comment remains authoritative for the current
local choice. It grants no exception and does not alter the ignore-review policy.

### Select rules, prioritize review and bind tools

Read each selected rule's contract, examples, exceptions and actual impact.
Process CRITICAL, HIGH, MEDIUM-HIGH, MEDIUM, LOW-MEDIUM and LOW in that order;
use category priority to break ties. Category impact is a ceiling. Rules without
detectors receive semantic review at their own impact. Plan prerequisite
corrections first when a higher-impact finding depends on them.

Resolve check bindings through [project enforcement](project-enforcement.md).
Read their configured scope and limits. Use a complementary script when it
supports a selected rule, not because it appears in a tooling inventory. Baseline
commands may be batched; map their output to owning rules before prioritizing.
For a focused audit, inspect in-scope results from a project-wide command without
expanding the correction scope to unrelated code.

Distinguish bounded deterministic failures from semantic candidates. Large JSX,
an unresolved dependency or an acyclic graph does not prove a responsibility
violation or lawful ownership. A catalog usage check does not prove all visible
copy is translated. Apply each rule's contract and exceptions.

### Calibrate detection and inspect comparable cases

Inventory recurring failure families, including component roles/composition,
mixed presentation, helper/service effects, indirect dependencies, formatter
contracts and entity placement. Include callers and neighboring valid cases.

For a deterministic family, prove a representative incorrect case is rejected
by the intended rule at the expected severity, and a neighboring valid case is
accepted through the actual project configuration. Use isolated probes in phase

1. Include aliases, reexports, dynamic imports, wrappers, indirection and
   shadowing where they affect recognition. An unrelated error is not detection.

If coverage is missing, record the detector gap, inspect comparable in-scope code
manually and propose a bounded prevention action. Do not modify the detector
during phase 1. State actual responsibilities for semantic candidates; suffixes,
hook counts and JSX size alone do not establish a role or a required extraction.

### Investigate lint and catalog requirements

Run the application's real lint command, retaining errors, warnings, exit status
and the warning-budget result. Inspect each diagnostic against the owning rule
and its exceptions. A passing exit code or accepted warning total does not prove
catalog compliance. A false positive requires a detector correction proposal or
an exception assessment, not an application rewrite solely to silence the tool.

For each selected rule, record coverage with concrete evidence:

- **Automatically checked:** identify the effective check, its invalid/valid
  probes and analysis limits; review applicable code beyond those limits.
- **Manually reviewed:** identify inspected code, callers and the responsibility
  or behavior checked.
- **Not applicable:** name the absent capability or pattern; library installation
  alone does not establish applicability.
- **Existing ignore not revalidated:** identify the affected pattern without
  renewing its technical approval. Continue with other applicable patterns.
- **Pending:** name the unexamined target, unavailable evidence or unverified
  claim. Pending inspection prevents phase 1 from being complete.

A rule can have both automatic and manual parts. Record any proven violations or
contract ambiguities in findings even when inspection itself is complete.
TypeScript establishes declared types, not business meanings such as ownership,
dates, amounts or fixture completeness hidden behind assertions.

Inspect runtime sequences where relevant: cancel activation, open/close/reopen,
outside dismissal, mode changes and keyboard entry/exit with unavailable controls.
Use existing tests or isolated reproductions in phase 1; propose source regression
tests for phase 2. Test the missing property directly: presence does not establish
invocation, ordering or honored cancellation.

### Review exceptions only when required

Read [suppression policy](../rules/quality-eslint-disable-scoped.md) and
[warning budgets](../rules/quality-eslint-warning-budget.md). Existing inline
suppressions, configuration ignores, rule deactivations, severity reductions and
baselines receive technical revalidation only on explicit request. A full audit,
catalog update or nearby code change is not that request. Keep normal metadata
and unused-suppression checks enabled and record their actual findings.

When existing-exception review is requested, inventory the affected bypasses.
Generated or vendored exclusions are not automatically defects. Lift only the
relevant exception in an isolated check, preserving effective configuration;
verify the intended rule applies before declaring a suppression unused. Inspect
implementation, callers and dependency evidence, then record:

- **Obsolete:** propose removal when the applicable check no longer reports it.
- **Unjustified:** prove the underlying violation and propose correction/removal.
- **Justified:** establish a false positive, dependency constraint or exception
  allowed by the owning rule; prefer a detector correction where feasible.
- **Unresolved:** identify missing evidence without renewing approval.

Do not bulk-approve, bulk-date or modify suppressions during phase 1. New or
modified exceptions introduced in phase 2 always require this assessment and
warning-budget reconciliation, even without a request to review existing ones.

### Propose deterministic prevention

Review findings and manual coverage gaps for reliable types, compiler settings,
existing checks or bounded extensions to existing detectors. Do this even when
there are no violations, without manufacturing a new rule to report an addition.
A missing detector is not itself proof that application code violates a rule.

Each proposed enforcement change belongs in the plan with its owning contract,
observable invariant, analysis limits, invalid/valid cases, affected scope and
acceptance checks. Prefer existing enforcement and type/API constraints. Custom
checks must be reusable across applications adopting the documented conventions;
keep application entities, field names, fixture values, absolute paths and
one-off allowlists out of their logic. Configurable roots and resolved library
APIs are valid inputs. Verify portability with unrelated example vocabulary.

Uncertain semantics, disproportionate analysis or broader hardening remain
explicit proposals. A missing detector does not block phase-1 completion once
its applicable code has been reviewed and its plan is recorded. Implementation
is part of phase 2 only when included in the authorized plan.

## Route findings and user decisions

Set each finding's proposed action according to this table. A plan's `fix`
classification establishes a recommendation, not user authorization by itself.

| Evidence and existing decisions                                                                | Action                                                                                              |
| ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Proven violation with a correction selected by the contract or existing instructions/decisions | `fix`: propose the correction and acceptance checks; implement in authorized phase 2.               |
| Proven violation with materially different conforming corrections and no established selection | `ask-user`: present concrete options, consequences and a recommendation.                            |
| Reasonable interpretations give contradictory compliance verdicts                              | `ask-user`: propose the exact contract clarification and distinguishing examples before correction. |
| Existing code conforms, including a supported recorded architecture choice                     | `keep`: retain it; an optional alternative is a suggestion.                                         |
| Sound generic prevention opportunity beyond existing enforcement                               | `fix` when part of the authorized implementation plan; otherwise `defer` as a prevention proposal.  |
| Missing implementation evidence or incomplete inspection                                       | Keep coverage pending; investigate rather than inventing a proven violation.                        |

When materially different conforming corrections remain and no existing
instruction or decision selects one, ask the user to choose before implementing
that action. A user's explicit delegation to choose resolves this requirement.
Routine equivalent implementation details do not create a structural arbitration.

Prepare the complete finding, proof or uncertainty, alternatives, proposed
corrective plan and precise question before asking. Link the dossier and this
section, quote the applicable decision instruction and explain the concrete
choice it requires. Do not ask to reauthorize work or a choice already covered
by the session. While a choice is pending, continue independent authorized work.

Record each answer in the plan with the chosen option, rationale and scope.
Translate it into durable guidance:

- A reusable requirement or ambiguity resolution belongs in the owning skill
  rule with applicability, exceptions and distinguishing examples.
- A reliably observable invariant should use existing enforcement or a bounded
  generic detector, with rejected and valid cases through actual configuration.
- A contextual application choice belongs in the code decision comment. If
  several structures remain allowed, document that freedom rather than implying
  the chosen one is universally mandatory.

For every arbitration, state which of these applies and what will change; explain
when no new static check is sound. User selection of one valid option alone does
not prove the others violate the original contract. Keep an intentional new
requirement distinct from clarification of an existing one.

## Phase 2: Take account of findings

Read the dossier and the user's implementation request before editing. Check
that code, rule and configuration fingerprints still match the reviewed inputs.
When relevant inputs changed, revalidate affected findings and callers, recording
the delta. Preserve unaffected review; do not blindly apply stale plans or
restart the full audit for a local change.

Implement authorized `fix` actions in catalog impact order and dependency order.
Handle unresolved `ask-user` actions through the routing above. Retain conforming
choices and leave optional follow-ups outside the active correction scope.
A bare phase-1 request does not become implementation authorization because the
dossier contains a proposed fix.

Resolve approved contract clarifications before disputed code changes. Record
any intentional new requirement and its affected scope separately from the
original proof. Implement planned prevention using existing types/checks first;
add a custom detector only for a sound reusable contract. Verify intended rule
IDs and severity, invalid and neighboring valid examples, relevant aliases,
wrappers and shadowing. For type constraints, prove the expected type error and
a valid compilation. Keep generic rule logic independent of application names.

Fix complete in-scope failure families with callers. Include equivalent
violations exposed by a planned detector change within the original scope,
linking them to existing findings or adding explicit new findings and plan deltas.
New materially different options use decision routing; unrelated hardening goes
to a follow-up. Never lower severity, broaden ignores or raise warning ceilings
to obtain a pass. Review actual autofixes and every new or modified exception.

Add or update the code decision comment for each settled non-obvious choice,
including an authorized keep decision. Move it with its owner and remove it
when the choice disappears. Keep its rationale and revisit conditions current;
the dossier records implementation progress rather than replacing the comment.

Reconcile actual added, extracted and moved modules with the frozen starting
inventory. Review every obligation triggered by their final contracts, including
requirements absent from the original corrective-action list. Keep the historical
phase-1 table and add a current delta; do not inherit an earlier non-applicability
reason for newly introduced code. Run the source-snapshot colocation check bound
to test-colocated-tests, including untracked additions and reviewed move evidence.
Presence alone still needs nominal/error/edge behavior review.

Run focused checks after coherent batches and required full-project checks at
meaningful milestones and after final changes. Re-review affected code and
callers, compare final diagnostics to the baseline and update findings, plan and
verification. Keep runtime regression tests tied to observable behavior and,
where practical, demonstrate that they fail against the original implementation.

## Finish with the evidence that exists

### Close phase 1

Mark the audit complete when every in-scope authored file and selected rule is
accounted for, no inspection candidate remains pending, every finding contains
its evidence or precise contract ambiguity, and every proposed action has
alternatives, acceptance criteria and dependencies in the dossier. Complete the
prevention review and record check results and coverage limits.

Proven violations, failing application checks and documented user arbitrations
may remain open: phase-1 completion means the diagnosis and plan are complete,
not that the code complies. Missing evidence that prevents inspection keeps the
audit incomplete. Link pending choices and required questions in the plan.
For an audit-only request, finish here.

### Close phase 2

Mark implementation complete only when the authorized correction scope is
fulfilled, all its required user decisions are resolved, confirmed violations
are corrected, planned enforcement and comment updates are complete, required
checks pass and affected code and callers have been re-reviewed. Every completed
action links to verification evidence. Distinct obligations and the introduced-code
delta must have current evidence; original plan acceptance alone does not close
newly triggered requirements. Existing ignores follow the announced
review policy and are not counted as newly approved.

If the user requested only selected actions, identify that limited implementation
scope explicitly and keep other findings open. A request to correct the entire
scope cannot be silently narrowed or completed with deferred violations.
An outstanding required decision or failed check keeps its dependent work open.

Once the applicable closure conditions hold, finish. Another conforming solution
does not reopen a settled choice. After a correction, revisit only decisions
whose assumptions or compliance can change through its actual effects. Separate
new preferences and broader prevention work from the completed scope.

### Report volumes and the score

Use the fixed [metrics contract](audit-metrics.md) for every dossier. Preserve
baseline/final snapshots and report all actual impact levels, confirmed families
and affected files separately. The versioned score counts each violated rule once
and is withheld for pending inspection. Disclose scope and unrevalidated exceptions;
a score does not replace coverage evidence or change correction priority.

### Handoff

Keep the final response concise: link the dossier, name the completed phase,
summarize proven violations versus pending decisions and cite relevant checks.
For phase 2, summarize actual ESLint, TypeScript or equivalent protections added
or strengthened and their purpose; if none were added, say why. Distinguish
proposals from implementation and report material open work.

On interruption or an actual blocker, save pending targets, missing evidence and
the next batch in the dossier; report the phase as incomplete. Passing tools,
finishing one batch or reaching a warning budget is not a substitute for coverage.
Working notes and well-formed artifacts do not prove substantive inspection:
review the evidence before claiming completion.
