import { describe, expect, it } from 'vitest'

import { ALL_ACCOUNT_CATEGORIES } from '@/domains/portfolio/shared/types/accountCategory.type'

import { ACCOUNT_CATEGORY_SCHEMA } from './accountCategorySchema'

describe('account category schema', () => {
  it.each(ALL_ACCOUNT_CATEGORIES)('validates category %s', async (category) => {
    await expect(ACCOUNT_CATEGORY_SCHEMA.validate(category)).resolves.toBe(
      category,
    )
  })

  it('normalizes the category before business rules consume it', async () => {
    await expect(ACCOUNT_CATEGORY_SCHEMA.validate('  SAVINGS  ')).resolves.toBe(
      'savings',
    )
  })

  it.each([null, undefined, '', '  '])(
    'keeps an absent category %s explicitly unknown',
    async (category) => {
      await expect(
        ACCOUNT_CATEGORY_SCHEMA.validate(category),
      ).resolves.toBeNull()
    },
  )

  it.each(['brokerge', 'investment', 42, {}, []])(
    'rejects an invalid behavior category %s',
    async (category) => {
      await expect(ACCOUNT_CATEGORY_SCHEMA.validate(category)).rejects.toThrow()
    },
  )
})
