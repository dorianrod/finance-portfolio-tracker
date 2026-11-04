import type { AllocationHoverTarget } from '@/domains/portfolio/features/holdings/features/positions/types/allocationHoverTarget.type'
import type { ChartTarget } from '@/domains/portfolio/features/holdings/features/positions/types/chartTarget.type'
import type { FundPositionPopoverTarget } from '@/domains/portfolio/features/holdings/features/positions/types/fundPositionPopoverTarget.type'
import type { SavingsChartTarget } from '@/domains/portfolio/features/holdings/features/positions/types/savingsChartTarget.type'

export type PositionPreviewModel =
  | { kind: 'chart'; target: ChartTarget }
  | { kind: 'savings'; target: SavingsChartTarget }
  | { kind: 'allocation'; target: AllocationHoverTarget }
  | { kind: 'underlying'; target: FundPositionPopoverTarget }
