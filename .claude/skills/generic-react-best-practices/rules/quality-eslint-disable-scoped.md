---
title: Scope eslint-disable to the Offending Line with a Reason
impact: LOW-MEDIUM
impactDescription: keeps every lint exception visible, minimal and justified
tags: quality, eslint, lint, comments
---

## Scope eslint-disable to the Offending Line with a Reason

**Impact: LOW-MEDIUM (keeps every lint exception visible, minimal and justified)**

First look for a clean fix. If you still need an exception, put `// eslint-disable-next-line <rule> -- <why>` directly above the line that triggers the rule, not above the enclosing `useEffect`, function or JSX block. A misplaced directive suppresses nothing and is reported as an `Unused eslint-disable directive`. A file-wide `/* eslint-disable */` hides every future violation in the file.

**Incorrect (directive placed on the wrapper instead of the offending line):**

```tsx
// eslint-disable-next-line react-hooks/set-state-in-effect -- intentional reset of the radio selection when the modal closes
useEffect(() => {
  if (isOpen) return
  setStatus(null)
}, [isOpen])
```

**Correct (directive on the exact line, named rule, reason after `--`):**

```tsx
useEffect(() => {
  if (isOpen) return
  // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional reset of the radio selection when the modal closes
  setStatus(null)
}, [isOpen])
```

Never omit the rule name or the `--` reason. A file-wide `/* eslint-disable */` is acceptable only for tooling files (Storybook docs, dev mocks, scripts). Even there, name the rule and give a reason, as in `/* eslint-disable jest/no-mocks-import -- dev tooling reuses the mocked catalogue */`.
