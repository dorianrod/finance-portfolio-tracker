import { fmt, fmtPct } from '@/shared/format/money'
import { SEMANTIC_TEXT_CLASSES } from '@/shared/format/semanticColors'
import type { PositionRow } from '@/types/domain'
import { Kpi } from './Kpi'

function gainColor(v: number) {
  return v >= 0 ? SEMANTIC_TEXT_CLASSES.performancePositive : SEMANTIC_TEXT_CLASSES.performanceNegative
}

interface Props {
  rows: PositionRow[]
  globalTri?: number | null
}

export function KpiBar({ rows, globalTri }: Props) {
  const active = rows.filter((r) => r.status === 'active')

  const totalValue = active.reduce((s, r) => s + (r.total_value ?? 0), 0)
  const totalUnrealized = active.reduce((s, r) => s + (r.unrealized_gain ?? 0), 0)
  const totalUnrealizedNet = active.reduce((s, r) => s + (r.unrealized_gain_net ?? r.unrealized_gain ?? 0), 0)
  const totalCostBasis = totalValue - totalUnrealized
  const totalValueNet = totalCostBasis + totalUnrealizedNet

  const totalInvested = active.reduce((s, r) => s + r.total_invested, 0)
  const unrealizedPctNet = totalInvested > 0 ? (totalUnrealizedNet / totalInvested) * 100 : 0
  const unrealizedPctGross = totalInvested > 0 ? (totalUnrealized / totalInvested) * 100 : 0

  const totalRealized = rows.reduce((s, r) => s + r.realized_gain, 0)
  const totalDividends = rows.reduce((s, r) => s + r.total_dividends, 0)
  const totalInterest = rows.reduce((s, r) => s + r.total_interest, 0)
  const totalReturn = rows.reduce((s, r) => s + r.total_realized_return, 0)

  return (
    <div className="mb-4 flex flex-wrap items-start gap-6 border-b border-gray-800 pb-4">
      <Kpi
        label="Net portfolio value"
        tooltip="Market value after deducting estimated taxes on unrealized gains. Calculation: cost basis + net unrealized P&L."
        value={fmt.format(totalValueNet)}
        accent="portfolio"
        subSmall={`gross ${fmt.format(totalValue)}`}
      />
      <div className="w-px bg-gray-700" />
      <Kpi
        label="Net unrealized P&L"
        tooltip="Unrealized gain net of estimated taxes. Tax rate configurable per asset (default: 30% flat tax). Calculation: gross P&L × (1 − tax rate)."
        value={fmt.format(totalUnrealizedNet)}
        accent={totalUnrealizedNet >= 0 ? 'positive' : 'negative'}
        sub={fmtPct(unrealizedPctNet)}
        subColor={gainColor(totalUnrealizedNet)}
        subSmall={`gross ${fmt.format(totalUnrealized)} (${fmtPct(unrealizedPctGross)})`}
      />
      <div className="w-px bg-gray-700" />
      <Kpi
        label="Realized P&L"
        tooltip="Sum of gains/losses crystallized across all sales, across all accounts."
        value={fmt.format(totalRealized)}
        accent={totalRealized >= 0 ? 'positive' : 'negative'}
        subColor={gainColor(totalRealized)}
      />
      <div className="w-px bg-gray-700" />
      <Kpi
        label="Dividends"
        tooltip="Total dividends received across all positions (active and closed)."
        value={fmt.format(totalDividends)}
        accent="income"
        subColor={SEMANTIC_TEXT_CLASSES.passiveIncome}
      />
      <div className="w-px bg-gray-700" />
      {totalInterest > 0 && <>
        <Kpi
          label="Interest"
          tooltip="Total interest received (savings accounts, bonds). Included in the total realized return."
          value={fmt.format(totalInterest)}
          accent="income"
          subColor={SEMANTIC_TEXT_CLASSES.passiveIncome}
        />
        <div className="w-px bg-gray-700" />
      </>}
      <Kpi
        label="Total realized return"
        tooltip="Realized P&L + dividends + interest. Does not include unrealized gains."
        value={fmt.format(totalReturn)}
        accent={totalReturn >= 0 ? 'positive' : 'negative'}
        subColor={gainColor(totalReturn)}
      />
      <div className="w-px bg-gray-700" />
      {globalTri != null && <>
        <div className="w-px bg-gray-700" />
        <Kpi
          label="IRR since tracking"
          tooltip="Annualized money-weighted return since the first recorded deposit, or since the first portfolio valuation when it predates the available cash-flow history."
          value={`${globalTri >= 0 ? '+' : ''}${globalTri.toFixed(2)}%`}
          valueColor={gainColor(globalTri)}
          accent={globalTri >= 0 ? 'positive' : 'negative'}
        />
      </>}
      <div className="w-px bg-gray-700" />
      <Kpi
        label="Positions"
        tooltip="Number of active positions (valued today) and closed positions (fully sold)."
        value={String(active.length)}
        sub={`${rows.length - active.length} closed`}
      />
    </div>
  )
}
