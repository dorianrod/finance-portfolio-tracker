import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createStore, Provider } from 'jotai'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import type { DataQualityTabProps } from '@/domains/portfolio/features/data-quality/features/assessment/types/dataQualityTabProps.type'
import { dashboardSelectedQualityThemeAtom } from '@/domains/portfolio/shared/stores/dashboardQuality.atoms'

import { DashboardDataQuality } from './DashboardDataQuality.feature'

const INPUTS: DataQualityTabProps = {
  positions: [],
  errors: [
    {
      source: 'prices',
      level: 'error',
      type: 'missing_price',
      date: null,
      account: 'broker',
      isin: 'ERROR_ASSET',
      ticker: '',
      name: 'Missing price asset',
      message: 'Price unavailable for regression asset',
    },
  ],
  manualPriceOverrides: [
    {
      name: 'Manual override asset',
      ticker: 'MANUAL',
      isin: '',
      price: 42,
      currency: 'EUR',
      date_from: null,
      date_to: null,
      source_file: 'prices.csv',
    },
  ],
  fundStatuses: [],
  fundReport: null,
  fundHoldings: [],
  fundSnapshots: [],
  fundUnresolved: [],
  rawData: { geo: [], secteur: [], currency: [], classe: [], loading: false },
}

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
