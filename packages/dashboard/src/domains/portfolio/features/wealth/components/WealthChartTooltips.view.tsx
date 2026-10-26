import type { TrailingSavingCapacityPoint } from '@/domains/portfolio/features/wealth/helpers/calculators/wealthCalculations'
import { PORTFOLIO_CHART_TONES } from '@/domains/portfolio/shared/constants/portfolioChartTones'
import { getAccountTypeTone } from '@/domains/portfolio/shared/helpers/presenters/getPortfolioSeriesTone'
import type { MonthlyOperationsByMonth } from '@/domains/portfolio/shared/types/monthlyOperation.type'
import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { ChartText } from '@/shared/ui/ChartText.view'
import {
  type NumericTooltipProps,
  tooltipValue,
} from '@/shared/ui/chartTooltip'
import { Layout } from '@/shared/ui/Layout.view'
import { TooltipBox } from '@/shared/ui/TooltipBox.view'

export function EvolutionTooltip({
  active,
  payload,
  label,
  percentageMode = false,
}: EvolutionTooltipProps) {
  const formatDate = useFormatDate()
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  if (!active || !payload?.length) return null
  const row = payload[0]?.payload
  const cost = row?.total_cost_basis ?? 0
  const gain = row?.unrealized_gain ?? 0
  const total = cost + gain
  const share = (value: number) =>
    total === 0 ? '—' : formatPercentage((value / total) * 100)
  return (
    <TooltipBox>
      <Layout as="div" spaceAfter="compact">
        <ChartText as="div" tone={'tooltipText'}>
          {label == null ? '' : formatDate(label, { style: 'longMonthYear' })}
        </ChartText>
      </Layout>
      <Layout as="div" spaceAfter="compact">
        <ChartText as="div" tone={'tooltipLabel'} variant="strong">
          {i18n.t('ui.portfoliochartsTooltips.totalWithValues', {
            amount: formatMoney(total, { style: 'full' }),
          })}
        </ChartText>
      </Layout>
      <ChartText as="div" tone={PORTFOLIO_CHART_TONES.costBasisText}>
        {i18n.t('ui.portfoliochartsTooltips.costBasisWithValues', {
          amount: formatMoney(cost, { style: 'full' }),
          value: percentageMode ? ` · ${share(cost)}` : '',
        })}
      </ChartText>
      <ChartText
        as="div"
        tone={
          gain >= 0
            ? PORTFOLIO_CHART_TONES.performancePositiveText
            : PORTFOLIO_CHART_TONES.performanceNegativeText
        }
      >
        {i18n.t('ui.portfoliochartsTooltips.unrealizedProfitLoss', {
          amount: formatMoney(gain, { style: 'full' }),
          share: percentageMode ? ` · ${share(gain)}` : '',
        })}
      </ChartText>
    </TooltipBox>
  )
}

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

