// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import { makePortfolioHistoryPoint } from '@/domains/portfolio/shared/mocks/portfolioHistoryPoint.mock'
import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'

import { useCachedPortfolioSourceQuery } from './useCachedPortfolioSourceQuery'

const clients: QueryClient[] = []
afterEach(() => {
  cleanup()
  clients.splice(0).forEach((client) => client.clear())
  vi.unstubAllGlobals()
})
function setup() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  clients.push(client)
  function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
  return { client, wrapper: Wrapper }
}
const key = portfolioQueryKeys.data('portfolio-history')

describe('useCachedPortfolioSourceQuery', () => {
  it('observes source cache updates without acquiring data', async () => {
    const fetchMock = vi.fn<typeof fetch>()
    vi.stubGlobal('fetch', fetchMock)
    const { client, wrapper } = setup()
    const original = [makePortfolioHistoryPoint()]
    client.setQueryData(key, original)
    const { result } = renderHook(
      () => useCachedPortfolioSourceQuery<PortfolioHistoryPoint[]>(key),
      { wrapper },
    )
    expect(result.current.data).toEqual(original)
    const updated = [makePortfolioHistoryPoint({ total_value: 250 })]
    await act(async () => {
      client.setQueryData(key, updated)
    })
    await waitFor(() => expect(result.current.data).toEqual(updated))
    expect(fetchMock).not.toHaveBeenCalled()
  })
  it('leaves a missing source pending and idle', () => {
    const { wrapper } = setup()
    const { result } = renderHook(
      () => useCachedPortfolioSourceQuery<PortfolioHistoryPoint[]>(key),
      { wrapper },
    )
    expect(result.current.data).toBeUndefined()
    expect(result.current.isPending).toBe(true)
    expect(result.current.fetchStatus).toBe('idle')
  })
  it('observes an acquisition error from the source owner', async () => {
    const { client, wrapper } = setup()
    const error = new Error('Source failed')
    await expect(
      client.query({
        queryKey: key,
        queryFn: () => Promise.reject(error),
      }),
    ).rejects.toBe(error)
    const { result } = renderHook(
      () => useCachedPortfolioSourceQuery<PortfolioHistoryPoint[]>(key),
      { wrapper },
    )
    await waitFor(() => expect(result.current.error).toBe(error))
    expect(result.current.fetchStatus).toBe('idle')
  })
})
