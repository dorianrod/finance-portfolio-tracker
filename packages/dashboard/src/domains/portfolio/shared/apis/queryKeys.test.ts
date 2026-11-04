import { describe, expect, it } from 'vitest'

import { portfolioQueryKeys } from './queryKeys'

describe('portfolioQueryKeys', () => {
  it('creates stable resource keys with an explicit scope', () => {
    const dateFrom = new Date('2026-01-01')
    expect(
      portfolioQueryKeys.data('passive-income', ['pea'], dateFrom, undefined),
    ).toEqual([
      'portfolio',
      'data',
      'passive-income',
      ['pea'],
      dateFrom,
      undefined,
    ])
  })
})
