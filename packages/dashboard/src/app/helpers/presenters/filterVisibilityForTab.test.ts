import { describe, expect, it } from 'vitest'

import { filterVisibilityForTab } from './filterVisibilityForTab'

describe('filterVisibilityForTab', () => {
  it.each(['overview', 'wealth', 'performance'] as const)(
    'shows the period filter on %s',
    (tab) => expect(filterVisibilityForTab(tab).showPeriod).toBe(true),
  )

  it.each(['diversification', 'holdings', 'quality'] as const)(
    'shows the period filter on %s',
    (tab) => {
      expect(filterVisibilityForTab(tab).showPeriod).toBe(true)
    },
  )

  it('uses the active Holdings view to expose the relevant filters', () => {
    expect(filterVisibilityForTab('holdings', 'positions')).toEqual({
      showPeriod: true,
      showPositionFilters: true,
    })
    expect(filterVisibilityForTab('holdings', 'underlying')).toEqual({
      showPeriod: true,
      showPositionFilters: false,
    })
    expect(filterVisibilityForTab('overview').showPositionFilters).toBe(false)
  })
})
