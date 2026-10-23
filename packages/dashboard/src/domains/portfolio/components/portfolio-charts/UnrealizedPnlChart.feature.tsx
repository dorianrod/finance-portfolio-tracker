import i18n from '@/i18n/i18n'
import { Bar, CartesianGrid, Cell, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { PortfolioHistoryPoint } from '@/domains/portfolio/types/history'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { CHART_THEME } from '@/shared/theme/chartTheme'
import { SEMANTIC_COLORS } from '@/shared/theme/semanticColors'
import { TooltipBox } from '@/shared/ui/TooltipBox.view'
import { ScopedInfoTooltip } from '@/domains/portfolio/components/kpis/ScopedInfoTooltip.feature'

interface UnrealizedPnlPoint extends PortfolioHistoryPoint {
  unrealized_gain_pct: number | null
  snapshot_change: number | null
}

interface UnrealizedPnlTooltipProps {
  active?: boolean
  payload?: Array<{ payload: UnrealizedPnlPoint }>
}

function UnrealizedPnlTooltip({ active, payload }: UnrealizedPnlTooltipProps) {
  const formatDate = useFormatDate()
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  if (!active || !payload?.length) return null
  const point = payload[0]?.payload
  if (!point) return null

  const valueColor = point.unrealized_gain >= 0
    ? SEMANTIC_COLORS.performancePositiveText
    : SEMANTIC_COLORS.performanceNegativeText
  const date = formatDate(`${point.date}T00:00:00`, { style: 'longDayMonthYear' })

  return (
    <TooltipBox>
      <div style={{ color: 'var(--tooltip-text)', marginBottom: 6, fontWeight: 600 }}>{date}</div>
      <div style={{ color: valueColor, fontWeight: 600 }}>

        {i18n.t('ui.unrealizedpnlchart.grossUnrealizedPandl')} {formatMoney(point.unrealized_gain, { style: 'full' })}
      </div>
      <div style={{ color: 'var(--tooltip-label)', marginTop: 4 }}>

        {i18n.t('ui.unrealizedpnlchart.pandlTotalCapitalPlaced')} {point.unrealized_gain_pct == null ? '—' : formatPercentage(point.unrealized_gain_pct, { signed: true })}
      </div>
      <div style={{ color: CHART_THEME.label, marginTop: 4 }}>{i18n.t('ui.unrealizedpnlchart.costBasis')} {formatMoney(point.total_cost_basis, { style: 'full' })}</div>
      {point.snapshot_change != null && (
        <div style={{ borderTop: '1px solid var(--tooltip-border)', color: CHART_THEME.label, marginTop: 6, paddingTop: 6 }}>

          {i18n.t('ui.unrealizedpnlchart.changeSincePreviousSnapshot')} {formatMoney(point.snapshot_change, { style: 'full' })}
        </div>
      )}
    </TooltipBox>
  )
}

function UnrealizedPnlCell({ point }: { point: UnrealizedPnlPoint }) {
  return <Cell fill={point.unrealized_gain >= 0 ? SEMANTIC_COLORS.performancePositive : SEMANTIC_COLORS.performanceNegative} />
}

export function UnrealizedPnlChart({ history }: { history: PortfolioHistoryPoint[] }) {
  const formatDate = useFormatDate()
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const data: UnrealizedPnlPoint[] = history.map((point, index) => ({
    ...point,
    unrealized_gain_pct: point.total_cost_basis > 0
      ? point.unrealized_gain / point.total_cost_basis * 100
      : null,
    snapshot_change: index > 0
      ? point.unrealized_gain - history[index - 1].unrealized_gain
      : null,
  }))

  if (data.length === 0) return null

  return (
    <div className="rounded-xl bg-gray-900 p-4">
      <div className="mb-3">
        <h2 className="flex items-center text-sm font-medium text-gray-300">{i18n.t('ui.unrealizedpnlchart.grossUnrealizedPandlOverTime')}<ScopedInfoTooltip text={i18n.t('ui.unrealizedpnlchart.amountBeforeEstimatedTaxAndPercentageOfTheTotal')} scope={{ account: 'filterable', period: 'range' }} /></h2>
        <p className="mt-0.5 text-xs text-gray-600">{i18n.t('ui.unrealizedpnlchart.amountBeforeEstimatedTaxAndPercentageOfTheTotal')}</p>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} vertical={false} />
          <XAxis dataKey="date" tickFormatter={(value) => formatDate(value, { style: 'shortMonthShortYear' })} tick={{ fill: CHART_THEME.tick, fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis yAxisId="amount" tickFormatter={(value) => formatMoney(value, { style: 'compact' })} tick={{ fill: CHART_THEME.tick, fontSize: 11 }} tickLine={false} axisLine={false} width={52} />
          <YAxis yAxisId="pct" orientation="right" tickFormatter={(value: number) => formatPercentage(value, { decimals: 0 })} tick={{ fill: CHART_THEME.tick, fontSize: 11 }} tickLine={false} axisLine={false} width={42} />
          <ReferenceLine yAxisId="amount" y={0} stroke={CHART_THEME.zeroLine} />
          <Tooltip content={<UnrealizedPnlTooltip />} cursor={{ fill: CHART_THEME.cursor }} />
          <Bar yAxisId="amount" dataKey="unrealized_gain" maxBarSize={24} radius={3} isAnimationActive={false}>
            {data.map((point) => <UnrealizedPnlCell key={point.date} point={point} />)}
          </Bar>
          <Line yAxisId="pct" type="monotone" dataKey="unrealized_gain_pct" stroke={SEMANTIC_COLORS.returnRate} strokeWidth={2} dot={false} activeDot={{ r: 4 }} connectNulls isAnimationActive={false} />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500">
        <span><i className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: SEMANTIC_COLORS.performancePositive }} />{i18n.t('ui.unrealizedpnlchart.grossUnrealizedGain')}</span>
        <span><i className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: SEMANTIC_COLORS.performanceNegative }} />{i18n.t('ui.unrealizedpnlchart.grossUnrealizedLoss')}</span>
        <span><i className="mr-1.5 inline-block h-0.5 w-3 align-middle" style={{ backgroundColor: SEMANTIC_COLORS.returnRate }} />{i18n.t('ui.unrealizedpnlchart.pandlCapitalPlaced')}</span>
      </div>
    </div>
  )
}
