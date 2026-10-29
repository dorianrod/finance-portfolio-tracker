import { describe, expect, it } from 'vitest'

import { getAccountTypeTone } from './getAccountTypeTone'

describe('account type tones', () => {
  it.each<{account: string; index: number; categories: Record<string, string>; expected: string}>([
    { account: 'PEA', index: 0, categories: { PEA: 'brokerage' }, expected: 'series1' },
    { account: 'Livret', index: 0, categories: { Livret: 'savings' }, expected: 'series6' },
    { account: 'Unknown', index: 0, categories: {}, expected: 'series9' },
    { account: 'Unknown', index: 1, categories: {}, expected: 'series10' },
    { account: 'Unknown', index: 4, categories: {}, expected: 'series9' },
  ])('resolves $account at $index', ({account, index, categories, expected}) => {
    expect(getAccountTypeTone(account, index, categories)).toBe(expected)
  })
})
