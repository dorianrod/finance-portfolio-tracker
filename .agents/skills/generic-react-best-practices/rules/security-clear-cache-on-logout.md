---
title: Clear the Query Cache on Logout
impact: CRITICAL
impactDescription: prevents cross-user data leaks in the same tab
tags: security, cache, logout, react-query, auth
---

## Clear the Query Cache on Logout

**Impact: CRITICAL (prevents cross-user data leaks in the same tab)**

Logout implies `queryClient.clear()`. The `QueryClient` lives for the whole page session and survives an SPA logout: the next user of the tab would see the previous user's cached data until it refetches. Resetting the session or user atoms does not touch the cache, so every logout path (user action, idle timeout, 401 or refresh failure) must clear it. Jotai stores holding user data must be reset too.

**Incorrect (session reset, server cache kept):**

```tsx
const { logout } = useLogout()
return <button onClick={logout}>{t('common.logOut')}</button>
```

**Correct (each logout path clears the cache once the session is reset):**

```tsx
// Components under <QueryClientProvider>
const { logout } = useLogout()
const queryClient = useQueryClient()
const logoutAndClearCache = useCallback(async () => {
  await logout()
  queryClient.clear()
}, [logout, queryClient])

// Module where the client is created (401 or refresh failure): the instance is in scope
export const queryClient = new QueryClient()
await logout()
queryClient.clear()
```

Clear once `logout()` has resolved. Better still, centralize it: export the client from a dedicated module and clear it inside the logout hook, so no call site can forget it. Avoid importing the client from a provider file that already imports the logout hook, which would create a cycle.
