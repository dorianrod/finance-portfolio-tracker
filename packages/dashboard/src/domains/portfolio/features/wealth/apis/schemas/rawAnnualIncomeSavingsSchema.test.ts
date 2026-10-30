import { describe, expect, it } from 'vitest'

import { RAW_ANNUAL_INCOME_SAVINGS_SCHEMA } from './rawAnnualIncomeSavingsSchema'

describe('annual income year validation', () => {
  it.each([
    ['2025.9', 2025],
    ['2026', 2026],
    [2024, 2024],
    [-1.9, -1],
    [2_147_483_648.5, 2_147_483_648],
  ])('normalizes %s before domain mapping', (year, expected) => {
    expect(
      RAW_ANNUAL_INCOME_SAVINGS_SCHEMA.validateSyncAt('year', { year }),
    ).toBe(expected)
  })

  it.each([
    'invalid',
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  ])('rejects invalid source year %s', (year) => {
    expect(() => {
      RAW_ANNUAL_INCOME_SAVINGS_SCHEMA.validateSyncAt('year', { year })
    }).toThrow()
  })
})
