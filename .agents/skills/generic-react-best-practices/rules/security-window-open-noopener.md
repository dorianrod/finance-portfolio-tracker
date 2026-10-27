---
title: Open External Links with noopener and noreferrer
impact: HIGH
impactDescription: prevents reverse tabnabbing from external CRM, BI and storage URLs
tags: security, window-open, links, tabnabbing
---

## Open External Links with noopener and noreferrer

**Impact: HIGH (prevents reverse tabnabbing from external CRM, BI and storage URLs)**

A tab opened with `window.open(url, '_blank')` gets a `window.opener` handle back to the app, so the opened page can redirect the authenticated tab (reverse tabnabbing). It also receives the app URL as its referrer. For an absolute external URL, always pass `'noopener,noreferrer'`. In JSX, prefer a link component that always renders `rel="noopener noreferrer"`; for a raw `<a>`, set `rel` explicitly.

**Incorrect (opener and referrer leaked):**

```tsx
const openCrmOpportunity = (opportunityId: string) => {
  window.open(`${CRM_URL}/opportunities/${opportunityId}`, '_blank')
}
```

**Correct (isolated tab, or a link that sets rel):**

```tsx
const openCrmOpportunity = (opportunityId: string) => {
  window.open(`${CRM_URL}/opportunities/${opportunityId}`, '_blank', 'noopener,noreferrer')
}

<a href={`${CRM_URL}/opportunities/${crmId}`} target="_blank" rel="noopener noreferrer">
  {t('opportunity.action.openInCrm')}
</a>
```

This rule covers absolute external URLs only. A backend file path that needs the bearer token is never opened with `window.open` or a native link (see `security-authorized-file-access`). The authorized-open primitive may pre-open a blank same-origin tab because it must write the file URL into the returned `Window`, which `noopener` would turn into `null`. Do not copy this exception for external URLs.
