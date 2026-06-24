import { describe, it, expect } from 'vitest'
import { accountLabel, toggle, presetDateFrom } from './filterBar.logic'

describe('accountLabel', () => {
  it('uses the provided label when one exists for the account', () => {
    expect(accountLabel('acc1', { acc1: 'Compte Bourse' })).toBe('Compte Bourse')
  })

  it('falls back to title-casing the account key when no label exists', () => {
    expect(accountLabel('my_savings_account', {})).toBe('My Savings Account')
  })
})

describe('toggle', () => {
  it('adds a value not yet in the set, without mutating the original', () => {
    const original = new Set(['a'])
    const next = toggle(original, 'b')
    expect(next).toEqual(new Set(['a', 'b']))
    expect(original).toEqual(new Set(['a']))
  })

  it('removes a value already in the set', () => {
    expect(toggle(new Set(['a', 'b']), 'a')).toEqual(new Set(['b']))
  })
})

describe('presetDateFrom', () => {
  it('returns the first day of the current month for the 0-month preset', () => {
    const now = new Date()
    const expected = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
    expect(presetDateFrom(0)).toBe(expected)
  })

  it('subtracts the given number of months from today otherwise', () => {
    const now = new Date()
    const d = new Date(now)
    d.setMonth(d.getMonth() - 6)
    expect(presetDateFrom(6)).toBe(d.toISOString().slice(0, 10))
  })
})
