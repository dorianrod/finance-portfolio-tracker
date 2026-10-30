---
title: Keep JSDoc for Non-Obvious Intent Only
impact: LOW
impactDescription: less noise, and comments that stay true
tags: quality, jsdoc, comments, documentation
---

## Keep JSDoc for Non-Obvious Intent Only

**Impact: LOW (less noise, and comments that stay true)**

Add JSDoc only when it explains something the name and types cannot: a business reason, an invariant, a call constraint (Suspense, "call once per page"), or a deliberate tolerance in a schema. Do not paraphrase the function name or restate parameter types. Paraphrase JSDoc drifts out of date and hides the comments that matter. Do not require an `@example` on every hook.

**Incorrect (restates the signature):**

```ts
/**
 * Hook to get the contacts selection.
 * @returns the contacts selection
 */
export function useContactsSelection() {
  // ...
}
```

**Correct (explains the why and the usage constraint):**

```ts
/**
 * Selection of the contacts list. It is cleared whenever the search or a filter changes: a
 * selection must not outlive the rows it was made on, a bulk action would hit contacts no longer
 * on screen.
 *
 * Call it once per page (the clearing is an effect).
 */
export function useContactsSelection() {
  // ...
}
```

A well-named function with explicit types needs no JSDoc at all. Use inline `// WHY:` comments for local surprises, such as a nullable field kept on purpose or an `eslint-disable`.

### Architecture decision comments

When an audit settles a non-obvious ownership, boundary or composition choice,
record the decision next to the code that implements it. This includes retaining
an existing structure after comparing it with a credible alternative. Routine
mechanical corrections and self-explanatory code need no decision comment. In a
findings-only audit, propose the comment without editing the source.

Use an ordinary block comment immediately before the smallest declaration or
local block that owns the choice. For a module-wide decision, place it before
the owning public declaration. Keep one authoritative comment per decision;
architecture documents may summarize or link to it. Do not create an empty module
or a separate decision file just to hold the comment.

Use this format with every field present once, in this order:

```ts
/*
 * @architecture-decision keep-selection-label-local
 * @rules arch-component-complexity
 * @choice Keep the static selection label inside OrdersWorkspace.
 * @reason The label has one production consumer and no behavior independent of the workspace.
 * @alternative Extract OrderSelectionLabel; it would only forward the same label without isolating a responsibility.
 * @revisit The label gains independent interactions or another production consumer.
 */
```

- `@architecture-decision`: a stable lowercase kebab-case identifier, unique
  within the source module. Preserve it when moving or renaming the owning code.
- `@rules`: the comma-separated catalog rule identifiers used to assess the
  choice. The comment must satisfy every applicable rule, including those not
  listed here.
- `@choice`: the selected structure and the code it concerns.
- `@reason`: concrete responsibilities, consumers or behavioral constraints
  that establish why the choice complies. A previous audit's approval alone is
  insufficient.
- `@alternative`: a credible alternative considered under the same requirements
  and the reason for retaining the selected choice. Prefer another conforming
  solution; if none can be established, identify the alternative's concrete rule
  conflict instead of inventing one.
- `@revisit`: observable changes that would invalidate the rationale or require
  a new decision, such as a new consumer or independently evolving behavior.
  Avoid generic instructions such as "review later".

Keep the comment in English. Values must be nonempty and may continue on following
comment lines without repeating the tag. Use the marker to locate decisions,
for example with `rg -n '@architecture-decision'` in the requested source scope.

Update the comment in the same change when its owner, relevant consumers,
dependencies, rationale or revisit conditions change. Move it with the owning
code; remove it when the decision disappears. Keep the current decision rather
than appending an audit history or refreshing dates on every review. A changed
revisit condition requires reassessment before replacing the old condition.

During an audit, preserve a documented conforming choice while its assumptions
remain true. Reopen it only for a relevant implementation or rule-contract change,
a met revisit condition, or concrete evidence contradicting its compliance.
Identify that evidence before changing the structure and update or remove the
comment with the resulting correction. Another conforming arrangement by itself
does not invalidate the recorded choice.

The marker records a design rationale; it grants no rule exception, suppresses no
diagnostic and cannot establish compliance by its presence alone. Reconcile any
contradictory diagnostic with the owning rule and code. ESLint suppressions still
follow `quality-eslint-disable-scoped`. Existing checks do not validate this
comment format or its rationale; both remain part of the scoped semantic review.
