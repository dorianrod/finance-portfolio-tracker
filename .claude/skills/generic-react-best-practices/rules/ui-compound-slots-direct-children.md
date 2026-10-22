---
title: Keep Compound Component Slots as Direct, Renderable Children
impact: HIGH
impactDescription: prevents silently dropped slots and empty overflow menus
tags: ui, compound, slots, fragment, suspense, conditional
---

## Keep Compound Component Slots as Direct, Renderable Children

**Impact: HIGH (prevents silently dropped slots and empty overflow menus)**

Compound components often discover their slots by scanning their **direct** children (`Children.toArray`, matching on `displayName` or `type`). Anything that is not a slot element at that level is silently ignored: a custom component wrapping a slot, a Fragment next to other slots, a `Suspense` boundary, or a slot that renders `null`. No error is raised; the slot just disappears or sits in the wrong place.

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
- Condition each slot individually (`{cond && <Card.Actions>…</Card.Actions>}` is fine, the element keeps its identity) or inside the slot; never group several slots in a Fragment. A Fragment is only unwrapped when it is the sole child.
- Gate optional actions in the caller with a boolean predicate: a wrapper that renders `null` still occupies a visible slot and can leave an overflow menu empty, and the container cannot know what its children will render.
- Put `Suspense` outside the compound component, or inside a content slot (`Card.Body`), never between the compound and its slots.
