import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { FilterScopeBadges, FilterScopeProvider } from './FilterScopeBadges'
import type { Filters } from '@/types/filters'

function render(filters: Filters, period: Parameters<typeof FilterScopeBadges>[0]['period'], account: Parameters<typeof FilterScopeBadges>[0]['account'] = 'filterable') {
  return renderToStaticMarkup(
    <FilterScopeProvider filters={filters} accountLabels={{ acc1: 'Main PEA' }}>
      <FilterScopeBadges account={account} period={period} />
    </FilterScopeProvider>,
  )
}

function filters(overrides: Partial<Filters> = {}): Filters {
  return {
    accounts: new Set(), accountTypes: new Set(), operationTypes: new Set(), hideClosedPositions: true,
    ...overrides,
  }
}

describe('FilterScopeBadges', () => {
  it('shows applied account and range scopes', () => {
    const html = render(filters({ accounts: new Set(['acc1']), dateFrom: '2026-01-01', dateTo: '2026-06-30' }), 'range')
    expect(html).toContain('Main PEA')
    expect(html).toContain('Selected period')
  })

  it('warns when a global account scope ignores an active selection', () => {
    const html = render(filters({ accounts: new Set(['acc1']) }), 'year-range', 'global')
    expect(html).toContain('Global accounts')
    expect(html).toContain('text-amber-300')
  })

  it('distinguishes an as-of date from a start-only filter', () => {
    expect(render(filters({ dateTo: '2026-06-30' }), 'as-of')).toContain('As of 30 Jun 2026')
    expect(render(filters({ dateFrom: '2026-01-01' }), 'as-of')).toContain('Latest snapshot · start ignored')
  })
})
