import { describe, expect, it } from 'vitest'

import { portfolioQueryKeys } from './queryKeys'

describe('portfolioQueryKeys', () => {
  it('creates stable resource keys with an explicit scope', () => {
    expect(
      portfolioQueryKeys.data('passive-income', 'pea', '2026-01-01'),
    ).toEqual(['portfolio', 'data', 'passive-income', 'pea', '2026-01-01'])
  })
})
