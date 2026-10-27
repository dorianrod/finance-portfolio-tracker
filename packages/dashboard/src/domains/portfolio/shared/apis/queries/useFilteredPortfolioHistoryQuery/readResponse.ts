// eslint-disable-next-line local/review-shared-feature-sharing -- The shell supplies this validated, scoped history to overview comparisons, wealth analysis and performance. See SHARED_OWNERSHIP_AUDIT.md.
import type { PortfolioHistoryResponse } from '@/domains/portfolio/shared/types/portfolioHistoryResponse.type'
import { readJsonResponse } from '@/shared/http/readJsonResponse'

import { FILTERED_HISTORY_RESPONSE_SCHEMA } from './filteredHistoryResponseSchema'

export async function readResponse(
  response: Response,
): Promise<PortfolioHistoryResponse> {
  const payload = await readJsonResponse(response)
  return FILTERED_HISTORY_RESPONSE_SCHEMA.validate(payload, {
    stripUnknown: true,
  })
}
