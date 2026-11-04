import { describe, expect, it } from 'vitest'

import { makeIssuerHolding } from '@/domains/portfolio/features/holdings/features/fund-look-through/mocks/issuerHolding.mock'

import { createCanonicalIssuerResolver } from './createCanonicalIssuerResolver'

describe('createCanonicalIssuerResolver', () => {
  it('does not canonicalize a prefix that is absent from the input identifiers', () => {
    const resolve = createCanonicalIssuerResolver([
      makeIssuerHolding({
        issuerId: 'abcdefghijklxx',
        issuerName: 'Long name',
      }),
    ])
    expect(resolve('abcdefghijkl')).toEqual({
      id: 'abcdefghijkl',
      name: 'abcdefghijkl',
    })
  })

  it('merges only strong prefixes and chooses the longest identifier', () => {
    const resolve = createCanonicalIssuerResolver([
      makeIssuerHolding({ issuerId: 'abcdefghijkl', issuerName: 'Truncated' }),
      makeIssuerHolding({ issuerId: 'abcdefghijklx', issuerName: 'Long' }),
      makeIssuerHolding({ issuerId: 'abcdefghijklxx', issuerName: 'Longest' }),
      makeIssuerHolding({
        issuerId: 'abcdefghijklz',
        issuerName: 'Other branch',
      }),
    ])
    expect(resolve('abcdefghijkl')).toEqual({
      id: 'abcdefghijklxx',
      name: 'Longest',
    })
    expect(resolve('abcdefghijklz')).toEqual({
      id: 'abcdefghijklz',
      name: 'Other branch',
    })
  })

  it.each([
    ['abcdefghijklx', 'abcdefghijkly'],
    ['abcdefghijkly', 'abcdefghijklx'],
  ])(
    'retains input order for equal longest matches: %s, %s',
    (first, second) => {
      const resolve = createCanonicalIssuerResolver([
        makeIssuerHolding({ issuerId: first, issuerName: 'First' }),
        makeIssuerHolding({ issuerId: second, issuerName: 'Second' }),
        makeIssuerHolding({ issuerId: 'abcdefghijkl' }),
      ])
      expect(resolve('abcdefghijkl')).toEqual({ id: first, name: 'First' })
    },
  )

  it.each(['short', '__proto__', 'constructor', 'US0000000001'])(
    'keeps short and authoritative identifiers separate: %s',
    (id) => {
      const resolve = createCanonicalIssuerResolver([
        makeIssuerHolding({ issuerId: id, issuerName: 'Original' }),
        makeIssuerHolding({
          issuerId: `${id}extended`,
          issuerName: 'Extended',
        }),
      ])
      expect(resolve(id)).toEqual({ id, name: 'Original' })
    },
  )

  it('uses the last supplied name for duplicates and falls back for unknown identifiers', () => {
    const resolve = createCanonicalIssuerResolver([
      makeIssuerHolding({ issuerId: 'same', issuerName: 'Old' }),
      makeIssuerHolding({ issuerId: 'same', issuerName: 'New' }),
      makeIssuerHolding({ issuerId: '', holdingId: 'SECURITY' }),
    ])
    expect(resolve('same')).toEqual({ id: 'same', name: 'New' })
    expect(resolve('SECURITY')).toEqual({ id: 'SECURITY', name: 'SECURITY' })
    expect(createCanonicalIssuerResolver([])('missing')).toEqual({
      id: 'missing',
      name: 'missing',
    })
  })
})
