import { renderToStaticMarkup } from 'react-dom/server'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import { resetFilters } from '@/domains/portfolio/components/filters/filterBar.logic'
import { useDashboardViewModel } from './useDashboardViewModel'

function DashboardViewModelProbe() {
  const viewModel = useDashboardViewModel({
    activeTab: 'overview',
    filters: resetFilters(),
    holdingsView: 'positions',
    sortDir: 'desc',
    sortKey: 'total_value',
  })

  return (
    <output
      data-loading={viewModel.loading}
      data-accounts={viewModel.allAccounts.length}
      data-positions={viewModel.currentPositions.length}
    />
  )
}

describe('useDashboardViewModel', () => {
  it('provides a coherent initial model before data queries resolve', () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    const html = renderToStaticMarkup(
      <QueryClientProvider client={queryClient}>
        <DashboardViewModelProbe />
      </QueryClientProvider>,
    )

    expect(html).toContain('data-loading="true"')
    expect(html).toContain('data-accounts="0"')
    expect(html).toContain('data-positions="0"')
  })
})
