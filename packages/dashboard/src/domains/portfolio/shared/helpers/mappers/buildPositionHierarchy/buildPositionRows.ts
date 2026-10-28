// eslint-disable-next-line local/review-shared-feature-sharing -- reviewed: 2026-10-27; The shell supplies this common position snapshot and account scope to holdings, wealth, performance and quality. See SHARED_OWNERSHIP_AUDIT.md.
import { CASH_SUFFIX } from '@/domains/portfolio/shared/constants/accountCategories/cashSuffix'
import { CATEGORY_ORDER } from '@/domains/portfolio/shared/constants/accountCategories/categoryOrder'
import { resolveAssetName } from '@/domains/portfolio/shared/helpers/mappers/resolveAssetName'
import type {
  GroupRow,
  OperationRow,
  PositionRow,
} from '@/domains/portfolio/shared/types/positionRow.type'
import type { RawOperation } from '@/domains/portfolio/shared/types/rawOperation.type'
import type { RawPosition } from '@/domains/portfolio/shared/types/rawPosition.type'

export function buildPositionRows(
  ops: RawOperation[],
  rawPositions: RawPosition[],
  asOfDate?: Date,
): PositionRow[] {
  const eligiblePositions = asOfDate
    ? rawPositions.filter((position) => position.snapshot_date <= asOfDate)
    : rawPositions
  const eligibleOperations = asOfDate
    ? ops.filter((operation) => operation.date <= asOfDate)
    : ops

  const latestByKey = latestPositionsByKey(eligiblePositions)

  // Group operations by (asset, account), excluding pure cash ops
  // (DEPOSIT/WITHDRAWAL with no isin/ticker/name)
  const byAsset = new Map<string, RawOperation[]>()
  for (const op of eligibleOperations) {
    const asset = assetKey(op)
    if (!asset) continue
    const key = positionKey(asset, op.account)
    const operations = byAsset.get(key) ?? []
    operations.push(op)
    byAsset.set(key, operations)
  }

  const rows: PositionRow[] = []

  for (const [key, assetOps] of byAsset) {
    rows.push(buildAssetPositionRow(key, assetOps, latestByKey.get(key)))
  }

  // Sort: active first, then by account_category group order (real
  // brokerage positions before their synthetic cash row), then by
  // total_value desc
  function categoryRank(row: PositionRow): number {
    const base = CATEGORY_ORDER.get(row.account_category ?? '') ?? 99
    const isCash = (row.account_type ?? '').endsWith(CASH_SUFFIX)
    return base * 2 + (isCash ? 1 : 0)
  }
  return rows.toSorted((a, b) => {
    if (a.status !== b.status) return a.status === 'active' ? -1 : 1
    const ta = categoryRank(a)
    const tb = categoryRank(b)
    if (ta !== tb) return ta - tb
    return (b.total_value ?? 0) - (a.total_value ?? 0)
  })
}

function assetKey(op: RawOperation): string {
  return op.isin || op.ticker || op.name
}

// Same asset held in several accounts (e.g. the same ETF bought in both a
// PEA and a CTO) gets one row per account, not one merged row: a merged row
// has no single account/account_type to show, which drops it out of
// per-account filters and mislabels it as "Other" in type breakdowns.
function positionKey(asset: string, account: string): string {
  return `${asset}|${account}`
}

function buildOperationRows(
  key: string,
  suffix: string,
  operations: RawOperation[],
): OperationRow[] {
  return operations
    .toSorted((a, b) => b.date.getTime() - a.date.getTime())
    .map((o, i) => ({
      kind: 'operation',
      id: `${key}-${suffix}-${i}`,
      date: o.date,
      account: o.account,
      operation_type: o.operation_type,
      quantity: o.quantity,
      price_per_unit: o.price_per_unit,
      total_amount: o.total_amount,
      realized_gain: o.realized_gain,
    }))
}

