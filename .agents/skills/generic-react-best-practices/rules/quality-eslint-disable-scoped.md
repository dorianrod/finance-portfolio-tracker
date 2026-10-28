---
title: Review and Date ESLint Exceptions
impact: HIGH
tags: eslint, exceptions, review
---

## Review and Date ESLint Exceptions

**Rule:** Keep an ESLint suppression only after reviewing its technical justification, naming the affected rules and recording the actual last review date on a line-scoped directive.

A nonempty comment does not establish a valid exception. Accept only a demonstrated false positive, a dependency constraint or an exception permitted by the affected rule. Being inconvenient to fix, pre-existing or needed to pass lint is not a technical justification. This rule does not grant exceptions to rules that expressly prohibit suppression.

### Applies When

- Authored code contains `eslint-disable`, `eslint-disable-line` or `eslint-disable-next-line`, including tests and tooling.
- An initial audit or a targeted reaudit follows changes to the skill, lint rules, dependencies or relevant code.

**Incorrect:**
```typescript
for (const entry of entries) {
  // eslint-disable-next-line no-await-in-loop
  await writer.append(entry)
}
```

**Correct:**
```typescript
for (const entry of entries) {
  // eslint-disable-next-line no-await-in-loop -- reviewed: 2026-10-27; This writer requires each append to finish before the next write starts.
  await writer.append(entry)
}
```

Use `-- reviewed: YYYY-MM-DD; concrete technical reason`. The date is the actual last review date, not the date lint ran. Name each affected rule explicitly; use `eslint-disable-next-line` or `eslint-disable-line`, never a block/file or all-rules disable.

### Audit and Reaudit

1. Inventory the suppressions in scope. For a targeted reaudit, select exceptions affected by the changed rules, skills, dependencies or code; use their dates to identify when they were last examined.
2. Read each applicable rule, the affected code and relevant callers or dependency evidence. Lift the relevant suppression in an in-memory or isolated check using the application's actual configuration; verify the original rule ID and diagnostic for each named rule. Confirm the check applies to the file before concluding that a suppression is unused. Compare the claimed rationale with the implementation and rule contract; do not infer approval from an earlier comment or a syntactically valid date. If the diagnostic or rationale cannot be verified, leave the exception unresolved rather than updating its review date as if approved.
3. Remove unused suppressions. For a real violation without an allowed exception, correct the code and remove the suppression. For a justified exception, retain the narrow directive and record the concrete rationale and actual review date.
4. Run lint and maintain the [warning budget](quality-eslint-warning-budget.md). A retained directive contributes one tracking warning, even if it names several rules. A new review of the same exception updates its date without adding another warning.

Never bulk-date existing ignores or raise the budget before examining them. If an audit is explicitly deferred, leave the missing metadata as errors rather than approving the exceptions in advance. Do not replace a suppression with a configuration exclusion or a lower severity to bypass review.

### ESLint Enforcement

Configure ESLint with the custom rules `local/require-reviewed-eslint-suppression` at error level and `local/reviewed-eslint-suppression` at warning level for authored JS and TS, including tests and tooling. Reject invalid scope, unnamed rules, missing rationale and missing or invalid calendar dates. Emit one tracking warning per conforming directive containing its rules, rationale and last review date. These tracking warnings require the custom rule; ESLint does not emit them by default.

Enable `reportUnusedDisableDirectives: 'error'` and preserve policy diagnostics even under a blanket disable. Neither check should autofix metadata: validation cannot certify a technical rationale or perform a review.

### Exceptions

- Generated and vendored code outside the project's lint scope is not an audit target.
- Examples embedded in strings or ordinary explanatory comments are not suppression directives.
- A prior review does not expire automatically; re-examine it when a requested audit or a relevant change calls the justification into question.

### References

- [ESLint: configuration comments and descriptions](https://eslint.org/docs/latest/use/configure/rules#using-configuration-comments)
- [ESLint: unused disable directives](https://eslint.org/docs/latest/use/configure/configuration-files#report-unused-disable-directives)

Place the directive immediately above the offending line rather than an enclosing hook, function or JSX block. A misplaced directive suppresses nothing and should fail as unused. First look for a clean fix; do not approve a suppression merely because its metadata is complete.
