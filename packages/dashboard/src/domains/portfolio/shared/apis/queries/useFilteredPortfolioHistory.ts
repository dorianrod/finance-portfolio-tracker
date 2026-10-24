import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/shared/apis/endpoints'
import i18n from '@/i18n/i18n'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { rawAccountId } from '@/domains/portfolio/shared/helpers/filters/accountFilter'
import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'
import type { ApiHistoryPoint } from '@/domains/portfolio/shared/types/apiHistoryPoint.type'
import type { PortfolioHistoryResponse } from '@/domains/portfolio/shared/types/portfolioHistoryResponse.type'
import * as yup from 'yup'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'

const STATIC_DEMO = import.meta.env.VITE_STATIC_DEMO === 'true'

const FILTERED_HISTORY_REQUEST_SCHEMA = yup.object({
  accounts: yup.array(yup.string().defined()).defined(),
})

const API_HISTORY_POINT_SCHEMA: yup.ObjectSchema<ApiHistoryPoint> = yup.object({
  snapshot_date: yup.string().defined(),
  total_value: yup.number().defined(),
  total_cost_basis: yup.number().defined(),
  unrealized_gain: yup.number().defined(),
  net_cash_injected: yup.number().defined(),
  cash_delta: yup.number().nullable().default(null).defined(),
  tri: yup.number().nullable().default(null).defined(),
  tri_rolling_1y: yup.number().nullable().default(null).defined(),
  tri_rolling_3y: yup.number().nullable().default(null).defined(),
})

const FILTERED_HISTORY_RESPONSE_SCHEMA: yup.ObjectSchema<PortfolioHistoryResponse> = yup.object({
  accounts: yup.array(yup.string().defined()).default([]).defined(),
  history: yup.array(API_HISTORY_POINT_SCHEMA).default([]).defined(),
})

const ERROR_RESPONSE_SCHEMA = yup.object({
  error: yup.string().ensure().defined(),
})

export class DemoScopeUnavailableError extends Error {}

interface FilteredResponseState {
  key: string
  history: PortfolioHistoryPoint[] | null
  error: string | null
}

export function normalizeAccountSelection(accounts: Iterable<string>): string[] {
  return [...new Set([...accounts].map(rawAccountId))].toSorted()
}

function sameAccounts(left: string[], right: string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index])
}

function toHistory(response: PortfolioHistoryResponse): PortfolioHistoryPoint[] {
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

export function resolveFilteredHistoryState(
  fallbackHistory: PortfolioHistoryPoint[],
  isFiltered: boolean,
  accountKey: string,
  responseState: FilteredResponseState | null,
) {
  const matchingResponse = responseState?.key === accountKey ? responseState : null
  return {
    history: isFiltered
      ? matchingResponse?.history ?? fallbackHistory
      : fallbackHistory,
    loading: isFiltered && matchingResponse === null,
    error: matchingResponse?.error ?? null,
  }
}

async function readResponse(response: Response): Promise<PortfolioHistoryResponse> {
  const payload: unknown = await response.json()
  if (!response.ok) {
    const errorResponse = await ERROR_RESPONSE_SCHEMA.validate(payload, { stripUnknown: true })
    throw new Error(errorResponse.error || `Filtered IRR request failed (${response.status})`)
  }
  return FILTERED_HISTORY_RESPONSE_SCHEMA.validate(payload, { stripUnknown: true })
}

export async function requestFilteredPortfolioHistory(
  accounts: string[],
  signal: AbortSignal,
  options: { staticDemo?: boolean; fetchImpl?: typeof fetch } = {},
): Promise<PortfolioHistoryResponse> {
  const fetchImpl = options.fetchImpl ?? fetch
  const normalized = normalizeAccountSelection(accounts)
  if (options.staticDemo ?? STATIC_DEMO) {
    const fixture = await readResponse(await fetchImpl(PORTFOLIO_ENDPOINTS.data.demoFilteredHistory, { signal }))
    const fixtureAccounts = normalizeAccountSelection(fixture.accounts)
    if (!sameAccounts(normalized, fixtureAccounts)) {
      throw new DemoScopeUnavailableError(i18n.t('ui.usefilteredportfoliohistory.localDashboardOnly'))
    }
    return fixture
  }

  const body = await FILTERED_HISTORY_REQUEST_SCHEMA.validate(
    { accounts: normalized },
    { stripUnknown: true },
  )
  return readResponse(await fetchImpl(PORTFOLIO_ENDPOINTS.api.portfolioHistory, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  }))
}

async function requestDemoPresetAccounts(signal: AbortSignal): Promise<string[] | null> {
  if (!STATIC_DEMO) return null
  const fixture = await readResponse(await fetch(PORTFOLIO_ENDPOINTS.data.demoFilteredHistory, { signal }))
  return normalizeAccountSelection(fixture.accounts)
}

export function useFilteredPortfolioHistory(selectedAccounts: Set<string>) {
  const normalizedAccounts = useMemo(
    () => normalizeAccountSelection(selectedAccounts),
    [selectedAccounts],
  )
  return useQuery({
    queryKey: portfolioQueryKeys.data('filtered-history', ...normalizedAccounts),
    queryFn: ({ signal }) => requestFilteredPortfolioHistory(normalizedAccounts, signal),
    select: toHistory,
    enabled: selectedAccounts.size > 0,
  })
}

export function useDemoFilteredHistoryAccounts() {
  return useQuery({
    queryKey: portfolioQueryKeys.data('demo-filtered-history-accounts'),
    queryFn: ({ signal }) => requestDemoPresetAccounts(signal),
    enabled: STATIC_DEMO,
  })
}
