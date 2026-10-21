import { describe, it, expect } from 'vitest'
import type { Filters } from '@/types/filters'
import {
  accountLabel,
  clearFilterGroup,
  filterSummaries,
  filterVisibilityForTab,
  presetDateFrom,
  resetFilters,
  toggle,
} from './filterBar.logic'

function filters(overrides: Partial<Filters> = {}): Filters {
  return {
    accountTypes: new Set(),
    accounts: new Set(),
    operationTypes: new Set(),
    hideClosedPositions: true,
    ...overrides,
  }
}

describe('accountLabel', () => {
  it('uses the provided label when one exists for the account', () => {
    expect(accountLabel('acc1', { acc1: 'Compte Bourse' })).toBe('Compte Bourse')
  })

  it('falls back to title-casing the account key when no label exists', () => {
    expect(accountLabel('my_savings_account', {})).toBe('My Savings Account')
  })
})

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
  it('returns the first day of the current month for the 0-month preset', () => {
    const now = new Date()
    const expected = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
    expect(presetDateFrom(0)).toBe(expected)
  })

  it('subtracts the given number of months from today otherwise', () => {
    const now = new Date()
    const d = new Date(now)
    d.setMonth(d.getMonth() - 6)
    expect(presetDateFrom(6)).toBe(d.toISOString().slice(0, 10))
  })
})

describe('filterVisibilityForTab', () => {
  it.each(['overview', 'wealth', 'performance'])(
    'shows the period filter on %s',
    (tab) => expect(filterVisibilityForTab(tab).showPeriod).toBe(true),
  )

  it.each(['allocation', 'underlying', 'quality'])('shows the period filter on %s', (tab) => {
    expect(filterVisibilityForTab(tab).showPeriod).toBe(true)
  })

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

describe('filterSummaries', () => {
  it('summarizes account, period, and operation groups', () => {
    expect(filterSummaries(filters({
      accounts: new Set(['pea', 'cto']),
      dateFrom: '2026-01-01',
      dateTo: '2026-06-30',
      operationTypes: new Set(['BUY']),
      hideClosedPositions: false,
    }), {}, filterVisibilityForTab('holdings', 'positions'))).toEqual([
      { key: 'accounts', label: '2 accounts' },
      { key: 'period', label: '2026-01-01 → 2026-06-30' },
      { key: 'operations', label: 'Buy' },
      { key: 'closed-positions', label: 'Closed positions included' },
    ])
  })

  it('uses a friendly account name for a single selection', () => {
    expect(filterSummaries(
      filters({ accounts: new Set(['pea']) }),
      { pea: 'My PEA' },
      filterVisibilityForTab('overview'),
    )[0]).toEqual({ key: 'accounts', label: 'My PEA' })
  })

  it('keeps the period visible while hiding position-only filters', () => {
    expect(filterSummaries(filters({
      dateFrom: '2026-01-01',
      operationTypes: new Set(['BUY']),
    }), {}, filterVisibilityForTab('holdings', 'underlying'))).toEqual([
      { key: 'period', label: 'Since 2026-01-01' },
    ])
  })
})

describe('filter reset helpers', () => {
  const active = filters({
    accountTypes: new Set(['PEA']),
    accounts: new Set(['pea']),
    operationTypes: new Set(['BUY']),
    hideClosedPositions: false,
    dateFrom: '2026-01-01',
  })

  it('clears one summary group without changing the others', () => {
    const next = clearFilterGroup(active, 'accounts')
    expect(next.accounts).toEqual(new Set())
    expect(next.accountTypes).toEqual(new Set())
    expect(next.operationTypes).toEqual(new Set(['BUY']))
    expect(next.dateFrom).toBe('2026-01-01')
  })

  it('restores every filter to its default', () => {
    expect(resetFilters()).toEqual(filters())
  })
})
