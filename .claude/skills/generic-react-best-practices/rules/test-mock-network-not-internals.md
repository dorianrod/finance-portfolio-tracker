---
title: Mock the Network Boundary, Never Internal Modules
impact: MEDIUM-HIGH
impactDescription: tests that mock internals stay green while the real hook stack is broken
tags: test, mocking, axios, msw, jest-mock
---

## Mock the Network Boundary, Never Internal Modules

**Impact: MEDIUM-HIGH (tests that mock internals stay green while the real hook stack is broken)**

Never `jest.mock` an internal module: a hook, component, helper, provider or a schema library such as `yup` (a domain `apis/`, `services/`, `components/` or `helpers/` module). The test then checks a stub instead of the real query key, Yup parsing, permissions and rendering. Stub only the network boundary — MSW handlers or an axios adapter — and let every project hook run.

**Incorrect (stubs the query hook and the permissions hook):**

```tsx
jest.mock('@/domains/sales/orders/features/detail/apis/queries/useGetOrderDetailQuery', () => ({
  useGetOrderDetailQuery: () => mockUseGetOrderDetailQuery(),
}))
jest.mock('@/domains/sales/orders/features/detail/pages/detail/services/permissions/usePermissions', () => ({
  usePermissions: () => mockUsePermissions(),
}))

render(<OrderSummary orderId="order-1" />)
```

**Correct (only the HTTP layer is stubbed, the real hook and schema run):**

```tsx
import { HttpResponse, http } from 'msw'

import { server } from '@/testing/server'

it('should accept a null customerType', async () => {
  server.use(
    http.get('*/orders/order-1', () =>
      HttpResponse.json({ id: 'order-1', customerType: null }),
    ),
  )

  render(<OrderSummary orderId="order-1" />, { wrapper: AppProviders })

  expect(await screen.findByRole('heading', { name: 'order-1' })).toBeInTheDocument()
  expect(screen.queryByText('order.customerType.label')).not.toBeInTheDocument()
})
```

- Where MSW cannot run in the test environment, pass an axios instance whose `adapter` returns canned responses, or stub `axios.create` once at the boundary; the hooks above it stay real.
- Third-party and infrastructure modules that cannot run in jsdom (error reporters, file download helpers, auth libraries that build a client on import) may be stubbed; own code may not.
- Do not share a "common mocks" helper that stubs internal modules: it hides the same problem in every test that imports it.
- When touching a test that mocks internals, replace those mocks by a network stub.
