import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createStore, Provider } from 'jotai'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { createDataQualityTabProps } from '@/domains/portfolio/features/data-quality/features/assessment/mocks/dataQualityTabProps.mock'
import { dashboardSelectedQualityThemeAtom } from '@/domains/portfolio/features/data-quality/features/assessment/stores/dashboardQuality.atoms'
import { createManualPriceOverride as fixtureManualPriceOverride } from '@/domains/portfolio/features/data-quality/shared/mocks/manualPriceOverride.mock'
import { pipelineError as fixturePipelineError } from '@/domains/portfolio/features/data-quality/shared/mocks/pipelineError.mock'

import { DashboardDataQuality } from './DashboardDataQuality.feature'

const INPUTS = createDataQualityTabProps({
  errors: [
    fixturePipelineError({
      source: 'prices',
      level: 'error',
      account: 'broker',
      isin: 'ERROR_ASSET',
      name: 'Missing price asset',
      message: 'Price unavailable for regression asset',
    }),
  ],
  manualPriceOverrides: [
    fixtureManualPriceOverride({
      name: 'Manual override asset',
      ticker: 'MANUAL',
      price: 42,
      source_file: 'prices.csv',
    }),
  ],
})

describe('quality feature composition', () => {
  it.each([
    [
      'pipeline',
      'Price unavailable for regression asset',
      'Manual override asset',
    ],
    [
      'prices',
      'Manual override asset',
      'Price unavailable for regression asset',
    ],
  ] as const)(
    'renders the selected %s responsibility through the application composition',
    (theme, visible, hidden) => {
      const store = createStore()
      store.set(dashboardSelectedQualityThemeAtom, theme)
      const client = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      })
      const html = renderToStaticMarkup(
        <QueryClientProvider client={client}>
          <Provider store={store}>
            <DashboardDataQuality {...INPUTS} />
          </Provider>
        </QueryClientProvider>,
      )
      expect(html).toContain(visible)
      expect(html).not.toContain(hidden)
      client.clear()
    },
  )
})
