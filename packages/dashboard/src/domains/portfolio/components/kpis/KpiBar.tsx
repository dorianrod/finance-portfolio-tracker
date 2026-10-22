import { fmt, fmtPct } from '@/shared/format/money'
import { SEMANTIC_TEXT_CLASSES } from '@/shared/format/semanticColors'
import type { PositionRow } from '@/domains/portfolio/types/domain'
import { Kpi } from './Kpi'
import { calculatePortfolioKpis } from '@/domains/portfolio/helpers/calculators/calculatePortfolioKpis'

function gainColor(v: number) {
  return v >= 0 ? SEMANTIC_TEXT_CLASSES.performancePositive : SEMANTIC_TEXT_CLASSES.performanceNegative
}

interface Props {
  rows: PositionRow[]
  globalTri?: number | null
}

export function KpiBar({ rows, globalTri }: Props) {
  const {
    activeCount,
    closedCount,
    totalDividends,
    totalInterest,
    totalRealized,
    totalReturn,
    totalUnrealized,
    totalUnrealizedNet,
    totalValue,
    totalValueNet,
    unrealizedPctGross,
    unrealizedPctNet,
  } = calculatePortfolioKpis(rows)

  return (
    <div className="mb-4 flex flex-wrap items-start gap-6 border-b border-gray-800 pb-4">
      <Kpi.Root accent="portfolio">
        <Kpi.Label tooltip="Market value after deducting estimated taxes on unrealized gains. Calculation: cost basis + net unrealized P&L.">Net portfolio value</Kpi.Label>
        <Kpi.ValueRow><Kpi.Value>{fmt.format(totalValueNet)}</Kpi.Value></Kpi.ValueRow>
        <Kpi.Detail>gross {fmt.format(totalValue)}</Kpi.Detail>
      </Kpi.Root>
      <div className="w-px bg-gray-700" />
      <Kpi.Root accent={totalUnrealizedNet >= 0 ? 'positive' : 'negative'}>
        <Kpi.Label tooltip="Unrealized gain net of estimated taxes. Tax rate configurable per asset (default: 30% flat tax). Calculation: gross P&L × (1 − tax rate).">Net unrealized P&amp;L</Kpi.Label>
        <Kpi.ValueRow><Kpi.Value>{fmt.format(totalUnrealizedNet)}</Kpi.Value></Kpi.ValueRow>
        <Kpi.Note color={gainColor(totalUnrealizedNet)}>{fmtPct(unrealizedPctNet)}</Kpi.Note>
        <Kpi.Detail>gross {fmt.format(totalUnrealized)} ({fmtPct(unrealizedPctGross)})</Kpi.Detail>
      </Kpi.Root>
      <div className="w-px bg-gray-700" />
      <Kpi.Root accent={totalRealized >= 0 ? 'positive' : 'negative'}>
        <Kpi.Label tooltip="Sum of gains/losses crystallized across all sales, across all accounts.">Realized P&amp;L</Kpi.Label>
        <Kpi.ValueRow><Kpi.Value>{fmt.format(totalRealized)}</Kpi.Value></Kpi.ValueRow>
      </Kpi.Root>
      <div className="w-px bg-gray-700" />
      <Kpi.Root accent="income">
        <Kpi.Label tooltip="Total dividends received across all positions (active and closed).">Dividends</Kpi.Label>
        <Kpi.ValueRow><Kpi.Value>{fmt.format(totalDividends)}</Kpi.Value></Kpi.ValueRow>
      </Kpi.Root>
      <div className="w-px bg-gray-700" />
      {totalInterest > 0 ? <>
        <Kpi.Root accent="income">
          <Kpi.Label tooltip="Total interest received (savings accounts, bonds). Included in the total realized return.">Interest</Kpi.Label>
          <Kpi.ValueRow><Kpi.Value>{fmt.format(totalInterest)}</Kpi.Value></Kpi.ValueRow>
        </Kpi.Root>
        <div className="w-px bg-gray-700" />
      </> : null}
      <Kpi.Root accent={totalReturn >= 0 ? 'positive' : 'negative'}>
        <Kpi.Label tooltip="Realized P&L + dividends + interest. Does not include unrealized gains.">Total realized return</Kpi.Label>
        <Kpi.ValueRow><Kpi.Value>{fmt.format(totalReturn)}</Kpi.Value></Kpi.ValueRow>
      </Kpi.Root>
      <div className="w-px bg-gray-700" />
      {globalTri != null ? <>
        <div className="w-px bg-gray-700" />
        <Kpi.Root accent={globalTri >= 0 ? 'positive' : 'negative'}>
          <Kpi.Label tooltip="Annualized money-weighted return since the first recorded deposit, or since the first portfolio valuation when it predates the available cash-flow history.">IRR since tracking</Kpi.Label>
          <Kpi.ValueRow><Kpi.Value color={gainColor(globalTri)}>{globalTri >= 0 ? '+' : ''}{globalTri.toFixed(2)}%</Kpi.Value></Kpi.ValueRow>
        </Kpi.Root>
      </> : null}
      <div className="w-px bg-gray-700" />
      <Kpi.Root>
        <Kpi.Label tooltip="Number of active positions (valued today) and closed positions (fully sold).">Positions</Kpi.Label>
        <Kpi.ValueRow><Kpi.Value>{activeCount}</Kpi.Value></Kpi.ValueRow>
        <Kpi.Note>{closedCount} closed</Kpi.Note>
      </Kpi.Root>
    </div>
  )
}
