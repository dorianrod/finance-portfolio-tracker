import { fmtFull } from '@/shared/format/money'
import { formatPercentage } from '@/shared/format/percentage'
import { SEMANTIC_COLORS } from '@/shared/format/semanticColors'
import { typeColor } from '@/shared/format/colors'
import { TooltipBox } from '@/shared/ui/TooltipBox'
import type { MonthlyOpsMap } from '@/hooks/useMonthlyOps'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function EvolutionTooltip({ active, payload, label, percentageMode = false }: any) {
  if (!active || !payload?.length) return null
  const row = payload[0]?.payload
  const cost = row?.total_cost_basis ?? 0
  const gain = row?.unrealized_gain ?? 0
  const total = cost + gain
  const share = (value: number) => total === 0 ? '—' : `${formatPercentage(value / total * 100)}%`
  return (
    <TooltipBox>
      <div style={{ color: 'var(--tooltip-text)', marginBottom: 6 }}>
        {new Date(label).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
      </div>
      <div style={{ color: 'var(--tooltip-label)', fontWeight: 600, marginBottom: 4 }}>Total: {fmtFull(total)}</div>
      <div style={{ color: SEMANTIC_COLORS.costBasisText }}>Cost basis: {fmtFull(cost)}{percentageMode && ` · ${share(cost)}`}</div>
      <div style={{ color: gain >= 0 ? SEMANTIC_COLORS.performancePositiveText : SEMANTIC_COLORS.performanceNegativeText }}>Unrealized P&L: {fmtFull(gain)}{percentageMode && ` · ${share(gain)}`}</div>
    </TooltipBox>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function MonthlyTooltip({ active, payload, label, ops }: any) {
  if (!active || !payload?.length) return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const savingsDelta: number = payload.find((p: any) => p.dataKey === 'savings_delta')?.value ?? 0
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const perfDelta: number    = payload.find((p: any) => p.dataKey === 'perf_delta')?.value ?? 0
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rolling12m: number      = payload.find((p: any) => p.dataKey === 'rolling_12m')?.value ?? 0
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rollingPerf12m: number  = payload.find((p: any) => p.dataKey === 'rolling_perf_12m')?.value ?? 0
  const month = String(label).slice(0, 7)
  const monthOps: ReturnType<MonthlyOpsMap['get']> = (ops as MonthlyOpsMap).get(month) ?? []
  const deposits    = monthOps.filter((o) => o.operation_type === 'DEPOSIT' && o.total_amount > 0)
  const withdrawals = monthOps.filter((o) => o.operation_type === 'WITHDRAWAL' || (o.operation_type === 'DEPOSIT' && o.total_amount < 0))
  return (
    <TooltipBox padding="10px 14px" maxWidth={280}>
      <div style={{ color: 'var(--tooltip-text)', marginBottom: 8, fontWeight: 600 }}>
        {new Date(label).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
      </div>
      <div style={{ color: SEMANTIC_COLORS.netContributionsText, marginBottom: 4 }}>Net contributions: {fmtFull(savingsDelta)}</div>
      {deposits.length > 0 && (
        <div style={{ paddingLeft: 8, marginBottom: 4 }}>
          {deposits.map((op, i) => (
            <div key={i} style={{ color: SEMANTIC_COLORS.netContributionsDetail, fontSize: 11 }}>+ {fmtFull(op.total_amount)} — {op.account}</div>
          ))}
        </div>
      )}
      {withdrawals.length > 0 && (
        <div style={{ paddingLeft: 8, marginBottom: 4 }}>
          {withdrawals.map((op, i) => (
            <div key={i} style={{ color: SEMANTIC_COLORS.outflowText, fontSize: 11 }}>− {fmtFull(Math.abs(op.total_amount))} — {op.account}</div>
          ))}
        </div>
      )}
      <div style={{ borderTop: '1px solid var(--tooltip-border)', marginTop: 6, paddingTop: 6, color: perfDelta >= 0 ? SEMANTIC_COLORS.performancePositiveText : SEMANTIC_COLORS.performanceNegativeText }}>
        Market performance: {fmtFull(perfDelta)}
      </div>
      <div style={{ borderTop: '1px solid var(--tooltip-border)', marginTop: 6, paddingTop: 6, color: SEMANTIC_COLORS.netContributionsText }}>
        Trailing 12-month net contributions: {fmtFull(rolling12m)}
      </div>
      <div style={{ marginTop: 4, color: rollingPerf12m >= 0 ? SEMANTIC_COLORS.performancePositiveText : SEMANTIC_COLORS.performanceNegativeText }}>
        Trailing 12-month performance: {fmtFull(rollingPerf12m)}
      </div>
    </TooltipBox>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function TriTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tri1y: number | null = payload.find((point: any) => point.dataKey === 'tri_rolling_1y')?.value ?? null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tri1yBackfill: number | null = payload.find((point: any) => point.dataKey === 'tri_rolling_1y_backfill')?.value ?? null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tri3y: number | null = payload.find((point: any) => point.dataKey === 'tri_rolling_3y')?.value ?? null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tri3yBackfill: number | null = payload.find((point: any) => point.dataKey === 'tri_rolling_3y_backfill')?.value ?? null
  const showTri1y = tri1y !== null || tri1yBackfill !== null
  const showTri3y = tri3y !== null || tri3yBackfill !== null
  return (
    <TooltipBox>
      <div style={{ color: 'var(--tooltip-text)', marginBottom: 6 }}>
        {new Date(label).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
      </div>
      {showTri1y && (
        <div style={{ color: SEMANTIC_COLORS.totalChange, fontWeight: 600 }}>
          IRR (1y): {tri1y === null ? 'Not yet available' : `${tri1y >= 0 ? '+' : ''}${tri1y.toFixed(2)}%`}
        </div>
      )}
      {showTri3y && (
        <div style={{ color: SEMANTIC_COLORS.returnRate, fontWeight: 600, marginTop: showTri1y ? 4 : 0 }}>
          IRR (3y): {tri3y === null ? 'Not yet available' : `${tri3y >= 0 ? '+' : ''}${tri3y.toFixed(2)}%`}
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
      <div style={{ color: 'var(--tooltip-label)', fontWeight: 600, marginBottom: 4 }}>Total: {fmtFull(total)}</div>
      {portfolioTotal != null && (
        <div style={{ color: 'var(--tooltip-dim)', marginBottom: 6 }}>Portfolio share: {portfolioShare.toFixed(1)}%</div>
      )}
      <div style={{ color: SEMANTIC_COLORS.costBasisText }}>Cost basis: {fmtFull(cost)}</div>
      <div style={{ color: SEMANTIC_COLORS.performancePositiveText }}>
        Unrealized: {fmtFull(gain)} ({gain >= 0 ? '+' : ''}{gainPct.toFixed(1)}%)
      </div>
    </TooltipBox>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function TopPerformersTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const entry = payload[0]?.payload
  return (
    <TooltipBox>
      <div style={{ color: 'var(--tooltip-text)', marginBottom: 4, fontWeight: 600 }}>{entry?.name ?? label}</div>
      <div style={{ color: 'var(--tooltip-dim)', marginBottom: 6, fontSize: 11 }}>{entry?.account_type}</div>
      <div style={{ color: 'var(--tooltip-label)', marginBottom: 4 }}>Value: {fmtFull(entry?.value ?? 0)}</div>
      <div style={{ color: (entry?.pct ?? 0) >= 0 ? SEMANTIC_COLORS.performancePositiveText : SEMANTIC_COLORS.performanceNegativeText, fontWeight: 600 }}>
        Unrealized: {fmtFull(entry?.gain ?? 0)} ({(entry?.pct ?? 0) >= 0 ? '+' : ''}{(entry?.pct ?? 0).toFixed(1)}%)
      </div>
    </TooltipBox>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function PassiveIncomeTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const div = payload.find((p: any) => p.dataKey === 'dividends')?.value ?? 0
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const int = payload.find((p: any) => p.dataKey === 'interest')?.value ?? 0
  return (
    <TooltipBox>
      <div style={{ color: 'var(--tooltip-text)', marginBottom: 6, fontWeight: 600 }}>{label}</div>
      <div style={{ color: 'var(--tooltip-label)', fontWeight: 600, marginBottom: 4 }}>Total: {fmtFull(div + int)}</div>
      {div > 0 && <div style={{ color: SEMANTIC_COLORS.passiveIncome }}>Dividends: {fmtFull(div)}</div>}
      {int > 0 && <div style={{ color: SEMANTIC_COLORS.passiveIncomeSecondary }}>Interest: {fmtFull(int)}</div>}
    </TooltipBox>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function AccountTypeHistoryTooltip({ active, payload, label, accountTypes, typeCategories, percentageMode = false }: any) {
  if (!active || !payload?.length) return null
  const row = payload[0]?.payload
  const total = (accountTypes as string[]).reduce((sum, accountType) => {
    const value = row?.[accountType]
    return sum + (typeof value === 'number' ? value : 0)
  }, 0)
  return (
    <TooltipBox>
      <div style={{ color: 'var(--tooltip-text)', marginBottom: 6 }}>
        {new Date(label).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
      </div>
      <div style={{ color: 'var(--tooltip-label)', fontWeight: 600, marginBottom: 4 }}>Total: {fmtFull(total)}</div>
      {(accountTypes as string[]).map((t, i) => {
        const value = row?.[t]
        const val = typeof value === 'number' ? value : 0
        if (!val) return null
        const share = total > 0 ? `${formatPercentage(val / total * 100)}%` : '—'
        return (
          <div key={t} style={{ color: typeColor(t, i, typeCategories) }}>{t}: {fmtFull(val)}{percentageMode && ` · ${share}`}</div>
        )
      })}
    </TooltipBox>
  )
}
