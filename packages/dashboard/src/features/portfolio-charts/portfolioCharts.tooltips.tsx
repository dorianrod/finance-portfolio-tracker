import { fmtFull } from '@/shared/format/money'
import { typeColor } from '@/shared/format/colors'
import { TooltipBox } from '@/shared/ui/TooltipBox'
import type { MonthlyOpsMap } from '@/hooks/useMonthlyOps'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function EvolutionTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cost = payload.find((p: any) => p.dataKey === 'total_cost_basis')?.value ?? 0
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gain = payload.find((p: any) => p.dataKey === 'unrealized_gain')?.value ?? 0
  return (
    <TooltipBox>
      <div style={{ color: 'var(--tooltip-text)', marginBottom: 6 }}>
        {new Date(label).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
      </div>
      <div style={{ color: 'var(--tooltip-label)', fontWeight: 600, marginBottom: 4 }}>Total: {fmtFull(cost + gain)}</div>
      <div style={{ color: '#60a5fa' }}>Purchase value: {fmtFull(cost)}</div>
      <div style={{ color: gain >= 0 ? '#4ade80' : '#f87171' }}>Unrealized P&L: {fmtFull(gain)}</div>
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
      <div style={{ color: '#60a5fa', marginBottom: 4 }}>Net savings: {fmtFull(savingsDelta)}</div>
      {deposits.length > 0 && (
        <div style={{ paddingLeft: 8, marginBottom: 4 }}>
          {deposits.map((op, i) => (
            <div key={i} style={{ color: '#93c5fd', fontSize: 11 }}>+ {fmtFull(op.total_amount)} — {op.account}</div>
          ))}
        </div>
      )}
      {withdrawals.length > 0 && (
        <div style={{ paddingLeft: 8, marginBottom: 4 }}>
          {withdrawals.map((op, i) => (
            <div key={i} style={{ color: '#fca5a5', fontSize: 11 }}>− {fmtFull(Math.abs(op.total_amount))} — {op.account}</div>
          ))}
        </div>
      )}
      <div style={{ borderTop: '1px solid var(--tooltip-border)', marginTop: 6, paddingTop: 6, color: perfDelta >= 0 ? '#4ade80' : '#f87171' }}>
        Market performance: {fmtFull(perfDelta)}
      </div>
      <div style={{ borderTop: '1px solid var(--tooltip-border)', marginTop: 6, paddingTop: 6, color: '#f59e0b' }}>
        Trailing 12-month savings: {fmtFull(rolling12m)}
      </div>
      <div style={{ marginTop: 4, color: rollingPerf12m >= 0 ? '#34d399' : '#f87171' }}>
        Trailing 12-month performance: {fmtFull(rollingPerf12m)}
      </div>
    </TooltipBox>
  )
}

interface TooltipPayloadItem { dataKey: string; value: number }

export function AccountTypeTooltip({ active, payload, label }: {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  const cost = payload.find((p) => p.dataKey === 'total_cost_basis')?.value ?? 0
  const gain = payload.find((p) => p.dataKey === 'unrealized_gain')?.value ?? 0
  const gainPct = cost > 0 ? (gain / cost) * 100 : 0
  return (
    <TooltipBox>
      <div style={{ color: 'var(--tooltip-text)', marginBottom: 6, fontWeight: 600 }}>{label}</div>
      <div style={{ color: 'var(--tooltip-label)', fontWeight: 600, marginBottom: 4 }}>Total: {fmtFull(cost + gain)}</div>
      <div style={{ color: '#60a5fa' }}>Cost basis: {fmtFull(cost)}</div>
      <div style={{ color: gain >= 0 ? '#4ade80' : '#f87171' }}>
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
      <div style={{ color: (entry?.pct ?? 0) >= 0 ? '#4ade80' : '#f87171', fontWeight: 600 }}>
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
      {div > 0 && <div style={{ color: '#a78bfa' }}>Dividends: {fmtFull(div)}</div>}
      {int > 0 && <div style={{ color: '#60a5fa' }}>Interest: {fmtFull(int)}</div>}
    </TooltipBox>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function AccountTypeHistoryTooltip({ active, payload, label, accountTypes, typeCategories }: any) {
  if (!active || !payload?.length) return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const total = payload.reduce((s: number, p: any) => s + (p.value ?? 0), 0)
  return (
    <TooltipBox>
      <div style={{ color: 'var(--tooltip-text)', marginBottom: 6 }}>
        {new Date(label).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
      </div>
      <div style={{ color: 'var(--tooltip-label)', fontWeight: 600, marginBottom: 4 }}>Total: {fmtFull(total)}</div>
      {(accountTypes as string[]).map((t, i) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const val = payload.find((p: any) => p.dataKey === t)?.value ?? 0
        if (!val) return null
        return (
          <div key={t} style={{ color: typeColor(t, i, typeCategories) }}>{t}: {fmtFull(val)}</div>
        )
      })}
    </TooltipBox>
  )
}
