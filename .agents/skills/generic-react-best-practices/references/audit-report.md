# Audit coverage and output contract

Use this contract for an audit or review request. It complements
[the audit method](audit-method.md); it does not turn ordinary implementation
work into a full audit. The requested scope controls the inventory. A request to
audit or fix everything requires all catalog rules and all relevant authored code,
tests and tooling. A focused review declares its smaller scope explicitly.

## What is counted

An **occurrence** is one eligible opportunity to apply one catalog rule. Define
its unit and enumeration method before assigning results. Examples:

| Rule responsibility | Possible eligible unit |
| --- | --- |
| Component role | Each production component module and its declared role |
| Import boundary | Each resolved import edge subject to that boundary |
| API response validation | Each endpoint hook's response boundary |
| Formatter fallback | Each value-to-text formatter contract |
| Explicit nullability | Each modeled nullable/optional entity field |
| Exception review | Each suppression directive or configuration exception |

Choose the unit from the owning rule's contract, and preserve it across runs.
These examples are not a fixed unit registry. A search for forbidden constructs
alone cannot count the correct neighboring constructs: finding zero `enum`
declarations does not establish how many closed value sets were reviewed.

For every discovered occurrence, record a stable semantic ID, location, result
and evidence. Use a symbol, endpoint intent, field or dependency as its locator;
line numbers assist navigation but must not be the sole identity. Preserve IDs
when code moves. The same code may be eligible under several rules: counts are
per-rule assessments, not unique files or unique defects.

Within one rule, distinct active occurrences need distinct file/semantic-locator
pairs. Do not create a second ID for the same eligible unit to inflate totals;
use a more precise semantic locator when several eligible operations share a
function. Assign one writer to each audit state; independent reviewers contribute
records for that writer rather than overwriting the checkpoint concurrently.

Results are disjoint:

- `ok`: reviewed and compliant, with evidence.
- `error`: a confirmed violation linked to an open finding.
- `exempt`: an exception explicitly permitted by the rule and linked to a
  justified retained exception. Keep it separate from OK.
- `pending`: discovered but not yet decided. Never convert it to OK because lint
  is quiet or the current task has already taken time.
- `removed`: a historical occurrence deliberately removed from the source, with
  evidence. Keep it for continuity; exclude it from the current population.

For each rule: **Found = OK + Error + Exempt + Pending**. A rule whose discovery
is pending may still have undiscovered occurrences; its Found count is a lower
bound. Do not present an incomplete enumeration as complete coverage or 100% OK.
`not_applicable` requires a completed search, a stated unit, zero occurrences and
evidence of the absent capability. An unselected rule in a focused audit is out of
scope, not not-applicable.

## Retained state

Keep a JSON state per run and render a Markdown report from it. The state is
required for audit continuity; committing it is the caller's choice. Select an
artifact location outside the inspected source paths, retain previous runs, and
keep application-specific artifact names out of this reusable skill.

The helper `scripts/audit-report.mjs` uses schema version 1 and no dependencies
beyond Node >= 18. Initialize it rather than manually copying the catalog:

```bash
node "$skill_dir/scripts/audit-report.mjs" init \
  --root "$project_dir" --scope src --out "$audit_dir/run.json"
```

Set the three variables to the actual skill, project and artifact directories
first. The example declares `src/` only. Add `--scope` for every other authored
test, configuration and tooling path relevant to the requested audit. Paths must
exist. Use repeated `--exclude 'path=concrete reason'` only for justified
exclusions, and review each exclusion as a `scope` exception. Symlinks require an
explicit inventory choice: the helper rejects them rather than silently skipping
or following them. Never exclude authored violations to obtain completion.

Default mode is `fix`, with full catalog coverage. `--mode findings-only` permits
documented violations to remain after complete review. `--rules id1,id2` declares
a focused selection; it must reflect the user's requested scope, not a way to
discard outstanding work.

The declared scope is fingerprinted at initialization. A changed selection,
coverage mode, include list or exclusion requires a new run and an explicit scope
decision; editing those fields cannot turn an unfinished global audit into a
completed focused one.

The generated state contains these maintained records:

| Record | Required meaning |
| --- | --- |
| `skill` | Catalog version, membership and per-rule contract fingerprints |
| `scope` | Project root, included paths and exclusions with reasons |
| `files` | Current or removed files, content hashes, review state and evidence |
| `rules` | One entry per selected rule; eligible unit, discovery and review states, method, evidence and occurrences |
| `findings` | Stable issue IDs, severity, problem/evidence, occurrence/diagnostic links and resolution |
| `exceptions` | Every inline, configuration or scope exception and its reviewed decision |
| `exceptionInventory` | Evidence that suppressions and configuration bypasses were inventoried completely |
| `eslint` | Effective-configuration evidence, actual warning ceiling and immutable diagnostic snapshots |
| `checks` | Required checks discovered in the application, results and source fingerprints |

