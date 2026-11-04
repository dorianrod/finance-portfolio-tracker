// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createInstance } from 'i18next'
import { createStore, Provider } from 'jotai'
import { I18nextProvider } from 'react-i18next'
import { afterEach, describe, expect, it } from 'vitest'

import { dashboardDiversificationFilterAtom } from '@/domains/portfolio/features/diversification/features/allocation/stores/dashboardAllocation/dashboardDiversificationFilter.atoms'

import { FilterChipBar } from './FilterChipBar.feature'

afterEach(cleanup)

describe('allocation filter chip', () => {
  it('renders no filter action without a selection', () => {
    render(
      <Provider store={createStore()}>
        <FilterChipBar />
      </Provider>,
    )
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('uses the provider label and clears the selected allocation', async () => {
    const user = userEvent.setup()
    const store = createStore()
    store.set(dashboardDiversificationFilterAtom, {
      type: 'geo',
      value: 'France',
    })
    const translations = createInstance()
    await translations.init({
      lng: 'en',
      keySeparator: false,
      resources: {
        en: { translation: { 'ui.filterchipbar.geo': 'Local geography' } },
      },
    })
    render(
      <Provider store={store}>
        <I18nextProvider i18n={translations}>
          <FilterChipBar />
        </I18nextProvider>
      </Provider>,
    )
    await user.click(
      screen.getByRole('button', { name: /Local geography.*France/ }),
    )
    expect(store.get(dashboardDiversificationFilterAtom)).toBeNull()
    expect(screen.queryByRole('button')).toBeNull()
  })
})
