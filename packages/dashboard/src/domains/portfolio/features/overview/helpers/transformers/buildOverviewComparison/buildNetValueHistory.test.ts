import { describe, expect, it } from 'vitest'

import { position } from '@/domains/portfolio/features/overview/mocks/overviewPosition.mock'

import { buildNetValueHistory } from './buildNetValueHistory'

describe('buildNetValueHistory', () => {
  it.each([
    { gross: 100, gain: 20, netGain: 14, expected: 94 },
    { gross: 100, gain: 0, netGain: 0, expected: 100 },
    { gross: 100, gain: -20, netGain: -20, expected: 100 },
    { gross: null, gain: 20, netGain: 14, expected: null },
    { gross: 100, gain: null, netGain: 14, expected: null },
    { gross: 100, gain: 20, netGain: null, expected: null },
    { gross: 100, gain: 20, netGain: NaN, expected: null },
  ])(
    'deducts only known estimated tax: $gross / $gain / $netGain',
    ({ gross, gain, netGain, expected }) => {
      const result = buildNetValueHistory(
        [
          position({
            total_value: gross,
            unrealized_gain: gain,
            unrealized_gain_net: netGain,
          }),
        ],
        new Set(),
        new Set(),
      )
      expect(result).toEqual([
        { date: new Date('2025-01-31'), value: expected },
      ])
    },
  )

  it('aggregates only selected accounts and account types', () => {
    const result = buildNetValueHistory(
      [
        position({ total_value: 100 }),
        position({ total_value: 200 }),
        position({ account: 'B', total_value: 1000 }),
        position({ account_type: 'Savings', total_value: 1000 }),
      ],
      new Set(['A']),
      new Set(['Brokerage']),
    )
    expect(result).toEqual([{ date: new Date('2025-01-31'), value: 294 }])
  })

  it('keeps the latest snapshot unknown when any selected position lacks tax data', () => {
    const result = buildNetValueHistory(
      [
        position(),
        position({ snapshot_date: new Date('2025-02-28'), total_value: 200 }),
        position({
          snapshot_date: new Date('2025-02-28'),
          unrealized_gain_net: null,
        }),
      ],
      new Set(),
      new Set(),
    )
    expect(result).toEqual([
      { date: new Date('2025-01-31'), value: 97 },
      { date: new Date('2025-02-28'), value: null },
    ])
  })
})
