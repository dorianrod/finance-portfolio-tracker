import {
  CASH_SUFFIX,
  CATEGORY_ORDER,
} from '@/domains/portfolio/shared/constants/accountCategories'
import { resolveAssetName } from '@/domains/portfolio/shared/helpers/mappers/resolveAssetName'
import type {
  GroupRow,
  OperationRow,
  PositionRow,
} from '@/domains/portfolio/shared/types/positionRow.type'
import type { RawOperation } from '@/domains/portfolio/shared/types/rawOperation.type'
import type { RawPosition } from '@/domains/portfolio/shared/types/rawPosition.type'
import i18n from '@/i18n/i18n'

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

export function buildAccountLabels(
  accountRows: { account: string; label: string }[],
): Record<string, string> {
  const labels: Record<string, string> = {}
  for (const r of accountRows) {
    if (r.account && r.label) labels[r.account] = r.label
  }
  return labels
}

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

  // Build map of positions at the latest complete snapshot on or before asOfDate.
  const latestTimestamp = eligiblePositions.reduce(
    (max, p) => Math.max(p.snapshot_date.getTime(), max),
    Number.NEGATIVE_INFINITY,
  )

  const latestByKey = new Map<string, RawPosition>()
  eligiblePositions
    .filter((p) => p.snapshot_date.getTime() === latestTimestamp)
    .forEach((p) => {
      const key = positionKey(p.isin || p.ticker || p.name, p.account)
      // Defensive: keep the row with highest total_value on a key clash
      const existing = latestByKey.get(key)
      if (!existing || (p.total_value ?? 0) > (existing.total_value ?? 0)) {
        latestByKey.set(key, p)
      }
    })

  // Group operations by (asset, account), excluding pure cash ops
  // (DEPOSIT/WITHDRAWAL with no isin/ticker/name)
  const byAsset = new Map<string, RawOperation[]>()
  for (const op of eligibleOperations) {
    const asset = assetKey(op)
    if (!asset) continue
    const key = positionKey(asset, op.account)
    if (!byAsset.has(key)) byAsset.set(key, [])
    byAsset.get(key)!.push(op)
  }

  const rows: PositionRow[] = []

  for (const [key, assetOps] of byAsset) {
    const first = assetOps[0]
    const lp = latestByKey.get(key)

    const dividendOps = assetOps.filter((o) => o.operation_type === 'DIVIDEND')
    const interestOps = assetOps.filter((o) => o.operation_type === 'INTEREST')
    const tradeOps = assetOps.filter(
      (o) => o.operation_type === 'BUY' || o.operation_type === 'SELL',
    )
    const depositOps = assetOps.filter(
      (o) =>
        o.operation_type === 'DEPOSIT' || o.operation_type === 'WITHDRAWAL',
    )

    const totalDividends = lp
      ? (lp.total_dividends ?? 0)
      : dividendOps.reduce((sum, o) => sum + o.total_amount, 0)
    const totalInterest = lp
      ? (lp.total_interest ?? 0)
      : interestOps.reduce((sum, o) => sum + o.total_amount, 0)

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

    const realizedPnl = lp
      ? (lp.realized_gain ?? 0)
      : tradeOps
          .filter((o) => o.operation_type === 'SELL')
          .reduce((sum, o) => sum + o.realized_gain, 0)

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
      const divOpRows: OperationRow[] = dividendOps
        .toSorted((a, b) => b.date.getTime() - a.date.getTime())
        .map((o, i) => ({
          kind: 'operation',
          id: `${key}-div-${i}`,
          date: o.date,
          account: o.account,
          operation_type: o.operation_type,
          quantity: o.quantity,
          price_per_unit: o.price_per_unit,
          total_amount: o.total_amount,
          realized_gain: o.realized_gain,
        }))

      subRows.push({
        kind: 'group',
        id: `${key}-dividends`,
        groupType: 'dividends',
        label: i18n.t('ui.buildpositionhierarchyTs.dividends'),
        total_dividends: totalDividends,
        dividend_count: dividendOps.length,
        annualized_dividends: annualizedDividends,
        subRows: divOpRows,
      })
    }

    if (interestOps.length > 0) {
      const intOpRows: OperationRow[] = interestOps
        .toSorted((a, b) => b.date.getTime() - a.date.getTime())
        .map((o, i) => ({
          kind: 'operation',
          id: `${key}-int-${i}`,
          date: o.date,
          account: o.account,
          operation_type: o.operation_type,
          quantity: o.quantity,
          price_per_unit: o.price_per_unit,
          total_amount: o.total_amount,
          realized_gain: o.realized_gain,
        }))

      subRows.push({
        kind: 'group',
        id: `${key}-interest`,
        groupType: 'interest',
        label: i18n.t('ui.buildpositionhierarchyTs.interest'),
        total_interest: totalInterest,
        interest_count: interestOps.length,
        subRows: intOpRows,
      })
    }

    if (depositOps.length > 0) {
      const depOpRows: OperationRow[] = depositOps
        .toSorted((a, b) => b.date.getTime() - a.date.getTime())
        .map((o, i) => ({
          kind: 'operation',
          id: `${key}-dep-${i}`,
          date: o.date,
          account: o.account,
          operation_type: o.operation_type,
          quantity: o.quantity,
          price_per_unit: o.price_per_unit,
          total_amount: o.total_amount,
          realized_gain: o.realized_gain,
        }))

      subRows.push({
        kind: 'group',
        id: `${key}-deposits`,
        groupType: 'cash',
        label: i18n.t('ui.buildpositionhierarchyTs.depositsWithdrawals'),
        deposit_total: totalDeposits,
        withdrawal_total: totalWithdrawals,
        subRows: depOpRows,
      })
    }

    if (tradeOps.length > 0) {
      const tradeOpRows: OperationRow[] = tradeOps
        .toSorted((a, b) => b.date.getTime() - a.date.getTime())
        .map((o, i) => ({
          kind: 'operation',
          id: `${key}-trade-${i}`,
          date: o.date,
          account: o.account,
          operation_type: o.operation_type,
          quantity: o.quantity,
          price_per_unit: o.price_per_unit,
          total_amount: o.total_amount,
          realized_gain: o.realized_gain,
        }))

      subRows.push({
        kind: 'group',
        id: `${key}-trades`,
        groupType: 'trades',
        label: i18n.t('ui.buildpositionhierarchyTs.buysSells'),
        total_invested: totalInvested,
        total_sold: totalSold,
        realized_pnl: realizedPnl,
        trade_count: tradeOps.length,
        avg_buy_price: lp?.avg_buy_price ?? undefined,
        subRows: tradeOpRows,
      })
    }

    // Derive account: from latest position snapshot, or from most recent operation
    const account = lp?.account || assetOps[assetOps.length - 1].account
    const rawType = lp?.account_type || undefined
    const account_category = lp?.account_category || undefined
    const account_type = rawType

    rows.push({
      kind: 'position',
      id: key,
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
      operationTypes: new Set(assetOps.map((o) => o.operation_type)),
      quantity: lp ? lp.quantity : null,
      last_price: lp ? lp.last_price : null,
      total_value: lp ? lp.total_value : null,
      unrealized_gain: lp ? lp.unrealized_gain : null,
      unrealized_gain_net: lp ? lp.unrealized_gain_net : null,
      total_dividends_net: lp ? lp.total_dividends_net : null,
      total_interest_net: lp ? lp.total_interest_net : null,
      unrealized_gain_pct: lp ? lp.unrealized_gain_pct : null,
      realized_gain: realizedPnl,
      realized_gain_net: lp ? lp.realized_gain_net : null,
      tax_rate: lp ? lp.tax_rate : null,
      total_dividends: totalDividends,
      total_interest: totalInterest,
      total_realized_return: realizedPnl + totalDividends + totalInterest,
      total_invested: totalInvested,
      total_return_pct: lp ? lp.total_return_pct : null,
      xirr: lp ? lp.xirr : null,
      xirr_rolling_3y: lp ? lp.xirr_rolling_3y : null,
      xirr_rolling_period_years: lp ? lp.xirr_rolling_period_years : null,
      subRows,
    })
  }

  // Sort: active first, then by account_category group order (real
  // brokerage positions before their synthetic cash row), then by
  // total_value desc
  function categoryRank(row: PositionRow): number {
    const base = CATEGORY_ORDER[row.account_category ?? ''] ?? 99
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
