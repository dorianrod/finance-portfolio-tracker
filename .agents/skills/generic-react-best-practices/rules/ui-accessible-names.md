---
title: Give Icon-Only Buttons and Custom Controls an Accessible Name
impact: MEDIUM
impactDescription: usable with assistive tech, queryable by role in tests
tags: ui, accessibility, aria-label, icon-button, testing
---

## Give Icon-Only Buttons and Custom Controls an Accessible Name

**Impact: MEDIUM (usable with assistive tech, queryable by role in tests)**

Every interactive element needs an accessible name. A button whose only child is an icon has none, and a tooltip rendered through `data-tooltip-*` attributes (or CSS-only) is not an accessible name: screen readers and `getByRole(…, { name })` ignore it. Pass a translated semantic `label` to the shared UI primitive, which implements the accessible name internally according to `ui-centralize-accessibility`. Build controls from real buttons, links and inputs (or design-system components that render them) rather than clickable `div`s. When a shared component lacks a name or hardcodes English, fix it there; never work around it with a `data-testid` in a test.

**Incorrect (icon-only button has no accessible name):**

```tsx
<Button
  variant="ghost"
  onClick={() => requestDelete(contact.id)}
>
  <TrashIcon />
</Button>
```

**Correct (a translated semantic label becomes the accessible name):**

```tsx
<Button
  variant="ghost"
  label={t('common.delete')}
  onClick={() => requestDelete(contact.id)}
>
  <TrashIcon />
</Button>

// test
await user.click(screen.getByRole('button', { name: 'common.delete' }))
```

In a list, include the row identity when several rows share the same action (`t('contact.actions.deleteNamed', { name })`) so each button has a distinct name. Apply the same naming policy to icon-only links and custom inputs. Shared UI chooses native label associations or ARIA internally; domain code supplies the translated meaning.
