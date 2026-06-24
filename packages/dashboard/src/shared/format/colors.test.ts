import { describe, it, expect } from 'vitest'
import { catColor, typeColor } from './colors'

describe('catColor', () => {
  it('assigns the fixed "nc" and "autre"/"others (n)" categories their dedicated colors', () => {
    expect(catColor('nc')).toBe('#374151')
    expect(catColor('autre')).toBe('#6b7280')
    expect(catColor('Autre')).toBe('#6b7280')
    expect(catColor('others (3)')).toBe('#6b7280')
  })

  it('uses the known category palette for well-known geography/sector/class names', () => {
    expect(catColor('france')).toBe('#3b82f6')
    expect(catColor('actions')).toBe('#3b82f6')
    expect(catColor('tech')).toBe('#3b82f6')
  })

  it('deterministically hashes unknown category names to a stable palette color', () => {
    const a = catColor('some unknown category')
    const b = catColor('some unknown category')
    expect(a).toBe(b)
    expect(a).toMatch(/^#[0-9a-f]{6}$/)
  })
})

describe('typeColor', () => {
  it('colors an account type by its category when known', () => {
    expect(typeColor('PEA', 0, { PEA: 'brokerage' })).toBe('#3b82f6')
    expect(typeColor('Livret', 0, { Livret: 'savings' })).toBe('#06b6d4')
  })

  it('falls back to a rotating fallback palette by index when the category is unknown', () => {
    expect(typeColor('Unknown', 0, {})).toBe('#ec4899')
    expect(typeColor('Unknown', 1, {})).toBe('#14b8a6')
    expect(typeColor('Unknown', 4, {})).toBe('#ec4899') // wraps around (4 % 4 === 0)
  })
})
