# Project Enforcement

## Bind tools to catalog rules

The [catalog rules](../SKILL.md) own the required behavior, impact, exceptions,
incorrect/correct examples and analysis limits. Read them before selecting tools.
The consuming application's documentation owns the concrete command bindings;
inspect its frontend README, package scripts and effective lint configuration.

For each selected rule, resolve:

- The configured ESLint rule IDs and the part of the contract they detect.
- Any complementary script, its working directory and invocation, when it helps
  review that rule, and whether it reports candidates or rejects a bounded defect.
- The files and patterns the tool examines, its omissions, and what must still
  be inspected manually. Record unavailable automation as a manual review need.

Keep the reusable capability in the owning rule and application-specific script
names, paths, catalog locations and implementation status in the application.
A command may support several rules, and a rule may have several detectors or
none. Do not invent a check or infer coverage merely from a tool's name.

Run the relevant commands as evidence for the selected rules, following the
skill's impact ordering. Broad commands may collect evidence once for several
rules; their output order does not determine the review or correction queue.
An inventory candidate requires a semantic decision using the rule's examples
and exceptions. A failing deterministic check establishes only the property and
scope it actually examines. Missing tools, quiet output and successful exit codes
never waive the rest of a rule.

Lint runners, cache helpers, profilers and script regression tests support tool
operation. They are not additional catalog rules or standalone audit passes.
Use profiling to investigate lint cost; preserve the normal lint command and
warning-budget check as the validation gate.
