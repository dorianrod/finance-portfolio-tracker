import { describe, expect, it } from 'vitest'

import { makePosition } from '@/domains/portfolio/shared/mocks/position.mock'
import type { RawIsinData } from '@/domains/portfolio/shared/types/rawIsinData.type'
import type { RawIsinRow } from '@/domains/portfolio/shared/types/rawIsinRow.type'

import { prepareDiversificationScope } from './prepareDiversificationScope'

const investment = makePosition({ account: 'broker', total_value: 100 })
const savings = makePosition({
  account: 'savings',
  account_type: 'Savings',
  account_category: 'savings',
  total_value: 200,
})
const row: RawIsinRow = {
  snapshot_date: new Date('2026-01-31'),
  account: 'broker',
  account_type: 'PEA',
  isin: 'ASSET',
  name: 'Asset',
  values: { Equity: 100 },
}
const rows = [row, { ...row, account: 'savings', account_type: 'Savings' }]
const rawData: RawIsinData = {
  geo: rows,
  secteur: rows,
  currency: rows,
  classe: rows,
  loading: false,
}

describe('common diversification scope', () => {
  it('gives both analyses applicable positions and excludes savings from every allocation dimension', () => {
    const result = prepareDiversificationScope({
      positions: [investment, savings],
      rawData,
      accountFilters: new Set(['broker', 'savings']),
    })
    expect(result.applicablePositions).toEqual([investment])
    expect(result.hasSelectedValue).toBe(true)
    expect(result.hasApplicableValue).toBe(true)
    expect(result.hasCurrentData).toBe(true)
    for (const dimension of ['geo', 'secteur', 'currency', 'classe'] as const)
      expect(result.scopedRawData[dimension]).toEqual([row])
    expect(rawData.geo).toHaveLength(2)
  })

  it('distinguishes an inapplicable savings scope from missing investment data', () => {
    const result = prepareDiversificationScope({
      positions: [savings],
      rawData,
      accountFilters: new Set(['savings']),
    })
    expect(result.hasSelectedValue).toBe(true)
    expect(result.hasApplicableValue).toBe(false)
    expect(result.hasCurrentData).toBe(false)
  })
})
