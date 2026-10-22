---
title: Use Functional State Updates for Prior-State Calculations
summary: Use a functional state update when the next value depends on the previous value.
impact: MEDIUM
tags:
  - react
  - state
patterns:
  - A state setter reads the same state variable solely to calculate its next value.
status: example-only
---

# Non-active Example

This file demonstrates the expected shape of a simple rule. Its leading underscore and `example-only` status mean it is not part of the active catalog.

## Use Functional State Updates for Prior-State Calculations

**Rule:** Use a functional state update when the next value depends on the previous value.

This form derives the update from the value React provides at execution time.

### Applies When

- A state setter computes its new value from that same state value.

### Incorrect

```tsx
const [count, setCount] = useState(0)

function increment() {
  setCount(count + 1)
}
```

### Correct

```tsx
const [count, setCount] = useState(0)

function increment() {
  setCount(currentCount => currentCount + 1)
}
```

### Exceptions

- A direct replacement value that does not depend on previous state does not need a functional update.
