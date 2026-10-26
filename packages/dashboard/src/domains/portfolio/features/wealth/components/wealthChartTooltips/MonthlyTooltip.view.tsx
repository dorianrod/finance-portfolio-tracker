import type { TrailingSavingCapacityPoint } from '@/domains/portfolio/features/wealth/helpers/calculators/wealthCalculations/wealthCalculations.types'
import { PORTFOLIO_CHART_TONES } from '@/domains/portfolio/shared/constants/portfolioChartTones'
import type { MonthlyOperationsByMonth } from '@/domains/portfolio/shared/types/monthlyOperation.type'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { ChartText } from '@/shared/ui/ChartText.view'
import {
  type NumericTooltipProps,
  tooltipValue,
} from '@/shared/ui/chartTooltip'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { TooltipBox } from '@/shared/ui/TooltipBox.view'

export function MonthlyTooltip({
  active,
  payload,
  label,
  ops,
}: MonthlyTooltipProps) {
  const formatDate = useFormatDate()
  const formatMoney = useFormatMoney()
  if (!active || !payload?.length) return null
  const savingsDelta = tooltipValue(payload, 'savings_delta')
  const perfDelta = tooltipValue(payload, 'perf_delta')
  const rolling12m = tooltipValue(payload, 'rolling_12m')
  const rollingPerf12m = tooltipValue(payload, 'rolling_perf_12m')
  const pointDate = payload[0]?.payload?.date
  const month = pointDate
    ? formatDate(pointDate, { style: 'isoDate' }).slice(0, 7)
    : String(label).slice(0, 7)
  const monthOps: ReturnType<MonthlyOperationsByMonth['get']> =
    ops.get(month) ?? []
  const deposits = monthOps.filter(
    (o) => o.operation_type === 'DEPOSIT' && o.total_amount > 0,
  )
  const withdrawals = monthOps.filter(
    (o) =>
      o.operation_type === 'WITHDRAWAL' ||
      (o.operation_type === 'DEPOSIT' && o.total_amount < 0),
  )
  return (
    <TooltipBox>
      <Layout as="div" spaceAfter="compact">
        <ChartText as="div" tone={'tooltipText'} variant="strong">
          {label == null ? '' : formatDate(label, { style: 'longMonthYear' })}
        </ChartText>
      </Layout>
      <Layout as="div" spaceAfter="compact">
        <ChartText as="div" tone={PORTFOLIO_CHART_TONES.netContributionsText}>
          {i18n.t('ui.portfoliochartsTooltips.netContributionsWithValues', {
            amount: formatMoney(savingsDelta, { style: 'full' }),
          })}
        </ChartText>
      </Layout>
      {deposits.length > 0 && (
        <div>
          {deposits.map((operation) => (
            <MonthlyOperationRow
              key={operation.account}
              operation={operation}
              withdrawal={false}
            />
          ))}
        </div>
      )}
      {withdrawals.length > 0 && (
        <div>
          {withdrawals.map((operation) => (
            <MonthlyOperationRow
              key={operation.account}
              operation={operation}
              withdrawal
            />
          ))}
        </div>
      )}
      <Layout as="div" spaceBefore="compact" inset="compact">
        <ChartText
          as="div"
          tone={
            perfDelta >= 0
              ? PORTFOLIO_CHART_TONES.performancePositiveText
              : PORTFOLIO_CHART_TONES.performanceNegativeText
          }
          separator
        >
          {i18n.t('ui.portfoliochartsTooltips.marketPerformanceWithValues', {
            amount: formatMoney(perfDelta, { style: 'full' }),
          })}
        </ChartText>
      </Layout>
      <Layout as="div" spaceBefore="compact" inset="compact">
        <ChartText
          as="div"
          tone={PORTFOLIO_CHART_TONES.netContributionsText}
          separator
        >
          {i18n.t(
            'ui.portfoliochartsTooltips.trailing12MonthNetContributionsWithValues',
            { amount: formatMoney(rolling12m, { style: 'full' }) },
          )}
        </ChartText>
      </Layout>
      <Layout as="div" spaceBefore="compact">
        <ChartText
          as="div"
          tone={
            rollingPerf12m >= 0
              ? PORTFOLIO_CHART_TONES.performancePositiveText
              : PORTFOLIO_CHART_TONES.performanceNegativeText
          }
        >
          {i18n.t(
            'ui.portfoliochartsTooltips.trailing12MonthPerformanceWithValues',
            { amount: formatMoney(rollingPerf12m, { style: 'full' }) },
          )}
        </ChartText>
      </Layout>
    </TooltipBox>
  )
}

type MonthlyTooltipProps = NumericTooltipProps<
  TrailingSavingCapacityPoint,
  Date | string | number
> & {
  ops: MonthlyOperationsByMonth
}

type MonthlyOperation = NonNullable<
  ReturnType<MonthlyOperationsByMonth['get']>
>[number]

function MonthlyOperationRow({
  operation,
  withdrawal,
}: {
  operation: MonthlyOperation
  withdrawal: boolean
}) {
  const formatMoney = useFormatMoney()
  const amount = withdrawal
    ? Math.abs(operation.total_amount)
    : operation.total_amount
  return (
    <ChartText
      as="div"
      tone={
        withdrawal
          ? PORTFOLIO_CHART_TONES.outflowText
          : PORTFOLIO_CHART_TONES.netContributionsDetail
      }
      variant="micro"
    >
      {withdrawal ? '−' : '+'} {formatMoney(amount, { style: 'full' })} —{' '}
      {operation.account}
    </ChartText>
  )
}
