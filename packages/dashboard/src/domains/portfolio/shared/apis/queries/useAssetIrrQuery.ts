import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/shared/apis/endpoints'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import type { AssetIrrItem, AssetIrrSummary } from '@/domains/portfolio/shared/types/assetIrr.type'
import { readJsonResponse } from '@/shared/http/readJsonResponse'
import {
  DATE_REQUEST_SCHEMA,
  OPTIONAL_CALENDAR_DATE_SCHEMA,
} from '@/shared/schemas/calendarDate.schema'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import * as yup from 'yup'

const STATIC_DEMO = import.meta.env.VITE_STATIC_DEMO === 'true'

const ASSET_IRR_REQUEST_SCHEMA = yup.object({
  accounts: yup.array(yup.string().defined()).defined(),
  account_types: yup.array(yup.string().defined()).defined(),
  date_from: DATE_REQUEST_SCHEMA,
  date_to: DATE_REQUEST_SCHEMA,
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
  start_date: OPTIONAL_CALENDAR_DATE_SCHEMA,
  end_date: OPTIONAL_CALENDAR_DATE_SCHEMA,
  assets: yup.array(ASSET_IRR_ITEM_SCHEMA).default([]).defined(),
})

export const UNAVAILABLE_ASSET_IRR_SUMMARY: AssetIrrSummary = {
  available: false,
  start_date: null,
  end_date: null,
  assets: [],
}

export async function requestAssetIrr(
  accounts: string[],
  accountTypes: string[],
  dateFrom: Date | undefined,
  dateTo: Date | undefined,
  signal: AbortSignal,
  fetchImpl: typeof fetch = fetch,
): Promise<AssetIrrSummary> {
  const body = await ASSET_IRR_REQUEST_SCHEMA.validate(
    {
      accounts,
      account_types: accountTypes,
      date_from: dateFrom ?? null,
      date_to: dateTo ?? null,
    },
    { stripUnknown: true },
  )
  const response = await fetchImpl(PORTFOLIO_ENDPOINTS.api.assetIrr, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  })
  const payload = await readJsonResponse(response)
  return ASSET_IRR_RESPONSE_SCHEMA.validate(payload, { stripUnknown: true })
}

export function useAssetIrrQuery(
  selectedAccounts: Set<string>,
  selectedAccountTypes: Set<string>,
  dateFrom: Date | undefined,
  dateTo: Date | undefined,
) {
  const accounts = useMemo(() => [...selectedAccounts].toSorted(), [selectedAccounts])
  const accountTypes = useMemo(() => [...selectedAccountTypes].toSorted(), [selectedAccountTypes])
  return useQuery<AssetIrrSummary>({
    queryKey: portfolioQueryKeys.data('asset-irr', accounts, accountTypes, dateFrom, dateTo),
    queryFn: ({ signal }) =>
      STATIC_DEMO
        ? UNAVAILABLE_ASSET_IRR_SUMMARY
        : requestAssetIrr(accounts, accountTypes, dateFrom, dateTo, signal),
    enabled: Boolean(dateTo),
  })
}
