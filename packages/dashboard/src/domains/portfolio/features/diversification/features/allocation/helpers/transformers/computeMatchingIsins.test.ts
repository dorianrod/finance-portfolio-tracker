import { describe, expect, it } from 'vitest'

import { rawData } from '@/domains/portfolio/shared/mocks/rawIsinData.mock'
import { isinRow as fixtureRawIsinRow } from '@/domains/portfolio/shared/mocks/rawIsinRow.mock'

import { computeMatchingIsins } from './computeMatchingIsins'

describe('computeMatchingIsins', () => {
  it('returns isins whose latest snapshot has a positive value for the filtered category', () => {
    const data = rawData({
      geo: [
        fixtureRawIsinRow({
          snapshot_date: new Date('2024-01-01'),
          isin: 'A',
          name: 'A',
          values: { france: 100 },
        }),
        fixtureRawIsinRow({
          snapshot_date: new Date('2024-02-01'),
          isin: 'A',
          name: 'A',
          values: { france: 0, europe: 50 },
        }),
        fixtureRawIsinRow({
          snapshot_date: new Date('2024-02-01'),
          isin: 'B',
          name: 'B',
          values: { france: 30 },
        }),
        fixtureRawIsinRow({
          snapshot_date: new Date('2024-01-01'),
          isin: 'OLD',
          name: 'Closed position',
          values: { france: 500 },
        }),
      ],
    })
    expect(
      computeMatchingIsins(data, { type: 'geo', value: 'france' }),
    ).toEqual(new Set(['B']))
  })

  it('returns an empty set when there is no active filter', () => {
    expect(computeMatchingIsins(rawData(), null)).toEqual(new Set())
  })
})
