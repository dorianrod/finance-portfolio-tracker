import { useEffect, useMemo, useState } from 'react'
import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/apis/endpoints'
import * as yup from 'yup'

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

const ASSET_IRR_REQUEST_SCHEMA = yup.object({
  accounts: yup.array(yup.string().defined()).defined(),
  account_types: yup.array(yup.string().defined()).defined(),
  date_from: yup.string().nullable().defined(),
  date_to: yup.string().nullable().defined(),
})

const ASSET_IRR_ITEM_SCHEMA: yup.ObjectSchema<AssetIrrItem> = yup.object({
  key: yup.string().defined(),
  label: yup.string().ensure().defined(),
  name: yup.string().ensure().defined(),
  irr: yup.number().defined(),
  value: yup.number().defined(),
  accounts: yup.array(yup.string().defined()).default([]).defined(),
  account_types: yup.array(yup.string().defined()).default([]).defined(),
})

const ASSET_IRR_RESPONSE_SCHEMA: yup.ObjectSchema<AssetIrrSummary> = yup.object({
  available: yup.boolean().defined(),
  start_date: yup.string().nullable().default(null).defined(),
  end_date: yup.string().nullable().default(null).defined(),
  assets: yup.array(ASSET_IRR_ITEM_SCHEMA).default([]).defined(),
})

const ERROR_RESPONSE_SCHEMA = yup.object({
  error: yup.string().ensure().defined(),
})

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
  const body = await ASSET_IRR_REQUEST_SCHEMA.validate({
    accounts,
    account_types: accountTypes,
    date_from: dateFrom ?? null,
    date_to: dateTo ?? null,
  }, { stripUnknown: true })
  const response = await fetchImpl(PORTFOLIO_ENDPOINTS.api.assetIrr, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  })
  const payload: unknown = await response.json()
  if (!response.ok) {
    const errorResponse = await ERROR_RESPONSE_SCHEMA.validate(payload, { stripUnknown: true })
    throw new Error(errorResponse.error || `Asset IRR request failed (${response.status})`)
  }
  return ASSET_IRR_RESPONSE_SCHEMA.validate(payload, { stripUnknown: true })
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