function snapshotPositionValues(
  position: RawPosition | undefined,
): Pick<
  PositionRow,
  | 'quantity'
  | 'last_price'
  | 'total_value'
  | 'unrealized_gain'
  | 'unrealized_gain_net'
  | 'total_dividends_net'
  | 'total_interest_net'
  | 'unrealized_gain_pct'
  | 'realized_gain_net'
  | 'tax_rate'
  | 'total_return_pct'
  | 'xirr'
  | 'xirr_rolling_3y'
  | 'xirr_rolling_period_years'
> {
  if (position)
    return {
      quantity: position.quantity,
      last_price: position.last_price,
      total_value: position.total_value,
      unrealized_gain: position.unrealized_gain,
      unrealized_gain_net: position.unrealized_gain_net,
      total_dividends_net: position.total_dividends_net,
      total_interest_net: position.total_interest_net,
      unrealized_gain_pct: position.unrealized_gain_pct,
      realized_gain_net: position.realized_gain_net,
      tax_rate: position.tax_rate,
      total_return_pct: position.total_return_pct,
      xirr: position.xirr,
      xirr_rolling_3y: position.xirr_rolling_3y,
      xirr_rolling_period_years: position.xirr_rolling_period_years,
    }
  return {
    quantity: null,
    last_price: null,
    total_value: null,
    unrealized_gain: null,
    unrealized_gain_net: null,
    total_dividends_net: null,
    total_interest_net: null,
    unrealized_gain_pct: null,
    realized_gain_net: null,
    tax_rate: null,
    total_return_pct: null,
    xirr: null,
    xirr_rolling_3y: null,
    xirr_rolling_period_years: null,
  }
}

function latestPositionsByKey(positions: RawPosition[]) {
  // Build map of positions at the latest complete snapshot on or before asOfDate.
  const latestTimestamp = positions.reduce(
    (max, p) => Math.max(p.snapshot_date.getTime(), max),
    Number.NEGATIVE_INFINITY,
  )

  const latestByKey = new Map<string, RawPosition>()
  positions
    .filter((p) => p.snapshot_date.getTime() === latestTimestamp)
    .forEach((p) => {
      const key = positionKey(p.isin || p.ticker || p.name, p.account)
      // Defensive: keep the row with highest total_value on a key clash
      const existing = latestByKey.get(key)
      if (!existing || (p.total_value ?? 0) > (existing.total_value ?? 0)) {
        latestByKey.set(key, p)
      }
    })

  return latestByKey
}

