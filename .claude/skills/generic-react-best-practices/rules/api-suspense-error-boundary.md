---
title: Pair Every Suspense Query With an Error Boundary and Handle 404 Separately
impact: HIGH
impactDescription: a failed request shows a message or a not-found state, not a crashed page
tags: api, suspense, error-boundary, errors, not-found
---

## Pair Every Suspense Query With an Error Boundary and Handle 404 Separately

**Impact: HIGH (a failed request shows a message or a not-found state, not a crashed page)**

`useSuspenseQuery` throws on a failed request (403, 404, 500, timeout). Without a boundary the throw bubbles up to the router's default error screen and the whole page, navigation included, disappears. Wrap each page that reads Suspense queries in a boundary that owns both the `<Suspense>` fallback and the error state: a not-found block for a 404, a generic error message for anything else. Read the status from `axios.isAxiosError(error) && error.response?.status` (or from the normalized error of your central error handling).

**Incorrect (Suspense query without a boundary):**

```tsx
// pages/ProjectDetailPage.tsx
export function ProjectDetailPage() {
  const { projectId = '' } = useParams()
  // ProjectDetail calls useGetProjectDetailQuery(projectId): a 404 or 500 throws past the page
  return <ProjectDetail projectId={projectId} />
}
```

**Correct (boundary around the page, explicit 404 branch):**

```tsx
import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'

const isNotFound = (error: unknown) => axios.isAxiosError(error) && error.response?.status === 404

export function ProjectDetailPage() {
  const { projectId = '' } = useParams()
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          resetKeys={[projectId]}
          fallbackRender={({ error, resetErrorBoundary }) =>
            isNotFound(error) ? (
              <ProjectNotFound />
            ) : (
              <ErrorMessage error={error} onRetry={resetErrorBoundary} />
            )
          }
        >
          <Suspense fallback={<PageSkeleton />}>
            <ProjectDetail projectId={projectId} />
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}
```

- `QueryErrorResetBoundary` lets a retry refetch the failed query; `resetKeys` clears a caught error when the route id changes.
- Wrap an optional, failure-prone sub-fetch (a badge, a history) in its own small boundary that renders a degraded fallback, so a secondary 500 does not take the page down.

See also: `vercel-react-best-practices` → `async-suspense-boundaries`
