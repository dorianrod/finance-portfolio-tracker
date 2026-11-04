import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { clearCsvCache } from '@/shared/csv/csvData/clearCsvCache'

import type { FundHoldingsWorkerMessage } from './portfolioFundHoldings.worker'

const scope = {
  onmessage: null as (() => void) | null,
  postMessage: vi.fn<(data: FundHoldingsWorkerMessage) => void>(),
}
beforeEach(() => {
  vi.resetModules()
  scope.onmessage = null
  scope.postMessage.mockClear()
  vi.stubGlobal('self', scope)
})
afterEach(() => {
  clearCsvCache()
  vi.unstubAllGlobals()
})

describe('fund holdings worker entrypoint', () => {
  it('responds with validated data when optional sources are absent', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(null, { status: 404 })),
    )
    await import('./portfolioFundHoldings.worker')
    scope.onmessage?.()

    await vi.waitFor(() => {
      expect(scope.postMessage).toHaveBeenCalledExactlyOnceWith({
        holdings: [],
        history: [],
        statuses: [],
      })
    })
  })

  it('returns source failures to the query instead of leaving it pending', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(null, { status: 503 })),
    )
    await import('./portfolioFundHoldings.worker')
    scope.onmessage?.()

    await vi.waitFor(() => {
      expect(scope.postMessage).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({ message: 'HTTP 503' }),
      )
    })
  })
})
