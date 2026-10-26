// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createStore, Provider } from 'jotai'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { DiversificationInputs } from '@/domains/portfolio/features/diversification/shared/types/diversificationInputs.type'
import { makePosition } from '@/domains/portfolio/shared/mocks/position.mock'
import i18n from '@/i18n/i18n'

import { ConcentrationSection } from './ConcentrationSection.feature'

beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  }))
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('concentration view variants', () => {
  it('preserves the current concentration method through a visit to historical trends', async () => {
    const user = userEvent.setup()
    const store = createStore()
    const inputs: Omit<DiversificationInputs, 'rawData'> = {
      positions: [makePosition()],
      rawPositions: [],
      fundHoldings: [],
      fundHoldingsHistory: [],
      accountFilters: new Set(),
      accountTypeFilters: new Set(),
    }
    const { rerender } = render(
      <Provider store={store}>
        <ConcentrationSection {...inputs} view="current" />
      </Provider>,
    )
    const underlyingLabel = i18n.t(
      'ui.concentrationmodetoggle.underlyingAssets',
    )

    await user.click(screen.getByRole('button', { name: underlyingLabel }))
    expect(
      screen
        .getByRole('button', { name: underlyingLabel })
        .getAttribute('aria-pressed'),
    ).toBe('true')

    rerender(
      <Provider store={store}>
        <ConcentrationSection {...inputs} view="trend" />
      </Provider>,
    )
    rerender(
      <Provider store={store}>
        <ConcentrationSection {...inputs} view="current" />
      </Provider>,
    )

    expect(
      screen
        .getByRole('button', { name: underlyingLabel })
        .getAttribute('aria-pressed'),
    ).toBe('true')
  })
})
