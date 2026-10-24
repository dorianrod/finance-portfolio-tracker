import type { FundHolding } from '@/domains/portfolio/shared/types/fundHolding.type'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'

export function FundPositionHoldingRow({
  holding,
  position,
}: {
  holding: FundHolding
  position: PositionRow
}) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const positionValue = position.total_value ?? 0
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_4rem_6rem] items-baseline gap-3 border-b border-border/70 py-1.5 text-xs">
      <span
        className="truncate text-content-secondary"
        title={holding.holdingName}
      >
        {holding.holdingName}
      </span>
      <span className="text-right tabular-nums text-content-subtle">
        {formatPercentage(holding.weight * 100, { decimals: 2 })}
      </span>
      <span className="text-right tabular-nums text-content-muted">
        {formatMoney(positionValue * holding.weight, { style: 'full' })}
      </span>
    </div>
  )
}
