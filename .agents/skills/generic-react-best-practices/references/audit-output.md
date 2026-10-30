# Audit output contract

Read this contract for every requested audit, alongside the
[two-phase method](audit-method.md). It defines the persistent handoff between
diagnosis and implementation. It does not make the report itself evidence that
the underlying review was performed.

## Location and required files

Use the consuming project's root for an application audit, or the repository
root for a repository-wide audit, unless the user specifies another audit root.
Create a new dossier with the user's reference date and a short scope slug:

```text
audit/
  YYYY-MM-DD-scope/
    scope.md
    coverage.md
    findings.md
    plan.md
    verification.md
    evidence/          # only when referenced outputs or reproductions need files
```

If that name already exists, add a numeric suffix. Resume an existing dossier
only when continuing that audit or when the user identifies its plan. Keep prior
dossiers; do not overwrite an independent audit's conclusions. Compare relevant
earlier findings and code decision comments to identify a missed violation,
regression, changed requirement or unsupported reinterpretation.

Keep all five Markdown files even for a clean audit: explicitly record no
findings, no corrective actions or no pending decisions as appropriate. Preserve
the headings below. Write content in English and use project-relative source
paths, symbols and line locations; identify renamed owners when implementation
moves code. Store actual application results here, never inside the reusable
skill. Keep the dossier outside the inspected source inventory. Respect existing
version-control policy; the output contract alone does not change ignore rules.

## scope.md

Use these headings:

```markdown
# Audit scope
## Request and phase status
## Frozen inputs
## File inventory and exclusions
## Rule inventory
## Required checks and completion criteria
## Checkpoint
```

Required content:

- Audit identifier, the request being fulfilled, project/audit roots and focused
  or full scope. State whether implementation was requested, its authorized
  scope and any explicit delegation of architectural choices.
- Separate phase statuses: `audit: in-progress | complete | incomplete` and
  `implementation: not-requested | ready | in-progress | awaiting-user | complete | partial`.
  Audit completion describes coverage and diagnosis; implementation completion
  describes the declared authorized actions. It is never a catalog-wide claim
  for a focused audit or a partial implementation request.
- Starting source revision, uncommitted and untracked authored files, relevant
  content fingerprints, catalog/rule content fingerprints, effective check
  configuration, lockfile/tool versions and baseline warning budget. A Git
  commit or skill version alone is insufficient when relevant inputs are dirty.
  A reproducible file/hash manifest may live under `evidence/` and be linked here.
- The closed list of in-scope authored files and selected catalog rules. Include
  every Quick Reference rule for a full audit. Large lists may be linked from
  the dossier rather than repeated, but directory names or aggregate counts
  alone are not a file inventory.
- Generated/vendor exclusions and the exact existing-ignore review policy;
  distinguish excluded material from reviewed compliance.
- Required check commands with working directories, expected gates, applicable
  analysis limits and the phase-specific completion criteria from the method.
- Pending batches and missing evidence if interrupted. Record dated input or
  scope deltas explicitly; preserve the original baseline and user decisions.
  Do not silently replace the baseline after fixes or shrink it to claim success.

## coverage.md

Use these headings:

```markdown
# Audit coverage
## File review
## Rule review
## Existing decisions and ignores
## Pending inspection
```

Maintain two inventories:

| Inventory | Required columns |
| --- | --- |
| File review | Project-relative file, applicable rule IDs or linked rule group, inspection evidence, linked findings/decisions, review status. |
| Rule review | Catalog rule ID and actual impact, eligible targets, automatic/manual coverage, analysis limits, evidence/findings, review status. |

Use the method's coverage statuses: `automatically checked`, `manually reviewed`,
`not applicable`, `existing ignore not revalidated` or `pending`. Combine automatic
and manual evidence when both apply. Rule rows may link named target lists and
shared command evidence; avoid repeating a full file-by-rule Cartesian table.
Every eligible target must still be accounted for. State an actual reason for
non-applicability and for configured exclusions.

Link each issue to its finding. Identify existing `@architecture-decision`
comments by source file and decision identifier, with the assumptions checked
and any concrete reopening trigger. Existing ignores left outside requested
revalidation remain explicitly unreviewed, without renewing their approval.

Keep unexamined code or unavailable evidence pending. A fully investigated rule
ambiguity can be linked as an open decision after inspection is complete; it
does not become a proven violation or conforming code. Tool silence and a count
of reviewed files do not replace substantive evidence.

## findings.md

Use `# Audit findings`, then one stable `## F-001 — Short concrete title` section
per finding. Preserve identifiers throughout the audit; comparable instances
may share one finding only when all locations and callers are listed.

Every finding contains the following fields and subsections. Write a concrete
reason when a field is not applicable; do not leave empty template placeholders.

```markdown
## F-001 — Short concrete title
- Kind: violation | ambiguity | prevention-gap | suggestion
- Rule IDs and actual impact:
- Affected files, symbols and callers:
- Proposed action: fix | ask-user | keep | defer
- Plan actions and related code decision identifiers:

### Requirement and evidence
### Why this matters
### Alternatives considered
### Proposed corrective plan
### Decision or clarification required
### Acceptance and prevention
```

Content requirements:

