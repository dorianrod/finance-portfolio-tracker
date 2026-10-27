---
title: Use TData = void for Body-less or Response-less Mutations
impact: MEDIUM
impactDescription: avoids fake schemas and parse failures on empty bodies
tags: api, mutations, yup, void
---

## Use TData = void for Body-less or Response-less Mutations

**Impact: MEDIUM (avoids fake schemas and parse failures on empty bodies)**

When an endpoint returns nothing useful (204, empty body), type the mutation with `TData = void` and do not parse the response; the refreshed state comes from invalidating queries. When it takes no body, send none. Do not invent a placeholder schema: an empty body (`''`) fails `yup.object()` validation, and a fake schema validating nothing is noise.

**Incorrect (placeholder schemas for an action endpoint):**

```tsx
const EMPTY_REQUEST_SCHEMA = yup.object({})
const FAKE_RESPONSE_SCHEMA = yup.object({ id: yup.string().required() })

export function useCloseOrder(orderId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      await EMPTY_REQUEST_SCHEMA.validate({})
      const { data } = await http.put(ENDPOINTS.orders.close(orderId))
      return FAKE_RESPONSE_SCHEMA.validate(data) // throws on an empty 204 body
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  })
}
```

**Correct (explicit void contract):**

```tsx
export function useCloseOrder(orderId: string) {
  const queryClient = useQueryClient()
  return useMutation<void, Error, void>({
    mutationFn: async () => {
      await http.put(ENDPOINTS.orders.close(orderId))
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }), // prefix: list, count and detail
  })
}
```

When the endpoint takes a body but returns nothing, still validate the request with Yup and keep `TData = void` (see `api-use-transformation`).
