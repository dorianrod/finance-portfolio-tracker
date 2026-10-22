---
title: Never Nest a form Inside a form
impact: HIGH
impactDescription: prevents native submit that reloads the SPA and loses data
tags: ui, form, nested-form, modal, submit
---

## Never Nest a form Inside a form

**Impact: HIGH (prevents native submit that reloads the SPA and loses data)**

A page-level form that hosts an editable row or block with its own `<form>` produces `<form>` inside `<form>`: invalid HTML, a React validation warning, and the inner form submits natively — the browser navigates to `?field=value#` and every unsaved value is lost. The same happens when a modal's form is rendered inside another form (only the dialog content is portaled, not the form element around it). Fix the **outer** form: render it as a `div` when it hosts inner forms and submit it through a handler; the inner forms keep their `<form>` for Enter-to-submit.

**Incorrect (page form nests the editable-row forms):**

```tsx
<form onSubmit={handleSubmit}>
  <DocumentsBlock /> {/* each row in edit mode renders its own <form> */}
  <button type="submit">{t('common.save')}</button>
</form>
```

**Correct (outer container is a div, submit through the handler):**

```tsx
<div role="group" aria-label={t('order.create.title')}>
  <DocumentsBlock />
  <button type="button" onClick={() => void handleSubmit()}>
    {t('common.save')}
  </button>
</div>
```

With a form library, use its "render as div" option or `useForm().handleSubmit` from a button `onClick`. The trade-off is losing native Enter-to-submit on the outer form. Check in the browser console with `document.querySelectorAll('form form').length === 0`.