function buildAssetPositionRow(
  key: string,
  assetOps: RawOperation[],
  lp: RawPosition | undefined,
): PositionRow {
  const dividendOps = assetOps.filter((o) => o.operation_type === 'DIVIDEND')
  const interestOps = assetOps.filter((o) => o.operation_type === 'INTEREST')
  const tradeOps = assetOps.filter(
    (o) => o.operation_type === 'BUY' || o.operation_type === 'SELL',
  )
  const depositOps = assetOps.filter(
    (o) => o.operation_type === 'DEPOSIT' || o.operation_type === 'WITHDRAWAL',
  )

  const { totalDividends, totalInterest, realizedPnl } =
    realizedPositionReturns(lp, dividendOps, interestOps, tradeOps)
  const totalDeposits = depositOps
    .filter((o) => o.total_amount > 0)
    .reduce((sum, o) => sum + o.total_amount, 0)
  const totalWithdrawals = depositOps
    .filter((o) => o.total_amount < 0)
    .reduce((sum, o) => sum + Math.abs(o.total_amount), 0)

  const totalInvested = tradeOps
    .filter((o) => o.operation_type === 'BUY')
    .reduce((sum, o) => sum + Math.abs(o.total_amount), 0)

  const totalSold = tradeOps
    .filter((o) => o.operation_type === 'SELL')
    .reduce((sum, o) => sum + Math.abs(o.total_amount), 0)

  // Annualized dividends: total / years of holding
  const dates = assetOps.map((o) => o.date.getTime()).filter((d) => !isNaN(d))
  const minDate = Math.min(...dates)
  const maxDate = Math.max(...dates)
  const yearsHeld = Math.max(
    (maxDate - minDate) / (1000 * 60 * 60 * 24 * 365.25),
    1 / 12,
  )
  const annualizedDividends =
    dividendOps.length > 0 ? totalDividends / yearsHeld : 0

  const subRows: GroupRow[] = []

  if (dividendOps.length > 0) {
    const divOpRows = buildOperationRows(key, 'div', dividendOps)

    subRows.push({
      kind: 'group',
      id: `${key}-dividends`,
      groupType: 'dividends',
      total_dividends: totalDividends,
      dividend_count: dividendOps.length,
      annualized_dividends: annualizedDividends,
      subRows: divOpRows,
    })
  }

  if (interestOps.length > 0) {
    const intOpRows = buildOperationRows(key, 'int', interestOps)

    subRows.push({
      kind: 'group',
      id: `${key}-interest`,
      groupType: 'interest',
      total_interest: totalInterest,
      interest_count: interestOps.length,
      subRows: intOpRows,
    })
  }

  if (depositOps.length > 0) {
    const depOpRows = buildOperationRows(key, 'dep', depositOps)

    subRows.push({
      kind: 'group',
      id: `${key}-deposits`,
      groupType: 'cash',
      deposit_total: totalDeposits,
      withdrawal_total: totalWithdrawals,
      subRows: depOpRows,
    })
  }

  if (tradeOps.length > 0) {
    const tradeOpRows = buildOperationRows(key, 'trade', tradeOps)

    subRows.push({
      kind: 'group',
      id: `${key}-trades`,
      groupType: 'trades',
      total_invested: totalInvested,
      total_sold: totalSold,
      realized_pnl: realizedPnl,
      trade_count: tradeOps.length,
      avg_buy_price: lp?.avg_buy_price ?? undefined,
      subRows: tradeOpRows,
    })
  }

  return {
    kind: 'position',
    id: key,
    ...resolvePositionIdentity(key, assetOps, lp),
    ...snapshotPositionValues(lp),
    operationTypes: new Set(assetOps.map((o) => o.operation_type)),
    realized_gain: realizedPnl,
    total_dividends: totalDividends,
    total_interest: totalInterest,
    total_realized_return: realizedPnl + totalDividends + totalInterest,
    total_invested: totalInvested,
    subRows,
  }
}

// eslint-disable-next-line complexity -- reviewed: 2026-10-27; Latest-snapshot and operation fallbacks must resolve one consistent asset identity and active/closed status.
function resolvePositionIdentity(
  key: string,
  assetOps: RawOperation[],
  lp: RawPosition | undefined,
): Pick<
  PositionRow,
  | 'name'
  | 'ticker'
  | 'isin'
  | 'account'
  | 'account_type'
  | 'account_category'
  | 'status'
> {
  const first = assetOps[0]
  // Derive account: from latest position snapshot, or from most recent operation
  const account = lp?.account || assetOps[assetOps.length - 1].account
  const rawType = lp?.account_type || undefined
  const account_category = lp?.account_category || undefined
  const account_type = rawType

  return {
    name: resolveAssetName(
      {
        name: lp?.name || first.name,
        ticker: lp?.ticker || first.ticker,
      },
      key,
    ),
    ticker: lp?.ticker || first.ticker || '',
    isin: lp?.isin || first.isin || '',
    account,
    account_type,
    account_category,
    status: lp ? 'active' : 'closed',
  }
}

function realizedPositionReturns(
  lp: RawPosition | undefined,
  dividendOps: RawOperation[],
  interestOps: RawOperation[],
  tradeOps: RawOperation[],
) {
  const totalDividends = lp
    ? (lp.total_dividends ?? 0)
    : dividendOps.reduce((sum, o) => sum + o.total_amount, 0)
  const totalInterest = lp
    ? (lp.total_interest ?? 0)
    : interestOps.reduce((sum, o) => sum + o.total_amount, 0)

  const realizedPnl = lp
    ? (lp.realized_gain ?? 0)
    : tradeOps
        .filter((o) => o.operation_type === 'SELL')
        .reduce((sum, o) => sum + o.realized_gain, 0)

  return { totalDividends, totalInterest, realizedPnl }
}
