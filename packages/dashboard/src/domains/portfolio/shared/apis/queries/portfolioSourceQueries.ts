import { queryOptions } from '@tanstack/react-query'

import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/shared/apis/endpoints'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import {
  ALLOCATION_BY_ISIN_ROW_SCHEMA,
  RAW_OPERATION_SCHEMA,
  RAW_POSITION_SCHEMA,
  RAW_SAVING_CAPACITY_BY_ACCOUNT_SCHEMA,
  RAW_SAVING_CAPACITY_SCHEMA,
} from '@/domains/portfolio/shared/apis/schemas/portfolioCsvSchemas'
import { parseCsv } from '@/shared/csv/csvData'

// All consumers share the validated source snapshot for the dashboard session.
export const PORTFOLIO_POSITIONS_QUERY_OPTIONS = queryOptions({
  queryKey: portfolioQueryKeys.data('all-positions'),
  queryFn: () =>
    parseCsv(PORTFOLIO_ENDPOINTS.data.positions, RAW_POSITION_SCHEMA),
  staleTime: Infinity,
  gcTime: Infinity,
})

export const PORTFOLIO_OPERATIONS_QUERY_OPTIONS = queryOptions({
  queryKey: portfolioQueryKeys.data('operations'),
  queryFn: () =>
    parseCsv(PORTFOLIO_ENDPOINTS.data.operations, RAW_OPERATION_SCHEMA),
  staleTime: Infinity,
  gcTime: Infinity,
})

export const PORTFOLIO_ALLOCATION_QUERY_OPTIONS = queryOptions({
  queryKey: portfolioQueryKeys.data('raw-isin-allocation'),
  queryFn: async () => {
    const [geo, secteur, currency, classe] = await Promise.all([
      parseCsv(
        PORTFOLIO_ENDPOINTS.data.positionsGeoByIsin,
        ALLOCATION_BY_ISIN_ROW_SCHEMA,
      ),
      parseCsv(
        PORTFOLIO_ENDPOINTS.data.positionsSecteurByIsin,
        ALLOCATION_BY_ISIN_ROW_SCHEMA,
      ),
      parseCsv(
        PORTFOLIO_ENDPOINTS.data.positionsCurrencyByIsin,
        ALLOCATION_BY_ISIN_ROW_SCHEMA,
      ),
      parseCsv(
        PORTFOLIO_ENDPOINTS.data.positionsClasseByIsin,
        ALLOCATION_BY_ISIN_ROW_SCHEMA,
      ),
    ])
    return {
      geo: geo.filter((row) => row.isin),
      secteur: secteur.filter((row) => row.isin),
      currency: currency.filter((row) => row.isin),
      classe: classe.filter((row) => row.isin),
    }
  },
  staleTime: Infinity,
  gcTime: Infinity,
})

export const PORTFOLIO_SAVING_CAPACITY_QUERY_OPTIONS = queryOptions({
  queryKey: portfolioQueryKeys.data('saving-capacity-source'),
  queryFn: () =>
    parseCsv(
      PORTFOLIO_ENDPOINTS.data.savingCapacity,
      RAW_SAVING_CAPACITY_SCHEMA,
    ),
  staleTime: Infinity,
  gcTime: Infinity,
})

export const PORTFOLIO_ACCOUNT_SAVINGS_QUERY_OPTIONS = queryOptions({
  queryKey: portfolioQueryKeys.data('account-savings-source'),
  queryFn: () =>
    parseCsv(
      PORTFOLIO_ENDPOINTS.data.savingCapacityByAccount,
      RAW_SAVING_CAPACITY_BY_ACCOUNT_SCHEMA,
    ),
  staleTime: Infinity,
  gcTime: Infinity,
})
