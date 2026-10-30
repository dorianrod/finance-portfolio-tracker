import { describe, expect, it } from 'vitest'

import { sortPositionsForTable } from '@/domains/portfolio/features/holdings/features/positions/helpers/transformers/sortPositionsForTable/sortPositionsForTable'
import { position } from '@/domains/portfolio/shared/mocks/filteredPosition.mock'

describe('sortPositionsForTable', () => {
  it.each([
    ['asc', ['low', 'middle', 'high']],
    ['desc', ['high', 'middle', 'low']],
  ] as const)(
    'sorts %s even when account-type metadata is missing',
    (direction, expected) => {
      const positions = [
        position({ id: 'middle', account_type: undefined, total_value: 500 }),
        position({ id: 'high', account_type: undefined, total_value: 900 }),
        position({ id: 'low', account_type: undefined, total_value: 100 }),
      ]
      const result = sortPositionsForTable(
        positions,
        false,
        [],
        'total_value',
        direction,
      )
      expect(result.map((row) => row.id)).toEqual(expected)
      expect(positions.map((row) => row.id)).toEqual(['middle', 'high', 'low'])
    },
  )

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
