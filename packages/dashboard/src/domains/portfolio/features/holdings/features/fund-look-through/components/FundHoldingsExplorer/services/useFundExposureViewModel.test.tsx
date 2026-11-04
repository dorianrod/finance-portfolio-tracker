// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, renderHook } from '@testing-library/react'
import { createStore, Provider } from 'jotai'
import type { PropsWithChildren } from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import { makeIssuerHolding } from '@/domains/portfolio/features/holdings/features/fund-look-through/mocks/issuerHolding.mock'
import { makeIssuerPosition } from '@/domains/portfolio/features/holdings/features/fund-look-through/mocks/issuerPosition.mock'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import { makeFundHoldingsData } from '@/domains/portfolio/shared/mocks/fundHoldingsData.mock'
import { makeFundHoldingStatus } from '@/domains/portfolio/shared/mocks/fundHoldingStatus.mock'

import { useFundExposureViewModel } from './useFundExposureViewModel'

afterEach(cleanup)

function renderModel() {
  const holdings = [makeIssuerHolding({ weight: 1 })]
  const positions = [
    makeIssuerPosition({ isin: 'FUND', name: 'World ETF', total_value: 100 }),
    makeIssuerPosition({
      id: 'direct',
      isin: 'DIRECT',
      name: 'Direct security',
      total_value: 100,
    }),
  ]
  const client = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity, gcTime: 0 } },
  })
  client.setQueryData(
    portfolioQueryKeys.data('fund-holdings'),
    makeFundHoldingsData({
      holdings,
      statuses: [
        makeFundHoldingStatus({
          parentId: 'FUND',
          parentIsin: 'FUND',
          parentName: 'World ETF',
        }),
      ],
    }),
  )
  const store = createStore()
  function Wrapper({ children }: PropsWithChildren) {
    return (
      <QueryClientProvider client={client}>
        <Provider store={store}>{children}</Provider>
      </QueryClientProvider>
    )
  }
  return renderHook(
    ({ positions, holdings }) => useFundExposureViewModel(positions, holdings),
    {
      wrapper: Wrapper,
      initialProps: { positions, holdings },
    },
  )
}

describe('useFundExposureViewModel', () => {
  it('preserves financial entities across disclosure, sorting and ordinary search', () => {
    const { result } = renderModel()
    const displayed = result.current.displayed
    const issuer = displayed[0]
    act(() => result.current.toggleIssuer(issuer.id))
    expect(result.current.displayed).toBe(displayed)
    expect(result.current.rows.some(({ kind }) => kind === 'security')).toBe(
      true,
    )
    act(() => result.current.setSort('name'))
    expect(result.current.displayed.find(({ id }) => id === issuer.id)).toBe(
      issuer,
    )
    act(() => result.current.setQuery('company'))
    expect(result.current.displayed).toEqual([issuer])
    expect(result.current.displayed[0]).toBe(issuer)
    expect(result.current.totalIssuerCount).toBe(2)
  })

  it('recomputes fund scope and financial inputs while preserving empty-search behavior', () => {
    const { result, rerender } = renderModel()
    act(() => result.current.setQuery('  WORLD ETF  '))
    expect(result.current.displayed).toHaveLength(1)
    expect(result.current.displayed[0]).toMatchObject({
      value: 100,
      weight: 100,
    })
    rerender({
      positions: [
        makeIssuerPosition({
          isin: 'FUND',
          name: 'World ETF',
          total_value: 200,
        }),
      ],
      holdings: [makeIssuerHolding({ weight: 0.5 })],
    })
    expect(result.current.displayed[0]).toMatchObject({
      value: 100,
      weight: 50,
    })
    act(() => result.current.setQuery('missing'))
    expect(result.current.displayed).toEqual([])
    expect(result.current.totalIssuerCount).toBe(1)
    act(() => result.current.setQuery(''))
    expect(result.current.displayed[0]).toMatchObject({
      value: 100,
      weight: 50,
    })
    rerender({ positions: [], holdings: [] })
    expect(result.current.totalIssuerCount).toBe(0)
    expect(result.current.rows).toEqual([])
  })
})
