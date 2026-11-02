import type { Row } from '@tanstack/react-table'

import { usePositionTableFormatters } from '@/domains/portfolio/features/holdings/features/positions/helpers/formatters/usePositionTableFormatters'
import { calculatePassiveIncomeTax } from '@/domains/portfolio/features/holdings/features/positions/helpers/transformers/calculatePositionTableValues/calculatePassiveIncomeTax'
import { isTaxFreePassiveIncome } from '@/domains/portfolio/features/holdings/features/positions/helpers/transformers/positionDisplayRules/isTaxFreePassiveIncome'
import type {
  PositionRow,
  TableRow,
} from '@/domains/portfolio/shared/types/positionRow.type'
import { Text } from '@/shared/ui/Text.view'

import { PositionGroupIncome } from './PositionGroupIncome.view'
import { PositionPassiveIncomeView } from './PositionPassiveIncome.view'

export function PositionIncomeCell({ row }: { row: Row<TableRow> }) {
  const { formatMoney } = usePositionTableFormatters()

  const r = row.original
  if (r.kind === 'position') return <PositionPassiveIncome position={r} />
  if (r.kind === 'group') return <PositionGroupIncome group={r} />
  if (
    r.kind === 'operation' &&
    ['DIVIDEND', 'INTEREST'].includes(r.operation_type)
  ) {
    return (
      <Text variant="body" tone={'decorative'}>
        {formatMoney(r.total_amount, { style: 'decimal' })}
      </Text>
    )
  }
  return null
}

function PositionPassiveIncome({ position: r }: { position: PositionRow }) {
  const taxRatePercentage = r.tax_rate == null ? null : r.tax_rate * 100
  const hasDivs = r.total_dividends > 0
  const hasInt = r.total_interest > 0
  if (!hasDivs && !hasInt) return <Text tone="subtle">—</Text>
  const divTax = calculatePassiveIncomeTax(
    r.total_dividends,
    r.total_dividends_net,
    r.tax_rate,
  )
  const intTax = calculatePassiveIncomeTax(
    r.total_interest,
    r.total_interest_net,
    r.tax_rate,
  )
  return (
    <PositionPassiveIncomeView
      dividends={r.total_dividends}
      interest={r.total_interest}
      dividendTax={divTax}
      interestTax={intTax}
      taxRatePercentage={taxRatePercentage}
      taxFree={isTaxFreePassiveIncome(r)}
    />
  )
}
