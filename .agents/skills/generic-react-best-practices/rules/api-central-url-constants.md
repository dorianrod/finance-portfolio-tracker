---
title: Declare Every Endpoint in One Registry, Never Inline URLs
impact: HIGH
impactDescription: one place to change an endpoint
tags: api, urls, endpoints, axios
---

## Declare Every Endpoint in One Registry, Never Inline URLs

**Impact: HIGH (one place to change an endpoint)**

Declare every endpoint once in a single registry (static strings or `(id: string) => string` builders), grouped by resource. API hooks import it and never build URL strings inline, so a backend route change is a one-line edit and endpoints are greppable.

**Incorrect (inline template string):**

```tsx
export function useUpdateInvoiceComment(invoiceId: string) {
  return useMutation({
    mutationFn: async ({ commentId, message }: UpdateInvoiceCommentInput) => {
      await http.put(`/invoices/${invoiceId}/comments/${commentId}`, { message })
    },
  })
}
```

**Correct (builder from the endpoint registry):**

```tsx
// src/shared/endpoints.ts
export const ENDPOINTS = {
  invoices: {
    list: '/invoices',
    updateComment: (invoiceId: string, commentId: string) =>
      `/invoices/${invoiceId}/comments/${commentId}`,
  },
} as const

// src/domains/sales/invoices/features/comments/apis/mutations/useUpdateInvoiceComment.ts
export function useUpdateInvoiceComment(invoiceId: string) {
  return useMutation({
    mutationFn: async ({ commentId, message }: UpdateInvoiceCommentInput) => {
      await http.put(ENDPOINTS.invoices.updateComment(invoiceId, commentId), { message })
    },
  })
}
```

When a new endpoint is needed, add it to the matching resource group of the registry before writing the hook. Path parameters go through the builder, query parameters through axios `params`.
