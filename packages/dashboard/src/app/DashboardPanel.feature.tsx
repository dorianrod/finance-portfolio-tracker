import { memo, type ReactNode, Suspense, useState } from 'react'

import { DashboardPanelErrorBoundary } from './DashboardPanelErrorBoundary.view'
import { DashboardPanelFallback } from './DashboardPanelFallback.feature'

/*
 * @architecture-decision visited-dashboard-panels
 * @rules ui-vercel-responsive-rendering, ui-vercel-lazy-loading
 * @choice Retain visited panels with Activity and memoize their active/children boundary so unrelated navigation skips unchanged wrappers.
 * @reason Wealth's chart remounts still block warm navigation after the transformer optimizations; each navigation level has a fixed, finite panel set.
 * @alternative Unmounting repeats chart construction; CSS hiding alone keeps subscriptions and timers active; mounting unvisited panels eagerly defeats route loading.
 * @revisit The panel set becomes dynamic or retained DOM exceeds the navigation memory budget.
 */
export const DashboardPanel = memo(function DashboardPanel({
  active,
  children,
}: {
  active: boolean
  children: ReactNode
}) {
  const [visited, setVisited] = useState(active)
  if (active && !visited) setVisited(true)
  if (!active && !visited) return null

  return (
    <DashboardPanelErrorBoundary
      active={active}
      onRetry={() => window.location.reload()}
    >
      <Suspense fallback={FALLBACK}>{children}</Suspense>
    </DashboardPanelErrorBoundary>
  )
})

const FALLBACK = <DashboardPanelFallback />
