import { useAtomValue } from 'jotai'

import { DiversificationViewToggle } from '@/app/DiversificationViewToggle.feature'
import { type HoldingsView } from '@/app/HoldingsViewTabs.feature'
import { FilterButton } from '@/domains/portfolio/features/scope-selection/components/filterBar/FilterButton.feature'
import { dashboardActiveTabAtom } from '@/domains/portfolio/shared/stores/dashboardNavigation/dashboardActiveTabAtom'
import { dashboardHoldingsViewAtom } from '@/domains/portfolio/shared/stores/dashboardNavigation/dashboardHoldingsViewAtom'
import type { AnalysisTab } from '@/domains/portfolio/shared/stores/dashboardNavigation/dashboardNavigation.types'
import i18n from '@/i18n/i18n'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

import { DashboardReliability } from './DashboardReliability.feature'
import type { DashboardViewModel } from './types/dashboardViewModel.type'

export function DashboardSectionHeader({
  dashboard,
  activeFilterCount,
}: {
  dashboard: DashboardViewModel
  activeFilterCount: number
}) {
  const activeTab = useAtomValue(dashboardActiveTabAtom)
  const holdingsView = useAtomValue(dashboardHoldingsViewAtom)
  const copy =
    activeTab === 'holdings' ? HOLDINGS_COPY[holdingsView] : TAB_COPY[activeTab]
  return (
    <div className="mb-6">
      <Surface variant="sectionEnd">
        <Inline
          as="div"
          align="start"
          justify="between"
          gap="relaxed"
          inset="spacious"
        >
          <Layout>
            <Text as="h2" variant="statistic" tone="default">
              {copy.title}
            </Text>
            <DashboardReliability dashboard={dashboard} />
            <Layout spaceBefore="default">
              <Text as="p" variant="body" tone="subtle">
                {copy.description}
              </Text>
            </Layout>
          </Layout>
          <Inline as="div" sizing="fixed" align="center" gap="default">
            {activeTab === 'diversification' && <DiversificationViewToggle />}
            <FilterButton activeCount={activeFilterCount} />
          </Inline>
        </Inline>
      </Surface>
    </div>
  )
}

const TAB_COPY: Record<AnalysisTab, { title: string; description: string }> = {
  overview: {
    title: i18n.t('ui.app.portfolioOverview'),
    description: i18n.t(
      'ui.app.currentPositionRecentChangeDriversAndTheMainSignals',
    ),
  },
  wealth: {
    title: i18n.t('ui.app.wealthCashFlow'),
    description: i18n.t(
      'ui.app.howContributionsAndMarketPerformanceBuiltThePortfolioOver',
    ),
  },
  performance: {
    title: i18n.t('ui.app.performancePassiveIncome'),
    description: i18n.t(
      'ui.app.returnsRealizedOutcomesAndRecurringPassiveIncome',
    ),
  },
  diversification: {
    title: i18n.t('ui.app.diversification'),
    description: i18n.t(
      'ui.app.currentExposuresConcentrationAndHowThePortfolioMixIs',
    ),
  },
  holdings: {
    title: i18n.t('ui.app.holdings'),
    description: i18n.t(
      'ui.app.inspectHeldPositionsAndTheirUnderlyingEconomicExposure',
    ),
  },
  quality: {
    title: i18n.t('ui.app.dataQuality'),
    description: i18n.t(
      'ui.app.aFocusedReviewOfPipelinePricingClassificationAndLook',
    ),
  },
}

const HOLDINGS_COPY: Record<
  HoldingsView,
  { title: string; description: string }
> = {
  positions: {
    title: i18n.t('ui.app.positions'),
    description: i18n.t(
      'ui.app.inspectEveryHoldingTransactionAndPositionLevelResult',
    ),
  },
  underlying: {
    title: i18n.t('ui.app.underlyingExposure'),
    description: i18n.t(
      'ui.app.reviewIdentifiedEconomicExposureThroughEtfsAndFundsGrouped',
    ),
  },
}
