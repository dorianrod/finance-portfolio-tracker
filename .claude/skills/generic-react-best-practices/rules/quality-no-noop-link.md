---
title: No Clickable No-Op Links or Actions
impact: MEDIUM
impactDescription: users never click something that silently does nothing
tags: quality, links, actions, ux, tooltip
---

## No Clickable No-Op Links or Actions

**Impact: MEDIUM (users never click something that silently does nothing)**

Never render a clickable element with an empty handler (`onClick={() => {}}`) or `href="#"` as a placeholder for a URL or an action that is not available yet. The user sees a working link that does nothing. While the target is unavailable, either hide the element (and show a "no value" placeholder if the slot must stay visible), or render it `disabled` with a tooltip that says why.

**Incorrect (looks actionable, does nothing when the CRM id is missing):**

```tsx
<Button onClick={crmId ? openCrmCatalog : () => {}}>
  {t('project.action.manageGroupAccess')}
</Button>
```

**Correct (hide until available, or disable with an explanation):**

```tsx
{crmId && <Button onClick={openCrmCatalog}>{t('project.action.manageGroupAccess')}</Button>}

// When the action must stay visible:
<Button disabled title={t('project.action.manageGroupAccessUnavailable')}>
  {t('project.action.manageGroupAccess')}
</Button>
```

For a display slot, render the placeholder instead of an empty link when there is no URL.

The tooltip must explain the reason with a dedicated translation key (the one above is illustrative): add it to the catalog before using it, and do not reuse a generic key whose wording does not match the situation.

Empty handlers are fine in Storybook stories and documentation examples. They are not fine in a rendered page.