- **Requirement and evidence:** link the owning rule and exact obligation from
  the frozen contract; identify the conflicting code and inspect its exceptions.
  Link a minimal reproduction, diagnostic, test result or specific code/caller
  analysis. A lint finding names the intended rule, severity, effective command
  and baseline evidence. A semantic finding identifies the observed behavior or
  responsibility and the precise contradiction. A detector signal alone is not
  proof. For an ambiguity, record both interpretations and the exact unresolved
  condition; explicitly state that a violation is unproven. A prevention gap or
  optional suggestion must not be mislabeled as an application violation.
- **Why this matters:** explain the concrete incorrect behavior, ownership
  conflict or maintenance obligation, proportionate to the evidence. Distinguish
  observed behavior from an inferred consequence.
- **Alternatives considered:** compare the current arrangement, the recommended
  correction and at least one credible alternative for a structural choice.
  For each option, state compliance against the same applicable rules, exceptions,
  behavior, affected owners/consumers and tradeoffs. If there is no credible
  alternative or the fix is mechanical, state the precise constraint instead of
  inventing a second option. Existing conforming choices receive `keep`.
- **Proposed corrective plan:** identify code/caller changes, prerequisite steps,
  regression coverage, any proposed decision comment and related plan action IDs.
  This is a reviewable proposal, not an implementation claim.
- **Decision or clarification required:** state whether an existing instruction
  selects an option. Otherwise give the exact user question, distinct options,
  recommendation and consequence for the owning rule, enforcement or local
  decision. Use the method's decision routing; no new confirmation is needed for
  a choice already settled or explicitly delegated.
- **Acceptance and prevention:** name observable completion criteria and checks.
  Propose types, existing lint or bounded detector changes when sound, with invalid
  and valid examples, scope and analysis limits. Explain when judgment must remain
  manual. Separate a newly requested policy from proof under the original rule.

Record clean results in coverage rather than manufacturing findings. If there
are no findings, say so and link the completed coverage and baseline verification.

## plan.md

Use these headings:

```markdown
# Corrective plan
## Implementation scope and authorization
## Prioritized actions
## User decisions
## Rule and enforcement feedback
## Follow-ups and plan changes
```

Create stable `P-001` action identifiers, ordered by catalog impact and required
dependencies. This file is the source of truth for implementation status; findings
link here instead of maintaining a second independent status list.

| Required action field | Content |
| --- | --- |
| Findings and priority | Finding IDs, rule impact and any prerequisite exception to ordering. |
| Action and proposed option | `fix`, `ask-user`, `keep` or `defer`, selected/recommended option and affected source/rule/check files. |
| Status | `proposed`, `ready`, `awaiting-user`, `in-progress`, `verified`, `retained`, `rejected` or `deferred`. |
| Authorization or choice | User request, prior instruction/decision or actual answer that permits implementation/selects the option; otherwise the pending question. |
| Dependencies | Other action/decision IDs and which independent actions can proceed. |
| Implementation | Concrete steps, proposed non-obvious code decision comment and any contract or detector change. |
| Acceptance | Observable criteria, required commands and intended invalid/valid regression cases. |
| Outcome | Actual changed owners, verification references and material remaining work. |

Do not mark an action `ready` merely because the agent recommended it: phase-2
authorization and any necessary option selection must exist. Mark a fix `verified`
only after its acceptance evidence exists; a supported keep decision becomes
`retained`. Explain rejected or deferred actions. Deferring a required confirmed
violation does not complete an audit-and-fix request covering it.

Record each user arbitration under a stable `D-001` identifier: question, concrete
options, actual answer, chosen option, rationale, affected action IDs and its
scope. A pending question stays pending; elapsed time or a recommended option is
not an answer. Preserve previous choices and explain a new factual trigger before
superseding them. Do not require a global approval when the user already requested
implementation and all necessary choices are settled.

For every arbitration, record the durable feedback outcome: owning rule/example
clarification, reliable generic lint/type enforcement, or application code decision
comment. If multiple implementations remain allowed, say so. State why no rule or
detector change is warranted when the choice is contextual. During phase 1 these
are proposals; record their actual implementation during phase 2.

Track later input changes, newly exposed equivalent in-scope violations and any
necessary plan deltas explicitly. Keep unrelated improvements in follow-ups.

## verification.md

Use these headings:

```markdown
# Audit verification
## Baseline checks
## Detector calibration and reproductions
## Implementation checks
## Completion review
```

For every check, record a stable evidence identifier, phase, command, working
directory, relevant input state, exit status, errors/warnings or observed result,
and a bounded output/reproduction link when needed. Preserve baseline results
and add final results separately. Do not claim a check ran from its planned
command alone. Name failed, unavailable and not-run checks and their consequence.

Calibration evidence identifies the intended rule and severity, rejected example,
neighboring valid example, actual configuration and analysis limits. Runtime
evidence describes the sequence and observable outcome. Link each completed
plan action to its relevant acceptance evidence. Full-project warning-budget
results remain visible even when focused checks pass.

At completion, reconcile the file/rule inventories, findings, actions, pending
choices, affected code decision comments and final input deltas. State which
phase is complete and why; name remaining violations or choices explicitly.
Phase 1 can be complete with open corrective actions. Phase 2 can be complete
only for the explicitly authorized implementation scope under the method's
closure criteria. A passing report structure or tool command does not prove
the semantic conclusions.