For a rule, fill `unit`, `method` (`manual`, `automatic` or `mixed`), `evidence`,
`discovery` (`pending` or `complete`) and `review` (`pending`, `reviewed` or
`not_applicable`). `automatic` and `mixed` require `automaticChecks` entries with
`ruleId`, `severity`, `rejectedEvidence`, `acceptedEvidence`,
`configurationEvidence` and `limitsEvidence`. These identify actual diagnostic
and neighboring valid-case checks, not just the detector's name.

Each `patterns` entry has this shape; the values below illustrate a confirmed
finding, not a pre-approved assessment:

```json
{
  "id": "orders.list:OrdersWorkspace:component-role",
  "location": {
    "file": "src/domains/sales/orders/features/list/components/OrdersWorkspace.feature.tsx",
    "symbol": "OrdersWorkspace",
    "line": 12
  },
  "result": "error",
  "evidence": "The component owns query orchestration and a reusable display-only result subtree; inspected its callers and the complete function.",
  "findingIds": ["orders.list:split-results-view"],
  "exceptionIds": []
}
```

A finding has `id`, `severity` (`error` or `warning`), `status` (`open`, `fixed` or
`accepted`), `message`, `evidence`, `patternIds` and `diagnosticIds`. Fixed findings
also need `verification`; accepted findings need `exceptionId`. Keep
finding/occurrence links reciprocal. Several diagnostics can describe one defect;
link them to one finding rather than multiplying unique-defect totals. An
occurrence can have several findings; its Error count is still one.

An exception has `id`, `kind` (`inline`, `configuration` or `scope`), `location`
with `file` and semantic `symbol`, `status` (`pending`, `retained`, `removed` or
`invalid`), `reason`, `evidence`, `reviewedAt` (`YYYY-MM-DD`), `ruleIds` and
`diagnosticIds`. For every named rule on a retained inline/configuration exception,
add a `probes` entry with `ruleId`, `applicable: true` and `diagnosticEvidence`.
This records the isolated unmasked diagnostic and applicability check required by
the exception policy. A scope exclusion instead needs evidence of why the path is
outside the relevant authored scope. `invalid` records a reviewed unjustified
exception; correct it in fix mode. `removed` needs evidence of obsolescence or the
correction. Dates and nonempty fields alone never establish a justified decision.

Set each file's `review` to `reviewed` only after inspection and add concrete
`evidence` describing the applicable responsibilities checked. Removed files remain
in the state with `present: false`, so deleting a file does not silently erase its
findings or coverage obligations.

## ESLint snapshots and counts

Capture machine-readable results with the application's real command and
configuration before corrections, then capture fresh results afterward. Include
errors, warnings and `suppressedMessages`; do not use `--quiet` to hide warnings.
Save effective configurations for representative file groups, including authored
code with overrides. Import immediately after the run, before source changes:

```bash
node "$skill_dir/scripts/audit-report.mjs" eslint \
  --audit "$audit_dir/run.json" --report "$audit_dir/lint-before.json" \
  --label before --command 'the actual application lint command' \
  --exit-code 1 --config "$audit_dir/effective-config.json" \
  --tooling "$project_dir/package-lock.json"
```

Repeat `--config` for distinct effective configurations. The saved files must be
JSON configurations with `rules`, produced from the consuming application's
actual configuration. Record their applicability and the rejected/accepted
integration checks in `eslint.configurationEvidence`. Record the actual process
exit code; it is not inferred from an error count. The helper fingerprints the
configurations and current in-scope source. It does not execute ESLint or prove
that an imported report was generated from those inputs: retain the command/run
evidence and import before editing. Snapshot IDs must be unique.

Repeat `--tooling` for the actual dependency lock/version evidence and local
detector/configuration implementation files relevant to the run. Use existing
files appropriate to the application; the example lock filename is not universal.
Changes to those inputs invalidate an ESLint comparability claim even when the
same rule IDs and severities remain configured. With no toolchain fingerprint,
the helper reports ESLint comparability as not established rather than assuming it.
The reviewer must verify that the declared analysis inputs cover the real toolchain.

ESLint reports diagnostics, not the number of eligible AST nodes accepted by each
rule. Therefore:

- Show per-rule errors, warnings, suppressed diagnostics and files with diagnostics.
- Show files present in the ESLint results separately from files with diagnostics.
  A returned ignored-file message is not proof that a rule evaluated that file;
  verify applicability through the effective configuration and integration cases.
