import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import type { CumulativeConcentrationPoint } from '@/domains/portfolio/shared/helpers/calculators/calculatePortfolioCharts'
import { cumulativeConcentrationCrosshair } from '@/domains/portfolio/shared/helpers/calculators/calculatePortfolioCharts'
import i18n from '@/i18n/i18n'
import { CHART_THEME } from '@/shared/theme/chartTheme'
import { SEMANTIC_COLORS } from '@/shared/theme/semanticColors'
import { useState } from 'react'
import type { MouseHandlerDataParam } from 'recharts'
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
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
  const [activePoint, setActivePoint] = useState<CumulativeConcentrationPoint | null>(null)
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
    <div className="rounded-xl bg-surface p-4">
      <div className="mb-3">
        <h2 className="flex items-center text-sm font-medium text-content-secondary">
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
        </h2>
        <p className="mt-0.5 text-xs text-content-subtle">
          {description ??
            i18n.t('ui.cumulativeconcentrationchart.shareOfTheApplicablePortfolioHeldInTheLargest')}
        </p>
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
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
          <XAxis
            dataKey="rank"
            type="number"
            domain={[1, maxRank]}
            allowDecimals={false}
            tick={{ fill: CHART_THEME.tick, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tickFormatter={(value: number) => `${value}%`}
            tick={{ fill: CHART_THEME.tick, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={42}
          />
          {crosshair && (
            <>
              <ReferenceLine x={crosshair.x} stroke={CHART_THEME.label} strokeDasharray="4 4" />
              <ReferenceLine y={crosshair.y} stroke={CHART_THEME.label} strokeDasharray="4 4" />
            </>
          )}
          <Tooltip content={<CumulativeConcentrationTooltip />} cursor={false} />
          <Line
            type="linear"
            dataKey="cumulativeWeight"
            stroke={SEMANTIC_COLORS.risk}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: SEMANTIC_COLORS.risk }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-1 text-center text-[11px] text-content-subtle">
        {i18n.t('ui.cumulativeconcentrationchart.numberOfAssets')}
      </div>
    </div>
  )
}
