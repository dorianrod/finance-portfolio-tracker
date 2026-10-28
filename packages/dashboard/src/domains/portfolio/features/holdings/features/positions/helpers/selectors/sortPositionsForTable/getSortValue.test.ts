import { describe, expect, it } from 'vitest'

import { getSortValue } from '@/domains/portfolio/features/holdings/features/positions/helpers/selectors/sortPositionsForTable/getSortValue'
import { position } from '@/domains/portfolio/shared/mocks/filteredPosition.mock'

describe('getSortValue', () => {
  it('reads total_dividends as dividends + interest combined', () => {
    expect(
      getSortValue(
        position({ total_dividends: 10, total_interest: 5 }),
        'total_dividends',
      ),
    ).toBe(15)
  })
})
