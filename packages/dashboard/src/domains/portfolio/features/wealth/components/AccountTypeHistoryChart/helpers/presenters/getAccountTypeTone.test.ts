import { describe, expect, it } from 'vitest'

import { getAccountTypeTone } from './getAccountTypeTone'

describe('getAccountTypeTone', () => {
  it.each(['constructor', '__proto__', 'toString'])(
    'ignores inherited palette entries for %s',
    (category) => {
      expect(getAccountTypeTone('account', 0, { account: category })).toBe(
        'series9',
      )
    },
  )
  it('preserves known categories and cycles the fallback palette', () => {
    expect(getAccountTypeTone('account', 0, { account: 'brokerage' })).toBe(
      'series1',
    )
    expect(getAccountTypeTone('constructor', 5, {})).toBe('series10')
  })
})
