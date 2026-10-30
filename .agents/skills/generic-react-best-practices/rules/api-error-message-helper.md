---
title: Normalize API Errors Centrally and Translate Known Keys Before Display
impact: HIGH
impactDescription: shows the real backend message, never a raw i18n key
tags: api, errors, axios, i18n, network
---

## Normalize API Errors Centrally and Translate Known Keys Before Display

**Impact: HIGH (shows the real backend message, never a raw i18n key)**

Turn every failed request into one predictable shape in one place: an axios response interceptor (or a single helper) that returns either the backend message or one of a few known keys (`error.network`, `error.timeout`, `error.maintenance`) when no usable response came back. Components never read `error.response.data` themselves. Known keys must be translated before display; a backend message must be shown as is, never passed through `t()` (i18n would rewrite words it contains).

**Incorrect (a network failure shows the raw key):**

```tsx
} catch (error) {
  toast.error(getErrorMessage(error) ?? t('orders.messages.closeError')) // "error.network"
}
```

**Correct (one normalizer, known keys translated, backend text untouched):**

```tsx
// shared: one place that knows the error shapes
import { isAxiosError } from 'axios'
export const getErrorMessage = (error: unknown): string | undefined => {
  if (isAxiosError(error)) {
    if (!error.response) return error.code === 'ECONNABORTED' ? 'error.timeout' : 'error.network'
    if (error.response.status === 503) return 'error.maintenance'
    return error.response.data?.errors?.map((e: { message: string }) => e.message).join(', ')
  }
  return error instanceof Error ? error.message : undefined
}

export const useTranslatedErrorMessage = () => {
  const { t } = useTranslation()
  return useCallback(
    (error: unknown): string | undefined => {
      const message = getErrorMessage(error)
      if (message === 'error.network') return t('error.network')
      if (message === 'error.timeout') return t('error.timeout')
      if (message === 'error.maintenance') return t('error.maintenance')
      return message
    },
    [t],
  )
}

// in the action that owns the feedback
const translateError = useTranslatedErrorMessage()
} catch (error) {
  toast.error(translateError(error) ?? t('orders.messages.closeError'))
}
```

Error handling and user feedback live in the action that triggers the mutation, not inside the API hook. Keep a single normalizer for the whole app instead of per-domain variants.

Pure error classification may use dedicated named error exports such as Yup `ValidationError` or Axios `isAxiosError`, including aliases and reexports. These guards do not parse responses or perform requests. Keep schema construction, response coercion and HTTP client operations at the API boundary; do not suppress the helper dependency check for an entire validation or HTTP library. See `helpers-categories`.
