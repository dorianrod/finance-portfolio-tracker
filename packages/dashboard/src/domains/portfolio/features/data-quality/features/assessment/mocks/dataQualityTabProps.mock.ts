import type { DataQualityTabProps } from '@/domains/portfolio/features/data-quality/features/assessment/types/dataQualityTabProps.type'

export function createDataQualityTabProps(
  overrides: Partial<DataQualityTabProps> = {},
): DataQualityTabProps {
  return {
    positions: [],
    errors: [],
    manualPriceOverrides: [],
    fundStatuses: [],
    fundReport: null,
    fundHoldings: [],
    fundSnapshots: [],
    fundUnresolved: [],
    rawData: { geo: [], secteur: [], currency: [], classe: [], loading: false },
    ...overrides,
  }
}