export function AccountTypeTooltip({
  active,
  payload,
  label,
  portfolioTotal,
}: {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: string
  portfolioTotal?: number
}) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  if (!active || !payload?.length) return null
  const point = payload[0]?.payload
  const cost =
    point?.total_cost_basis ??
    payload.find((p) => p.dataKey === 'total_cost_basis')?.value ??
    0
  const gain =
    point?.unrealized_gain ??
    payload.find((p) => p.dataKey === 'unrealized_gain')?.value ??
    0
  const total = point?.total_value ?? cost + gain
  const portfolioShare =
    portfolioTotal && portfolioTotal > 0 ? (total / portfolioTotal) * 100 : 0
  const gainPct = cost > 0 ? (gain / cost) * 100 : 0
  return (
    <TooltipBox>
      <Layout as="div" spaceAfter="compact">
        <ChartText as="div" tone={'tooltipText'} variant="strong">
          {point?.account_type ?? label}
        </ChartText>
      </Layout>
      <Layout as="div" spaceAfter="compact">
        <ChartText as="div" tone={'tooltipLabel'} variant="strong">
          {i18n.t('ui.portfoliochartsTooltips.totalWithValues', {
            amount: formatMoney(total, { style: 'full' }),
          })}
        </ChartText>
      </Layout>
      {portfolioTotal != null && (
        <Layout as="div" spaceAfter="compact">
          <ChartText as="div" tone={'tooltipDim'}>
            {i18n.t('ui.portfoliochartsTooltips.portfolioShareWithValues', {
              percentage: formatPercentage(portfolioShare),
            })}
          </ChartText>
        </Layout>
      )}
      <ChartText as="div" tone={PORTFOLIO_CHART_TONES.costBasisText}>
        {i18n.t('ui.portfoliochartsTooltips.costBasisWithValues2', {
          amount: formatMoney(cost, { style: 'full' }),
        })}
      </ChartText>
      <ChartText as="div" tone={PORTFOLIO_CHART_TONES.performancePositiveText}>
        {i18n.t('ui.portfoliochartsTooltips.unrealizedWithValues', {
          amount: formatMoney(gain, { style: 'full' }),
          percentage: formatPercentage(gainPct, { signed: true }),
        })}
      </ChartText>
    </TooltipBox>
  )
}

export function AccountTypeHistoryTooltip({
  active,
  payload,
  label,
  accountTypes,
  typeCategories,
  percentageMode = false,
}: AccountTypeHistoryTooltipProps) {
  const formatDate = useFormatDate()
  const formatMoney = useFormatMoney()
  if (!active || !payload?.length) return null
  const row = payload[0]?.payload
  const total = accountTypes.reduce((sum, accountType) => {
    const value = row?.[accountType]
    return sum + (typeof value === 'number' ? value : 0)
  }, 0)
  return (
    <TooltipBox>
      <Layout as="div" spaceAfter="compact">
        <ChartText as="div" tone={'tooltipText'}>
          {label == null ? '' : formatDate(label, { style: 'longMonthYear' })}
        </ChartText>
      </Layout>
      <Layout as="div" spaceAfter="compact">
        <ChartText as="div" tone={'tooltipLabel'} variant="strong">
          {i18n.t('ui.portfoliochartsTooltips.totalWithValues', {
            amount: formatMoney(total, { style: 'full' }),
          })}
        </ChartText>
      </Layout>
      {accountTypes.map((accountType, index) => (
        <AccountTypeTooltipRow
          key={accountType}
          accountType={accountType}
          index={index}
          percentageMode={percentageMode}
          row={row}
          total={total}
          typeCategories={typeCategories}
        />
      ))}
    </TooltipBox>
  )
}

type EvolutionTooltipProps = NumericTooltipProps<
  PortfolioHistoryPoint,
  Date | string | number
> & {
  percentageMode?: boolean
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

type AccountTypeTooltipPoint = {
  account_type: string
  total_cost_basis: number
  unrealized_gain: number
  total_value: number
}

type TooltipPayloadItem = {
  dataKey: string
  value: number
  payload?: AccountTypeTooltipPoint
}

type AccountTypeHistoryTooltipProps = NumericTooltipProps<
  Record<string, number | string | Date>,
  Date | string | number
> & {
  accountTypes: string[]
  percentageMode?: boolean
  typeCategories: Record<string, string>
}

function AccountTypeTooltipRow({
  accountType,
  index,
  percentageMode,
  row,
  total,
  typeCategories,
}: {
  accountType: string
  index: number
  percentageMode: boolean
  row: Record<string, number | string | Date> | undefined
  total: number
  typeCategories: Record<string, string>
}) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const rawValue = row?.[accountType]
  const value = typeof rawValue === 'number' ? rawValue : 0
  if (!value) return null
  const share = total > 0 ? formatPercentage((value / total) * 100) : '—'
  return (
    <ChartText
      as="div"
      tone={getAccountTypeTone(accountType, index, typeCategories)}
    >
      {accountType}: {formatMoney(value, { style: 'full' })}
      {percentageMode && ` · ${share}`}
    </ChartText>
  )
}
