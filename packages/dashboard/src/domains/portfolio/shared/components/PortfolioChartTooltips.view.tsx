import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { SEMANTIC_COLORS } from '@/shared/theme/semanticColors'
import { typeColor } from '@/shared/theme/chartColors'
import { TooltipBox } from '@/shared/ui/TooltipBox.view'
import type { MonthlyOperationsByMonth } from '@/domains/portfolio/shared/types/monthlyOperation.type'
import type { PassiveIncomePoint } from '@/domains/portfolio/shared/types/passiveIncomePoint.type'
import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'
import { tooltipValue, type NumericTooltipProps } from '@/shared/ui/chartTooltip'
import type { TopPerformer, TrailingSavingCapacityPoint, TriChartPoint } from '@/domains/portfolio/shared/helpers/calculators/calculatePortfolioCharts'

interface EvolutionTooltipProps extends NumericTooltipProps<PortfolioHistoryPoint> {
  percentageMode?: boolean
}

export function EvolutionTooltip({ active, payload, label, percentageMode = false }: EvolutionTooltipProps) {
  const formatDate = useFormatDate()
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  if (!active || !payload?.length) return null
  const row = payload[0]?.payload
  const cost = row?.total_cost_basis ?? 0
  const gain = row?.unrealized_gain ?? 0
  const total = cost + gain
  const share = (value: number) => total === 0 ? '—' : formatPercentage(value / total * 100)
  return (
    <TooltipBox>
      <div style={{ color: 'var(--tooltip-text)', marginBottom: 6 }}>
        {formatDate(String(label), { style: 'longMonthYear' })}
      </div>
      <div style={{ color: 'var(--tooltip-label)', fontWeight: 600, marginBottom: 4 }}>{i18n.t('ui.portfoliochartsTooltips.total')} {formatMoney(total, { style: 'full' })}</div>
      <div style={{ color: SEMANTIC_COLORS.costBasisText }}>{i18n.t('ui.portfoliochartsTooltips.costBasis')} {formatMoney(cost, { style: 'full' })}{percentageMode && ` · ${share(cost)}`}</div>
      <div style={{ color: gain >= 0 ? SEMANTIC_COLORS.performancePositiveText : SEMANTIC_COLORS.performanceNegativeText }}>{i18n.t('ui.portfoliochartsTooltips.unrealizedPL')} {formatMoney(gain, { style: 'full' })}{percentageMode && ` · ${share(gain)}`}</div>
    </TooltipBox>
  )
}

interface MonthlyTooltipProps extends NumericTooltipProps<TrailingSavingCapacityPoint> {
  ops: MonthlyOperationsByMonth
}

type MonthlyOperation = NonNullable<ReturnType<MonthlyOperationsByMonth['get']>>[number]

function MonthlyOperationRow({ operation, withdrawal }: { operation: MonthlyOperation; withdrawal: boolean }) {
  const formatMoney = useFormatMoney()
  const amount = withdrawal ? Math.abs(operation.total_amount) : operation.total_amount
  return <div style={{ color: withdrawal ? SEMANTIC_COLORS.outflowText : SEMANTIC_COLORS.netContributionsDetail, fontSize: 11 }}>{withdrawal ? '−' : '+'} {formatMoney(amount, { style: 'full' })} — {operation.account}</div>
}

