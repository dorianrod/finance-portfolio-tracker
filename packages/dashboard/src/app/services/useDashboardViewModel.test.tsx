import { renderToStaticMarkup } from 'react-dom/server'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Provider, createStore } from 'jotai'
import { describe, expect, it } from 'vitest'
import { useDashboardViewModel } from './useDashboardViewModel'

function DashboardViewModelProbe() {
  const viewModel = useDashboardViewModel()

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
    const store = createStore()
    const html = renderToStaticMarkup(
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <DashboardViewModelProbe />
        </Provider>
      </QueryClientProvider>,
    )

    expect(html).toContain('data-loading="true"')
    expect(html).toContain('data-accounts="0"')
    expect(html).toContain('data-positions="0"')
  })
})
