import i18n from '@/i18n/i18n'
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { CHART_THEME } from '@/shared/theme/chartTheme'
import { SEMANTIC_COLORS } from '@/shared/theme/semanticColors'
import type { HoldingConcentration } from '@/domains/portfolio/shared/helpers/calculators/calculatePortfolioCharts'
import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import { HOLDING_LABEL_WIDTH, HoldingLabelTick } from './HoldingLabelTick.view'

interface ConcentrationTooltipProps {
  active?: boolean
  payload?: Array<{ payload: HoldingConcentration }>
}

function ConcentrationTooltip({ active, payload }: ConcentrationTooltipProps) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  if (!active || !payload?.length) return null
  const row = payload[0].payload as HoldingConcentration
  return (
    <div className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-xs shadow-xl">
      <div className="font-semibold text-white">{row.name}</div>
      <div className="mt-1 text-gray-300">{formatMoney(row.value, { style: 'full' })} · {formatPercentage(row.weight)}</div>
    </div>
  )
}

function ConcentrationCell({ index }: { index: number }) {
  return <Cell fill={index === 0 ? SEMANTIC_COLORS.risk : SEMANTIC_COLORS.neutralSeries} />
}

export function ConcentrationChart({ data, topTenValue, topTenPct, description, effectiveDate }: { data: HoldingConcentration[]; topTenValue?: number; topTenPct?: number; description?: string; effectiveDate?: string | null }) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const height = Math.max(250, data.length * 30)
  const topTenSummary = topTenValue != null && topTenPct != null
    ? { percentage: topTenPct, value: topTenValue }
    : null
  return (
    <div className="rounded-xl bg-gray-900 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          {/* eslint-disable-next-line local/no-prop-drilling -- This feature owns the fallback copy and scope passed to the tooltip feature adapter. */}
          <h2 className="flex items-center text-sm font-medium text-gray-300">{i18n.t('ui.concentrationchart.largestHoldings')}<ScopedInfoTooltip text={description ?? i18n.t('ui.concentrationchart.largestPortfolioExposuresAggregatedAcrossAccounts')} scope={{ account: 'filterable', period: 'as-of', effectiveDate }} /></h2>
          <p className="mt-0.5 text-xs text-gray-600">{description ?? i18n.t('ui.concentrationchart.aggregatedAcrossAccounts')}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {topTenSummary && <div className="text-right"><div className="text-[10px] uppercase tracking-wider text-gray-600">{i18n.t('ui.concentrationchart.top10Total')}</div><div className="mt-0.5 text-xs font-semibold tabular-nums text-gray-300">{formatMoney(topTenSummary.value, { style: 'full' })} · {formatPercentage(topTenSummary.percentage)}</div></div>}
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[620px]">
          <ResponsiveContainer width="100%" height={height}>
            <BarChart layout="vertical" data={data} margin={{ top: 0, right: 50, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" horizontal={false} />
              <XAxis type="number" domain={[0, 'dataMax']} hide />
              <YAxis
                dataKey="label"
                type="category"
                tick={<HoldingLabelTick />}
                tickLine={false}
                axisLine={false}
                width={HOLDING_LABEL_WIDTH}
              />
              <Tooltip content={<ConcentrationTooltip />} cursor={{ fill: CHART_THEME.cursor }} />
              <Bar dataKey="weight" radius={[0, 4, 4, 0]}>
                {data.map((point, index) => <ConcentrationCell key={point.label} index={index} />)}
                <LabelList dataKey="weight" position="right" formatter={(value: unknown) => formatPercentage(Number(value))} style={{ fill: 'var(--chart-label)', fontSize: 11 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
