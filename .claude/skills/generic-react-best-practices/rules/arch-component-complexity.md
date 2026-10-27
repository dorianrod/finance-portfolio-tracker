---
title: Review Component Complexity Before Splitting
impact: HIGH
tags: components, complexity, eslint
---

## Review Component Complexity Before Splitting

**Rule:** Review every flagged function manually and extract a component, hook or helper only when it establishes a cohesive responsibility boundary.

Hook count, cyclomatic complexity and function size measure different things. A large JSX tree can have few branches and hooks while still mixing navigation, summaries, content selection and detail panels. Review those responsibilities separately.

### Applies When

- A component owns multiple regions that can be understood and changed independently.
- ESLint reports excessive function length or cyclomatic complexity, including in a hook or callback used by a component.

### Manual LLM Review

For each function reported by either threshold, the LLM must read the whole function and its relevant callers, identify its responsibilities and decide whether extraction is worthwhile. Record a concrete reason for the decision:

- **Split:** name the responsibility to extract and explain how the new boundary improves understanding or isolates change. Extract a rendered region into a component, cohesive state and actions into an intent-named hook, or pure predicates and derivations into categorized helpers.
- **Keep:** explain why the function represents one cohesive responsibility and why splitting would add indirection or prop plumbing without improving clarity. A threshold exceedance alone does not mandate refactoring or suppression.

Do not apply an automatic fix or bulk extraction solely to lower the metric. Preserve behavior and keep compound UI slots as direct children where required by the UI API.

**Incorrect:**
```tsx
function OrdersWorkspace() {
  const { orders, selection } = useOrdersWorkspace();
  return (
    <Stack>
      <Surface>
        <Text as="h2">{selection.label}</Text>
        <Text>{selection.description}</Text>
      </Surface>
      <OrdersTable orders={orders} />
    </Stack>
  );
}
```

**Correct:**
```tsx
function OrdersWorkspace() {
  const { orders, selection } = useOrdersWorkspace();
  return (
    <Stack>
      <OrderSelectionSummary selection={selection} />
      <OrdersTable orders={orders} />
    </Stack>
  );
}
```

The examples abbreviate an independently owned summary region. Small cohesive JSX does not require extraction merely because it uses several elements.

### Exceptions

- Tests (`*.test.*`, `*.spec.*`, `__tests__/`) and Storybook stories (`*.stories.*`) are excluded from these two thresholds; tooling outside `src/` is also outside their scope.
- The two thresholds are review signals. Keep a cohesive region together when extraction would only fragment it; if a lint suppression is necessary, scope it to the offending line and include the review's concrete reason.
- Do not compress formatting, replace JSX with local variables, or move all logic into an umbrella hook merely to pass a threshold. An extraction must establish a responsibility boundary.

### References

- [ESLint: complexity](https://eslint.org/docs/latest/rules/complexity)
- [ESLint: max-lines-per-function](https://eslint.org/docs/latest/rules/max-lines-per-function)

### Review Thresholds

Review complexity above **8** (modified cyclomatic complexity, counting an entire `switch` once) or function size above **150** lines, excluding blank and comment-only lines. Include JSX and nested callback bodies when measuring a function's span. A score of 8 and a size of 150 are allowed. These are review signals rather than instructions to split automatically. Tests, stories and tooling are outside these production thresholds.

Use both measures: few branches do not imply a small component. Hook count, mapped JSX and compound calculations remain separate signals. Resolve a reported exceedance through a cohesive extraction or a justified, line-scoped keep decision; do not compress formatting, hide JSX in variables or move everything into an umbrella hook merely to lower a metric.
