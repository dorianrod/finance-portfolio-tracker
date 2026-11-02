import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it } from 'vitest'

import { resetFilters } from '@/domains/portfolio/features/scope-selection/helpers/transformers/resetFilters'

import { FilterScopePresentation } from './FilterScopePresentation.view'

it('formats supplied filter context with the metric snapshot instead of the requested end date', () => {
  const html = renderToStaticMarkup(
    <FilterScopePresentation
      scope={{
        account: 'filterable',
        period: 'as-of',
        effectiveDate: new Date('2025-04-30'),
      }}
      scopeContext={{
        filters: {
          ...resetFilters(),
          accounts: new Set(['first', 'second']),
          dateTo: new Date('2026-10-31'),
        },
        accountLabels: {},
      }}
    />,
  )
  expect(html).toContain('2 accounts')
  expect(html).toContain('2025')
  expect(html).not.toContain('2026')
})
