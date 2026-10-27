---
title: Prefer ref as a Prop in React 19
impact: MEDIUM
impactDescription: removes unnecessary forwardRef wrappers while preserving typed ref forwarding
tags: quality, react19, refs, typescript, vercel
---

## Prefer ref as a Prop in React 19

**Impact: MEDIUM (removes unnecessary forwardRef wrappers while preserving typed ref forwarding)**

In React 19+ function components, accept a typed `ref` prop and forward it to the owned element. Keep the ref optional unless the component's contract requires it. Accessibility and focus behavior remain inside shared UI according to `ui-centralize-accessibility`.

**Incorrect (an unnecessary wrapper in React 19-only code):**

```tsx
// shared/ui/TextField.view.tsx
import { forwardRef } from 'react'

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label }, ref) => <label>{label}<input ref={ref} /></label>,
)

type TextFieldProps = { label: string }
```

**Correct (the component forwards a typed ref prop):**

```tsx
// shared/ui/TextField.view.tsx
import type { Ref } from 'react'

export function TextField({ label, ref }: TextFieldProps) {
  return <label>{label}<input ref={ref} /></label>
}

type TextFieldProps = {
  label: string
  ref?: Ref<HTMLInputElement>
}
```

### Exceptions

- Apply this convention to React 19+ targets. Libraries and adapters that must support React 18 may retain `forwardRef` at that compatibility boundary.
- Preserve the element or imperative handle exposed by an existing component. Changing the wrapper must not change its public ref behavior.
- Third-party implementations are outside the migration scope. This rule concerns ref forwarding; state sharing continues to follow `arch-no-prop-drilling`.

### ESLint Enforcement

For React 19-only authored code, use ESLint's `no-restricted-imports` to restrict the named `forwardRef` import from `react`. Keep React 18 compatibility adapters outside that restriction. Review namespace/member calls and dependency requirements as well; a named-import restriction does not prove the absence of every wrapper.

### Sources

Adapted from the ref-forwarding part of Vercel's [React 19 guidance](https://github.com/vercel-labs/agent-skills/blob/main/skills/composition-patterns/rules/react19-no-forwardref.md). The [React documentation](https://react.dev/reference/react/forwardRef) describes passing `ref` as a prop in React 19.
