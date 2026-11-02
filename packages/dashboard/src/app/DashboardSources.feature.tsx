import { Suspense } from 'react'

import { useGetFundDiagnosticsQuery } from '@/domains/portfolio/features/data-quality/features/assessment/apis/queries/useGetFundDiagnosticsQuery'
import { useGetQualitySourcesQuery } from '@/domains/portfolio/features/data-quality/shared/apis/queries/useGetQualitySourcesQuery'
import { useGetAnnualIncomeSavingsQuery } from '@/domains/portfolio/features/wealth/apis/queries/useGetAnnualIncomeSavingsQuery'
import { useGetMonthlyOperationsQuery } from '@/domains/portfolio/features/wealth/apis/queries/useGetMonthlyOperationsQuery'
import { useGetPortfolioSourcesQuery } from '@/domains/portfolio/shared/apis/queries/useGetPortfolioSourcesQuery'

import { DashboardSourceBoundary } from './DashboardSourceBoundary.view'

/*
 * @architecture-decision persistent-dashboard-query-boundary
 * @rules api-query-hook-choice, api-vercel-parallel-work, api-suspense-error-boundary
 * @choice Start required sources in sibling Suspense consumers; the persistent shell observes their caches.
 * @reason Each sibling starts independently; DashboardLoadState renders cache loading/errors without unmounting navigation or open filters.
 * @alternative Sequential suspense calls in the shell stop later reads and remove the editable shell on the first suspension.
 * @revisit Required sources acquire independent route lifecycles or the shell no longer needs their cached state.
 */
export function DashboardSources() {
  return (
    <DashboardSourceBoundary>
      <Suspense fallback={null}>
        <PortfolioSources />
      </Suspense>
      <Suspense fallback={null}>
        <QualitySources />
      </Suspense>
      <Suspense fallback={null}>
        <FundDiagnosticsSource />
      </Suspense>
      <Suspense fallback={null}>
        <AnnualIncomeSavingsSource />
      </Suspense>
      <Suspense fallback={null}>
        <MonthlyOperationsSource />
      </Suspense>
    </DashboardSourceBoundary>
  )
}
function FundDiagnosticsSource() {
  useGetFundDiagnosticsQuery()
  return null
}
function AnnualIncomeSavingsSource() {
  useGetAnnualIncomeSavingsQuery()
  return null
}
function MonthlyOperationsSource() {
  useGetMonthlyOperationsQuery()
  return null
}

function PortfolioSources() {
  useGetPortfolioSourcesQuery()
  return null
}
function QualitySources() {
  useGetQualitySourcesQuery()
  return null
}
