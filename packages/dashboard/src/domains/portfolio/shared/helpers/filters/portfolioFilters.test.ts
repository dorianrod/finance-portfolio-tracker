import { describe, expect, it } from 'vitest'

import { filterVisibilityForTab } from '@/app/helpers/presenters/filterVisibilityForTab'
import { clearFilterGroup } from '@/domains/portfolio/features/scope-selection/helpers/filters/clearFilterGroup'
import { presetDateFrom } from '@/domains/portfolio/features/scope-selection/helpers/filters/presetDateFrom'
import { resetFilters } from '@/domains/portfolio/features/scope-selection/helpers/filters/resetFilters'
import { toggle } from '@/domains/portfolio/features/scope-selection/helpers/filters/toggle'
import type { DashboardFilters } from '@/domains/portfolio/shared/types/dashboardFilters.type'

function filters(overrides: Partial<DashboardFilters> = {}): DashboardFilters {
  return {
    accountTypes: new Set(),
    accounts: new Set(),
    operationTypes: new Set(),
    hideClosedPositions: true,
    ...overrides,
  }
}

describe('toggle', () => {
  it('adds a value not yet in the set, without mutating the original', () => {
    const original = new Set(['a'])
    const next = toggle(original, 'b')
    expect(next).toEqual(new Set(['a', 'b']))
    expect(original).toEqual(new Set(['a']))
  })

  it('removes a value already in the set', () => {
    expect(toggle(new Set(['a', 'b']), 'a')).toEqual(new Set(['b']))
  })
})

describe('presetDateFrom', () => {
  it.each([
    [0, new Date('2026-10-01')],
    [6, new Date('2026-04-30')],
    [1, new Date('2026-09-30')],
  ])(
    'anchors the %i-month preset without rolling into another month',
    (months, expected) => {
      expect(presetDateFrom(months, new Date('2026-10-31T12:00:00Z'))).toEqual(
        expected,
      )
    },
  )
})

describe('filterVisibilityForTab', () => {
  it.each(['overview', 'wealth', 'performance'])(
    'shows the period filter on %s',
    (tab) => expect(filterVisibilityForTab(tab).showPeriod).toBe(true),
  )

  it.each(['diversification', 'underlying', 'quality'])(
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

describe('filter reset helpers', () => {
  const active = filters({
    accountTypes: new Set(['PEA']),
    accounts: new Set(['pea']),
    operationTypes: new Set(['BUY']),
    hideClosedPositions: false,
    dateFrom: new Date('2026-01-01'),
  })

  it('clears one summary group without changing the others', () => {
    const next = clearFilterGroup(active, 'accounts')
    expect(next.accounts).toEqual(new Set())
    expect(next.accountTypes).toEqual(new Set())
    expect(next.operationTypes).toEqual(new Set(['BUY']))
    expect(next.dateFrom).toEqual(new Date('2026-01-01'))
  })

  it('restores every filter to its default', () => {
    expect(resetFilters()).toEqual(filters())
  })
})
