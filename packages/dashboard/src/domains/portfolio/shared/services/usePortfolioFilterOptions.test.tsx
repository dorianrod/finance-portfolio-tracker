// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { createDashboardTestContext } from '@/app/mocks/dashboardTestContext.mock'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import { makeDashboardData } from '@/domains/portfolio/shared/mocks/dashboardData.mock'
import { makePosition } from '@/domains/portfolio/shared/mocks/position.mock'

import { usePortfolioFilterOptions } from './usePortfolioFilterOptions'

afterEach(cleanup)

describe('usePortfolioFilterOptions', () => {
  it('returns empty options until the dashboard cache is populated', async () => {
    const { client, wrapper } = createDashboardTestContext(false)
    const { result } = renderHook(usePortfolioFilterOptions, { wrapper })
    expect(result.current).toEqual({
      accountFilterLabels: {},
      accountToType: {},
      allAccounts: [],
      allAccountTypes: [],
      allOperationTypes: [],
    })

    act(() => {
      client.setQueryData(
        portfolioQueryKeys.data('dashboard'),
        makeDashboardData({ positions: [makePosition()] }),
      )
    })
    await waitFor(() => expect(result.current.allAccounts).toEqual(['broker']))
    client.clear()
  })

  it('replaces account, type and operation options when cached positions change', async () => {
    const { client, wrapper } = createDashboardTestContext()
    client.setQueryData(
      portfolioQueryKeys.data('dashboard'),
      makeDashboardData({
        positions: [makePosition()],
        accountLabels: { broker: 'Brokerage' },
      }),
    )
    const { result } = renderHook(usePortfolioFilterOptions, { wrapper })
    expect(result.current).toEqual({
      accountFilterLabels: { broker: 'Brokerage' },
      accountToType: { broker: 'PEA' },
      allAccounts: ['broker'],
      allAccountTypes: ['PEA'],
      allOperationTypes: ['BUY'],
    })

    act(() => {
      client.setQueryData(
        portfolioQueryKeys.data('dashboard'),
        makeDashboardData({
          positions: [
            makePosition({
              id: 'cash-1',
              name: 'Cash reserve',
              account: 'savings',
              account_type: 'CTO – Cash',
              operationTypes: new Set(['INTEREST']),
            }),
          ],
          accountLabels: { savings: 'Savings' },
        }),
      )
    })
    await waitFor(() =>
      expect(result.current).toEqual({
        accountFilterLabels: {
          savings: 'Savings',
          'savings::cash': 'Cash reserve',
        },
        accountToType: { 'savings::cash': 'CTO – Cash' },
        allAccounts: ['savings::cash'],
        allAccountTypes: ['CTO – Cash'],
        allOperationTypes: ['INTEREST'],
      }),
    )
    client.clear()
  })

  it('updates source account labels while positions remain unchanged', async () => {
    const { client, wrapper } = createDashboardTestContext()
    const dashboard = makeDashboardData({ positions: [makePosition()] })
    client.setQueryData(portfolioQueryKeys.data('dashboard'), dashboard)
    const { result } = renderHook(usePortfolioFilterOptions, { wrapper })

    act(() => {
      client.setQueryData(portfolioQueryKeys.data('dashboard'), {
        ...dashboard,
        accountLabels: { broker: 'Renamed account' },
      })
    })
    await waitFor(() =>
      expect(result.current.accountFilterLabels).toEqual({
        broker: 'Renamed account',
      }),
    )
    client.clear()
  })
})
