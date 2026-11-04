// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createInstance } from 'i18next'
import { createStore, Provider } from 'jotai'
import { I18nextProvider } from 'react-i18next'
import { afterEach, describe, expect, it } from 'vitest'

import { dashboardThemeAtom } from '@/app/stores/theme/dashboardTheme.store'

import { DashboardHeader } from './DashboardHeader.feature'

afterEach(() => {
  cleanup()
  localStorage.clear()
  delete document.documentElement.dataset['theme']
})

describe('DashboardHeader', () => {
  it('still updates its theme through its own subscription after a parent rerender', async () => {
    const store = createStore()
    store.set(dashboardThemeAtom, 'light')
    const user = userEvent.setup()
    const { rerender } = render(
      <Provider store={store}>
        <DashboardHeader />
      </Provider>,
    )
    rerender(
      <Provider store={store}>
        <DashboardHeader />
      </Provider>,
    )
    await user.click(
      screen.getByRole('button', { name: 'Switch to dark mode' }),
    )
    expect(store.get(dashboardThemeAtom)).toBe('dark')
    expect(
      screen.getByRole('button', { name: 'Switch to light mode' }),
    ).toBeTruthy()
    expect(document.documentElement.dataset['theme']).toBe('dark')
  })

  it('receives translation updates through its own subscription', async () => {
    const translations = createInstance()
    await translations.init({
      lng: 'en',
      fallbackLng: 'en',
      keySeparator: false,
      resources: {
        en: { translation: { 'ui.app.portfolio': 'Portfolio' } },
        fr: { translation: { 'ui.app.portfolio': 'Portefeuille' } },
      },
    })
    const store = createStore()
    render(
      <Provider store={store}>
        <I18nextProvider i18n={translations}>
          <DashboardHeader />
        </I18nextProvider>
      </Provider>,
    )
    expect(
      screen.getByRole('heading', { level: 1, name: 'Portfolio' }),
    ).toBeTruthy()
    await act(async () => {
      await translations.changeLanguage('fr')
    })
    expect(
      screen.getByRole('heading', { level: 1, name: 'Portefeuille' }),
    ).toBeTruthy()
  })
})
