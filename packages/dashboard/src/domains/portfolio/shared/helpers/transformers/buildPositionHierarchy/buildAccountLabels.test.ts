import { describe, expect, it } from 'vitest'

import { buildAccountLabels } from './buildAccountLabels'

describe('buildAccountLabels arbitrary account IDs', () => {
  it('preserves a source label for __proto__ as an own entry', () => {
    const result = buildAccountLabels([
      { account: '__proto__', label: 'Savings account' },
    ])
    expect(Object.hasOwn(result, '__proto__')).toBe(true)
    expect(result['__proto__']).toBe('Savings account')
  })
})

describe('buildAccountLabels', () => {
  it('maps account -> label, skipping rows missing either field', () => {
    expect(
      buildAccountLabels([
        { account: 'acc1', label: 'Compte 1' },
        { account: '', label: 'ignored' },
        { account: 'acc2', label: '' },
      ]),
    ).toEqual({ acc1: 'Compte 1' })
  })
})
