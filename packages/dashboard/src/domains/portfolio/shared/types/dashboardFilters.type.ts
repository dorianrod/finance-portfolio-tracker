export type DashboardFilters = {
  accountTypes: Set<string>
  accounts: Set<string>
  operationTypes: Set<string>
  hideClosedPositions: boolean
  dateFrom?: string
  dateTo?: string
}
