import type { RawOperation, RawPosition, PositionRow, GroupRow, OperationRow } from '@/types/domain'
import { CATEGORY_ORDER, CASH_SUFFIX } from '@/shared/constants/accountCategories'
import { parseNum } from '@/shared/csv/parseNum'

function assetKey(op: RawOperation): string {
  return op.isin || op.ticker || op.name
}

export function buildAccountLabels(accountRows: { account: string; label: string }[]): Record<string, string> {
  const labels: Record<string, string> = {}
  for (const r of accountRows) {
    if (r.account && r.label) labels[r.account] = r.label
  }
  return labels
}

export function buildPositionRows(ops: RawOperation[], rawPositions: RawPosition[]): PositionRow[] {
  // Build map of latest positions (any account, max snapshot_date)
  const latestDateStr = rawPositions
    .reduce((max, p) => (p.snapshot_date > max ? p.snapshot_date : max), '')

  const latestByKey = new Map<string, RawPosition>()
  rawPositions
    .filter((p) => p.snapshot_date === latestDateStr)
    .forEach((p) => {
      const key = p.isin || p.ticker || p.name
      // If same ISIN in multiple accounts, keep the row with highest total_value
      const existing = latestByKey.get(key)
      if (!existing || parseFloat(p.total_value) > parseFloat(existing.total_value)) {
        latestByKey.set(key, p)
      }
    })

  // Group operations by asset, excluding pure cash ops (DEPOSIT/WITHDRAWAL with no isin/ticker/name)
  const byAsset = new Map<string, RawOperation[]>()
  for (const op of ops) {
    const key = assetKey(op)
    if (!key) continue
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
      (o) => o.operation_type === 'BUY' || o.operation_type === 'SELL'
    )
    const depositOps = assetOps.filter(
      (o) => o.operation_type === 'DEPOSIT' || o.operation_type === 'WITHDRAWAL'
    )

    const totalDividends = lp
      ? (parseNum(lp.total_dividends) ?? 0)
      : dividendOps.reduce((sum, o) => sum + (parseNum(o.total_amount) ?? 0), 0)
    const totalInterest = lp
      ? (parseNum(lp.total_interest) ?? 0)
      : interestOps.reduce((sum, o) => sum + (parseNum(o.total_amount) ?? 0), 0)

    const totalDeposits = depositOps
      .filter((o) => (parseNum(o.total_amount) ?? 0) > 0)
      .reduce((sum, o) => sum + (parseNum(o.total_amount) ?? 0), 0)
    const totalWithdrawals = depositOps
      .filter((o) => (parseNum(o.total_amount) ?? 0) < 0)
      .reduce((sum, o) => sum + Math.abs(parseNum(o.total_amount) ?? 0), 0)

    const totalInvested = tradeOps
      .filter((o) => o.operation_type === 'BUY')
      .reduce((sum, o) => sum + Math.abs(parseNum(o.total_amount) ?? 0), 0)

    const totalSold = tradeOps
      .filter((o) => o.operation_type === 'SELL')
      .reduce((sum, o) => sum + Math.abs(parseNum(o.total_amount) ?? 0), 0)

    const realizedPnl = lp
      ? (parseNum(lp.realized_gain) ?? 0)
      : tradeOps
          .filter((o) => o.operation_type === 'SELL')
          .reduce((sum, o) => sum + (parseNum(o.realized_gain) ?? 0), 0)

    // Annualized dividends: total / years of holding
    const dates = assetOps
      .map((o) => new Date(o.date).getTime())
      .filter((d) => !isNaN(d))
    const minDate = Math.min(...dates)
    const maxDate = Math.max(...dates)
    const yearsHeld = Math.max((maxDate - minDate) / (1000 * 60 * 60 * 24 * 365.25), 1 / 12)
    const annualizedDividends = dividendOps.length > 0 ? totalDividends / yearsHeld : 0

    const subRows: GroupRow[] = []

    if (dividendOps.length > 0) {
      const divOpRows: OperationRow[] = dividendOps
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((o, i) => ({
          kind: 'operation',
          id: `${key}-div-${i}`,
          date: o.date.slice(0, 10),
          account: o.account,
          operation_type: o.operation_type,
          quantity: parseNum(o.quantity),
          price_per_unit: parseNum(o.price_per_unit),
          total_amount: parseNum(o.total_amount) ?? 0,
          realized_gain: parseNum(o.realized_gain),
        }))

      subRows.push({
        kind: 'group',
        id: `${key}-dividends`,
        label: 'Dividends',
        total_dividends: totalDividends,
        dividend_count: dividendOps.length,
        annualized_dividends: annualizedDividends,
        subRows: divOpRows,
      })
    }

    if (interestOps.length > 0) {
      const intOpRows: OperationRow[] = interestOps
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((o, i) => ({
          kind: 'operation',
          id: `${key}-int-${i}`,
          date: o.date.slice(0, 10),
          account: o.account,
          operation_type: o.operation_type,
          quantity: parseNum(o.quantity),
          price_per_unit: parseNum(o.price_per_unit),
          total_amount: parseNum(o.total_amount) ?? 0,
          realized_gain: parseNum(o.realized_gain),
        }))

      subRows.push({
        kind: 'group',
        id: `${key}-interest`,
        label: 'Interest',
        total_interest: totalInterest,
        interest_count: interestOps.length,
        subRows: intOpRows,
      })
    }

    if (depositOps.length > 0) {
      const depOpRows: OperationRow[] = depositOps
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((o, i) => ({
          kind: 'operation',
          id: `${key}-dep-${i}`,
          date: o.date.slice(0, 10),
          account: o.account,
          operation_type: o.operation_type,
          quantity: parseNum(o.quantity),
          price_per_unit: parseNum(o.price_per_unit),
          total_amount: parseNum(o.total_amount) ?? 0,
          realized_gain: parseNum(o.realized_gain),
        }))

      subRows.push({
        kind: 'group',
        id: `${key}-deposits`,
        label: 'Deposits / Withdrawals',
        deposit_total: totalDeposits,
        withdrawal_total: totalWithdrawals,
        subRows: depOpRows,
      })
    }

    if (tradeOps.length > 0) {
      const tradeOpRows: OperationRow[] = tradeOps
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((o, i) => ({
          kind: 'operation',
          id: `${key}-trade-${i}`,
          date: o.date.slice(0, 10),
          account: o.account,
          operation_type: o.operation_type,
          quantity: parseNum(o.quantity),
          price_per_unit: parseNum(o.price_per_unit),
          total_amount: parseNum(o.total_amount) ?? 0,
          realized_gain: parseNum(o.realized_gain),
        }))

      subRows.push({
        kind: 'group',
        id: `${key}-trades`,
        label: 'Buys / Sells',
        total_invested: totalInvested,
        total_sold: totalSold,
        realized_pnl: realizedPnl,
        trade_count: tradeOps.length,
        avg_buy_price: lp ? parseNum(lp.avg_buy_price) ?? undefined : undefined,
        subRows: tradeOpRows,
      })
    }

    // Derive account: from latest position snapshot, or from most recent operation
    const account = lp?.account || assetOps[assetOps.length - 1].account
    const rawType = lp?.account_type || undefined
    const account_category = lp?.account_category || undefined
    const isCashPosition = account_category === 'brokerage' && !lp?.isin && !lp?.ticker
    const account_type = isCashPosition ? `${rawType} – Cash` : rawType

    rows.push({
      kind: 'position',
      id: key,
      name: lp?.name || first.name || first.ticker || key,
      ticker: lp?.ticker || first.ticker || '',
      isin: lp?.isin || first.isin || '',
      account,
      account_type,
      account_category,
      status: lp ? 'active' : 'closed',
      operationTypes: new Set(assetOps.map((o) => o.operation_type)),
      total_value: lp ? parseNum(lp.total_value) : null,
      unrealized_gain: lp ? parseNum(lp.unrealized_gain) : null,
      unrealized_gain_net: lp ? parseNum(lp.unrealized_gain_net) : null,
      total_dividends_net: lp ? parseNum(lp.total_dividends_net) : null,
      total_interest_net: lp ? parseNum(lp.total_interest_net) : null,
      unrealized_gain_pct: lp ? parseNum(lp.unrealized_gain_pct) : null,
      realized_gain: realizedPnl,
      realized_gain_net: lp ? parseNum(lp.realized_gain_net) : null,
      tax_rate: lp ? parseNum(lp.tax_rate) : null,
      total_dividends: totalDividends,
      total_interest: totalInterest,
      total_realized_return: realizedPnl + totalDividends + totalInterest,
      total_invested: totalInvested,
      total_return_pct: lp ? parseNum(lp.total_return_pct) : null,
      xirr: lp ? parseNum(lp.xirr) : null,
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
  rows.sort((a, b) => {
    if (a.status !== b.status) return a.status === 'active' ? -1 : 1
    const ta = categoryRank(a)
    const tb = categoryRank(b)
    if (ta !== tb) return ta - tb
    return (b.total_value ?? 0) - (a.total_value ?? 0)
  })

  return rows
}