- Display OK occurrence counts as **not measured**, unless the actual detector
  has separately validated eligible-node telemetry. Never infer them from quiet
  files, file totals or a subtraction from all AST nodes.
- Never label a suppressed diagnostic OK. It remains in the exception inventory.
- Keep baseline and final snapshots separate. A cleared final run does not remove
  earlier errors from the exhaustive diagnostic list.

Every current scoped JS/TS source must appear in the latest results or have a
reviewed `configuration` exception whose `affectedFiles` lists the omission.
Document the actual rule applicability rather than inferring coverage from an
empty file result.

Every in-scope diagnostic in every snapshot must link to a finding or exception.
The helper creates snapshot-local diagnostic IDs; stable semantic finding IDs
provide continuity across runs and line moves. A current diagnostic cannot be
marked fixed or linked solely to a removed exception. A missing future diagnostic
is only "no longer reported" until correction and comparable checking are proved.

Set `eslint.warningBudget` to the real configured global ceiling and reconcile it
with the final global warning total. In a focused audit, project-wide diagnostics
remain visible, while manual coverage and finding obligations concern the declared
scope; do not claim that outside-scope exceptions were re-reviewed.

## Progress, completion and comparison

After a batch of source corrections, refresh the inventory:

```bash
node "$skill_dir/scripts/audit-report.mjs" refresh --audit "$audit_dir/run.json"
```

This preserves findings and snapshots, tracks added/removed/changed files, and
invalidates review claims that need re-examination. Changed-file OK/exempt results
return to pending; known errors in existing files remain errors. Occurrences in
deleted files become pending removal decisions, preserving their open findings.
Rule discovery and exception
review must be reconciled again, including callers affected by the changes.
Catalog membership changes require a new run rather than silently deleting rows.

The command prints the current source fingerprint. Every passed `checks` entry
needs `id`, `status: passed`, `evidence` and that `sourceFingerprint`. Use
`not_applicable` only with evidence of an absent check/capability, not for a failed
check. Record a failed command as `failed`, with its actual output evidence and
source fingerprint. Findings-only work may complete review with such recorded
failures; fix mode requires their resolution. Discover all required checks rather
than recording one easy passing command.
Enter the current review evidence and import the final ESLint snapshot.

```bash
node "$skill_dir/scripts/audit-report.mjs" check --audit "$audit_dir/run.json"
node "$skill_dir/scripts/audit-report.mjs" check --audit "$audit_dir/run.json" --complete
node "$skill_dir/scripts/audit-report.mjs" render \
  --audit "$audit_dir/run.json" --previous "$audit_dir/previous.json" \
  --out "$audit_dir/run.md"
```

Omit `--previous` for the first run. Basic `check` verifies structural consistency;
`--complete` also fails on outstanding coverage, stale checks or unresolved fix
obligations. Full audits need every catalog rule, complete occurrence discovery,
reviewed files, reviewed exclusions/exceptions and fresh verification. Fix mode
also needs no open findings, error occurrences, unjustified exceptions or current
ESLint errors. Findings-only mode may have errors but must have complete review and
an exhaustive recorded findings list. Rendered drafts are visibly **incomplete**.

For the next audit, initialize a new state and retain the previous JSON. Preserve
semantic IDs. Compare rule units/contracts and requested scope before interpreting
counts; compare effective configurations before interpreting ESLint changes.
New/deleted files and occurrences are normal but must be explained. A renamed or
absent occurrence is not automatically a fix. Changes to units, scope or contracts
make the relevant rows non-comparable. Unfinished discovery also prevents a claim
of comparable occurrence coverage. Do not mechanically replace a removed error
with a different error at the same global total and call the audit unchanged.

## Synthetic user-facing result

The retained Markdown contains one row for every catalog rule, with focused
out-of-scope rows identified explicitly:

| Rule | Unit | Found | OK | Error | Exempt | Pending | Removed | Review / discovery |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| arch-component-roles | component module | 8 | 6 | 1 | 0 | 1 | 0 | pending / complete |
| api-void-mutation | body-less mutation | 0 | 0 | 0 | 0 | 0 | 0 | not_applicable / complete |

These are fictional formatting examples, not measurements of any application.
The report also includes per-ESLint-rule tables, all findings with resolution
states, the exhaustive diagnostic list including warnings/suppressions, exception
decisions, prior-run volume/identity changes and outstanding work. Long lists
belong in the linked artifacts; never truncate or sample the retained lists.

Keep the final chat response short: actual completion/scope, reviewed file/rule
counts, remaining errors/pending items, checks, material volume changes and links
to the full tables and JSON. Do not claim completion when `--complete` fails.
No report script can prove honest enumeration, substantive inspection or correct
business judgments; the evidence and the three audit passes remain essential.