export function MonthlyTooltip({ active, payload, label, ops }: MonthlyTooltipProps) {
  const formatDate = useFormatDate()
  const formatMoney = useFormatMoney()
  if (!active || !payload?.length) return null
  const savingsDelta = tooltipValue(payload, 'savings_delta')
  const perfDelta = tooltipValue(payload, 'perf_delta')
  const rolling12m = tooltipValue(payload, 'rolling_12m')
  const rollingPerf12m = tooltipValue(payload, 'rolling_perf_12m')
  const month = String(label).slice(0, 7)
  const monthOps: ReturnType<MonthlyOperationsByMonth['get']> = ops.get(month) ?? []
  const deposits    = monthOps.filter((o) => o.operation_type === 'DEPOSIT' && o.total_amount > 0)
  const withdrawals = monthOps.filter((o) => o.operation_type === 'WITHDRAWAL' || (o.operation_type === 'DEPOSIT' && o.total_amount < 0))
  return (
    <TooltipBox padding="10px 14px" maxWidth={280}>
      <div style={{ color: 'var(--tooltip-text)', marginBottom: 8, fontWeight: 600 }}>
        {formatDate(String(label), { style: 'longMonthYear' })}
      </div>
      <div style={{ color: SEMANTIC_COLORS.netContributionsText, marginBottom: 4 }}>{i18n.t('ui.portfoliochartsTooltips.netContributions')} {formatMoney(savingsDelta, { style: 'full' })}</div>
      {deposits.length > 0 && (
        <div style={{ paddingLeft: 8, marginBottom: 4 }}>
          {deposits.map((operation) => <MonthlyOperationRow key={operation.account} operation={operation} withdrawal={false} />)}
        </div>
      )}
      {withdrawals.length > 0 && (
        <div style={{ paddingLeft: 8, marginBottom: 4 }}>
          {withdrawals.map((operation) => <MonthlyOperationRow key={operation.account} operation={operation} withdrawal />)}
        </div>
      )}
      <div style={{ borderTop: '1px solid var(--tooltip-border)', marginTop: 6, paddingTop: 6, color: perfDelta >= 0 ? SEMANTIC_COLORS.performancePositiveText : SEMANTIC_COLORS.performanceNegativeText }}>

        {i18n.t('ui.portfoliochartsTooltips.marketPerformance')} {formatMoney(perfDelta, { style: 'full' })}
      </div>
      <div style={{ borderTop: '1px solid var(--tooltip-border)', marginTop: 6, paddingTop: 6, color: SEMANTIC_COLORS.netContributionsText }}>

        {i18n.t('ui.portfoliochartsTooltips.trailing12MonthNetContributions')} {formatMoney(rolling12m, { style: 'full' })}
      </div>
      <div style={{ marginTop: 4, color: rollingPerf12m >= 0 ? SEMANTIC_COLORS.performancePositiveText : SEMANTIC_COLORS.performanceNegativeText }}>

        {i18n.t('ui.portfoliochartsTooltips.trailing12MonthPerformance')} {formatMoney(rollingPerf12m, { style: 'full' })}
      </div>
    </TooltipBox>
  )
}

export function TriTooltip({ active, payload, label }: NumericTooltipProps<TriChartPoint>) {
  const formatDate = useFormatDate()
  const formatPercentage = useFormatPercentage()
  if (!active || !payload?.length) return null
  const tri1y = payload.find((point) => point.dataKey === 'tri_rolling_1y')?.value ?? null
  const tri1yBackfill = payload.find((point) => point.dataKey === 'tri_rolling_1y_backfill')?.value ?? null
  const tri3y = payload.find((point) => point.dataKey === 'tri_rolling_3y')?.value ?? null
  const tri3yBackfill = payload.find((point) => point.dataKey === 'tri_rolling_3y_backfill')?.value ?? null
  const showTri1y = tri1y !== null || tri1yBackfill !== null
  const showTri3y = tri3y !== null || tri3yBackfill !== null
  return (
    <TooltipBox>
      <div style={{ color: 'var(--tooltip-text)', marginBottom: 6 }}>
        {formatDate(String(label), { style: 'longMonthYear' })}
      </div>
      {showTri1y && (
        <div style={{ color: SEMANTIC_COLORS.totalChange, fontWeight: 600 }}>

          {i18n.t('ui.portfoliochartsTooltips.irr1y')} {tri1y === null ? i18n.t('ui.portfoliochartsTooltips.notYetAvailable') : formatPercentage(tri1y, { decimals: 2, signed: true })}
        </div>
      )}
      {showTri3y && (
        <div style={{ color: SEMANTIC_COLORS.returnRate, fontWeight: 600, marginTop: showTri1y ? 4 : 0 }}>

          {i18n.t('ui.portfoliochartsTooltips.irr3y')} {tri3y === null ? i18n.t('ui.portfoliochartsTooltips.notYetAvailable') : formatPercentage(tri3y, { decimals: 2, signed: true })}
        </div>
      )}
    </TooltipBox>
  )
}

interface AccountTypeTooltipPoint {
  account_type: string
  total_cost_basis: number
  unrealized_gain: number
  total_value: number
}

interface TooltipPayloadItem {
  dataKey: string
  value: number
  payload?: AccountTypeTooltipPoint
}

export function AccountTypeTooltip({ active, payload, label, portfolioTotal }: {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: string
  portfolioTotal?: number
}) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  if (!active || !payload?.length) return null
  const point = payload[0]?.payload
  const cost = point?.total_cost_basis ?? payload.find((p) => p.dataKey === 'total_cost_basis')?.value ?? 0
  const gain = point?.unrealized_gain ?? payload.find((p) => p.dataKey === 'unrealized_gain')?.value ?? 0
  const total = point?.total_value ?? cost + gain
  const portfolioShare = portfolioTotal && portfolioTotal > 0 ? total / portfolioTotal * 100 : 0
  const gainPct = cost > 0 ? (gain / cost) * 100 : 0
  return (
    <TooltipBox>
      <div style={{ color: 'var(--tooltip-text)', marginBottom: 6, fontWeight: 600 }}>{point?.account_type ?? label}</div>
      <div style={{ color: 'var(--tooltip-label)', fontWeight: 600, marginBottom: 4 }}>{i18n.t('ui.portfoliochartsTooltips.total')} {formatMoney(total, { style: 'full' })}</div>
      {portfolioTotal != null && (
        <div style={{ color: 'var(--tooltip-dim)', marginBottom: 6 }}>{i18n.t('ui.portfoliochartsTooltips.portfolioShare')} {formatPercentage(portfolioShare)}</div>
      )}
      <div style={{ color: SEMANTIC_COLORS.costBasisText }}>{i18n.t('ui.portfoliochartsTooltips.costBasis')} {formatMoney(cost, { style: 'full' })}</div>
      <div style={{ color: SEMANTIC_COLORS.performancePositiveText }}>

        {i18n.t('ui.portfoliochartsTooltips.unrealized')} {formatMoney(gain, { style: 'full' })} ({formatPercentage(gainPct, { signed: true })})
      </div>
    </TooltipBox>
  )
}

