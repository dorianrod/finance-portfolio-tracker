---
title: Give Icon-Only Buttons and Custom Controls an Accessible Name
impact: MEDIUM
impactDescription: usable with assistive tech, queryable by role in tests
tags: ui, accessibility, aria-label, icon-button, testing
---

## Give Icon-Only Buttons and Custom Controls an Accessible Name

**Impact: MEDIUM (usable with assistive tech, queryable by role in tests)**

Every interactive element needs an accessible name. A button whose only child is an icon has none, and a tooltip rendered through `data-tooltip-*` attributes (or CSS-only) is not an accessible name: screen readers and `getByRole(…, { name })` ignore it. Pass a translated `aria-label`. Build controls from real buttons, links and inputs (or design-system components that render them) rather than clickable `div`s. When a shared component lacks a name or hardcodes English, fix it there; never work around it with a `data-testid` in a test.

**Incorrect (icon-only button named only by its tooltip):**

```tsx
<Button
  variant="ghost"
  tooltip={{ content: t('common.delete') }} // rendered as data-tooltip-content
  onClick={() => requestDelete(contact.id)}
>
  <TrashIcon />
</Button>
```

**Correct (translated accessible name, tooltip kept for sighted users):**

```tsx
<Button
  variant="ghost"
  aria-label={t('common.delete')}
  tooltip={{ content: t('common.delete') }}
  onClick={() => requestDelete(contact.id)}
>
  <TrashIcon />
</Button>

// test
await user.click(screen.getByRole('button', { name: 'common.delete' }))
```

In a list, include the row identity when several rows share the same action (`t('contact.actions.deleteNamed', { name })`) so each button has a distinct name. Same rule for icon-only links and for custom inputs (`aria-label`, or a `<label htmlFor>`).
