import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import * as yup from 'yup'

import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/shared/apis/endpoints'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import { normalizeAccountSelection } from '@/domains/portfolio/shared/helpers/selectors/normalizeAccountSelection'
import type { ApiHistoryPoint } from '@/domains/portfolio/shared/types/apiHistoryPoint.type'
import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'
import type { PortfolioHistoryResponse } from '@/domains/portfolio/shared/types/portfolioHistoryResponse.type'
import i18n from '@/i18n/i18n'
import { readJsonResponse } from '@/shared/http/readJsonResponse'
import { CALENDAR_DATE_SCHEMA } from '@/shared/schemas/calendarDate.schema'
import { FINITE_NUMBER_SCHEMA } from '@/shared/schemas/finiteNumber.schema'

const STATIC_DEMO = import.meta.env.VITE_STATIC_DEMO === 'true'

const FILTERED_HISTORY_REQUEST_SCHEMA = yup.object({
  accounts: yup.array(yup.string().defined()).defined(),
})

const API_HISTORY_POINT_SCHEMA: yup.ObjectSchema<ApiHistoryPoint> = yup.object({
  snapshot_date: CALENDAR_DATE_SCHEMA.required(),
  total_value: FINITE_NUMBER_SCHEMA.defined(),
  total_cost_basis: FINITE_NUMBER_SCHEMA.defined(),
  unrealized_gain: FINITE_NUMBER_SCHEMA.defined(),
  net_cash_injected: FINITE_NUMBER_SCHEMA.defined(),
  cash_delta: FINITE_NUMBER_SCHEMA.nullable().default(null).defined(),
  tri: FINITE_NUMBER_SCHEMA.nullable().default(null).defined(),
  tri_rolling_1y: FINITE_NUMBER_SCHEMA.nullable().default(null).defined(),
  tri_rolling_3y: FINITE_NUMBER_SCHEMA.nullable().default(null).defined(),
})

const FILTERED_HISTORY_RESPONSE_SCHEMA: yup.ObjectSchema<PortfolioHistoryResponse> =
  yup.object({
    accounts: yup
      .array(yup.string().defined())
      .transform((value) => value ?? [])
      .default([])
      .defined(),
    history: yup
      .array(API_HISTORY_POINT_SCHEMA)
      .transform((value) => value ?? [])
      .default([])
      .defined(),
  })

export class DemoScopeUnavailableError extends Error {}

function sameAccounts(left: string[], right: string[]): boolean {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  )
}

function toHistory(
  response: PortfolioHistoryResponse,
): PortfolioHistoryPoint[] {
  return response.history.map((point) => ({
    date: point.snapshot_date,
    total_value: point.total_value,
    total_cost_basis: point.total_cost_basis,
    unrealized_gain: point.unrealized_gain,
    net_cash_injected: point.net_cash_injected,
    cash_delta: point.cash_delta,
    tri: point.tri,
    tri_rolling_1y: point.tri_rolling_1y,
    tri_rolling_3y: point.tri_rolling_3y,
    total_broker_cash: 0,
  }))
}

async function readResponse(
  response: Response,
): Promise<PortfolioHistoryResponse> {
  const payload = await readJsonResponse(response)
  return FILTERED_HISTORY_RESPONSE_SCHEMA.validate(payload, {
    stripUnknown: true,
  })
}

export async function requestFilteredPortfolioHistory(
  accounts: string[],
  signal: AbortSignal,
  options: { staticDemo?: boolean; fetchImpl?: typeof fetch } = {},
): Promise<PortfolioHistoryResponse> {
  const fetchImpl = options.fetchImpl ?? fetch
  const normalized = normalizeAccountSelection(accounts)
  if (options.staticDemo ?? STATIC_DEMO) {
    const fixture = await readResponse(
      await fetchImpl(PORTFOLIO_ENDPOINTS.data.demoFilteredHistory, { signal }),
    )
    const fixtureAccounts = normalizeAccountSelection(fixture.accounts)
    if (!sameAccounts(normalized, fixtureAccounts)) {
      throw new DemoScopeUnavailableError(
        i18n.t('ui.usefilteredportfoliohistory.localDashboardOnly'),
      )
    }
    return fixture
  }

  const body = await FILTERED_HISTORY_REQUEST_SCHEMA.validate(
    { accounts: normalized },
    { stripUnknown: true },
  )
  return readResponse(
    await fetchImpl(PORTFOLIO_ENDPOINTS.api.portfolioHistory, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    }),
  )
}

async function requestDemoPresetAccounts(
  signal: AbortSignal,
): Promise<string[] | null> {
  if (!STATIC_DEMO) return null
  const fixture = await readResponse(
    await fetch(PORTFOLIO_ENDPOINTS.data.demoFilteredHistory, { signal }),
  )
  return normalizeAccountSelection(fixture.accounts)
}

export function useFilteredPortfolioHistoryQuery(
  selectedAccounts: Set<string>,
) {
  const normalizedAccounts = useMemo(
    () => normalizeAccountSelection(selectedAccounts),
    [selectedAccounts],
  )
  return useQuery<PortfolioHistoryResponse, Error, PortfolioHistoryPoint[]>({
    queryKey: portfolioQueryKeys.data(
      'filtered-history',
      ...normalizedAccounts,
    ),
    queryFn: ({ signal }) =>
      requestFilteredPortfolioHistory(normalizedAccounts, signal),
    select: toHistory,
    enabled: selectedAccounts.size > 0,
  })
}

export function useDemoFilteredHistoryAccountsQuery() {
  return useQuery<string[] | null>({
    queryKey: portfolioQueryKeys.data('demo-filtered-history-accounts'),
    queryFn: ({ signal }) => requestDemoPresetAccounts(signal),
    enabled: STATIC_DEMO,
  })
}
