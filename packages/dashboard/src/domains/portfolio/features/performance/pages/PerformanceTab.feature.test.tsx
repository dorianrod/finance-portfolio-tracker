// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen } from '@testing-library/react'
import { createStore, Provider } from 'jotai'
import { afterEach, describe, expect, it } from 'vitest'

import { computePerformanceSummary } from '@/domains/portfolio/features/performance/helpers/calculators/performanceCalculations/computePerformanceSummary'
import { computeTrailing12mIncome } from '@/domains/portfolio/features/performance/helpers/calculators/performanceCalculations/computeTrailing12mIncome'
import type { IrrStatus } from '@/domains/portfolio/shared/types/statuses.type'

import { PerformanceTab } from './PerformanceTab.feature'

afterEach(cleanup)

describe('performance page account labels', () => {
  it.each<{
    filtered: boolean
    status: IrrStatus
    label: string
  }>([
    { filtered: false, status: 'ready', label: 'IRR since tracking' },
    {
      filtered: true,
      status: 'ready',
      label: 'IRR since tracking · selected accounts',
    },
    { filtered: true, status: 'loading', label: 'IRR since tracking' },
    { filtered: true, status: 'error', label: 'IRR since tracking' },
  ])(
    'labels filtered=$filtered returns with status=$status',
    ({ filtered, status, label }) => {
      const client = new QueryClient({
        defaultOptions: { queries: { retry: false, gcTime: 0 } },
      })
      render(
        <Provider store={createStore()}>
          <QueryClientProvider client={client}>
            <PerformanceTab
              history={[]}
              passiveIncome={[]}
              rawPositions={[]}
              rawOperations={[]}
              accountFilters={new Set(filtered ? ['account'] : [])}
              accountTypeFilters={new Set()}
              performance={computePerformanceSummary([])}
              income={computeTrailing12mIncome([])}
              globalTri={null}
              irrStatus={status}
            />
          </QueryClientProvider>
        </Provider>,
      )
      expect(screen.getByText(label, { exact: true })).toBeTruthy()
    },
  )
})
