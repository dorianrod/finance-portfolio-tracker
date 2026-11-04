import { describe, expect, it } from 'vitest'

import { makePosition } from '@/domains/portfolio/shared/mocks/position.mock'
import { rawData as makeRawData } from '@/domains/portfolio/shared/mocks/rawIsinData.mock'
import { isinRow as fixtureRawIsinRow } from '@/domains/portfolio/shared/mocks/rawIsinRow.mock'
import type { RawIsinRow } from '@/domains/portfolio/shared/types/rawIsinRow.type'

import { prepareAllocationScope } from './prepareAllocationScope'

const investment = makePosition({ account: 'broker', total_value: 100 })
const savings = makePosition({
  account: 'savings',
  account_type: 'Savings',
  account_category: 'savings',
  total_value: 200,
})
const row: RawIsinRow = fixtureRawIsinRow({
  snapshot_date: new Date('2026-01-31'),
  account: 'broker',
  account_type: 'PEA',
  isin: 'ASSET',
  name: 'Asset',
  values: { Equity: 100 },
})
const rows = [row, { ...row, account: 'savings', account_type: 'Savings' }]
const rawData = makeRawData({
  geo: rows,
  secteur: rows,
  currency: rows,
  classe: rows,
})

describe('allocation scope', () => {
  it('excludes savings from every allocation dimension', () => {
    const result = prepareAllocationScope({
      positions: [investment, savings],
      rawData,
      accountFilters: new Set(['broker', 'savings']),
    })
    expect(result.hasSelectedValue).toBe(true)
    expect(result.hasApplicableValue).toBe(true)
    expect(result.hasCurrentData).toBe(true)
    expect(result.scopedRawData).toMatchObject({
      geo: [row],
      secteur: [row],
      currency: [row],
      classe: [row],
    })
    expect(rawData.geo).toHaveLength(2)
  })

  it('distinguishes an inapplicable savings scope from missing investment data', () => {
    const result = prepareAllocationScope({
      positions: [savings],
      rawData,
      accountFilters: new Set(['savings']),
    })
    expect(result.hasSelectedValue).toBe(true)
    expect(result.hasApplicableValue).toBe(false)
    expect(result.hasCurrentData).toBe(false)
  })
})
