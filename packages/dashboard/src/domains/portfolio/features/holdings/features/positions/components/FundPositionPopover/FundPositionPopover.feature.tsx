import { FundPositionHoldingRow } from '@/domains/portfolio/features/holdings/features/positions/components/FundPositionHoldingRow.feature'
import { useFundPositionHoldings } from '@/domains/portfolio/features/holdings/features/positions/components/FundPositionPopover/services/useFundPositionHoldings'
import { useOpenCompleteHoldings } from '@/domains/portfolio/features/holdings/features/positions/services/actions/useOpenCompleteHoldings'
import type { FundPositionPopoverTarget } from '@/domains/portfolio/features/holdings/features/positions/types/fundPositionPopoverTarget.type'

import { FundPositionPopoverView } from './FundPositionPopover.view'

export function FundPositionPopover({
  target,
  onMouseEnter,
  onMouseLeave,
}: {
  target: FundPositionPopoverTarget
  onMouseEnter: () => void
  onMouseLeave: () => void
}) {
  const openCompleteHoldings = useOpenCompleteHoldings()
  const rows = useFundPositionHoldings(target.position)
  return (
    <FundPositionPopoverView
      target={target}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onOpenAll={() => openCompleteHoldings(target.position.name)}
      hasHoldings={rows.length > 0}
    >
      {rows.map((holding) => (
        <FundPositionHoldingRow
          key={holding.holdingId}
          holding={holding}
          position={target.position}
        />
      ))}
    </FundPositionPopoverView>
  )
}
