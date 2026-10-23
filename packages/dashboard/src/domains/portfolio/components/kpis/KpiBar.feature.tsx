import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import type { PositionRow } from '@/domains/portfolio/types/domain'
import { Kpi } from './Kpi.view'
import { calculatePortfolioKpis } from '@/domains/portfolio/helpers/calculators/calculatePortfolioKpis'
import { getPerformanceColor } from '@/domains/portfolio/helpers/presenters/getPerformanceColor'

interface Props {
  rows: PositionRow[]
  globalTri?: number | null
}

export function KpiBar({ rows, globalTri }: Props) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
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
        <Kpi.ValueRow><Kpi.Value>{formatMoney(totalValueNet)}</Kpi.Value></Kpi.ValueRow>
        <Kpi.Detail>gross {formatMoney(totalValue)}</Kpi.Detail>
      </Kpi.Root>
      <div className="w-px bg-gray-700" />
      <Kpi.Root accent={totalUnrealizedNet >= 0 ? 'positive' : 'negative'}>
        <Kpi.Label tooltip="Unrealized gain net of estimated taxes. Tax rate configurable per asset (default: 30% flat tax). Calculation: gross P&L × (1 − tax rate).">Net unrealized P&amp;L</Kpi.Label>
        <Kpi.ValueRow><Kpi.Value>{formatMoney(totalUnrealizedNet)}</Kpi.Value></Kpi.ValueRow>
        <Kpi.Note color={getPerformanceColor(totalUnrealizedNet)}>{formatPercentage(unrealizedPctNet, { signed: true })}</Kpi.Note>
        <Kpi.Detail>gross {formatMoney(totalUnrealized)} ({formatPercentage(unrealizedPctGross, { signed: true })})</Kpi.Detail>
      </Kpi.Root>
      <div className="w-px bg-gray-700" />
      <Kpi.Root accent={totalRealized >= 0 ? 'positive' : 'negative'}>
        <Kpi.Label tooltip="Sum of gains/losses crystallized across all sales, across all accounts.">Realized P&amp;L</Kpi.Label>
        <Kpi.ValueRow><Kpi.Value>{formatMoney(totalRealized)}</Kpi.Value></Kpi.ValueRow>
      </Kpi.Root>
      <div className="w-px bg-gray-700" />
      <Kpi.Root accent="income">
        <Kpi.Label tooltip="Total dividends received across all positions (active and closed).">Dividends</Kpi.Label>
        <Kpi.ValueRow><Kpi.Value>{formatMoney(totalDividends)}</Kpi.Value></Kpi.ValueRow>
      </Kpi.Root>
      <div className="w-px bg-gray-700" />
      {totalInterest > 0 ? <>
        <Kpi.Root accent="income">
          <Kpi.Label tooltip="Total interest received (savings accounts, bonds). Included in the total realized return.">Interest</Kpi.Label>
          <Kpi.ValueRow><Kpi.Value>{formatMoney(totalInterest)}</Kpi.Value></Kpi.ValueRow>
        </Kpi.Root>
        <div className="w-px bg-gray-700" />
      </> : null}
      <Kpi.Root accent={totalReturn >= 0 ? 'positive' : 'negative'}>
        <Kpi.Label tooltip="Realized P&L + dividends + interest. Does not include unrealized gains.">Total realized return</Kpi.Label>
        <Kpi.ValueRow><Kpi.Value>{formatMoney(totalReturn)}</Kpi.Value></Kpi.ValueRow>
      </Kpi.Root>
      <div className="w-px bg-gray-700" />
      {globalTri == null ? null : <>
        <div className="w-px bg-gray-700" />
        <Kpi.Root accent={globalTri >= 0 ? 'positive' : 'negative'}>
          <Kpi.Label tooltip="Annualized money-weighted return since the first recorded deposit, or since the first portfolio valuation when it predates the available cash-flow history.">IRR since tracking</Kpi.Label>
          <Kpi.ValueRow><Kpi.Value color={getPerformanceColor(globalTri)}>{formatPercentage(globalTri, { decimals: 2, signed: true })}</Kpi.Value></Kpi.ValueRow>
        </Kpi.Root>
      </>}
      <div className="w-px bg-gray-700" />
      <Kpi.Root>
        <Kpi.Label tooltip="Number of active positions (valued today) and closed positions (fully sold).">Positions</Kpi.Label>
        <Kpi.ValueRow><Kpi.Value>{activeCount}</Kpi.Value></Kpi.ValueRow>
        <Kpi.Note>{closedCount} closed</Kpi.Note>
      </Kpi.Root>
    </div>
  )
}
