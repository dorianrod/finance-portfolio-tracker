import { describe, expect, it } from 'vitest'

import { exposureSource } from '@/domains/portfolio/features/holdings/features/fund-look-through/mocks/exposureSource.mock'

import { buildExposureSourceRows } from './buildExposureSourceRows'

describe('exposure source row identity', () => {
  it('keeps direct identity distinct from every literal fund name', () => {
    const sources = [
      exposureSource({ fund: null }),
      exposureSource({ fund: 'null' }),
      exposureSource({ fund: 'Direct' }),
    ]

    expect(buildExposureSourceRows(sources)).toEqual([
      { key: 'null', source: sources[0] },
      { key: '"null"', source: sources[1] },
      { key: '"Direct"', source: sources[2] },
    ])
  })

  it('preserves an empty source list', () => {
    expect(buildExposureSourceRows([])).toEqual([])
  })
})
