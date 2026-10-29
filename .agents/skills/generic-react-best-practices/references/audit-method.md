# Audit method

Every audit is driven by catalog rules and their impact. ESLint and complementary
scripts supply evidence for those rules; they do not define a separate audit
agenda. Every audit includes lint investigation, semantic review and a final
review of deterministic prevention. Technical revalidation of existing ignores
is opt-in.
A focused review applies these activities only to the stated scope and must not
imply a full-catalog result. Correct confirmed violations by default; an explicit
findings-only request limits the work to analysis and proposed corrections,
including proposed enforcement changes.

## Establish scope and keep a checkpoint

Before inspecting findings, inventory the authored files and catalog rules in
the requested scope. Include source, tests and relevant tooling/configuration.
Identify existing exclusions and their effect on coverage without revalidating
their technical justification unless requested. Explain any new audit-scope
exclusions; never introduce one to hide a violation. Do not replace a global
request with a sample or a few failing files.

For each selected rule, enumerate the eligible patterns rather than searching
only for known errors. Inspect all candidate files and actual callers needed to
decide ownership or behavior. Quiet lint output does not establish coverage.
Keep existing ignored patterns separate from code whose compliance was reviewed;
leaving an existing exception in place is not renewed technical approval.

Process the inventory in manageable batches and keep enough working notes to
distinguish completed review, findings and pending work. Continue with the next
batch until the requested scope is covered. Re-review affected code and callers
after corrections and rerun affected checks; this does not enable technical
revalidation of existing ignores. If interrupted, keep a usable checkpoint and
identify the remaining work. No particular file format, schema, count table or
generated report is required.

## Select rules, order the review and bind tools

Select rules through focused routing or the full Quick Reference, then read their
contracts, examples, exceptions and actual impact. Process CRITICAL rules first,
then HIGH, MEDIUM-HIGH, MEDIUM, LOW-MEDIUM and LOW. Use category priority to break
ties. Category impact is a ceiling, not the impact of every rule it contains.
Review rules without detectors at the same priority as equally impactful rules
with detectors. Respect correction dependencies needed to resolve a higher-impact
finding; a lint error is not automatically more urgent than a confirmed critical
semantic violation found through inventory review.

Resolve associated checks through the application's documented
[rule-to-tool bindings](project-enforcement.md). Use the script capabilities
described by each owning rule when available and useful to the requested scope.
Read their configured scope and limits before interpreting results. Do not run
every script simply because it exists. Baseline lint and shared script output
may be collected together, but assign each result to an owning rule before
review and correction. Inspect relevant in-scope results from a project-wide
command without silently expanding a focused audit to unrelated code.

Distinguish bounded deterministic failures from semantic review candidates.
An architecture inventory's unresolved dependency or large JSX count requires
inspection; it does not prescribe an extraction. An acyclic import graph does
not prove lawful ownership, and a catalog usage check does not prove all visible
copy is translated. Apply the rule's examples and exceptions to decide.
The ESLint and beyond-ESLint sections below describe complementary activities
for each prioritized rule, rather than separate correction phases.

## Calibrate detection before the first correction batch

Build a candidate inventory by recurring failure family before opening correction batches: component roles/composition, mixed local presentation, helper/service effects, indirect presentation dependencies, formatter exports and contracts, and entity types outside canonical files. Include valid-looking candidates; searching only for known bad names reproduces the previous audit's blind spots. Read related callers together to establish each family's scope.

For deterministic families, first prove one representative incorrect case and one neighboring valid case through the actual project configuration. Include aliases, reexports/dynamic imports, indirection or wrappers when they caused the omission. A clean command without this negative proof is unverified coverage. Strengthen a sound detector early so that it enumerates comparable violations across the whole scope before correction begins.

Keep semantic candidates distinct from proven errors. Record the observed responsibility and the unresolved question, rather than inferring the role from a suffix, hook count or JSX size. Use the architecture inventory associated with the selected component-role or entity-placement rules when supplied by the application; review signals do not need to become warning-budget entries.

Fix complete families with their callers, then run focused checks. Run full-project checks at meaningful milestones and after the final change; repeating the full suite after every small move does not increase semantic coverage. Update the inventory when a new failure mechanism appears and search its comparable cases before starting another batch. Keep execution logs compact and outside authored source; retain the durable prevention in rule contracts and regression tests rather than committing repeated full logs.

## 1. Investigate ESLint diagnostics and correct violations

Identify the consuming application's lint command, effective configuration,
authored file scope and warning budget. Run the configured checks and inspect
both errors and warnings. Keep the initial findings available for comparison;
do not treat a passing exit code or an accepted warning total as compliance.
This collects detection evidence; process it alongside script findings and manual
review in catalog impact order, rather than finishing every lint fix first.

For each diagnostic, inspect the affected code and the owning rule's contract,
including exceptions. Correct confirmed violations and review autofixes. If the
detector reports valid code, prefer correcting it with a regression case; when
that is not feasible, assess any new or modified exception through section 3.
Verify changed code through the application's actual configuration and relevant
checks. Do not lower severity, add ignores or raise the warning ceiling merely
to obtain a pass.

Compare lint results before and after corrections using the real command and
configuration. Keep the command, exit status and relevant evidence available;
do not hide warnings or omit material failures from the final summary. Existing
suppression-tracking warnings remain part of the warning budget without requiring
their underlying justification to be re-examined. Normal metadata and unused-disable
checks remain enabled; their actual errors still need correction in fix mode.

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
- **Existing ignore not revalidated:** identify the affected pattern without a
  new technical conclusion when its revalidation was not requested. This is
  neither reviewed compliance nor unfinished work under the default policy;
  continue reviewing the rule's other applicable patterns.
