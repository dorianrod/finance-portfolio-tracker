import type { OperationType } from './operationType.type'
export type DashboardFilters = {
  accountTypes: Set<string>
  accounts: Set<string>
  operationTypes: Set<OperationType>
  hideClosedPositions: boolean
  dateFrom?: Date
  dateTo?: Date
}
