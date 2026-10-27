---
title: Keep an Explicit ESLint Warning Budget
impact: HIGH
tags: eslint, warnings, review
---

## Keep an Explicit ESLint Warning Budget

**Rule:** Keep the versioned ESLint warning ceiling aligned with reviewed warnings and justify every increase instead of leaving spare capacity.

A warning should require an explicit reviewable change to the budget. The global total includes native ESLint warnings and the tracking warnings for [reviewed suppressions](quality-eslint-disable-scoped.md); suppressed original diagnostics are not counted again.

### Applies When

- Setting up or changing the lint command used locally and in CI.
- Accepting, removing or reauditing an exception, or resolving another warning.

**Incorrect:**
Two accepted exceptions produce two warnings, but the command leaves spare capacity:

```sh
eslint . --max-warnings 5
```

**Correct:**
```sh
eslint . --max-warnings 2
```

### Maintaining the Budget

- Start at `--max-warnings 0`. Keep the ceiling in the versioned lint command, preserving its cache options and `--fix` support; CI must use the same command.
- Audit each exception before accepting it. Increase the ceiling by one per newly accepted directive, not per suppressed rule, diagnostic or review event. Include the rationale for each increase in the change or PR description and the technical evidence in the dated directive.
- A new review of an existing exception updates its date and justification as needed without increasing the ceiling. Removing an exception lowers the ceiling by one. Remove unused suppressions rather than budgeting for them.
- Other warnings also consume the global ceiling: investigate and fix them or record why the affected rule permits retaining them before changing the budget. Never absorb invalid review metadata errors into the warning budget.
- Lower the ceiling in the same change when the total decreases. Do not create headroom, automatically update the limit, hide output with `--quiet`, weaken severities or widen ignores to bypass the budget.

### Exceptions

- Focused lint runs and profiling may help diagnosis, but do not replace the full-project budget check.
- Re-running lint or reviewing an existing exception again does not earn an additional allowance.

### References

- [ESLint: max-warnings](https://eslint.org/docs/latest/use/command-line-interface#--max-warnings)

A global warning ceiling rejects excess totals but cannot detect replacing a removed warning with a different warning at the same count. Review new exceptions and lower an oversized ceiling explicitly; neither passing lint nor metadata validation certifies a technical rationale.
