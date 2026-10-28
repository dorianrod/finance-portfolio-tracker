# Audit method

Every audit includes the three passes below. A focused review applies them only
to the stated scope and must not imply a full-catalog result. Correct confirmed
violations by default; an explicit findings-only request limits the work to
analysis and proposed corrections.

## 1. Investigate ESLint diagnostics and correct violations

Identify the consuming application's lint command, effective configuration,
authored file scope and warning budget. Run the configured checks and inspect
both errors and warnings. Keep the initial findings available for comparison;
do not treat a passing exit code or an accepted warning total as compliance.

For each diagnostic, inspect the affected code and the owning rule's contract,
including exceptions. Correct confirmed violations and review autofixes. If the
detector reports valid code, prefer correcting it with a regression case; when
that is not feasible, assess any proposed exception through pass 3. Verify
changed code through the application's actual configuration and relevant checks. Do not lower
severity, add ignores or raise the warning ceiling merely to obtain a pass.

## 2. Review the catalog beyond ESLint

For a full audit, enumerate the Quick Reference once; for a focused review,
select the relevant rules through routing and the Quick Reference. Read each
applicable rule, including its exceptions and enforcement limits. For every
selected rule, keep one of these results with concrete evidence:

- **Automatically checked:** identify the configured rule and prove a relevant
  incorrect example is rejected at the expected severity and with the expected
  diagnostic. Also exercise a valid neighboring example. Review analysis limits
  and inspect any applicable code beyond those limits.
- **Manually reviewed:** identify the inspected code and the responsibility or
  behavior checked. A category name or a passing command is not review evidence.
- **Not applicable:** identify the absent capability or pattern. Do not infer
  applicability from library installation alone.
- **Unresolved:** record a known violation, unexamined scope or unproven claim.
  Resolve it within the authorized task or state it explicitly when work stops.

A rule may have both automated and manual parts. An ESLint rule sharing a category
or a similar name does not establish that it checks the catalog requirement.
TypeScript checks declared types; it does not establish business meanings such as
dates, amounts, ownership or complete fixture data hidden behind assertions.

Inspect actual implementations and relevant callers for requirements without
complete automatic coverage, even when lint reports nothing. Correct confirmed
violations under the same rule contracts as lint findings. A missing or partial
detector is a reason for manual review, not a reason to skip a rule.

### Check prevention against incorrect code

Use the consuming application's actual configuration for integration checks.
Assert the intended rule ID, diagnostic and severity; an unrelated lint error
must not count as detection. Include import aliases, a representative wrapper or
indirection, and a nearby valid case where those affect recognition. Respect
shadowing and distinguish library APIs from similarly named application data.

If a convention is deterministic and its detector is missing or incomplete,
extend the owning check or add a focused check with its contract in the owning
catalog rule. Keep existing enforcement enabled, preserve the warning-budget
policy, and fix the violations revealed by the check. Do not add a suppression or
configuration exclusion merely to make the new check pass.

For a discovered omission, examine its failure mode in comparable code. For
example, a callback's presence does not prove invocation, invocation does not
prove caller-first ordering, and ordering does not prove cancellation is honored.
Test the missing property directly rather than adding another presence check.

### Verify runtime sequences

Static checks cover their stated patterns. Test stateful protocols through
observable interactions: cancel activation, open and close, reopen after outside
dismissal, change modes and use keyboard entry/exit with unavailable controls.
Choose sequences relevant to the actual primitive or workflow. Where practical,
confirm the regression fails against the original behavior before the correction.

## 3. Verify ignored diagnostics and technical justifications

Read [the exception policy](../rules/quality-eslint-disable-scoped.md) and
[the warning-budget policy](../rules/quality-eslint-warning-budget.md).
Inventory inline suppressions in scope, including tests and tooling. Also inspect
configuration ignores, excluded authored paths, rule deactivations, severity
reductions and any baseline or allowlist that bypasses an applicable requirement.
Generated or vendored exclusions are not automatically defects; establish which
authored code and catalog requirements each exclusion affects.

For each suppressed rule or configuration exception, inspect the affected code
and relevant callers. Reproduce the underlying diagnostic by lifting only that
exception in an in-memory or isolated check while preserving the rest of the
application configuration. Before calling an exception unused, verify that the
rule is enabled, applies to the file and examines the relevant code. A clean run
against an ignored file is not evidence that the code complies.

Compare the result with the rule's contract and concrete implementation or
dependency evidence. Resolve each exception as follows:

- **Obsolete:** the applicable check no longer reports the issue; remove the
  unused suppression or obsolete configuration exception.
- **Unjustified:** the diagnostic identifies a real violation without an allowed
  exception; correct the code and remove the bypass.
- **Justified:** demonstrate a false positive, dependency constraint or exception
  permitted by the owning rule. Prefer correcting a faulty detector when feasible;
  retain only an allowed, narrowly scoped exception with the required technical
  rationale and actual review date.
- **Unresolved:** the diagnostic or rationale cannot be verified; report what
  evidence is missing without treating the exception as approved.

A date, a nonempty comment, previous acceptance or a passing lint run does not
prove the rationale. Never bulk-approve or bulk-date exceptions. Reconcile the
warning budget after removals and justified retentions using its owning policy.

## Finish with the evidence that exists

Run the required checks after corrections, including the full-project warning
budget check. Summarize the results of all three passes: ESLint findings and
corrections, catalog coverage and manual findings, and exceptions removed,
corrected, retained with evidence or left unresolved. In a focused review,
distinguish project-wide check results from the code actually reviewed.

Reconcile findings and applicability per rule before claiming a full audit.
A large test count or a clean lint run does not fill an unexamined entry.
Preserve stable guarantees in rule contracts,
configuration and tests so they remain effective when a task's notes or report
are deleted. A working checklist can be transient; do not require a repository
report or introduce application-specific filenames into this skill.
