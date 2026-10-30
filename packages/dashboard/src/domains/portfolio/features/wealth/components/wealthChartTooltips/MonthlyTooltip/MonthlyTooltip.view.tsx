import type {
  MonthlyTooltipOperations,
  MonthlyTooltipOperationsByMonth,
} from '@/domains/portfolio/features/wealth/components/MonthlySavingsChart/helpers/transformers/groupMonthlyTooltipOperations'
import type { MonthlyOperation } from '@/domains/portfolio/features/wealth/types/monthlyOperation.type'
import type { TrailingSavingCapacityPoint } from '@/domains/portfolio/features/wealth/types/trailingSavingCapacityPoint.type'
import { PORTFOLIO_CHART_TONES } from '@/domains/portfolio/shared/constants/portfolioChartTones'
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

// eslint-disable-next-line complexity -- reviewed: 2026-10-27; Monthly operations and trailing totals are the context of one savings-history hover point.
export function MonthlyTooltip({
  active,
  payload,
  label,
  operationGroups,
}: MonthlyTooltipProps) {
  const formatDate = useFormatDate()
  const formatMoney = useFormatMoney()
  if (payload == null) return null
  if (!active || payload.length === 0) return null
  const savingsDelta = tooltipValue(payload, 'savings_delta')
  const perfDelta = tooltipValue(payload, 'perf_delta')
  const rolling12m = tooltipValue(payload, 'rolling_12m')
  const rollingPerf12m = tooltipValue(payload, 'rolling_perf_12m')
  const pointDate = payload[0]?.payload?.date
  const month = formatDate(pointDate ?? label, {
    style: 'isoDate',
    fallback: '',
  }).slice(0, 7)
  const { deposits, withdrawals } =
    operationGroups.get(month) ?? EMPTY_OPERATIONS
  return (
    <TooltipBox>
      <Layout as="div" spaceAfter="compact">
        <ChartText as="div" tone={'tooltipText'} variant="strong">
          {formatDate(label, { style: 'longMonthYear', fallback: '' })}
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
          {deposits.map(({ id, operation }) => (
            <MonthlyOperationRow
              key={id}
              operation={operation}
              withdrawal={false}
            />
          ))}
        </div>
      )}
      {withdrawals.length > 0 && (
        <div>
          {withdrawals.map(({ id, operation }) => (
            <MonthlyOperationRow key={id} operation={operation} withdrawal />
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
  operationGroups: MonthlyTooltipOperationsByMonth
}

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
      {i18n.t('ui.portfoliochartsTooltips.accountOperation', {
        direction: withdrawal ? '−' : '+',
        amount: formatMoney(amount, { style: 'full' }),
        account: operation.account,
      })}
    </ChartText>
  )
}

const EMPTY_OPERATIONS: MonthlyTooltipOperations = {
  deposits: [],
  withdrawals: [],
}
