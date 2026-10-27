import { useState } from 'react'
import type { MouseHandlerDataParam } from 'recharts'
import { LineChart, ResponsiveContainer, Tooltip } from 'recharts'

import { cumulativeConcentrationCrosshair } from '@/domains/portfolio/features/diversification/features/concentration/components/CumulativeConcentrationChart/helpers/presenters/cumulativeConcentrationCrosshair'
import { CumulativeConcentrationTooltip } from '@/domains/portfolio/features/diversification/features/concentration/components/CumulativeConcentrationTooltip.view'
import type { CumulativeConcentrationPoint } from '@/domains/portfolio/features/diversification/features/concentration/helpers/calculators/concentrationCalculations/concentrationCalculations.types'
import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import { PORTFOLIO_CHART_TONES } from '@/domains/portfolio/shared/constants/portfolioChartTones'
import i18n from '@/i18n/i18n'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { ChartGrid } from '@/shared/ui/chartAxes/ChartGrid.view'
import { ChartXAxis } from '@/shared/ui/chartAxes/ChartXAxis.view'
import { ChartYAxis } from '@/shared/ui/chartAxes/ChartYAxis.view'
import { ChartReference } from '@/shared/ui/chartReference/ChartReference.view'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { SeriesLine } from '@/shared/ui/SeriesLine.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

export function CumulativeConcentrationChart({
  data,
  description,
  effectiveDate,
}: {
  data: CumulativeConcentrationPoint[]
  description?: string
  effectiveDate?: Date | null
}) {
  const formatPercentage = useFormatPercentage()
  const [activePoint, setActivePoint] =
    useState<CumulativeConcentrationPoint | null>(null)
  const crosshair = cumulativeConcentrationCrosshair(activePoint)
  const maxRank = data.at(-1)?.rank ?? 1

  function updateActivePoint(state: MouseHandlerDataParam) {
    if (!state.isTooltipActive || state.activeTooltipIndex == null) {
      setActivePoint(null)
      return
    }
    const index = Number(state.activeTooltipIndex)
    setActivePoint(Number.isInteger(index) ? (data[index] ?? null) : null)
  }

  return (
    <Surface variant="chart">
      <Layout spaceAfter="default">
        <Text as="h2" variant="label" tone="secondary">
          <Inline as="span" align="center">
            {i18n.t('ui.cumulativeconcentrationchart.cumulativeConcentration')}
            <ScopedInfoTooltip
              // eslint-disable-next-line local/no-prop-drilling -- This feature owns the fallback copy and scope passed to the tooltip feature adapter.
              text={
                description ??
                i18n.t(
                  'ui.cumulativeconcentrationchart.shareOfTheApplicablePortfolioHeldInTheLargest',
                )
              }
              // eslint-disable-next-line local/no-prop-drilling -- This feature owns the fallback copy and scope passed to the tooltip feature adapter.
              scope={{
                account: 'filterable',
                period: 'as-of',
                effectiveDate,
              }}
            />
          </Inline>
        </Text>
        <Layout spaceBefore="compact">
          <Text as="p" variant="caption" tone="subtle">
            {description ??
              i18n.t(
                'ui.cumulativeconcentrationchart.shareOfTheApplicablePortfolioHeldInTheLargest',
              )}
          </Text>
        </Layout>
      </Layout>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{ top: 8, right: 12, left: 0, bottom: 4 }}
          onMouseMove={updateActivePoint}
          onMouseLeave={() => setActivePoint(null)}
          onTouchMove={updateActivePoint}
          onTouchEnd={() => setActivePoint(null)}
        >
          <ChartGrid />
          <ChartXAxis
            dataKey="rank"
            type="number"
            domain={[1, maxRank]}
            allowDecimals={false}
          />
          <ChartYAxis
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tickFormatter={(value: number) =>
              formatPercentage(Number(value), { decimals: 'auto' })
            }
            width={42}
          />
          {crosshair && (
            <>
              <ChartReference x={crosshair.x} kind="crosshair" />
              <ChartReference y={crosshair.y} kind="crosshair" />
            </>
          )}
          <Tooltip
            content={<CumulativeConcentrationTooltip />}
            cursor={false}
          />
          <SeriesLine
            type="linear"
            dataKey="cumulativeWeight"
            tone={PORTFOLIO_CHART_TONES.risk}
            weight="emphasized"
            markers="hidden"
            hover="series"
            motion="none"
          />
        </LineChart>
      </ResponsiveContainer>
      <Layout spaceBefore="compact">
        <Text as="div" variant="micro" tone="subtle" align="center">
          {i18n.t('ui.cumulativeconcentrationchart.numberOfAssets')}
        </Text>
      </Layout>
    </Surface>
  )
}
