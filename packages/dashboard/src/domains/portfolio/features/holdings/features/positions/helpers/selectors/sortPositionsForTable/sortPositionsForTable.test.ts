import { describe, expect, it } from 'vitest'

import { sortPositionsForTable } from '@/domains/portfolio/features/holdings/features/positions/helpers/selectors/sortPositionsForTable/sortPositionsForTable'
import { position } from '@/domains/portfolio/shared/mocks/filteredPosition.mock'

describe('sortPositionsForTable', () => {
  it('sorts by descending total_value within account type groups when account types exist', () => {
    const positions = [
      position({ id: 'low', account_type: 'PEA', total_value: 100 }),
      position({ id: 'high', account_type: 'PEA', total_value: 900 }),
    ]
    const result = sortPositionsForTable(
      positions,
      false,
      ['PEA'],
      'total_value',
      'desc',
    )
    expect(result.map((p) => p.id)).toEqual(['high', 'low'])
  })

  it('hides closed positions when requested', () => {
    const positions = [
      position({ id: 'open', status: 'active' }),
      position({ id: 'closed', status: 'closed' }),
    ]
    const result = sortPositionsForTable(
      positions,
      true,
      [],
      'total_value',
      'desc',
    )
    expect(result.map((p) => p.id)).toEqual(['open'])
  })
})
