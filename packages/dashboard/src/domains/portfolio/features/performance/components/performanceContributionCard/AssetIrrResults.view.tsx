import type { ReactNode } from 'react'

import { IrrList } from '@/domains/portfolio/features/performance/components/PerformanceRankingLists/performanceRankingLists/IrrList.view'
import { useFormatExactPerformanceDateRange } from '@/domains/portfolio/features/performance/helpers/formatters/useFormatExactPerformanceDateRange'
import type { AssetIrrItem } from '@/domains/portfolio/features/performance/types/assetIrr.type'
import i18n from '@/i18n/i18n'
import { useFormatNumber } from '@/shared/helpers/formatters/useFormatNumber'
import { Grid } from '@/shared/ui/layout/Grid.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

export function AssetIrrResultsView({
  measuredCount,
  topReturns,
  underperformers,
  startDate,
  endDate,
  children,
}: {
  measuredCount: number
  topReturns: AssetIrrItem[]
  underperformers: AssetIrrItem[]
  // An unavailable source summary may omit its reporting interval.
  startDate: Date | null
  // An unavailable source summary may omit its reporting interval.
  endDate: Date | null
  children: ReactNode
}) {
  const formatExactPerformanceDateRange = useFormatExactPerformanceDateRange()
  const formatNumber = useFormatNumber()
  return (
    <>
      <Layout spaceBefore="spacious">
        <Surface variant="inset">
          <Grid columns={2} gap="default" inset="default">
            <div>
              {children}
              <Layout spaceBefore="compact">
                <Text as="div" variant="statistic" tone="default" numeric>
                  {formatNumber(measuredCount)}
                </Text>
              </Layout>
            </div>
            <div>
              <Text as="div" variant="microOverline" tone="subtle">
                {i18n.t('ui.performancecontributioncard.period')}
              </Text>
              <Layout spaceBefore="compact">
                <Text as="div" variant="label" tone="muted">
                  {formatExactPerformanceDateRange({
                    startDate,
                    endDate,
                  })}
                </Text>
              </Layout>
            </div>
          </Grid>
        </Surface>
      </Layout>
      <Grid columns={2} spaceBefore="spacious" gap="spacious">
        <IrrList
          title={i18n.t('ui.performancecontributioncard.topIrrs')}
          items={topReturns}
          positive
        />

        <IrrList
          title={i18n.t('ui.performancecontributioncard.lowestIrrs')}
          items={underperformers}
          positive={false}
        />
      </Grid>
    </>
  )
}
