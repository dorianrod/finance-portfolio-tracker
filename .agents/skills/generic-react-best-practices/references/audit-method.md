# Audit method

Use this method for a full audit. A focused review applies it only to the stated
scope and must not imply a full-catalog result.

## Account for each rule

Enumerate the Quick Reference once. Read each applicable rule, including its
exceptions and enforcement limits. For every rule, keep one of these results with
concrete evidence:

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

## Check prevention against incorrect code

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

## Verify runtime sequences

Static checks cover their stated patterns. Test stateful protocols through
observable interactions: cancel activation, open and close, reopen after outside
dismissal, change modes and use keyboard entry/exit with unavailable controls.
Choose sequences relevant to the actual primitive or workflow. Where practical,
confirm the regression fails against the original behavior before the correction.

## Finish with the evidence that exists

Run the required checks after corrections. Reconcile findings and applicability
per rule before claiming a full audit. A large test count or a clean lint run
does not fill an unexamined entry. Preserve stable guarantees in rule contracts,
configuration and tests so they remain effective when a task's notes or report
are deleted. A working checklist can be transient; do not require a repository
report or introduce application-specific filenames into this skill.
