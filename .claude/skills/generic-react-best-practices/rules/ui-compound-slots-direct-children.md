---
title: Keep Compound Component Slots as Direct, Renderable Children
impact: HIGH
impactDescription: prevents silently dropped slots and empty overflow menus
tags: ui, compound, slots, fragment, suspense, conditional
---

## Keep Compound Component Slots as Direct, Renderable Children

**Impact: HIGH (prevents silently dropped slots and empty overflow menus)**

This rule applies to compound APIs that discover slots by scanning their **direct** children (`Children.toArray`, matching on `displayName` or `type`). A custom component wrapping a slot, a Fragment or a `Suspense` boundary hides the slot from that scan. The container may ignore the element or place it incorrectly without an error. A wrapper that later renders `null` can still occupy an action position. Verify the compound API's discovery contract; context-based APIs may support deeper composition.

```tsx
// Card scans its direct children: Card.Header, Card.Body, Card.Actions
const slots = Children.toArray(children).filter(isValidElement)
const header = slots.find(child => child.type === Card.Header)
```

**Incorrect (each pattern drops or misplaces a slot):**

```tsx
const ArchiveQuestion = ({ name }: { name: string }) => (
  <Card.Body>{t('project.archive.question', { name })}</Card.Body> // wrapper hides the slot
)

<Card>
  <Card.Header title={t('project.archive.title')} />
  <ArchiveQuestion name={project.name} />
  {!readOnly && (
    <>
      <Card.Body>{/* details */}</Card.Body> {/* Fragment next to other slots: ignored */}
      <Card.Actions>{/* … */}</Card.Actions>
    </>
  )}
  <Suspense fallback={null}>
    <Card.Actions>{/* Suspense is not a slot: ignored */}</Card.Actions>
  </Suspense>
</Card>
```

**Correct (slots are direct children; only their content is extracted):**

```tsx
const canRestore = canRestoreProject(project) // boolean business rule

<Card>
  <Card.Header title={t('project.archive.title')} />
  <Card.Body>
    <ArchiveQuestion name={project.name} /> {/* renders text, not Card.Body */}
    {!readOnly && <ProjectDetails project={project} />}
  </Card.Body>
  <Card.Actions maxVisible={2}>
    <ExportButton />
    {canRestore && <RestoreButton onClick={restore} />}
  </Card.Actions>
</Card>
```

- Extract the **content** of a slot into a component, never the slot itself.
- Condition each slot individually (`{cond && <Card.Actions>…</Card.Actions>}` is fine, the element keeps its identity) or inside the slot. `Children.toArray` does not unwrap Fragments, even when a Fragment is the sole child. Unwrapping requires explicit support in the compound implementation; do not assume it.
- Gate optional actions in the caller with a boolean predicate: a wrapper that renders `null` still occupies a visible slot and can leave an overflow menu empty, and the container cannot know what its children will render.
- Put `Suspense` outside the compound component, or inside a content slot (`Card.Body`), never between the compound and its slots.