- **Unresolved:** record a known violation, unexamined scope or unproven claim.
  Resolve it within the authorized task or state it explicitly when work stops.

A rule may have both automated and manual parts. An ESLint rule or script sharing
a category or a similar name does not establish that it checks the catalog
requirement.
TypeScript checks declared types; it does not establish business meanings such as
dates, amounts, ownership or complete fixture data hidden behind assertions.

Inspect actual implementations and relevant callers for requirements without
complete automatic coverage, even when lint reports nothing. Correct confirmed
violations under the same rule contracts as lint findings. A missing or partial
detector is a reason for manual review, not a reason to skip a rule.

### Verify existing prevention against incorrect code

Use the consuming application's actual configuration for integration checks.
Assert the intended rule ID, diagnostic and severity; an unrelated lint error
must not count as detection. Include import aliases, a representative wrapper or
indirection, and a nearby valid case where those affect recognition. Respect
shadowing and distinguish library APIs from similarly named application data.

Identify deterministic conventions whose detector is missing or incomplete for
the final prevention review in section 4. Keep existing enforcement enabled,
preserve the warning-budget policy, and fix confirmed violations revealed by
checks within the requested scope. Do not add a suppression or configuration
exclusion merely to make a check pass.

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

## 3. Review exceptions when required

Read [the exception policy](../rules/quality-eslint-disable-scoped.md) and
[the warning-budget policy](../rules/quality-eslint-warning-budget.md).
Do not technically revalidate existing inline suppressions, configuration ignores,
rule deactivations, severity reductions or baselines by default. A request to
audit or fix everything, a catalog update or changes to nearby code do not count
as an explicit request to review existing ignores. Keep their rationale and review
dates unchanged; a retained existing ignore must not be described as newly approved.

Perform the review below for exceptions introduced or modified by the task, and
for existing exceptions only when the user explicitly requests their revalidation.
For the latter, inventory the requested suppressions and configuration bypasses,
including tests and tooling. Generated or vendored exclusions are not automatically
defects; establish which authored code and catalog requirements each exclusion affects.

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

## 4. Review opportunities for generic deterministic prevention

After reviewing and correcting the requested scope, examine the findings and the
requirements that needed manual judgment. Ask which observable violations could
be prevented reliably by types, compiler options, existing ESLint rules or a small
extension to an existing detector. Perform this review even when the audit found
no violations; an empty findings list does not prove complete static coverage.
Do not manufacture a new rule merely to report an addition.

Prefer a type/API constraint or an existing configured check when it already
expresses the invariant. Use a custom ESLint rule only for a reusable observable
contract with bounded analysis. Extend the owning catalog rule when it already
covers the decision, and keep its applicability, exceptions and detector limits
together. Business meanings that require human judgment remain manual checks.

A proposed check must work in other applications adopting the same documented
stack and conventions. Its logic must not depend on this application's business
entities, identifiers, field names, absolute paths, fixture values or one-off
allowlists. Documented generic conventions, resolved library APIs and configurable
project roots are valid inputs. Verify portability with unrelated example names;
renaming a project-specific heuristic does not make it generic.

In audit-and-fix work, add or strengthen checks when the generic contract is sound
and implementation is feasible within scope. Verify rejected and neighboring valid
cases through the actual consuming configuration, including relevant aliases,
wrappers and shadowing. For TypeScript constraints, confirm an invalid usage fails
with the intended type error and a valid usage compiles. Run affected regression
checks and correct violations exposed by the new enforcement. Do not weaken
existing checks, widen ignores or raise the warning budget to obtain a pass.

If an opportunity needs uncertain semantics, disproportionate analysis or work
outside the authorized scope, leave it as a proposal with the reason; do not claim
it was implemented. In findings-only mode, keep all such changes as proposals.
After an enforcement change, recheck its affected scope before closing the audit.

## Finish with the evidence that exists

Run the required checks after corrections, including the full-project warning
budget check and affected rule-associated scripts. Reconcile the inventory,
findings and pending work, including exception reviews explicitly requested or
required for new/modified exceptions.
Complete the prevention review in section 4. Existing ignores whose revalidation
was not requested do not block completion and are not counted as newly reviewed.
For audit-and-fix work, remaining in-scope violations prevent completion. For
findings-only work, complete coverage may coexist with documented open findings;
make that distinction explicit.

Use a concise, free-form final response covering the actual outcome, relevant
checks and material remaining work. Include a high-level synthesis of the ESLint,
TypeScript or equivalent protections actually added or strengthened and the
rationale for each: what recurring problem it prevents and why it is reusable.
Distinguish any proposals from implemented checks. If none were added, briefly
say why. Avoid implementation detail, code/configuration dumps and exhaustive
rule tables unless requested. No generated report or JSON artifact is required.

Do not conclude merely because a batch is finished, lint passes, tests pass or
the task is large. Continue until the requested scope and corrections are complete.
An actual blocker or explicit user interruption may require an incomplete handoff:
save the checkpoint and name the pending entries, evidence needed and next batch.
Never mark them reviewed or narrow the inventory to claim completion.

Working notes do not prove substantive inspection or a sound conclusion. Review
the evidence. Preserve stable guarantees in the rule contracts, configured checks
and regression tests so they remain effective independently of audit notes.
