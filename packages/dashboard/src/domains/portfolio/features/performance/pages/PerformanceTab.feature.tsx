import { useMemo } from 'react'

import { PassiveIncomeChart } from '@/domains/portfolio/features/performance/components/PassiveIncomeChart.feature'
import { PerformanceContributionCard } from '@/domains/portfolio/features/performance/components/PerformanceContributionCard.feature'
import { TriChart } from '@/domains/portfolio/features/performance/components/TriChart.feature'
import { UnrealizedPnlChart } from '@/domains/portfolio/features/performance/components/UnrealizedPnlChart.feature'
import { computePerformanceContributions } from '@/domains/portfolio/features/performance/helpers/calculators/computePerformanceContributions'
import {
  UNAVAILABLE_ASSET_IRR_SUMMARY,
  useAssetIrrQuery,
} from '@/domains/portfolio/shared/apis/queries/useAssetIrrQuery'
import {
  IrrSinceTrackingKpi,
  NetRealizedKpi,
  NetUnrealizedKpi,
  PassiveIncomeKpi,
  TotalNetPerformanceKpi,
  TrailingThreeYearIrrKpi,
} from '@/domains/portfolio/shared/components/kpis/PortfolioKpis.feature'
import type {
  IncomeSummary,
  PerformanceSummary,
} from '@/domains/portfolio/shared/helpers/calculators/calculatePortfolioCharts'
import type { PassiveIncomePoint } from '@/domains/portfolio/shared/types/passiveIncomePoint.type'
import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'
import type { RawOperation } from '@/domains/portfolio/shared/types/rawOperation.type'
import type { RawPosition } from '@/domains/portfolio/shared/types/rawPosition.type'
import type { IrrStatus } from '@/domains/portfolio/shared/types/statuses.type'
import i18n from '@/i18n/i18n'
import { Inline, Layout } from '@/shared/ui/Layout.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

export function PerformanceTab({
  history,
  passiveIncome,
  rawPositions,
  rawOperations,
  accountFilters,
  accountTypeFilters,
  dateFrom,
  performance,
  income,
  globalTri,
  irrStatus,
  irrScopeLabel,
}: {
  history: PortfolioHistoryPoint[]
  passiveIncome: PassiveIncomePoint[]
  rawPositions: RawPosition[]
  rawOperations: RawOperation[]
  accountFilters: Set<string>
  accountTypeFilters: Set<string>
  dateFrom?: Date
  performance: PerformanceSummary
  income: IncomeSummary
  globalTri: number | null
  irrStatus: IrrStatus
  irrScopeLabel?: string
}) {
  const rollingTri3y = history[history.length - 1]?.tri_rolling_3y ?? null
  const asOfDate = history.at(-1)?.date
  const contributionFilters = useMemo(
    () => ({
      accounts: accountFilters,
      accountTypes: accountTypeFilters,
    }),
    [accountFilters, accountTypeFilters],
  )
  const sinceTrackingContributions = useMemo(
    () =>
      computePerformanceContributions(
        rawPositions,
        rawOperations,
        'since-tracking',
        asOfDate,
        contributionFilters,
      ),
    [rawPositions, rawOperations, asOfDate, contributionFilters],
  )
  const trailingThreeYearContributions = useMemo(
    () =>
      computePerformanceContributions(
        rawPositions,
        rawOperations,
        'trailing-3y',
        asOfDate,
        contributionFilters,
      ),
    [rawPositions, rawOperations, asOfDate, contributionFilters],
  )
  const assetIrrQuery = useAssetIrrQuery(
    accountFilters,
    accountTypeFilters,
    dateFrom,
    asOfDate,
  )
  let assetIrrStatus: IrrStatus = 'ready'
  if (assetIrrQuery.isPending && assetIrrQuery.fetchStatus === 'fetching')
    assetIrrStatus = 'loading'
  else if (assetIrrQuery.isError) assetIrrStatus = 'error'
  const hasChartData = history.length > 0 || passiveIncome.length > 0

  return (
    <div className="mb-6 space-y-4">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Surface as="section" variant="sectionEnd">
          <Layout spaceAfter="spacious">
            <Text as="h2" variant="overline" tone="muted">
              {i18n.t('ui.performancetab.performance')}
            </Text>
          </Layout>
          <Inline as="div" flow="wrap" align="start" gap="relaxed">
            <TotalNetPerformanceKpi performance={performance} />
            <NetUnrealizedKpi performance={performance} />
            <NetRealizedKpi performance={performance} />
          </Inline>
        </Surface>

        <Surface as="section" variant="sectionEnd">
          <Layout spaceAfter="spacious">
            <Text as="h2" variant="overline" tone="muted">
              {i18n.t('ui.performancetab.returnsAndPassiveIncome')}
            </Text>
          </Layout>
          <Inline as="div" flow="wrap" align="start" gap="relaxed">
            <PassiveIncomeKpi income={income} />
            <IrrSinceTrackingKpi
              value={globalTri}
              status={irrStatus}
              scopeLabel={irrScopeLabel}
            />
            <TrailingThreeYearIrrKpi
              // eslint-disable-next-line local/no-prop-drilling -- The page feature owns trailing-period selection.
              value={rollingTri3y}
              status={irrStatus}
              scopeLabel={irrScopeLabel}
            />
          </Inline>
        </Surface>
      </div>
      {hasChartData && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {history.length > 0 && <UnrealizedPnlChart history={history} />}
          {history.length > 0 && <TriChart history={history} />}
          {passiveIncome.length > 0 && (
            <PassiveIncomeChart data={passiveIncome} />
          )}
        </div>
      )}
      <PerformanceContributionCard
        assetIrr={assetIrrQuery.data ?? UNAVAILABLE_ASSET_IRR_SUMMARY}
        assetIrrStatus={assetIrrStatus}
        sinceTracking={sinceTrackingContributions}
        trailingThreeYears={trailingThreeYearContributions}
        sinceTrackingIrr={globalTri}
        // eslint-disable-next-line local/no-prop-drilling -- The page feature owns trailing-period IRR selection.
        trailingThreeYearIrr={rollingTri3y}
        irrStatus={irrStatus}
      />
    </div>
  )
}
