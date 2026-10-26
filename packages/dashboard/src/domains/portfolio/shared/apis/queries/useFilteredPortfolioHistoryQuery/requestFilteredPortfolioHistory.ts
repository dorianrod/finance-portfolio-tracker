import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/shared/apis/endpoints'
import { normalizeAccountSelection } from '@/domains/portfolio/shared/helpers/selectors/normalizeAccountSelection'
import type { PortfolioHistoryResponse } from '@/domains/portfolio/shared/types/portfolioHistoryResponse.type'
import i18n from '@/i18n/i18n'

import { DemoScopeUnavailableError } from './demoScopeUnavailableError'
import { FILTERED_HISTORY_REQUEST_SCHEMA } from './filteredHistoryRequestSchema'
import { readResponse } from './readResponse'
import { sameAccounts } from './sameAccounts'
import { STATIC_DEMO } from './staticDemo'

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