export function TopPerformersTooltip({ active, payload, label }: NumericTooltipProps<TopPerformer>) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  if (!active || !payload?.length) return null
  const entry = payload[0]?.payload
  return (
    <TooltipBox>
      <div style={{ color: 'var(--tooltip-text)', marginBottom: 4, fontWeight: 600 }}>{entry?.name ?? label}</div>
      <div style={{ color: 'var(--tooltip-dim)', marginBottom: 6, fontSize: 11 }}>{entry?.account_type}</div>
      <div style={{ color: 'var(--tooltip-label)', marginBottom: 4 }}>{i18n.t('ui.portfoliochartsTooltips.value')} {formatMoney(entry?.value ?? 0, { style: 'full' })}</div>
      <div style={{ color: (entry?.pct ?? 0) >= 0 ? SEMANTIC_COLORS.performancePositiveText : SEMANTIC_COLORS.performanceNegativeText, fontWeight: 600 }}>

        {i18n.t('ui.portfoliochartsTooltips.unrealized')} {formatMoney(entry?.gain ?? 0, { style: 'full' })} ({formatPercentage(entry?.pct ?? 0, { signed: true })})
      </div>
    </TooltipBox>
  )
}

export function PassiveIncomeTooltip({ active, payload, label }: NumericTooltipProps<PassiveIncomePoint>) {
  const formatMoney = useFormatMoney()
  if (!active || !payload?.length) return null
  const div = tooltipValue(payload, 'dividends')
  const int = tooltipValue(payload, 'interest')
  return (
    <TooltipBox>
      <div style={{ color: 'var(--tooltip-text)', marginBottom: 6, fontWeight: 600 }}>{label}</div>
      <div style={{ color: 'var(--tooltip-label)', fontWeight: 600, marginBottom: 4 }}>{i18n.t('ui.portfoliochartsTooltips.total')} {formatMoney(div + int, { style: 'full' })}</div>
      {div > 0 && <div style={{ color: SEMANTIC_COLORS.passiveIncome }}>{i18n.t('ui.portfoliochartsTooltips.dividends')} {formatMoney(div, { style: 'full' })}</div>}
      {int > 0 && <div style={{ color: SEMANTIC_COLORS.passiveIncomeSecondary }}>{i18n.t('ui.portfoliochartsTooltips.interest')} {formatMoney(int, { style: 'full' })}</div>}
    </TooltipBox>
  )
}

interface AccountTypeHistoryTooltipProps extends NumericTooltipProps<Record<string, number | string>> {
  accountTypes: string[]
  percentageMode?: boolean
  typeCategories: Record<string, string>
}

function AccountTypeTooltipRow({ accountType, index, percentageMode, row, total, typeCategories }: { accountType: string; index: number; percentageMode: boolean; row: Record<string, number | string> | undefined; total: number; typeCategories: Record<string, string> }) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const rawValue = row?.[accountType]
  const value = typeof rawValue === 'number' ? rawValue : 0
  if (!value) return null
  const share = total > 0 ? formatPercentage(value / total * 100) : '—'
  return <div style={{ color: typeColor(accountType, index, typeCategories) }}>{accountType}: {formatMoney(value, { style: 'full' })}{percentageMode && ` · ${share}`}</div>
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
      <div style={{ color: 'var(--tooltip-text)', marginBottom: 6 }}>
        {formatDate(String(label), { style: 'longMonthYear' })}
      </div>
      <div style={{ color: 'var(--tooltip-label)', fontWeight: 600, marginBottom: 4 }}>{i18n.t('ui.portfoliochartsTooltips.total')} {formatMoney(total, { style: 'full' })}</div>
      {accountTypes.map((accountType, index) => <AccountTypeTooltipRow key={accountType} accountType={accountType} index={index} percentageMode={percentageMode} row={row} total={total} typeCategories={typeCategories} />)}
    </TooltipBox>
  )
}
