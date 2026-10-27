---
title: Model Mutations as Input, Payload and Response
impact: HIGH
impactDescription: URL params never leak into the request body
tags: api, mutations, typescript, dto
---

## Model Mutations as Input, Payload and Response

**Impact: HIGH (URL params never leak into the request body)**

Type every mutation with three distinct types. `Input` is what the caller passes (domain vocabulary, may include the target id), `Payload` is exactly what the API body expects, `Response` is the parsed domain result (`void` if none). Route identifiers through the endpoint builder and build the body without them. With TanStack Query: `useMutation<Response, Error, Input>`.

**Incorrect (input sent as the body, id included):**

```tsx
export function useRequestInvoiceRejection() {
  return useMutation({
    mutationFn: async (input: { invoiceId: string; comment: string }) => {
      await http.put(ENDPOINTS.invoices.requestRejection(input.invoiceId), input) // body: { invoiceId, comment }
    },
  })
}
```

**Correct (Input → Payload → Response, id only in the URL):**

```tsx
export type RequestInvoiceRejectionInput = { invoiceId: string; comment: string }

const PAYLOAD_SCHEMA = yup.object({ comment: yup.string().trim().required() })
type RequestInvoiceRejectionPayload = yup.InferType<typeof PAYLOAD_SCHEMA> // private to the hook file

export function useRequestInvoiceRejection() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, RequestInvoiceRejectionInput>({
    mutationFn: async ({ invoiceId, ...body }) => {
      const payload: RequestInvoiceRejectionPayload = await PAYLOAD_SCHEMA.validate(body, {
        stripUnknown: true,
      })
      await http.put(ENDPOINTS.invoices.requestRejection(invoiceId), payload)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] }),
  })
}
```

Export the Input type (callers build it) and keep the Payload type private to the hook file. An empty response uses `void` (see `api-void-mutation`); the hook returns the `useMutation` result as-is (see `api-return-result-as-is`).
