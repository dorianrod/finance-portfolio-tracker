// @vitest-environment jsdom
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'

import { createDashboardTestContext } from '@/app/mocks/dashboardTestContext.mock'
import { dashboardSelectedQualityThemeAtom } from '@/domains/portfolio/features/data-quality/features/assessment/stores/dashboardQuality.atoms'
import { pipelineError } from '@/domains/portfolio/features/data-quality/shared/mocks/pipelineError.mock'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import { dashboardFiltersAtom } from '@/domains/portfolio/shared/stores/dashboardFilters/dashboardFilters.atoms'
import { dashboardActiveTabAtom } from '@/domains/portfolio/shared/stores/dashboardNavigation/dashboardActiveTab.atoms'

import { DashboardReliability } from './DashboardReliability.feature'

afterEach(cleanup)

describe('DashboardReliability', () => {
  it('selects the combined or pipeline presentation across repeated tab changes and opens its quality scope', async () => {
    const { client, store, wrapper } = createDashboardTestContext()
    const user = userEvent.setup()
    render(<DashboardReliability />, { wrapper })
    expect(
      screen
        .getByRole('button', { name: /^Data quality:/ })
        .getAttribute('aria-label'),
    ).toContain('Portfolio data')
    act(() => store.set(dashboardActiveTabAtom, 'wealth'))
    expect(
      screen.getByRole('button', {
        name: /0 errors and 1 warnings in Portfolio data/,
      }),
    ).toBeTruthy()
    act(() => store.set(dashboardActiveTabAtom, 'diversification'))
    expect(
      screen
        .getByRole('button', { name: /^Data quality:/ })
        .getAttribute('aria-label'),
    ).not.toContain('Portfolio data')
    act(() => store.set(dashboardActiveTabAtom, 'overview'))
    await user.click(screen.getByRole('button', { name: /^Data quality:/ }))
    expect(store.get(dashboardActiveTabAtom)).toBe('quality')
    expect(store.get(dashboardSelectedQualityThemeAtom)).toBe('classification')
    expect(screen.queryByRole('button', { name: /^Data quality:/ })).toBeNull()
    client.clear()
  })

  it('updates the reused summary when sources and account filters change', async () => {
    const { client, store, wrapper } = createDashboardTestContext()
    act(() => {
      store.set(dashboardActiveTabAtom, 'wealth')
      client.setQueryData(portfolioQueryKeys.data('pipeline-errors'), [])
    })
    render(<DashboardReliability />, { wrapper })
    expect(
      screen.getByRole('button', {
        name: /0 errors and 0 warnings in Portfolio data/,
      }),
    ).toBeTruthy()
    act(() => {
      client.setQueryData(portfolioQueryKeys.data('pipeline-errors'), [
        pipelineError({ level: 'error', account: 'outside-scope' }),
      ])
    })
    await waitFor(() =>
      expect(
        screen.getByRole('button', {
          name: /1 errors and 0 warnings in Portfolio data/,
        }),
      ).toBeTruthy(),
    )
    act(() =>
      store.set(dashboardFiltersAtom, (filters) => ({
        ...filters,
        accounts: new Set(['selected-account']),
      })),
    )
    await waitFor(() =>
      expect(
        screen.getByRole('button', {
          name: /0 errors and 0 warnings in Portfolio data/,
        }),
      ).toBeTruthy(),
    )
    act(() => store.set(dashboardActiveTabAtom, 'overview'))
    expect(screen.getByRole('button', { name: /^Data quality:/ })).toBeTruthy()
    client.clear()
  })
})
