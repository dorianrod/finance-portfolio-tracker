import type { AssetIrrSummary } from '@/domains/portfolio/features/performance/types/assetIrr.type'
import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/shared/apis/endpoints'
import { readJsonResponse } from '@/shared/http/readJsonResponse'

import { ASSET_IRR_REQUEST_SCHEMA } from './assetIrrRequestSchema'
import { ASSET_IRR_RESPONSE_SCHEMA } from './assetIrrResponseSchema'

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
      date_from: dateFrom,
      date_to: dateTo,
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
