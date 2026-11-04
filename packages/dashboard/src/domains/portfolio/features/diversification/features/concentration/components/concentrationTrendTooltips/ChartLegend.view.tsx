import { PORTFOLIO_CHART_TONES } from '@/domains/portfolio/shared/constants/portfolioChartTones'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Text } from '@/shared/ui/Text.view'

import { ChartLegendItem } from './ChartLegendItem.view'

export function ChartLegend() {
  return (
    <Layout spaceAfter="default">
      <Text as="div" variant="micro" tone="subtle">
        <Inline as="div" flow="wrap" gap="relaxed">
          {(
            [
              ['25%', PORTFOLIO_CHART_TONES.risk],
              ['50%', PORTFOLIO_CHART_TONES.totalChange],
              ['75%', PORTFOLIO_CHART_TONES.netContributions],
              ['90%', PORTFOLIO_CHART_TONES.portfolioValue],
            ] as const
          ).map(([label, tone]) => (
            <ChartLegendItem key={label} label={label} tone={tone} />
          ))}
        </Inline>
      </Text>
    </Layout>
  )
}
