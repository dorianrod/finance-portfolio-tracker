---
title: Review Component Complexity Before Splitting
summary: Review every flagged function manually and extract a component, hook or helper only when it establishes a cohesive responsibility boundary.
impact: HIGH
tags:
  - components
  - complexity
  - eslint
patterns:
  - A component combines several independent rendered regions or exceeds the function-size or branching threshold.
  - The request asks to detect oversized or complex components with ESLint.
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

### Incorrect

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

### Correct

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

### Enforcement

The dashboard enables these built-in ESLint rules at error level for production `src/**/*.{ts,tsx}`, including components, hooks and helpers:

- `complexity`: maximum **8**, variant **modified** (one decision for an entire `switch`). A score of 8 is allowed; 9 or higher requires manual review. It measures branches per function; callbacks have their own complexity.
- `max-lines-per-function`: maximum **150**, excluding blank lines and comment-only lines. It includes JSX and nested callback bodies in the containing function's span.

Both are necessary: low cyclomatic complexity does not imply a small component. Hook-count, JSX-condition, mapped-JSX and calculation checks remain complementary. An exceedance fails lint until a cohesive extraction or a justified line-scoped keep decision resolves it. The threshold does not determine that decision.

### Exceptions

- Tests (`*.test.*`, `*.spec.*`, `__tests__/`) and Storybook stories (`*.stories.*`) are excluded from these two thresholds; tooling outside `src/` is also outside their scope.
- The two thresholds are review signals. Keep a cohesive region together when extraction would only fragment it; if a lint suppression is necessary, scope it to the offending line and include the review's concrete reason.
- Do not compress formatting, replace JSX with local variables, or move all logic into an umbrella hook merely to pass a threshold. An extraction must establish a responsibility boundary.

### References

- [Dashboard audit and case-by-case decisions](../../../../packages/dashboard/COMPONENT_COMPLEXITY_AUDIT.md) — Recheck the rationale when a function changes; a previous keep decision is not a permanent exemption.
- [ESLint: complexity](https://eslint.org/docs/latest/rules/complexity)
- [ESLint: max-lines-per-function](https://eslint.org/docs/latest/rules/max-lines-per-function)
