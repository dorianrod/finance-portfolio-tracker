import type { PositionRow } from './positionRow.type'
import type { RawOperation } from './rawOperation.type'
import type { RawPosition } from './rawPosition.type'

export type DashboardData = {
  accountLabels: Record<string, string>
  positions: PositionRow[]
  rawOperations: RawOperation[]
  rawPositions: RawPosition[]
}
