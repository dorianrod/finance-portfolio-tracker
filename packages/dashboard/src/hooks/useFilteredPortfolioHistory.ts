import { useEffect, useMemo, useState } from 'react'
import { rawAccountId } from '@/shared/filters/accountFilter'
import { dataUrl } from '@/shared/csv/csvData'
import type { PortfolioHistoryPoint } from '@/types/history'

const STATIC_DEMO = import.meta.env.VITE_STATIC_DEMO === 'true'

interface ApiHistoryPoint {
  snapshot_date: string
  total_value: number
  total_cost_basis: number
  unrealized_gain: number
  net_cash_injected: number
  cash_delta: number | null
  tri: number | null
  tri_rolling_1y: number | null
  tri_rolling_3y: number | null
}

export interface PortfolioHistoryResponse {
  accounts: string[]
  history: ApiHistoryPoint[]
}

export class DemoScopeUnavailableError extends Error {}

interface FilteredResponseState {
  key: string
  history: PortfolioHistoryPoint[] | null
  error: string | null
}

export function normalizeAccountSelection(accounts: Iterable<string>): string[] {
  return [...new Set([...accounts].map(rawAccountId))].sort()
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
    history: !isFiltered
      ? fallbackHistory
      : matchingResponse?.history ?? fallbackHistory,
    loading: isFiltered && matchingResponse === null,
    error: matchingResponse?.error ?? null,
  }
}

async function readResponse(response: Response): Promise<PortfolioHistoryResponse> {
  const payload = await response.json() as PortfolioHistoryResponse & { error?: string }
  if (!response.ok) throw new Error(payload.error ?? `Filtered IRR request failed (${response.status})`)
  return payload
}

export async function requestFilteredPortfolioHistory(
  accounts: string[],
  signal: AbortSignal,
  options: { staticDemo?: boolean; fetchImpl?: typeof fetch } = {},
): Promise<PortfolioHistoryResponse> {
  const fetchImpl = options.fetchImpl ?? fetch
  const normalized = normalizeAccountSelection(accounts)
  if (options.staticDemo ?? STATIC_DEMO) {
    const fixture = await readResponse(await fetchImpl(dataUrl('demo_filtered_history.json'), { signal }))
    const fixtureAccounts = normalizeAccountSelection(fixture.accounts)
    if (!sameAccounts(normalized, fixtureAccounts)) {
      throw new DemoScopeUnavailableError('Filtered IRR is available in the local dashboard for this selection.')
    }
    return fixture
  }

  return readResponse(await fetchImpl(`${import.meta.env.BASE_URL}api/portfolio-history`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accounts: normalized }),
    signal,
  }))
}

async function requestDemoPresetAccounts(signal: AbortSignal): Promise<string[] | null> {
  if (!STATIC_DEMO) return null
  const fixture = await readResponse(await fetch(dataUrl('demo_filtered_history.json'), { signal }))
  return normalizeAccountSelection(fixture.accounts)
}

export function useFilteredPortfolioHistory(
  fallbackHistory: PortfolioHistoryPoint[],
  selectedAccounts: Set<string>,
) {
  const normalizedAccounts = useMemo(
    () => normalizeAccountSelection(selectedAccounts),
    [selectedAccounts],
  )
  const accountKey = normalizedAccounts.join('\u0000')
  const isFiltered = selectedAccounts.size > 0
  const [responseState, setResponseState] = useState<FilteredResponseState | null>(null)
  const [demoPresetAccounts, setDemoPresetAccounts] = useState<string[] | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    requestDemoPresetAccounts(controller.signal)
      .then(setDemoPresetAccounts)
      .catch((requestError: unknown) => {
        if (!(requestError instanceof DOMException && requestError.name === 'AbortError')) {
          setDemoPresetAccounts(null)
        }
      })
    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (!isFiltered) return

    const controller = new AbortController()
    requestFilteredPortfolioHistory(normalizedAccounts, controller.signal)
      .then((response) => {
        if (controller.signal.aborted) return
        setResponseState({ key: accountKey, history: toHistory(response), error: null })
      })
      .catch((requestError: unknown) => {
        if (controller.signal.aborted) return
        setResponseState({
          key: accountKey,
          history: null,
          error: requestError instanceof Error ? requestError.message : String(requestError),
        })
      })
    return () => controller.abort()
  }, [accountKey, isFiltered, normalizedAccounts])

  const { history, loading, error } = resolveFilteredHistoryState(
    fallbackHistory,
    isFiltered,
    accountKey,
    responseState,
  )

  return { history, loading, error, isFiltered, demoPresetAccounts }
}
