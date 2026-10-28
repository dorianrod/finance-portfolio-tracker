import type { AccountTypePoint } from '@/domains/portfolio/features/wealth/types/accountTypePoint.type'

export function computeAccountTypeTooltipMetrics(
  payload: AccountTypeTooltipPayloadItem[],
  portfolio?: AccountTypePoint[],
) {
  const portfolioTotal = portfolio?.reduce(
    (sum, item) => sum + item.total_value,
    0,
  )
  const point = payload[0]?.payload
  const cost = resolveMetric(payload, 'total_cost_basis')
  const gain = resolveMetric(payload, 'unrealized_gain')
  const total = point?.total_value ?? cost + gain
  return {
    cost,
    gain,
    total,
    portfolioShare:
      portfolioTotal != null && portfolioTotal > 0
        ? (total / portfolioTotal) * 100
        : 0,
    gainPct: cost > 0 ? (gain / cost) * 100 : 0,
  }
}

export type AccountTypeTooltipPayloadItem = {
  dataKey: string
  value: number
  payload?: AccountTypePoint
}

function resolveMetric(
  payload: AccountTypeTooltipPayloadItem[],
  metric: 'total_cost_basis' | 'unrealized_gain',
): number {
  return (
    payload[0]?.payload?.[metric] ??
    payload.find((item) => item.dataKey === metric)?.value ??
    0
  )
}
