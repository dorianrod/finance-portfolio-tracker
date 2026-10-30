import { describe, expect, it } from 'vitest'

import { getOwnValue } from './getOwnValue'

describe('getOwnValue', () => {
  it.each(['constructor', '__proto__', 'toString', 'missing'])(
    'ignores an absent or inherited key %s',
    (key) => {
      expect(getOwnValue({ present: 10 }, key)).toBeUndefined()
    },
  )

  it.each(['constructor', '__proto__', 'toString', 'present'])(
    'preserves an own source key %s',
    (key) => {
      expect(getOwnValue(Object.fromEntries([[key, 10]]), key)).toBe(10)
    },
  )

  it.each([null, undefined])('accepts an absent dictionary %s', (values) => {
    expect(getOwnValue(values, 'missing')).toBeUndefined()
  })

  it('preserves zero', () => {
    expect(getOwnValue({ value: 0 }, 'value')).toBe(0)
  })
})
