---
title: Test API Hooks with renderHook and a Per-Test Query Wrapper
impact: MEDIUM
impactDescription: avoids cache leaks between tests and hanging Suspense or retries
tags: test, renderhook, react-query, suspense, wrapper
---

## Test API Hooks with renderHook and a Per-Test Query Wrapper

**Impact: MEDIUM (avoids cache leaks between tests and hanging Suspense or retries)**

Test hooks with `renderHook` from `@testing-library/react` (not the deprecated `@testing-library/react-hooks`). Query hooks need a wrapper with a `QueryClientProvider` holding a **new** `QueryClient` for every test, with `retry: false`, and a `<Suspense>` boundary when the hook uses `useSuspenseQuery`. A module-level client shares its cache between tests, and the default retry policy makes error tests time out. Stub only the network (see `test-mock-network-not-internals`) and let the real hook and Yup schema run.

**Incorrect (module-level client, retries on, no Suspense):**

```tsx
const queryClient = new QueryClient()

it('should load the order', async () => {
  const { result } = renderHook(() => useGetOrderDetailQuery('order-1'), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
})
```

**Correct (fresh client per render, real hook and Yup schema, network stubbed):**

```tsx
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={null}>{children}</Suspense>
    </QueryClientProvider>
  )
}

it('should default missing lines to []', async () => {
  server.use(http.get('*/orders/order-1', () => HttpResponse.json({ id: 'order-1', lines: null })))

  const { result } = renderHook(() => useGetOrderDetailQuery('order-1'), {
    wrapper: createWrapper(),
  })

  await waitFor(() => expect(result.current.data).toBeDefined())
  expect(result.current.data.lines).toEqual([])
})
```

- Keep `createWrapper` in a shared test utility once several files need it.
- For mutations, stub the matching `post`/`patch`/`delete` handler and assert on the result and the invalidated queries. For Jotai-only hooks, pass a Jotai `Provider` as the wrapper (see `test-jotai-provider-isolation`).
