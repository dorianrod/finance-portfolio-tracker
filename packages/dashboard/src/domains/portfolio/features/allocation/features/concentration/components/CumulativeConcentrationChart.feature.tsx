import { useState } from 'react'
import type { MouseHandlerDataParam } from 'recharts'
import { LineChart, ResponsiveContainer, Tooltip } from 'recharts'

import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import type { CumulativeConcentrationPoint } from '@/domains/portfolio/shared/helpers/calculators/calculatePortfolioCharts'
import { cumulativeConcentrationCrosshair } from '@/domains/portfolio/shared/helpers/calculators/calculatePortfolioCharts'
import i18n from '@/i18n/i18n'
import { ChartGrid, ChartXAxis, ChartYAxis } from '@/shared/ui/ChartAxes.view'
import { ChartReference } from '@/shared/ui/ChartReference.view'
import { SeriesLine } from '@/shared/ui/SeriesLine.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

import { CumulativeConcentrationTooltip } from './CumulativeConcentrationTooltip.view'

export function CumulativeConcentrationChart({
  data,
  description,
  effectiveDate,
}: {
  data: CumulativeConcentrationPoint[]
  description?: string
  effectiveDate?: Date | null
}) {
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
    <Surface variant="chart" className="p-4">
      <div className="mb-3">
        <Text
          as="h2"
          variant="label"
          tone="secondary"
          className="flex items-center"
        >
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
            scope={{ account: 'filterable', period: 'as-of', effectiveDate }}
          />
        </Text>
        <Text as="p" variant="caption" tone="subtle" className="mt-0.5">
          {description ??
            i18n.t(
              'ui.cumulativeconcentrationchart.shareOfTheApplicablePortfolioHeldInTheLargest',
            )}
        </Text>
      </div>
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
            tickFormatter={(value: number) => `${value}%`}

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
            tone="risk"
            weight="emphasized"
            markers="hidden"
            hover="series"
            motion="none"
          />
        </LineChart>
      </ResponsiveContainer>
      <Text
        as="div"
        variant="micro"
        tone="subtle"
        align="center"
        className="mt-1"
      >
        {i18n.t('ui.cumulativeconcentrationchart.numberOfAssets')}
      </Text>
    </Surface>
  )
}
