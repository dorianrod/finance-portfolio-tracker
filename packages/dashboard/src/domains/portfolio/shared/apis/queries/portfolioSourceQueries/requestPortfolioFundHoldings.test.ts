import { afterEach, describe, expect, it, vi } from 'vitest'

import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/shared/apis/endpoints'
import { clearCsvCache } from '@/shared/csv/csvData/clearCsvCache'

import { requestPortfolioFundHoldings } from './requestPortfolioFundHoldings'

afterEach(() => {
  clearCsvCache()
  vi.unstubAllGlobals()
})

describe('requestPortfolioFundHoldings', () => {
  it('normalizes current and historical sources and excludes unusable exposures', async () => {
    const sources = new Map([
      [
        PORTFOLIO_ENDPOINTS.data.fundHoldings,
        'parent_isin,holding_id,holding_name,weight,holdings_date\nFUND,SECURITY,Security,0.25,2026-09-30\nFUND,ZERO,Zero weight,0,2026-09-30\nFUND,UNNAMED,,0.1,2026-09-30\n',
      ],
      [
        PORTFOLIO_ENDPOINTS.data.fundHoldingsHistory,
        'parent_isin,holding_id,holding_name,weight,holdings_date,effective_date,history_snapshot_id\nFUND,SECURITY,Security,0.2,2025-09-30,2025-10-01,snapshot-1\n',
      ],
    ])
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        const csv = sources.get(url)
        return new Response(csv ?? null, {
          status: csv === undefined ? 404 : 200,
          headers: { 'Content-Type': 'text/csv' },
        })
      }),
    )

    await expect(requestPortfolioFundHoldings()).resolves.toMatchObject({
      holdings: [
        {
          holdingId: 'SECURITY',
          weight: 0.25,
          holdingsDate: new Date('2026-09-30'),
        },
      ],
      history: [
        {
          holdingId: 'SECURITY',
          weight: 0.2,
          effectiveDate: new Date('2025-10-01'),
          historySnapshotId: 'snapshot-1',
        },
      ],
      statuses: [],
    })
  })

  it('rejects invalid source values instead of returning partial data', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(
            'holding_id,holding_name,weight\nSECURITY,Security,invalid\n',
            {
              headers: { 'Content-Type': 'text/csv' },
            },
          ),
      ),
    )

    await expect(requestPortfolioFundHoldings()).rejects.toMatchObject({
      name: 'ValidationError',
    })
  })
})
