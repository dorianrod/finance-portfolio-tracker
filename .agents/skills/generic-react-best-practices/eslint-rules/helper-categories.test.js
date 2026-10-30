import { describe, expect, it } from 'vitest'

import { helperCategory, helperRole, moduleRoles } from './helper-categories.js'

describe('helper ownership and contracts', () => {
  it.each([
    [
      'src/domains/orders/helpers/transformers/selectOrders.ts',
      'transformers',
      'data',
    ],
    [
      '@/domains/orders/helpers/formatters/useFormatOrder.ts',
      'formatters',
      'presentation',
    ],
    [
      'C:\\app\\src\\shared\\helpers\\presenters\\getTone.ts',
      'presenters',
      'presentation',
    ],
    ['./helpers/presenters/getTone', 'presenters', 'presentation'],
    [
      'src/domains/helpers/features/helpers/helpers/transformers/select.ts',
      'transformers',
      'data',
    ],
    ['src/domains/orders/helpers/mappers/select.ts', 'mappers', null],
    ['src/domains/helpers/types/value.ts', null, null],
    ['@/domains/src/features/helpers/types/value.ts', null, null],
    ['src/domains/presenters/helpers/types/value.ts', 'types', null],
    ['src/domains/orders/mocks/helpers/transformers/value.ts', null, null],
  ])(
    'resolves %s without mistaking business names for roles',
    (path, category, role) => {
      expect(helperCategory(path)).toBe(category)
      expect(helperRole(path)).toBe(role)
    },
  )

  it('preserves an API-named domain while recognizing actual API roles', () => {
    expect(moduleRoles('@/domains/apis/types/value')).toBe('types/value')
    expect(moduleRoles('@/domains/orders/apis/schemas/order')).toBe(
      'apis/schemas/order',
    )
  })
})
