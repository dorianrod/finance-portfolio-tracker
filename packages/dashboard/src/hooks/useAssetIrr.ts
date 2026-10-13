import { useEffect, useMemo, useState } from 'react'

const STATIC_DEMO = import.meta.env.VITE_STATIC_DEMO === 'true'

export interface AssetIrrItem {
  key: string
  label: string
  name: string
  irr: number
  value: number
  accounts: string[]
  account_types: string[]
}

export interface AssetIrrSummary {
  available: boolean
  start_date: string | null
  end_date: string | null
  assets: AssetIrrItem[]
}

interface AssetIrrState {
  key: string
  summary: AssetIrrSummary | null
  error: string | null
}

const unavailable: AssetIrrSummary = {
  available: false,
  start_date: null,
  end_date: null,
  assets: [],
}

export async function requestAssetIrr(
  accounts: string[],
  accountTypes: string[],
  dateFrom: string | undefined,
  dateTo: string | undefined,
  signal: AbortSignal,
  fetchImpl: typeof fetch = fetch,
): Promise<AssetIrrSummary> {
  const response = await fetchImpl(`${import.meta.env.BASE_URL}api/asset-irr`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      accounts,
      account_types: accountTypes,
      date_from: dateFrom ?? null,
      date_to: dateTo ?? null,
    }),
    signal,
  })
  const payload = await response.json() as AssetIrrSummary & { error?: string }
  if (!response.ok) throw new Error(payload.error ?? `Asset IRR request failed (${response.status})`)
  return payload
}

export function useAssetIrr(
  selectedAccounts: Set<string>,
  selectedAccountTypes: Set<string>,
  dateFrom: string | undefined,
  dateTo: string | undefined,
) {
  const accounts = useMemo(() => [...selectedAccounts].sort(), [selectedAccounts])
  const accountTypes = useMemo(() => [...selectedAccountTypes].sort(), [selectedAccountTypes])
  const requestKey = JSON.stringify([accounts, accountTypes, dateFrom ?? null, dateTo ?? null])
  const [state, setState] = useState<AssetIrrState | null>(null)

  useEffect(() => {
    if (!dateTo || STATIC_DEMO) return

    const controller = new AbortController()
    requestAssetIrr(accounts, accountTypes, dateFrom, dateTo, controller.signal)
      .then((summary) => {
        if (!controller.signal.aborted) setState({ key: requestKey, summary, error: null })
      })
      .catch((requestError: unknown) => {
        if (controller.signal.aborted) return
        setState({
          key: requestKey,
          summary: null,
          error: requestError instanceof Error ? requestError.message : String(requestError),
        })
      })
    return () => controller.abort()
  }, [accountTypes, accounts, dateFrom, dateTo, requestKey])

  if (STATIC_DEMO) {
    return {
      summary: unavailable,
      loading: false,
      error: 'Asset IRR is available in the local dashboard.',
    }
  }

  const matching = state?.key === requestKey ? state : null
  return {
    summary: matching?.summary ?? unavailable,
    loading: !!dateTo && matching === null,
    error: matching?.error ?? null,
  }
}
