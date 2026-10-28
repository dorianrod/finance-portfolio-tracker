import type { PositionPreviewModel } from '@/domains/portfolio/features/holdings/features/positions/components/PositionsTable/types/positionPreviewModel.type'
import { getPositionSavingsOperations } from '@/domains/portfolio/features/holdings/features/positions/helpers/mappers/getPositionChartOperations/getPositionSavingsOperations'
import { getPositionTradeOperations } from '@/domains/portfolio/features/holdings/features/positions/helpers/mappers/getPositionChartOperations/getPositionTradeOperations'
import { statusForPosition } from '@/domains/portfolio/features/holdings/features/positions/helpers/selectors/statusForPosition'
import type { IsinAllocation } from '@/domains/portfolio/features/holdings/features/positions/types/isinAllocation.type'
import type { PositionPreviewSelection } from '@/domains/portfolio/features/holdings/features/positions/types/positionPreviewSelection.type'
import { getPositionAllocationKey } from '@/domains/portfolio/shared/helpers/mappers/getPositionAllocationKey'
import type { FundHoldingStatus } from '@/domains/portfolio/shared/types/fundHoldingStatus.type'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'

export function resolvePositionPreview(
  selection: PositionPreviewSelection | null,
  positions: PositionRow[],
  statuses: FundHoldingStatus[],
  allocations: Map<string, IsinAllocation>,
): PositionPreviewModel | null {
  if (!selection) return null
  const position = positions.find((item) => item.id === selection.positionId)
  if (!position) return null
  switch (selection.kind) {
    case 'chart':
      return chartPreview(selection, position)
    case 'savings':
      return {
        kind: 'savings',
        target: {
          name: position.name,
          operations: getPositionSavingsOperations(position),
          buttonRect: selection.buttonRect,
        },
      }
    case 'allocation':
      return allocationPreview(selection, position, allocations)
    case 'underlying':
      return underlyingPreview(selection, position, statuses)
  }
}

function chartPreview(
  selection: PositionPreviewSelection,
  position: PositionRow,
): PositionPreviewModel | null {
  const isin = position.isin || position.ticker || position.name
  if (!isin) return null
  return {
    kind: 'chart',
    target: {
      isin,
      name: position.name,
      operations: getPositionTradeOperations(position),
      buttonRect: selection.buttonRect,
    },
  }
}

function allocationPreview(
  selection: PositionPreviewSelection,
  position: PositionRow,
  allocations: Map<string, IsinAllocation>,
): PositionPreviewModel | null {
  const isin = getPositionAllocationKey(position)
  const allocation = allocations.get(isin)
  if (!allocation) return null
  return {
    kind: 'allocation',
    target: {
      isin,
      name: position.name,
      allocation,
      buttonRect: selection.buttonRect,
    },
  }
}

function underlyingPreview(
  selection: PositionPreviewSelection,
  position: PositionRow,
  statuses: FundHoldingStatus[],
): PositionPreviewModel | null {
  const status = statusForPosition(position, statuses)
  if (!status) return null
  return {
    kind: 'underlying',
    target: { position, status, buttonRect: selection.buttonRect },
  }
}
