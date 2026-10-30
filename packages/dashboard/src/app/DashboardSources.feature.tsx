import { Suspense } from 'react'

import { useGetFundDiagnosticsQuery } from '@/domains/portfolio/features/data-quality/features/assessment/apis/queries/useGetFundDiagnosticsQuery'
import { useGetManualPriceOverridesQuery } from '@/domains/portfolio/features/data-quality/shared/apis/queries/useGetManualPriceOverridesQuery'
import { useGetPipelineErrorsQuery } from '@/domains/portfolio/features/data-quality/shared/apis/queries/useGetPipelineErrorsQuery'
import { useGetAnnualIncomeSavingsQuery } from '@/domains/portfolio/features/wealth/apis/queries/useGetAnnualIncomeSavingsQuery'
import { useGetMonthlyOperationsQuery } from '@/domains/portfolio/features/wealth/apis/queries/useGetMonthlyOperationsQuery'
import { useGetAllocationRowsQuery } from '@/domains/portfolio/shared/apis/queries/useGetAllocationRowsQuery'
import { useGetBrokerageCashHistoryQuery } from '@/domains/portfolio/shared/apis/queries/useGetBrokerageCashHistoryQuery'
import { useGetDashboardDataQuery } from '@/domains/portfolio/shared/apis/queries/useGetDashboardDataQuery'
import { useGetFundHoldingsQuery } from '@/domains/portfolio/shared/apis/queries/useGetFundHoldingsQuery'
import { useGetPortfolioHistoryQuery } from '@/domains/portfolio/shared/apis/queries/useGetPortfolioHistoryQuery'
import { useGetPositionsQuery } from '@/domains/portfolio/shared/apis/queries/useGetPositionsQuery'

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
        <FundDiagnosticsSource />
      </Suspense>
      <Suspense fallback={null}>
        <ManualPriceOverridesSource />
      </Suspense>
      <Suspense fallback={null}>
        <PipelineErrorsSource />
      </Suspense>
      <Suspense fallback={null}>
        <AnnualIncomeSavingsSource />
      </Suspense>
      <Suspense fallback={null}>
        <MonthlyOperationsSource />
      </Suspense>
      <Suspense fallback={null}>
        <AllocationRowsSource />
      </Suspense>
      <Suspense fallback={null}>
        <BrokerageCashHistorySource />
      </Suspense>
      <Suspense fallback={null}>
        <DashboardDataSource />
      </Suspense>
      <Suspense fallback={null}>
        <FundHoldingsSource />
      </Suspense>
      <Suspense fallback={null}>
        <PortfolioHistorySource />
      </Suspense>
      <Suspense fallback={null}>
        <PositionsSource />
      </Suspense>
    </DashboardSourceBoundary>
  )
}
function FundDiagnosticsSource() {
  useGetFundDiagnosticsQuery()
  return null
}
function ManualPriceOverridesSource() {
  useGetManualPriceOverridesQuery()
  return null
}
function PipelineErrorsSource() {
  useGetPipelineErrorsQuery()
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
function AllocationRowsSource() {
  useGetAllocationRowsQuery()
  return null
}
function BrokerageCashHistorySource() {
  useGetBrokerageCashHistoryQuery()
  return null
}
function DashboardDataSource() {
  useGetDashboardDataQuery()
  return null
}
function FundHoldingsSource() {
  useGetFundHoldingsQuery()
  return null
}
function PortfolioHistorySource() {
  useGetPortfolioHistoryQuery()
  return null
}
function PositionsSource() {
  useGetPositionsQuery()
  return null
}
